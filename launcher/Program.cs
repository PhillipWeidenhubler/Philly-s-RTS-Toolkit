using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PhillyRTSToolkit.Launcher;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        var repoRoot = Path.GetFullPath(AppContext.BaseDirectory);
        var candidates = new[]
        {
            Path.Combine(repoRoot, "desktop", "bin", "Release", "net8.0-windows", "PhillyRTSToolkit.exe"),
            Path.Combine(repoRoot, "desktop", "bin", "Debug", "net8.0-windows", "PhillyRTSToolkit.exe")
        };

        string? target = null;
        foreach (var candidate in candidates)
        {
            if (File.Exists(candidate))
            {
                target = candidate;
                break;
            }
        }

        if (target is null)
        {
            var scriptPath = Path.Combine(repoRoot, "run_next_gen.bat");
            var message = "No compiled desktop host was found. Run run_next_gen.bat to build the frontend and desktop binaries before launching.";
            if (File.Exists(scriptPath))
            {
                message += $"\n\nScript: {scriptPath}";
            }

            MessageBox.Show(message, "Philly's RTS Toolkit", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try
        {
            var startInfo = new ProcessStartInfo(target)
            {
                UseShellExecute = false,
                WorkingDirectory = Path.GetDirectoryName(target) ?? repoRoot
            };
            Process.Start(startInfo);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to start Philly's RTS Toolkit:\n{ex.Message}", "Philly's RTS Toolkit", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
