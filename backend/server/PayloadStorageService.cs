using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;

namespace PhillyRTSToolkit;

/// <summary>
/// Centralizes payload hydration and persistence so both the WinForms host
/// and the embedded HTTP server mutate the exact same data pipeline.
/// </summary>
public sealed class PayloadStorageService
{
    private readonly DatabaseService _databaseService;
    private readonly string _jsonRoot;
    private readonly SemaphoreSlim _gate = new(1, 1);

    public PayloadStorageService(DatabaseService databaseService, string jsonRoot)
    {
        _databaseService = databaseService ?? throw new ArgumentNullException(nameof(databaseService));
        _jsonRoot = jsonRoot ?? throw new ArgumentNullException(nameof(jsonRoot));
    }

    public string JsonRoot => _jsonRoot;

    public async Task<JsonNode> LoadPayloadAsync()
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            return await LoadPayloadInternalAsync().ConfigureAwait(false);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<JsonArray> LoadDataArrayAsync(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) return new JsonArray();
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            if (payloadNode["data"] is JsonObject data && data[key] is JsonArray array)
            {
                return (JsonArray)array.DeepClone();
            }
            return new JsonArray();
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<JsonObject> LoadSettingsAsync()
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            if (payloadNode["settings"] is JsonObject settings)
            {
                return (JsonObject)settings.DeepClone();
            }

            return new JsonObject();
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<JsonArray> LoadWeaponsFallbackAsync()
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeWeaponCollection(payloadNode?["weapons"]);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<JsonArray> LoadAmmoFallbackAsync()
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeAmmoCollection(payloadNode?["ammo"]);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<JsonArray> LoadFireModeFallbackAsync()
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeFireModeCollection(payloadNode?["fireModes"]);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<JsonObject> LoadWeaponTagsFallbackAsync()
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeWeaponTags(payloadNode?["weaponTags"]);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task PersistPayloadAsync(JsonElement payload)
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = JsonNode.Parse(payload.GetRawText()) ?? new JsonObject();
            await PersistPayloadCoreAsync(payloadNode).ConfigureAwait(false);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task UpdateDataSectionAsync(string key, JsonElement value)
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            if (payloadNode["data"] is not JsonObject data)
            {
                data = new JsonObject();
                payloadNode["data"] = data;
            }

