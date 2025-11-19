using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;

namespace PhillyRTSToolkit
{
    public class DatabaseService
    {
        private readonly string _dbPath;
        private readonly string _schemaPath;
        private readonly Lazy<Task> _initializationTask;

        public DatabaseService(string dbPath, string schemaPath)
        {
            _dbPath = dbPath;
            _schemaPath = schemaPath;
            _initializationTask = new Lazy<Task>(InitializeInternalAsync);
        }

        public Task InitializeAsync() => _initializationTask.Value;

        private async Task InitializeInternalAsync()
        {
            var directory = Path.GetDirectoryName(_dbPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);

            if (File.Exists(_schemaPath))
            {
                var schemaSql = await File.ReadAllTextAsync(_schemaPath, Encoding.UTF8).ConfigureAwait(false);
                await ExecuteScriptAsync(connection, schemaSql).ConfigureAwait(false);
            }
        }

        private static async Task ExecuteScriptAsync(SqliteConnection connection, string script)
        {
            var commands = script.Split(";", StringSplitOptions.RemoveEmptyEntries);
            foreach (var cmdText in commands)
            {
                var trimmed = cmdText.Trim();
                if (string.IsNullOrWhiteSpace(trimmed)) continue;
                await using var command = connection.CreateCommand();
                command.CommandText = trimmed + ";";
                await command.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        public async Task<string?> LoadAppStateAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT payload FROM app_state WHERE id = 1;";
            var result = await command.ExecuteScalarAsync().ConfigureAwait(false);
            return result?.ToString();
        }

        public async Task SaveAppStateAsync(string payload)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);

            await using var command = connection.CreateCommand();
            command.CommandText = @"
INSERT INTO app_state (id, payload, updated_at)
VALUES (1, $payload, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at;";
            command.Parameters.AddWithValue("$payload", payload);
            await command.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        public async Task SaveStructuredDataAsync(JsonElement payload)
        {
            await InitializeAsync().ConfigureAwait(false);
            if (!payload.TryGetProperty("data", out var data)) return;

            if (data.TryGetProperty("units", out var units))
            {
                await RewriteUnitsAsync(units).ConfigureAwait(false);
            }
        }

        public async Task<JsonNode?> LoadStructuredDataAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);

            var unitsArray = await LoadUnitsAsync(connection).ConfigureAwait(false);
            var formationsArray = await LoadFormationsAsync(connection).ConfigureAwait(false);
            var nationsArray = await LoadNationsAsync(connection).ConfigureAwait(false);

            var dataNode = new JsonObject();
            if (unitsArray.Count > 0) dataNode["units"] = unitsArray;
            if (formationsArray.Count > 0) dataNode["formations"] = formationsArray;
            if (nationsArray.Count > 0) dataNode["nations"] = nationsArray;
            if (dataNode.Count == 0) return null;

            return new JsonObject { ["data"] = dataNode };
        }

