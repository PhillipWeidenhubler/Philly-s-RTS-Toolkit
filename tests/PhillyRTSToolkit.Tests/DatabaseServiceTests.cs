using System;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Xunit;

namespace PhillyRTSToolkit.Tests;

public static class TestPathHelper
{
    public static string SolutionRoot { get; } = LocateSolutionRoot();

    public static string SchemaPath => Path.Combine(SolutionRoot, "database", "schema.sql");

    private static string LocateSolutionRoot()
    {
        var current = AppContext.BaseDirectory;
        while (!string.IsNullOrWhiteSpace(current))
        {
            var candidate = Path.Combine(current, "Philly's RTS Toolkit.sln");
            if (File.Exists(candidate))
            {
                return current;
            }

            var parent = Directory.GetParent(current)?.FullName;
            if (string.IsNullOrWhiteSpace(parent) || string.Equals(parent, current, StringComparison.Ordinal))
            {
                break;
            }
            current = parent;
        }

        throw new InvalidOperationException("Unable to locate solution root for integration tests.");
    }
}

public static class SqliteTestHelper
{
    public static async Task PrepareLegacyDatabaseAsync(string dbPath)
    {
        if (File.Exists(dbPath))
        {
            File.Delete(dbPath);
        }

        var bootstrapService = new DatabaseService(dbPath, TestPathHelper.SchemaPath);
        await bootstrapService.InitializeAsync().ConfigureAwait(false);

        await using var connection = new SqliteConnection(new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            ForeignKeys = true
        }.ToString());

        await connection.OpenAsync().ConfigureAwait(false);
        await using var transaction = await connection.BeginTransactionAsync().ConfigureAwait(false);
        var sqliteTransaction = (SqliteTransaction)transaction;

        await using (var resetVersion = connection.CreateCommand())
        {
            resetVersion.Transaction = sqliteTransaction;
            resetVersion.CommandText = "UPDATE schema_info SET version = 1 WHERE id = 1;";
            await resetVersion.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        await using (var clearCounters = connection.CreateCommand())
        {
            clearCounters.Transaction = sqliteTransaction;
            clearCounters.CommandText = "DELETE FROM id_counters;";
            await clearCounters.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        await using (var seedUnits = connection.CreateCommand())
        {
            seedUnits.Transaction = sqliteTransaction;
            seedUnits.CommandText = "INSERT OR REPLACE INTO units (id, name) VALUES (5, 'Legacy Ranger');";
            await seedUnits.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        await sqliteTransaction.CommitAsync().ConfigureAwait(false);
    }

    public static async Task InsertCounterAsync(string dbPath, string scope, int nextId)
    {
        await using var connection = new SqliteConnection(new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            ForeignKeys = true
        }.ToString());

        await connection.OpenAsync().ConfigureAwait(false);
        await using var command = connection.CreateCommand();
        command.CommandText = "INSERT INTO id_counters (scope, next_id) VALUES ($scope, $nextId);";
        command.Parameters.AddWithValue("$scope", scope);
        command.Parameters.AddWithValue("$nextId", nextId);
        await command.ExecuteNonQueryAsync().ConfigureAwait(false);
    }

    public static async Task<int?> GetCounterValueAsync(string dbPath, string scope)
    {
        await using var connection = new SqliteConnection(new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            ForeignKeys = true
        }.ToString());

        await connection.OpenAsync().ConfigureAwait(false);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT next_id FROM id_counters WHERE scope = $scope;";
        command.Parameters.AddWithValue("$scope", scope);
        var scalar = await command.ExecuteScalarAsync().ConfigureAwait(false);
        return scalar switch
        {
            null => null,
            DBNull => null,
            long value => (int)value,
            int value => value,
            _ => Convert.ToInt32(scalar, CultureInfo.InvariantCulture)
        };
    }

    public static async Task<int> GetSchemaVersionAsync(string dbPath)
    {
        await using var connection = new SqliteConnection(new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            ForeignKeys = true
        }.ToString());

        await connection.OpenAsync().ConfigureAwait(false);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT version FROM schema_info WHERE id = 1;";
        var scalar = await command.ExecuteScalarAsync().ConfigureAwait(false);
        return scalar switch
        {
            long value => (int)value,
            int value => value,
            _ => Convert.ToInt32(scalar, CultureInfo.InvariantCulture)
        };
    }
}

public class DatabaseServiceTests
{
    [Fact]
    public async Task InitializeAsync_UpgradesSchemaVersionToCurrent()
    {
        var dbPath = CreateTempDatabasePath();
        try
        {
            var service = new DatabaseService(dbPath, TestPathHelper.SchemaPath);
            await service.InitializeAsync();

            var version = await SqliteTestHelper.GetSchemaVersionAsync(dbPath);
            Assert.Equal(3, version);
        }
        finally
        {
            CleanupTempDatabase(dbPath);
        }
    }

    [Fact]
    public async Task InitializeAsync_SeedsIdCountersFromExistingRows()
    {
        var dbPath = CreateTempDatabasePath();
        try
        {
            await SqliteTestHelper.PrepareLegacyDatabaseAsync(dbPath);

            var service = new DatabaseService(dbPath, TestPathHelper.SchemaPath);
            await service.InitializeAsync();

            var unitsNextId = await SqliteTestHelper.GetCounterValueAsync(dbPath, "units");
            Assert.Equal(6, unitsNextId);
        }
        finally
        {
            CleanupTempDatabase(dbPath);
        }
    }

    [Fact]
    public async Task InitializeAsync_DoesNotOverwriteExistingCounters()
    {
        var dbPath = CreateTempDatabasePath();
        try
        {
            await SqliteTestHelper.PrepareLegacyDatabaseAsync(dbPath);
            await SqliteTestHelper.InsertCounterAsync(dbPath, "units", 42);

            var service = new DatabaseService(dbPath, TestPathHelper.SchemaPath);
            await service.InitializeAsync();

            var unitsNextId = await SqliteTestHelper.GetCounterValueAsync(dbPath, "units");
            Assert.Equal(42, unitsNextId);
        }
        finally
        {
            CleanupTempDatabase(dbPath);
        }
    }

    private static string CreateTempDatabasePath()
        => Path.Combine(Path.GetTempPath(), $"philly_rts_{Guid.NewGuid():N}.db");

    private static void CleanupTempDatabase(string dbPath)
    {
        if (!string.IsNullOrWhiteSpace(dbPath) && File.Exists(dbPath))
        {
            SqliteConnection.ClearAllPools();
            File.Delete(dbPath);
        }
    }
}