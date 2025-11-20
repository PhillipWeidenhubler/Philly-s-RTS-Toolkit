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

## Features

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
  - **Persistent Storage** – SQLite mirrors all payload data while JSON backups (`database/*.json`) remain available for import/export.

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

  # Install frontend deps (one-time)
  cd next-gen/frontend/app
  npm install
  cd ../../..

  # Build frontend + desktop host, then launch
  run_next_gen.bat
  ```

  `run_next_gen.bat` executes `npm run build` inside `next-gen/frontend/app`, then compiles and starts `next-gen/desktop/PhillyRTSToolkit.csproj`. Re-run the script whenever you change frontend assets or the desktop host.

  ### Manual workflow

  ```bash
  # Frontend development
  cd next-gen/frontend/app
  npm run dev          # Vite dev server
  npm run build        # Production bundle -> dist/

  # Desktop host (in another terminal)
  cd ../../desktop
  dotnet run --project PhillyRTSToolkit.csproj -c Release
  ```

  The desktop host always serves `next-gen/frontend/app/dist/index.html`. Ensure the bundle exists (via `npm run build`) before launching the C# project.

  ## Project Structure

  ```
  Philly-s-RTS-Toolkit/
  ├── database/                  # JSON backups (state.json, units.json, formations.json, ...)
  ├── next-gen/
  │   ├── desktop/               # WinForms/WebView2 host + SQLite layer
  │   │   ├── MainForm.cs
  │   │   ├── DatabaseService.cs
  │   │   └── database/          # schema.sql, rts.db, seed files
  │   └── frontend/
  │       └── app/               # Vite + TS + SCSS workspace
  │           ├── src/           # Modules, services, styles
  │           └── dist/          # Built assets consumed by the host
  ├── run_next_gen.bat          # Convenience build+run script
  └── README.md
  ```

  ## Development Notes

  - WebView messages follow `{ type, payload }` envelopes. Desktop handlers live in `next-gen/desktop/MainForm.cs`; TypeScript services reside in `next-gen/frontend/app/src/services`.
  - SQLite schema + data access live under `next-gen/desktop/database`. Keep schema changes, `DatabaseService`, and frontend types (`next-gen/frontend/app/src/types`) synchronized.
  - The host persists payload snapshots to SQLite and rewrites JSON backups for external tooling. Guard against missing arrays when mutating payload sections.
  - Use `npm run dev` for rapid frontend iteration. The WinForms host can be pointed at the dev server if needed, but production builds always ship the static `dist/` output.

  ## Contributing

  Contributions are welcome! Here's how to get involved:

  **For Developers:**
  1. Update/extend shared types in `next-gen/frontend/app/src/types`.
  2. Add or adjust WebView message handling + persistence in `next-gen/desktop`.
  3. Wire new UI modules/services inside `next-gen/frontend/app/src/modules`.
  4. Run `npm run build` followed by `run_next_gen.bat` (or rebuild manually) before opening a PR.

  **For Everyone:**
  - 💬 Join [GitHub Discussions](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions) to share ideas
  - 🐛 Report bugs via [GitHub Issues](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/issues)
  - 📚 Share your unit/weapon libraries in [Data Libraries discussions](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/data-libraries)
  - 📖 Improve documentation or add examples
  - 🎨 Share your designs in [Show & Tell](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/show-tell)

  Please describe the problem, environment, and repro steps when filing bugs.

  ## License & Credits

  - Developed by Phillip Weidenhubler.
  - Built with .NET 8, WebView2, SQLite, Vite, TypeScript, and SCSS.
  - Third-party libraries retain their original licenses; see the respective packages for details.

  ---

  **Note:** The legacy WinForms/HTML toolkit has been removed from this repository. Retrieve it from earlier tags/commits if you need historical assets.
cd desktop

# Restore dependencies
dotnet restore

# Build the project
dotnet build PhillyRTSToolkit.csproj -c Release

# Run the application
dotnet run -c Release
```

### Contributing

Contributions are welcome! Here are some ways you can help:

- 💬 Join [GitHub Discussions](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions) to share ideas and get help
- 🐛 Report bugs or suggest features via [GitHub Issues](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/issues)
- 🔀 Submit pull requests with improvements
- 📚 Share your unit/weapon libraries in [Data Libraries discussions](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/data-libraries)
- 📖 Improve documentation or add translations
- 🎨 Showcase your work in [Show & Tell discussions](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/show-tell)

See our [Discussion Guide](.github/DISCUSSIONS.md) for more information on community channels.

## Keyboard Shortcuts

- **F11**: Toggle fullscreen mode
- **Ctrl+S**: Save data (when available in context)

## Data Format

All data is stored in JSON format in the `database/` folder:

- `units.json` - Unit definitions
- `formations.json` - Formation compositions
- `nations.json` - Nation hierarchies
- `weapons.json` - Weapon templates
- `ammo.json` - Ammunition types
- `weaponTags.json` - Custom tag colors
- `state.json` - Combined application state

This format makes it easy to:
- Version control your designs
- Share configurations with teammates
- Edit directly in a text editor if needed
- Integrate with other tools or scripts

## Screenshots

The toolkit features a modern glass-morphism UI with:
- Tabbed navigation for different editors
- Color-coded weapon and ammo tags
- Responsive grid layouts
- Professional statcard rendering
- Interactive radar charts for unit comparison

## License

This project is open source. Please check the repository for specific license information.

## Credits

Developed by Phillip Weidenhubler

**Third-party libraries:**
- [Chart.js](https://www.chartjs.org/) - Chart rendering
- [html2canvas](https://html2canvas.hertzen.com/) - Screenshot generation
- [Microsoft WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) - Web rendering engine

## Community & Discussions

Join our community discussions to share designs, get help, and collaborate:

**Discussion Channels:**
- 💬 [General Discussion](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions) - General conversations and questions
- 🎨 [Unit Design Showcase](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/unit-design-showcase) - Share your unit designs
- ⚔️ [Weapons & Ballistics](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/weapons-ballistics) - Discuss weapon systems
- 🏛️ [Formations & Nations](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/formations-nations) - Share organizational designs
- 📚 [Data Libraries](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/data-libraries) - Community data sharing
- 💡 [Ideas & Features](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/ideas) - Suggest improvements
- 🔧 [Technical Support](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/technical-support) - Get help with issues
- 👨‍💻 [Development](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions/categories/development) - Contribute to the project

📖 **[Full Discussion Guide](.github/DISCUSSIONS.md)** - Learn how to use discussions effectively

## Support

For questions, issues, or suggestions:
- 💬 Join [GitHub Discussions](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/discussions) for community help
- 🐛 Open an [issue](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/issues) for bug reports
- 📖 Check existing documentation and sample data
- 💡 Review the in-app hints and tooltips

---

**Note**: This toolkit is designed for creating balanced unit designs for RTS games and simulations. All military unit data is for gaming purposes only.
