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
  - Combat stats (armor, health, squad size, visual range)
  - Movement stats (speed, stealth, weight)
  - Equipment and capabilities (grenades, special abilities)
  - Weapon loadouts with ammunition types
- **Unit Browser**: Search, filter, and sort units by various criteria
- **Visual Statcards**: Generate professional-looking unit cards with all relevant information

### Weapon & Ammunition System
- **Weapon Library**: Maintain a reusable library of weapons with:
  - Caliber, range, and category
  - Ballistics (muzzle velocity, dispersion, barrel length)
  - Fire modes and reload speeds
  - Custom color-coded tags
- **Ammunition Editor**: Define ammunition types with:
  - Penetration and HE values
  - Range and dispersion modifiers
  - Grain weight and special notes

### Organization & Hierarchy
- **Formation Editor**: Group units into tactical formations with categories
- **Nation Builder**: Create nations composed of multiple formations
- **Visual Overview**: View aggregated statistics for formations and nations

### Data Management
- **JSON Import/Export**: Save and load complete datasets
- **Sample Data**: Quick-start with pre-loaded example units
- **Persistent Storage**: Local database for weapons, ammo, and unit data
- **Export Options**: Generate PNG images of statcards or print directly

### User Interface
- **Multiple Themes**: Choose from Aero Blue, Midnight Violet, Emerald, or High Contrast
- **Modern UI**: Glass-morphism design with responsive layout
- **Fullscreen Mode**: Press F11 for distraction-free editing
- **Statistics Dashboard**: Performance radar charts and top unit rankings

## Getting Started

### Prerequisites

- **Windows** (Windows 10 or later recommended)
- **.NET 8.0 SDK or Runtime** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **WebView2 Runtime** - Usually pre-installed on Windows 10/11, or [download here](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit.git
   cd Philly-s-RTS-Toolkit
   ```

2. **Run the toolkit**:
   
   **Option A - Using the batch file (Easiest)**:
   ```bash
   run_toolkit.bat
   ```
   This will automatically build and launch the application.

   **Option B - Manual build**:
   ```bash
   cd desktop
   dotnet build PhillyRTSToolkit.csproj -c Release
   cd bin/Release/net8.0-windows
   ./PhillyRTSToolkit.exe
   ```

### First Launch

When you first open the toolkit:

1. Click **"Load sample data"** to get started with example units
2. Explore the different editors using the navigation buttons on the left
3. Try rendering statcards by clicking **"Render statcards"**
4. Experiment with the theme selector in the settings panel

## Usage

### Creating Your First Unit

1. Click the **"Unit"** editor button in the navigation panel
2. Click **"Add new unit"** at the bottom of the editor
3. Fill in the basic information:
   - Unit name (e.g., "Alpha Squad")
   - Cost in points
   - Category (e.g., "Infantry")
   - Stats (armor, health, speed, etc.)
4. Add weapons using the **"Add weapon"** button
5. Click **"Save Unit"** to store your changes
6. Click **"Render statcards"** to visualize your unit

### Working with Weapons

1. Navigate to the **"Weapon"** editor
2. Click **"Add new weapon"** to create a new weapon template
3. Define the weapon's properties (caliber, range, fire modes, etc.)
4. Save the weapon - it will be available in the unit editor's weapon library
5. Use the import/export buttons to share weapon libraries

### Building Formations and Nations

1. Create units first (see above)
2. Open the **"Formation"** editor
3. Add a new formation and assign units to categories
4. Save the formation
5. Open the **"Nation"** editor
6. Create a nation and assign formations to it
7. View aggregated statistics in the **"Nation"** overview

### Data Management

- **Save your work**: Click **"Save JSON"** to export all data
- **Load data**: Click **"Load JSON"** to import previously saved data
- **Export individual nations**: Use the nation overview export button
- **Export statcards**: Use **"Export cards PNG"** to save images

## Project Structure

```
Philly-s-RTS-Toolkit/
├── database/           # JSON data files (units, formations, weapons, etc.)
├── desktop/           # C# Windows Forms application
│   ├── MainForm.cs    # Main application window with WebView2
│   ├── Program.cs     # Application entry point
│   └── PhillyRTSToolkit.csproj
├── libs/              # JavaScript libraries (Chart.js, html2canvas)
├── index.html         # Main web interface
├── script.js          # Application logic
├── style.css          # Styling and themes
└── run_toolkit.bat    # Quick launch script
```

## Development

### Technology Stack

- **Backend**: C# with .NET 8.0 and Windows Forms
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Rendering**: Microsoft WebView2 (Chromium-based)
- **Charting**: Chart.js for radar diagrams
- **Export**: html2canvas for PNG generation

### Building from Source

```bash
# Navigate to the desktop project
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

- Report bugs or suggest features via GitHub Issues
- Submit pull requests with improvements
- Share your unit/weapon libraries with the community
- Improve documentation or add translations

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

## Support

For questions, issues, or suggestions:
- Open an issue on [GitHub](https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/issues)
- Check existing documentation and sample data
- Review the in-app hints and tooltips

---

**Note**: This toolkit is designed for creating balanced unit designs for RTS games and simulations. All military unit data is for gaming purposes only.
