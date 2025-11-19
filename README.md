# Philly's RTS Toolkit

A comprehensive desktop application for creating, managing, and visualizing RTS (Real-Time Strategy) game unit statistics, formations, and nations. Built with a modern web-based UI wrapped in a native Windows desktop application.

## 🎯 Overview

Philly's RTS Toolkit is a specialized tool designed for game developers, modders, and RTS enthusiasts who need to design, balance, and document military units, formations, and factions for real-time strategy games. The toolkit provides an intuitive interface for creating detailed unit statcards with comprehensive weapon systems, equipment, and tactical capabilities.

## ✨ Key Features

### Unit Management
- **Comprehensive Unit Editor**: Create and edit detailed unit profiles with:
  - Basic stats (armor, health, squad size, range, stealth, speed, weight)
  - Grenades inventory (smoke, flash, thermite, frag)
  - Special capabilities (static line jump, HALO/HAHO, laser designator, sprint mechanics)
  - Multiple weapons and equipment loadouts (up to 10 each)
  - Tier system (1-9) and categorization
  - Image support with drag-and-drop functionality

### Formation & Nation Builders
- **Formation Editor**: Compose tactical formations from multiple units
  - Aggregate unit statistics
  - Formation-specific imagery and descriptions
  - Export/import formations as JSON

- **Nation Editor**: Build complete factions from formations
  - Hierarchical organization (Nation → Formations → Units)
  - Nation-level statistics aggregation
  - Full import/export capabilities

### Weapon & Ammunition Systems
- **Weapon Library**: Maintain a database of weapons with:
  - Detailed ballistic properties (caliber, barrel length, muzzle velocity)
  - Fire modes and reload speeds
  - Range and dispersion characteristics
  - Categorization and tagging system

- **Ammo Library**: Define ammunition types with:
  - Penetration and HE (High Explosive) values
  - Grain weight and ballistic characteristics
  - Caliber-specific properties
  - Custom dispersion and range modifiers

### Visualization & Export
- **Statcard Renderer**: Generate professional-looking unit statcards
  - PNG export functionality
  - Print support
  - Customizable themes (Aero Blue, Midnight Violet, Emerald, High Contrast)

- **Statistics Dashboard**: Performance radar charts for:
  - Unit comparisons
  - Formation analysis
  - Nation-wide metrics

### Data Management
- **Flexible Data Storage**: 
  - JSON-based database system
  - Auto-save functionality
  - Import/export individual units, formations, or nations
  - Sample data loading for quick start

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Desktop Host**: .NET 8.0 (Windows Forms + WebView2)
- **Libraries**: 
  - html2canvas.min.js (for rendering cards to PNG)
  - Chart.js (for statistics visualizations)
- **Data Format**: JSON

## 📋 Prerequisites

- **Windows OS** (Windows 10 or later recommended)
- **.NET 8.0 SDK** or later
- **Visual Studio 2022** (optional, for development)

## 🚀 Installation & Usage

