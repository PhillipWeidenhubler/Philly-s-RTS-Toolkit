using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Serilog;
using PhillyRTSToolkit.Messaging;

namespace PhillyRTSToolkit
{
    public partial class MainForm : Form
    {
        private readonly string dataRoot;
        private readonly string jsonRoot;
        private readonly string distIndexPath;
        private readonly DatabaseService database;
        private readonly PayloadStorageService payloadStorage;
        private readonly LocalServerHost serverHost;
        private LocalServerMetadata? serverMetadata;
        private readonly Serilog.ILogger logger = Log.ForContext<MainForm>();
        private readonly WebMessageDispatcher messageDispatcher;
        private static readonly JsonSerializerOptions WebJsonOptions = new(JsonSerializerDefaults.Web);
        private bool shutdownRequested;
        private bool shutdownReady;
        private bool serverDisposed;

        public MainForm()
        {
            InitializeComponent();
            logger.Information("Initializing MainForm");
            var desktopRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", ".."));
            var solutionRoot = Path.GetFullPath(Path.Combine(desktopRoot, ".."));
            var frontendRoot = Path.Combine(solutionRoot, "frontend");
            dataRoot = Path.Combine(solutionRoot, "database");
            Directory.CreateDirectory(dataRoot);
            jsonRoot = Path.Combine(dataRoot, "json");
            Directory.CreateDirectory(jsonRoot);
            var schemaPath = Path.Combine(dataRoot, "schema.sql");
            var dbPath = Path.Combine(dataRoot, "rts.db");
            database = new DatabaseService(dbPath, schemaPath);
            payloadStorage = new PayloadStorageService(database, jsonRoot);
            serverHost = new LocalServerHost();
            serverHost.LogEmitted += (_, entry) => SendServerLog(entry);
            distIndexPath = Path.Combine(frontendRoot, "app", "dist", "index.html");
            logger.Information("Initializing database at {DatabasePath}", dbPath);
            database.InitializeAsync().GetAwaiter().GetResult();
            logger.Information("Starting local server host");
            serverMetadata = serverHost.StartAsync(database, payloadStorage).GetAwaiter().GetResult();
            logger.Information("Local server started at {BaseUrl}", serverMetadata?.BaseUrl);
            messageDispatcher = new WebMessageDispatcher(
                database,
                payloadStorage,
                BuildHostInfoPayload,
                BuildServerLogSnapshot,
                logger);
            InitWebView();
        }

        private async void InitWebView()
        {
            logger.Information("Initializing WebView2");
            await webView.EnsureCoreWebView2Async(null);
            webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;
            Directory.CreateDirectory(dataRoot);
            try
            {
                var chosen = ResolveFrontendEntry();
                logger.Information("Loading frontend from {Source}", chosen);
                webView.Source = chosen;
            }
            catch (FileNotFoundException ex)
            {
                logger.Error(ex, "Failed to resolve frontend entry");
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

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (!shutdownRequested)
            {
                shutdownRequested = true;
                logger.Information("MainForm close requested ({Reason})", e.CloseReason);
                e.Cancel = true;
                BeginShutdownSequence();
                return;
            }

            if (!shutdownReady)
            {
                e.Cancel = true;
                return;
            }

            base.OnFormClosing(e);
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            base.OnFormClosed(e);
            logger.Information("MainForm closed");
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
            throw new FileNotFoundException("Missing frontend build. Run 'npm run build' inside frontend/app to generate dist/index.html.");
        }

        private void MapVirtualHost(string hostName, string folder)
        {
            webView.CoreWebView2!.SetVirtualHostNameToFolderMapping(hostName, folder, CoreWebView2HostResourceAccessKind.Allow);
        }

        private async Task SendLoadAsync()
        {
            var payloadNode = await payloadStorage.LoadPayloadAsync().ConfigureAwait(false);
            using var doc = JsonDocument.Parse(payloadNode.ToJsonString());
            var payloadElement = doc.RootElement.Clone();
            var message = JsonSerializer.Serialize(new { type = "load", payload = payloadElement }, WebJsonOptions);
            webView.CoreWebView2!.PostWebMessageAsJson(message);
        }

        private async void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                using var doc = JsonDocument.Parse(e.WebMessageAsJson);
                var msg = doc.RootElement.Clone();
                if (!msg.TryGetProperty("type", out var tProp)) return;
                var type = tProp.GetString();
                logger.Debug("Received web message {Type}", type);

                var responses = await messageDispatcher.HandleAsync(msg).ConfigureAwait(false);
                foreach (var envelope in responses)
                {
                    SendJsonPayload(envelope.Type, envelope.Payload);
                }

                if (string.Equals(type, "request-load", StringComparison.Ordinal))
                {
                    await SendLoadAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                logger.Error(ex, "Failed to process WebView message");
            }
        }


        private JsonObject BuildHostInfoPayload()
        {
            var payloadNode = JsonSerializer.SerializeToNode(new
            {
                version = Application.ProductVersion,
                databasePath = Path.Combine(dataRoot, "rts.db"),
                dataDirectory = dataRoot,
                mode = File.Exists(distIndexPath) ? "dist" : "missing",
                server = serverMetadata
            }, WebJsonOptions) as JsonObject ?? new JsonObject();
            return payloadNode;
        }

        private JsonObject BuildServerLogSnapshot()
        {
            if (serverHost is null)
            {
                return new JsonObject { ["entries"] = new JsonArray() };
            }

            var node = JsonSerializer.SerializeToNode(new { entries = serverHost.SnapshotLogs() }, WebJsonOptions) as JsonObject ?? new JsonObject();
            return node;
        }

        private void SendServerLog(ServerLogEvent entry)
        {
            var payload = JsonSerializer.SerializeToNode(entry, WebJsonOptions) ?? new JsonObject();
            SendJsonPayload("server-log-event", payload);
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

        private void BeginShutdownSequence()
        {
            try
            {
                BeginInvoke((Action)(() =>
                {
                    try
                    {
                        Hide();
                    }
                    catch
                    {
                        // ignored
                    }
                }));
            }
            catch
            {
                // ignored
            }

            Task.Run(async () =>
            {
                await DisposeServerHostAsync().ConfigureAwait(false);
                shutdownReady = true;
                try
                {
                    BeginInvoke((Action)(() =>
                    {
                        if (!IsDisposed)
                        {
                            Close();
                        }
                    }));
                }
                catch
                {
                    // ignored
                }
            });
        }

        private async Task DisposeServerHostAsync()
        {
            if (serverHost is null || serverDisposed) return;
            serverDisposed = true;
            try
            {
                await serverHost.DisposeAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                logger.Error(ex, "Failed to dispose local server");
            }
        }
    }
}
