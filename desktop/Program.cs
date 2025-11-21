using System;
using System.Windows.Forms;
using Serilog;

namespace PhillyRTSToolkit
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Logging.Initialize();

            AppDomain.CurrentDomain.UnhandledException += (_, args) =>
            {
                if (args.ExceptionObject is Exception ex)
                {
                    ReportFatal("AppDomain", ex);
                }
            };

            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            Application.ThreadException += (_, args) =>
            {
                ReportFatal("UI thread", args.Exception);
            };

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                Log.Information("Philly's RTS Toolkit starting (PID {Pid})", Environment.ProcessId);
                using var form = new MainForm();
                Application.Run(form);
            }
            catch (Exception ex)
            {
                ReportFatal("Main", ex);
            }
            finally
            {
                Logging.Shutdown();
            }
        }

        private static void ReportFatal(string stage, Exception exception)
        {
            try
            {
                Log.Error(exception, "Unhandled exception at {Stage}", stage);
                MessageBox.Show($"Philly's RTS Toolkit crashed during {stage}.\n\n{exception.Message}\n\nSee the log folder under %LOCALAPPDATA%/PhillyRTSToolkit/logs.", "Philly's RTS Toolkit", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            catch
            {
                // ignored – last-chance handler
            }
        }
    }
}
