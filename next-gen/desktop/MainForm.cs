using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;

namespace PhillyRTSToolkit
{
    public partial class MainForm : Form
    {
        private readonly string dbRoot;
        private readonly string distIndexPath;
        private readonly DatabaseService database;

        public MainForm()
        {
            InitializeComponent();
            var projectRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", ".."));
            var nextGenRoot = Path.GetFullPath(Path.Combine(projectRoot, ".."));
            dbRoot = Path.Combine(projectRoot, "database");
            var schemaPath = Path.Combine(dbRoot, "schema.sql");
            var dbPath = Path.Combine(dbRoot, "rts.db");
            database = new DatabaseService(dbPath, schemaPath);
            distIndexPath = Path.Combine(nextGenRoot, "frontend", "app", "dist", "index.html");
            database.InitializeAsync().GetAwaiter().GetResult();
            InitWebView();
        }

        private async void InitWebView()
        {
            await webView.EnsureCoreWebView2Async(null);
            webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;
            Directory.CreateDirectory(dbRoot);
            try
            {
                var chosen = ResolveFrontendEntry();
                webView.Source = chosen;
            }
            catch (FileNotFoundException ex)
            {
                MessageBox.Show(ex.Message, "Error");
                return;
            }
            webView.CoreWebView2.DOMContentLoaded += async (_, __) => await SendLoadAsync();
            KeyPreview = true;
            KeyDown += (_, e) =>
            {
                if (e.KeyCode == Keys.F11) ToggleFullscreen();
            };
            webView.PreviewKeyDown += (_, e) =>
            {
                if (e.KeyCode == Keys.F11)
                {
                    e.IsInputKey = true;
                    ToggleFullscreen();
                }
            };
        }

        private void ToggleFullscreen()
        {
            if (FormBorderStyle == FormBorderStyle.None)
            {
                FormBorderStyle = FormBorderStyle.Sizable;
                WindowState = FormWindowState.Normal;
            }
            else
            {
                FormBorderStyle = FormBorderStyle.None;
                WindowState = FormWindowState.Maximized;
            }
        }

        private Uri ResolveFrontendEntry()
        {
            if (File.Exists(distIndexPath))
            {
                MapVirtualHost("appassets", Path.GetDirectoryName(distIndexPath)!);
                return new Uri("https://appassets/index.html");
            }
            throw new FileNotFoundException("Missing next-gen frontend build. Run 'npm run build' inside next-gen/frontend/app to generate dist/index.html.");
        }

        private void MapVirtualHost(string hostName, string folder)
        {
            webView.CoreWebView2!.SetVirtualHostNameToFolderMapping(hostName, folder, CoreWebView2HostResourceAccessKind.Allow);
        }

        private async Task SendLoadAsync()
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            using var doc = JsonDocument.Parse(payloadNode.ToJsonString());
            var payloadElement = doc.RootElement.Clone();
            var message = JsonSerializer.Serialize(new { type = "load", payload = payloadElement });
            webView.CoreWebView2!.PostWebMessageAsJson(message);
        }

