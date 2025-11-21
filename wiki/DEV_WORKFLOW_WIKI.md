# Development Workflow
Frontend dev: npm run dev (hot reload)
Desktop: dotnet run --project desktop/PhillyRTSToolkit.csproj -c Release
Integrated: run_next_gen.bat (build + launch)
Launcher: run_next_gen.bat once, then double-click root PhillyRTSToolkit.exe for subsequent sessions.

Feature steps: schema + DatabaseService + types + message + service + panel.
Logging: use Console; remove before PR.
Bulk rewrite simplicity until scaling demands diffs.