### Quick Start (End Users)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit.git
   cd Philly-s-RTS-Toolkit
   ```

2. **Run the toolkit**:
   ```bash
   run_toolkit.bat
   ```

   This batch file will:
   - Build the desktop application
   - Launch the toolkit automatically

### Developer Setup

1. **Open the solution in Visual Studio**:
   ```bash
   "RTS UNIT STATCARDS.sln"
   ```

2. **Build the project**:
   - Open Visual Studio 2022
   - Load `RTS UNIT STATCARDS.sln`
   - Build → Build Solution (Ctrl+Shift+B)

3. **Run the application**:
   - Press F5 or click "Start" in Visual Studio

### Manual Build

```bash
cd desktop
dotnet build PhillyRTSToolkit.csproj -c Release
dotnet run --project PhillyRTSToolkit.csproj -c Release
```

## 📖 How to Use

### Creating Your First Unit

1. **Load sample data** (optional):
   - Click "Load sample data" in the header to populate with example units

2. **Open the Unit Editor**:
   - Click "Unit" under the "Editors" section in the navigation sidebar

3. **Add a new unit**:
   - Click "Add new unit" button
   - Fill in basic information (name, cost, category, tier)

4. **Configure stats**:
   - Set armor, health, squad size, range, stealth, speed, and weight values
   - Add grenade loadouts
   - Configure special capabilities

5. **Add weapons**:
   - Click "Add weapon" to select from the weapon library
   - Configure ammo types and quantities

6. **Save your unit**:
   - Click "Save Unit" to persist changes to the JSON database

### Building Formations

1. Navigate to **Formation Editor**
2. Create a new formation and assign units
3. The toolkit automatically aggregates unit statistics
4. Save and export your formation

### Creating Nations

1. Navigate to **Nation Editor**
2. Create a new nation
3. Assign formations to build your faction
4. View aggregated statistics at the nation level

### Rendering Statcards

1. Ensure units are saved
2. Click **"Render statcards"** in the header
3. Review generated cards in the view section
4. Click **"Export cards PNG"** to download images
5. Or use **"Print"** to print directly

### Customizing Themes

1. Click **"Settings"** in the header
2. Select a theme from the dropdown:
   - Aero Blue (default)
   - Midnight Violet
   - Emerald
   - High Contrast
3. Click **"Apply theme"** to activate

## 📁 Project Structure

```
Philly-s-RTS-Toolkit/
├── desktop/                    # .NET desktop application
│   ├── MainForm.cs             # WebView2 host and file I/O
│   ├── MainForm.Designer.cs    # Form designer code
│   ├── Program.cs              # Entry point
│   └── PhillyRTSToolkit.csproj # Project file
├── database/                   # JSON data files
│   ├── units.json              # Unit definitions
│   ├── formations.json         # Formation compositions
│   ├── nations.json            # Nation configurations
│   ├── weapons.json            # Weapon library
│   ├── ammo.json               # Ammunition library
│   ├── weaponTags.json         # Weapon categorization
│   └── state.json              # Application state
├── libs/                       # JavaScript libraries
│   ├── html2canvas.min.js      # Canvas rendering
│   └── chart.umd.min.js        # Chart visualizations
├── index.html                  # Main application UI
├── script.js                   # Application logic (~4400 lines)
├── style.css                   # Styling (~1550 lines)
├── run_toolkit.bat             # Quick launcher script
└── RTS UNIT STATCARDS.sln      # Visual Studio solution
```

## 💾 Data Format

All data is stored in JSON format in the `database/` directory. This makes it easy to:
- Version control your game balance
- Share unit/formation/nation configurations
- Import/export data between projects
- Integrate with other tools

### Example Unit Structure

```json
{
  "name": "Delta Force",
  "price": 120,
  "category": "DA/SR SOF INFANTRY",
  "tier": "1",
  "stats": {
    "armor": 8,
    "health": 80,
    "squadSize": 8,
    "visualRange": 2000,
    "stealth": 80,
    "speed": 2.5,
    "weight": 1200
  },
  "grenades": {
    "smoke": "8",
    "flash": "8",
    "thermite": "2",
    "frag": "12"
  },
  "capabilities": {
    "haloHaho": true,
    "sprint": {
      "distance": 5000,
      "speed": 3.5,
      "cooldown": 120
    }
  },
  "guns": [...],
  "equipment": [...]
}
```

## 🔑 Keyboard Shortcuts

- **F11**: Toggle fullscreen mode

## 🐛 Troubleshooting

### Application won't start
- Ensure .NET 8.0 SDK is installed
- Check that all files are in their correct locations
- Verify `index.html` exists in the root directory

### Data not saving
- Check that the `database/` directory exists and is writable
- Review the application logs (Download logs button in header)

### Build errors
- Clean the solution: `dotnet clean`
- Rebuild: `dotnet build -c Release`
- Ensure WebView2 Runtime is installed on Windows

## 🤝 Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Keep commits focused and atomic

## 📄 License

This project is open source. Please check with the repository owner for specific licensing terms.

## 🙏 Acknowledgments

- Built with [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) for native desktop integration
- Visualization powered by [Chart.js](https://www.chartjs.org/)
- Card rendering using [html2canvas](https://html2canvas.hertzen.com/)

## 📧 Contact & Support

For questions, suggestions, or bug reports:
- Open an issue on GitHub
- Contact the repository maintainer

---

**Built with ❤️ for the RTS community**
