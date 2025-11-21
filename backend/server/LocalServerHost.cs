using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace PhillyRTSToolkit;

public sealed class LocalServerHost : IAsyncDisposable
{
    private readonly Queue<ServerLogEvent> _logBuffer = new();
    private readonly object _logGate = new();
    private const int MaxLogEntries = 500;

    private WebApplication? _app;
    private CancellationTokenSource? _cts;
    private string _token = string.Empty;
    private LocalServerMetadata? _metadata;

    public event EventHandler<ServerLogEvent>? LogEmitted;

    public LocalServerMetadata? Metadata => _metadata;

    public async Task<LocalServerMetadata> StartAsync(DatabaseService databaseService, PayloadStorageService payloadStorage, CancellationToken cancellationToken = default)
    {
        if (_app is not null && _metadata is not null)
        {
            return _metadata;
        }

        var port = GetFreeTcpPort();
        _token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(24));
        _cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            ContentRootPath = AppContext.BaseDirectory,
            Args = Array.Empty<string>()
        });

        builder.WebHost.UseKestrel()
            .UseUrls($"http://127.0.0.1:{port}");

        builder.Logging.ClearProviders();
        builder.Logging.AddFilter(static (_, level) => level >= LogLevel.Information);

        builder.Services.AddSingleton(databaseService);
        builder.Services.AddSingleton(payloadStorage);
        builder.Services.AddRouting();
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
                policy.WithOrigins("https://appassets", "https://localhost", "http://localhost", "http://127.0.0.1")
                      .AllowAnyHeader()
                      .AllowAnyMethod());
        });

        var app = builder.Build();
        ConfigureMiddleware(app);
        MapEndpoints(app);

        await app.StartAsync(_cts.Token).ConfigureAwait(false);
        _app = app;

        var addresses = app.Urls;
        var baseUrl = addresses.FirstOrDefault() ?? $"http://127.0.0.1:{port}";
        _metadata = new LocalServerMetadata(baseUrl, port, _token, DateTimeOffset.UtcNow);
        AppendLog("server", LogLevel.Information, $"Local API server listening on {baseUrl}");
        return _metadata;
    }

    public async ValueTask DisposeAsync()
    {
        if (_app is null) return;
        try
        {
            await _app.StopAsync(TimeSpan.FromSeconds(2)).ConfigureAwait(false);
            AppendLog("server", LogLevel.Information, "Local API server stopped.");
        }
        catch (Exception ex)
        {
            AppendLog("server", LogLevel.Error, "Failed to stop API server", ex);
        }
        finally
        {
            await _app.DisposeAsync().ConfigureAwait(false);
            _cts?.Cancel();
            _app = null;
            _cts?.Dispose();
            _cts = null;
            _metadata = null;
        }
    }

    public IReadOnlyList<ServerLogEvent> SnapshotLogs()
    {
        lock (_logGate)
        {
            return _logBuffer.ToArray();
        }
    }

    private void ConfigureMiddleware(WebApplication app)
    {
        app.UseCors();
        app.Use(async (context, next) =>
        {
            if (!Authorize(context.Request))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Unauthorized").ConfigureAwait(false);
                return;
            }
            await next().ConfigureAwait(false);
        });

        app.Use(async (context, next) =>
        {
            var sw = Stopwatch.StartNew();
            try
            {
                await next().ConfigureAwait(false);
                sw.Stop();
                AppendLog("http", LogLevel.Information, $"{context.Request.Method} {context.Request.Path}", null, context.Response.StatusCode, sw.Elapsed.TotalMilliseconds);
            }
            catch (Exception ex)
            {
                sw.Stop();
                AppendLog("http", LogLevel.Error, $"{context.Request.Method} {context.Request.Path}", ex, StatusCodes.Status500InternalServerError, sw.Elapsed.TotalMilliseconds);
                throw;
            }
        });
    }

    private void MapEndpoints(WebApplication app)
    {
        app.MapGet("/api/health", () => Results.Json(new
        {
            status = "ok",
            startedAt = Metadata?.StartedAt,
            version = typeof(LocalServerHost).Assembly.GetName().Version?.ToString()
        }));

        app.MapGet("/api/logs", (int? limit, string? level) =>
        {
            IEnumerable<ServerLogEvent> logs = SnapshotLogs();
            if (!string.IsNullOrWhiteSpace(level))
            {
                logs = logs.Where(entry => string.Equals(entry.Level, level, StringComparison.OrdinalIgnoreCase));
            }

            if (limit is > 0)
            {
                logs = logs.TakeLast(limit.Value);
            }

            return Results.Json(new
            {
                entries = logs.ToArray()
            });
        });

        app.MapGet("/api/payload", async (PayloadStorageService storage) =>
        {
            var payload = await storage.LoadPayloadAsync().ConfigureAwait(false);
            return Results.Json(payload);
        });

        app.MapPost("/api/payload", async (PayloadStorageService storage, JsonElement payload) =>
        {
            await storage.PersistPayloadAsync(payload).ConfigureAwait(false);
            AppendLog("payload", LogLevel.Information, "Payload snapshot saved via /api/payload", null, StatusCodes.Status202Accepted);
            return Results.Accepted();
        });

        app.MapGet("/api/units", async (DatabaseService database) =>
        {
            var units = await database.GetUnitsAsync().ConfigureAwait(false);
            return Results.Json(new { units });
        });

        app.MapPost("/api/units", async (DatabaseService database, JsonElement payload) =>
        {
            if (!payload.TryGetProperty("unit", out var unitElement))
            {
                return Results.BadRequest(new { error = "Missing unit payload" });
            }
            await database.SaveUnitAsync(unitElement).ConfigureAwait(false);
            AppendLog("units", LogLevel.Information, "Unit saved via /api/units", null, StatusCodes.Status200OK);
            return Results.Ok(new { status = "saved" });
        });

        app.MapDelete("/api/units/{id:long}", async (DatabaseService database, PayloadStorageService storage, long id) =>
        {
            await database.DeleteUnitAsync(id).ConfigureAwait(false);
            await storage.RemoveUnitFromPayloadAsync(id).ConfigureAwait(false);
            AppendLog("units", LogLevel.Warning, $"Unit {id} deleted via /api/units", null, StatusCodes.Status200OK);
            return Results.Ok(new { status = "deleted" });
        });

        MapArrayEndpoint(app, "/api/formations", "formations", (db, element) => db.SaveFormationsAsync(element));
        MapArrayEndpoint(app, "/api/nations", "nations", (db, element) => db.SaveNationsAsync(element));
        MapArrayEndpoint(app, "/api/weapons", "weapons", (db, element) => db.SaveWeaponsAsync(element));
        MapArrayEndpoint(app, "/api/ammo", "ammo", (db, element) => db.SaveAmmoTemplatesAsync(element));
        MapArrayEndpoint(app, "/api/fire-modes", "fireModes", (db, element) => db.SaveFireModeTemplatesAsync(element));

        app.MapGet("/api/weapon-tags", async (DatabaseService db, PayloadStorageService storage) =>
        {
            var tags = await db.GetWeaponTagsAsync().ConfigureAwait(false);
            if (tags.Count == 0)
            {
                tags = await storage.LoadWeaponTagsFallbackAsync().ConfigureAwait(false);
            }
            return Results.Json(tags);
        });

        app.MapPost("/api/weapon-tags", async (DatabaseService db, PayloadStorageService storage, JsonElement payload) =>
        {
            await db.SaveWeaponTagsAsync(payload).ConfigureAwait(false);
            await storage.UpdatePayloadSectionAsync("weaponTags", payload).ConfigureAwait(false);
            AppendLog("weaponTags", LogLevel.Information, "Weapon tags updated", null, StatusCodes.Status200OK);
            return Results.Ok();
        });

        app.MapGet("/api/settings", async (PayloadStorageService storage) =>
        {
            var settings = await storage.LoadSettingsAsync().ConfigureAwait(false);
            return Results.Json(settings);
        });

        app.MapPost("/api/settings", async (PayloadStorageService storage, JsonElement payload) =>
        {
            await storage.UpdateSettingsAsync(payload).ConfigureAwait(false);
            AppendLog("settings", LogLevel.Information, "Settings updated via API", null, StatusCodes.Status200OK);
            return Results.Ok();
        });

        app.MapGet("/api/server-info", () => Results.Json(new
        {
            server = Metadata,
            database = new
            {
                path = GetDatabasePath()
            }
        }));

        app.MapGet("/api/diagnostics", async (DatabaseService database, PayloadStorageService storage) =>
        {
            var diagnostics = await DiagnosticsBuilder.BuildAsync(database, storage, SnapshotLogs().Count).ConfigureAwait(false);
            AppendLog("diagnostics", LogLevel.Information, "Diagnostics snapshot requested", null, StatusCodes.Status200OK);
            return Results.Json(diagnostics);
        });

        void MapArrayEndpoint(WebApplication application, string path, string key, Func<DatabaseService, JsonElement, Task> saveOperation)
        {
            application.MapGet(path, async (DatabaseService db, PayloadStorageService storage) =>
            {
                JsonArray payload;
                switch (key)
                {
                    case "formations":
                        payload = await db.GetFormationsAsync().ConfigureAwait(false);
                        if (payload.Count == 0) payload = await storage.LoadDataArrayAsync(key).ConfigureAwait(false);
                        break;
                    case "nations":
                        payload = await db.GetNationsAsync().ConfigureAwait(false);
                        if (payload.Count == 0) payload = await storage.LoadDataArrayAsync(key).ConfigureAwait(false);
                        break;
                    case "weapons":
                        payload = await db.GetWeaponsAsync().ConfigureAwait(false);
                        if (payload.Count == 0) payload = await storage.LoadWeaponsFallbackAsync().ConfigureAwait(false);
                        break;
                    case "ammo":
                        payload = await db.GetAmmoTemplatesAsync().ConfigureAwait(false);
                        if (payload.Count == 0) payload = await storage.LoadAmmoFallbackAsync().ConfigureAwait(false);
                        break;
                    case "fireModes":
                        payload = await db.GetFireModeTemplatesAsync().ConfigureAwait(false);
                        if (payload.Count == 0) payload = await storage.LoadFireModeFallbackAsync().ConfigureAwait(false);
                        break;
                    default:
                        payload = await storage.LoadDataArrayAsync(key).ConfigureAwait(false);
                        break;
                }

                return Results.Json(new Dictionary<string, JsonArray>
                {
                    [key] = payload
                });
            });

            application.MapPost(path, async (DatabaseService db, PayloadStorageService storage, JsonElement body) =>
            {
                if (!body.TryGetProperty(key, out var section))
                {
                    return Results.BadRequest(new { error = $"Missing {key} payload" });
                }

                await saveOperation(db, section).ConfigureAwait(false);

                if (key is "formations" or "nations")
                {
                    JsonArray canonical = key == "formations"
                        ? await db.GetFormationsAsync().ConfigureAwait(false)
                        : await db.GetNationsAsync().ConfigureAwait(false);

                    var canonicalElement = JsonSerializer.SerializeToElement(canonical);
                    await storage.UpdateDataSectionAsync(key, canonicalElement).ConfigureAwait(false);
                }
                else
                {
                    await storage.UpdatePayloadSectionAsync(key, section).ConfigureAwait(false);
                }

                AppendLog(key, LogLevel.Information, $"Persisted {key} ({ResolveElementCount(section)} items)", null, StatusCodes.Status200OK);

                return Results.Ok(new { status = "saved" });
            });
        }
    }

    private string? GetDatabasePath()
    {
        if (_metadata is null) return null;
        try
        {
            var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "database"));
            var candidate = Path.Combine(root, "rts.db");
            return File.Exists(candidate) ? candidate : null;
        }
        catch
        {
            return null;
        }
    }

    private bool Authorize(HttpRequest request)
    {
        if (request.Path.StartsWithSegments("/api/health", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(_token))
        {
            return true;
        }

        if (request.Headers.TryGetValue("X-Server-Token", out var header) && header == _token)
        {
            return true;
        }

        if (request.Headers.TryGetValue("Authorization", out var auth) && auth.ToString().Equals($"Bearer {_token}", StringComparison.Ordinal))
        {
            return true;
        }

        return false;
    }

    private void AppendLog(string category, LogLevel level, string message, Exception? exception = null, int? statusCode = null, double? durationMs = null)
    {
        var entry = new ServerLogEvent
        {
            Timestamp = DateTimeOffset.UtcNow,
            Category = category,
            Level = level.ToString(),
            Message = message,
            Exception = exception?.Message,
            StatusCode = statusCode,
            DurationMs = durationMs
        };

        lock (_logGate)
        {
            _logBuffer.Enqueue(entry);
            while (_logBuffer.Count > MaxLogEntries)
            {
                _logBuffer.Dequeue();
            }
        }

        LogEmitted?.Invoke(this, entry);
        var serilogLevel = level switch
        {
            LogLevel.Trace => Serilog.Events.LogEventLevel.Verbose,
            LogLevel.Debug => Serilog.Events.LogEventLevel.Debug,
            LogLevel.Warning => Serilog.Events.LogEventLevel.Warning,
            LogLevel.Error => Serilog.Events.LogEventLevel.Error,
            LogLevel.Critical => Serilog.Events.LogEventLevel.Fatal,
            _ => Serilog.Events.LogEventLevel.Information
        };

        Log.ForContext("Category", category)
            .ForContext("StatusCode", statusCode)
            .ForContext("DurationMs", durationMs)
            .Write(serilogLevel, exception, message);
    }

    private static int ResolveElementCount(JsonElement element)
    {
        return element.ValueKind == JsonValueKind.Array ? element.GetArrayLength() : 1;
    }

    private static int GetFreeTcpPort()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        return port;
    }
}