        public async Task<JsonArray> GetUnitsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadUnitsAsync(connection).ConfigureAwait(false);
        }

        public async Task SaveUnitAsync(JsonElement unitElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            var targetId = TryGetId(unitElement);
            await PersistUnitGraphAsync(connection, sqliteTransaction, unitElement, targetId, true).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        public async Task SaveFormationsAsync(JsonElement formationsElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            await RewriteFormationsAsync(formationsElement).ConfigureAwait(false);
        }

        public async Task SaveNationsAsync(JsonElement nationsElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            await RewriteNationsAsync(nationsElement).ConfigureAwait(false);
        }

        public async Task<JsonArray> GetFormationsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadFormationsAsync(connection).ConfigureAwait(false);
        }

        public async Task<JsonArray> GetNationsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadNationsAsync(connection).ConfigureAwait(false);
        }

        public async Task DeleteUnitAsync(long unitId)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            await using var command = connection.CreateCommand();
            command.CommandText = "DELETE FROM units WHERE id = $id;";
            command.Parameters.AddWithValue("$id", unitId);
            await command.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private async Task RewriteUnitsAsync(JsonElement unitsElement)
        {
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            var deleteCmd = connection.CreateCommand();
            deleteCmd.Transaction = sqliteTransaction;
            deleteCmd.CommandText = @"
DELETE FROM unit_equipment;
DELETE FROM unit_gun_fire_modes;
DELETE FROM unit_gun_ammo;
DELETE FROM unit_guns;
DELETE FROM unit_grenades;
DELETE FROM unit_capabilities;
DELETE FROM unit_stats;
DELETE FROM units;";
            await deleteCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var unit in unitsElement.EnumerateArray())
            {
                var explicitId = TryGetId(unit);
                await PersistUnitGraphAsync(connection, sqliteTransaction, unit, explicitId, false).ConfigureAwait(false);
            }

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteFormationsAsync(JsonElement formationsElement)
        {
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            var deleteCmd = connection.CreateCommand();
            deleteCmd.Transaction = sqliteTransaction;
            deleteCmd.CommandText = @"
DELETE FROM formation_category_units;
DELETE FROM formation_categories;
DELETE FROM formation_children;
DELETE FROM formations;";
            await deleteCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var formation in formationsElement.EnumerateArray())
            {
                await InsertFormationAsync(connection, sqliteTransaction, formation).ConfigureAwait(false);
            }

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteNationsAsync(JsonElement nationsElement)
        {
            await using var connection = new SqliteConnection($"Data Source={_dbPath}");
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            var resetCmd = connection.CreateCommand();
            resetCmd.Transaction = sqliteTransaction;
            resetCmd.CommandText = @"
DELETE FROM nations;
UPDATE formations SET nation_id = NULL;";
            await resetCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var nation in nationsElement.EnumerateArray())
            {
                var nationId = await InsertNationAsync(connection, sqliteTransaction, nation).ConfigureAwait(false);
                if (nation.TryGetProperty("formations", out var formations) && formations.ValueKind == JsonValueKind.Array)
                {
                    foreach (var formationRef in formations.EnumerateArray())
                    {
                        if (formationRef.ValueKind == JsonValueKind.Number && formationRef.TryGetInt64(out var formationId))
                        {
                            var updateCmd = connection.CreateCommand();
                            updateCmd.Transaction = sqliteTransaction;
                            updateCmd.CommandText = "UPDATE formations SET nation_id = $nationId WHERE id = $formationId;";
                            updateCmd.Parameters.AddWithValue("$nationId", nationId);
                            updateCmd.Parameters.AddWithValue("$formationId", formationId);
                            await updateCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                        }
                    }
                }
            }

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private static async Task<long> PersistUnitGraphAsync(SqliteConnection connection, SqliteTransaction transaction, JsonElement unit, long? unitIdOverride, bool clearExistingRelations)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            if (unitIdOverride.HasValue)
            {
                cmd.CommandText = @"
INSERT INTO units (id, name, price, category, internal_category, tier, description, image, created_at, updated_at)
VALUES ($id, $name, $price, $category, $internal, $tier, $description, $image,
        COALESCE((SELECT created_at FROM units WHERE id = $id), CURRENT_TIMESTAMP),
        CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    price = excluded.price,
    category = excluded.category,
    internal_category = excluded.internal_category,
    tier = excluded.tier,
    description = excluded.description,
    image = excluded.image,
    updated_at = CURRENT_TIMESTAMP;";
                cmd.Parameters.AddWithValue("$id", unitIdOverride.Value);
            }
            else
            {
                cmd.CommandText = @"
INSERT INTO units (name, price, category, internal_category, tier, description, image, created_at, updated_at)
VALUES ($name, $price, $category, $internal, $tier, $description, $image, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
            }
            cmd.Parameters.AddWithValue("$name", unit.GetPropertyOrDefault("name", string.Empty));
            cmd.Parameters.AddWithValue("$price", unit.GetPropertyOrDefault("price", (int?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$category", unit.GetPropertyOrDefault("category", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$internal", unit.GetPropertyOrDefault("internalCategory", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$tier", unit.GetPropertyOrDefault("tier", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$description", unit.GetPropertyOrDefault("description", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$image", unit.GetPropertyOrDefault("image", string.Empty) ?? (object)DBNull.Value);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            var unitId = unitIdOverride ?? await GetLastInsertRowIdAsync(connection).ConfigureAwait(false);

            if (clearExistingRelations)
            {
                await ClearUnitRelationsAsync(connection, transaction, unitId).ConfigureAwait(false);
            }

            if (unit.TryGetProperty("stats", out var stats))
            {
                var statsCmd = connection.CreateCommand();
                statsCmd.Transaction = transaction;
                statsCmd.CommandText = @"
INSERT INTO unit_stats (unit_id, armor, health, squad_size, visual_range, stealth, speed, weight)
VALUES ($unitId, $armor, $health, $squad, $visual, $stealth, $speed, $weight);";
                statsCmd.Parameters.AddWithValue("$unitId", unitId);
                statsCmd.Parameters.AddWithValue("$armor", stats.GetPropertyOrDefault("armor", (double?)null) ?? (object)DBNull.Value);
                statsCmd.Parameters.AddWithValue("$health", stats.GetPropertyOrDefault("health", (double?)null) ?? (object)DBNull.Value);
                statsCmd.Parameters.AddWithValue("$squad", stats.GetPropertyOrDefault("squadSize", (double?)null) ?? (object)DBNull.Value);
                statsCmd.Parameters.AddWithValue("$visual", stats.GetPropertyOrDefault("visualRange", (double?)null) ?? (object)DBNull.Value);
                statsCmd.Parameters.AddWithValue("$stealth", stats.GetPropertyOrDefault("stealth", (double?)null) ?? (object)DBNull.Value);
                statsCmd.Parameters.AddWithValue("$speed", stats.GetPropertyOrDefault("speed", (double?)null) ?? (object)DBNull.Value);
                statsCmd.Parameters.AddWithValue("$weight", stats.GetPropertyOrDefault("weight", (double?)null) ?? (object)DBNull.Value);
                await statsCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }

            if (unit.TryGetProperty("capabilities", out var caps))
            {
                var capsCmd = connection.CreateCommand();
                capsCmd.Transaction = transaction;
                capsCmd.CommandText = @"
INSERT INTO unit_capabilities (unit_id, static_line_jump, halo_haho, sprint_distance, sprint_speed, sprint_cooldown, laser_designator)
VALUES ($unitId, $static, $halo, $distance, $speed, $cooldown, $laser);";
                capsCmd.Parameters.AddWithValue("$unitId", unitId);
                capsCmd.Parameters.AddWithValue("$static", caps.GetPropertyOrDefault("staticLineJump", (bool?)null).AsSqliteBool() ?? (object)DBNull.Value);
                capsCmd.Parameters.AddWithValue("$halo", caps.GetPropertyOrDefault("haloHaho", (bool?)null).AsSqliteBool() ?? (object)DBNull.Value);
                if (caps.TryGetProperty("sprint", out var sprint))
                {
                    capsCmd.Parameters.AddWithValue("$distance", sprint.GetPropertyOrDefault("distance", (double?)null) ?? (object)DBNull.Value);
                    capsCmd.Parameters.AddWithValue("$speed", sprint.GetPropertyOrDefault("speed", (double?)null) ?? (object)DBNull.Value);
                    capsCmd.Parameters.AddWithValue("$cooldown", sprint.GetPropertyOrDefault("cooldown", (double?)null) ?? (object)DBNull.Value);
                }
                else
                {
                    capsCmd.Parameters.AddWithValue("$distance", DBNull.Value);
                    capsCmd.Parameters.AddWithValue("$speed", DBNull.Value);
                    capsCmd.Parameters.AddWithValue("$cooldown", DBNull.Value);
                }
                capsCmd.Parameters.AddWithValue("$laser", caps.GetPropertyOrDefault("laserDesignator", (bool?)null).AsSqliteBool() ?? (object)DBNull.Value);
                await capsCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }

            if (unit.TryGetProperty("grenades", out var gren))
            {
                var grenCmd = connection.CreateCommand();
                grenCmd.Transaction = transaction;
                grenCmd.CommandText = @"
INSERT INTO unit_grenades (unit_id, smoke, flash, thermite, frag, total)
VALUES ($unitId, $smoke, $flash, $thermite, $frag, $total);";
                grenCmd.Parameters.AddWithValue("$unitId", unitId);
                grenCmd.Parameters.AddWithValue("$smoke", gren.GetPropertyOrDefault("smoke", (int?)null) ?? (object)DBNull.Value);
                grenCmd.Parameters.AddWithValue("$flash", gren.GetPropertyOrDefault("flash", (int?)null) ?? (object)DBNull.Value);
                grenCmd.Parameters.AddWithValue("$thermite", gren.GetPropertyOrDefault("thermite", (int?)null) ?? (object)DBNull.Value);
                grenCmd.Parameters.AddWithValue("$frag", gren.GetPropertyOrDefault("frag", (int?)null) ?? (object)DBNull.Value);
                grenCmd.Parameters.AddWithValue("$total", gren.GetPropertyOrDefault("total", (int?)null) ?? (object)DBNull.Value);
                await grenCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }

            if (unit.TryGetProperty("guns", out var guns))
            {
                foreach (var gun in guns.EnumerateArray())
                {
                    var gunCmd = connection.CreateCommand();
                    gunCmd.Transaction = transaction;
                    gunCmd.CommandText = @"
INSERT INTO unit_guns (unit_id, name, category, caliber, barrel_length, range, dispersion, count, ammo_per_soldier, total_ammo, magazine_size, reload_speed, target_acquisition)
VALUES ($unitId, $name, $category, $caliber, $barrel, $range, $dispersion, $count, $ammoPer, $totalAmmo, $magazine, $reload, $acquisition);";
                    gunCmd.Parameters.AddWithValue("$unitId", unitId);
                    gunCmd.Parameters.AddWithValue("$name", gun.GetPropertyOrDefault("name", string.Empty));
                    gunCmd.Parameters.AddWithValue("$category", gun.GetPropertyOrDefault("category", string.Empty) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$caliber", gun.GetPropertyOrDefault("caliber", string.Empty) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$barrel", gun.GetPropertyOrDefault("barrelLength", (double?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$range", gun.GetPropertyOrDefault("range", (double?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$dispersion", gun.GetPropertyOrDefault("dispersion", (double?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$count", gun.GetPropertyOrDefault("count", (int?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$ammoPer", gun.GetPropertyOrDefault("ammoPerSoldier", (int?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$totalAmmo", gun.GetPropertyOrDefault("totalAmmo", (int?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$magazine", gun.GetPropertyOrDefault("magazineSize", (int?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$reload", gun.GetPropertyOrDefault("reloadSpeed", (double?)null) ?? (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$acquisition", gun.GetPropertyOrDefault("targetAcquisition", (double?)null) ?? (object)DBNull.Value);
                    await gunCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                    var gunRowId = await GetLastInsertRowIdAsync(connection).ConfigureAwait(false);

                    if (gun.TryGetProperty("ammoTypes", out var ammoTypes) && ammoTypes.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var ammo in ammoTypes.EnumerateArray())
                        {
                            await InsertGunAmmoAsync(connection, transaction, gunRowId, ammo).ConfigureAwait(false);
                        }
                    }

                    if (gun.TryGetProperty("fireModes", out var fireModes) && fireModes.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var fire in fireModes.EnumerateArray())
                        {
                            await InsertGunFireModeAsync(connection, transaction, gunRowId, fire).ConfigureAwait(false);
                        }
                    }
                }
            }

            if (unit.TryGetProperty("equipment", out var equipment))
            {
                foreach (var item in equipment.EnumerateArray())
                {
                    var eqCmd = connection.CreateCommand();
                    eqCmd.Transaction = transaction;
                    eqCmd.CommandText = @"
INSERT INTO unit_equipment (unit_id, name, type, description, notes, quantity)
VALUES ($unitId, $name, $type, $description, $notes, $quantity);";
                    eqCmd.Parameters.AddWithValue("$unitId", unitId);
                    eqCmd.Parameters.AddWithValue("$name", item.GetPropertyOrDefault("name", string.Empty));
                    eqCmd.Parameters.AddWithValue("$type", item.GetPropertyOrDefault("type", string.Empty) ?? (object)DBNull.Value);
                    eqCmd.Parameters.AddWithValue("$description", item.GetPropertyOrDefault("description", string.Empty) ?? (object)DBNull.Value);
                    eqCmd.Parameters.AddWithValue("$notes", item.GetPropertyOrDefault("notes", string.Empty) ?? (object)DBNull.Value);
                    eqCmd.Parameters.AddWithValue("$quantity", item.GetPropertyOrDefault("count", (int?)null) ?? (object)DBNull.Value);
                    await eqCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                }
            }

            return unitId;
        }

        private static async Task InsertFormationAsync(SqliteConnection connection, SqliteTransaction transaction, JsonElement formation)
        {
            var formationIdOverride = TryGetId(formation);
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            if (formationIdOverride.HasValue)
            {
                cmd.CommandText = @"
INSERT INTO formations (id, nation_id, name, description, image, created_at, updated_at)
VALUES ($id, $nationId, $name, $description, $image,
        COALESCE((SELECT created_at FROM formations WHERE id = $id), CURRENT_TIMESTAMP),
        CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET
    nation_id = excluded.nation_id,
    name = excluded.name,
    description = excluded.description,
    image = excluded.image,
    updated_at = CURRENT_TIMESTAMP;";
                cmd.Parameters.AddWithValue("$id", formationIdOverride.Value);
            }
            else
            {
                cmd.CommandText = @"
INSERT INTO formations (nation_id, name, description, image, created_at, updated_at)
VALUES ($nationId, $name, $description, $image, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
            }

            cmd.Parameters.AddWithValue("$nationId", formation.GetPropertyOrDefault("nationId", (int?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$name", formation.GetPropertyOrDefault("name", string.Empty));
            cmd.Parameters.AddWithValue("$description", formation.GetPropertyOrDefault("description", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$image", formation.GetPropertyOrDefault("image", string.Empty) ?? (object)DBNull.Value);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            var formationId = formationIdOverride ?? await GetLastInsertRowIdAsync(connection).ConfigureAwait(false);
            if (formation.TryGetProperty("categories", out var categories) && categories.ValueKind == JsonValueKind.Array)
            {
                var order = 0;
                foreach (var category in categories.EnumerateArray())
                {
                    var categoryId = await InsertFormationCategoryAsync(connection, transaction, formationId, category, order).ConfigureAwait(false);
                    order++;
                    if (category.TryGetProperty("units", out var units) && units.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var unitRef in units.EnumerateArray())
                        {
                            if (unitRef.ValueKind == JsonValueKind.Number && unitRef.TryGetInt64(out var unitId))
                            {
                                await InsertCategoryUnitAsync(connection, transaction, categoryId, unitId).ConfigureAwait(false);
                            }
                        }
                    }
                }
            }

            if (formation.TryGetProperty("subFormations", out var subs) && subs.ValueKind == JsonValueKind.Array)
            {
                foreach (var sub in subs.EnumerateArray())
                {
                    if (sub.ValueKind == JsonValueKind.Number && sub.TryGetInt64(out var childId))
                    {
                        await InsertFormationChildAsync(connection, transaction, formationId, childId).ConfigureAwait(false);
                    }
                }
            }
        }

        private static async Task<long> InsertFormationCategoryAsync(SqliteConnection connection, SqliteTransaction transaction, long formationId, JsonElement category, int sortOrder)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = @"
INSERT INTO formation_categories (formation_id, name, sort_order)
VALUES ($formationId, $name, $sortOrder);";
            cmd.Parameters.AddWithValue("$formationId", formationId);
            cmd.Parameters.AddWithValue("$name", category.GetPropertyOrDefault("name", string.Empty));
            cmd.Parameters.AddWithValue("$sortOrder", sortOrder);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            return await GetLastInsertRowIdAsync(connection).ConfigureAwait(false);
        }

        private static async Task InsertCategoryUnitAsync(SqliteConnection connection, SqliteTransaction transaction, long categoryId, long unitId)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = "INSERT INTO formation_category_units (category_id, unit_id) VALUES ($categoryId, $unitId);";
            cmd.Parameters.AddWithValue("$categoryId", categoryId);
            cmd.Parameters.AddWithValue("$unitId", unitId);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task InsertFormationChildAsync(SqliteConnection connection, SqliteTransaction transaction, long parentId, long childId)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = "INSERT INTO formation_children (parent_id, child_id) VALUES ($parent, $child);";
            cmd.Parameters.AddWithValue("$parent", parentId);
            cmd.Parameters.AddWithValue("$child", childId);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task<long> InsertNationAsync(SqliteConnection connection, SqliteTransaction transaction, JsonElement nation)
        {
            var nationIdOverride = TryGetId(nation);
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            if (nationIdOverride.HasValue)
            {
                cmd.CommandText = @"
INSERT INTO nations (id, name, description, image, created_at, updated_at)
VALUES ($id, $name, $description, $image,
        COALESCE((SELECT created_at FROM nations WHERE id = $id), CURRENT_TIMESTAMP),
        CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    image = excluded.image,
    updated_at = CURRENT_TIMESTAMP;";
                cmd.Parameters.AddWithValue("$id", nationIdOverride.Value);
            }
            else
            {
                cmd.CommandText = @"
INSERT INTO nations (name, description, image, created_at, updated_at)
VALUES ($name, $description, $image, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
            }

            cmd.Parameters.AddWithValue("$name", nation.GetPropertyOrDefault("name", string.Empty));
            cmd.Parameters.AddWithValue("$description", nation.GetPropertyOrDefault("description", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$image", nation.GetPropertyOrDefault("image", string.Empty) ?? (object)DBNull.Value);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            return nationIdOverride ?? await GetLastInsertRowIdAsync(connection).ConfigureAwait(false);
        }

        private static async Task InsertGunAmmoAsync(SqliteConnection connection, SqliteTransaction transaction, long gunId, JsonElement ammo)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = @"
INSERT INTO unit_gun_ammo (gun_id, name, ammo_type, ammo_per_soldier, penetration, he_deadliness, dispersion, range_mod, grain, notes, airburst, sub_count, sub_damage, sub_penetration, fps)
VALUES ($gunId, $name, $type, $ammoPer, $penetration, $he, $dispersion, $rangeMod, $grain, $notes, $airburst, $subCount, $subDamage, $subPen, $fps);";
            cmd.Parameters.AddWithValue("$gunId", gunId);
            cmd.Parameters.AddWithValue("$name", ammo.GetPropertyOrDefault("name", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$type", ammo.GetPropertyOrDefault("ammoType", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$ammoPer", ammo.GetPropertyOrDefault("ammoPerSoldier", (int?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$penetration", ammo.GetPropertyOrDefault("penetration", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$he", ammo.GetPropertyOrDefault("heDeadliness", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$dispersion", ammo.GetPropertyOrDefault("dispersion", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$rangeMod", ammo.GetPropertyOrDefault("rangeMod", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$grain", ammo.GetPropertyOrDefault("grain", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$notes", ammo.GetPropertyOrDefault("notes", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$airburst", ammo.GetPropertyOrDefault("airburst", (bool?)null).AsSqliteBool() ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$subCount", ammo.GetPropertyOrDefault("subCount", (int?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$subDamage", ammo.GetPropertyOrDefault("subDamage", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$subPen", ammo.GetPropertyOrDefault("subPenetration", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$fps", ammo.GetPropertyOrDefault("fps", (double?)null) ?? (object)DBNull.Value);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task InsertGunFireModeAsync(SqliteConnection connection, SqliteTransaction transaction, long gunId, JsonElement fire)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = @"
INSERT INTO unit_gun_fire_modes (gun_id, name, rounds, burst_duration, cooldown, ammo_ref)
VALUES ($gunId, $name, $rounds, $burst, $cooldown, $ammoRef);";
            cmd.Parameters.AddWithValue("$gunId", gunId);
            cmd.Parameters.AddWithValue("$name", fire.GetPropertyOrDefault("name", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$rounds", fire.GetPropertyOrDefault("rounds", (int?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$burst", fire.GetPropertyOrDefault("burstDuration", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$cooldown", fire.GetPropertyOrDefault("cooldown", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$ammoRef", fire.GetPropertyOrDefault("ammoRef", string.Empty) ?? (object)DBNull.Value);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task ClearUnitRelationsAsync(SqliteConnection connection, SqliteTransaction transaction, long unitId)
        {
            var clearCmd = connection.CreateCommand();
            clearCmd.Transaction = transaction;
            clearCmd.CommandText = @"
DELETE FROM unit_stats WHERE unit_id = $unitId;
DELETE FROM unit_capabilities WHERE unit_id = $unitId;
DELETE FROM unit_grenades WHERE unit_id = $unitId;
DELETE FROM unit_gun_ammo WHERE gun_id IN (SELECT id FROM unit_guns WHERE unit_id = $unitId);
DELETE FROM unit_gun_fire_modes WHERE gun_id IN (SELECT id FROM unit_guns WHERE unit_id = $unitId);
DELETE FROM unit_guns WHERE unit_id = $unitId;
DELETE FROM unit_equipment WHERE unit_id = $unitId;";
            clearCmd.Parameters.AddWithValue("$unitId", unitId);
            await clearCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task<long> GetLastInsertRowIdAsync(SqliteConnection connection)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT last_insert_rowid();";
            var scalar = await cmd.ExecuteScalarAsync().ConfigureAwait(false);
            return scalar switch
            {
                long value => value,
                int value => value,
                null => 0,
                _ => Convert.ToInt64(scalar, CultureInfo.InvariantCulture)
            };
        }

        private static long? TryGetId(JsonElement node)
        {
            if (node.TryGetProperty("id", out var idProp))
            {
                if (idProp.ValueKind == JsonValueKind.Number && idProp.TryGetInt64(out var idVal))
                {
                    return idVal;
                }

                if (idProp.ValueKind == JsonValueKind.String && long.TryParse(idProp.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
            }

            return null;
        }

        private static async Task<JsonArray> LoadUnitsAsync(SqliteConnection connection)
        {
            var units = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id, name, price, category, internal_category, tier, description, image FROM units ORDER BY id;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var unitId = reader.GetInt64(0);
                var unitNode = new JsonObject
                {
                    ["id"] = unitId,
                    ["name"] = reader["name"]?.ToString(),
                    ["price"] = reader["price"] != DBNull.Value ? (JsonNode?)JsonValue.Create(Convert.ToInt32(reader["price"])) : null,
                    ["category"] = reader["category"]?.ToString(),
                    ["internalCategory"] = reader["internal_category"]?.ToString(),
                    ["tier"] = reader["tier"]?.ToString(),
                    ["description"] = reader["description"]?.ToString(),
                    ["image"] = reader["image"]?.ToString()
                };

                var statsNode = await LoadSingleRowAsObject(connection,
                    "SELECT armor, health, squad_size, visual_range, stealth, speed, weight FROM unit_stats WHERE unit_id = $id;",
                    unitId).ConfigureAwait(false);
                if (statsNode != null) unitNode["stats"] = statsNode;

                var capsNode = await LoadCapabilitiesAsync(connection, unitId).ConfigureAwait(false);
                if (capsNode != null) unitNode["capabilities"] = capsNode;

                var grenNode = await LoadSingleRowAsObject(connection,
                    "SELECT smoke, flash, thermite, frag, total FROM unit_grenades WHERE unit_id = $id;",
                    unitId).ConfigureAwait(false);
                if (grenNode != null) unitNode["grenades"] = grenNode;

                unitNode["guns"] = await LoadGunsAsync(connection, unitId).ConfigureAwait(false);

                unitNode["equipment"] = await LoadArrayAsync(connection,
                    "SELECT name, type, description, notes, quantity FROM unit_equipment WHERE unit_id = $id ORDER BY id;",
                    unitId).ConfigureAwait(false);

                units.Add(unitNode);
            }
            return units;
        }

        private static async Task<JsonArray> LoadGunsAsync(SqliteConnection connection, long unitId)
        {
            var guns = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText =
                "SELECT id, name, category, caliber, barrel_length, range, dispersion, count, ammo_per_soldier, total_ammo, magazine_size, reload_speed, target_acquisition FROM unit_guns WHERE unit_id = $id ORDER BY id;";
            cmd.Parameters.AddWithValue("$id", unitId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var gunId = reader.GetInt64(0);
                var gun = new JsonObject
                {
                    ["id"] = gunId,
                    ["name"] = reader["name"]?.ToString(),
                    ["category"] = reader["category"]?.ToString(),
                    ["caliber"] = reader["caliber"]?.ToString(),
                    ["barrelLength"] = reader["barrel_length"] == DBNull.Value ? null : JsonValue.Create(reader["barrel_length"]),
                    ["range"] = reader["range"] == DBNull.Value ? null : JsonValue.Create(reader["range"]),
                    ["dispersion"] = reader["dispersion"] == DBNull.Value ? null : JsonValue.Create(reader["dispersion"]),
                    ["count"] = reader["count"] == DBNull.Value ? null : JsonValue.Create(reader["count"]),
                    ["ammoPerSoldier"] = reader["ammo_per_soldier"] == DBNull.Value ? null : JsonValue.Create(reader["ammo_per_soldier"]),
                    ["totalAmmo"] = reader["total_ammo"] == DBNull.Value ? null : JsonValue.Create(reader["total_ammo"]),
                    ["magazineSize"] = reader["magazine_size"] == DBNull.Value ? null : JsonValue.Create(reader["magazine_size"]),
                    ["reloadSpeed"] = reader["reload_speed"] == DBNull.Value ? null : JsonValue.Create(reader["reload_speed"]),
                    ["targetAcquisition"] = reader["target_acquisition"] == DBNull.Value ? null : JsonValue.Create(reader["target_acquisition"])
                };

                var ammo = await LoadGunAmmoAsync(connection, gunId).ConfigureAwait(false);
                if (ammo.Count > 0) gun["ammoTypes"] = ammo;
                var fireModes = await LoadGunFireModesAsync(connection, gunId).ConfigureAwait(false);
                if (fireModes.Count > 0) gun["fireModes"] = fireModes;
                guns.Add(gun);
            }
            return guns;
        }

        private static async Task<JsonArray> LoadGunAmmoAsync(SqliteConnection connection, long gunId)
        {
            var ammoArray = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText =
                "SELECT name, ammo_type, ammo_per_soldier, penetration, he_deadliness, dispersion, range_mod, grain, notes, airburst, sub_count, sub_damage, sub_penetration, fps FROM unit_gun_ammo WHERE gun_id = $id ORDER BY id;";
            cmd.Parameters.AddWithValue("$id", gunId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var ammo = new JsonObject
                {
                    ["name"] = reader["name"]?.ToString(),
                    ["ammoType"] = reader["ammo_type"]?.ToString(),
                    ["ammoPerSoldier"] = reader["ammo_per_soldier"] == DBNull.Value ? null : JsonValue.Create(reader["ammo_per_soldier"]),
                    ["penetration"] = reader["penetration"] == DBNull.Value ? null : JsonValue.Create(reader["penetration"]),
                    ["heDeadliness"] = reader["he_deadliness"] == DBNull.Value ? null : JsonValue.Create(reader["he_deadliness"]),
                    ["dispersion"] = reader["dispersion"] == DBNull.Value ? null : JsonValue.Create(reader["dispersion"]),
                    ["rangeMod"] = reader["range_mod"] == DBNull.Value ? null : JsonValue.Create(reader["range_mod"]),
                    ["grain"] = reader["grain"] == DBNull.Value ? null : JsonValue.Create(reader["grain"]),
                    ["notes"] = reader["notes"]?.ToString(),
                    ["airburst"] = reader["airburst"] == DBNull.Value ? null : JsonValue.Create(Convert.ToInt32(reader["airburst"]) == 1),
                    ["subCount"] = reader["sub_count"] == DBNull.Value ? null : JsonValue.Create(reader["sub_count"]),
                    ["subDamage"] = reader["sub_damage"] == DBNull.Value ? null : JsonValue.Create(reader["sub_damage"]),
                    ["subPenetration"] = reader["sub_penetration"] == DBNull.Value ? null : JsonValue.Create(reader["sub_penetration"]),
                    ["fps"] = reader["fps"] == DBNull.Value ? null : JsonValue.Create(reader["fps"])
                };
                ammoArray.Add(ammo);
            }

            return ammoArray;
        }

        private static async Task<JsonArray> LoadGunFireModesAsync(SqliteConnection connection, long gunId)
        {
            var fireArray = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText =
                "SELECT name, rounds, burst_duration, cooldown, ammo_ref FROM unit_gun_fire_modes WHERE gun_id = $id ORDER BY id;";
            cmd.Parameters.AddWithValue("$id", gunId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var fire = new JsonObject
                {
                    ["name"] = reader["name"]?.ToString(),
                    ["rounds"] = reader["rounds"] == DBNull.Value ? null : JsonValue.Create(reader["rounds"]),
                    ["burstDuration"] = reader["burst_duration"] == DBNull.Value ? null : JsonValue.Create(reader["burst_duration"]),
                    ["cooldown"] = reader["cooldown"] == DBNull.Value ? null : JsonValue.Create(reader["cooldown"]),
                    ["ammoRef"] = reader["ammo_ref"]?.ToString()
                };
                fireArray.Add(fire);
            }

            return fireArray;
        }

        private static async Task<JsonArray> LoadFormationsAsync(SqliteConnection connection)
        {
            var formations = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id, nation_id, name, description, image FROM formations ORDER BY id;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var formationId = reader.GetInt64(0);
                var formation = new JsonObject
                {
                    ["id"] = formationId,
                    ["nationId"] = reader["nation_id"] == DBNull.Value ? null : JsonValue.Create(Convert.ToInt32(reader["nation_id"])),
                    ["name"] = reader["name"]?.ToString(),
                    ["description"] = reader["description"]?.ToString(),
                    ["image"] = reader["image"]?.ToString()
                };

                var categories = await LoadFormationCategoriesAsync(connection, formationId).ConfigureAwait(false);
                if (categories.Count > 0) formation["categories"] = categories;

                var subFormations = await LoadFormationChildrenAsync(connection, formationId).ConfigureAwait(false);
                if (subFormations.Count > 0) formation["subFormations"] = subFormations;

                formations.Add(formation);
            }

            return formations;
        }

        private static async Task<JsonArray> LoadFormationCategoriesAsync(SqliteConnection connection, long formationId)
        {
            var categories = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id, name, sort_order FROM formation_categories WHERE formation_id = $id ORDER BY sort_order;";
            cmd.Parameters.AddWithValue("$id", formationId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var categoryId = reader.GetInt64(0);
                var category = new JsonObject
                {
                    ["id"] = categoryId,
                    ["name"] = reader["name"]?.ToString()
                };
                var units = await LoadCategoryUnitsAsync(connection, categoryId).ConfigureAwait(false);
                if (units.Count > 0) category["units"] = units;
                categories.Add(category);
            }

            return categories;
        }

        private static async Task<JsonArray> LoadCategoryUnitsAsync(SqliteConnection connection, long categoryId)
        {
            var units = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT unit_id FROM formation_category_units WHERE category_id = $id ORDER BY id;";
            cmd.Parameters.AddWithValue("$id", categoryId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var unitId = reader["unit_id"] == DBNull.Value ? (long?)null : Convert.ToInt64(reader["unit_id"]);
                if (unitId.HasValue)
                {
                    units.Add(unitId.Value);
                }
            }
            return units;
        }

        private static async Task<JsonArray> LoadFormationChildrenAsync(SqliteConnection connection, long parentId)
        {
            var array = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT child_id FROM formation_children WHERE parent_id = $id ORDER BY id;";
            cmd.Parameters.AddWithValue("$id", parentId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                array.Add(Convert.ToInt64(reader["child_id"]));
            }
            return array;
        }

        private static async Task<JsonArray> LoadNationsAsync(SqliteConnection connection)
        {
            var nations = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id, name, description, image FROM nations ORDER BY id;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var nationId = reader.GetInt64(0);
                var nation = new JsonObject
                {
                    ["id"] = nationId,
                    ["name"] = reader["name"]?.ToString(),
                    ["description"] = reader["description"]?.ToString(),
                    ["image"] = reader["image"]?.ToString()
                };
                var formationIds = await LoadFormationIdsForNationAsync(connection, nationId).ConfigureAwait(false);
                if (formationIds.Count > 0) nation["formations"] = formationIds;
                nations.Add(nation);
            }
            return nations;
        }

        private static async Task<JsonArray> LoadFormationIdsForNationAsync(SqliteConnection connection, long nationId)
        {
            var array = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id FROM formations WHERE nation_id = $nationId ORDER BY id;";
            cmd.Parameters.AddWithValue("$nationId", nationId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                array.Add(Convert.ToInt64(reader["id"]));
            }
            return array;
        }

        private static async Task<JsonArray> LoadArrayAsync(SqliteConnection connection, string sql, long unitId)
        {
            var array = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = sql;
            cmd.Parameters.AddWithValue("$id", unitId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var obj = new JsonObject();
                for (var i = 0; i < reader.FieldCount; i++)
                {
                    var name = reader.GetName(i);
                    var value = reader.GetValue(i);
                    obj[name] = value == DBNull.Value ? null : JsonValue.Create(value);
                }
                array.Add(obj);
            }
            return array;
        }

        private static async Task<JsonNode?> LoadSingleRowAsObject(SqliteConnection connection, string sql, long unitId)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = sql;
            cmd.Parameters.AddWithValue("$id", unitId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            if (!await reader.ReadAsync().ConfigureAwait(false)) return null;
            var obj = new JsonObject();
            for (var i = 0; i < reader.FieldCount; i++)
            {
                var name = reader.GetName(i);
                var value = reader.GetValue(i);
                obj[name] = value == DBNull.Value ? null : JsonValue.Create(value);
            }
            return obj;
        }

        private static async Task<JsonNode?> LoadCapabilitiesAsync(SqliteConnection connection, long unitId)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText =
                "SELECT static_line_jump, halo_haho, sprint_distance, sprint_speed, sprint_cooldown, laser_designator FROM unit_capabilities WHERE unit_id = $id;";
            cmd.Parameters.AddWithValue("$id", unitId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            if (!await reader.ReadAsync().ConfigureAwait(false)) return null;

            var caps = new JsonObject
            {
                ["staticLineJump"] = reader["static_line_jump"] == DBNull.Value ? null : JsonValue.Create(Convert.ToInt32(reader["static_line_jump"]) == 1),
                ["haloHaho"] = reader["halo_haho"] == DBNull.Value ? null : JsonValue.Create(Convert.ToInt32(reader["halo_haho"]) == 1),
                ["laserDesignator"] = reader["laser_designator"] == DBNull.Value ? null : JsonValue.Create(Convert.ToInt32(reader["laser_designator"]) == 1)
            };
            var sprint = new JsonObject
            {
                ["distance"] = reader["sprint_distance"] == DBNull.Value ? null : JsonValue.Create(reader["sprint_distance"]),
                ["speed"] = reader["sprint_speed"] == DBNull.Value ? null : JsonValue.Create(reader["sprint_speed"]),
                ["cooldown"] = reader["sprint_cooldown"] == DBNull.Value ? null : JsonValue.Create(reader["sprint_cooldown"])
            };
            caps["sprint"] = sprint;
            return caps;
        }
    }

    internal static class JsonElementExtensions
    {
        public static string? GetPropertyOrDefault(this JsonElement element, string propertyName, string? fallback)
        {
            if (element.TryGetProperty(propertyName, out var value) && value.ValueKind != JsonValueKind.Null && value.ValueKind != JsonValueKind.Undefined)
            {
                return value.GetString();
            }
            return fallback;
        }

        public static int? GetPropertyOrDefault(this JsonElement element, string propertyName, int? fallback)
        {
            if (element.TryGetProperty(propertyName, out var value))
            {
                if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var result))
                {
                    return result;
                }

                if (value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
            }

            return fallback;
        }

        public static double? GetPropertyOrDefault(this JsonElement element, string propertyName, double? fallback)
        {
            if (element.TryGetProperty(propertyName, out var value))
            {
                if (value.ValueKind == JsonValueKind.Number && value.TryGetDouble(out var result))
                {
                    return result;
                }

                if (value.ValueKind == JsonValueKind.String && double.TryParse(value.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
            }

            return fallback;
        }

        public static bool? GetPropertyOrDefault(this JsonElement element, string propertyName, bool? fallback)
        {
            if (element.TryGetProperty(propertyName, out var value))
            {
                if (value.ValueKind == JsonValueKind.True) return true;
                if (value.ValueKind == JsonValueKind.False) return false;
                if (value.ValueKind == JsonValueKind.String && bool.TryParse(value.GetString(), out var parsed)) return parsed;
            }
            return fallback;
        }

        public static int? AsSqliteBool(this bool? value) => value.HasValue ? (value.Value ? 1 : 0) : (int?)null;
    }
}
