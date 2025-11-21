using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;

namespace PhillyRTSToolkit
{
    public class DatabaseService
    {
        private const int CurrentSchemaVersion = 3;
        private readonly string _dbPath;
        private readonly string _schemaPath;
        private readonly Lazy<Task> _initializationTask;
        private readonly string _connectionString;

        public DatabaseService(string dbPath, string schemaPath)
        {
            _dbPath = dbPath;
            _schemaPath = schemaPath;
            _connectionString = new SqliteConnectionStringBuilder
            {
                DataSource = _dbPath,
                ForeignKeys = true
            }.ToString();
            _initializationTask = new Lazy<Task>(InitializeInternalAsync);
        }

        public string DatabasePath => _dbPath;

        public string SchemaPath => _schemaPath;

        public Task InitializeAsync() => _initializationTask.Value;

        private async Task InitializeInternalAsync()
        {
            var directory = Path.GetDirectoryName(_dbPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            await using var connection = await OpenConnectionAsync().ConfigureAwait(false);

            if (File.Exists(_schemaPath))
            {
                var schemaSql = await File.ReadAllTextAsync(_schemaPath, Encoding.UTF8).ConfigureAwait(false);
                await ExecuteScriptAsync(connection, schemaSql).ConfigureAwait(false);
            }

            await EnsureIdCounterSchemaAsync(connection).ConfigureAwait(false);

            await EnsureUnitSchemaAsync(connection).ConfigureAwait(false);

            await EnsureAmmoSchemaAsync(connection).ConfigureAwait(false);

            await EnsureUnitGunFireModesSchemaAsync(connection).ConfigureAwait(false);

            await EnsureFireTemplateSchemaAsync(connection).ConfigureAwait(false);

            await EnsureArmorySchemaAsync(connection).ConfigureAwait(false);

            await EnsureFormationSchemaAsync(connection).ConfigureAwait(false);

            await EnsureSettingsSchemaAsync(connection).ConfigureAwait(false);

            await ApplyMigrationsAsync(connection).ConfigureAwait(false);
        }

        private static async Task ExecuteScriptAsync(SqliteConnection connection, string script)
        {
            foreach (var statement in SplitSqlStatements(script))
            {
                await using var command = connection.CreateCommand();
                command.CommandText = statement;
                await command.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private static IEnumerable<string> SplitSqlStatements(string script)
        {
            var builder = new StringBuilder();
            var inSingleQuote = false;
            var inDoubleQuote = false;
            var inLineComment = false;
            var inBlockComment = false;
            var beginDepth = 0;

            for (var i = 0; i < script.Length; i++)
            {
                var current = script[i];
                var next = i + 1 < script.Length ? script[i + 1] : '\0';

                if (inLineComment)
                {
                    builder.Append(current);
                    if (current == '\n')
                    {
                        inLineComment = false;
                    }
                    continue;
                }

                if (inBlockComment)
                {
                    builder.Append(current);
                    if (current == '*' && next == '/')
                    {
                        builder.Append(next);
                        i++;
                        inBlockComment = false;
                    }
                    continue;
                }

                if (!inSingleQuote && !inDoubleQuote)
                {
                    if (current == '-' && next == '-')
                    {
                        builder.Append(current);
                        builder.Append(next);
                        i++;
                        inLineComment = true;
                        continue;
                    }

                    if (current == '/' && next == '*')
                    {
                        builder.Append(current);
                        builder.Append(next);
                        i++;
                        inBlockComment = true;
                        continue;
                    }

                    if (IsKeywordAt(script, i, "BEGIN"))
                    {
                        beginDepth++;
                    }
                    else if (IsKeywordAt(script, i, "END") && beginDepth > 0)
                    {
                        beginDepth--;
                    }
                }

                if (current == '\'' && !inDoubleQuote)
                {
                    inSingleQuote = !inSingleQuote;
                }
                else if (current == '"' && !inSingleQuote)
                {
                    inDoubleQuote = !inDoubleQuote;
                }

                if (current == ';' && !inSingleQuote && !inDoubleQuote && beginDepth == 0)
                {
                    var statement = builder.ToString().Trim();
                    if (!string.IsNullOrEmpty(statement))
                    {
                        yield return statement + ";";
                    }
                    builder.Clear();
                    continue;
                }

                builder.Append(current);
            }

            var remainder = builder.ToString().Trim();
            if (!string.IsNullOrEmpty(remainder))
            {
                yield return remainder;
            }
        }

        private static bool IsKeywordAt(string script, int index, string keyword)
        {
            if (index < 0 || index + keyword.Length > script.Length)
            {
                return false;
            }

            if (!string.Equals(script.Substring(index, keyword.Length), keyword, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var hasPrefix = index > 0 && char.IsLetterOrDigit(script[index - 1]);
            var hasSuffix = index + keyword.Length < script.Length && char.IsLetterOrDigit(script[index + keyword.Length]);
            return !hasPrefix && !hasSuffix;
        }

        private static async Task EnsureIdCounterSchemaAsync(SqliteConnection connection)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "CREATE TABLE IF NOT EXISTS id_counters (scope TEXT PRIMARY KEY, next_id INTEGER NOT NULL);";
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task EnsureAmmoSchemaAsync(SqliteConnection connection)
        {
            var existingColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var checkCmd = connection.CreateCommand();
            checkCmd.CommandText = "PRAGMA table_info(ammo_templates);";
            await using var reader = await checkCmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                existingColumns.Add(reader.GetString(1));
            }

            var requiredColumns = new (string Name, string Definition)[]
            {
                ("caliber_desc", "TEXT"),
                ("ammo_type", "TEXT"),
                ("ammo_per_soldier", "REAL"),
                ("penetration", "REAL"),
                ("he_deadliness", "REAL"),
                ("dispersion", "REAL"),
                ("range_mod", "REAL"),
                ("grain", "REAL"),
                ("notes", "TEXT"),
                ("airburst", "INTEGER"),
                ("metadata", "TEXT"),
                ("sub_count", "REAL"),
                ("sub_damage", "REAL"),
                ("sub_penetration", "REAL"),
                ("fps", "REAL"),
                ("payload", "TEXT")
            };

            foreach (var column in requiredColumns)
            {
                if (existingColumns.Contains(column.Name)) continue;
                var alterCmd = connection.CreateCommand();
                alterCmd.CommandText = $"ALTER TABLE ammo_templates ADD COLUMN {column.Name} {column.Definition};";
                await alterCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private static async Task EnsureFireTemplateSchemaAsync(SqliteConnection connection)
        {
            var checkCmd = connection.CreateCommand();
            checkCmd.CommandText = "CREATE TABLE IF NOT EXISTS fire_mode_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, rounds REAL, min_range REAL, max_range REAL, cooldown REAL, ammo_ref TEXT, notes TEXT, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);";
            await checkCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "fire_mode_templates", new (string Name, string Definition)[]
            {
                ("min_range", "REAL"),
                ("max_range", "REAL")
            }).ConfigureAwait(false);
        }

        private static Task EnsureUnitGunFireModesSchemaAsync(SqliteConnection connection)
        {
            return EnsureColumnsAsync(connection, "unit_gun_fire_modes", new (string Name, string Definition)[]
            {
                ("min_range", "REAL"),
                ("max_range", "REAL")
            });
        }

        private static async Task EnsureArmorySchemaAsync(SqliteConnection connection)
        {
            var (hasMetadataColumn, hasPayloadColumn) = await GetWeaponColumnStateAsync(connection).ConfigureAwait(false);

            if (!hasMetadataColumn)
            {
                var alterCmd = connection.CreateCommand();
                alterCmd.CommandText = "ALTER TABLE weapons ADD COLUMN metadata TEXT;";
                await alterCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                hasMetadataColumn = true;
            }

            if (!hasPayloadColumn)
            {
                var alterCmd = connection.CreateCommand();
                alterCmd.CommandText = "ALTER TABLE weapons ADD COLUMN payload TEXT;";
                await alterCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                hasPayloadColumn = true;
            }

            if (hasMetadataColumn && hasPayloadColumn)
            {
                var copyMetadataCmd = connection.CreateCommand();
                copyMetadataCmd.CommandText = "UPDATE weapons SET metadata = payload WHERE (metadata IS NULL OR metadata = '') AND payload IS NOT NULL AND payload <> '';";
                await copyMetadataCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                var copyPayloadCmd = connection.CreateCommand();
                copyPayloadCmd.CommandText = "UPDATE weapons SET payload = metadata WHERE (payload IS NULL OR payload = '') AND metadata IS NOT NULL AND metadata <> '';";
                await copyPayloadCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private static async Task EnsureFormationSchemaAsync(SqliteConnection connection)
        {
            await EnsureColumnsAsync(connection, "formations", new (string Name, string Definition)[]
            {
                ("role", "TEXT"),
                ("hq_location", "TEXT"),
                ("commander", "TEXT"),
                ("readiness", "TEXT"),
                ("strength_summary", "TEXT"),
                ("support_assets", "TEXT"),
                ("communications", "TEXT")
            }).ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "formation_children", new (string Name, string Definition)[]
            {
                ("assignment", "TEXT"),
                ("strength", "TEXT"),
                ("notes", "TEXT"),
                ("readiness", "TEXT")
            }).ConfigureAwait(false);
        }

        private static async Task EnsureSettingsSchemaAsync(SqliteConnection connection)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = @"
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);";
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private async Task ApplyMigrationsAsync(SqliteConnection connection)
        {
            var currentVersion = await GetCurrentSchemaVersionAsync(connection).ConfigureAwait(false);
            if (currentVersion >= CurrentSchemaVersion)
            {
                return;
            }

            while (currentVersion < CurrentSchemaVersion)
            {
                var nextVersion = currentVersion + 1;
                await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
                var sqliteTransaction = (SqliteTransaction)transaction;
                switch (nextVersion)
                {
                    case 2:
                        await ApplyMigration2Async(connection, sqliteTransaction).ConfigureAwait(false);
                        break;
                    case 3:
                        await ApplyMigration3Async(connection, sqliteTransaction).ConfigureAwait(false);
                        break;
                    default:
                        throw new InvalidOperationException($"No migration defined for schema version {nextVersion}.");
                }

                await UpdateSchemaVersionAsync(connection, sqliteTransaction, nextVersion).ConfigureAwait(false);
                await sqliteTransaction.CommitAsync().ConfigureAwait(false);
                currentVersion = nextVersion;
            }
        }

        private static async Task<int> GetCurrentSchemaVersionAsync(SqliteConnection connection)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT version FROM schema_info WHERE id = 1;";
            var scalar = await cmd.ExecuteScalarAsync().ConfigureAwait(false);
            return scalar switch
            {
                long value => (int)value,
                int value => value,
                null => 0,
                _ => Convert.ToInt32(scalar, CultureInfo.InvariantCulture)
            };
        }

        private static async Task UpdateSchemaVersionAsync(SqliteConnection connection, SqliteTransaction transaction, int targetVersion)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = @"
INSERT INTO schema_info (id, version, applied_at)
VALUES (1, $version, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET version = excluded.version, applied_at = CURRENT_TIMESTAMP;";
            cmd.Parameters.AddWithValue("$version", targetVersion);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private async Task ApplyMigration2Async(SqliteConnection connection, SqliteTransaction transaction)
        {
            var statements = new[]
            {
                "CREATE TABLE IF NOT EXISTS id_counters (scope TEXT PRIMARY KEY, next_id INTEGER NOT NULL);",
                "CREATE INDEX IF NOT EXISTS idx_formations_nation_id ON formations(nation_id);",
                "CREATE INDEX IF NOT EXISTS idx_formation_categories_formation_id ON formation_categories(formation_id);",
                "CREATE INDEX IF NOT EXISTS idx_formation_category_units_category_id ON formation_category_units(category_id);",
                "CREATE INDEX IF NOT EXISTS idx_formation_category_units_unit_id ON formation_category_units(unit_id);",
                "CREATE INDEX IF NOT EXISTS idx_formation_children_parent_id ON formation_children(parent_id);",
                "CREATE INDEX IF NOT EXISTS idx_formation_children_child_id ON formation_children(child_id);",
                "CREATE INDEX IF NOT EXISTS idx_unit_guns_unit_id ON unit_guns(unit_id);",
                "CREATE INDEX IF NOT EXISTS idx_unit_gun_ammo_gun_id ON unit_gun_ammo(gun_id);",
                "CREATE INDEX IF NOT EXISTS idx_unit_gun_fire_modes_gun_id ON unit_gun_fire_modes(gun_id);",
                "CREATE INDEX IF NOT EXISTS idx_unit_equipment_unit_id ON unit_equipment(unit_id);"
            };

            foreach (var statement in statements)
            {
                var cmd = connection.CreateCommand();
                cmd.Transaction = transaction;
                cmd.CommandText = statement;
                await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }

            await SeedCounterIfMissingAsync(connection, transaction, "units", "units").ConfigureAwait(false);
            await SeedCounterIfMissingAsync(connection, transaction, "formations", "formations").ConfigureAwait(false);
            await SeedCounterIfMissingAsync(connection, transaction, "nations", "nations").ConfigureAwait(false);
        }

        private static async Task ApplyMigration3Async(SqliteConnection connection, SqliteTransaction transaction)
        {
            var statements = new[]
            {
                @"CREATE TRIGGER IF NOT EXISTS trg_prevent_delete_nation_with_formations
BEFORE DELETE ON nations
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM formations WHERE nation_id = OLD.id)
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete nation while formations are still assigned.');
END;",
                @"CREATE TRIGGER IF NOT EXISTS trg_prevent_delete_formation_with_links
BEFORE DELETE ON formations
FOR EACH ROW
WHEN OLD.nation_id IS NOT NULL
   OR EXISTS (SELECT 1 FROM formation_children WHERE parent_id = OLD.id)
   OR EXISTS (SELECT 1 FROM formation_children WHERE child_id = OLD.id)
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete formation while it maintains nation or sub-formation links.');
END;"
            };

            foreach (var statement in statements)
            {
                var cmd = connection.CreateCommand();
                cmd.Transaction = transaction;
                cmd.CommandText = statement;
                await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private static async Task SeedCounterIfMissingAsync(SqliteConnection connection, SqliteTransaction transaction, string scope, string sourceTable)
        {
            var existsCmd = connection.CreateCommand();
            existsCmd.Transaction = transaction;
            existsCmd.CommandText = "SELECT 1 FROM id_counters WHERE scope = $scope LIMIT 1;";
            existsCmd.Parameters.AddWithValue("$scope", scope);
            var exists = await existsCmd.ExecuteScalarAsync().ConfigureAwait(false);
            if (exists is not null && exists is not DBNull)
            {
                return;
            }

            var seedCmd = connection.CreateCommand();
            seedCmd.Transaction = transaction;
            seedCmd.CommandText = $"INSERT INTO id_counters (scope, next_id) SELECT $scope, IFNULL(MAX(id), 0) + 1 FROM {sourceTable};";
            seedCmd.Parameters.AddWithValue("$scope", scope);
            await seedCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task EnsureUnitSchemaAsync(SqliteConnection connection)
        {
            await EnsureColumnsAsync(connection, "units", new (string Name, string Definition)[]
            {
                ("price", "INTEGER"),
                ("category", "TEXT"),
                ("internal_category", "TEXT"),
                ("tier", "TEXT"),
                ("description", "TEXT"),
                ("image", "TEXT"),
                ("created_at", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP"),
                ("updated_at", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP")
            }).ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "unit_stats", new (string Name, string Definition)[]
            {
                ("armor", "REAL"),
                ("health", "REAL"),
                ("squad_size", "REAL"),
                ("visual_range", "REAL"),
                ("stealth", "REAL"),
                ("speed", "REAL"),
                ("weight", "REAL")
            }).ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "unit_capabilities", new (string Name, string Definition)[]
            {
                ("static_line_jump", "INTEGER"),
                ("halo_haho", "INTEGER"),
                ("sprint_distance", "REAL"),
                ("sprint_speed", "REAL"),
                ("sprint_cooldown", "REAL"),
                ("laser_designator", "INTEGER")
            }).ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "unit_grenades", new (string Name, string Definition)[]
            {
                ("smoke", "INTEGER"),
                ("flash", "INTEGER"),
                ("thermite", "INTEGER"),
                ("frag", "INTEGER"),
                ("total", "INTEGER")
            }).ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "unit_guns", new (string Name, string Definition)[]
            {
                ("name", "TEXT"),
                ("category", "TEXT"),
                ("caliber", "TEXT"),
                ("barrel_length", "REAL"),
                ("range", "REAL"),
                ("dispersion", "REAL"),
                ("count", "INTEGER"),
                ("ammo_per_soldier", "INTEGER"),
                ("total_ammo", "INTEGER"),
                ("magazine_size", "INTEGER"),
                ("reload_speed", "REAL"),
                ("target_acquisition", "REAL"),
                ("trajectories", "TEXT"),
                ("traits", "TEXT")
            }).ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "unit_gun_ammo", new (string Name, string Definition)[]
            {
                ("name", "TEXT"),
                ("ammo_type", "TEXT"),
                ("ammo_per_soldier", "INTEGER"),
                ("penetration", "REAL"),
                ("he_deadliness", "REAL"),
                ("dispersion", "REAL"),
                ("range_mod", "REAL"),
                ("grain", "REAL"),
                ("notes", "TEXT"),
                ("airburst", "INTEGER"),
                ("sub_count", "INTEGER"),
                ("sub_damage", "REAL"),
                ("sub_penetration", "REAL"),
                ("fps", "REAL")
            }).ConfigureAwait(false);

            await EnsureColumnsAsync(connection, "unit_equipment", new (string Name, string Definition)[]
            {
                ("name", "TEXT"),
                ("type", "TEXT"),
                ("description", "TEXT"),
                ("notes", "TEXT"),
                ("quantity", "INTEGER")
            }).ConfigureAwait(false);
        }

        private static async Task EnsureColumnsAsync(SqliteConnection connection, string tableName, (string Name, string Definition)[] columns)
        {
            var existingColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var checkCmd = connection.CreateCommand();
            checkCmd.CommandText = $"PRAGMA table_info({tableName});";
            await using (var reader = await checkCmd.ExecuteReaderAsync().ConfigureAwait(false))
            {
                while (await reader.ReadAsync().ConfigureAwait(false))
                {
                    existingColumns.Add(reader.GetString(1));
                }
            }

            foreach (var column in columns)
            {
                if (existingColumns.Contains(column.Name)) continue;
                var alterCmd = connection.CreateCommand();
                alterCmd.CommandText = $"ALTER TABLE {tableName} ADD COLUMN {column.Name} {column.Definition};";
                await alterCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private static async Task<(bool hasMetadataColumn, bool hasPayloadColumn)> GetWeaponColumnStateAsync(SqliteConnection connection)
        {
            var hasMetadataColumn = false;
            var hasPayloadColumn = false;
            var checkCmd = connection.CreateCommand();
            checkCmd.CommandText = "PRAGMA table_info(weapons);";
            await using var reader = await checkCmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var columnName = reader.GetString(1);
                if (string.Equals(columnName, "metadata", StringComparison.OrdinalIgnoreCase))
                {
                    hasMetadataColumn = true;
                }
                else if (string.Equals(columnName, "payload", StringComparison.OrdinalIgnoreCase))
                {
                    hasPayloadColumn = true;
                }
            }

            return (hasMetadataColumn, hasPayloadColumn);
        }

        public async Task<string?> LoadAppStateAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT payload FROM app_state WHERE id = 1;";
            var result = await command.ExecuteScalarAsync().ConfigureAwait(false);
            return result?.ToString();
        }

        public async Task SaveAppStateAsync(string payload)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await SaveAppStateInternalAsync(connection, sqliteTransaction, payload).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private static async Task SaveAppStateInternalAsync(SqliteConnection connection, SqliteTransaction transaction, string payload)
        {
            await using var command = connection.CreateCommand();
            command.Transaction = transaction;
            command.CommandText = @"
INSERT INTO app_state (id, payload, updated_at)
VALUES (1, $payload, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at;";
            command.Parameters.AddWithValue("$payload", payload);
            await command.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        public async Task<Dictionary<string, long>> GetTableCountsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);

            var tables = new[]
            {
                "units",
                "unit_stats",
                "unit_capabilities",
                "unit_grenades",
                "unit_equipment",
                "unit_guns",
                "unit_gun_ammo",
                "formations",
                "formation_children",
                "nations",
                "weapons",
                "ammo_templates",
                "fire_mode_templates",
                "weapon_tags",
                "app_state"
            };

            var result = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
            foreach (var table in tables)
            {
                try
                {
                    await using var command = connection.CreateCommand();
                    command.CommandText = $"SELECT COUNT(*) FROM {table};";
                    var scalar = await command.ExecuteScalarAsync().ConfigureAwait(false);
                    if (scalar is long longValue)
                    {
                        result[table] = longValue;
                    }
                    else if (scalar is int intValue)
                    {
                        result[table] = intValue;
                    }
                    else if (scalar is null || scalar is DBNull)
                    {
                        result[table] = 0;
                    }
                    else if (scalar is string s && long.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
                    {
                        result[table] = parsed;
                    }
                    else
                    {
                        result[table] = Convert.ToInt64(scalar, CultureInfo.InvariantCulture);
                    }
                }
                catch
                {
                    result[table] = -1;
                }
            }

            return result;
        }

        public async Task<DateTimeOffset?> GetAppStateUpdatedAtAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT updated_at FROM app_state WHERE id = 1;";
            var scalar = await command.ExecuteScalarAsync().ConfigureAwait(false);
            if (scalar is null || scalar is DBNull)
            {
                return null;
            }

            if (scalar is DateTime dt)
            {
                return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
            }

            if (scalar is DateTimeOffset dto)
            {
                return dto.ToUniversalTime();
            }

            if (scalar is string raw && DateTimeOffset.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed))
            {
                return parsed.ToUniversalTime();
            }

            if (DateTimeOffset.TryParse(Convert.ToString(scalar, CultureInfo.InvariantCulture), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var fallback))
            {
                return fallback.ToUniversalTime();
            }

            return null;
        }

        public async Task SaveStructuredDataAsync(JsonElement payload)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await SaveStructuredDataInternalAsync(connection, sqliteTransaction, payload).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task SaveStructuredDataInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonElement payload)
        {
            if (payload.TryGetProperty("data", out var data))
            {
                if (data.TryGetProperty("units", out var units))
                {
                    await RewriteUnitsInternalAsync(connection, sqliteTransaction, units).ConfigureAwait(false);
                }

                if (data.TryGetProperty("formations", out var formations))
                {
                    await RewriteFormationsInternalAsync(connection, sqliteTransaction, formations).ConfigureAwait(false);
                }

                if (data.TryGetProperty("nations", out var nations))
                {
                    await RewriteNationsInternalAsync(connection, sqliteTransaction, nations).ConfigureAwait(false);
                }
            }

            if (payload.TryGetProperty("weapons", out var weapons))
            {
                var weaponsNode = JsonNode.Parse(weapons.GetRawText());
                await RewriteWeaponsInternalAsync(connection, sqliteTransaction, weaponsNode).ConfigureAwait(false);
            }

            if (payload.TryGetProperty("ammo", out var ammo))
            {
                var ammoNode = JsonNode.Parse(ammo.GetRawText());
                await RewriteAmmoTemplatesInternalAsync(connection, sqliteTransaction, ammoNode).ConfigureAwait(false);
            }

            if (payload.TryGetProperty("fireModes", out var fireModes))
            {
                var fireNode = JsonNode.Parse(fireModes.GetRawText());
                await RewriteFireModeTemplatesInternalAsync(connection, sqliteTransaction, fireNode).ConfigureAwait(false);
            }

            if (payload.TryGetProperty("weaponTags", out var tags))
            {
                var tagsNode = JsonNode.Parse(tags.GetRawText());
                await RewriteWeaponTagsInternalAsync(connection, sqliteTransaction, tagsNode).ConfigureAwait(false);
            }

            if (payload.TryGetProperty("settings", out var settings))
            {
                var settingsNode = JsonNode.Parse(settings.GetRawText());
                await RewriteSettingsInternalAsync(connection, sqliteTransaction, settingsNode).ConfigureAwait(false);
            }
        }

        public async Task EnsureStableIdentifiersAsync(JsonNode payloadNode)
        {
            if (payloadNode is null) return;
            if (payloadNode["data"] is not JsonObject dataNode) return;

            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await EnsureIdentifierArrayAsync(connection, sqliteTransaction, dataNode["units"], "units", "units").ConfigureAwait(false);
            await EnsureIdentifierArrayAsync(connection, sqliteTransaction, dataNode["formations"], "formations", "formations").ConfigureAwait(false);
            await EnsureIdentifierArrayAsync(connection, sqliteTransaction, dataNode["nations"], "nations", "nations").ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        public async Task PersistPayloadGraphAsync(JsonElement payload)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            var payloadJson = payload.GetRawText();
            await SaveAppStateInternalAsync(connection, sqliteTransaction, payloadJson).ConfigureAwait(false);
            await SaveStructuredDataInternalAsync(connection, sqliteTransaction, payload).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        public async Task<JsonNode?> LoadStructuredDataAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);

            var unitsArray = await LoadUnitsAsync(connection).ConfigureAwait(false);
            var formationsArray = await LoadFormationsAsync(connection).ConfigureAwait(false);
            var nationsArray = await LoadNationsAsync(connection).ConfigureAwait(false);
            var weaponsArray = await LoadWeaponsAsync(connection).ConfigureAwait(false);
            var ammoArray = await LoadAmmoTemplatesAsync(connection).ConfigureAwait(false);
            var fireArray = await LoadFireModeTemplatesAsync(connection).ConfigureAwait(false);
            var tagObject = await LoadWeaponTagsAsync(connection).ConfigureAwait(false);
            var settingsObject = await LoadSettingsAsync(connection).ConfigureAwait(false);

            var dataNode = new JsonObject();
            if (unitsArray.Count > 0) dataNode["units"] = unitsArray;
            if (formationsArray.Count > 0) dataNode["formations"] = formationsArray;
            if (nationsArray.Count > 0) dataNode["nations"] = nationsArray;
            var rootNode = new JsonObject();
            if (dataNode.Count > 0) rootNode["data"] = dataNode;
            if (weaponsArray.Count > 0) rootNode["weapons"] = weaponsArray;
            if (ammoArray.Count > 0) rootNode["ammo"] = ammoArray;
            if (fireArray.Count > 0) rootNode["fireModes"] = fireArray;
            if (tagObject.Count > 0) rootNode["weaponTags"] = tagObject;
            if (settingsObject.Count > 0) rootNode["settings"] = settingsObject;
            return rootNode.Count == 0 ? null : rootNode;
        }

        public async Task<JsonArray> GetUnitsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadUnitsAsync(connection).ConfigureAwait(false);
        }