        private async void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                var msg = JsonDocument.Parse(e.WebMessageAsJson).RootElement;
                if (!msg.TryGetProperty("type", out var tProp)) return;
                var type = tProp.GetString();
                if (type == "save")
                {
                    if (msg.TryGetProperty("payload", out var payload))
                    {
                        await PersistPayloadAsync(payload).ConfigureAwait(false);
                    }
                }
                else if (type == "request-load")
                {
                    await SendLoadAsync().ConfigureAwait(false);
                }
                else if (type == "host-info-request")
                {
                    SendHostInfo();
                }
                else if (type == "get-units")
                {
                    await SendUnitsAsync().ConfigureAwait(false);
                }
                else if (type == "save-unit")
                {
                    if (msg.TryGetProperty("payload", out var payload) && payload.TryGetProperty("unit", out var unitElement))
                    {
                        await database.SaveUnitAsync(unitElement).ConfigureAwait(false);
                        await SendUnitsAsync().ConfigureAwait(false);
                    }
                }
                else if (type == "delete-unit")
                {
                    if (msg.TryGetProperty("payload", out var payload) && payload.TryGetProperty("id", out var idElement) && idElement.TryGetInt64(out var id))
                    {
                        await database.DeleteUnitAsync(id).ConfigureAwait(false);
                        await RemoveUnitFromPayloadAsync(id).ConfigureAwait(false);
                        await SendUnitsAsync().ConfigureAwait(false);
                    }
                }
                else if (type == "get-formations")
                {
                    var formations = await database.GetFormationsAsync().ConfigureAwait(false);
                    if (formations.Count == 0)
                    {
                        formations = await LoadDataArrayAsync("formations").ConfigureAwait(false);
                    }
                    SendArrayResponse("formations-data", "formations", formations);
                }
                else if (type == "save-formations")
                {
                    if (msg.TryGetProperty("payload", out var payload) && payload.TryGetProperty("formations", out var formationsElement))
                    {
                        await database.SaveFormationsAsync(formationsElement).ConfigureAwait(false);
                        await UpdateDataSectionAsync("formations", formationsElement).ConfigureAwait(false);
                        var formations = await database.GetFormationsAsync().ConfigureAwait(false);
                        SendArrayResponse("formations-data", "formations", formations);
                    }
                }
                else if (type == "get-nations")
                {
                    var nations = await database.GetNationsAsync().ConfigureAwait(false);
                    if (nations.Count == 0)
                    {
                        nations = await LoadDataArrayAsync("nations").ConfigureAwait(false);
                    }
                    SendArrayResponse("nations-data", "nations", nations);
                }
                else if (type == "save-nations")
                {
                    if (msg.TryGetProperty("payload", out var payload) && payload.TryGetProperty("nations", out var nationsElement))
                    {
                        await database.SaveNationsAsync(nationsElement).ConfigureAwait(false);
                        await UpdateDataSectionAsync("nations", nationsElement).ConfigureAwait(false);
                        var nations = await database.GetNationsAsync().ConfigureAwait(false);
                        SendArrayResponse("nations-data", "nations", nations);
                    }
                }
                else if (type == "get-settings")
                {
                    var settings = await LoadSettingsNodeAsync().ConfigureAwait(false);
                    SendJsonPayload("settings-data", settings);
                }
                else if (type == "save-settings")
                {
                    if (msg.TryGetProperty("payload", out var payload))
                    {
                        await UpdateSettingsAsync(payload).ConfigureAwait(false);
                        var settings = await LoadSettingsNodeAsync().ConfigureAwait(false);
                        SendJsonPayload("settings-data", settings);
                    }
                }
                else if (type == "get-weapons")
                {
                    var weapons = await database.GetWeaponsAsync().ConfigureAwait(false);
                    if (weapons.Count == 0)
                    {
                        weapons = await LoadWeaponsFallbackAsync().ConfigureAwait(false);
                    }
                    SendArrayResponse("weapons-data", "weapons", weapons);
                }
                else if (type == "save-weapons")
                {
                    if (msg.TryGetProperty("payload", out var payload) && payload.TryGetProperty("weapons", out var weaponsElement))
                    {
                        await database.SaveWeaponsAsync(weaponsElement).ConfigureAwait(false);
                        await UpdatePayloadSectionAsync("weapons", weaponsElement).ConfigureAwait(false);
                        var weapons = await database.GetWeaponsAsync().ConfigureAwait(false);
                        SendArrayResponse("weapons-data", "weapons", weapons);
                    }
                }
                else if (type == "get-ammo")
                {
                    var ammoTemplates = await database.GetAmmoTemplatesAsync().ConfigureAwait(false);
                    if (ammoTemplates.Count == 0)
                    {
                        ammoTemplates = await LoadAmmoFallbackAsync().ConfigureAwait(false);
                    }
                    SendArrayResponse("ammo-data", "ammo", ammoTemplates);
                }
                else if (type == "save-ammo")
                {
                    if (msg.TryGetProperty("payload", out var payload) && payload.TryGetProperty("ammo", out var ammoElement))
                    {
                        await database.SaveAmmoTemplatesAsync(ammoElement).ConfigureAwait(false);
                        await UpdatePayloadSectionAsync("ammo", ammoElement).ConfigureAwait(false);
                        var ammoTemplates = await database.GetAmmoTemplatesAsync().ConfigureAwait(false);
                        SendArrayResponse("ammo-data", "ammo", ammoTemplates);
                    }
                }
                else if (type == "get-fire-modes")
                {
                    var fireTemplates = await database.GetFireModeTemplatesAsync().ConfigureAwait(false);
                    if (fireTemplates.Count == 0)
                    {
                        fireTemplates = await LoadFireModeFallbackAsync().ConfigureAwait(false);
                    }
                    SendArrayResponse("fire-modes-data", "fireModes", fireTemplates);
                }
                else if (type == "save-fire-modes")
                {
                    if (msg.TryGetProperty("payload", out var payload) && payload.TryGetProperty("fireModes", out var fireElement))
                    {
                        await database.SaveFireModeTemplatesAsync(fireElement).ConfigureAwait(false);
                        await UpdatePayloadSectionAsync("fireModes", fireElement).ConfigureAwait(false);
                        var fireTemplates = await database.GetFireModeTemplatesAsync().ConfigureAwait(false);
                        SendArrayResponse("fire-modes-data", "fireModes", fireTemplates);
                    }
                }
                else if (type == "get-weapon-tags")
                {
                    var tags = await database.GetWeaponTagsAsync().ConfigureAwait(false);
                    if (tags.Count == 0)
                    {
                        tags = await LoadWeaponTagsFallbackAsync().ConfigureAwait(false);
                    }
                    SendJsonPayload("weapon-tags-data", tags);
                }
                else if (type == "save-weapon-tags")
                {
                    if (msg.TryGetProperty("payload", out var payload))
                    {
                        await database.SaveWeaponTagsAsync(payload).ConfigureAwait(false);
                        await UpdatePayloadSectionAsync("weaponTags", payload).ConfigureAwait(false);
                        var tags = await database.GetWeaponTagsAsync().ConfigureAwait(false);
                        SendJsonPayload("weapon-tags-data", tags);
                    }
                }
            }
            catch
            {
                // ignored
            }
        }

        private JsonNode BuildFallbackNode()
        {
            var data = TryRead("state.json");
            var units = TryRead("units.json");
            var formations = TryRead("formations.json");
            var nations = TryRead("nations.json");
            var weapons = TryRead("weapons.json");
            var ammo = TryRead("ammo.json");
            var fireModes = TryRead("fireModes.json");
            var weaponTags = TryRead("weaponTags.json");

            var merged = new JsonObject();
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
            if (!merged.ContainsKey("units"))
                merged["units"] = units.HasValue ? JsonNode.Parse(units.Value.GetRawText()) : new JsonArray();
            if (!merged.ContainsKey("formations"))
                merged["formations"] = formations.HasValue ? JsonNode.Parse(formations.Value.GetRawText()) : new JsonArray();
            if (!merged.ContainsKey("nations"))
                merged["nations"] = nations.HasValue ? JsonNode.Parse(nations.Value.GetRawText()) : new JsonArray();

            var payloadNode = new JsonObject
            {
                ["data"] = JsonNode.Parse(merged.ToJsonString())
            };
            if (weapons.HasValue) payloadNode["weapons"] = JsonNode.Parse(weapons.Value.GetRawText());
            if (ammo.HasValue) payloadNode["ammo"] = JsonNode.Parse(ammo.Value.GetRawText());
            if (fireModes.HasValue) payloadNode["fireModes"] = JsonNode.Parse(fireModes.Value.GetRawText());
            if (weaponTags.HasValue) payloadNode["weaponTags"] = JsonNode.Parse(weaponTags.Value.GetRawText());
            return payloadNode;
        }

        private JsonElement? TryRead(string fileName)
        {
            var path = Path.Combine(dbRoot, fileName);
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

        private async Task PersistPayloadAsync(JsonElement payload)
        {
            await database.SaveAppStateAsync(payload.GetRawText()).ConfigureAwait(false);
            await database.SaveStructuredDataAsync(payload).ConfigureAwait(false);
            Directory.CreateDirectory(dbRoot);
            if (payload.TryGetProperty("data", out var data))
            {
                File.WriteAllText(Path.Combine(dbRoot, "state.json"), data.GetRawText());
                if (data.TryGetProperty("units", out var units))
                    File.WriteAllText(Path.Combine(dbRoot, "units.json"), units.GetRawText());
                if (data.TryGetProperty("formations", out var forms))
                    File.WriteAllText(Path.Combine(dbRoot, "formations.json"), forms.GetRawText());
                if (data.TryGetProperty("nations", out var nations))
                    File.WriteAllText(Path.Combine(dbRoot, "nations.json"), nations.GetRawText());
            }
            if (payload.TryGetProperty("weapons", out var weapons))
                File.WriteAllText(Path.Combine(dbRoot, "weapons.json"), weapons.GetRawText());
            if (payload.TryGetProperty("ammo", out var ammo))
                File.WriteAllText(Path.Combine(dbRoot, "ammo.json"), ammo.GetRawText());
            if (payload.TryGetProperty("fireModes", out var fireModes))
                File.WriteAllText(Path.Combine(dbRoot, "fireModes.json"), fireModes.GetRawText());
            if (payload.TryGetProperty("weaponTags", out var wtags))
                File.WriteAllText(Path.Combine(dbRoot, "weaponTags.json"), wtags.GetRawText());
        }

        private void SendHostInfo()
        {
            var info = new
            {
                type = "host-info",
                payload = new
                {
                    version = Application.ProductVersion,
                    databasePath = Path.Combine(dbRoot, "rts.db"),
                    mode = File.Exists(distIndexPath) ? "dist" : "missing"
                }
            };
            webView.CoreWebView2!.PostWebMessageAsJson(JsonSerializer.Serialize(info));
        }

        private async Task SendUnitsAsync()
        {
            var units = await database.GetUnitsAsync().ConfigureAwait(false);
            var payload = new JsonObject
            {
                ["units"] = units
            };
            SendJsonPayload("units-data", payload);
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

        private async Task<JsonNode> LoadPayloadNodeAsync()
        {
            JsonNode? payloadNode = null;
            var storedPayload = await database.LoadAppStateAsync().ConfigureAwait(false);
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
            var structured = await database.LoadStructuredDataAsync().ConfigureAwait(false);
            MergeStructuredData(payloadNode, structured);
            return payloadNode;
        }

        private async Task<JsonArray> LoadDataArrayAsync(string key)
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            if (payloadNode["data"] is JsonObject data && data[key] is JsonArray array)
            {
                return (JsonArray)array.DeepClone();
            }

            return new JsonArray();
        }

        private async Task<JsonObject> LoadSettingsNodeAsync()
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            if (payloadNode["settings"] is JsonObject settings)
            {
                return (JsonObject)settings.DeepClone();
            }

            return new JsonObject();
        }

        private async Task<JsonArray> LoadWeaponsFallbackAsync()
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeWeaponCollection(payloadNode?["weapons"]);
        }

        private async Task<JsonArray> LoadAmmoFallbackAsync()
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeAmmoCollection(payloadNode?["ammo"]);
        }

        private async Task<JsonArray> LoadFireModeFallbackAsync()
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeFireModeCollection(payloadNode?["fireModes"]);
        }

        private async Task<JsonObject> LoadWeaponTagsFallbackAsync()
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            return PayloadNormalization.NormalizeWeaponTags(payloadNode?["weaponTags"]);
        }

        private async Task UpdateDataSectionAsync(string key, JsonElement value)
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            if (payloadNode["data"] is not JsonObject data)
            {
                data = new JsonObject();
                payloadNode["data"] = data;
            }

            data[key] = JsonNode.Parse(value.GetRawText()) ?? new JsonArray();
            await PersistPayloadNodeAsync(payloadNode).ConfigureAwait(false);
        }

        private async Task UpdateSettingsAsync(JsonElement value)
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            payloadNode["settings"] = JsonNode.Parse(value.GetRawText()) ?? new JsonObject();
            await PersistPayloadNodeAsync(payloadNode).ConfigureAwait(false);
        }

        private async Task UpdatePayloadSectionAsync(string key, JsonElement value)
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
            payloadNode[key] = JsonNode.Parse(value.GetRawText()) ?? new JsonArray();
            await PersistPayloadNodeAsync(payloadNode).ConfigureAwait(false);
        }

        private async Task RemoveUnitFromPayloadAsync(long unitId)
        {
            var payloadNode = await LoadPayloadNodeAsync().ConfigureAwait(false);
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

        private async Task PersistPayloadNodeAsync(JsonNode payloadNode)
        {
            using var doc = JsonDocument.Parse(payloadNode.ToJsonString());
            await PersistPayloadAsync(doc.RootElement.Clone()).ConfigureAwait(false);
        }

        private void SendArrayResponse(string messageType, string propertyName, JsonArray items)
        {
            var payload = new JsonObject
            {
                [propertyName] = items
            };
            SendJsonPayload(messageType, payload);
        }

        private void SendJsonPayload(string messageType, JsonNode? payload)
        {
            payload ??= new JsonObject();
            var envelope = new JsonObject
            {
                ["type"] = messageType,
                ["payload"] = payload
            };
            var messageJson = envelope.ToJsonString();

            void Post() => webView.CoreWebView2?.PostWebMessageAsJson(messageJson);

            if (InvokeRequired)
            {
                BeginInvoke((Action)(() =>
                {
                    try
                    {
                        Post();
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine($"[MainForm] Failed to deliver '{messageType}' payload: {ex.Message}");
                    }
                }));
            }
            else
            {
                try
                {
                    Post();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"[MainForm] Failed to deliver '{messageType}' payload: {ex.Message}");
                }
            }
        }
    }
}
