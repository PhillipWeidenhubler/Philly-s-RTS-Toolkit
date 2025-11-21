using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using PhillyRTSToolkit.Messaging;
using Serilog;
using Xunit;

namespace PhillyRTSToolkit.Tests;

public sealed class WebMessageDispatcherTests : IAsyncLifetime, IDisposable
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"rts_dispatch_{Guid.NewGuid():N}.db");
    private readonly string _jsonRoot = Path.Combine(Path.GetTempPath(), $"rts_dispatch_json_{Guid.NewGuid():N}");
    private readonly DatabaseService _database;
    private readonly PayloadStorageService _payloadStorage;
    private readonly WebMessageDispatcher _dispatcher;
    private readonly JsonArray _frontendSamples;
    private readonly HashSet<string> _hostMessageTypes;

    public WebMessageDispatcherTests()
    {
        Directory.CreateDirectory(_jsonRoot);
        var schemaPath = Path.Combine(TestPathHelper.SolutionRoot, "database", "schema.sql");
        _database = new DatabaseService(_dbPath, schemaPath);
        _payloadStorage = new PayloadStorageService(_database, _jsonRoot);
        _dispatcher = new WebMessageDispatcher(
            _database,
            _payloadStorage,
            () => new JsonObject { ["version"] = "test" },
            () => new JsonObject { ["entries"] = new JsonArray() },
            Log.ForContext<WebMessageDispatcherTests>());

        var contractsPath = Path.Combine(TestPathHelper.SolutionRoot, "shared", "contracts", "webview-envelope-samples.json");
        if (!File.Exists(contractsPath))
        {
            throw new FileNotFoundException("Missing shared envelope sample file.", contractsPath);
        }

        var document = JsonNode.Parse(File.ReadAllText(contractsPath)) ?? new JsonObject();
        _frontendSamples = document["frontendToHost"] as JsonArray ?? new JsonArray();
        _hostMessageTypes = document["hostToFrontend"] is JsonArray hostMessages
            ? hostMessages
                .Select(node => node?["type"]?.GetValue<string>())
                .Where(type => !string.IsNullOrWhiteSpace(type))
                .Select(type => type!)
                .ToHashSet(StringComparer.Ordinal)
            : new HashSet<string>(StringComparer.Ordinal);
    }

    public async Task InitializeAsync()
    {
        await _database.InitializeAsync();
        await SeedBaselinePayloadAsync();
    }

    public Task DisposeAsync()
    {
        SqliteCleanup();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task FrontendSamples_ReplayWithoutRegression()
    {
        Assert.NotEmpty(_frontendSamples);
        Assert.NotEmpty(_hostMessageTypes);

        foreach (var sampleNode in _frontendSamples)
        {
            if (sampleNode is null)
            {
                continue;
            }

            using var doc = JsonDocument.Parse(sampleNode.ToJsonString());
            var responses = await _dispatcher.HandleAsync(doc.RootElement);
            foreach (var envelope in responses)
            {
                Assert.Contains(envelope.Type, _hostMessageTypes);
                Assert.NotNull(envelope.Payload);
            }
        }
    }

    private async Task SeedBaselinePayloadAsync()
    {
        var payload = new JsonObject
        {
            ["data"] = new JsonObject
            {
                ["units"] = new JsonArray(),
                ["formations"] = new JsonArray(),
                ["nations"] = new JsonArray()
            },
            ["weapons"] = new JsonArray(),
            ["ammo"] = new JsonArray(),
            ["fireModes"] = new JsonArray(),
            ["weaponTags"] = new JsonObject(),
            ["settings"] = new JsonObject()
        };

        using var doc = JsonDocument.Parse(payload.ToJsonString());
        await _payloadStorage.PersistPayloadAsync(doc.RootElement);
    }

    private void SqliteCleanup()
    {
        try
        {
            if (File.Exists(_dbPath))
            {
                Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
                File.Delete(_dbPath);
            }
        }
        catch
        {
            // ignored
        }

        try
        {
            if (Directory.Exists(_jsonRoot))
            {
                Directory.Delete(_jsonRoot, true);
            }
        }
        catch
        {
            // ignored
        }
    }

    public void Dispose()
    {
        SqliteCleanup();
    }
}
