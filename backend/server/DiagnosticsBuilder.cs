using System;
using System.IO;
using System.Threading.Tasks;

namespace PhillyRTSToolkit;

public static class DiagnosticsBuilder
{
    public static async Task<ServerDiagnostics> BuildAsync(DatabaseService database, PayloadStorageService storage, int pendingLogEntries = 0)
    {
        if (database is null)
        {
            throw new ArgumentNullException(nameof(database));
        }

        if (storage is null)
        {
            throw new ArgumentNullException(nameof(storage));
        }

        var dbFile = DescribeFile(Path.GetFileName(database.DatabasePath), database.DatabasePath);
        var schemaFile = DescribeFile(Path.GetFileName(database.SchemaPath), database.SchemaPath);
        var tableCounts = await database.GetTableCountsAsync().ConfigureAwait(false);
        var backups = await storage.DescribeBackupFilesAsync().ConfigureAwait(false);
        var appStateUpdatedAt = await database.GetAppStateUpdatedAtAsync().ConfigureAwait(false);

        return new ServerDiagnostics
        {
            DatabasePath = database.DatabasePath,
            SchemaPath = database.SchemaPath,
            JsonBackupDirectory = storage.JsonRoot,
            DatabaseSizeBytes = dbFile.SizeBytes,
            DatabaseLastWriteUtc = dbFile.LastWriteTimeUtc,
            SchemaLastWriteUtc = schemaFile.LastWriteTimeUtc,
            AppStateUpdatedAtUtc = appStateUpdatedAt,
            TableCounts = tableCounts,
            BackupFiles = backups,
            PendingLogEntries = pendingLogEntries
        };
    }

    public static FileDiagnostic DescribeFile(string displayName, string? path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return new FileDiagnostic
            {
                Name = displayName,
                Path = string.Empty,
                Exists = false
            };
        }

        try
        {
            var info = new FileInfo(path);
            if (!info.Exists)
            {
                return new FileDiagnostic
                {
                    Name = displayName,
                    Path = path,
                    Exists = false
                };
            }

            return new FileDiagnostic
            {
                Name = displayName,
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
                Name = displayName,
                Path = path,
                Exists = false
            };
        }
    }
}
