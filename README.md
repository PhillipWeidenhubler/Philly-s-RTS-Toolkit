# Philly's RTS Toolkit

A comprehensive desktop application for creating, managing, and visualizing military unit statcards for Real-Time Strategy (RTS) games. This toolkit provides powerful editors and visual rendering capabilities for designing balanced military units, formations, and nations with detailed statistics and weaponry.

## Overview

Philly's RTS Toolkit is a hybrid web-desktop application built with C# and HTML/CSS/JavaScript that enables game designers, modders, and RTS enthusiasts to:

- Create and manage detailed unit statcards with comprehensive statistics
- Design weapons and ammunition configurations with realistic ballistics
- Organize units into formations and nations
- Generate visual statcards for documentation or game design
- Export and import data in JSON format for easy sharing
- Visualize unit performance with radar charts and statistics

## Build & Launch

1. Run `run_next_gen.bat` from the repo root. The script installs npm dependencies if needed, builds the Vite bundle, compiles the WinForms host, and refreshes the new launcher project.
2. After the script succeeds, double-click the root-level `PhillyRTSToolkit.exe`. This launcher simply proxies to the latest desktop build under `desktop/bin/Release/net8.0-windows/`, so you can pin it to the Start menu or taskbar.
3. If the launcher cannot find a compiled desktop host it prompts you to rerun `run_next_gen.bat`.

## Features

### Embedded Local Server & Diagnostics
- **In-process ASP.NET Core host** (`backend/server/LocalServerHost.cs`) starts automatically with the WinForms shell and exposes REST endpoints (`/api/health`, `/api/units`, `/api/diagnostics`, `/api/logs`, etc.) over a loopback-only URL. No extra processes or services are required—the user simply launches the desktop app.
- **JSON + SQLite transparency**: the server routes every save/load through `PayloadStorageService`, keeping `database/rts.db` (structured tables) and the JSON backups in `database/json/*.json` in sync. The new diagnostics endpoint reports table counts, file timestamps, and pending log entries so you can spot drift immediately.
- **Live server console in Settings**: the Settings panel now includes a server log console, filter controls, and a diagnostics output pane. Use it to inspect HTTP traffic, error stacks, and run on-demand health checks without leaving the app.
- **Workspace separation**: the repo root now highlights `backend/` (server code), `desktop/` (WinForms host), `frontend/` (Vite workspace), and `database/` (schema + backups). Visual Studio solution folders mirror this layout so server files are easy to find.

### Unit Management
- **Comprehensive Unit Editor**: Create units with detailed attributes including:
  - Basic info (name, cost, category, tier, description)
  # Philly's RTS Toolkit

  A next-generation desktop authoring environment for creating, managing, and visualizing RTS unit statcards. The application pairs a C# WinForms/WebView2 host (with SQLite persistence) and a modern Vite + TypeScript + SCSS frontend.

  ## Highlights

  - **Unit Designer** – Rich editor for unit metadata, combat stats, capabilities, and equipment.
  - **Weapon & Ammo Library** – Manage reusable weapon templates, ammo definitions, and fire modes with automatic ballistic helpers.
  - **Formations & Nations** – Compose higher-order organizations and view aggregate stats.
  - **Analytics** – Stats dashboard, upcoming charting modules, and planned export pipelines.
  - **Persistent Storage** – SQLite mirrors all payload data while JSON backups (`database/json/*.json`) remain available for import/export.

  ## Prerequisites

  - Windows 10/11
  - [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
  - [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
  - [Node.js 18+](https://nodejs.org/) for the Vite build

  ## Setup & Run

  ```bash
  # Clone the repo
  git clone https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit.git
  cd Philly-s-RTS-Toolkit
  ```

  ## Tests & Continuous Integration

  - **Frontend unit tests**: `cd frontend/app && npm install && npm run test` executes the Vitest suite that now covers shared helpers plus the critical services that proxy host messages.
  - **Frontend build**: `npm run build` (in `frontend/app`) produces the Vite bundle consumed by the WinForms host. The CI workflow runs the build before the tests to ensure regressions surface early.
  - **Desktop tests**: `dotnet test "Philly's RTS Toolkit.sln"` runs the new `PhillyRTSToolkit.Tests` project, which exercises `DatabaseService` migrations and SQLite-seeding logic.
  - **GitHub Actions**: `.github/workflows/ci.yml` provisions Node 20 and .NET 8 on `windows-latest`, runs the Vite build, Vitest, and `dotnet test`, and uploads standard test logs. Use it as the canonical signal before merging.