            data[key] = JsonNode.Parse(value.GetRawText()) ?? new JsonArray();
            await PersistPayloadNodeAsync(payloadNode).ConfigureAwait(false);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task UpdateSettingsAsync(JsonElement value)
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            payloadNode["settings"] = JsonNode.Parse(value.GetRawText()) ?? new JsonObject();
            await PersistPayloadNodeAsync(payloadNode).ConfigureAwait(false);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task UpdatePayloadSectionAsync(string key, JsonElement value)
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            payloadNode[key] = JsonNode.Parse(value.GetRawText()) ?? new JsonArray();
            await PersistPayloadNodeAsync(payloadNode).ConfigureAwait(false);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task RemoveUnitFromPayloadAsync(long unitId)
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var payloadNode = await LoadPayloadInternalAsync().ConfigureAwait(false);
            if (payloadNode["data"] is JsonObject data && data["units"] is JsonArray units)
            {
                var filtered = new JsonArray();
                foreach (var node in units)
                {
                    if (node is JsonObject unitObj)
                    {
                        if (unitObj["id"] != null && long.TryParse(unitObj["id"]!.ToString(), out var parsed) && parsed == unitId)
                        {
                            continue;
                        }
                    }
                    filtered.Add(node!.DeepClone());
                }
                data["units"] = filtered;
                await PersistPayloadNodeAsync(payloadNode).ConfigureAwait(false);
            }
        }
        finally
        {
            _gate.Release();
        }
    }

    public Task<IReadOnlyList<FileDiagnostic>> DescribeBackupFilesAsync()
    {
        var files = new[]
        {
            "state.json",
            "units.json",
            "formations.json",
            "nations.json",
            "weapons.json",
            "ammo.json",
            "fireModes.json",
            "weaponTags.json",
            "settings.json"
        };

        var snapshots = new List<FileDiagnostic>(files.Length);
        foreach (var file in files)
        {
            var path = Path.Combine(_jsonRoot, file);
            snapshots.Add(CreateFileDiagnostic(file, path));
        }

        return Task.FromResult<IReadOnlyList<FileDiagnostic>>(snapshots);
    }

    private async Task<JsonNode> LoadPayloadInternalAsync()
    {
        JsonNode? payloadNode = null;
        var storedPayload = await _databaseService.LoadAppStateAsync().ConfigureAwait(false);
        if (!string.IsNullOrWhiteSpace(storedPayload))
        {
            try
            {
                payloadNode = JsonNode.Parse(storedPayload);
            }
            catch
            {
                payloadNode = null;
            }
        }

        payloadNode ??= BuildFallbackNode();
        var structured = await _databaseService.LoadStructuredDataAsync().ConfigureAwait(false);
        MergeStructuredData(payloadNode, structured);
        return payloadNode;
    }

    private async Task PersistPayloadNodeAsync(JsonNode payloadNode)
    {
        payloadNode ??= new JsonObject();
        await PersistPayloadCoreAsync(payloadNode).ConfigureAwait(false);
    }

    private async Task PersistPayloadCoreAsync(JsonNode payloadNode)
    {
        await _databaseService.EnsureStableIdentifiersAsync(payloadNode).ConfigureAwait(false);
        var canonicalJson = payloadNode.ToJsonString();
        using var canonicalDocument = JsonDocument.Parse(canonicalJson);
        var payload = canonicalDocument.RootElement;

        await _databaseService.PersistPayloadGraphAsync(payload).ConfigureAwait(false);
        Directory.CreateDirectory(_jsonRoot);
        if (payload.TryGetProperty("data", out var data))
        {
            await WriteJsonAsync("state.json", data.GetRawText()).ConfigureAwait(false);
            if (data.TryGetProperty("units", out var units))
                await WriteJsonAsync("units.json", units.GetRawText()).ConfigureAwait(false);
            if (data.TryGetProperty("formations", out var formations))
                await WriteJsonAsync("formations.json", formations.GetRawText()).ConfigureAwait(false);
            if (data.TryGetProperty("nations", out var nations))
                await WriteJsonAsync("nations.json", nations.GetRawText()).ConfigureAwait(false);
        }

        if (payload.TryGetProperty("weapons", out var weapons))
            await WriteJsonAsync("weapons.json", weapons.GetRawText()).ConfigureAwait(false);
        if (payload.TryGetProperty("ammo", out var ammo))
            await WriteJsonAsync("ammo.json", ammo.GetRawText()).ConfigureAwait(false);
        if (payload.TryGetProperty("fireModes", out var fireModes))
            await WriteJsonAsync("fireModes.json", fireModes.GetRawText()).ConfigureAwait(false);
        if (payload.TryGetProperty("weaponTags", out var tags))
            await WriteJsonAsync("weaponTags.json", tags.GetRawText()).ConfigureAwait(false);
        if (payload.TryGetProperty("settings", out var settings))
            await WriteJsonAsync("settings.json", settings.GetRawText()).ConfigureAwait(false);
    }

    private async Task WriteJsonAsync(string fileName, string json)
    {
        var targetPath = Path.Combine(_jsonRoot, fileName);
        var tempPath = Path.Combine(_jsonRoot, $".{fileName}.{Guid.NewGuid():N}.tmp");
        await File.WriteAllTextAsync(tempPath, json).ConfigureAwait(false);
        File.Move(tempPath, targetPath, true);
    }

    private JsonNode BuildFallbackNode()
    {
        var merged = new JsonObject();
        var data = TryRead("state.json");
        if (data.HasValue)
        {
            try
            {
                merged = JsonNode.Parse(data.Value.GetRawText()) as JsonObject ?? new JsonObject();
            }
            catch
            {
                merged = new JsonObject();
            }
        }

        merged ??= new JsonObject();
        if (!merged.ContainsKey("units"))
            merged["units"] = TryParseArray("units.json");
        if (!merged.ContainsKey("formations"))
            merged["formations"] = TryParseArray("formations.json");
        if (!merged.ContainsKey("nations"))
            merged["nations"] = TryParseArray("nations.json");

        var payloadNode = new JsonObject
        {
            ["data"] = JsonNode.Parse(merged.ToJsonString()) ?? new JsonObject()
        };

        payloadNode["weapons"] = TryParseArray("weapons.json");
        payloadNode["ammo"] = TryParseArray("ammo.json");
        payloadNode["fireModes"] = TryParseArray("fireModes.json");
        payloadNode["weaponTags"] = TryParseObject("weaponTags.json");
        payloadNode["settings"] = TryParseObject("settings.json");
        return payloadNode;
    }

    private JsonArray TryParseArray(string fileName)
    {
        var node = TryRead(fileName);
        if (node.HasValue)
        {
            try
            {
                if (JsonNode.Parse(node.Value.GetRawText()) is JsonArray array)
                {
                    return array;
                }
            }
            catch
            {
                // ignored
            }
        }
        return new JsonArray();
    }

    private JsonObject TryParseObject(string fileName)
    {
        var node = TryRead(fileName);
        if (node.HasValue)
        {
            try
            {
                if (JsonNode.Parse(node.Value.GetRawText()) is JsonObject obj)
                {
                    return obj;
                }
            }
            catch
            {
                // ignored
            }
        }
        return new JsonObject();
    }

    private JsonElement? TryRead(string fileName)
    {
        var path = Path.Combine(_jsonRoot, fileName);
        if (!File.Exists(path)) return null;
        try
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(path));
            return doc.RootElement.Clone();
        }
        catch
        {
            return null;
        }
    }

    private static void MergeStructuredData(JsonNode destination, JsonNode? structured)
    {
        if (destination is not JsonObject dest || structured is not JsonObject structuredObj) return;

        foreach (var kvp in structuredObj)
        {
            if (kvp.Key == "data" && kvp.Value is JsonObject structuredData)
            {
                var destData = dest["data"] as JsonObject ?? new JsonObject();
                dest["data"] = destData;
                foreach (var dataPair in structuredData)
                {
                    destData[dataPair.Key] = dataPair.Value?.DeepClone();
                }
                continue;
            }

            dest[kvp.Key] = kvp.Value?.DeepClone();
        }
    }

    private static FileDiagnostic CreateFileDiagnostic(string fileName, string path)
    {
        try
        {
            var info = new FileInfo(path);
            if (!info.Exists)
            {
                return new FileDiagnostic
                {
                    Name = fileName,
                    Path = path,
                    Exists = false
                };
            }

            return new FileDiagnostic
            {
                Name = fileName,
                Path = path,
                Exists = true,
                SizeBytes = info.Length,
                LastWriteTimeUtc = info.LastWriteTimeUtc
            };
        }
        catch
        {
            return new FileDiagnostic
            {
                Name = fileName,
                Path = path,
                Exists = false
            };
        }
    }
}
