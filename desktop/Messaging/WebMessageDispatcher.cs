using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Serilog;

namespace PhillyRTSToolkit.Messaging
{
    public sealed class WebMessageDispatcher
    {
        private readonly DatabaseService _database;
        private readonly PayloadStorageService _payloadStorage;
        private readonly Func<JsonObject> _hostInfoProvider;
        private readonly Func<JsonObject> _serverLogSnapshotProvider;
        private readonly ILogger _logger;

        public WebMessageDispatcher(
            DatabaseService database,
            PayloadStorageService payloadStorage,
            Func<JsonObject> hostInfoProvider,
            Func<JsonObject> serverLogSnapshotProvider,
            ILogger logger)
        {
            _database = database ?? throw new ArgumentNullException(nameof(database));
            _payloadStorage = payloadStorage ?? throw new ArgumentNullException(nameof(payloadStorage));
            _hostInfoProvider = hostInfoProvider ?? throw new ArgumentNullException(nameof(hostInfoProvider));
            _serverLogSnapshotProvider = serverLogSnapshotProvider ?? throw new ArgumentNullException(nameof(serverLogSnapshotProvider));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IReadOnlyList<WebMessageEnvelope>> HandleAsync(JsonElement message)
        {
            var responses = new List<WebMessageEnvelope>();
            if (!message.TryGetProperty("type", out var typeProp))
            {
                return responses;
            }

            var type = typeProp.GetString();
            if (string.IsNullOrWhiteSpace(type))
            {
                return responses;
            }

            _logger.Debug("Dispatching WebView envelope {Type}", type);
            var hasPayload = message.TryGetProperty("payload", out var payloadElement);

            switch (type)
            {
                case "save" when hasPayload:
                    await _payloadStorage.PersistPayloadAsync(payloadElement).ConfigureAwait(false);
                    break;

                case "request-load":
                    break;

                case "host-info-request":
                    responses.Add(new WebMessageEnvelope("host-info", _hostInfoProvider()));
                    break;

                case "get-units":
                    responses.Add(await BuildUnitsEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-unit" when hasPayload:
                    await HandleSaveUnitAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "delete-unit" when hasPayload:
                    await HandleDeleteUnitAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "get-formations":
                    responses.Add(await BuildFormationsEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-formations" when hasPayload:
                    await HandleSaveFormationsAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "get-nations":
                    responses.Add(await BuildNationsEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-nations" when hasPayload:
                    await HandleSaveNationsAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "get-settings":
                    responses.Add(await BuildSettingsEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-settings" when hasPayload:
                    await HandleSaveSettingsAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "get-weapons":
                    responses.Add(await BuildWeaponsEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-weapons" when hasPayload:
                    await HandleSaveWeaponsAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "get-ammo":
                    responses.Add(await BuildAmmoEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-ammo" when hasPayload:
                    await HandleSaveAmmoAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "get-fire-modes":
                    responses.Add(await BuildFireModesEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-fire-modes" when hasPayload:
                    await HandleSaveFireModesAsync(payloadElement, responses).ConfigureAwait(false);
                    break;

                case "get-weapon-tags":
                    responses.Add(await BuildWeaponTagsEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "save-weapon-tags" when hasPayload:
                    await _database.SaveWeaponTagsAsync(payloadElement).ConfigureAwait(false);
                    await _payloadStorage.UpdatePayloadSectionAsync("weaponTags", payloadElement).ConfigureAwait(false);
                    responses.Add(await BuildWeaponTagsEnvelopeAsync().ConfigureAwait(false));
                    break;

                case "get-server-logs":
                    responses.Add(new WebMessageEnvelope("server-logs", _serverLogSnapshotProvider()));
                    break;

                default:
                    _logger.Warning("Unhandled WebView message type {Type}", type);
                    break;
            }

            return responses;
        }

        private async Task HandleSaveUnitAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            if (!payload.TryGetProperty("unit", out var unitElement)) return;
            await _database.SaveUnitAsync(unitElement).ConfigureAwait(false);
            var canonicalUnits = await _database.GetUnitsAsync().ConfigureAwait(false);
            var unitsElementCanonical = JsonSerializer.SerializeToElement(canonicalUnits);
            await _payloadStorage.UpdateDataSectionAsync("units", unitsElementCanonical).ConfigureAwait(false);
            responses.Add(new WebMessageEnvelope("units-data", WrapArray("units", canonicalUnits)));
        }

        private async Task HandleDeleteUnitAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            if (!payload.TryGetProperty("id", out var idElement) || !idElement.TryGetInt64(out var id)) return;
            await _database.DeleteUnitAsync(id).ConfigureAwait(false);
            var cleanupTask = _payloadStorage.RemoveUnitFromPayloadAsync(id);
            responses.Add(await BuildUnitsEnvelopeAsync().ConfigureAwait(false));
            await cleanupTask.ConfigureAwait(false);
        }

        private async Task HandleSaveFormationsAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            if (!payload.TryGetProperty("formations", out var formationsElement)) return;
            string? integrityError = null;
            IReadOnlyList<string>? integrityDetails = null;
            try
            {
                await _database.SaveFormationsAsync(formationsElement).ConfigureAwait(false);
            }
            catch (ReferentialIntegrityException rie) when (rie.Scope == "formations")
            {
                integrityError = rie.Message;
                integrityDetails = rie.Details;
                _logger.Warning(rie, "Formation save blocked by referential integrity guard");
            }

            var canonicalFormations = await _database.GetFormationsAsync().ConfigureAwait(false);
            var formationsElementCanonical = JsonSerializer.SerializeToElement(canonicalFormations);
            await _payloadStorage.UpdateDataSectionAsync("formations", formationsElementCanonical).ConfigureAwait(false);
            responses.Add(new WebMessageEnvelope("formations-data", WrapArray("formations", canonicalFormations, integrityError, integrityDetails)));
        }

        private async Task HandleSaveNationsAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            if (!payload.TryGetProperty("nations", out var nationsElement)) return;
            string? integrityError = null;
            IReadOnlyList<string>? integrityDetails = null;
            try
            {
                await _database.SaveNationsAsync(nationsElement).ConfigureAwait(false);
            }
            catch (ReferentialIntegrityException rie) when (rie.Scope == "nations")
            {
                integrityError = rie.Message;
                integrityDetails = rie.Details;
                _logger.Warning(rie, "Nation save blocked by referential integrity guard");
            }

            var canonicalNations = await _database.GetNationsAsync().ConfigureAwait(false);
            var nationsElementCanonical = JsonSerializer.SerializeToElement(canonicalNations);
            await _payloadStorage.UpdateDataSectionAsync("nations", nationsElementCanonical).ConfigureAwait(false);
            responses.Add(new WebMessageEnvelope("nations-data", WrapArray("nations", canonicalNations, integrityError, integrityDetails)));
        }

        private async Task HandleSaveWeaponsAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            if (!payload.TryGetProperty("weapons", out var weaponsElement)) return;
            await _database.SaveWeaponsAsync(weaponsElement).ConfigureAwait(false);
            await _payloadStorage.UpdatePayloadSectionAsync("weapons", weaponsElement).ConfigureAwait(false);
            var weapons = await _database.GetWeaponsAsync().ConfigureAwait(false);
            responses.Add(new WebMessageEnvelope("weapons-data", WrapArray("weapons", weapons)));
        }

        private async Task HandleSaveAmmoAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            if (!payload.TryGetProperty("ammo", out var ammoElement)) return;
            await _database.SaveAmmoTemplatesAsync(ammoElement).ConfigureAwait(false);
            await _payloadStorage.UpdatePayloadSectionAsync("ammo", ammoElement).ConfigureAwait(false);
            var ammoTemplates = await _database.GetAmmoTemplatesAsync().ConfigureAwait(false);
            responses.Add(new WebMessageEnvelope("ammo-data", WrapArray("ammo", ammoTemplates)));
        }

        private async Task HandleSaveFireModesAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            if (!payload.TryGetProperty("fireModes", out var fireElement)) return;
            await _database.SaveFireModeTemplatesAsync(fireElement).ConfigureAwait(false);
            await _payloadStorage.UpdatePayloadSectionAsync("fireModes", fireElement).ConfigureAwait(false);
            var fireTemplates = await _database.GetFireModeTemplatesAsync().ConfigureAwait(false);
            responses.Add(new WebMessageEnvelope("fire-modes-data", WrapArray("fireModes", fireTemplates)));
        }

        private async Task HandleSaveSettingsAsync(JsonElement payload, List<WebMessageEnvelope> responses)
        {
            await _database.SaveSettingsAsync(payload).ConfigureAwait(false);
            await _payloadStorage.UpdateSettingsAsync(payload).ConfigureAwait(false);
            responses.Add(await BuildSettingsEnvelopeAsync().ConfigureAwait(false));
        }

        private async Task<WebMessageEnvelope> BuildUnitsEnvelopeAsync()
        {
            var units = await _database.GetUnitsAsync().ConfigureAwait(false);
            return new WebMessageEnvelope("units-data", WrapArray("units", units));
        }

        private async Task<WebMessageEnvelope> BuildFormationsEnvelopeAsync()
        {
            var formations = await _database.GetFormationsAsync().ConfigureAwait(false);
            if (formations.Count == 0)
            {
                formations = await _payloadStorage.LoadDataArrayAsync("formations").ConfigureAwait(false);
            }
            return new WebMessageEnvelope("formations-data", WrapArray("formations", formations));
        }

        private async Task<WebMessageEnvelope> BuildNationsEnvelopeAsync()
        {
            var nations = await _database.GetNationsAsync().ConfigureAwait(false);
            if (nations.Count == 0)
            {
                nations = await _payloadStorage.LoadDataArrayAsync("nations").ConfigureAwait(false);
            }
            return new WebMessageEnvelope("nations-data", WrapArray("nations", nations));
        }

        private async Task<WebMessageEnvelope> BuildSettingsEnvelopeAsync()
        {
            var settings = await _database.GetSettingsAsync().ConfigureAwait(false);
            if (settings.Count == 0)
            {
                settings = await _payloadStorage.LoadSettingsAsync().ConfigureAwait(false);
            }
            return new WebMessageEnvelope("settings-data", settings);
        }

        private async Task<WebMessageEnvelope> BuildWeaponsEnvelopeAsync()
        {
            var weapons = await _database.GetWeaponsAsync().ConfigureAwait(false);
            if (weapons.Count == 0)
            {
                weapons = await _payloadStorage.LoadWeaponsFallbackAsync().ConfigureAwait(false);
            }
            return new WebMessageEnvelope("weapons-data", WrapArray("weapons", weapons));
        }

        private async Task<WebMessageEnvelope> BuildAmmoEnvelopeAsync()
        {
            var ammoTemplates = await _database.GetAmmoTemplatesAsync().ConfigureAwait(false);
            if (ammoTemplates.Count == 0)
            {
                ammoTemplates = await _payloadStorage.LoadAmmoFallbackAsync().ConfigureAwait(false);
            }
            return new WebMessageEnvelope("ammo-data", WrapArray("ammo", ammoTemplates));
        }

        private async Task<WebMessageEnvelope> BuildFireModesEnvelopeAsync()
        {
            var fireTemplates = await _database.GetFireModeTemplatesAsync().ConfigureAwait(false);
            if (fireTemplates.Count == 0)
            {
                fireTemplates = await _payloadStorage.LoadFireModeFallbackAsync().ConfigureAwait(false);
            }
            return new WebMessageEnvelope("fire-modes-data", WrapArray("fireModes", fireTemplates));
        }

        private async Task<WebMessageEnvelope> BuildWeaponTagsEnvelopeAsync()
        {
            var tags = await _database.GetWeaponTagsAsync().ConfigureAwait(false);
            if (tags.Count == 0)
            {
                tags = await _payloadStorage.LoadWeaponTagsFallbackAsync().ConfigureAwait(false);
            }
            return new WebMessageEnvelope("weapon-tags-data", tags);
        }

        private static JsonObject WrapArray(string propertyName, JsonArray items, string? error = null, IReadOnlyList<string>? details = null)
        {
            var payload = new JsonObject
            {
                [propertyName] = items
            };

            if (!string.IsNullOrWhiteSpace(error))
            {
                payload["error"] = error;
                if (details is { Count: > 0 })
                {
                    var detailArray = new JsonArray();
                    foreach (var detail in details)
                    {
                        detailArray.Add(detail);
                    }
                    payload["details"] = detailArray;
                }
            }

            return payload;
        }
    }

    public sealed record WebMessageEnvelope(string Type, JsonNode? Payload);
}
