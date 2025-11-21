using System;
using System.IO;
using Serilog;
using Serilog.Events;

namespace PhillyRTSToolkit;

internal static class Logging
{
    private static bool _initialized;

    public static void Initialize()
    {
        if (_initialized)
        {
            return;
        }

        var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var logRoot = Path.Combine(appData, "PhillyRTSToolkit", "logs");
        Directory.CreateDirectory(logRoot);
        var logPath = Path.Combine(logRoot, "desktop-.log");

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .Enrich.FromLogContext()
            .WriteTo.File(
                logPath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 5,
                shared: true,
                restrictedToMinimumLevel: LogEventLevel.Debug,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger();

        _initialized = true;
        Log.Information("Desktop logging initialized at {LogPath}", logPath);
    }

    public static void Shutdown()
    {
        if (!_initialized)
        {
            return;
        }

        Log.Information("Desktop logging shutting down");
        Log.CloseAndFlush();
        _initialized = false;
    }
}