        public async Task SaveUnitAsync(JsonElement unitElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
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
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadFormationsAsync(connection).ConfigureAwait(false);
        }

        public async Task<JsonArray> GetNationsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadNationsAsync(connection).ConfigureAwait(false);
        }

        public async Task<JsonArray> GetWeaponsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadWeaponsAsync(connection).ConfigureAwait(false);
        }

        public async Task SaveWeaponsAsync(JsonElement weaponsElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            var node = JsonNode.Parse(weaponsElement.GetRawText());
            await RewriteWeaponsAsync(node).ConfigureAwait(false);
        }

        public async Task<JsonArray> GetAmmoTemplatesAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadAmmoTemplatesAsync(connection).ConfigureAwait(false);
        }

        public async Task SaveAmmoTemplatesAsync(JsonElement ammoElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            var node = JsonNode.Parse(ammoElement.GetRawText());
            await RewriteAmmoTemplatesAsync(node).ConfigureAwait(false);
        }

        public async Task<JsonArray> GetFireModeTemplatesAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadFireModeTemplatesAsync(connection).ConfigureAwait(false);
        }

        public async Task SaveFireModeTemplatesAsync(JsonElement fireElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            var node = JsonNode.Parse(fireElement.GetRawText());
            await RewriteFireModeTemplatesAsync(node).ConfigureAwait(false);
        }

        public async Task<JsonObject> GetWeaponTagsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadWeaponTagsAsync(connection).ConfigureAwait(false);
        }

        public async Task SaveWeaponTagsAsync(JsonElement tagsElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            var node = JsonNode.Parse(tagsElement.GetRawText());
            await RewriteWeaponTagsAsync(node).ConfigureAwait(false);
        }

        public async Task<JsonObject> GetSettingsAsync()
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return await LoadSettingsAsync(connection).ConfigureAwait(false);
        }

        public async Task SaveSettingsAsync(JsonElement settingsElement)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            var settingsNode = JsonNode.Parse(settingsElement.GetRawText());
            await RewriteSettingsInternalAsync(connection, sqliteTransaction, settingsNode).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        public async Task DeleteUnitAsync(long unitId)
        {
            await InitializeAsync().ConfigureAwait(false);
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await ClearUnitRelationsAsync(connection, sqliteTransaction, unitId).ConfigureAwait(false);

            await using var command = connection.CreateCommand();
            command.Transaction = sqliteTransaction;
            command.CommandText = "DELETE FROM units WHERE id = $id;";
            command.Parameters.AddWithValue("$id", unitId);
            await command.ExecuteNonQueryAsync().ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteUnitsAsync(JsonElement unitsElement)
        {
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await RewriteUnitsInternalAsync(connection, sqliteTransaction, unitsElement).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteUnitsInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonElement unitsElement)
        {
            var seenUnitIds = new HashSet<long>();
            foreach (var unit in unitsElement.EnumerateArray())
            {
                var explicitId = TryGetId(unit);
                var unitId = await PersistUnitGraphAsync(connection, sqliteTransaction, unit, explicitId, true).ConfigureAwait(false);
                seenUnitIds.Add(unitId);
            }

            await DeleteMissingRootsAsync(connection, sqliteTransaction, "units", "temp_keep_units", seenUnitIds).ConfigureAwait(false);
        }

        private async Task RewriteFormationsAsync(JsonElement formationsElement)
        {
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await RewriteFormationsInternalAsync(connection, sqliteTransaction, formationsElement).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteFormationsInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonElement formationsElement)
        {
            var existingFormationIds = await LoadExistingRootIdsAsync(connection, "formations").ConfigureAwait(false);
            var seenFormationIds = new HashSet<long>();
            foreach (var formation in formationsElement.EnumerateArray())
            {
                var formationId = await PersistFormationAsync(connection, sqliteTransaction, formation).ConfigureAwait(false);
                seenFormationIds.Add(formationId);
            }

            var idsToDelete = existingFormationIds.Except(seenFormationIds).ToList();
            await GuardFormationDeletionsAsync(connection, sqliteTransaction, idsToDelete).ConfigureAwait(false);
            await DeleteMissingRootsAsync(connection, sqliteTransaction, "formations", "temp_keep_formations", seenFormationIds).ConfigureAwait(false);
        }

        private async Task RewriteNationsAsync(JsonElement nationsElement)
        {
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await RewriteNationsInternalAsync(connection, sqliteTransaction, nationsElement).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteNationsInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonElement nationsElement)
        {
            var existingNationIds = await LoadExistingRootIdsAsync(connection, "nations").ConfigureAwait(false);
            var seenNationIds = new HashSet<long>();
            foreach (var nation in nationsElement.EnumerateArray())
            {
                var nationId = await InsertNationAsync(connection, sqliteTransaction, nation).ConfigureAwait(false);
                seenNationIds.Add(nationId);

                if (nation.TryGetProperty("formations", out var formations) && formations.ValueKind == JsonValueKind.Array)
                {
                    await ApplyNationFormationMembershipAsync(connection, sqliteTransaction, nationId, formations).ConfigureAwait(false);
                }
                else
                {
                    await ClearNationFormationMembershipAsync(connection, sqliteTransaction, nationId).ConfigureAwait(false);
                }
            }

            var nationIdsToDelete = existingNationIds.Except(seenNationIds).ToList();
            await GuardNationDeletionsAsync(connection, sqliteTransaction, nationIdsToDelete).ConfigureAwait(false);
            await DeleteMissingRootsAsync(connection, sqliteTransaction, "nations", "temp_keep_nations", seenNationIds).ConfigureAwait(false);
        }

        private async Task RewriteWeaponsAsync(JsonNode? weaponsNode)
        {
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await RewriteWeaponsInternalAsync(connection, sqliteTransaction, weaponsNode).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteWeaponsInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonNode? weaponsNode)
        {
            var normalized = PayloadNormalization.NormalizeWeaponCollection(weaponsNode);

            var deleteCmd = connection.CreateCommand();
            deleteCmd.Transaction = sqliteTransaction;
            deleteCmd.CommandText = "DELETE FROM weapons;";
            await deleteCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var entry in normalized)
            {
                if (entry is not JsonObject weaponObj) continue;
                var weaponName = weaponObj.TryGetPropertyValue("name", out var nameNode) ? nameNode?.ToString() : null;
                if (string.IsNullOrWhiteSpace(weaponName)) continue;

                var payload = weaponObj.ToJsonString();
                var insertCmd = connection.CreateCommand();
                insertCmd.Transaction = sqliteTransaction;
                insertCmd.CommandText = @"
INSERT INTO weapons (name, category, caliber, range, muzzle_velocity, dispersion, barrel_length, reload_speed, metadata, payload)
VALUES ($name, $category, $caliber, $range, $muzzle, $dispersion, $barrel, $reload, $metadata, $payload);";
                insertCmd.Parameters.AddWithValue("$name", weaponName);
                insertCmd.Parameters.AddWithValue("$category", ToDbValue(weaponObj["category"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$caliber", ToDbValue(weaponObj["caliber"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$range", ToNullableDouble(weaponObj["range"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$muzzle", ToNullableDouble(weaponObj["muzzleVelocity"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$dispersion", ToNullableDouble(weaponObj["dispersion"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$barrel", ToNullableDouble(weaponObj["barrelLength"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$reload", ToNullableDouble(weaponObj["reloadSpeed"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$metadata", payload);
                insertCmd.Parameters.AddWithValue("$payload", payload);
                await insertCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private async Task RewriteAmmoTemplatesAsync(JsonNode? ammoNode)
        {
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await RewriteAmmoTemplatesInternalAsync(connection, sqliteTransaction, ammoNode).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteAmmoTemplatesInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonNode? ammoNode)
        {
            var normalized = PayloadNormalization.NormalizeAmmoCollection(ammoNode);

            var deleteCmd = connection.CreateCommand();
            deleteCmd.Transaction = sqliteTransaction;
            deleteCmd.CommandText = "DELETE FROM ammo_templates;";
            await deleteCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var entry in normalized)
            {
                if (entry is not JsonObject ammoObj) continue;
                var ammoName = ammoObj.TryGetPropertyValue("name", out var nameNode) ? nameNode?.ToString() : null;
                var caliber = ammoObj.TryGetPropertyValue("caliber", out var caliberNode) ? caliberNode?.ToString() : null;
                if (string.IsNullOrWhiteSpace(ammoName) || string.IsNullOrWhiteSpace(caliber)) continue;

                var payload = ammoObj.ToJsonString();
                var insertCmd = connection.CreateCommand();
                insertCmd.Transaction = sqliteTransaction;
                insertCmd.CommandText = @"
INSERT INTO ammo_templates (
    name,
    caliber,
    caliber_desc,
    ammo_type,
    ammo_per_soldier,
    penetration,
    he_deadliness,
    dispersion,
    range_mod,
    grain,
    notes,
    airburst,
    metadata,
    sub_count,
    sub_damage,
    sub_penetration,
    fps,
    payload)
VALUES (
    $name,
    $caliber,
    $caliberDesc,
    $ammoType,
    $ammoPer,
    $penetration,
    $he,
    $dispersion,
    $rangeMod,
    $grain,
    $notes,
    $airburst,
    $metadata,
    $subCount,
    $subDamage,
    $subPenetration,
    $fps,
    $payload);";
                insertCmd.Parameters.AddWithValue("$name", ammoName);
                insertCmd.Parameters.AddWithValue("$caliber", caliber);
                insertCmd.Parameters.AddWithValue("$caliberDesc", ToDbValue(ammoObj["caliberDesc"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$ammoType", ToDbValue(ammoObj["ammoType"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$ammoPer", ToNullableDouble(ammoObj["ammoPerSoldier"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$penetration", ToNullableDouble(ammoObj["penetration"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$he", ToNullableDouble(ammoObj["heDeadliness"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$dispersion", ToNullableDouble(ammoObj["dispersion"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$rangeMod", ToNullableDouble(ammoObj["rangeMod"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$grain", ToNullableDouble(ammoObj["grain"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$notes", ToDbValue(ammoObj["notes"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$airburst", ToNullableBoolInt(ammoObj["airburst"]));
                insertCmd.Parameters.AddWithValue("$metadata", payload);
                insertCmd.Parameters.AddWithValue("$subCount", ToNullableDouble(ammoObj["subCount"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$subDamage", ToNullableDouble(ammoObj["subDamage"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$subPenetration", ToNullableDouble(ammoObj["subPenetration"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$fps", ToNullableDouble(ammoObj["fps"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$payload", payload);
                await insertCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private async Task RewriteFireModeTemplatesAsync(JsonNode? fireNode)
        {
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await RewriteFireModeTemplatesInternalAsync(connection, sqliteTransaction, fireNode).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteFireModeTemplatesInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonNode? fireNode)
        {
            var normalized = PayloadNormalization.NormalizeFireModeCollection(fireNode);

            var deleteCmd = connection.CreateCommand();
            deleteCmd.Transaction = sqliteTransaction;
            deleteCmd.CommandText = "DELETE FROM fire_mode_templates;";
            await deleteCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var entry in normalized)
            {
                if (entry is not JsonObject fireObj) continue;
                var name = fireObj.TryGetPropertyValue("name", out var nameNode) ? nameNode?.ToString() : null;
                if (string.IsNullOrWhiteSpace(name)) continue;

                var payload = fireObj.ToJsonString();
                var insertCmd = connection.CreateCommand();
                insertCmd.Transaction = sqliteTransaction;
                insertCmd.CommandText = @"
INSERT INTO fire_mode_templates (name, rounds, min_range, max_range, cooldown, ammo_ref, notes, payload)
VALUES ($name, $rounds, $minRange, $maxRange, $cooldown, $ammoRef, $notes, $payload);";
                insertCmd.Parameters.AddWithValue("$name", name);
                insertCmd.Parameters.AddWithValue("$rounds", ToNullableDouble(fireObj["rounds"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$minRange", ToNullableDouble(fireObj["minRange"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$maxRange", ToNullableDouble(fireObj["maxRange"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$cooldown", ToNullableDouble(fireObj["cooldown"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$ammoRef", ToDbValue(fireObj["ammoRef"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$notes", ToDbValue(fireObj["notes"]?.ToString()));
                insertCmd.Parameters.AddWithValue("$payload", payload);
                await insertCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private async Task RewriteWeaponTagsAsync(JsonNode? tagsNode)
        {
            await using var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
            var sqliteTransaction = (SqliteTransaction)transaction;

            await RewriteWeaponTagsInternalAsync(connection, sqliteTransaction, tagsNode).ConfigureAwait(false);

            await sqliteTransaction.CommitAsync().ConfigureAwait(false);
        }

        private async Task RewriteWeaponTagsInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonNode? tagsNode)
        {
            var normalized = PayloadNormalization.NormalizeWeaponTags(tagsNode);

            var deleteCmd = connection.CreateCommand();
            deleteCmd.Transaction = sqliteTransaction;
            deleteCmd.CommandText = "DELETE FROM weapon_tags;";
            await deleteCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var scope in new[] { "categories", "calibers" })
            {
                if (normalized[scope] is not JsonObject scopeEntries) continue;
                foreach (var kvp in scopeEntries)
                {
                    var color = kvp.Value?.ToString();
                    if (string.IsNullOrWhiteSpace(kvp.Key) || string.IsNullOrWhiteSpace(color)) continue;
                    var insertCmd = connection.CreateCommand();
                    insertCmd.Transaction = sqliteTransaction;
                    insertCmd.CommandText = "INSERT INTO weapon_tags (scope, name, color) VALUES ($scope, $name, $color);";
                    insertCmd.Parameters.AddWithValue("$scope", scope);
                    insertCmd.Parameters.AddWithValue("$name", kvp.Key);
                    insertCmd.Parameters.AddWithValue("$color", color);
                    await insertCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                }
            }
        }

        private static async Task RewriteSettingsInternalAsync(SqliteConnection connection, SqliteTransaction sqliteTransaction, JsonNode? settingsNode)
        {
            var normalized = settingsNode as JsonObject ?? new JsonObject();
            var payload = normalized.ToJsonString();
            var cmd = connection.CreateCommand();
            cmd.Transaction = sqliteTransaction;
            cmd.CommandText = @"
INSERT INTO settings (id, payload, updated_at)
VALUES (1, $payload, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP;";
            cmd.Parameters.AddWithValue("$payload", payload);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
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
INSERT INTO unit_guns (unit_id, name, category, caliber, barrel_length, range, dispersion, count, ammo_per_soldier, total_ammo, magazine_size, reload_speed, target_acquisition, trajectories, traits)
VALUES ($unitId, $name, $category, $caliber, $barrel, $range, $dispersion, $count, $ammoPer, $totalAmmo, $magazine, $reload, $acquisition, $trajectories, $traits);";
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
                    gunCmd.Parameters.AddWithValue("$trajectories", gun.TryGetProperty("trajectories", out var trajElement) && trajElement.ValueKind == JsonValueKind.Array ? trajElement.GetRawText() : (object)DBNull.Value);
                    gunCmd.Parameters.AddWithValue("$traits", gun.TryGetProperty("traits", out var traitElement) && traitElement.ValueKind == JsonValueKind.Array ? traitElement.GetRawText() : (object)DBNull.Value);
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

        private static async Task<long> PersistFormationAsync(SqliteConnection connection, SqliteTransaction transaction, JsonElement formation)
        {
            var formationIdOverride = TryGetId(formation);
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            if (formationIdOverride.HasValue)
            {
                cmd.CommandText = @"
INSERT INTO formations (id, nation_id, name, description, role, hq_location, commander, readiness, strength_summary, support_assets, communications, image, created_at, updated_at)
VALUES ($id, $nationId, $name, $description, $role, $hq, $commander, $readiness, $strengthSummary, $supportAssets, $communications, $image,
        COALESCE((SELECT created_at FROM formations WHERE id = $id), CURRENT_TIMESTAMP),
        CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET
    nation_id = excluded.nation_id,
    name = excluded.name,
    description = excluded.description,
    role = excluded.role,
    hq_location = excluded.hq_location,
    commander = excluded.commander,
    readiness = excluded.readiness,
    strength_summary = excluded.strength_summary,
    support_assets = excluded.support_assets,
    communications = excluded.communications,
    image = excluded.image,
    updated_at = CURRENT_TIMESTAMP;";
                cmd.Parameters.AddWithValue("$id", formationIdOverride.Value);
            }
            else
            {
                cmd.CommandText = @"
INSERT INTO formations (nation_id, name, description, role, hq_location, commander, readiness, strength_summary, support_assets, communications, image, created_at, updated_at)
VALUES ($nationId, $name, $description, $role, $hq, $commander, $readiness, $strengthSummary, $supportAssets, $communications, $image, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
            }

            cmd.Parameters.AddWithValue("$nationId", formation.GetPropertyOrDefault("nationId", (int?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$name", formation.GetPropertyOrDefault("name", string.Empty));
            cmd.Parameters.AddWithValue("$description", formation.GetPropertyOrDefault("description", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$role", ToDbValue(formation.GetPropertyOrDefault("role", (string?)null)));
            cmd.Parameters.AddWithValue("$hq", ToDbValue(formation.GetPropertyOrDefault("hqLocation", (string?)null)));
            cmd.Parameters.AddWithValue("$commander", ToDbValue(formation.GetPropertyOrDefault("commander", (string?)null)));
            cmd.Parameters.AddWithValue("$readiness", ToDbValue(formation.GetPropertyOrDefault("readiness", (string?)null)));
            cmd.Parameters.AddWithValue("$strengthSummary", ToDbValue(formation.GetPropertyOrDefault("strengthSummary", (string?)null)));
            cmd.Parameters.AddWithValue("$supportAssets", ToDbValue(formation.GetPropertyOrDefault("supportAssets", (string?)null)));
            cmd.Parameters.AddWithValue("$communications", ToDbValue(formation.GetPropertyOrDefault("communications", (string?)null)));
            cmd.Parameters.AddWithValue("$image", formation.GetPropertyOrDefault("image", string.Empty) ?? (object)DBNull.Value);
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            var formationId = formationIdOverride ?? await GetLastInsertRowIdAsync(connection).ConfigureAwait(false);
            await ClearFormationRelationsAsync(connection, transaction, formationId).ConfigureAwait(false);
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

            foreach (var attachment in ExtractSubFormationLinks(formation))
            {
                await InsertFormationChildAsync(connection, transaction, formationId, attachment.ChildId, attachment.Assignment, attachment.Strength, attachment.Notes, attachment.Readiness)
                    .ConfigureAwait(false);
            }

            return formationId;
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

        private static async Task InsertFormationChildAsync(SqliteConnection connection, SqliteTransaction transaction, long parentId, long childId, string? assignment, string? strength, string? notes, string? readiness)
        {
            var cmd = connection.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = "INSERT INTO formation_children (parent_id, child_id, assignment, strength, notes, readiness) VALUES ($parent, $child, $assignment, $strength, $notes, $readiness);";
            cmd.Parameters.AddWithValue("$parent", parentId);
            cmd.Parameters.AddWithValue("$child", childId);
            cmd.Parameters.AddWithValue("$assignment", ToDbValue(assignment));
            cmd.Parameters.AddWithValue("$strength", ToDbValue(strength));
            cmd.Parameters.AddWithValue("$notes", ToDbValue(notes));
            cmd.Parameters.AddWithValue("$readiness", ToDbValue(readiness));
            await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static IEnumerable<(long ChildId, string? Assignment, string? Strength, string? Notes, string? Readiness)> ExtractSubFormationLinks(JsonElement formation)
        {
            if (formation.TryGetProperty("subFormationLinks", out var linkArray) && linkArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var link in linkArray.EnumerateArray())
                {
                    var childId = link.GetPropertyOrDefault("formationId", (long?)null)
                                  ?? link.GetPropertyOrDefault("id", (long?)null)
                                  ?? link.GetPropertyOrDefault("childId", (long?)null);
                    if (!childId.HasValue) continue;
                    yield return (
                        childId.Value,
                        link.GetPropertyOrDefault("assignment", (string?)null),
                        link.GetPropertyOrDefault("strength", (string?)null),
                        link.GetPropertyOrDefault("notes", (string?)null),
                        link.GetPropertyOrDefault("readiness", (string?)null)
                    );
                }
                yield break;
            }

            if (formation.TryGetProperty("subFormations", out var legacySubs) && legacySubs.ValueKind == JsonValueKind.Array)
            {
                foreach (var sub in legacySubs.EnumerateArray())
                {
                    if (sub.ValueKind == JsonValueKind.Number && sub.TryGetInt64(out var childId))
                    {
                        yield return (childId, null, null, null, null);
                    }
                    else if (sub.ValueKind == JsonValueKind.String && long.TryParse(sub.GetString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
                    {
                        yield return (parsed, null, null, null, null);
                    }
                }
            }
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
INSERT INTO unit_gun_fire_modes (gun_id, name, rounds, min_range, max_range, cooldown, ammo_ref)
VALUES ($gunId, $name, $rounds, $minRange, $maxRange, $cooldown, $ammoRef);";
            cmd.Parameters.AddWithValue("$gunId", gunId);
            cmd.Parameters.AddWithValue("$name", fire.GetPropertyOrDefault("name", string.Empty) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$rounds", fire.GetPropertyOrDefault("rounds", (int?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$minRange", fire.GetPropertyOrDefault("minRange", (double?)null) ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("$maxRange", fire.GetPropertyOrDefault("maxRange", (double?)null) ?? (object)DBNull.Value);
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
DELETE FROM unit_equipment WHERE unit_id = $unitId;
DELETE FROM formation_category_units WHERE unit_id = $unitId;";
            clearCmd.Parameters.AddWithValue("$unitId", unitId);
            await clearCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task ClearFormationRelationsAsync(SqliteConnection connection, SqliteTransaction transaction, long formationId)
        {
            var clearCmd = connection.CreateCommand();
            clearCmd.Transaction = transaction;
            clearCmd.CommandText = @"
DELETE FROM formation_category_units WHERE category_id IN (SELECT id FROM formation_categories WHERE formation_id = $formationId);
DELETE FROM formation_categories WHERE formation_id = $formationId;
DELETE FROM formation_children WHERE parent_id = $formationId;";
            clearCmd.Parameters.AddWithValue("$formationId", formationId);
            await clearCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task DeleteMissingRootsAsync(SqliteConnection connection, SqliteTransaction transaction, string tableName, string tempTableName, IReadOnlyCollection<long> keepIds)
        {
            if (keepIds.Count == 0)
            {
                var deleteCmd = connection.CreateCommand();
                deleteCmd.Transaction = transaction;
                deleteCmd.CommandText = $"DELETE FROM {tableName};";
                await deleteCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                return;
            }

            await SeedTempIdTableAsync(connection, transaction, tempTableName, keepIds).ConfigureAwait(false);
            var pruneCmd = connection.CreateCommand();
            pruneCmd.Transaction = transaction;
            pruneCmd.CommandText = $"DELETE FROM {tableName} WHERE id NOT IN (SELECT id FROM {tempTableName});";
            await pruneCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            await DropTempTableAsync(connection, transaction, tempTableName).ConfigureAwait(false);
        }

        private static async Task<HashSet<long>> LoadExistingRootIdsAsync(SqliteConnection connection, string tableName)
        {
            var ids = new HashSet<long>();
            var cmd = connection.CreateCommand();
            cmd.CommandText = $"SELECT id FROM {tableName};";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                if (!reader.IsDBNull(0))
                {
                    ids.Add(reader.GetInt64(0));
                }
            }

            return ids;
        }

        private static async Task GuardFormationDeletionsAsync(SqliteConnection connection, SqliteTransaction transaction, IReadOnlyCollection<long> formationIds)
        {
            if (formationIds.Count == 0) return;

            await SeedTempIdTableAsync(connection, transaction, "temp_guard_formations", formationIds).ConfigureAwait(false);
            var details = new List<string>();

            try
            {
                var nationCmd = connection.CreateCommand();
                nationCmd.Transaction = transaction;
                nationCmd.CommandText = @"
SELECT f.id AS formation_id, f.name AS formation_name, n.id AS nation_id, n.name AS nation_name
FROM temp_guard_formations t
JOIN formations f ON f.id = t.id
JOIN nations n ON n.id = f.nation_id;";
                await using (var reader = await nationCmd.ExecuteReaderAsync().ConfigureAwait(false))
                {
                    while (await reader.ReadAsync().ConfigureAwait(false))
                    {
                        var formationId = reader.GetInt64(0);
                        var formationLabel = DescribeFormation(reader["formation_name"]?.ToString(), formationId);
                        var nationId = reader.GetInt64(2);
                        var nationLabel = DescribeNation(reader["nation_name"]?.ToString(), nationId);
                        details.Add($"Formation \"{formationLabel}\" is still assigned to nation \"{nationLabel}\".");
                    }
                }

                var childCmd = connection.CreateCommand();
                childCmd.Transaction = transaction;
                childCmd.CommandText = @"
SELECT child.id AS child_id, child.name AS child_name, parent.id AS parent_id, parent.name AS parent_name
FROM temp_guard_formations t
JOIN formation_children fc ON fc.child_id = t.id
JOIN formations child ON child.id = fc.child_id
JOIN formations parent ON parent.id = fc.parent_id;";
                await using (var reader = await childCmd.ExecuteReaderAsync().ConfigureAwait(false))
                {
                    while (await reader.ReadAsync().ConfigureAwait(false))
                    {
                        var childId = reader.GetInt64(0);
                        var childLabel = DescribeFormation(reader["child_name"]?.ToString(), childId);
                        var parentId = reader.GetInt64(2);
                        var parentLabel = DescribeFormation(reader["parent_name"]?.ToString(), parentId);
                        details.Add($"Formation \"{childLabel}\" is attached to parent \"{parentLabel}\".");
                    }
                }

                var parentChildren = new Dictionary<long, List<string>>();
                var parentNames = new Dictionary<long, string>();
                var parentCmd = connection.CreateCommand();
                parentCmd.Transaction = transaction;
                parentCmd.CommandText = @"
SELECT parent.id AS parent_id, parent.name AS parent_name, child.id AS child_id, child.name AS child_name
FROM temp_guard_formations t
JOIN formation_children fc ON fc.parent_id = t.id
JOIN formations parent ON parent.id = fc.parent_id
JOIN formations child ON child.id = fc.child_id;";
                await using (var reader = await parentCmd.ExecuteReaderAsync().ConfigureAwait(false))
                {
                    while (await reader.ReadAsync().ConfigureAwait(false))
                    {
                        var parentId = reader.GetInt64(0);
                        var parentLabel = DescribeFormation(reader["parent_name"]?.ToString(), parentId);
                        var childId = reader.GetInt64(2);
                        var childLabel = DescribeFormation(reader["child_name"]?.ToString(), childId);
                        if (!parentChildren.TryGetValue(parentId, out var list))
                        {
                            list = new List<string>();
                            parentChildren[parentId] = list;
                            parentNames[parentId] = parentLabel;
                        }

                        list.Add(childLabel);
                    }
                }

                foreach (var (parentId, children) in parentChildren)
                {
                    var parentLabel = parentNames.TryGetValue(parentId, out var name) ? name : $"Formation {parentId}";
                    var preview = string.Join(", ", children.Take(3));
                    if (children.Count > 3)
                    {
                        preview += ", ...";
                    }

                    details.Add($"Formation \"{parentLabel}\" still has sub-formations attached: {preview}.");
                }
            }
            finally
            {
                await DropTempTableAsync(connection, transaction, "temp_guard_formations").ConfigureAwait(false);
            }

            if (details.Count > 0)
            {
                throw new ReferentialIntegrityException("formations", "Detach formations from nations and sub-formations before deleting them.", details);
            }
        }

        private static async Task GuardNationDeletionsAsync(SqliteConnection connection, SqliteTransaction transaction, IReadOnlyCollection<long> nationIds)
        {
            if (nationIds.Count == 0) return;

            await SeedTempIdTableAsync(connection, transaction, "temp_guard_nations", nationIds).ConfigureAwait(false);
            var details = new List<string>();

            try
            {
                var nationFormations = new Dictionary<long, List<string>>();
                var nationNames = new Dictionary<long, string>();
                var cmd = connection.CreateCommand();
                cmd.Transaction = transaction;
                cmd.CommandText = @"
SELECT n.id AS nation_id, n.name AS nation_name, f.id AS formation_id, f.name AS formation_name
FROM temp_guard_nations t
JOIN nations n ON n.id = t.id
JOIN formations f ON f.nation_id = n.id;";
                await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
                while (await reader.ReadAsync().ConfigureAwait(false))
                {
                    var nationId = reader.GetInt64(0);
                    var nationLabel = DescribeNation(reader["nation_name"]?.ToString(), nationId);
                    var formationId = reader.GetInt64(2);
                    var formationLabel = DescribeFormation(reader["formation_name"]?.ToString(), formationId);
                    if (!nationFormations.TryGetValue(nationId, out var list))
                    {
                        list = new List<string>();
                        nationFormations[nationId] = list;
                        nationNames[nationId] = nationLabel;
                    }

                    list.Add(formationLabel);
                }

                foreach (var (nationId, formations) in nationFormations)
                {
                    var nationLabel = nationNames.TryGetValue(nationId, out var name) ? name : $"Nation {nationId}";
                    var preview = string.Join(", ", formations.Take(3));
                    if (formations.Count > 3)
                    {
                        preview += ", ...";
                    }

                    details.Add($"Nation \"{nationLabel}\" still references formations: {preview}.");
                }
            }
            finally
            {
                await DropTempTableAsync(connection, transaction, "temp_guard_nations").ConfigureAwait(false);
            }

            if (details.Count > 0)
            {
                throw new ReferentialIntegrityException("nations", "Detach formations from nations before deleting them.", details);
            }
        }

        private static string DescribeFormation(string? name, long id)
        {
            return string.IsNullOrWhiteSpace(name) ? $"Formation {id}" : name!;
        }

        private static string DescribeNation(string? name, long id)
        {
            return string.IsNullOrWhiteSpace(name) ? $"Nation {id}" : name!;
        }

        private static async Task SeedTempIdTableAsync(SqliteConnection connection, SqliteTransaction transaction, string tempTableName, IReadOnlyCollection<long> ids)
        {
            var initCmd = connection.CreateCommand();
            initCmd.Transaction = transaction;
            initCmd.CommandText = $"CREATE TEMP TABLE IF NOT EXISTS {tempTableName} (id INTEGER PRIMARY KEY); DELETE FROM {tempTableName};";
            await initCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

            foreach (var chunk in ids.Chunk(200))
            {
                var insertCmd = connection.CreateCommand();
                insertCmd.Transaction = transaction;
                var values = new List<string>();
                var index = 0;
                foreach (var id in chunk)
                {
                    var paramName = $"$id{index++}";
                    values.Add($"({paramName})");
                    insertCmd.Parameters.AddWithValue(paramName, id);
                }
                insertCmd.CommandText = $"INSERT INTO {tempTableName} (id) VALUES {string.Join(",", values)};";
                await insertCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
        }

        private static async Task DropTempTableAsync(SqliteConnection connection, SqliteTransaction transaction, string tempTableName)
        {
            var dropCmd = connection.CreateCommand();
            dropCmd.Transaction = transaction;
            dropCmd.CommandText = $"DROP TABLE IF EXISTS {tempTableName};";
            await dropCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task ClearNationFormationMembershipAsync(SqliteConnection connection, SqliteTransaction transaction, long nationId)
        {
            var clearCmd = connection.CreateCommand();
            clearCmd.Transaction = transaction;
            clearCmd.CommandText = "UPDATE formations SET nation_id = NULL WHERE nation_id = $nationId;";
            clearCmd.Parameters.AddWithValue("$nationId", nationId);
            await clearCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task ApplyNationFormationMembershipAsync(SqliteConnection connection, SqliteTransaction transaction, long nationId, JsonElement formations)
        {
            await ClearNationFormationMembershipAsync(connection, transaction, nationId).ConfigureAwait(false);
            foreach (var formationRef in formations.EnumerateArray())
            {
                if (formationRef.ValueKind != JsonValueKind.Number || !formationRef.TryGetInt64(out var formationId)) continue;
                var updateCmd = connection.CreateCommand();
                updateCmd.Transaction = transaction;
                updateCmd.CommandText = "UPDATE formations SET nation_id = $nationId WHERE id = $formationId;";
                updateCmd.Parameters.AddWithValue("$nationId", nationId);
                updateCmd.Parameters.AddWithValue("$formationId", formationId);
                await updateCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            }
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

        private async Task EnsureIdentifierArrayAsync(SqliteConnection connection, SqliteTransaction transaction, JsonNode? arrayNode, string scope, string tableName)
        {
            if (arrayNode is not JsonArray array) return;
            foreach (var entry in array)
            {
                if (entry is not JsonObject obj) continue;
                var existingId = TryGetId(obj);
                if (existingId.HasValue && existingId.Value > 0)
                {
                    await EnsureCounterAtLeastAsync(connection, transaction, scope, tableName, existingId.Value).ConfigureAwait(false);
                    continue;
                }

                var newId = await AllocateIdentifierAsync(connection, transaction, scope, tableName).ConfigureAwait(false);
                obj["id"] = newId;
            }
        }

        private async Task<long> AllocateIdentifierAsync(SqliteConnection connection, SqliteTransaction transaction, string scope, string tableName)
        {
            var nextId = await GetOrCreateNextIdAsync(connection, transaction, scope, tableName).ConfigureAwait(false);
            var updateCmd = connection.CreateCommand();
            updateCmd.Transaction = transaction;
            updateCmd.CommandText = "UPDATE id_counters SET next_id = $next WHERE scope = $scope;";
            updateCmd.Parameters.AddWithValue("$next", nextId + 1);
            updateCmd.Parameters.AddWithValue("$scope", scope);
            await updateCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            return nextId;
        }

        private async Task EnsureCounterAtLeastAsync(SqliteConnection connection, SqliteTransaction transaction, string scope, string tableName, long existingId)
        {
            var requiredNext = existingId + 1;
            var currentNext = await GetOrCreateNextIdAsync(connection, transaction, scope, tableName).ConfigureAwait(false);
            if (currentNext >= requiredNext) return;

            var updateCmd = connection.CreateCommand();
            updateCmd.Transaction = transaction;
            updateCmd.CommandText = "UPDATE id_counters SET next_id = $next WHERE scope = $scope;";
            updateCmd.Parameters.AddWithValue("$next", requiredNext);
            updateCmd.Parameters.AddWithValue("$scope", scope);
            await updateCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private async Task<long> GetOrCreateNextIdAsync(SqliteConnection connection, SqliteTransaction transaction, string scope, string tableName)
        {
            var selectCmd = connection.CreateCommand();
            selectCmd.Transaction = transaction;
            selectCmd.CommandText = "SELECT next_id FROM id_counters WHERE scope = $scope;";
            selectCmd.Parameters.AddWithValue("$scope", scope);
            var scalar = await selectCmd.ExecuteScalarAsync().ConfigureAwait(false);
            var nextId = scalar switch
            {
                long value => value,
                int value => value,
                null => (long?)null,
                _ => Convert.ToInt64(scalar, CultureInfo.InvariantCulture)
            };
            if (nextId.HasValue) return nextId.Value;

            var seedCmd = connection.CreateCommand();
            seedCmd.Transaction = transaction;
            seedCmd.CommandText = $"SELECT IFNULL(MAX(id), 0) + 1 FROM {tableName};";
            var seedScalar = await seedCmd.ExecuteScalarAsync().ConfigureAwait(false);
            var seedValue = seedScalar switch
            {
                long value => value,
                int value => value,
                null => 1L,
                _ => Convert.ToInt64(seedScalar, CultureInfo.InvariantCulture)
            };
            if (seedValue < 1) seedValue = 1;

            var insertCmd = connection.CreateCommand();
            insertCmd.Transaction = transaction;
            insertCmd.CommandText = "INSERT INTO id_counters (scope, next_id) VALUES ($scope, $nextId);";
            insertCmd.Parameters.AddWithValue("$scope", scope);
            insertCmd.Parameters.AddWithValue("$nextId", seedValue);
            await insertCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
            return seedValue;
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

        private static long? TryGetId(JsonObject node)
        {
            if (node is null) return null;
            if (!node.TryGetPropertyValue("id", out var idValue) || idValue is null) return null;

            if (idValue is JsonValue directValue)
            {
                if (directValue.TryGetValue<long>(out var longValue))
                {
                    return longValue;
                }

                if (directValue.TryGetValue<string>(out var stringValue) &&
                    long.TryParse(stringValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedString))
                {
                    return parsedString;
                }
            }

            var raw = idValue.ToJsonString();
            if (!string.IsNullOrWhiteSpace(raw))
            {
                if (raw.Length >= 2 && raw[0] == '"' && raw[^1] == '"')
                {
                    raw = raw.Substring(1, raw.Length - 2);
                }

                if (long.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
            }

            return null;
        }

        private static async Task<JsonArray> LoadUnitsAsync(SqliteConnection connection)
        {
            var units = new JsonArray();
            var unitIndex = new Dictionary<long, JsonObject>();

            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id, name, price, category, internal_category, tier, description, image FROM units ORDER BY id;";
            await using (var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false))
            {
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

                    units.Add(unitNode);
                    unitIndex[unitId] = unitNode;
                }
            }

            if (unitIndex.Count == 0)
            {
                return units;
            }

            var statsMap = await LoadUnitStatsMapAsync(connection).ConfigureAwait(false);
            foreach (var (unitId, stats) in statsMap)
            {
                if (unitIndex.TryGetValue(unitId, out var node) && stats is not null)
                {
                    node["stats"] = stats;
                }
            }

            var capabilitiesMap = await LoadUnitCapabilitiesMapAsync(connection).ConfigureAwait(false);
            foreach (var (unitId, caps) in capabilitiesMap)
            {
                if (unitIndex.TryGetValue(unitId, out var node))
                {
                    node["capabilities"] = caps;
                }
            }

            var grenadesMap = await LoadUnitGrenadesMapAsync(connection).ConfigureAwait(false);
            foreach (var (unitId, grenades) in grenadesMap)
            {
                if (unitIndex.TryGetValue(unitId, out var node))
                {
                    node["grenades"] = grenades;
                }
            }

            var gunsMap = await LoadUnitGunsMapAsync(connection).ConfigureAwait(false);
            var equipmentMap = await LoadUnitEquipmentMapAsync(connection).ConfigureAwait(false);

            foreach (var (unitId, node) in unitIndex)
            {
                node["guns"] = gunsMap.TryGetValue(unitId, out var guns) ? guns : new JsonArray();
                node["equipment"] = equipmentMap.TryGetValue(unitId, out var gear) ? gear : new JsonArray();
            }

            return units;
        }

        private static async Task<Dictionary<long, JsonObject>> LoadUnitStatsMapAsync(SqliteConnection connection)
        {
            var result = new Dictionary<long, JsonObject>();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT unit_id, armor, health, squad_size, visual_range, stealth, speed, weight FROM unit_stats;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var unitId = reader.GetInt64(0);
                var stats = new JsonObject();
                for (var i = 1; i < reader.FieldCount; i++)
                {
                    stats[reader.GetName(i)] = FromDbValue(reader.GetValue(i));
                }
                result[unitId] = stats;
            }

            return result;
        }

        private static async Task<Dictionary<long, JsonObject>> LoadUnitCapabilitiesMapAsync(SqliteConnection connection)
        {
            var result = new Dictionary<long, JsonObject>();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT unit_id, static_line_jump, halo_haho, sprint_distance, sprint_speed, sprint_cooldown, laser_designator FROM unit_capabilities;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var unitId = reader.GetInt64(0);
                var caps = new JsonObject
                {
                    ["staticLineJump"] = ToNullableBool(reader["static_line_jump"]) is bool sl ? JsonValue.Create(sl) : null,
                    ["haloHaho"] = ToNullableBool(reader["halo_haho"]) is bool halo ? JsonValue.Create(halo) : null,
                    ["laserDesignator"] = ToNullableBool(reader["laser_designator"]) is bool laser ? JsonValue.Create(laser) : null
                };

                var sprint = new JsonObject
                {
                    ["distance"] = FromDbValue(reader["sprint_distance"]),
                    ["speed"] = FromDbValue(reader["sprint_speed"]),
                    ["cooldown"] = FromDbValue(reader["sprint_cooldown"])
                };
                caps["sprint"] = sprint;

                result[unitId] = caps;
            }

            return result;
        }

        private static async Task<Dictionary<long, JsonObject>> LoadUnitGrenadesMapAsync(SqliteConnection connection)
        {
            var result = new Dictionary<long, JsonObject>();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT unit_id, smoke, flash, thermite, frag, total FROM unit_grenades;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var unitId = reader.GetInt64(0);
                var grenades = new JsonObject();
                for (var i = 1; i < reader.FieldCount; i++)
                {
                    grenades[reader.GetName(i)] = FromDbValue(reader.GetValue(i));
                }
                result[unitId] = grenades;
            }

            return result;
        }

        private static async Task<Dictionary<long, JsonArray>> LoadUnitEquipmentMapAsync(SqliteConnection connection)
        {
            var result = new Dictionary<long, JsonArray>();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT unit_id, name, type, description, notes, quantity FROM unit_equipment ORDER BY unit_id, id;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var unitId = reader.GetInt64(0);
                if (!result.TryGetValue(unitId, out var equipmentArray))
                {
                    equipmentArray = new JsonArray();
                    result[unitId] = equipmentArray;
                }

                var equipment = new JsonObject
                {
                    ["name"] = reader["name"]?.ToString(),
                    ["type"] = reader["type"]?.ToString(),
                    ["description"] = reader["description"]?.ToString(),
                    ["notes"] = reader["notes"]?.ToString(),
                    ["quantity"] = FromDbValue(reader["quantity"])
                };

                equipmentArray.Add(equipment);
            }

            return result;
        }

        private static async Task<Dictionary<long, JsonArray>> LoadUnitGunsMapAsync(SqliteConnection connection)
        {
            var gunsByUnit = new Dictionary<long, JsonArray>();
            var gunIndex = new Dictionary<long, JsonObject>();

            var cmd = connection.CreateCommand();
            cmd.CommandText = @"
SELECT id, unit_id, name, category, caliber, barrel_length, range, dispersion, count, ammo_per_soldier, total_ammo,
       magazine_size, reload_speed, target_acquisition, trajectories, traits
FROM unit_guns
ORDER BY unit_id, id;";
            await using (var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false))
            {
                while (await reader.ReadAsync().ConfigureAwait(false))
                {
                    var gunId = reader.GetInt64(0);
                    var unitId = reader.GetInt64(1);
                    var gun = new JsonObject
                    {
                        ["id"] = gunId,
                        ["name"] = reader["name"]?.ToString(),
                        ["category"] = reader["category"]?.ToString(),
                        ["caliber"] = reader["caliber"]?.ToString(),
                        ["barrelLength"] = FromDbValue(reader["barrel_length"]),
                        ["range"] = FromDbValue(reader["range"]),
                        ["dispersion"] = FromDbValue(reader["dispersion"]),
                        ["count"] = FromDbValue(reader["count"]),
                        ["ammoPerSoldier"] = FromDbValue(reader["ammo_per_soldier"]),
                        ["totalAmmo"] = FromDbValue(reader["total_ammo"]),
                        ["magazineSize"] = FromDbValue(reader["magazine_size"]),
                        ["reloadSpeed"] = FromDbValue(reader["reload_speed"]),
                        ["targetAcquisition"] = FromDbValue(reader["target_acquisition"])
                    };

                    var trajectoriesValue = reader["trajectories"];
                    if (trajectoriesValue != DBNull.Value)
                    {
                        var parsed = ParseJsonNodeOrNull(Convert.ToString(trajectoriesValue) ?? string.Empty);
                        if (parsed is not null)
                        {
                            gun["trajectories"] = parsed;
                        }
                    }

                    var traitsValue = reader["traits"];
                    if (traitsValue != DBNull.Value)
                    {
                        var parsed = ParseJsonNodeOrNull(Convert.ToString(traitsValue) ?? string.Empty);
                        if (parsed is not null)
                        {
                            gun["traits"] = parsed;
                        }
                    }

                    gunIndex[gunId] = gun;

                    if (!gunsByUnit.TryGetValue(unitId, out var gunArray))
                    {
                        gunArray = new JsonArray();
                        gunsByUnit[unitId] = gunArray;
                    }

                    gunArray.Add(gun);
                }
            }

            await AttachGunAmmoAsync(connection, gunIndex).ConfigureAwait(false);
            await AttachGunFireModesAsync(connection, gunIndex).ConfigureAwait(false);

            return gunsByUnit;
        }

        private static async Task AttachGunAmmoAsync(SqliteConnection connection, Dictionary<long, JsonObject> gunIndex)
        {
            if (gunIndex.Count == 0) return;

            var ammoByGun = new Dictionary<long, JsonArray>();
            var cmd = connection.CreateCommand();
            cmd.CommandText =
                "SELECT gun_id, name, ammo_type, ammo_per_soldier, penetration, he_deadliness, dispersion, range_mod, grain, notes, airburst, sub_count, sub_damage, sub_penetration, fps FROM unit_gun_ammo ORDER BY gun_id, id;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var gunId = reader.GetInt64(0);
                if (!gunIndex.ContainsKey(gunId))
                {
                    continue;
                }

                if (!ammoByGun.TryGetValue(gunId, out var ammoArray))
                {
                    ammoArray = new JsonArray();
                    ammoByGun[gunId] = ammoArray;
                }

                var ammo = new JsonObject
                {
                    ["name"] = reader["name"]?.ToString(),
                    ["ammoType"] = reader["ammo_type"]?.ToString(),
                    ["ammoPerSoldier"] = FromDbValue(reader["ammo_per_soldier"]),
                    ["penetration"] = FromDbValue(reader["penetration"]),
                    ["heDeadliness"] = FromDbValue(reader["he_deadliness"]),
                    ["dispersion"] = FromDbValue(reader["dispersion"]),
                    ["rangeMod"] = FromDbValue(reader["range_mod"]),
                    ["grain"] = FromDbValue(reader["grain"]),
                    ["notes"] = reader["notes"]?.ToString(),
                    ["airburst"] = ToNullableBool(reader["airburst"]) is bool airburst ? JsonValue.Create(airburst) : null,
                    ["subCount"] = FromDbValue(reader["sub_count"]),
                    ["subDamage"] = FromDbValue(reader["sub_damage"]),
                    ["subPenetration"] = FromDbValue(reader["sub_penetration"]),
                    ["fps"] = FromDbValue(reader["fps"])
                };

                ammoArray.Add(ammo);
            }

            foreach (var (gunId, ammoArray) in ammoByGun)
            {
                if (gunIndex.TryGetValue(gunId, out var gun))
                {
                    gun["ammoTypes"] = ammoArray;
                }
            }
        }

        private static async Task AttachGunFireModesAsync(SqliteConnection connection, Dictionary<long, JsonObject> gunIndex)
        {
            if (gunIndex.Count == 0) return;

            var fireModesByGun = new Dictionary<long, JsonArray>();
            var cmd = connection.CreateCommand();
            cmd.CommandText =
                "SELECT gun_id, name, rounds, min_range, max_range, cooldown, ammo_ref FROM unit_gun_fire_modes ORDER BY gun_id, id;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var gunId = reader.GetInt64(0);
                if (!gunIndex.ContainsKey(gunId))
                {
                    continue;
                }

                if (!fireModesByGun.TryGetValue(gunId, out var fireArray))
                {
                    fireArray = new JsonArray();
                    fireModesByGun[gunId] = fireArray;
                }

                var fire = new JsonObject
                {
                    ["name"] = reader["name"]?.ToString(),
                    ["rounds"] = FromDbValue(reader["rounds"]),
                    ["minRange"] = FromDbValue(reader["min_range"]),
                    ["maxRange"] = FromDbValue(reader["max_range"]),
                    ["cooldown"] = FromDbValue(reader["cooldown"]),
                    ["ammoRef"] = reader["ammo_ref"]?.ToString()
                };

                fireArray.Add(fire);
            }

            foreach (var (gunId, fireModes) in fireModesByGun)
            {
                if (gunIndex.TryGetValue(gunId, out var gun))
                {
                    gun["fireModes"] = fireModes;
                }
            }
        }

        private static JsonNode? FromDbValue(object? value)
        {
            return value is null or DBNull ? null : JsonValue.Create(value);
        }

        private static JsonNode? ParseJsonNodeOrNull(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
            {
                return null;
            }

            try
            {
                return JsonNode.Parse(raw);
            }
            catch
            {
                return null;
            }
        }

        private static bool? ToNullableBool(object? value)
        {
            if (value is null || value is DBNull)
            {
                return null;
            }

            return value switch
            {
                bool b => b,
                byte b => b != 0,
                sbyte sb => sb != 0,
                short s => s != 0,
                ushort us => us != 0,
                int i => i != 0,
                uint ui => ui != 0,
                long l => l != 0,
                ulong ul => ul != 0,
                string s when bool.TryParse(s, out var boolValue) => boolValue,
                string s when long.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed) => parsed != 0,
                _ => null
            };
        }

        private static async Task<JsonArray> LoadFormationsAsync(SqliteConnection connection)
        {
            var formations = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT id, nation_id, name, description, role, hq_location, commander, readiness, strength_summary, support_assets, communications, image FROM formations ORDER BY id;";
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
                    ["role"] = reader["role"]?.ToString(),
                    ["hqLocation"] = reader["hq_location"]?.ToString(),
                    ["commander"] = reader["commander"]?.ToString(),
                    ["readiness"] = reader["readiness"]?.ToString(),
                    ["strengthSummary"] = reader["strength_summary"]?.ToString(),
                    ["supportAssets"] = reader["support_assets"]?.ToString(),
                    ["communications"] = reader["communications"]?.ToString(),
                    ["image"] = reader["image"]?.ToString()
                };

                var categories = await LoadFormationCategoriesAsync(connection, formationId).ConfigureAwait(false);
                if (categories.Count > 0) formation["categories"] = categories;

                var subFormations = await LoadFormationChildrenAsync(connection, formationId).ConfigureAwait(false);
                if (subFormations.Count > 0) formation["subFormations"] = subFormations;

                var subLinks = await LoadFormationChildLinksAsync(connection, formationId).ConfigureAwait(false);
                if (subLinks.Count > 0) formation["subFormationLinks"] = subLinks;

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

        private static async Task<JsonArray> LoadFormationChildLinksAsync(SqliteConnection connection, long parentId)
        {
            var array = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT child_id, assignment, strength, notes, readiness FROM formation_children WHERE parent_id = $id ORDER BY id;";
            cmd.Parameters.AddWithValue("$id", parentId);
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var link = new JsonObject
                {
                    ["formationId"] = Convert.ToInt64(reader["child_id"])
                };
                if (reader["assignment"] != DBNull.Value) link["assignment"] = reader["assignment"]?.ToString();
                if (reader["strength"] != DBNull.Value) link["strength"] = reader["strength"]?.ToString();
                if (reader["notes"] != DBNull.Value) link["notes"] = reader["notes"]?.ToString();
                if (reader["readiness"] != DBNull.Value) link["readiness"] = reader["readiness"]?.ToString();
                array.Add(link);
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

        private static async Task<JsonArray> LoadWeaponsAsync(SqliteConnection connection)
        {
            var array = new JsonArray();
            var (hasMetadataColumn, hasPayloadColumn) = await GetWeaponColumnStateAsync(connection).ConfigureAwait(false);
            var metadataExpr = hasMetadataColumn ? "metadata" : hasPayloadColumn ? "payload" : "NULL";
            var payloadExpr = hasPayloadColumn ? "payload" : "NULL";

            var cmd = connection.CreateCommand();
            cmd.CommandText = $"SELECT id, name, category, caliber, range, muzzle_velocity, dispersion, barrel_length, reload_speed, {metadataExpr} AS metadata_blob, {payloadExpr} AS payload_blob FROM weapons ORDER BY name;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            var metadataOrdinal = reader.GetOrdinal("metadata_blob");
            var payloadOrdinal = reader.GetOrdinal("payload_blob");

            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                JsonObject weapon;
                var metadataSource = !reader.IsDBNull(metadataOrdinal) ? reader.GetString(metadataOrdinal) : (!reader.IsDBNull(payloadOrdinal) ? reader.GetString(payloadOrdinal) : null);
                if (!string.IsNullOrWhiteSpace(metadataSource))
                {
                    try
                    {
                        weapon = JsonNode.Parse(metadataSource) as JsonObject ?? new JsonObject();
                    }
                    catch
                    {
                        weapon = new JsonObject();
                    }
                }
                else
                {
                    weapon = new JsonObject();
                }

                weapon["id"] = reader.GetInt64(0);
                if (!reader.IsDBNull(1)) weapon["name"] = reader.GetString(1);
                if (!reader.IsDBNull(2)) weapon["category"] = reader.GetString(2);
                if (!reader.IsDBNull(3)) weapon["caliber"] = reader.GetString(3);
                if (!reader.IsDBNull(4)) weapon["range"] = reader.GetDouble(4);
                if (!reader.IsDBNull(5)) weapon["muzzleVelocity"] = reader.GetDouble(5);
                if (!reader.IsDBNull(6)) weapon["dispersion"] = reader.GetDouble(6);
                if (!reader.IsDBNull(7)) weapon["barrelLength"] = reader.GetDouble(7);
                if (!reader.IsDBNull(8)) weapon["reloadSpeed"] = reader.GetDouble(8);
                array.Add(weapon);
            }
            return array;
        }

        private static async Task<JsonArray> LoadAmmoTemplatesAsync(SqliteConnection connection)
        {
            var array = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = @"SELECT id, name, caliber, caliber_desc, ammo_type, ammo_per_soldier, penetration, he_deadliness, dispersion, range_mod, grain, notes, airburst, metadata, sub_count, sub_damage, sub_penetration, fps, payload FROM ammo_templates ORDER BY caliber, name;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                JsonObject template = new JsonObject();
                var metadataSource = !reader.IsDBNull(13) ? reader.GetString(13) : (!reader.IsDBNull(18) ? reader.GetString(18) : null);
                if (!string.IsNullOrWhiteSpace(metadataSource))
                {
                    try
                    {
                        template = JsonNode.Parse(metadataSource) as JsonObject ?? template;
                    }
                    catch
                    {
                        // ignored
                    }
                }

                template["id"] = reader.GetInt64(0);
                if (!reader.IsDBNull(1)) template["name"] = reader.GetString(1);
                if (!reader.IsDBNull(2)) template["caliber"] = reader.GetString(2);
                if (!reader.IsDBNull(3)) template["caliberDesc"] = reader.GetString(3);
                if (!reader.IsDBNull(4)) template["ammoType"] = reader.GetString(4);
                if (!reader.IsDBNull(5)) template["ammoPerSoldier"] = reader.GetDouble(5);
                if (!reader.IsDBNull(6)) template["penetration"] = reader.GetDouble(6);
                if (!reader.IsDBNull(7)) template["heDeadliness"] = reader.GetDouble(7);
                if (!reader.IsDBNull(8)) template["dispersion"] = reader.GetDouble(8);
                if (!reader.IsDBNull(9)) template["rangeMod"] = reader.GetDouble(9);
                if (!reader.IsDBNull(10)) template["grain"] = reader.GetDouble(10);
                if (!reader.IsDBNull(11)) template["notes"] = reader.GetString(11);
                if (!reader.IsDBNull(12)) template["airburst"] = reader.GetInt32(12) == 1;
                if (!reader.IsDBNull(14)) template["subCount"] = reader.GetDouble(14);
                if (!reader.IsDBNull(15)) template["subDamage"] = reader.GetDouble(15);
                if (!reader.IsDBNull(16)) template["subPenetration"] = reader.GetDouble(16);
                if (!reader.IsDBNull(17)) template["fps"] = reader.GetDouble(17);
                array.Add(template);
            }
            return array;
        }

        private static async Task<JsonArray> LoadFireModeTemplatesAsync(SqliteConnection connection)
        {
            var array = new JsonArray();
            var cmd = connection.CreateCommand();
            cmd.CommandText = @"SELECT id, name, rounds, min_range, max_range, cooldown, ammo_ref, notes, payload FROM fire_mode_templates ORDER BY name;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                JsonObject template = new JsonObject();
                var payloadSource = !reader.IsDBNull(8) ? reader.GetString(8) : null;
                if (!string.IsNullOrWhiteSpace(payloadSource))
                {
                    try
                    {
                        template = JsonNode.Parse(payloadSource) as JsonObject ?? template;
                    }
                    catch
                    {
                        // ignored
                    }
                }

                template["id"] = reader.GetInt64(0);
                if (!reader.IsDBNull(1)) template["name"] = reader.GetString(1);
                if (!reader.IsDBNull(2)) template["rounds"] = reader.GetDouble(2);
                if (!reader.IsDBNull(3)) template["minRange"] = reader.GetDouble(3);
                if (!reader.IsDBNull(4)) template["maxRange"] = reader.GetDouble(4);
                if (!reader.IsDBNull(5)) template["cooldown"] = reader.GetDouble(5);
                if (!reader.IsDBNull(6)) template["ammoRef"] = reader.GetString(6);
                if (!reader.IsDBNull(7)) template["notes"] = reader.GetString(7);
                array.Add(template);
            }
            return array;
        }

        private static async Task<JsonObject> LoadWeaponTagsAsync(SqliteConnection connection)
        {
            var result = new JsonObject
            {
                ["categories"] = new JsonObject(),
                ["calibers"] = new JsonObject()
            };

            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT scope, name, color FROM weapon_tags ORDER BY scope, name;";
            await using var reader = await cmd.ExecuteReaderAsync().ConfigureAwait(false);
            while (await reader.ReadAsync().ConfigureAwait(false))
            {
                var scope = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                var name = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
                var color = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                if (string.IsNullOrWhiteSpace(scope) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(color))
                {
                    continue;
                }

                var key = scope.Equals("calibers", StringComparison.OrdinalIgnoreCase) ? "calibers" : "categories";
                if (result[key] is not JsonObject bucket)
                {
                    bucket = new JsonObject();
                    result[key] = bucket;
                }
                bucket[name] = color;
            }

            return result;
        }

        private static async Task<JsonObject> LoadSettingsAsync(SqliteConnection connection)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT payload FROM settings WHERE id = 1 LIMIT 1;";
            var scalar = await cmd.ExecuteScalarAsync().ConfigureAwait(false);
            if (scalar is string payload && !string.IsNullOrWhiteSpace(payload))
            {
                try
                {
                    if (JsonNode.Parse(payload) is JsonObject obj)
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

        private static object ToDbValue(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value;
        }

        private static object ToNullableDouble(string? value)
        {
            var parsed = MeasurementParser.Parse(value);
            return parsed.HasValue ? parsed.Value : DBNull.Value;
        }

        private static object ToNullableBoolInt(JsonNode? node)
        {
            if (node == null) return DBNull.Value;
            if (node is JsonValue jsonValue)
            {
                if (jsonValue.TryGetValue<bool>(out var boolValue))
                {
                    return boolValue ? 1 : 0;
                }

                if (jsonValue.TryGetValue<int>(out var intValue))
                {
                    return intValue;
                }
            }

            if (bool.TryParse(node.ToString(), out var parsedBool))
            {
                return parsedBool ? 1 : 0;
            }

            if (int.TryParse(node.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedInt))
            {
                return parsedInt;
            }

            return DBNull.Value;
        }

        private async Task<SqliteConnection> OpenConnectionAsync()
        {
            var connection = CreateConnection();
            await connection.OpenAsync().ConfigureAwait(false);
            return connection;
        }

        private SqliteConnection CreateConnection()
        {
            return new SqliteConnection(_connectionString);
        }

    }

    internal static class MeasurementParser
    {
        private static readonly Regex NumericToken = new("-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public static double? Parse(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            var cleaned = raw.Trim().Replace(",", string.Empty);
            var match = NumericToken.Match(cleaned);
            if (!match.Success) return null;
            if (!double.TryParse(match.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed))
            {
                return null;
            }

            var suffixIndex = match.Index + match.Length;
            var unit = suffixIndex < cleaned.Length ? cleaned[suffixIndex..].Trim().ToLowerInvariant() : string.Empty;
            var normalized = NormalizeByUnit(parsed, unit);
            return double.IsFinite(normalized) ? normalized : (double?)null;
        }

        private static double NormalizeByUnit(double value, string unit)
        {
            if (string.IsNullOrWhiteSpace(unit)) return value;
            var normalized = unit.Replace("per", "/", StringComparison.Ordinal);

            if (ContainsUnit(normalized, "km/h", "kph", "kmph"))
            {
                return value / 3.6d;
            }

            if (ContainsUnit(normalized, "mph"))
            {
                return value * 0.44704d;
            }

            if (ContainsUnit(normalized, "m/s", "mps"))
            {
                return value;
            }

            if (ContainsUnit(normalized, "ft/s", "fps"))
            {
                return value * 0.3048d;
            }

            if (ContainsUnit(normalized, "knot", "knots", " kt", "kt", "kts", " kn"))
            {
                return value * 0.514444d;
            }

            if (ContainsUnit(normalized, "lbs", "lb", "pound"))
            {
                return value * 0.45359237d;
            }

            if (ContainsUnit(normalized, "oz", "ounce"))
            {
                return value * 0.0283495d;
            }

            if (ContainsUnit(normalized, "tonne", "ton", "metric ton", " t"))
            {
                return value * 1000d;
            }

            if (ContainsUnit(normalized, "kg", "kilogram"))
            {
                return value;
            }

            if (ContainsUnit(normalized, "gram", "grams", " g", "g ", "gramme"))
            {
                return value / 1000d;
            }

            if (ContainsUnit(normalized, "mg", "milligram"))
            {
                return value / 1_000_000d;
            }

            return value;
        }

        private static bool ContainsUnit(string source, params string[] tokens)
        {
            foreach (var token in tokens)
            {
                if (string.IsNullOrWhiteSpace(token)) continue;
                if (source.Contains(token, StringComparison.Ordinal))
                {
                    return true;
                }
            }

            return false;
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

        public static long? GetPropertyOrDefault(this JsonElement element, string propertyName, long? fallback)
        {
            if (element.TryGetProperty(propertyName, out var value))
            {
                if (value.ValueKind == JsonValueKind.Number && value.TryGetInt64(out var result))
                {
                    return result;
                }

                if (value.ValueKind == JsonValueKind.String && long.TryParse(value.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
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

                if (value.ValueKind == JsonValueKind.String)
                {
                    var parsed = MeasurementParser.Parse(value.GetString());
                    if (parsed.HasValue)
                    {
                        return parsed.Value;
                    }
                    if (double.TryParse(value.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var fallbackParsed))
                    {
                        return fallbackParsed;
                    }
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
