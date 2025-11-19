using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;

namespace PhillyRTSToolkit
{
    public partial class MainForm : Form
    {
    private string dbRoot = "";
    public MainForm()
    {
        InitializeComponent();
        InitWebView();
    }

        private async void InitWebView()
        {
            await webView.EnsureCoreWebView2Async(null);
            webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;
            // Resolve index.html relative to the build output (desktop/bin/Release/netX/).
            // Go up four levels to reach the project root where index.html resides.
            var indexPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "index.html"));
            dbRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "database"));
            Directory.CreateDirectory(dbRoot);
            if (!File.Exists(indexPath))
            {
                MessageBox.Show("index.html not found. Place desktop folder next to your web files.", "Error");
                return;
            }
            webView.Source = new Uri(indexPath);
            webView.CoreWebView2.DOMContentLoaded += (_, __) => SendLoad();
            this.KeyPreview = true;
            this.KeyDown += (s, e) =>
            {
                if (e.KeyCode == Keys.F11)
                {
                    ToggleFullscreen();
                }
            };
            webView.PreviewKeyDown += (s, e) =>
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
            if (this.FormBorderStyle == FormBorderStyle.None)
            {
                this.FormBorderStyle = FormBorderStyle.Sizable;
                this.WindowState = FormWindowState.Normal;
            }
            else
            {
                this.FormBorderStyle = FormBorderStyle.None;
                this.WindowState = FormWindowState.Maximized;
            }
        }

        private void SendLoad()
        {
            var data = TryRead("state.json");
            var units = TryRead("units.json");
            var formations = TryRead("formations.json");
            var nations = TryRead("nations.json");
            var weapons = TryRead("weapons.json");
            var ammo = TryRead("ammo.json");
            var weaponTags = TryRead("weaponTags.json");

            // Merge standalone unit/formation/nation files into the main payload if missing.
            JsonElement dataPayload;
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

            using (var obj = JsonDocument.Parse(merged.ToJsonString()))
            {
                dataPayload = obj.RootElement.Clone();
            }

            var payload = new
            {
                data = dataPayload,
                weapons = weapons.HasValue ? weapons.Value : (JsonElement?)null,
                ammo = ammo.HasValue ? ammo.Value : (JsonElement?)null,
                weaponTags = weaponTags.HasValue ? weaponTags.Value : (JsonElement?)null
            };
            webView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new { type = "load", payload }));
        }

        private void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
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
                        SavePayload(payload);
                    }
                }
                else if (type == "request-load")
                {
                    SendLoad();
                }
            }
            catch { }
        }

        private JsonElement? TryRead(string fileName)
        {
            var pathPrimary = Path.Combine(dbRoot, fileName);
            var legacyPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data", fileName);
            var path = File.Exists(pathPrimary) ? pathPrimary : legacyPath;
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
        private void SavePayload(JsonElement payload)
        {
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
            if (payload.TryGetProperty("weaponTags", out var wtags))
                File.WriteAllText(Path.Combine(dbRoot, "weaponTags.json"), wtags.GetRawText());
        }
    }
}
