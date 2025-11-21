using System;
using System.Collections.Generic;

namespace PhillyRTSToolkit;

public sealed record ServerLogEvent
{
    public DateTimeOffset Timestamp { get; init; }
    public string Level { get; init; } = "Information";
    public string Category { get; init; } = "server";
    public string Message { get; init; } = string.Empty;
    public string? Exception { get; init; }
    public int? StatusCode { get; init; }
    public double? DurationMs { get; init; }
}

public sealed record LocalServerMetadata(string BaseUrl, int Port, string Token, DateTimeOffset StartedAt);

public sealed record FileDiagnostic
{
    public string Name { get; init; } = string.Empty;
    public string Path { get; init; } = string.Empty;
    public bool Exists { get; init; }
    public long? SizeBytes { get; init; }
    public DateTimeOffset? LastWriteTimeUtc { get; init; }
}

public sealed record ServerDiagnostics
{
    public string DatabasePath { get; init; } = string.Empty;
    public string SchemaPath { get; init; } = string.Empty;
    public string JsonBackupDirectory { get; init; } = string.Empty;
    public long? DatabaseSizeBytes { get; init; }
    public DateTimeOffset? DatabaseLastWriteUtc { get; init; }
    public DateTimeOffset? SchemaLastWriteUtc { get; init; }
    public DateTimeOffset? AppStateUpdatedAtUtc { get; init; }
    public IReadOnlyDictionary<string, long> TableCounts { get; init; } = new Dictionary<string, long>();
    public IReadOnlyList<FileDiagnostic> BackupFiles { get; init; } = Array.Empty<FileDiagnostic>();
    public int PendingLogEntries { get; init; }
}
