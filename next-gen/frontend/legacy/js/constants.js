(function initConstants() {
  const themes = {
  default: {
    bg: "#081528",
    panel: "rgba(255, 255, 255, 0.08)",
    panelStrong: "rgba(255, 255, 255, 0.12)",
    stroke: "rgba(255, 255, 255, 0.22)",
    text: "#eaf3ff",
    muted: "#afc0d8",
    accent: "#76c3ff",
  },
  midnight: {
    bg: "#0d0b1f",
    panel: "rgba(255, 255, 255, 0.07)",
    panelStrong: "rgba(255, 255, 255, 0.12)",
    stroke: "rgba(255, 255, 255, 0.28)",
    text: "#f1eaff",
    muted: "#bcb4d8",
    accent: "#9f7bff",
  },
  emerald: {
    bg: "#062016",
    panel: "rgba(255, 255, 255, 0.07)",
    panelStrong: "rgba(255, 255, 255, 0.12)",
    stroke: "rgba(255, 255, 255, 0.28)",
    text: "#e4f7f0",
    muted: "#a7c9bc",
    accent: "#4ade80",
  },
  contrast: {
    bg: "#0b0b0b",
    panel: "rgba(255, 255, 255, 0.14)",
    panelStrong: "rgba(255, 255, 255, 0.2)",
    stroke: "rgba(255, 255, 255, 0.35)",
    text: "#ffffff",
    muted: "#d0d0d0",
    accent: "#ffcc33",
  },
  };

  const fallbackImage =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60";

  const subcategoryMap = {
  "": ["None"],
  INF: ["None", "Special Forces", "Special Operations Forces", "Shock", "Regular", "Reserve", "Militia", "Guerrilla"],
  VEH: ["None", "Wheeled", "Tracked"],
  TNK: ["None", "Light Tank", "Main Battle Tank", "Heavy Tank"],
  IFV: ["None", "Tracked IFV", "Wheeled IFV"],
  SUP: ["None", "Artillery", "Air Defense", "Mortar", "Missile"],
  AIR: ["None", "Fixed Wing", "Rotary Wing", "UAV"],
  LOG: ["None", "Transport", "Supply", "Engineering"],
  };

  const sampleData = {
  units: [
    {
      name: "Raptor Squad",
      price: "$1,050",
      category: "Infantry",
      preset: "infantry",
      internalCategory: "INF",
      subCategory: "Shock",
      trainingLevel: "Standard",
      description: "Light infantry squad with grenadier attachments.",
      tier: "Tier 2",
      training: "Advanced",
      proficiency: "Marksmen",
      image:
        "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=60",
      stats: {
        armor: "Kevlar IIIA",
        health: 120,
        squadSize: 4,
        visualRange: "550 m",
        stealth: "-10%",
        speed: "4.5 m/s",
        weight: "Medium",
      },
      grenades: { smoke: 2, flash: 2, thermite: 1, frag: 2, total: 7 },
      capabilities: {
        staticLineJump: true,
        haloHaho: true,
        sprint: { distance: "160 m", speed: "7 m/s", cooldown: "22 s" },
        laserDesignator: true,
      },
      guns: [
        {
          name: "M4A1",
          count: 4,
          range: "400 m",
          ammoPerSoldier: "180",
          totalAmmo: "720",
          penetration: "Tier 2",
          heDeadliness: "Low",
          dispersion: "0.6 MOA",
          category: "Rifle",
          ammoTypes: [
            { name: "M855A1", penetration: "5.56: light armor", heDeadliness: "Low", dispersion: "0.6 MOA" },
            { name: "MK262", penetration: "Better barrier", heDeadliness: "Low", dispersion: "0.5 MOA" },
          ],
          fireModes: ["Auto", "Burst", "Semi"],
        },
        {
          name: "M320 (HE/SMK mix)",
          count: 2,
          range: "250 m",
          ammoPerSoldier: "18",
          totalAmmo: "36",
          penetration: "1.5 cm RHA",
          heDeadliness: "High",
          dispersion: "0.9 MOA",
          category: "Launcher",
          ammoTypes: [
            { name: "HE", penetration: "Frag", heDeadliness: "High", dispersion: "1.0 MOA" },
            { name: "Smoke", penetration: "N/A", heDeadliness: "Low", dispersion: "1.0 MOA" },
          ],
          fireModes: ["Indirect"],
        },
      ],
      equipment: [
        { name: "Radio Kit", count: 1, type: "Comms", notes: "Encrypted" },
        { name: "Med Kit", count: 1, type: "Support", notes: "Squad-level" },
      ],
    },
    {
      name: "Titan MBT",
      price: "$4,900",
      category: "Armor",
      preset: "vehicle",
      internalCategory: "TNK",
      trainingLevel: "Veteran",
      description: "Heavy MBT with composite/ERA protection.",
      tier: "Heavy",
      training: "Armored Corps",
      proficiency: "Veteran",
      image:
        "https://images.unsplash.com/photo-1505594444998-0e6850b05b7e?auto=format&fit=crop&w=1200&q=60",
      stats: {
        armor: "Composite/ERA",
        health: 950,
        squadSize: 3,
        visualRange: "2.4 km",
        stealth: "None",
        speed: "70 km/h",
        weight: "62 t",
      },
      grenades: { smoke: 12, flash: 0, thermite: 0, frag: 0, total: 12 },
      capabilities: {
        staticLineJump: false,
        haloHaho: false,
        sprint: { distance: "N/A", speed: "-", cooldown: "-" },
        laserDesignator: "Thermal + LRF",
      },
      guns: [
        {
          name: "120mm Smoothbore",
          count: 1,
          range: "3.5 km",
          ammoPerSoldier: "-",
          totalAmmo: "36",
          penetration: "APFSDS: 650mm",
          heDeadliness: "HEAT: 6.5m",
          dispersion: "0.35 mil",
          category: "Cannon",
          ammoTypes: [
            { name: "APFSDS", penetration: "650mm RHA", heDeadliness: "Low", dispersion: "0.35 mil" },
            { name: "HEAT", penetration: "450mm RHA", heDeadliness: "6.5m blast", dispersion: "0.4 mil" },
          ],
          fireModes: ["Direct", "Top Attack"],
        },
        {
          name: "Coaxial 7.62",
          count: 1,
          range: "800 m",
          ammoPerSoldier: "-",
          totalAmmo: "4,800",
          penetration: "Tier 1",
          heDeadliness: "Low",
          dispersion: "1.2 MOA",
          category: "Coax MG",
          fireModes: ["Direct"],
        },
        {
          name: "RCWS .50",
          count: 1,
          range: "1,200 m",
          ammoPerSoldier: "-",
          totalAmmo: "800",
          penetration: "12mm RHA",
          heDeadliness: "Low/HEI",
          dispersion: "0.8 MOA",
          category: "RCWS",
          fireModes: ["Direct"],
        },
      ],
      equipment: [
        { name: "Smoke Launchers", count: 12, type: "Defensive", notes: "360 deg coverage" },
        { name: "Spare Tracks", count: 2, type: "Maintenance", notes: "" },
      ],
    },
  ],
  formations: [
    {
      name: "Northern Coalition Core",
      description: "Infantry and armor core forces",
      categories: [
        { name: "Infantry", units: [0] },
        { name: "Armor", units: [1] },
      ],
    },
  ],
  nations: [
    {
      name: "Northern Coalition",
      description: "Coalition of northern states with combined arms",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60",
      formations: [0],
    },
  ],
  };

  window.RTS = window.RTS || {};
  window.RTS.constants = { themes, fallbackImage, subcategoryMap, sampleData };
})();
