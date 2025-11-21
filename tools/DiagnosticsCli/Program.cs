using System.Text.Json;

namespace PhillyRTSToolkit.DiagnosticsCli;

internal sealed record AnalyzerOptions(string? RootPath, string? OutputPath);

internal static class Program
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private static async Task<int> Main(string[] args)
    {
        var options = ParseArgs(args);
        try
        {
            var repoRoot = LocateRepoRoot(options.RootPath);
            if (repoRoot is null)
            {
                Console.Error.WriteLine("[Diagnostics] Unable to locate repository root. Pass --root <path>.");
                return 1;
            }

            var (database, storage) = await CreateServicesAsync(repoRoot).ConfigureAwait(false);
            var diagnostics = await DiagnosticsBuilder.BuildAsync(database, storage).ConfigureAwait(false);

            var payload = JsonSerializer.Serialize(diagnostics, SerializerOptions);
            Console.WriteLine(payload);

            if (!string.IsNullOrWhiteSpace(options.OutputPath))
            {
                var resolved = Path.GetFullPath(options.OutputPath!);
                Directory.CreateDirectory(Path.GetDirectoryName(resolved)!);
                await File.WriteAllTextAsync(resolved, payload).ConfigureAwait(false);
                Console.WriteLine($"[Diagnostics] Saved report to {resolved}");
            }

            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[Diagnostics] {ex.Message}");
            Console.Error.WriteLine(ex);
            return 1;
        }
    }

    private static AnalyzerOptions ParseArgs(string[] args)
    {
        string? root = null;
        string? output = null;
        for (var i = 0; i < args.Length; i++)
        {
            var arg = args[i];
            if (string.Equals(arg, "--root", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                root = args[++i];
            }
            else if (string.Equals(arg, "--output", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                output = args[++i];
            }
        }

        output ??= Path.Combine(Environment.CurrentDirectory, "analysis-report.json");
        return new AnalyzerOptions(root, output);
    }

    private static string? LocateRepoRoot(string? overridePath)
    {
        if (!string.IsNullOrWhiteSpace(overridePath))
        {
            var candidate = Path.GetFullPath(overridePath);
            return Directory.Exists(candidate) ? candidate : null;
        }

        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "Philly's RTS Toolkit.sln")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        return null;
    }

    private static async Task<(DatabaseService Database, PayloadStorageService Storage)> CreateServicesAsync(string repoRoot)
    {
        var dbDir = Path.Combine(repoRoot, "database");
        var dbPath = Path.Combine(dbDir, "rts.db");
        var schemaPath = Path.Combine(dbDir, "schema.sql");
        var jsonRoot = Path.Combine(dbDir, "json");

        var database = new DatabaseService(dbPath, schemaPath);
        await database.InitializeAsync().ConfigureAwait(false);
        var storage = new PayloadStorageService(database, jsonRoot);
        return (database, storage);
    }
}
