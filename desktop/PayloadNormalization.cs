using System;
using System.Text.Json.Nodes;

namespace PhillyRTSToolkit
{
    internal static class PayloadNormalization
    {
        public static JsonArray NormalizeWeaponCollection(JsonNode? node)
        {
            var result = new JsonArray();
            if (node == null) return result;

            if (node is JsonArray array)
            {
                foreach (var entry in array)
                {
                    result.Add(entry?.DeepClone() ?? new JsonObject());
                }
                return result;
            }

            if (node is JsonObject obj)
            {
                if (LooksLikeWeapon(obj))
                {
                    result.Add(obj.DeepClone());
                    return result;
                }

                foreach (var kvp in obj)
                {
                    JsonObject entry;
                    if (kvp.Value is JsonObject valueObj)
                    {
                        entry = (JsonObject)valueObj.DeepClone();
                    }
                    else
                    {
                        entry = JsonNode.Parse(kvp.Value?.ToJsonString() ?? "{}") as JsonObject ?? new JsonObject();
                    }

                    if (!entry.TryGetPropertyValue("name", out var nameNode) || string.IsNullOrWhiteSpace(nameNode?.ToString()))
                    {
                        entry["name"] = kvp.Key;
                    }

                    result.Add(entry);
                }
            }

            return result;
        }

        public static JsonArray NormalizeAmmoCollection(JsonNode? node)
        {
            var result = new JsonArray();
            if (node == null) return result;

            if (node is JsonArray array)
            {
                foreach (var entry in array)
                {
                    result.Add(entry?.DeepClone() ?? new JsonObject());
                }
                return result;
            }

            if (node is JsonObject obj)
            {
                if (LooksLikeAmmoTemplate(obj))
                {
                    result.Add(obj.DeepClone());
                    return result;
                }

                foreach (var kvp in obj)
                {
                    if (kvp.Value is JsonArray templateArray)
                    {
                        foreach (var templateNode in templateArray)
                        {
                            var payload = templateNode as JsonObject ?? JsonNode.Parse(templateNode?.ToJsonString() ?? "{}") as JsonObject ?? new JsonObject();
                            if (!payload.TryGetPropertyValue("caliber", out var caliberNode) || string.IsNullOrWhiteSpace(caliberNode?.ToString()))
                            {
                                payload["caliber"] = kvp.Key;
                            }
                            result.Add(payload);
                        }
                    }
                }
            }

            return result;
        }

        public static JsonObject NormalizeWeaponTags(JsonNode? node)
        {
            var result = new JsonObject
            {
                ["categories"] = new JsonObject(),
                ["calibers"] = new JsonObject()
            };

            if (node is not JsonObject obj)
            {
                return result;
            }

            foreach (var kvp in obj)
            {
                if (kvp.Value is JsonObject inner)
                {
                    result[kvp.Key] = inner.DeepClone();
                }
            }

            return result;
        }

        public static JsonArray NormalizeFireModeCollection(JsonNode? node)
        {
            var result = new JsonArray();
            if (node == null) return result;

            if (node is JsonArray array)
            {
                foreach (var entry in array)
                {
                    result.Add(entry?.DeepClone() ?? new JsonObject());
                }
                return result;
            }

            if (node is JsonObject obj)
            {
                if (LooksLikeFireMode(obj))
                {
                    result.Add(obj.DeepClone());
                    return result;
                }

                foreach (var kvp in obj)
                {
                    var payload = kvp.Value as JsonObject ?? JsonNode.Parse(kvp.Value?.ToJsonString() ?? "{}") as JsonObject ?? new JsonObject();
                    if (!payload.TryGetPropertyValue("name", out var nameNode) || string.IsNullOrWhiteSpace(nameNode?.ToString()))
                    {
                        payload["name"] = kvp.Key;
                    }
                    result.Add(payload);
                }
            }

            return result;
        }

        private static bool LooksLikeWeapon(JsonObject obj)
        {
            return obj.TryGetPropertyValue("name", out var _) ||
                   obj.TryGetPropertyValue("category", out var _) ||
                   obj.TryGetPropertyValue("caliber", out var _);
        }

        private static bool LooksLikeAmmoTemplate(JsonObject obj)
        {
            return obj.TryGetPropertyValue("caliber", out var _) ||
                   obj.TryGetPropertyValue("name", out var _);
        }

        private static bool LooksLikeFireMode(JsonObject obj)
        {
            return obj.TryGetPropertyValue("name", out var _) ||
                   obj.TryGetPropertyValue("rounds", out var _) ||
                   obj.TryGetPropertyValue("cooldown", out var _);
        }
    }
}
