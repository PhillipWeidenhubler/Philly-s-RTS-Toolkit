(() => {
  const dataInput = document.getElementById("dataInput");
  const renderButton = document.getElementById("renderCards");
  const loadSampleButton = document.getElementById("loadSample");
  const loadSavedButton = document.getElementById("loadSaved");
  const saveDataButton = document.getElementById("saveData");
  const refreshAppButton = document.getElementById("refreshApp");
  const loadDataFile = document.getElementById("loadDataFile");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const themeSelect = document.getElementById("themeSelect");
  const applyThemeBtn = document.getElementById("applyThemeBtn");
  const exportPngButton = document.getElementById("exportPng");
  const printButton = document.getElementById("printCards");
  const cardsContainer = document.getElementById("cards");
  const flash = document.getElementById("flash");
  const unitSelect = document.getElementById("unitSelect");
  const unitName = document.getElementById("unitName");
  const unitPrice = document.getElementById("unitPrice");
  const unitCategory = document.getElementById("unitCategory");
  const unitTier = document.getElementById("unitTier");
  const unitDescription = document.getElementById("unitDescription");
  const unitInternalCategory = document.getElementById("unitInternalCategory");
  const unitSubCategory = document.getElementById("unitSubCategory");
  const unitImage = document.getElementById("unitImage");
  const statArmor = document.getElementById("statArmor");
  const statHealth = document.getElementById("statHealth");
  const statSquad = document.getElementById("statSquad");
  const statRange = document.getElementById("statRange");
  const statStealth = document.getElementById("statStealth");
  const statSpeed = document.getElementById("statSpeed");
  const statWeight = document.getElementById("statWeight");
  const grenSmoke = document.getElementById("grenSmoke");
  const grenFlash = document.getElementById("grenFlash");
  const grenThermite = document.getElementById("grenThermite");
  const grenFrag = document.getElementById("grenFrag");
  const grenTotal = document.getElementById("grenTotal");
  const capStatic = document.getElementById("capStatic");
  const capHalo = document.getElementById("capHalo");
  const capLaser = document.getElementById("capLaser");
  const sprintDistance = document.getElementById("sprintDistance");
  const sprintSpeed = document.getElementById("sprintSpeed");
  const sprintCooldown = document.getElementById("sprintCooldown");
  const gunList = document.getElementById("gunList");
  const addGunButton = document.getElementById("addGun");
  const equipmentList = document.getElementById("equipmentList");
  const addEquipmentButton = document.getElementById("addEquipment");
  const weaponLibrary = document.getElementById("weaponLibrary");
  const categorySearch = document.getElementById("categorySearch");
  const ammoDatalistContainer = document.createElement("div");
  ammoDatalistContainer.id = "ammo-datalists";
  document.body.appendChild(ammoDatalistContainer);
  const saveUnitButton = document.getElementById("saveUnit");
  const addUnitButton = document.getElementById("addUnit");
  const deleteUnitButton = document.getElementById("deleteUnit");
  const downloadLogsBtn = document.getElementById("downloadLogs");
  const viewModeBtn = document.getElementById("viewModeBtn");
  const editModeBtn = document.getElementById("editModeBtn");
  const formationOverviewBtn = document.getElementById("formationOverviewBtn");
  const formationEditorBtn = document.getElementById("formationEditorBtn");
  const nationOverviewBtn = document.getElementById("nationOverviewBtn");
  const nationEditorBtn = document.getElementById("nationEditorBtn");
  // Overview buttons removed in nav
  const viewSection = document.getElementById("viewSection");
  const editSection = document.getElementById("editSection");
  const viewControlsSection = document.getElementById("viewControlsSection");
  const formationEditorSection = document.getElementById("formationEditorSection");
  const formationOverviewSection = document.getElementById("formationOverviewSection");
  const nationEditorSection = document.getElementById("nationEditorSection");
  const nationOverviewSection = document.getElementById("nationOverviewSection");
  const weaponEditorSection = document.getElementById("weaponEditorSection");
  const ammoEditorSection = document.getElementById("ammoEditorSection");
  const nationOverviewSelect = document.getElementById("nationOverviewSelect");
  const searchInput = document.getElementById("searchInput");
  const filterCategoryInput = document.getElementById("filterCategory");
  const filterInternalSelect = document.getElementById("filterInternal");
  const filterTierSelect = document.getElementById("filterTier");
  const sortUnitsSelect = document.getElementById("sortUnits");
  const unitBrowser = document.getElementById("unitBrowser");
  const formationSelect = document.getElementById("formationSelect");
  const formationName = document.getElementById("formationName");
  const formationDescription = document.getElementById("formationDescription");
  const formationImage = document.getElementById("formationImage");
  const weaponEditorBtn = document.getElementById("weaponEditorBtn");
  const ammoEditorBtn = document.getElementById("ammoEditorBtn");
  const topUnitsList = document.getElementById("topUnitsList");
  const topFormationsList = document.getElementById("topFormationsList");
  const topNationsList = document.getElementById("topNationsList");
  const topUnitsBlock = document.getElementById("topUnitsBlock");
  const topFormationsBlock = document.getElementById("topFormationsBlock");
  const topNationsBlock = document.getElementById("topNationsBlock");
  const statsBtn = document.getElementById("statsBtn");
  const statsSection = document.getElementById("statsSection");
  const statsTypeButtons = document.querySelectorAll("[data-stats-type]");
  const addFormationButton = document.getElementById("addFormation");
  const saveFormationButton = document.getElementById("saveFormation");
  const deleteFormationButton = document.getElementById("deleteFormation");
  const nationSelect = document.getElementById("nationSelect");
  const nationName = document.getElementById("nationName");
  const nationDescription = document.getElementById("nationDescription");
  const nationImage = document.getElementById("nationImage");
  const nationFormationsList = document.getElementById("nationFormationsList");
  const addNationButton = document.getElementById("addNation");
  const saveNationButton = document.getElementById("saveNation");
  const deleteNationButton = document.getElementById("deleteNation");
  const exportNationButton = document.getElementById("exportNation");
  const importNationButton = document.getElementById("importNation");
  const importNationFile = document.getElementById("importNationFile");
  const categoryList = document.getElementById("categoryList");
  const addCategoryButton = document.getElementById("addCategory");
  const weaponSelect = document.getElementById("weaponSelect");
  const weaponSearch = document.getElementById("weaponSearch");
  const exportWeaponLibBtn = document.getElementById("exportWeaponLib");
  const importWeaponLibBtn = document.getElementById("importWeaponLib");
  const importWeaponFile = document.getElementById("importWeaponFile");
  const weaponName = document.getElementById("weaponName");
  const weaponCaliber = document.getElementById("weaponCaliber");
  const weaponRange = document.getElementById("weaponRange");
  const weaponCategory = document.getElementById("weaponCategory");
  const weaponMuzzle = document.getElementById("weaponMuzzle");
  const weaponDispersion = document.getElementById("weaponDispersion");
  const weaponBarrel = document.getElementById("weaponBarrel");
  const weaponReload = document.getElementById("weaponReload");
  const weaponFireModes = document.getElementById("weaponFireModes");
  const saveWeaponButton = document.getElementById("saveWeapon");
  const addWeaponButton = document.getElementById("addWeapon");
  const duplicateWeaponButton = document.getElementById("duplicateWeapon");
  const deleteWeaponButton = document.getElementById("deleteWeapon");
  const weaponPreview = document.getElementById("weaponPreview");
  const ammoSelect = document.getElementById("ammoSelect");
  const ammoSearch = document.getElementById("ammoSearch");
  const exportAmmoLibBtn = document.getElementById("exportAmmoLib");
  const importAmmoLibBtn = document.getElementById("importAmmoLib");
  const importAmmoFile = document.getElementById("importAmmoFile");
  const ammoNameInput = document.getElementById("ammoName");
  const ammoCaliberInput = document.getElementById("ammoCaliber");
  const ammoCaliberDescInput = document.getElementById("ammoCaliberDesc");
  const ammoPenetrationInput = document.getElementById("ammoPenetration");
  const ammoHEInput = document.getElementById("ammoHE");
  const ammoDispersionInput = document.getElementById("ammoDispersion");
  const ammoRangeInput = document.getElementById("ammoRange");
  const ammoGrainInput = document.getElementById("ammoGrain");
  const ammoNotesInput = document.getElementById("ammoNotes");
  const saveAmmoButton = document.getElementById("saveAmmoTemplate");
  const addAmmoButton = document.getElementById("addAmmoTemplate");
  const duplicateAmmoButton = document.getElementById("duplicateAmmo");
  const deleteAmmoButton = document.getElementById("deleteAmmo");
  const ammoPreview = document.getElementById("ammoPreview");
  const ammoCaliberList = document.getElementById("ammoCaliberList");
  const unitImageDrop = document.getElementById("unitImageDrop");
  const formationImageDrop = document.getElementById("formationImageDrop");
  const nationImageDrop = document.getElementById("nationImageDrop");
  const openUnitImagePicker = document.getElementById("openUnitImagePicker");
  const openFormationImagePicker = document.getElementById("openFormationImagePicker");
  const openNationImagePicker = document.getElementById("openNationImagePicker");
  const imagePicker = document.getElementById("imagePicker");
  const imageGrid = document.getElementById("imageGrid");
  const imageSearch = document.getElementById("imageSearch");
  const closeImagePickerBtn = document.getElementById("closeImagePicker");
  const tagCategoryName = document.getElementById("tagCategoryName");
  const tagCategoryColor = document.getElementById("tagCategoryColor");
  const tagCaliberName = document.getElementById("tagCaliberName");
  const tagCaliberColor = document.getElementById("tagCaliberColor");
  const addCategoryTagBtn = document.getElementById("addCategoryTag");
  const addCaliberTagBtn = document.getElementById("addCaliberTag");
  const categoryTagList = document.getElementById("categoryTagList");
  const caliberTagList = document.getElementById("caliberTagList");

  let currentMode = "view";
  let statsChart;
  let selectedRadar = { unit: null, formation: null, nation: null };
  let statsViewType = "unit";
  const weaponTemplates = {};
  const ammoLibrary = {};
  const imageLibrary = { units: [], formations: [], nations: [] };
  const weaponTags = { categories: {}, calibers: {} };
  const diagLog = [];
  const logEvent = (msg, extra) => {
    const entry = { t: new Date().toISOString(), msg, extra };
    diagLog.push(entry);
    if (diagLog.length > 500) diagLog.shift();
    // console.info("[diag]", msg, extra ?? "");
  };
  // Legacy shim: we now compute fps on ammo, but keep this to avoid runtime errors.
  function estimateMuzzle() {
    return 0;
  }
  function computeAmmoFps(caliber = "", barrelLength = 0, grain = 0) {
    const m = `${caliber}`.match(/(\d{1,3}),(\d{1,3})x(\d{1,3})/);
    const dia = m ? parseFloat(`${m[1]}.${m[2]}`) : 5.56;
    const barrel = parseFloat(barrelLength || 0) || 0;
    const gr = parseFloat(grain || 0) || 0;
    // Simple heuristic fps estimate for ammo: base + barrel effect - grain penalty + caliber tweak
    return Math.max(300, Math.round(2000 + barrel * 45 - gr * 1.5 + (6 - dia) * 15));
  }
  let imagePickerTarget = { input: null, type: "units" };
  let hostSaveTimer = null;
  let autoSaveInterval = null;
  let localDbAttempted = false;
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

  function markDirty() { }
  function resetDirty() { }
  function autoSaveUnit() { }
  function autoSaveNation() { }

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

  function populateSubcategories(selectedInternal = "", value = "") {
    if (!unitSubCategory) return;
    const options = subcategoryMap[selectedInternal] || subcategoryMap[""] || ["None"];
    unitSubCategory.innerHTML = "";
    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt === "None" ? "" : opt;
      option.textContent = opt;
      unitSubCategory.appendChild(option);
    });
    if (value) unitSubCategory.value = value;
  }

  populateSubcategories("", "");

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
          { name: "Smoke Launchers", count: 12, type: "Defensive", notes: "360° coverage" },
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

  function emptyUnit() {
    return {
      name: "",
      price: "",
      category: "",
      tier: "",
      training: "",
      proficiency: "",
      image: "",
      stats: {
        armor: "",
        health: "",
        squadSize: "",
        visualRange: "",
        stealth: "",
        speed: "",
        weight: "",
      },
      grenades: { smoke: "", flash: "", thermite: "", frag: "", total: "" },
      capabilities: {
        staticLineJump: "",
        haloHaho: "",
        sprint: { distance: "", speed: "", cooldown: "" },
        laserDesignator: "",
      },
      guns: [],
      equipment: [],
    };
  }

  function emptyFormation() {
    return { name: "", description: "", categories: [] };
  }

  function emptyNation() {
    return { name: "", description: "", image: "", formations: [] };
  }

  function parseData(showErrors = true) {
    try {
      const raw = dataInput.value || "";
      if (!raw.trim()) return { units: [], formations: [], nations: [] };
      return JSON.parse(raw);
    } catch (err) {
      if (showErrors) {
        showMessage(`Invalid JSON: ${err.message}`, "error");
      }
      return null;
    }
  }

  function showMessage(text, type = "success") {
    flash.textContent = text;
    flash.className = `alert ${type}`;
  }

  function clearMessage() {
    flash.textContent = "";
    flash.className = "alert hidden";
  }

  function valueOrNA(value) {
    return value === undefined || value === null || value === "" ? "N/A" : value;
  }

  function yesNo(value) {
    if (value === undefined || value === null) return "N/A";
    return value === true || value === "true" ? "Yes" : value === false || value === "false" ? "No" : value;
  }

  function parseBoolish(value) {
    if (value === "" || value === undefined || value === null) return "";
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
  }

  function createPill(label, value) {
    const pill = document.createElement("div");
    pill.className = "stat-pill";
    const key = document.createElement("span");
    key.className = "label";
    key.textContent = label;
    const val = document.createElement("span");
    val.className = "strong";
    val.textContent = valueOrNA(value);
    pill.append(key, val);
    return pill;
  }

  function sectionTitle(text) {
    const el = document.createElement("div");
    el.className = "section-title";
    el.textContent = text;
    return el;
  }

  function getTagColor(kind, key) {
    if (!key) return null;
    if (kind === "category") return weaponTags.categories[key] || null;
    if (kind === "caliber") return weaponTags.calibers[key] || null;
    return null;
  }

  function buildGunRow(gun) {
    const row = document.createElement("div");
    row.className = "gun-row";
    const gunCount = Math.max(1, toNumber(gun.count) || 1);
    const ammoPer = Math.max(0, toNumber(gun.ammoPerSoldier) || 0);
    const totalAmmo = gun.totalAmmo !== undefined && gun.totalAmmo !== "" ? gun.totalAmmo : gunCount * ammoPer;

    const head = document.createElement("div");
    head.className = "gun-head";

    const name = document.createElement("div");
    name.className = "gun-title";
    name.textContent = valueOrNA(gun.name);

    const categoryBadge = document.createElement("div");
    categoryBadge.className = "gun-badge";
    categoryBadge.textContent = valueOrNA(gun.category || "Uncategorized");
    const catColor = getTagColor("category", gun.category);
    if (catColor) {
      categoryBadge.style.background = catColor;
      categoryBadge.style.color = "#0b1220";
      categoryBadge.style.border = "1px solid rgba(0,0,0,0.25)";
    }

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "collapse-btn";
    toggle.dataset.action = "toggle-gun";
    toggle.textContent = "Collapse weapon";

    head.append(name, categoryBadge, toggle);

    const metaWrap = document.createElement("div");
    metaWrap.className = "gun-meta-wrap";
    metaWrap.style.gridColumn = "1 / -1";

    // Collapsed view: only category color bar, and below: Caliber, Range, Total Ammo
    const basics = [
      ["Caliber", gun.caliber],
      ["Range", gun.range],
      ["Amount of Weapons", gunCount],
      ["Total Ammo", totalAmmo],
    ];
    basics.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "gun-meta";
      let display = valueOrNA(value);
      if (label === "Caliber") {
        const color = getTagColor("caliber", value);
        if (color) display = `<span class="color-badge"><span class="color-dot" style="background:${color}"></span>${value}</span>`;
      }
      item.innerHTML = `<span class="gun-label">${label}</span><div class="strong">${display}</div>`;
      metaWrap.appendChild(item);
    });
    head.appendChild(metaWrap);

    const details = document.createElement("div");
    details.className = "gun-details";

    // Expanded stats block
    const statsWrap = document.createElement("div");
    statsWrap.className = "gun-meta-wrap";
    const expandedStats = [
      ["Category", gun.category],
      ["Caliber", gun.caliber],
      ["Barrel Length (in)", gun.barrelLength],
      ["Range", gun.range],
      ["Dispersion (cm)", gun.dispersion ? `${toNumber(gun.dispersion)} cm` : valueOrNA(gun.dispersion)],
      ["Amount of Weapons", gunCount],
      ["Ammo/Soldier", ammoPer],
      ["Total Ammo", totalAmmo],
      ["Magazine", gun.magazineSize],
      ["Reload Speed (s)", gun.reloadSpeed],
      ["Target acquisition (s)", gun.targetAcquisition],
      ["Trajectories", Array.isArray(gun.trajectories) ? gun.trajectories.join(", ") : gun.trajectories],
    ];
    expandedStats
      .filter(([, value]) => value !== "" && value !== undefined && value !== null)
      .forEach(([label, value]) => {
        const item = document.createElement("div");
        item.className = "gun-meta";
        let display = valueOrNA(value);
        if (label === "Category") {
          const color = getTagColor("category", value);
          if (color) display = `<span class="color-badge"><span class="color-dot" style="background:${color}"></span>${value}</span>`;
        }
        if (label === "Caliber") {
          const color = getTagColor("caliber", value);
          if (color) display = `<span class="color-badge"><span class="color-dot" style="background:${color}"></span>${value}</span>`;
        }
        item.innerHTML = `<span class="gun-label">${label}</span><div class="strong">${display}</div>`;
        statsWrap.appendChild(item);
      });
    if (statsWrap.children.length) details.appendChild(statsWrap);

    // Fire mode pills
    const fireBlock = document.createElement("div");
    fireBlock.className = "fire-block";
    const fireTitle = document.createElement("div");
    fireTitle.className = "label";
    fireTitle.textContent = "Fire modes";
    const fireListWrap = document.createElement("div");
    fireListWrap.className = "fire-list";

    if (Array.isArray(gun.fireModes) && gun.fireModes.length) {
      gun.fireModes.forEach((fm) => {
        const pill = document.createElement("div");
        pill.className = "fire-row";
        const name = document.createElement("div");
        name.innerHTML = `<strong>${fm.name || "Mode"}</strong>`;
        const ammo = document.createElement("div");
        ammo.textContent = `Ammo/use: ${valueOrNA(fm.ammo)}`;
        const reset = document.createElement("div");
        reset.textContent = `Reset: ${valueOrNA(fm.reset)}s`;
        const range = document.createElement("div");
        if (fm.minRange || fm.maxRange) {
          range.textContent = `Range: ${valueOrNA(fm.minRange)} - ${valueOrNA(fm.maxRange)} m`;
        }
        const hit = document.createElement("div");
        if (fm.hitProbability !== undefined && fm.hitProbability !== null && fm.hitProbability !== "") {
          hit.textContent = `Hit prob: ${valueOrNA(fm.hitProbability)}%`;
        }
        pill.append(name, ammo, reset, range, hit);
        fireListWrap.appendChild(pill);
      });
    } else if (gun.fireModes) {
      const pill = document.createElement("div");
      pill.className = "fire-row";
      pill.textContent = Array.isArray(gun.fireModes) ? gun.fireModes.join(", ") : gun.fireModes;
      fireListWrap.appendChild(pill);
    } else {
      const pill = document.createElement("div");
      pill.className = "fire-row";
      pill.textContent = "N/A";
      fireListWrap.appendChild(pill);
    }
    fireBlock.append(fireTitle, fireListWrap);
    details.appendChild(fireBlock);

    const ammoTypes = Array.isArray(gun.ammoTypes) ? gun.ammoTypes : [];
    if (ammoTypes.length) {
      const ammoList = document.createElement("div");
      ammoList.className = "ammo-types";
      ammoTypes.forEach((ammo) => {
        const pill = document.createElement("div");
        pill.className = "ammo-pill";
        const title = document.createElement("div");
        title.className = "title";
        title.textContent = valueOrNA(ammo.name);
        const details = [];
        if (ammo.ammoType) details.push(ammo.ammoType);
        if (ammo.grain !== undefined && ammo.grain !== "") details.push(`${toNumber(ammo.grain)} gr`);
        if (ammo.fps !== undefined && ammo.fps !== "") details.push(`${toNumber(ammo.fps)} fps`);
        if (ammo.penetration !== undefined && ammo.penetration !== "") details.push(`${toNumber(ammo.penetration)} mm`);
        if (ammo.heDeadliness !== undefined && ammo.heDeadliness !== "") details.push(`HE ${toNumber(ammo.heDeadliness)}`);
        if (ammo.dispersion !== undefined && ammo.dispersion !== "") details.push(`${toNumber(ammo.dispersion)}% disp`);
        if (ammo.rangeMod !== undefined && ammo.rangeMod !== "") details.push(`${toNumber(ammo.rangeMod)}% range`);
        if (ammo.airburst) {
          details.push(`Airburst: ${ammo.subCount || 0} sub, dmg ${ammo.subDamage || 0}, pen ${ammo.subPenetration || 0}`);
        }
        if (ammo.ammoPerSoldier !== undefined && ammo.ammoPerSoldier !== "")
          details.push(`Ammo/Soldier ${toNumber(ammo.ammoPerSoldier)}`);
        if (ammo.notes) details.push(ammo.notes);
        if (ammo.caliber) details.unshift(`Cal ${ammo.caliber}`);
        if (ammo.caliberDesc) details.unshift(ammo.caliberDesc);
        if (details.length) {
          const detail = document.createElement("div");
          detail.className = "detail";
          detail.textContent = details.join(" | ");
          pill.append(title, detail);
        } else {
          pill.append(title);
        }
        ammoList.appendChild(pill);
      });
      details.appendChild(ammoList);
    }

    row.append(head, details);
    return row;
  }

  function addAmmoRow(container, ammo = {}, gunCaliber = "", barrelLen = 0, traits = []) {
    const row = document.createElement("div");
    row.className = "ammo-row";
    if (gunCaliber) row.dataset.caliber = gunCaliber;
    const traitList = Array.isArray(traits) ? traits : [];
    const allowsManualFps = traitList.some((t) => ["law", "rr", "atgm", "manpads"].includes((t || "").toLowerCase()));

    const calWrap = document.createElement("label");
    calWrap.className = "stack";
    const calLabel = document.createElement("span");
    calLabel.className = "label";
    calLabel.textContent = "Caliber";
    const calInput = document.createElement("input");
    calInput.type = "text";
    calInput.readOnly = true;
    calInput.classList.add("readonly");
    calInput.value = gunCaliber || "Not set";
    calWrap.append(calLabel, calInput);
    row.appendChild(calWrap);

    // Read-only caliber descriptor coming from the weapon context
    const calDescWrap = document.createElement("label");
    calDescWrap.className = "stack";
    const calDescLabel = document.createElement("span");
    calDescLabel.className = "label";
    calDescLabel.textContent = "Caliber description";
    const calDescInput = document.createElement("input");
    calDescInput.type = "text";
    calDescInput.placeholder = "NATO / Remington";
    calDescInput.dataset.key = "ammo-caliberDesc";
    calDescInput.value = ammo.caliberDesc || "";
    calDescInput.addEventListener("input", () => autoSaveUnit());
    calDescWrap.append(calDescLabel, calDescInput);
    row.appendChild(calDescWrap);

    const fields = [
      ["Ammo name", "name"],
      ["Ammo/Soldier", "ammoPerSoldier"],
      ["Penetration (mm)", "penetration"],
      ["HE Value", "heDeadliness"],
      ["Dispersion % (+/-)", "dispersion"],
      ["Range % (+/-)", "rangeMod"],
      ["Grain", "grain"],
      ["Ammo type", "ammoType"],
      ["Notes", "notes"],
    ];
    fields.forEach(([label, key]) => {
      const wrap = document.createElement("label");
      wrap.className = "stack";
      const span = document.createElement("span");
      span.className = "label";
      span.textContent = label;
      const input = document.createElement("input");
      input.type = ["penetration", "heDeadliness", "dispersion", "rangeMod", "ammoPerSoldier", "grain"].includes(key)
        ? "number"
        : "text";
      if (key === "dispersion" || key === "rangeMod") input.step = "0.1";
      if (key === "ammoPerSoldier") {
        input.min = "0";
        input.step = "1";
        if (gunCaliber && typeof gunCaliber === "string") {
          const gunRow = container.closest(".gun-edit-row");
          const gunAmmoPer = gunRow?.querySelector('input[data-key="ammoPerSoldier"]');
          if (gunAmmoPer) {
            const max = parseInt(gunAmmoPer.value || "0", 10);
            if (!Number.isNaN(max)) input.max = max.toString();
          }
          gunRow?.querySelector('input[data-key="ammoPerSoldier"]')?.addEventListener("input", () => {
            const max = parseInt(gunAmmoPer.value || "0", 10);
            if (!Number.isNaN(max)) input.max = max.toString();
          });
        }
      }
      if (key === "caliberDesc") input.placeholder = "NATO / Remington";
      if (key === "name" && gunCaliber) {
        const dl = getAmmoDatalist(gunCaliber);
        if (dl) {
          dl.innerHTML = "";
          (ammoLibrary[gunCaliber] || []).forEach((a) => {
            const opt = document.createElement("option");
            opt.value = a.name;
            dl.appendChild(opt);
          });
          input.setAttribute("list", dl.id);
        }
      }
      input.value = ammo[key] ?? "";
      input.dataset.key = `ammo-${key}`;
      input.addEventListener("input", () => autoSaveUnit());
      wrap.append(span, input);
      body.appendChild(wrap);
    });

    // Airburst block
    const airburstWrap = document.createElement("label");
    airburstWrap.className = "stack";
    airburstWrap.innerHTML = `<span class="label">Airburst</span>`;
    const airburstSelect = document.createElement("select");
    airburstSelect.dataset.key = "ammo-airburst";
    ["No", "Yes"].forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt.toLowerCase();
      o.textContent = opt;
      airburstSelect.appendChild(o);
    });
    airburstSelect.value = (ammo.airburst ? "yes" : "no") || "no";
    airburstSelect.addEventListener("change", () => {
      const show = airburstSelect.value === "yes";
      [subCountWrap, subDmgWrap, subPenWrap].forEach((el) => (el.style.display = show ? "" : "none"));
      autoSaveUnit();
    });
    airburstWrap.appendChild(airburstSelect);
    row.appendChild(airburstWrap);

    const subCountWrap = document.createElement("label");
    subCountWrap.className = "stack";
    subCountWrap.innerHTML = `<span class="label">Subprojectiles</span>`;
    const subCountInput = document.createElement("input");
    subCountInput.type = "number";
    subCountInput.min = "0";
    subCountInput.dataset.key = "ammo-subCount";
    subCountInput.value = ammo.subCount || "";
    subCountInput.addEventListener("input", autoSaveUnit);
    subCountWrap.appendChild(subCountInput);

    const subDmgWrap = document.createElement("label");
    subDmgWrap.className = "stack";
    subDmgWrap.innerHTML = `<span class="label">Sub dmg</span>`;
    const subDmgInput = document.createElement("input");
    subDmgInput.type = "number";
    subDmgInput.dataset.key = "ammo-subDamage";
    subDmgInput.value = ammo.subDamage || "";
    subDmgInput.addEventListener("input", autoSaveUnit);
    subDmgWrap.appendChild(subDmgInput);

    const subPenWrap = document.createElement("label");
    subPenWrap.className = "stack";
    subPenWrap.innerHTML = `<span class="label">Sub pen (mm)</span>`;
    const subPenInput = document.createElement("input");
    subPenInput.type = "number";
    subPenInput.dataset.key = "ammo-subPenetration";
    subPenInput.value = ammo.subPenetration || "";
    subPenInput.addEventListener("input", autoSaveUnit);
    subPenWrap.appendChild(subPenInput);

    [subCountWrap, subDmgWrap, subPenWrap].forEach((el) => row.appendChild(el));

    const fpsWrap = document.createElement("label");
    fpsWrap.className = "stack";
    fpsWrap.innerHTML = `<span class="label">Est. muzzle velocity (fps)</span>`;
    const fpsDisplay = document.createElement("input");
    fpsDisplay.type = "number";
    fpsDisplay.readOnly = !allowsManualFps;
    if (allowsManualFps) {
      fpsDisplay.classList.remove("readonly");
      fpsDisplay.placeholder = "Enter FPS manually";
    } else {
      fpsDisplay.classList.add("readonly");
    }
    fpsDisplay.dataset.key = "ammo-fps";
    fpsWrap.appendChild(fpsDisplay);
    row.appendChild(fpsWrap);

    const actions = document.createElement("div");
    actions.className = "row-actions ammo-actions";
    const recomputeFps = () => {
      if (allowsManualFps) return;
      const grainVal = parseFloat(row.querySelector('input[data-key="ammo-grain"]')?.value || "0") || 0;
      const fps = computeAmmoFps(gunCaliber, barrelLen, grainVal);
      fpsDisplay.value = fps;
    };
    row.querySelectorAll('input[data-key="ammo-grain"]').forEach((inp) =>
      inp.addEventListener("input", () => {
        recomputeFps();
        autoSaveUnit();
      })
    );
    recomputeFps();
    // hide sub fields if not airburst
    const showSubs = airburstSelect.value === "yes";
    [subCountWrap, subDmgWrap, subPenWrap].forEach((el) => (el.style.display = showSubs ? "" : "none"));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost xsmall danger";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      row.remove();
      autoSaveUnit();
    });
    actions.append(remove);
    row.appendChild(actions);

    container.appendChild(row);
  }

  function addFireModeRow(container, fm = {}, ammoNames = []) {
    const row = document.createElement("div");
    row.className = "fire-row";
    const specs = [
      ["Fire mode name", "name", "text"],
      ["Ammo per use", "ammo", "number"],
      ["Reset time (s)", "reset", "number"],
      ["Min range (m)", "minRange", "number"],
      ["Max range (m)", "maxRange", "number"],
      ["Hit probability (%)", "hitProbability", "number"],
    ];
    specs.forEach(([label, key, type]) => {
      const wrap = document.createElement("label");
      wrap.className = "stack";
      const span = document.createElement("span");
      span.className = "label";
      span.textContent = label;
      const input = document.createElement("input");
      input.type = type;
      input.dataset.key = `fire-${key}`;
      input.value = fm[key] ?? fm.rounds ?? fm.cooldown ?? "";
      input.addEventListener("input", () => autoSaveUnit());
      wrap.append(span, input);
      row.appendChild(wrap);
    });

    // Link to a specific ammo type for this fire mode
    const ammoWrap = document.createElement("label");
    ammoWrap.className = "stack";
    const ammoSpan = document.createElement("span");
    ammoSpan.className = "label";
    ammoSpan.textContent = "Assigned ammo";
    const ammoSelect = document.createElement("select");
    ammoSelect.dataset.key = "fire-ammoRef";
    ammoSelect.dataset.prefill = fm.ammoRef || "";
    const buildAmmoOptions = (names) => {
      ammoSelect.innerHTML = "";
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "None";
      ammoSelect.appendChild(empty);
      names.forEach((n) => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = n;
        ammoSelect.appendChild(opt);
      });
      ammoSelect.value = fm.ammoRef && names.includes(fm.ammoRef) ? fm.ammoRef : "";
    };
    buildAmmoOptions(ammoNames);
    ammoSelect.addEventListener("change", () => autoSaveUnit());
    ammoWrap.append(ammoSpan, ammoSelect);
    row.appendChild(ammoWrap);

    const actions = document.createElement("div");
    actions.className = "row-actions center-actions full-width";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost xsmall danger";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      row.remove();
      autoSaveUnit();
    });
    actions.append(remove);
    row.appendChild(actions);

    container.appendChild(row);
  }

  function buildCategoryRow(category = {}, units = []) {
    const row = document.createElement("div");
    row.className = "gun-edit-row";

    const nameWrap = document.createElement("label");
    nameWrap.className = "stack";
    const nameLabel = document.createElement("span");
    nameLabel.className = "label";
    nameLabel.textContent = "Category name";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = category.name || "";
    nameInput.dataset.key = "category-name";
    nameInput.addEventListener("input", () => { });
    nameWrap.append(nameLabel, nameInput);

    const selectWrap = document.createElement("div");
    selectWrap.className = "stack";
    const selectLabel = document.createElement("span");
    selectLabel.className = "label";
    selectLabel.textContent = "Units (assign, qty)";
    const assignList = document.createElement("div");
    assignList.className = "assign-list";
    const counts = {};
    (category.units || []).forEach((id) => {
      if (typeof id === "number") counts[id] = (counts[id] || 0) + 1;
    });
    units.forEach((unit, idx) => {
      const pill = document.createElement("div");
      pill.className = "assign-pill";
      pill.dataset.id = idx.toString();
      pill.dataset.name = (unit.name || `Unit ${idx + 1}`).toLowerCase();
      const title = document.createElement("span");
      title.textContent = unit.name || `Unit ${idx + 1}`;
      const qty = document.createElement("input");
      qty.type = "number";
      qty.min = "0";
      qty.step = "1";
      qty.value = counts[idx] || 0;
      qty.addEventListener("input", () => {
        qty.value = Math.max(0, parseInt(qty.value || "0", 10) || 0);
        pill.classList.toggle("active", parseInt(qty.value, 10) > 0);
      });
      pill.classList.toggle("active", (counts[idx] || 0) > 0);
      pill.append(title, qty);
      assignList.appendChild(pill);
    });
    selectWrap.append(selectLabel, assignList);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost small danger";
    remove.textContent = "Remove category";
    remove.addEventListener("click", () => {
      row.remove();
      // no-op
    });

    row.append(nameWrap, selectWrap, remove);
    return row;
  }

  function applyCategoryFilter() {
    if (!categorySearch || !categoryList) return;
    const query = categorySearch.value.trim().toLowerCase();
    const lists = categoryList.querySelectorAll(".assign-list");
    lists.forEach((list) => {
      Array.from(list.children).forEach((pill) => {
        const name = pill.dataset.name || pill.textContent.toLowerCase();
        pill.style.display = !query || name.includes(query) ? "" : "none";
      });
    });
  }

  function refreshUnitSelect(data, selectedIndex = 0) {
    if (!data || !Array.isArray(data.units)) return;
    unitSelect.innerHTML = "";
    data.units.forEach((unit, idx) => {
      const option = document.createElement("option");
      option.value = idx.toString();
      option.textContent = unit.name ? `${idx + 1}. ${unit.name}` : `Unit ${idx + 1}`;
      unitSelect.appendChild(option);
    });
    unitSelect.value = Math.min(selectedIndex, data.units.length - 1).toString();
  }

  function refreshFormationSelect(data, selectedIndex = 0) {
    if (!data || !Array.isArray(data.formations)) return;
    formationSelect.innerHTML = "";
    data.formations.forEach((formation, idx) => {
      const option = document.createElement("option");
      option.value = idx.toString();
      option.textContent = formation.name ? `${idx + 1}. ${formation.name}` : `Formation ${idx + 1}`;
      formationSelect.appendChild(option);
    });
    formationSelect.value = Math.min(selectedIndex, data.formations.length - 1).toString();
  }

  function refreshNationSelect(data, selectedIndex = 0) {
    if (!data || !Array.isArray(data.nations)) return;
    nationSelect.innerHTML = "";
    data.nations.forEach((nation, idx) => {
      const option = document.createElement("option");
      option.value = idx.toString();
      option.textContent = nation.name ? `${idx + 1}. ${nation.name}` : `Nation ${idx + 1}`;
      nationSelect.appendChild(option);
    });
    nationSelect.value = Math.min(selectedIndex, data.nations.length - 1).toString();
  }

  function refreshNationOverviewSelect(data, selectedIndex = 0) {
    if (!data || !Array.isArray(data.nations)) return;
    nationOverviewSelect.innerHTML = "";
    data.nations.forEach((nation, idx) => {
      const option = document.createElement("option");
      option.value = idx.toString();
      option.textContent = nation.name ? `${idx + 1}. ${nation.name}` : `Nation ${idx + 1}`;
      nationOverviewSelect.appendChild(option);
    });
    if (data.nations.length) {
      nationOverviewSelect.value = Math.min(selectedIndex, data.nations.length - 1).toString();
    }
  }

  function attachDirtyHandlers() { }

  function rebuildWeaponLibrary(dataObj) {
    if (!weaponLibrary) return;
    while (weaponLibrary.firstChild) weaponLibrary.removeChild(weaponLibrary.firstChild);
    if (!dataObj || !Array.isArray(dataObj.units)) return;
    const names = new Set(Object.keys(weaponTemplates));
    dataObj.units.forEach((u) => {
      (u.guns || []).forEach((g) => {
        if (g.name) {
          names.add(g.name);
          weaponTemplates[g.name] = deepClone(g);
        }
        if (g.caliber) {
          const cal = g.caliber;
          ammoLibrary[cal] = ammoLibrary[cal] || [];
          (g.ammoTypes || []).forEach((ammo) => {
            if (!ammo || !ammo.name) return;
            if (!ammoLibrary[cal].some((a) => a.name === ammo.name)) {
              ammoLibrary[cal].push(deepClone({ ...ammo, caliber: cal }));
            }
          });
        }

        function renderTagLists() {
          if (categoryTagList) {
            categoryTagList.innerHTML = "";
            Object.entries(weaponTags.categories).forEach(([name, color]) => {
              const badge = document.createElement("span");
              badge.className = "color-badge";
              const dot = document.createElement("span");
              dot.className = "color-dot";
              dot.style.background = color;
              badge.append(dot, document.createTextNode(name));
              categoryTagList.appendChild(badge);
            });
          }
          if (caliberTagList) {
            caliberTagList.innerHTML = "";
            Object.entries(weaponTags.calibers).forEach(([name, color]) => {
              const badge = document.createElement("span");
              badge.className = "color-badge";
              const dot = document.createElement("span");
              dot.className = "color-dot";
              dot.style.background = color;
              badge.append(dot, document.createTextNode(name));
              caliberTagList.appendChild(badge);
            });
          }
        }
        // Expose for any late calls; keeps runtime happy if caching old references.
        if (typeof window !== "undefined") window.renderTagLists = renderTagLists;
        if (typeof window !== "undefined") window.downloadLogs = () => {
          const blob = new Blob([JSON.stringify(diagLog, null, 2)], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "rts-diagnostics.json";
          link.click();
        };
        function safeRenderTagLists() {
          try {
            if (typeof renderTagLists === "function") {
              renderTagLists();
            }
          } catch (e) {
            console.warn("renderTagLists unavailable", e);
          }
        }
      });
    });
    Array.from(names)
      .sort()
      .forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        weaponLibrary.appendChild(opt);
      });
    refreshWeaponSelect();
    refreshAmmoSelect();
  }

  const refreshWeaponSelect = (selectedName = null) => {
    if (!weaponSelect) return;
    weaponSelect.innerHTML = "";
    const filter = (weaponSearch?.value || "").toLowerCase();

    const names = Object.keys(weaponTemplates).sort();
    names.forEach((name) => {
      if (filter && !name.toLowerCase().includes(filter)) return;
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      if (name === selectedName) opt.selected = true;
      weaponSelect.appendChild(opt);
    });
    // Trigger load if selection changed or empty
    if (weaponSelect.value) {
      loadWeaponIntoForm(weaponSelect.value);
    } else {
      // Clear form if no match
      weaponName.value = "";
      // ... clear other fields if desired, or leave last state
    }
  };

  const refreshAmmoSelect = (selectedKey = null) => {
    if (!ammoSelect) return;
    ammoSelect.innerHTML = "";
    const filter = (ammoSearch?.value || "").toLowerCase();

    const keys = Object.keys(ammoLibrary).sort();
    keys.forEach((cal) => {
      const list = ammoLibrary[cal];
      list.forEach((ammo, idx) => {
        const name = ammo.name || `Ammo ${idx + 1}`;
        const key = `${cal}::${name}`;
        if (filter && !key.toLowerCase().includes(filter)) return;

        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = `${name} (${cal})`;
        if (key === selectedKey) opt.selected = true;
        ammoSelect.appendChild(opt);
      });
    });
    if (ammoSelect.value) {
      loadAmmoIntoForm(ammoSelect.value);
    }
  };

  function loadWeaponIntoForm(indexOrName = 0) {
    if (!weaponSelect) return;
    const names = Object.keys(weaponTemplates).sort();
    const name = typeof indexOrName === "string" ? indexOrName : names[indexOrName] || names[0];
    const weapon = weaponTemplates[name] || {};
    weaponSelect.value = name || "";
    weaponName.value = weapon.name || "";
    weaponCaliber.value = weapon.caliber || "";
    weaponRange.value = weapon.range || "";
    weaponCategory.value = weapon.category || "";
    weaponMuzzle.value = weapon.muzzleVelocity || "";
    weaponDispersion.value = weapon.dispersion || "";
    weaponBarrel.value = weapon.barrelLength || "";
    weaponReload.value = weapon.reloadSpeed || "";
    weaponFireModes.value = Array.isArray(weapon.fireModes) ? weapon.fireModes.join(", ") : weapon.fireModes || "";
  }

  function saveWeaponTemplate() {
    const name = weaponName.value.trim();
    if (!name) {
      showMessage("Weapon name is required.", "error");
      return;
    }
    if (weaponCaliber.value && !/^\d{1,3},\d{1,3}x\d{1,3}$/.test(weaponCaliber.value)) {
      showMessage("Caliber must match pattern like 5,56x45.", "error");
      return;
    }
    weaponTemplates[name] = {
      name,
      caliber: weaponCaliber.value,
      range: weaponRange.value,
      category: weaponCategory.value,
      muzzleVelocity: weaponMuzzle.value ? Number(weaponMuzzle.value) : "",
      dispersion: weaponDispersion.value ? Number(weaponDispersion.value) : "",
      barrelLength: weaponBarrel.value ? Number(weaponBarrel.value) : "",
      reloadSpeed: weaponReload.value ? Number(weaponReload.value) : "",
      fireModes: (weaponFireModes.value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    refreshWeaponSelect(name);
    rebuildWeaponLibrary(parseData(false));
    saveToStorage();
    showMessage("Weapon saved.", "success");
  }

  function addWeaponTemplate() {
    weaponName.value = "";
    weaponCaliber.value = "";
    weaponRange.value = "";
    weaponCategory.value = "";
    weaponMuzzle.value = "";
    weaponDispersion.value = "";
    weaponBarrel.value = "";
    weaponReload.value = "";
    weaponFireModes.value = "";
    weaponSelect.value = "";
  }

  function deleteWeaponTemplate() {
    const name = weaponSelect.value;
    if (name && weaponTemplates[name]) {
      delete weaponTemplates[name];
      refreshWeaponSelect();
      rebuildWeaponLibrary(parseData(false));
      saveToStorage();
      showMessage("Weapon deleted.", "success");
    }
  }

  function loadAmmoIntoForm(keyOrIndex = "") {
    if (!ammoSelect) return;
    const items = [];
    Object.keys(ammoLibrary).forEach((cal) => {
      (ammoLibrary[cal] || []).forEach((a, idx) => items.push({ key: `${cal}::${a.name || idx}`, data: a }));
    });
    const selected =
      typeof keyOrIndex === "string"
        ? items.find((i) => i.key === keyOrIndex) || items[0]
        : items[keyOrIndex] || items[0];
    if (!selected) return;
    ammoSelect.value = selected.key;
    const a = selected.data || {};
    ammoNameInput.value = a.name || "";
    ammoCaliberInput.value = a.caliber || "";
    ammoCaliberDescInput.value = a.caliberDesc || "";
    ammoPenetrationInput.value = a.penetration || "";
    ammoHEInput.value = a.heDeadliness || "";
    ammoDispersionInput.value = a.dispersion || "";
    ammoRangeInput.value = a.rangeMod || "";
    if (ammoGrainInput) ammoGrainInput.value = a.grain ?? "";
    ammoNotesInput.value = a.notes || "";
  }

  function saveAmmoTemplate() {
    const name = ammoNameInput.value.trim();
    const cal = ammoCaliberInput.value.trim();
    if (!cal || !/^\d{1,3},\d{1,3}x\d{1,3}$/.test(cal)) {
      showMessage("Ammo caliber must match pattern like 5,56x45.", "error");
      return;
    }
    if (!name) {
      showMessage("Ammo name is required.", "error");
      return;
    }
    ammoLibrary[cal] = ammoLibrary[cal] || [];
    const existing = ammoLibrary[cal].find((a) => a.name === name);
    const entry = {
      name,
      caliber: cal,
      caliberDesc: ammoCaliberDescInput.value || "",
      penetration: ammoPenetrationInput.value ? Number(ammoPenetrationInput.value) : "",
      heDeadliness: ammoHEInput.value ? Number(ammoHEInput.value) : "",
      dispersion: ammoDispersionInput.value ? Number(ammoDispersionInput.value) : "",
      rangeMod: ammoRangeInput.value ? Number(ammoRangeInput.value) : "",
      grain: ammoGrainInput?.value ? Number(ammoGrainInput.value) : 0,
      notes: ammoNotesInput.value || "",
    };
    if (existing) {
      Object.assign(existing, entry);
    } else {
      ammoLibrary[cal].push(entry);
    }
    refreshAmmoSelect(`${cal}::${name}`);
    rebuildWeaponLibrary(parseData(false));
    saveToStorage();
    showMessage("Ammo saved.", "success");
  }

  function addAmmoTemplate() {
    ammoNameInput.value = "";
    ammoCaliberInput.value = "";
    ammoCaliberDescInput.value = "";
    ammoPenetrationInput.value = "";
    ammoHEInput.value = "";
    ammoDispersionInput.value = "";
    ammoRangeInput.value = "";
    if (ammoGrainInput) ammoGrainInput.value = "";
    ammoNotesInput.value = "";
    ammoSelect.value = "";
  }

  function deleteAmmoTemplate() {
    const key = ammoSelect.value;
    if (!key) return;
    const [cal, name] = key.split("::");
    if (ammoLibrary[cal]) {
      ammoLibrary[cal] = ammoLibrary[cal].filter((a) => a.name !== name);
      if (!ammoLibrary[cal].length) delete ammoLibrary[cal];
      refreshAmmoSelect();
      rebuildWeaponLibrary(parseData(false));
      saveToStorage();
      showMessage("Ammo deleted.", "success");
    }
  }

  function createDirtyPrompt() { }

  function addGunEditRow(gun = {}) {
    if (!gunList) {
      console.error("gunList element not found!");
      showMessage("Error: gunList element missing.", "error");
      return;
    }
    if (gunList.children.length >= 10) {
      showMessage("Gun limit reached (10).", "error");
      return;
    }
    const row = document.createElement("div");
    row.className = "gun-edit-row";

    const collapseBar = document.createElement("div");
    collapseBar.className = "gun-collapse-bar";
    const collapseLabel = document.createElement("strong");
    collapseLabel.textContent = gun.name || "Gun";
    const collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.className = "collapse-toggle";
    collapseBtn.textContent = "Collapse weapon";
    collapseBar.append(collapseLabel, collapseBtn);
    row.appendChild(collapseBar);
    const body = document.createElement("div");
    body.className = "gun-body";

    const fields = [
      ["Category", "category"],
      ["Gun name", "name"],
      ["Caliber (e.g., 5,56x45)", "caliber"],
      ["Barrel Length (in)", "barrelLength"],
      ["Range", "range"],
      ["Dispersion (cm)", "dispersion"],
      ["Count", "count"],
      ["Ammo/Soldier", "ammoPerSoldier"],
      ["Total ammo", "totalAmmo"],
      ["Magazine size", "magazineSize"],
      ["Reload Speed (s)", "reloadSpeed"],
      ["Target acquisition (s)", "targetAcquisition"],
    ];

    fields.forEach(([label, key]) => {
      const wrap = document.createElement("label");
      wrap.className = "stack";
      const span = document.createElement("span");
      span.className = "label";
      span.textContent = label;
      const input = document.createElement("input");
      input.type = [
        "count",
        "ammoPerSoldier",
        "totalAmmo",
        "muzzleVelocity",
        "heDeadliness",
        "dispersion",
        "magazineSize",
        "suppressionBurst",
        "standardBurst",
        "standardReset",
        "extendedBurst",
        "extendedReset",
        "targetAcquisition",
      ].includes(key)
        ? "number"
        : "text";
      if (key === "count") input.min = "1";
      if (key === "ammoPerSoldier") input.min = "0";
      if (key === "totalAmmo") {
        input.readOnly = true;
        input.classList.add("readonly");
      }
      if (key === "caliber") {
        input.pattern = "\\d{1,3},\\d{1,3}x\\d{1,3}";
        input.placeholder = "5,56x45";
        input.title = "Format: 1-3 digits,comma,1-3 digits,x,1-3 digits";
      }
      input.value =
        key === "fireModes"
          ? Array.isArray(gun.fireModes)
            ? gun.fireModes.join(", ")
            : gun.fireModes || ""
          : gun[key] ?? "";
      input.dataset.key = key;
      if (key === "name") input.setAttribute("list", "weaponLibrary");
      input.addEventListener("input", () => autoSaveUnit());
      wrap.append(span, input);
      row.appendChild(wrap);
    });

    // Firing trajectories
    const trajRowWrap = document.createElement("div");
    trajRowWrap.className = "traj-row";

    const trajWrap = document.createElement("div");
    trajWrap.className = "stack traj-stack";
    const trajLabel = document.createElement("span");
    trajLabel.className = "label";
    trajLabel.textContent = "Firing trajectories";
    const trajList = document.createElement("div");
    trajList.className = "traj-list";
    [
      ["Direct (LOS)", "direct_los"],
      ["Direct (NLOS)", "direct_nlos"],
      ["Indirect (LOS)", "indirect_los"],
      ["Indirect (NLOS)", "indirect_nlos"],
    ].forEach(([lbl, val]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip traj-chip";
      btn.dataset.traj = val;
      btn.textContent = lbl;
      if (Array.isArray(gun.trajectories) && gun.trajectories.includes(val)) btn.classList.add("active");
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        autoSaveUnit();
      });
      trajList.appendChild(btn);
    });
    trajWrap.append(trajLabel, trajList);

    const traitWrap = document.createElement("div");
    traitWrap.className = "stack traj-stack";
    const traitLabel = document.createElement("span");
    traitLabel.className = "label";
    traitLabel.textContent = "Weapon traits";
    const traitList = document.createElement("div");
    traitList.className = "traj-list";
    const traitGroups = [
      [
        ["Single Shot (Disposable)", "single_shot"],
        ["Suppressed", "suppressed"],
      ],
      [
        ["MOR", "mor"],
        ["GL", "gl"],
        ["AGL", "agl"],
        ["LAW", "law"],
        ["RR", "rr"],
        ["ATGM", "atgm"],
        ["MANPADS", "manpads"],
      ],
    ];
    traitGroups.forEach((group, idx) => {
      group.forEach(([lbl, val]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip traj-chip";
        btn.dataset.traj = val;
        btn.textContent = lbl;
        if (val === "single_shot") btn.classList.add("traj-single");
        if (Array.isArray(gun.trajectories) && gun.trajectories.includes(val)) btn.classList.add("active");
        btn.addEventListener("click", () => {
          btn.classList.toggle("active");
          autoSaveUnit();
        });
        traitList.appendChild(btn);
      });
      if (idx === 0) {
        const sep = document.createElement("span");
        sep.className = "trait-separator";
        traitList.appendChild(sep);
      }
    });
    traitWrap.append(traitLabel, traitList);
    trajRowWrap.append(trajWrap, traitWrap);
    body.appendChild(trajRowWrap);

    const countInput = row.querySelector('input[data-key="count"]');
    const ammoPerSoldierInput = row.querySelector('input[data-key="ammoPerSoldier"]');
    const totalInput = row.querySelector('input[data-key="totalAmmo"]');
    const nameInput = row.querySelector('input[data-key="name"]');
    const caliberInput = row.querySelector('input[data-key="caliber"]');
    const barrelInput = row.querySelector('input[data-key="barrelLength"]');

    const recalcTotalAmmo = () => {
      const count = Math.max(1, parseInt(countInput.value || "1", 10));
      countInput.value = count;
      const ammoPer = Math.max(0, parseInt(ammoPerSoldierInput.value || "0", 10));
      ammoPerSoldierInput.value = ammoPer;
      totalInput.value = count * ammoPer;
    };
    countInput.addEventListener("input", recalcTotalAmmo);
    ammoPerSoldierInput.addEventListener("input", recalcTotalAmmo);
    recalcTotalAmmo();

    // Firing trajectories chips
    const applyCaliberToAmmoRows = (cal) => {
      const dl = cal ? getAmmoDatalist(cal) : null;
      const ammoList = row.querySelector(".ammo-list");
      if (!ammoList) return;
      ammoList.querySelectorAll(".ammo-row").forEach((ar) => {
        ar.dataset.caliber = cal;
        const nameField = ar.querySelector('input[data-key="ammo-name"]');
        if (nameField && dl) {
          dl.innerHTML = "";
          (ammoLibrary[cal] || []).forEach((a) => {
            const opt = document.createElement("option");
            opt.value = a.name;
            dl.appendChild(opt);
          });
          nameField.setAttribute("list", dl.id);
        } else if (nameField && !dl) {
          nameField.removeAttribute("list");
        }
      });
    };

    const isHeavyTraitCal = () =>
      Array.from(row.querySelectorAll(".traj-chip.active")).some((chip) =>
        ["law", "rr", "atgm", "manpads"].includes((chip.dataset.traj || "").toLowerCase())
      );
    caliberInput.addEventListener("blur", () => {
      const val = caliberInput.value;
      const standard = /^\d{1,3},\d{1,3}x\d{1,3}$/;
      const heavy = isHeavyTraitCal();
      if (val && !heavy && !standard.test(val)) {
        showMessage("Caliber must match pattern like 5,56x45.", "error");
        caliberInput.focus();
        return;
      }
      // For heavy traits allow any string; for standard allow the pattern or empty.
      applyCaliberToAmmoRows(caliberInput.value);
    });

    nameInput.addEventListener("change", () => {
      const tpl = weaponTemplates[nameInput.value];
      if (!tpl) return;
      const clone = deepClone(tpl);
      countInput.value = 1;
      ammoPerSoldierInput.value = 0;
      totalInput.value = 0;
      row.querySelector('input[data-key="range"]').value = clone.range || "";
      row.querySelector('input[data-key="heDeadliness"]').value = clone.heDeadliness || "";
      row.querySelector('input[data-key="dispersion"]').value = clone.dispersion || "";
      row.querySelector('input[data-key="category"]').value = clone.category || "";
      row.querySelector('input[data-key="magazineSize"]').value = clone.magazineSize || "";
      row.querySelector('input[data-key="suppressionBurst"]').value = clone.suppressionBurst || "";
      row.querySelector('input[data-key="standardBurst"]').value = clone.standardBurst || "";
      row.querySelector('input[data-key="standardReset"]').value = clone.standardReset || "";
      row.querySelector('input[data-key="extendedBurst"]').value = clone.extendedBurst || "";
      row.querySelector('input[data-key="extendedReset"]').value = clone.extendedReset || "";
      row.querySelector('input[data-key="targetAcquisition"]').value = clone.targetAcquisition || "";
      caliberInput.value = clone.caliber || "";
      const ammoList = row.querySelector(".ammo-list");
      ammoList.innerHTML = "";
      (clone.ammoTypes || []).forEach((ammo) =>
        addAmmoRow(
          ammoList,
          { ...ammo, caliber: clone.caliber },
          clone.caliber,
          clone.barrelLength,
          clone.trajectories || []
        )
      );
      const fireList = row.querySelector(".fire-list");
      if (fireList) {
        fireList.innerHTML = "";
        const modes = Array.isArray(clone.fireModes)
          ? clone.fireModes
          : typeof clone.fireModes === "string"
            ? clone.fireModes.split(",").map((s) => ({ name: s.trim() })).filter((f) => f.name)
            : [];
        modes.forEach((fm) => addFireModeRow(fireList, fm, (clone.ammoTypes || []).map((a) => a.name).filter(Boolean)));
      }
      recalcTotalAmmo();
      applyCaliberToAmmoRows(caliberInput.value);
      refreshFireAmmoOptions();
    });

    const ammoEditor = document.createElement("div");
    ammoEditor.className = "ammo-editor";
    const ammoHeader = document.createElement("div");
    ammoHeader.className = "ammo-header";
    const ammoLabel = document.createElement("span");
    ammoLabel.className = "label";
    ammoLabel.textContent = "Ammo types (per gun)";
    const addAmmo = document.createElement("button");
    addAmmo.type = "button";
    addAmmo.className = "ghost small";
    addAmmo.textContent = "Add ammo";
    const ammoList = document.createElement("div");
    ammoList.className = "ammo-list";
    const currentTraits = () =>
      Array.from(row.querySelectorAll(".traj-chip.active")).map((chip) => chip.dataset.traj || "");
    const currentCaliber = () => caliberInput.value || gun.caliber || "";
    const currentBarrel = () => Number(barrelInput.value || gun.barrelLength) || 0;
    const isHeavyTraitAmmo = () =>
      currentTraits().some((t) => ["law", "rr", "atgm", "manpads"].includes((t || "").toLowerCase()));
    addAmmo.addEventListener("click", () => {
      addAmmoRow(ammoList, {}, currentCaliber(), currentBarrel(), currentTraits());
      logEvent?.("addAmmoRow", { gun: nameInput.value || gun.name || "Unnamed" });
      autoSaveUnit();
      refreshFireAmmoOptions();
    });
    const existingAmmoSelect = document.createElement("select");
    existingAmmoSelect.className = "ghost small";
    const buildExistingAmmo = () => {
      existingAmmoSelect.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Existing ammo...";
      existingAmmoSelect.appendChild(placeholder);
      const cal = currentCaliber();
      const heavy = isHeavyTraitAmmo();
      const pool = [];
      if (heavy) {
        Object.entries(ammoLibrary).forEach(([c, list]) =>
          (list || []).forEach((a, idx) => pool.push({ label: `${c}: ${a.name}`, data: a, key: `${c}::${idx}` }))
        );
      } else if (cal && ammoLibrary[cal]) {
        ammoLibrary[cal].forEach((a, idx) => pool.push({ label: a.name || `Ammo ${idx + 1}`, data: a, key: `${cal}::${idx}` }));
      }
      pool.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.key;
        opt.textContent = item.label;
        opt.dataset.payload = JSON.stringify(item.data);
        existingAmmoSelect.appendChild(opt);
      });
    };
    buildExistingAmmo();
    existingAmmoSelect.addEventListener("focus", buildExistingAmmo);
    caliberInput.addEventListener("input", buildExistingAmmo);
    const addExistingAmmoBtn = document.createElement("button");
    addExistingAmmoBtn.type = "button";
    addExistingAmmoBtn.className = "ghost small";
    addExistingAmmoBtn.textContent = "Add existing";
    addExistingAmmoBtn.addEventListener("click", () => {
      const opt = existingAmmoSelect.selectedOptions[0];
      if (!opt || !opt.dataset.payload) {
        showMessage("Select ammo from the dropdown first.", "error");
        return;
      }
      const payload = JSON.parse(opt.dataset.payload);
      addAmmoRow(ammoList, { ...payload, caliber: currentCaliber() }, currentCaliber(), currentBarrel(), currentTraits());
      autoSaveUnit();
      refreshFireAmmoOptions();
      existingAmmoSelect.value = "";
    });
    const ammoActions = document.createElement("div");
    ammoActions.className = "header-actions";
    ammoActions.append(existingAmmoSelect, addExistingAmmoBtn, addAmmo);
    ammoHeader.append(ammoLabel, ammoActions);
    // Fire modes block above ammo
    const fireEditor = document.createElement("div");
    fireEditor.className = "ammo-editor"; // reuse styling
    const fireHeader = document.createElement("div");
    fireHeader.className = "ammo-header";
    const fireLabel = document.createElement("span");
    fireLabel.className = "label";
    fireLabel.textContent = "Fire modes (per gun)";
    const addFire = document.createElement("button");
    addFire.type = "button";
    addFire.className = "ghost small";
    addFire.textContent = "Add fire mode";
    const fireList = document.createElement("div");
    fireList.className = "fire-list";
    const savedFireSelect = document.createElement("select");
    savedFireSelect.className = "ghost small";
    const loadSavedFire = () => {
      savedFireSelect.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Existing fire mode...";
      savedFireSelect.appendChild(placeholder);
      const currentName = (nameInput.value || "").trim().toLowerCase();
      const options = [];
      Object.entries(weaponTemplates).forEach(([gName, tpl]) => {
        (tpl.fireModes || []).forEach((fm, idx) => {
          options.push({
            label: `${gName}: ${fm.name || `Mode ${idx + 1}`}`,
            value: `${gName}::${idx}`,
            data: deepClone(fm),
            priority: gName.toLowerCase() === currentName ? 0 : 1,
          });
        });
      });
      options
        .sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label))
        .forEach((opt) => {
          const o = document.createElement("option");
          o.value = opt.value;
          o.textContent = opt.label;
          o.dataset.payload = JSON.stringify(opt.data);
          savedFireSelect.appendChild(o);
        });
    };
    loadSavedFire();
    const addExistingFire = document.createElement("button");
    addExistingFire.type = "button";
    addExistingFire.className = "ghost small";
    addExistingFire.textContent = "Add existing";
    addExistingFire.addEventListener("click", () => {
      const opt = savedFireSelect.selectedOptions[0];
      if (!opt || !opt.dataset.payload) {
        showMessage("Select a fire mode from the dropdown first.", "error");
        return;
      }
      const fmData = JSON.parse(opt.dataset.payload);
      addFireModeRow(fireList, fmData, getAmmoNames());
      autoSaveUnit();
      savedFireSelect.value = "";
    });
    // use the same fire list element
    addFire.addEventListener("click", () => {
      addFireModeRow(fireList, {}, getAmmoNames());
      logEvent?.("addFireModeRow", { gun: nameInput.value || gun.name || "Unnamed" });
      autoSaveUnit();
      refreshFireAmmoOptions();
    });
    savedFireSelect.addEventListener("focus", loadSavedFire);
    const fireActions = document.createElement("div");
    fireActions.className = "header-actions";
    fireActions.append(savedFireSelect, addExistingFire, addFire);
    fireHeader.append(fireLabel, fireActions);
    fireEditor.append(fireHeader, fireList);
    const getAmmoNames = () =>
      Array.from(ammoList.querySelectorAll('input[data-key="ammo-name"]'))
        .map((i) => i.value.trim())
        .filter(Boolean);
    const refreshFireAmmoOptions = () => {
      const names = getAmmoNames();
      fireList.querySelectorAll('select[data-key="fire-ammoRef"]').forEach((sel) => {
        const current = sel.value || sel.dataset.prefill || "";
        sel.innerHTML = "";
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "None";
        sel.appendChild(empty);
        names.forEach((n) => {
          const opt = document.createElement("option");
          opt.value = n;
          opt.textContent = n;
          sel.appendChild(opt);
        });
        if (names.includes(current)) {
          sel.value = current;
        } else {
          sel.value = "";
          sel.dataset.prefill = current;
        }
      });
    };

    const sourceFireModes = Array.isArray(gun.fireModes)
      ? gun.fireModes
      : typeof gun.fireModes === "string"
        ? gun.fireModes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({ name }))
        : [];
    if (sourceFireModes.length === 0) {
      addFireModeRow(fireList, {}, getAmmoNames());
    } else {
      sourceFireModes.forEach((fm) => addFireModeRow(fireList, fm, getAmmoNames()));
    }

    ammoEditor.append(ammoHeader, ammoList);
    body.appendChild(fireEditor);
    const ammoSource = Array.isArray(gun.ammoTypes) ? gun.ammoTypes : [];
    if (ammoSource.length === 0) {
      addAmmoRow(ammoList, {}, gun.caliber, gun.barrelLength, gun.trajectories || []);
    } else {
      ammoSource.forEach((ammo) =>
        addAmmoRow(ammoList, ammo, gun.caliber, gun.barrelLength, gun.trajectories || [])
      );
    }
    body.appendChild(ammoEditor);

    // Keep fire-mode ammo selects synced with ammo rows
    ammoList.addEventListener("input", (e) => {
      if (e.target.dataset.key === "ammo-name") refreshFireAmmoOptions();
    });
    ammoList.addEventListener("click", (e) => {
      if (e.target.classList.contains("danger")) setTimeout(refreshFireAmmoOptions, 0);
    });
    refreshFireAmmoOptions();

    // Ammo per soldier guard: cap ammo rows to gun ammoPerSoldier when present
    const gunAmmoPerField = row.querySelector('input[data-key="ammoPerSoldier"]');
    if (gunAmmoPerField) {
      const maxVal = parseInt(gunAmmoPerField.value || "0", 10);
      if (!Number.isNaN(maxVal) && maxVal > 0) {
        ammoList.querySelectorAll('input[data-key="ammoPerSoldier"]').forEach((input) => {
          input.max = maxVal.toString();
          const current = parseInt(input.value || "0", 10);
          if (current > maxVal) input.value = maxVal.toString();
        });
      }
      gunAmmoPerField.addEventListener("input", () => {
        const newMax = parseInt(gunAmmoPerField.value || "0", 10);
        ammoList.querySelectorAll('input[data-key="ammoPerSoldier"]').forEach((input) => {
          if (!Number.isNaN(newMax) && newMax > 0) {
            input.max = newMax.toString();
            const current = parseInt(input.value || "0", 10);
            if (current > newMax) input.value = newMax.toString();
          } else {
            input.removeAttribute("max");
          }
        });
      });
    }

    row.appendChild(body);

    const actionWrap = document.createElement("div");
    actionWrap.className = "row-actions";
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "ghost small danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      row.remove();
      autoSaveUnit();
    });
    actionWrap.appendChild(removeBtn);
    row.appendChild(actionWrap);

    gunList.appendChild(row);
    autoSaveUnit();
  }

  function collectGunRows() {
    return Array.from(gunList.querySelectorAll(".gun-edit-row")).map((row) => {
      const obj = {};
      row.querySelectorAll("input").forEach((input) => {
        if (!input.dataset.key) return;
        if (input.dataset.key.startsWith("ammo-") || input.dataset.key.startsWith("fire-")) return;
        const val = input.type === "number" ? Number(input.value || 0) : input.value;
        obj[input.dataset.key] = val;
      });

      obj.count = Math.max(1, obj.count || 1);
      obj.ammoPerSoldier = Math.max(0, obj.ammoPerSoldier || 0);
      obj.totalAmmo = obj.count * obj.ammoPerSoldier;
      if (obj.muzzleVelocityManual) obj.muzzleVelocity = obj.muzzleVelocityManual;
      if (!obj.muzzleVelocity && obj.caliber) obj.muzzleVelocity = estimateMuzzle(obj.caliber, obj.barrelLength);
      if (obj.caliber && !/^\d{1,3},\d{1,3}x\d{1,3}$/.test(obj.caliber)) obj.caliber = "";

      const ammoTypes = [];
      row.querySelectorAll(".ammo-list").forEach((list) => {
        list.querySelectorAll(".ammo-row").forEach((ammoRow) => {
          const ammoObj = {};
          ammoRow.querySelectorAll("input").forEach((input) => {
            if (input.dataset.key && input.dataset.key.startsWith("ammo-")) {
              const key = input.dataset.key.replace("ammo-", "");
              ammoObj[key] = input.type === "number" ? Number(input.value || 0) : input.value;
            }
          });
          const airSelect = ammoRow.querySelector('select[data-key="ammo-airburst"]');
          if (airSelect) ammoObj.airburst = airSelect.value === "yes";
          const fpsInput = ammoRow.querySelector('input[data-key="ammo-fps"]');
          if (fpsInput) ammoObj.fps = Number(fpsInput.value || 0);
          const subCount = ammoRow.querySelector('input[data-key="ammo-subCount"]');
          const subDmg = ammoRow.querySelector('input[data-key="ammo-subDamage"]');
          const subPen = ammoRow.querySelector('input[data-key="ammo-subPenetration"]');
          if (subCount) ammoObj.subCount = Number(subCount.value || 0);
          if (subDmg) ammoObj.subDamage = Number(subDmg.value || 0);
          if (subPen) ammoObj.subPenetration = Number(subPen.value || 0);
          if (ammoRow.dataset.caliber) ammoObj.caliber = ammoRow.dataset.caliber;
          if (Object.keys(ammoObj).length) ammoTypes.push(ammoObj);
        });
      });
      obj.ammoTypes = ammoTypes;
      const fireModes = [];
      row.querySelectorAll(".fire-list").forEach((list) => {
        list.querySelectorAll(".fire-row").forEach((fr) => {
          const fm = {};
          fr.querySelectorAll("input").forEach((input) => {
            if (input.dataset.key && input.dataset.key.startsWith("fire-")) {
              const key = input.dataset.key.replace("fire-", "");
              fm[key] = input.type === "number" ? Number(input.value || 0) : input.value;
            }
          });
          const ammoSelect = fr.querySelector('select[data-key="fire-ammoRef"]');
          if (ammoSelect) fm.ammoRef = ammoSelect.value || "";
          if (fm.name) fireModes.push(fm);
        });
      });
      obj.fireModes = fireModes;
      const traj = [];
      row.querySelectorAll(".traj-chip.active").forEach((chip) => {
        traj.push(chip.dataset.traj);
      });
      obj.trajectories = traj;
      return obj;
    });
  }

  function addEquipmentRow(item = {}) {
    if (!equipmentList) return;
    if (equipmentList.children.length >= 10) {
      showMessage("Equipment limit reached (10).", "error");
      return;
    }
    const row = document.createElement("div");
    row.className = "equipment-row";

    const fields = [
      ["Name", "name"],
      ["Count", "count"],
      ["Type/Role", "type"],
      ["Description", "description"],
      ["Notes", "notes"],
    ];

    fields.forEach(([label, key]) => {
      const wrap = document.createElement("label");
      wrap.className = "stack";
      const span = document.createElement("span");
      span.className = "label";
      span.textContent = label;
      const input = document.createElement("input");
      input.type = "text";
      input.value = item[key] ?? "";
      input.dataset.key = `equip-${key}`;
      wrap.append(span, input);
      row.appendChild(wrap);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ghost small danger";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => row.remove());
    row.appendChild(remove);

    equipmentList.appendChild(row);
  }

  function collectEquipmentRows() {
    if (!equipmentList) return [];
    return Array.from(equipmentList.querySelectorAll(".equipment-row")).map((row) => {
      const obj = {};
      row.querySelectorAll("input").forEach((input) => {
        if (input.dataset.key && input.dataset.key.startsWith("equip-")) {
          obj[input.dataset.key.replace("equip-", "")] = input.value;
        }
      });
      return obj;
    });
  }

  function loadUnitIntoForm(index = 0) {
    let parsed = parseData(false);
    if (!parsed || !Array.isArray(parsed.units) || !parsed.units.length) {
      if (!dataInput.value.trim()) {
        loadSample();
        parsed = parseData(false);
      }
      if (!parsed || !Array.isArray(parsed.units) || !parsed.units.length) return;
    }
    const unit = parsed.units[index] || parsed.units[0];
    unitSelect.value = index.toString();

    unitName.value = unit.name || "";
    unitPrice.value = toNumber(unit.price) || "";
    unitCategory.value = (unit.category || "").toString().toUpperCase();
    const tierVal =
      unit.tier === undefined || unit.tier === null
        ? ""
        : unit.tier.toString().replace(/[^0-9]/g, "");
    unitTier.value = tierVal;
    unitDescription.value = unit.description || "";
    unitInternalCategory.value = unit.internalCategory || "";
    populateSubcategories(unit.internalCategory || "", unit.subCategory || "");
    unitImage.value = unit.image || "";

    const stats = unit.stats || {};
    statArmor.value = toNumber(stats.armor) || "";
    statHealth.value = toNumber(stats.health) || "";
    statSquad.value = toNumber(stats.squadSize) || "";
    statRange.value = toNumber(stats.visualRange) || "";
    statStealth.value = toNumber(stats.stealth) || "";
    statSpeed.value = toNumber(stats.speed) || "";
    statWeight.value = toNumber(stats.weight) || "";

    const gren = unit.grenades || {};
    grenSmoke.value = gren.smoke || "";
    grenFlash.value = gren.flash || "";
    grenThermite.value = gren.thermite || "";
    grenFrag.value = gren.frag || "";
    grenTotal.value = gren.total || "";

    const caps = unit.capabilities || {};
    capStatic.value =
      caps.staticLineJump === "" || caps.staticLineJump === undefined ? "" : String(caps.staticLineJump);
    capHalo.value =
      caps.haloHaho === "" || caps.haloHaho === undefined ? "" : String(caps.haloHaho);
    capLaser.value =
      caps.laserDesignator === "" || caps.laserDesignator === undefined ? "" : String(caps.laserDesignator);
  const sprint = caps.sprint || {};
    sprintDistance.value = toNumber(sprint.distance) || "";
    sprintSpeed.value = toNumber(sprint.speed) || "";
    sprintCooldown.value = toNumber(sprint.cooldown) || "";

    gunList.innerHTML = "";
    const guns = Array.isArray(unit.guns) ? unit.guns.slice(0, 10) : [];
    guns.forEach((gun) => addGunEditRow(gun));
    if (typeof logEvent === "function") logEvent("gunsLoaded", { count: guns.length, unit: unit.name || index });

    equipmentList.innerHTML = "";
    (Array.isArray(unit.equipment) ? unit.equipment.slice(0, 10) : []).forEach((item) => addEquipmentRow(item));
  }

  function loadFormationIntoForm(index = 0) {
    const parsed = parseData(false);
    if (!parsed || !Array.isArray(parsed.formations) || !parsed.formations.length) return;
    const formation = parsed.formations[index] || parsed.formations[0];
    formationSelect.value = index.toString();
    formationName.value = formation.name || "";
    formationDescription.value = formation.description || "";
    formationImage.value = formation.image || "";

    categoryList.innerHTML = "";
    const units = Array.isArray(parsed.units) ? parsed.units : [];
    (Array.isArray(formation.categories) ? formation.categories : []).forEach((cat) =>
      categoryList.appendChild(buildCategoryRow(cat, units))
    );
    applyCategoryFilter();
  }

  function loadNationIntoForm(index = 0) {
    const parsed = parseData(false);
    if (!parsed || !Array.isArray(parsed.nations) || !parsed.nations.length) return;
    const nation = parsed.nations[index] || parsed.nations[0];
    nationSelect.value = index.toString();
    nationName.value = nation.name || "";
    nationDescription.value = nation.description || "";
    nationImage.value = nation.image || "";

    nationFormationsList.innerHTML = "";
    const formations = Array.isArray(parsed.formations) ? parsed.formations : [];
    formations.forEach((form, idx) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "assign-pill";
      pill.dataset.id = idx.toString();
      pill.textContent = form.name || `Formation ${idx + 1}`;
      if (Array.isArray(nation.formations) && nation.formations.includes(idx)) pill.classList.add("active");
      pill.addEventListener("click", () => {
        pill.classList.toggle("active");
        autoSaveNation();
      });
      nationFormationsList.appendChild(pill);
    });
  }

  function toggleMode(mode) {
    const isView = mode === "view";
    const isEdit = mode === "edit";
    const isFormationOverview = mode === "formation-overview";
    const isFormationEdit = mode === "formation-edit";
    const isNationOverview = mode === "nation-overview";
    const isNationEdit = mode === "nation-edit";
    const isStats = mode === "stats";
    const isWeaponEdit = mode === "weapon-edit";
    const isAmmoEdit = mode === "ammo-edit";

    viewSection.classList.toggle("hidden-section", !isView);
    viewControlsSection.classList.toggle("hidden-section", !isView);
    editSection.classList.toggle("hidden-section", !isEdit);
    formationEditorSection.classList.toggle("hidden-section", !isFormationEdit);
    formationOverviewSection.classList.toggle("hidden-section", !isFormationOverview);
    nationEditorSection.classList.toggle("hidden-section", !isNationEdit);
    nationOverviewSection.classList.toggle("hidden-section", !isNationOverview);
    if (weaponEditorSection) weaponEditorSection.classList.toggle("hidden-section", !isWeaponEdit);
    if (ammoEditorSection) ammoEditorSection.classList.toggle("hidden-section", !isAmmoEdit);
    if (statsSection) statsSection.classList.toggle("hidden-section", !isStats);

    viewModeBtn.classList.toggle("active", isView);
    editModeBtn.classList.toggle("active", isEdit);
    if (formationOverviewBtn) formationOverviewBtn.classList.toggle("active", isFormationOverview);
    if (formationEditorBtn) formationEditorBtn.classList.toggle("active", isFormationEdit);
    if (nationOverviewBtn) nationOverviewBtn.classList.toggle("active", isNationOverview);
    if (nationEditorBtn) nationEditorBtn.classList.toggle("active", isNationEdit);
    if (weaponEditorBtn) weaponEditorBtn.classList.toggle("active", isWeaponEdit);
    if (ammoEditorBtn) ammoEditorBtn.classList.toggle("active", isAmmoEdit);
    if (statsBtn) statsBtn.classList.toggle("active", isStats);
    currentMode = mode;
  }

  function renderUnitBrowser(unitsWithIndex) {
    unitBrowser.innerHTML = "";
    if (!unitsWithIndex.length) {
      const empty = document.createElement("div");
      empty.className = "helper";
      empty.textContent = "No units to show. Adjust search or add units.";
      unitBrowser.appendChild(empty);
      return;
    }
    unitsWithIndex.forEach(({ unit, idx }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.target = idx.toString();
      btn.textContent = `${idx + 1}. ${unit.name || "Unit"} (${unit.category || "Uncategorized"})`;
      unitBrowser.appendChild(btn);
    });
  }

  function buildUnitFromForm() {
    const numOrEmpty = (val) => {
      const trimmed = (val || "").toString().trim();
      if (trimmed === "") return "";
      const parsed = parseFloat(trimmed);
      return Number.isNaN(parsed) ? "" : parsed;
    };
    const tierVal = unitTier.value ? unitTier.value : "";
    addImageToLibrary("units", unitImage.value);
    return {
      name: unitName.value,
      price: numOrEmpty(unitPrice.value),
      category: (unitCategory.value || "").toUpperCase(),
      description: unitDescription.value,
      internalCategory: unitInternalCategory.value,
      subCategory: unitSubCategory.value,
      tier: tierVal,
      image: unitImage.value,
      stats: {
        armor: numOrEmpty(statArmor.value),
        health: numOrEmpty(statHealth.value),
        squadSize: numOrEmpty(statSquad.value),
        visualRange: numOrEmpty(statRange.value),
        stealth: numOrEmpty(statStealth.value),
        speed: numOrEmpty(statSpeed.value),
        weight: numOrEmpty(statWeight.value),
      },
      grenades: {
        smoke: grenSmoke.value,
        flash: grenFlash.value,
        thermite: grenThermite.value,
        frag: grenFrag.value,
        total: grenTotal.value,
      },
      capabilities: {
        staticLineJump: parseBoolish(capStatic.value),
        haloHaho: parseBoolish(capHalo.value),
        sprint: {
          distance: numOrEmpty(sprintDistance.value),
          speed: numOrEmpty(sprintSpeed.value),
          cooldown: numOrEmpty(sprintCooldown.value),
        },
        laserDesignator: parseBoolish(capLaser.value),
      },
      guns: collectGunRows(),
      equipment: collectEquipmentRows(),
    };
  }

  function buildFormationFromForm() {
    const parsed = parseData(false) || {};
    const units = Array.isArray(parsed.units) ? parsed.units : [];
    addImageToLibrary("formations", formationImage.value);
    return {
      name: formationName.value,
      description: formationDescription.value,
      image: formationImage.value,
      categories: collectCategories(units),
    };
  }

  function collectCategories(units = []) {
    return Array.from(categoryList.querySelectorAll(".gun-edit-row")).map((row) => {
      const nameInput = row.querySelector('input[data-key="category-name"]');
      const selectedUnits = [];
      Array.from(row.querySelectorAll(".assign-pill")).forEach((pill) => {
        const countInput = pill.querySelector("input[type='number']");
        const count = countInput ? Math.max(0, parseInt(countInput.value || "0", 10) || 0) : 0;
        const id = parseInt(pill.dataset.id, 10);
        if (!isNaN(id) && id < units.length && count > 0) {
          for (let i = 0; i < count; i += 1) selectedUnits.push(id);
        }
      });
      return { name: nameInput.value, units: selectedUnits };
    });
  }

  function saveCurrentUnit() {
    const parsed = parseData();
    if (!parsed || !Array.isArray(parsed.units)) {
      showMessage('Expected object with "units" array.', "error");
      return false;
    }
    const idx = Math.max(0, Math.min(parsed.units.length - 1, parseInt(unitSelect.value, 10) || 0));
    parsed.units[idx] = buildUnitFromForm();
    dataInput.value = JSON.stringify(parsed, null, 2);
    refreshUnitSelect(parsed, idx);
    rebuildImageLists();
    renderCards();
    showMessage(`Saved updates to unit ${idx + 1}.`, "success");
    debouncedHostSave();
    return true;
  }

  function saveCurrentFormation() {
    const parsed = parseData();
    if (!parsed) return;
    if (!Array.isArray(parsed.formations)) parsed.formations = [];
    if (!Array.isArray(parsed.units)) parsed.units = [];
    const idx = Math.max(0, Math.min(parsed.formations.length - 1, parseInt(formationSelect.value, 10) || 0));
    parsed.formations[idx] = buildFormationFromForm();
    dataInput.value = JSON.stringify(parsed, null, 2);
    refreshFormationSelect(parsed, idx);
    rebuildImageLists();
    renderFormations();
    refreshNationSelect(parsed, Math.min(parseInt(nationSelect.value, 10) || 0, (parsed.nations || []).length - 1));
    loadNationIntoForm(Math.min(parseInt(nationSelect.value, 10) || 0, (parsed.nations || []).length - 1));
    showMessage(`Saved formation ${idx + 1}.`, "success");
    debouncedHostSave();
    return true;
  }

  function addNewFormation() {
    const parsed = parseData();
    if (!parsed) return;
    if (!Array.isArray(parsed.formations)) parsed.formations = [];
    parsed.formations.push(emptyFormation());
    dataInput.value = JSON.stringify(parsed, null, 2);
    refreshFormationSelect(parsed, parsed.formations.length - 1);
    loadFormationIntoForm(parsed.formations.length - 1);
    renderFormations();
    refreshNationSelect(parsed, 0);
    loadNationIntoForm(0);
    showMessage("Added new formation.", "success");
  }

  function deleteFormation() {
    const parsed = parseData();
    if (!parsed || !Array.isArray(parsed.formations) || !parsed.formations.length) return;
    const idx = Math.max(0, Math.min(parsed.formations.length - 1, parseInt(formationSelect.value, 10) || 0));
    parsed.formations.splice(idx, 1);
    dataInput.value = JSON.stringify(parsed, null, 2);
    const newIndex = Math.max(0, idx - 1);
    refreshFormationSelect(parsed, newIndex);
    loadFormationIntoForm(newIndex);
    renderFormations();
    refreshNationSelect(parsed, 0);
    loadNationIntoForm(0);
    showMessage("Deleted formation.", "success");
  }

  function buildNationFromForm() {
    const parsed = parseData(false) || {};
    const formations = Array.isArray(parsed.formations) ? parsed.formations : [];
    addImageToLibrary("nations", nationImage.value);
    return {
      name: nationName.value,
      description: nationDescription.value,
      image: nationImage.value,
      formations: Array.from(nationFormationsList.querySelectorAll(".assign-pill.active"))
        .map((pill) => parseInt(pill.dataset.id, 10))
        .filter((v) => !isNaN(v) && v < formations.length),
    };
  }

  function saveCurrentNation() {
    const parsed = parseData();
    if (!parsed) return;
    if (!Array.isArray(parsed.nations)) parsed.nations = [];
    if (!Array.isArray(parsed.units)) parsed.units = [];
    const idx = Math.max(0, Math.min(parsed.nations.length - 1, parseInt(nationSelect.value, 10) || 0));
    parsed.nations[idx] = buildNationFromForm();
    dataInput.value = JSON.stringify(parsed, null, 2);
    refreshNationSelect(parsed, idx);
    refreshNationOverviewSelect(parsed, idx);
    rebuildImageLists();
    renderNations();
    showMessage(`Saved nation ${idx + 1}.`, "success");
    debouncedHostSave();
    return true;
  }

  function addNewNation() {
    const parsed = parseData();
    if (!parsed) return;
    if (!Array.isArray(parsed.nations)) parsed.nations = [];
    parsed.nations.push(emptyNation());
    dataInput.value = JSON.stringify(parsed, null, 2);
    refreshNationSelect(parsed, parsed.nations.length - 1);
    refreshNationOverviewSelect(parsed, parsed.nations.length - 1);
    loadNationIntoForm(parsed.nations.length - 1);
    renderNations();
    showMessage("Added new nation.", "success");
  }

  function deleteNation() {
    const parsed = parseData();
    if (!parsed || !Array.isArray(parsed.nations) || !parsed.nations.length) return;
    const idx = Math.max(0, Math.min(parsed.nations.length - 1, parseInt(nationSelect.value, 10) || 0));
    parsed.nations.splice(idx, 1);
    dataInput.value = JSON.stringify(parsed, null, 2);
    const newIndex = Math.max(0, idx - 1);
    refreshNationSelect(parsed, newIndex);
    loadNationIntoForm(newIndex);
    renderNations();
    showMessage("Deleted nation.", "success");
  }

  function addNewUnit() {
    const parsed = parseData();
    if (!parsed) return;
    if (!Array.isArray(parsed.units)) parsed.units = [];
    parsed.units.push(emptyUnit());
    dataInput.value = JSON.stringify(parsed, null, 2);
    refreshUnitSelect(parsed, parsed.units.length - 1);
    loadUnitIntoForm(parsed.units.length - 1);
    refreshNationOverviewSelect(parsed, 0);
    renderCards();
    showMessage("Added new empty unit.", "success");
  }

  function deleteCurrentUnit() {
    const parsed = parseData();
    if (!parsed || !Array.isArray(parsed.units) || !parsed.units.length) {
      showMessage("No units to delete.", "error");
      return;
    }
    const idx = Math.max(0, Math.min(parsed.units.length - 1, parseInt(unitSelect.value, 10) || 0));
    const deleted = parsed.units[idx];
    parsed.units.splice(idx, 1);
    dataInput.value = JSON.stringify(parsed, null, 2);
    const newIndex = Math.max(0, idx - 1);
    refreshUnitSelect(parsed, newIndex);
    loadUnitIntoForm(newIndex);
    refreshNationOverviewSelect(parsed, 0);
    renderCards();
    debouncedHostSave();
    const remaining = parsed.units.length;
    const name = deleted?.name ? `"${deleted.name}"` : "unit";
    showMessage(`Deleted ${name}. ${remaining} unit(s) remain.`, "success");
  }
  function buildCard(unit, idx) {
    const card = document.createElement("article");
    card.className = "unit-card";
    card.setAttribute("data-index", idx.toString());

    // Header row
    const head = document.createElement("div");
    head.className = "card-head";
    const headLeft = document.createElement("div");
    headLeft.className = "unit-head-left";
    const name = document.createElement("div");
    name.className = "unit-name";
    name.textContent = valueOrNA(unit.name);
    headLeft.append(name);
    const price = document.createElement("div");
    price.className = "unit-price";
    price.textContent = formatPoints(unit.price);
    head.append(headLeft);
    head.append(price);

    const collapseSummary = document.createElement("div");
    collapseSummary.className = "collapse-summary stat-row";
    const tierLabel =
      unit.tier && !String(unit.tier).toLowerCase().includes("tier") ? `Tier ${unit.tier}` : unit.tier;
    [
      ["Internal", unit.internalCategory],
      ["Subcategory", unit.subCategory],
      ["Tier", tierLabel],
    ].forEach(([label, value]) => collapseSummary.appendChild(createPill(label, value)));
    console.log("buildCard checkpoint 1: Header done");

    // Image area
    const imageWrap = document.createElement("div");
    imageWrap.className = "image-wrap";
    const img = document.createElement("img");
    img.src = unit.image || fallbackImage;
    img.alt = `${valueOrNA(unit.name)} image`;
    imageWrap.appendChild(img);

    const rows = document.createElement("div");
    rows.className = "rows";

    rows.appendChild(sectionTitle("Unit overview"));
    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    [
      ["Tier", tierLabel],
      ["Internal Category", unit.internalCategory],
      ["Subcategory", unit.subCategory],
    ].forEach(([label, value]) => metaRow.appendChild(createPill(label, value)));
    rows.appendChild(metaRow);

    if (unit.description) {
      const desc = document.createElement("div");
      desc.className = "note";
      desc.textContent = unit.description;
      rows.appendChild(desc);
    }

    rows.appendChild(sectionTitle("Stats"));
    const stats = unit.stats || {};
    const statRow = document.createElement("div");
    statRow.className = "stat-row";
    [
      ["Armor", formatWithUnit(stats.armor, "pts")],
      ["Health", formatWithUnit(stats.health, "HP")],
      ["Squad Size", formatWithUnit(stats.squadSize, "soldiers")],
      ["Visual Range", formatWithUnit(stats.visualRange, "m")],
      ["Stealth", formatPercent(stats.stealth)],
      ["Speed", formatSpeed(stats.speed)],
      ["Weight", formatWithUnit(stats.weight, "kg")],
    ].forEach(([label, value]) => statRow.appendChild(createPill(label, value)));
    rows.appendChild(statRow);
    console.log("buildCard checkpoint 3: Stats done");

    /* removed combined section */
    const grenades = unit.grenades || {};
    const caps = unit.capabilities || {};
    const capRow = document.createElement("div");
    capRow.className = "line-two";

    rows.appendChild(sectionTitle("Capabilities"));
    [
      ["Static Line Jump", yesNo(caps.staticLineJump)],
      ["HALO/HAHO", yesNo(caps.haloHaho)],
    ].forEach(([label, value]) => capRow.appendChild(createPill(label, value)));

    const sprintVal =
      caps.sprint && (caps.sprint.distance || caps.sprint.speed || caps.sprint.cooldown)
        ? `${formatWithUnit(caps.sprint.distance, "m")} / ${formatSpeed(caps.sprint.speed)} / ${formatWithUnit(
          caps.sprint.cooldown,
          "s"
        )}`
        : valueOrNA(caps.sprint);
    capRow.appendChild(createPill("Sprint (dist/speed/cd)", sprintVal));
    capRow.appendChild(createPill("Laser Designator", yesNo(caps.laserDesignator)));
    rows.appendChild(capRow);

    // Grenades
    rows.appendChild(sectionTitle("Grenades"));
    const grenRow = document.createElement("div");
    grenRow.className = "line-two";
    [
      ["Smoke", grenades.smoke],
      ["Flash", grenades.flash],
      ["Thermite", grenades.thermite],
      ["Frag", grenades.frag],
      ["Total Grenades", grenades.total],
    ].forEach(([label, value]) => grenRow.appendChild(createPill(label, value)));
    rows.appendChild(grenRow);

    // Guns section
    rows.appendChild(sectionTitle("Weapons"));
    const gunsWrap = document.createElement("div");
    gunsWrap.className = "guns";
    const guns = Array.isArray(unit.guns) ? unit.guns.slice(0, 10) : [];
    guns.forEach((gun) => gunsWrap.appendChild(buildGunRow(gun)));
    if (!guns.length) {
      const note = document.createElement("div");
      note.className = "helper";
      note.textContent = "No guns defined for this unit.";
      gunsWrap.appendChild(note);
    }

    rows.appendChild(gunsWrap);
    console.log("buildCard checkpoint 4: Guns done");

    // Equipment section
    rows.appendChild(sectionTitle("Equipment"));
    const equipmentWrap = document.createElement("div");
    equipmentWrap.className = "equipment";
    const equipment = Array.isArray(unit.equipment) ? unit.equipment.slice(0, 10) : [];
    equipment.forEach((item) => {
      const card = document.createElement("div");
      card.className = "gun-row";
      const name = document.createElement("div");
      name.className = "gun-title";
      name.textContent = valueOrNA(item.name);
      const count = document.createElement("div");
      count.className = "gun-meta";
      count.textContent = `Count: ${valueOrNA(item.count)}`;
      const type = document.createElement("div");
      type.className = "gun-meta";
      type.textContent = `Type: ${valueOrNA(item.type)}`;
      const desc = document.createElement("div");
      desc.className = "gun-meta";
      desc.textContent = `Description: ${valueOrNA(item.description)}`;
      const notes = document.createElement("div");
      notes.className = "gun-meta";
      notes.textContent = `Notes: ${valueOrNA(item.notes)}`;
      card.append(name, count, type, desc, notes);
      equipmentWrap.appendChild(card);
    });
    if (!equipment.length) {
      const note = document.createElement("div");
      note.className = "helper";
      note.textContent = "No equipment listed.";
      equipmentWrap.appendChild(note);
    }
    rows.appendChild(equipmentWrap);
    console.log("buildCard checkpoint 5: Equipment done");

    const note = document.createElement("div");
    note.className = "note";
    note.textContent = "Images auto-scale to a fixed height for consistent card sizes.";

    card.append(head, collapseSummary, imageWrap, rows, note);
    return card;
  }

  function renderCards() {
    clearMessage();

    let parsed = parseData();
    cardsContainer.innerHTML = "";
    if (!parsed || !Array.isArray(parsed.units) || !parsed.units.length) {
      loadSample();
      logEvent("renderCards_empty_fallback");
      parsed = parseData();
    }
    if (!parsed || !Array.isArray(parsed.units) || !parsed.units.length) {
      renderUnitBrowser([]);
      showMessage("No units found in data.", "error");
      return;
    }
    rebuildWeaponLibrary(parsed);

    const currentIndex = Math.max(0, Math.min(parseInt(unitSelect.value, 10) || 0, parsed.units.length - 1));
    refreshUnitSelect(parsed, currentIndex);
    loadUnitIntoForm(currentIndex);
    refreshFormationSelect(parsed, 0);
    loadFormationIntoForm(0);
    refreshNationSelect(parsed, 0);
    loadNationIntoForm(0);
    refreshNationOverviewSelect(parsed, 0);

    cardsContainer.innerHTML = "";

    const term = (searchInput.value || "").toLowerCase().trim();
    const catTerm = (filterCategoryInput?.value || "").toLowerCase().trim();
    const internalFilter = (filterInternalSelect?.value || "").toUpperCase();
    const tierFilter = (filterTierSelect?.value || "").trim();
    const sorter = sortUnitsSelect?.value || "name-asc";
    const unitsLimited = parsed.units
      .map((unit, idx) => ({ unit, idx }))
      .filter(({ unit }) => {
        if (term) {
          const nameMatch = (unit.name || "").toLowerCase().includes(term);
          const catMatch = (unit.category || "").toLowerCase().includes(term);
          if (!nameMatch && !catMatch) return false;
        }
        if (catTerm && !(unit.category || "").toLowerCase().includes(catTerm)) return false;
        if (internalFilter && (unit.internalCategory || "").toUpperCase() !== internalFilter) return false;
        if (tierFilter && `${unit.tier || ""}` !== tierFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const ua = a.unit;
        const ub = b.unit;
        switch (sorter) {
          case "name-desc":
            return (ub.name || "").localeCompare(ua.name || "");
          case "tier-desc":
            return (toNumber(ub.tier) || 0) - (toNumber(ua.tier) || 0);
          case "tier-asc":
            return (toNumber(ua.tier) || 0) - (toNumber(ub.tier) || 0);
          case "price-desc":
            return (toNumber(ub.price) || 0) - (toNumber(ua.price) || 0);
          case "price-asc":
            return (toNumber(ua.price) || 0) - (toNumber(ub.price) || 0);
          case "name-asc":
          default:
            return (ua.name || "").localeCompare(ub.name || "");
        }
      })
      .slice(0, 50);
    if (!unitsLimited.length && parsed.units.length > 0) {
      // Clear filters automatically if nothing matches.
      if (searchInput) searchInput.value = "";
      if (filterCategoryInput) filterCategoryInput.value = "";
      if (filterInternalSelect) filterInternalSelect.value = "";
      if (filterTierSelect) filterTierSelect.value = "";
      renderCards();
      showMessage("No units matched filters. Cleared filters and showing all.", "error");
      return;
    }

    unitsLimited.forEach(({ unit, idx }) => {
      try {
        const card = buildCard(unit, idx);
        cardsContainer.appendChild(card);
      } catch (e) {
        console.error("Failed to render card", e);
      }
    });

    renderUnitBrowser(unitsLimited);

    if (!unitsLimited.length) {
      showMessage("No units match the search.", "error");
    } else {
      showMessage(`Rendered ${unitsLimited.length} unit statcard(s).`, "success");
    }

    // Keep formation/nation summaries in sync with unit changes.
    renderFormations();
    renderNations();
    if (currentMode === "stats") renderStats();
  }

  function loadSample() {
    dataInput.value = JSON.stringify(sampleData, null, 2);
    refreshUnitSelect(sampleData, 0);
    loadUnitIntoForm(0);
    refreshFormationSelect(sampleData, 0);
    loadFormationIntoForm(0);
    refreshNationSelect(sampleData, 0);
    loadNationIntoForm(0);
    refreshNationOverviewSelect(sampleData, 0);
    rebuildWeaponLibrary(sampleData);
    safeRenderTagLists();
    logEvent("loadSample", { units: sampleData.units.length });
    renderCards();
    renderFormations();
    renderNations();
  }

  function saveToStorage() {
    try {
      const payload = buildPayload();
      if (!payload) {
        showMessage("Nothing to save.", "error");
        return;
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "rts-data.json";
      link.click();
      showMessage("Saved JSON file (downloaded).", "success");
      if (window.chrome?.webview?.postMessage) {
        window.chrome.webview.postMessage({ type: "save", payload });
      }
    } catch (e) {
      showMessage("Failed to save JSON file.", "error");
    }
  }

  function handleDataFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        const parsed = payload.data || payload;
        if (!parsed || !Array.isArray(parsed.units)) {
          showMessage("Invalid JSON structure.", "error");
          return;
        }
        dataInput.value = JSON.stringify(parsed, null, 2);
        Object.keys(weaponTemplates).forEach((k) => delete weaponTemplates[k]);
        Object.keys(ammoLibrary).forEach((k) => delete ammoLibrary[k]);
        if (payload.weapons) Object.assign(weaponTemplates, payload.weapons);
        if (payload.ammo) Object.assign(ammoLibrary, payload.ammo);
        refreshWeaponSelect();
        refreshAmmoSelect();
        refreshUnitSelect(parsed, 0);
        loadUnitIntoForm(0);
        refreshFormationSelect(parsed, 0);
        loadFormationIntoForm(0);
        refreshNationSelect(parsed, 0);
        loadNationIntoForm(0);
        refreshNationOverviewSelect(parsed, 0);
        rebuildWeaponLibrary(parsed);
        renderCards();
        renderFormations();
        renderNations();
        showMessage("Loaded JSON file.", "success");
      } catch (err) {
        showMessage("Failed to parse JSON file.", "error");
      } finally {
        if (loadDataFile) loadDataFile.value = "";
      }
    };
    reader.readAsText(file);
  }

  function requestHostLoad() {
    if (window.chrome?.webview?.postMessage) {
      window.chrome.webview.postMessage({ type: "request-load" });
    }
  }

  function applyHostPayload(payload) {
    logEvent("applyHostPayload", { empty: !payload, keys: payload ? Object.keys(payload) : [] });
    if (!payload) {
      showMessage("Invalid data from host.", "error");
      return;
    }
    const parsed = payload.data && Array.isArray(payload.data.units) ? payload.data : payload;
    if (!parsed || !Array.isArray(parsed.units)) {
      showMessage("Invalid data from host.", "error");
      return;
    }
    dataInput.value = JSON.stringify(parsed, null, 2);
    Object.keys(weaponTemplates).forEach((k) => delete weaponTemplates[k]);
    Object.keys(ammoLibrary).forEach((k) => delete ammoLibrary[k]);
    Object.keys(imageLibrary).forEach((k) => (imageLibrary[k] = []));
    Object.keys(weaponTags.categories || {}).forEach((k) => delete weaponTags.categories[k]);
    Object.keys(weaponTags.calibers || {}).forEach((k) => delete weaponTags.calibers[k]);
    if (payload.weapons) Object.assign(weaponTemplates, payload.weapons);
    if (payload.ammo) Object.assign(ammoLibrary, payload.ammo);
    if (payload.weaponTags) {
      if (payload.weaponTags.categories) Object.assign(weaponTags.categories, payload.weaponTags.categories);
      if (payload.weaponTags.calibers) Object.assign(weaponTags.calibers, payload.weaponTags.calibers);
    }
    if (payload.images) Object.assign(imageLibrary, payload.images);
    else rebuildImageLibraryFromData(parsed);
    refreshWeaponSelect();
    refreshAmmoSelect();
    refreshUnitSelect(parsed, 0);
    loadUnitIntoForm(0);
    refreshFormationSelect(parsed, 0);
    loadFormationIntoForm(0);
    refreshNationSelect(parsed, 0);
    loadNationIntoForm(0);
    refreshNationOverviewSelect(parsed, 0);
    rebuildImageLists();
    rebuildWeaponLibrary(parsed);
    safeRenderTagLists();
    logEvent("loadSample", { units: sampleData.units.length });
    renderCards();
    renderFormations();
    renderNations();
    showMessage("Loaded data from host.", "success");
    logEvent("hostDataLoaded", { units: parsed.units.length, formations: parsed.formations.length });
  }

  function buildPayload() {
    const data = parseData(false);
    if (!data) return null;
    return {
      data,
      weapons: weaponTemplates,
      ammo: ammoLibrary,
      images: imageLibrary,
      weaponTags,
    };
  }

  function autoPersist() {
    const payload = buildPayload();
    if (!payload) return;
    // host save
    if (window.chrome?.webview?.postMessage) {
      window.chrome.webview.postMessage({ type: "save", payload });
    }
    // browser-local save
    try {
      localStorage.setItem("rtsAutoSave", JSON.stringify(payload));
    } catch { }
  }

  async function tryLoadLocalDatabase() {
    if (localDbAttempted) return;
    localDbAttempted = true;
    try {
      const fetchJson = async (path) => {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.json();
      };
      const [units, formations, nations, tagPayload] = await Promise.all([
        fetchJson("database/units.json").catch(() => null),
        fetchJson("database/formations.json").catch(() => null),
        fetchJson("database/nations.json").catch(() => null),
        fetchJson("database/weaponTags.json").catch(() => null),
      ]);
      const parsed = parseData(false) || { units: [], formations: [], nations: [] };
      if (Array.isArray(units)) parsed.units = units;
      if (Array.isArray(formations)) parsed.formations = formations;
      if (Array.isArray(nations)) parsed.nations = nations;
      if (tagPayload) {
        if (tagPayload.categories) Object.assign(weaponTags.categories, tagPayload.categories);
        if (tagPayload.calibers) Object.assign(weaponTags.calibers, tagPayload.calibers);
        safeRenderTagLists();
      }
      dataInput.value = JSON.stringify(parsed, null, 2);
      refreshUnitSelect(parsed, 0);
      refreshFormationSelect(parsed, 0);
      refreshNationSelect(parsed, 0);
      renderCards();
      renderFormations();
      renderNations();
      showMessage("Loaded local database files.", "success");
    } catch (e) {
      // silent fallback
    }
  }

  const debouncedHostSave = () => {
    if (!window.chrome?.webview?.postMessage) return;
    clearTimeout(hostSaveTimer);
    hostSaveTimer = setTimeout(() => {
      const payload = buildPayload();
      if (payload) window.chrome.webview.postMessage({ type: "save", payload });
    }, 800);
  };

  if (window.chrome?.webview?.postMessage) {
    window.chrome.webview.addEventListener("message", (event) => {
      const msg = event.data || {};
      if (msg.type === "load") {
        applyHostPayload(msg.payload || {});
      }
    });
    requestHostLoad();
  }

  async function exportCardsAsPng() {
    if (typeof html2canvas !== "function") {
      showMessage("Export library not loaded.", "error");
      return;
    }
    const target = cardsContainer;
    if (!target || !target.children.length) {
      showMessage("No cards to export.", "error");
      return;
    }

    // Prepare A4-sized offscreen clone
    const A4_WIDTH = 794; // px at 96dpi (8.27in)
    const A4_HEIGHT = 1123; // px at 96dpi (11.69in)
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-20000px";
    wrapper.style.top = "0";
    wrapper.style.width = `${A4_WIDTH}px`;
    wrapper.style.background = "#0b1b37";
    const clone = target.cloneNode(true);
    clone.style.width = "100%";
    clone.style.maxWidth = `${A4_WIDTH}px`;
    clone.style.gap = "10px";
    clone.querySelectorAll(".card-grid").forEach((grid) => {
      grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(360px, 1fr))";
    });
    clone.querySelectorAll(".unit-card").forEach((card) => {
      card.style.breakInside = "avoid";
      card.style.pageBreakInside = "avoid";
      card.style.transform = "scale(0.95)";
      card.style.transformOrigin = "top left";
    });
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    let canvas = await html2canvas(clone, {
      backgroundColor: "#0b1b37",
      scale: 1.5,
      width: A4_WIDTH,
    });

    // If taller than A4, scale down to fit height
    if (canvas.height > A4_HEIGHT) {
      const ratio = A4_HEIGHT / canvas.height;
      const scaled = document.createElement("canvas");
      scaled.width = Math.floor(canvas.width * ratio);
      scaled.height = A4_HEIGHT;
      const ctx = scaled.getContext("2d");
      ctx.scale(ratio, ratio);
      ctx.drawImage(canvas, 0, 0);
      canvas = scaled;
    }

    const link = document.createElement("a");
    link.download = "unit-cards.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    document.body.removeChild(wrapper);
    showMessage("Exported cards to PNG (A4-fit).", "success");
  }

  function exportSelectedNation() {
    const parsed = parseData(false);
    if (!parsed || !Array.isArray(parsed.nations) || !parsed.nations.length) {
      showMessage("No nations to export.", "error");
      return;
    }
    const selectedIdx = parseInt(nationOverviewSelect.value, 10) || 0;
    const nation = parsed.nations[selectedIdx];
    if (!nation) {
      showMessage("Select a nation first.", "error");
      return;
    }
    const formations = Array.isArray(parsed.formations) ? parsed.formations : [];
    const units = Array.isArray(parsed.units) ? parsed.units : [];

    const formationIds = (nation.formations || []).filter((fid) => formations[fid]);
    const unitSet = new Set();
    formationIds.forEach((fid) => {
      const form = formations[fid];
      (form?.categories || []).forEach((cat) => (cat.units || []).forEach((uid) => units[uid] && unitSet.add(uid)));
    });

    const unitMap = new Map();
    const exportedUnits = [];
    Array.from(unitSet).forEach((uid, idx) => {
      unitMap.set(uid, idx);
      exportedUnits.push(JSON.parse(JSON.stringify(units[uid])));
    });

    const formationMap = new Map();
    const exportedFormations = formationIds.map((fid, idx) => {
      formationMap.set(fid, idx);
      const clone = JSON.parse(JSON.stringify(formations[fid] || {}));
      (clone.categories || []).forEach((cat) => {
        cat.units = (cat.units || [])
          .map((uid) => unitMap.get(uid))
          .filter((v) => v !== undefined);
      });
      return clone;
    });

    const exportedNation = JSON.parse(JSON.stringify(nation));
    exportedNation.formations = formationIds.map((fid) => formationMap.get(fid));

    const payload = {
      units: exportedUnits,
      formations: exportedFormations,
      nations: [exportedNation],
    };
    const filename =
      (nation.name || "nation")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "nation";
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
    showMessage(`Exported ${nation.name || "nation"} with formations/units.`, "success");
  }

  function mergeImportedNation(payload) {
    const data = parseData(false) || {};
    data.units = Array.isArray(data.units) ? data.units : [];
    data.formations = Array.isArray(data.formations) ? data.formations : [];
    data.nations = Array.isArray(data.nations) ? data.nations : [];

    const importUnits = Array.isArray(payload?.units) ? payload.units : [];
    const importFormations = Array.isArray(payload?.formations) ? payload.formations : [];
    const importNations = Array.isArray(payload?.nations) ? payload.nations : [];

    if (!importNations.length) {
      showMessage("Import file has no nations.", "error");
      return;
    }

    const unitOffset = data.units.length;
    importUnits.forEach((unit) => data.units.push(unit));

    const formationOffset = data.formations.length;
    importFormations.forEach((form) => {
      const clone = JSON.parse(JSON.stringify(form || {}));
      (clone.categories || []).forEach((cat) => {
        cat.units = (cat.units || [])
          .map((uid) => {
            const id = typeof uid === "number" ? uid : parseInt(uid, 10);
            return isNaN(id) ? null : unitOffset + id;
          })
          .filter((v) => v !== null);
      });
      data.formations.push(clone);
    });

    importNations.forEach((nat) => {
      const clone = JSON.parse(JSON.stringify(nat || {}));
      clone.formations = (clone.formations || [])
        .map((fid) => {
          const id = typeof fid === "number" ? fid : parseInt(fid, 10);
          return isNaN(id) ? null : formationOffset + id;
        })
        .filter((v) => v !== null);
      data.nations.push(clone);
    });

    dataInput.value = JSON.stringify(data, null, 2);
    refreshUnitSelect(data, data.units.length - 1);
    refreshFormationSelect(data, data.formations.length - 1);
    refreshNationSelect(data, data.nations.length - 1);
    refreshNationOverviewSelect(data, data.nations.length - 1);
    renderCards();
    renderFormations();
    renderNations();
    showMessage(`Imported ${importNations.length} nation(s).`, "success");
  }

  function handleNationImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        mergeImportedNation(payload);
      } catch (err) {
        showMessage("Unable to read nation import file.", "error");
      } finally {
        importNationFile.value = "";
      }
    };
    reader.readAsText(file);
  }

  function toggleCard(element) {
    if (!element) return;
    const isCollapsed = element.classList.toggle("collapsed");
    const btn = element.querySelector('[data-action="toggle-collapse"]');
    if (btn) btn.textContent = isCollapsed ? "Expand" : "Collapse";
  }

  function highlightCard(idx) {
    const card = cardsContainer.querySelector(`[data-index="${idx}"]`);
    if (!card) return;
    card.classList.add("highlight");
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => card.classList.remove("highlight"), 1200);
  }

  function highlightNationCard(idx) {
    const card = document.querySelector(`[data-nation="${idx}"]`);
    if (!card) return;
    const details = card.querySelector(".nation-details");
    const toggle = card.querySelector(".nation-head button");
    if (details && details.style.display === "none") {
      details.style.display = "flex";
      if (toggle) toggle.textContent = "Collapse";
    }
    card.classList.add("highlight");
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => card.classList.remove("highlight"), 1200);
  }

  function renderFormations() {
    const parsed = parseData(false);
    const formationCards = document.getElementById("formationCards");
    if (!formationCards) return;
    formationCards.innerHTML = "";
    if (!parsed || !Array.isArray(parsed.formations) || !parsed.formations.length) {
      const empty = document.createElement("div");
      empty.className = "helper";
      empty.textContent = "No formations defined.";
      formationCards.appendChild(empty);
      return;
    }
    const units = Array.isArray(parsed.units) ? parsed.units : [];
    parsed.formations.forEach((form) => {
      const card = document.createElement("div");
      card.className = "nation-card";

      const head = document.createElement("div");
      head.className = "nation-head";
      const name = document.createElement("div");
      name.className = "nation-name";
      name.textContent = form.name || "Unnamed formation";
      const meta = document.createElement("div");
      meta.className = "label";
      meta.textContent = `${(form.categories || []).length} categories`;
      head.append(name, meta);

      if (form.description) {
        const desc = document.createElement("div");
        desc.className = "label";
        desc.textContent = form.description;
        card.append(head, desc);
      } else {
        card.append(head);
      }

      const catGrid = document.createElement("div");
      catGrid.className = "category-grid";
      (form.categories || []).forEach((cat) => {
        const pill = document.createElement("div");
        pill.className = "category-pill";
        const title = document.createElement("div");
        title.className = "strong";
        title.textContent = cat.name || "Category";
        const unitIds = Array.isArray(cat.units) ? cat.units : [];
        const totalUnits = unitIds.length;
        const personnel = unitIds.reduce((sum, id) => {
          const u = units[id] || {};
          const sz = u.stats && Number(u.stats.squadSize);
          return sum + (isNaN(sz) ? 0 : sz);
        }, 0);
        const stats = document.createElement("div");
        stats.className = "label";
        stats.textContent = `Units: ${totalUnits} | Personnel: ${personnel}`;
        pill.append(title, stats);
        catGrid.appendChild(pill);
      });

      card.append(catGrid);
      formationCards.appendChild(card);
    });
  }

  function renderNations() {
    const parsed = parseData(false);
    const nationCards = document.getElementById("nationCards");
    if (!nationCards) return;
    nationCards.innerHTML = "";
    if (!parsed || !Array.isArray(parsed.nations) || !parsed.nations.length) {
      const empty = document.createElement("div");
      empty.className = "helper";
      empty.textContent = "No nations defined.";
      nationCards.appendChild(empty);
      return;
    }
    const units = Array.isArray(parsed.units) ? parsed.units : [];
    const formations = Array.isArray(parsed.formations) ? parsed.formations : [];

    parsed.nations.forEach((nation, nid) => {
      const card = document.createElement("div");
      card.className = "nation-card";
      card.dataset.nation = nid.toString();

      if (nation.image) {
        const img = document.createElement("img");
        img.className = "nation-image";
        img.src = nation.image;
        img.alt = `${nation.name || "Nation"} image`;
        card.appendChild(img);
      }

      const head = document.createElement("div");
      head.className = "nation-head";
      const headLeft = document.createElement("div");
      const name = document.createElement("div");
      name.className = "nation-name";
      name.textContent = nation.name || "Unnamed nation";
      const formationIds = Array.isArray(nation.formations) ? nation.formations : [];
      const unitIds = new Set();
      formationIds.forEach((fid) => {
        const form = formations[fid];
        (form?.categories || []).forEach((cat) => {
          (cat.units || []).forEach((uid) => unitIds.add(uid));
        });
      });
      const personnel = Array.from(unitIds).reduce((sum, id) => {
        const u = units[id] || {};
        const sz = u.stats && Number(u.stats.squadSize);
        return sum + (isNaN(sz) ? 0 : sz);
      }, 0);
      const meta = document.createElement("div");
      meta.className = "formation-meta";
      meta.textContent = `Formations: ${formationIds.length} | Units: ${unitIds.size} | Personnel: ${personnel}`;
      headLeft.append(name, meta);
      if (nation.description) {
        const desc = document.createElement("div");
        desc.className = "label";
        desc.textContent = nation.description;
        headLeft.append(desc);
      }
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "ghost small";
      toggle.textContent = "Expand";
      head.append(headLeft, toggle);

      const details = document.createElement("div");
      details.className = "nation-details";
      details.style.display = "none";

      const formationList = document.createElement("div");
      formationList.className = "formation-list";
      if (!formationIds.length) {
        const empty = document.createElement("div");
        empty.className = "label";
        empty.textContent = "No formations assigned.";
        formationList.appendChild(empty);
      } else {
        formationIds.forEach((fid) => {
          const form = formations[fid];
          if (!form) return;
          const formBlock = document.createElement("div");
          formBlock.className = "formation-block";

          const formHead = document.createElement("div");
          formHead.className = "formation-line";
          const formTitle = document.createElement("div");
          formTitle.className = "strong";
          formTitle.textContent = form.name || "Formation";
          const formMeta = document.createElement("div");
          formMeta.className = "label";
          const formUnitIds = new Set();
          (form.categories || []).forEach((cat) => (cat.units || []).forEach((uid) => formUnitIds.add(uid)));
          const formPersonnel = Array.from(formUnitIds).reduce((sum, id) => {
            const u = units[id] || {};
            const sz = u.stats && Number(u.stats.squadSize);
            return sum + (isNaN(sz) ? 0 : sz);
          }, 0);
          formMeta.textContent = `Units: ${formUnitIds.size} | Personnel: ${formPersonnel}`;
          const formToggle = document.createElement("button");
          formToggle.type = "button";
          formToggle.className = "ghost tiny";
          formToggle.textContent = "Expand formation";
          formHead.append(formTitle, formMeta, formToggle);

          const unitWrap = document.createElement("div");
          unitWrap.className = "unit-chip-row";
          unitWrap.style.display = "none";
          (form.categories || []).forEach((cat) => {
            const catRow = document.createElement("div");
            catRow.className = "formation-category";
            const catTitle = document.createElement("div");
            catTitle.className = "label";
            catTitle.textContent = cat.name || "Category";
            const chips = document.createElement("div");
            chips.className = "unit-chip-row";
            (cat.units || []).forEach((uid) => {
              const u = units[uid];
              const chip = document.createElement("span");
              chip.className = "unit-chip";
              chip.textContent = (u && u.name) || `Unit ${uid + 1}`;
              chips.appendChild(chip);
            });
            catRow.append(catTitle, chips);
            unitWrap.appendChild(catRow);
          });

          formToggle.addEventListener("click", () => {
            const isOpen = unitWrap.style.display !== "none";
            unitWrap.style.display = isOpen ? "none" : "flex";
            formToggle.textContent = isOpen ? "Expand formation" : "Collapse formation";
          });

          formBlock.append(formHead, unitWrap);
          formationList.appendChild(formBlock);
        });
      }

      details.appendChild(formationList);
      toggle.addEventListener("click", () => {
        const isOpen = details.style.display !== "none";
        details.style.display = isOpen ? "none" : "flex";
        toggle.textContent = isOpen ? "Expand" : "Collapse";
      });

      card.append(head, details);
      nationCards.appendChild(card);
    });
  }

  function renderStats() {
    if (!statsSection) return;
    const parsed = parseData(false);
    if (!parsed) return;
    const units = Array.isArray(parsed.units) ? parsed.units : [];
    const formations = Array.isArray(parsed.formations) ? parsed.formations : [];
    const nations = Array.isArray(parsed.nations) ? parsed.nations : [];

    const unitScores = units
      .map((u, idx) => {
        const sc = scoreUnitDetailed(u);
        if (!sc) return null;
        const values = Object.values(sc.metrics);
        const total = values.reduce((a, b) => a + b, 0) / values.length;
        return { idx, unit: u, total, metrics: sc.metrics };
      })
      .filter(Boolean)
      .sort((a, b) => b.total - a.total);
    const topUnits = unitScores.slice(0, 10);
    if (selectedRadar.unit === null || !unitScores.find((u) => u.idx === selectedRadar.unit)) {
      selectedRadar.unit = unitScores[0]?.idx ?? null;
    }

    if (topUnitsList) {
      topUnitsList.innerHTML = "";
      if (!topUnits.length) {
        const empty = document.createElement("div");
        empty.className = "helper";
        empty.textContent = "No units available.";
        topUnitsList.appendChild(empty);
      } else {
        topUnits.forEach((entry, rank) => {
          const row = document.createElement("div");
          row.className = "item-row";
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = selectedRadar.unit === entry.idx ? "active" : "";
          btn.innerHTML = `<span class="pill strong">${rank + 1}.</span><span class="label">${entry.unit.name || "Unit"
            }</span><span class="pill">Score: ${clampScore(entry.total)}</span>`;
          btn.addEventListener("click", () => {
            selectedRadar.unit = entry.idx;
            renderStats();
          });
          row.appendChild(btn);
          topUnitsList.appendChild(row);
        });
      }
    }

    const formationScoresAll = formations
      .map((f, idx) => {
        const sc = scoreFormationDetailed(f, units);
        if (!sc) return null;
        const values = Object.values(sc.metrics);
        const total = values.reduce((a, b) => a + b, 0) / values.length;
        return { formation: f, score: sc, idx, total };
      })
      .filter(Boolean)
      .sort((a, b) => b.total - a.total);

    if (selectedRadar.formation === null || !formationScoresAll.find((f) => f.idx === selectedRadar.formation)) {
      selectedRadar.formation = formationScoresAll[0]?.idx ?? null;
    }

    const formationScores = formationScoresAll.slice(0, 10);

    if (topFormationsList) {
      topFormationsList.innerHTML = "";
      if (!formationScores.length) {
        topFormationsList.textContent = "No formations available.";
      } else {
        formationScores.forEach((entry, rank) => {
          const row = document.createElement("div");
          row.className = "item-row";
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = selectedRadar.formation === entry.idx ? "active" : "";
          btn.innerHTML = `<span class="pill strong">${rank + 1}.</span><span class="label">${entry.formation.name || "Formation"
            }</span><span class="pill">Score: ${clampScore(entry.total)}</span>`;
          btn.addEventListener("click", () => {
            selectedRadar.formation = entry.idx;
            renderStats();
          });
          row.appendChild(btn);
          topFormationsList.appendChild(row);
        });
      }
    }

    const nationScoresAll = nations
      .map((n, idx) => {
        const sc = scoreNationDetailed(n, formations, units);
        if (!sc) return null;
        const values = Object.values(sc.metrics);
        const total = values.reduce((a, b) => a + b, 0) / values.length;
        return { nation: n, score: sc, idx, total };
      })
      .filter(Boolean)
      .sort((a, b) => b.total - a.total);

    if (selectedRadar.nation === null || !nationScoresAll.find((n) => n.idx === selectedRadar.nation)) {
      selectedRadar.nation = nationScoresAll[0]?.idx ?? null;
    }

    const nationScores = nationScoresAll.slice(0, 10);

    if (topNationsList) {
      topNationsList.innerHTML = "";
      if (!nationScores.length) {
        topNationsList.textContent = "No nations available.";
      } else {
        nationScores.forEach((entry, rank) => {
          const row = document.createElement("div");
          row.className = "item-row";
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = selectedRadar.nation === entry.idx ? "active" : "";
          btn.innerHTML = `<span class="pill strong">${rank + 1}.</span><span class="label">${entry.nation.name || "Nation"
            }</span><span class="pill">Score: ${clampScore(entry.total)}</span>`;
          btn.addEventListener("click", () => {
            selectedRadar.nation = entry.idx;
            renderStats();
          });
          row.appendChild(btn);
          topNationsList.appendChild(row);
        });
      }
    }

    const datasets = [];
    let labels = [];
    if (statsViewType === "unit") {
      labels = [
        "Lethality",
        "Survivability",
        "Sustainability",
        "Mobility",
        "Versatility",
        "Stealth (%)",
        "Speed",
        "Morale",
        "Training",
        "Anti Infantry",
        "Anti Tank",
        "Anti Air",
      ];
      const selUnit = unitScores.find((u) => u.idx === selectedRadar.unit);
      if (selUnit) {
        datasets.push({
          label: selUnit.unit.name || "Unit",
          data: Object.values(selUnit.metrics),
          borderColor: "#76c3ff",
          backgroundColor: "rgba(118, 195, 255, 0.15)",
          fill: true,
        });
      }
    } else if (statsViewType === "formation") {
      labels = [
        "Recon",
        "Support",
        "Armor",
        "Infantry",
        "Logistics",
        "Air",
        "Sustaiment",
        "Speed",
        "Supply Efficency",
        "AO-Size",
        "Versatility",
      ];
      const selFormation = formationScoresAll.find((f) => f.idx === selectedRadar.formation);
      if (selFormation) {
        datasets.push({
          label: selFormation.formation.name || "Formation",
          data: Object.values(selFormation.score.metrics),
          borderColor: "#7fd49c",
          backgroundColor: "rgba(127, 212, 156, 0.15)",
          fill: true,
        });
      }
    } else if (statsViewType === "nation") {
      labels = ["Strategic Momentum", "Supply Efficency", "AO-Size", "Maneuver Speed"];
      const selNation = nationScoresAll.find((n) => n.idx === selectedRadar.nation);
      if (selNation) {
        datasets.push({
          label: selNation.nation.name || "Nation",
          data: Object.values(selNation.score.metrics),
          borderColor: "#fbbf24",
          backgroundColor: "rgba(251, 191, 36, 0.15)",
          fill: true,
        });
      }
    }

    const ctx = document.getElementById("statsChart");
    if (ctx && typeof Chart !== "undefined") {
      if (statsChart) statsChart.destroy();
      statsChart = new Chart(ctx, {
        type: "radar",
        data: { labels, datasets },
        options: {
          scales: { r: { suggestedMin: 0, suggestedMax: 100, grid: { color: "rgba(255,255,255,0.12)" } } },
          plugins: { legend: { labels: { color: "#eaf3ff" } } },
        },
      });
    }
  }

  renderButton.addEventListener("click", renderCards);
  loadSampleButton.addEventListener("click", loadSample);
  unitSelect.addEventListener("change", () => loadUnitIntoForm(parseInt(unitSelect.value, 10) || 0));
  addGunButton.addEventListener("click", () => addGunEditRow());
  addEquipmentButton.addEventListener("click", () => addEquipmentRow());
  saveUnitButton.addEventListener("click", () => {
    saveCurrentUnit();
    debouncedHostSave();
  });
  addUnitButton.addEventListener("click", () => {
    addNewUnit();
    debouncedHostSave();
  });
  deleteUnitButton.addEventListener("click", () => {
    deleteCurrentUnit();
    debouncedHostSave();
  });
  cardsContainer.addEventListener("click", (event) => {
    const gunToggle = event.target.closest("[data-action='toggle-gun']");
    if (gunToggle) {
      const gunRow = gunToggle.closest(".gun-row");
      if (gunRow) {
        const collapsed = gunRow.classList.toggle("collapsed");
        gunToggle.textContent = collapsed ? "Expand weapon" : "Collapse weapon";
        const metaWrap = gunRow.querySelector(".gun-meta-wrap");
        const details = gunRow.querySelector(".gun-details");
        if (collapsed) {
          // hide secondary details when collapsed
          if (details) details.style.display = "none";
          if (metaWrap) {
            Array.from(metaWrap.children).forEach((child, idx) => {
              // keep first three (count, total ammo, range)
              child.style.display = idx <= 2 ? "" : "none";
            });
          }
        } else {
          if (details) details.style.display = "";
          if (metaWrap) {
            Array.from(metaWrap.children).forEach((child) => (child.style.display = ""));
          }
        }
      }
      event.stopPropagation();
      return;
    }
    const card = event.target.closest(".unit-card");
    if (card) toggleCard(card);
  });
  viewModeBtn?.addEventListener("click", () => toggleMode("view"));
  editModeBtn?.addEventListener("click", () => toggleMode("edit"));
  formationOverviewBtn?.addEventListener("click", () => {
    toggleMode("formation-overview");
    renderFormations();
  });
  formationEditorBtn?.addEventListener("click", () => {
    if (!saveCurrentUnit()) return;
    toggleMode("formation-edit");
    loadFormationIntoForm(parseInt(formationSelect.value, 10) || 0);
  });
  nationOverviewBtn?.addEventListener("click", () => {
    if (!saveCurrentUnit()) return;
    toggleMode("nation-overview");
    renderNations();
  });
  nationEditorBtn?.addEventListener("click", () => {
    if (!saveCurrentUnit()) return;
    toggleMode("nation-edit");
    loadNationIntoForm(parseInt(nationSelect.value, 10) || 0);
  });
  weaponEditorBtn?.addEventListener("click", () => {
    if (!saveCurrentUnit()) return;
    toggleMode("weapon-edit");
    loadWeaponIntoForm(parseInt(weaponSelect.value, 10) || 0);
  });
  ammoEditorBtn?.addEventListener("click", () => {
    if (!saveCurrentUnit()) return;
    toggleMode("ammo-edit");
    loadAmmoIntoForm(parseInt(ammoSelect.value, 10) || 0);
  });
  wireDropZone(unitImageDrop, unitImage, "units");
  wireDropZone(formationImageDrop, formationImage, "formations");
  wireDropZone(nationImageDrop, nationImage, "nations");
  [unitImage, formationImage, nationImage].forEach((input) => {
    if (!input) return;
    input.addEventListener("change", () => {
      const type = input === unitImage ? "units" : input === formationImage ? "formations" : "nations";
      addImageToLibrary(type, input.value);
      rebuildImageLists();
    });
  });
  openUnitImagePicker?.addEventListener("click", () => openImagePickerModal("units", unitImage));
  openFormationImagePicker?.addEventListener("click", () => openImagePickerModal("formations", formationImage));
  openNationImagePicker?.addEventListener("click", () => openImagePickerModal("nations", nationImage));
  imageSearch?.addEventListener("input", renderImagePickerGrid);
  closeImagePickerBtn?.addEventListener("click", closeImagePickerModal);
  imagePicker?.addEventListener("click", (e) => {
    if (e.target === imagePicker) closeImagePickerModal();
  });
  statsBtn.addEventListener("click", () => {
    toggleMode("stats");
    renderStats();
  });
  statsTypeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      statsViewType = btn.dataset.statsType || "unit";
      statsTypeButtons.forEach((b) => b.classList.toggle("active", b === btn));
      if (topUnitsBlock) topUnitsBlock.classList.toggle("hidden-block", statsViewType !== "unit");
      if (topFormationsBlock) topFormationsBlock.classList.toggle("hidden-block", statsViewType !== "formation");
      if (topNationsBlock) topNationsBlock.classList.toggle("hidden-block", statsViewType !== "nation");
      renderStats();
    });
  });
  searchInput.addEventListener("input", renderCards);
  filterCategoryInput?.addEventListener("input", renderCards);
  filterInternalSelect?.addEventListener("change", renderCards);
  filterTierSelect?.addEventListener("change", renderCards);
  sortUnitsSelect?.addEventListener("change", renderCards);
  if (categorySearch) categorySearch.addEventListener("input", applyCategoryFilter);
  unitInternalCategory.addEventListener("change", () =>
    populateSubcategories(unitInternalCategory.value, unitSubCategory.value)
  );
  addCategoryTagBtn?.addEventListener("click", () => processTagInput(tagCategoryName, tagCategoryColor, weaponTags.categories));
  addCaliberTagBtn?.addEventListener("click", () => processTagInput(tagCaliberName, tagCaliberColor, weaponTags.calibers));

  saveAmmoButton?.addEventListener("click", saveAmmoTemplate);
  addAmmoButton?.addEventListener("click", addAmmoTemplate);
  duplicateAmmoButton?.addEventListener("click", duplicateAmmoTemplate);
  deleteAmmoButton?.addEventListener("click", deleteAmmoTemplate);
  ammoSelect?.addEventListener("change", () => loadAmmoIntoForm(ammoSelect.value));

  duplicateWeaponButton?.addEventListener("click", duplicateWeaponTemplate);

  // Live Preview Listeners
  [weaponName, weaponRange, weaponCategory, weaponMuzzle, weaponDispersion, weaponBarrel, weaponReload, weaponFireModes].forEach(input => {
    input?.addEventListener("input", renderWeaponPreview);
  });

  [ammoNameInput, ammoCaliberInput, ammoPenetrationInput, ammoHEInput, ammoDispersionInput, ammoRangeInput].forEach(input => {
    input?.addEventListener("input", renderAmmoPreview);
  });

  // Initial calls
  refreshAmmoCaliberList();

  unitBrowser.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-target]");
    if (button) highlightCard(button.dataset.target);
  });
  saveWeaponButton?.addEventListener("click", saveWeaponTemplate);
  addWeaponButton?.addEventListener("click", addWeaponTemplate);
  deleteWeaponButton?.addEventListener("click", deleteWeaponTemplate);
  weaponSelect?.addEventListener("change", () => loadWeaponIntoForm(weaponSelect.value));

  const refreshAmmoCaliberList = () => {
    if (!ammoCaliberList) return;
    ammoCaliberList.innerHTML = "";
    const calibers = new Set(Object.keys(ammoLibrary));
    calibers.forEach((cal) => {
      const opt = document.createElement("option");
      opt.value = cal;
      ammoCaliberList.appendChild(opt);
    });
  };

  function saveWeaponTemplate() {
    const name = weaponName.value.trim();
    if (!name) {
      showMessage("Weapon name is required.", "error");
      return;
    }
    const range = parseFloat(weaponRange.value);
    if (isNaN(range) || range <= 0) {
      showMessage("Range must be a positive number.", "error");
      return;
    }

    const entry = {
      name,
      caliber: weaponCaliber.value.trim(),
      range,
      category: weaponCategory.value.trim(),
      muzzleVelocity: parseFloat(weaponMuzzle.value) || 0,
      dispersion: parseFloat(weaponDispersion.value) || 0,
      barrelLength: parseFloat(weaponBarrel.value) || 0,
      reloadSpeed: parseFloat(weaponReload.value) || 0,
      fireModes: weaponFireModes.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((n) => ({ name: n })),
    };
    weaponTemplates[name] = entry;
    refreshWeaponSelect(name);
    rebuildWeaponLibrary(parseData(false));
    saveToStorage();
    showMessage("Weapon saved.", "success");
  }

  function deleteWeaponTemplate() {
    const name = weaponSelect.value;
    if (!name || !weaponTemplates[name]) return;
    if (!confirm(`Are you sure you want to delete weapon "${name}"?`)) return;
    delete weaponTemplates[name];
    refreshWeaponSelect();
    rebuildWeaponLibrary(parseData(false));
    saveToStorage();
    showMessage("Weapon deleted.", "success");
  }

  function duplicateWeaponTemplate() {
    const name = weaponSelect.value;
    if (!name || !weaponTemplates[name]) return;
    const original = weaponTemplates[name];
    const newName = `${original.name} (Copy)`;
    weaponName.value = newName;
    weaponCaliber.value = original.caliber || "";
    weaponRange.value = original.range || "";
    weaponCategory.value = original.category || "";
    weaponMuzzle.value = original.muzzleVelocity || "";
    weaponDispersion.value = original.dispersion || "";
    weaponBarrel.value = original.barrelLength || "";
    weaponReload.value = original.reloadSpeed || "";
    weaponFireModes.value = (original.fireModes || []).map((f) => f.name).join(", ");
    showMessage("Weapon duplicated. Adjust name and save.", "success");
  }

  function renderWeaponPreview() {
    if (!weaponPreview) return;
    weaponPreview.innerHTML = "";
    const dummyUnit = {
      guns: [{
        name: weaponName.value || "Weapon Name",
        count: 1,
        ammoPerSoldier: 100,
        totalAmmo: 100,
        range: parseFloat(weaponRange.value) || 0,
        category: weaponCategory.value || "Category",
        muzzleVelocity: parseFloat(weaponMuzzle.value) || 0,
        dispersion: parseFloat(weaponDispersion.value) || 0,
        barrelLength: parseFloat(weaponBarrel.value) || 0,
        reloadSpeed: parseFloat(weaponReload.value) || 0,
        fireModes: weaponFireModes.value.split(",").map(s => ({ name: s.trim() })).filter(f => f.name),
        trajectories: []
      }]
    };
    // Reuse buildCard logic partially or create a simplified view
    const row = document.createElement("div");
    row.className = "gun-row";
    const title = document.createElement("div");
    title.className = "gun-title";
    title.innerHTML = `<strong>1x ${dummyUnit.guns[0].name}</strong> <span class="muted">(${dummyUnit.guns[0].category})</span>`;

    const meta = document.createElement("div");
    meta.className = "gun-meta-wrap";
    [
      ["Range", formatWithUnit(dummyUnit.guns[0].range, "m")],
      ["Muzzle", formatWithUnit(dummyUnit.guns[0].muzzleVelocity, "m/s")],
      ["Dispersion", formatWithUnit(dummyUnit.guns[0].dispersion, "cm")],
      ["Reload", formatWithUnit(dummyUnit.guns[0].reloadSpeed, "s")]
    ].forEach(([l, v]) => {
      const d = document.createElement("div");
      d.className = "gun-meta";
      d.innerHTML = `<span class="label">${l}</span> ${v}`;
      meta.appendChild(d);
    });
    row.append(title, meta);
    weaponPreview.appendChild(row);
  }

  function saveAmmoTemplate() {
    const name = ammoNameInput.value.trim();
    const cal = ammoCaliberInput.value.trim();
    if (!cal) { // Removed strict regex for flexibility, but kept required check
      showMessage("Ammo caliber is required.", "error");
      return;
    }
    if (!name) {
      showMessage("Ammo name is required.", "error");
      return;
    }
    ammoLibrary[cal] = ammoLibrary[cal] || [];
    const existing = ammoLibrary[cal].find((a) => a.name === name);
    const entry = {
      name,
      caliber: cal,
      caliberDesc: ammoCaliberDescInput.value || "",
      penetration: parseFloat(ammoPenetrationInput.value) || 0,
      heDeadliness: parseFloat(ammoHEInput.value) || 0,
      dispersion: parseFloat(ammoDispersionInput.value) || 0,
      rangeMod: parseFloat(ammoRangeInput.value) || 0,
      grain: parseFloat(ammoGrainInput?.value) || 0,
      notes: ammoNotesInput.value || "",
    };
    if (existing) {
      Object.assign(existing, entry);
    } else {
      ammoLibrary[cal].push(entry);
    }
    refreshAmmoSelect(`${cal}::${name}`);
    refreshAmmoCaliberList(); // Update datalist
    rebuildWeaponLibrary(parseData(false));
    saveToStorage();
    showMessage("Ammo saved.", "success");
  }

  function deleteAmmoTemplate() {
    const key = ammoSelect.value;
    if (!key) return;
    const [cal, name] = key.split("::");
    if (!ammoLibrary[cal]) return;
    if (!confirm(`Are you sure you want to delete ammo "${name}" (${cal})?`)) return;

    const idx = ammoLibrary[cal].findIndex((a) => a.name === name || (a.name === undefined && name === `Ammo ${idx + 1}`));
    if (idx !== -1) {
      ammoLibrary[cal].splice(idx, 1);
      if (ammoLibrary[cal].length === 0) delete ammoLibrary[cal];
      refreshAmmoSelect();
      refreshAmmoCaliberList();
      rebuildWeaponLibrary(parseData(false));
      saveToStorage();
      showMessage("Ammo deleted.", "success");
    }
  }

  function duplicateAmmoTemplate() {
    const key = ammoSelect.value;
    if (!key) return;
    const [cal, name] = key.split("::");
    const original = (ammoLibrary[cal] || []).find(a => a.name === name);
    if (!original) return;

    ammoNameInput.value = `${original.name} (Copy)`;
    ammoCaliberInput.value = original.caliber || "";
    ammoCaliberDescInput.value = original.caliberDesc || "";
    ammoPenetrationInput.value = original.penetration || "";
    ammoHEInput.value = original.heDeadliness || "";
    ammoDispersionInput.value = original.dispersion || "";
    ammoRangeInput.value = original.rangeMod || "";
    if (ammoGrainInput) ammoGrainInput.value = original.grain || "";
    ammoNotesInput.value = original.notes || "";
    showMessage("Ammo duplicated. Adjust name and save.", "success");
  }

  function renderAmmoPreview() {
    if (!ammoPreview) return;
    ammoPreview.innerHTML = "";
    // Simple preview
    const row = document.createElement("div");
    row.className = "gun-row"; // Reuse style
    const title = document.createElement("div");
    title.className = "gun-title";
    title.innerHTML = `<strong>${ammoNameInput.value || "Ammo Name"}</strong> <span class="muted">(${ammoCaliberInput.value || "Caliber"})</span>`;

    const meta = document.createElement("div");
    meta.className = "gun-meta-wrap";
    [
      ["Pen", `${ammoPenetrationInput.value || 0} mm`],
      ["HE", ammoHEInput.value || 0],
      ["Disp", `${ammoDispersionInput.value || 0}%`],
      ["Range Mod", `${ammoRangeInput.value || 0}m`]
    ].forEach(([l, v]) => {
      const d = document.createElement("div");
      d.className = "gun-meta";
      d.innerHTML = `<span class="label">${l}</span> ${v}`;
      meta.appendChild(d);
    });
    row.append(title, meta);
    ammoPreview.appendChild(row);
  }

  function exportLibrary(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importLibrary(fileInput, mergeCallback) {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        mergeCallback(data);
        showMessage("Library imported successfully.", "success");
        saveToStorage();
      } catch (err) {
        console.error(err);
        showMessage("Failed to import library.", "error");
      }
      fileInput.value = ""; // Reset
    };
    reader.readAsText(file);
  }

  exportWeaponLibBtn?.addEventListener("click", () => exportLibrary(weaponTemplates, "weapon_library.json"));
  importWeaponLibBtn?.addEventListener("click", () => importWeaponFile.click());
  importWeaponFile?.addEventListener("change", () => importLibrary(importWeaponFile, (data) => {
    Object.assign(weaponTemplates, data);
    refreshWeaponSelect();
    rebuildWeaponLibrary(parseData(false));
  }));

  exportAmmoLibBtn?.addEventListener("click", () => exportLibrary(ammoLibrary, "ammo_library.json"));
  importAmmoLibBtn?.addEventListener("click", () => importAmmoFile.click());
  importAmmoFile?.addEventListener("change", () => importLibrary(importAmmoFile, (data) => {
    // Deep merge for ammo library (key = caliber)
    Object.keys(data).forEach(cal => {
      if (ammoLibrary[cal]) {
        ammoLibrary[cal] = [...ammoLibrary[cal], ...data[cal]];
      } else {
        ammoLibrary[cal] = data[cal];
      }
    });
    refreshAmmoSelect();
    refreshAmmoCaliberList();
    rebuildWeaponLibrary(parseData(false));
  }));

  weaponSearch?.addEventListener("input", () => refreshWeaponSelect());
  ammoSearch?.addEventListener("input", () => refreshAmmoSelect());

  // Final safety: if units are still empty, seed samples so editors/views show content.
  setTimeout(() => {
    let parsed = parseData(false);
    if (!parsed || !Array.isArray(parsed.units) || parsed.units.length === 0) {
      loadSample();
      parsed = parseData(false);
      const safeData = parsed && Array.isArray(parsed.units) && parsed.units.length ? parsed : sampleData;
      refreshUnitSelect(safeData, 0);
      loadUnitIntoForm(0);
      renderCards();
    }
  }, 1600);
  // If still empty after local DB attempt, force sample and refresh UI.
  setTimeout(() => {
    const parsed = parseData(false);
    if (!parsed || !Array.isArray(parsed.units) || parsed.units.length === 0) {
      loadSample();
      refreshUnitSelect(sampleData, 0);
      loadUnitIntoForm(0);
      renderCards();
      renderFormations();
      renderNations();
    }
  }, 2400);
  // start periodic autosave (10s)
  autoSaveInterval = setInterval(autoPersist, 10000);
  // Try loading from local database files if nothing else populated units.
  setTimeout(() => {
    const parsed = parseData(false);
    if (!parsed || !Array.isArray(parsed.units) || !parsed.units.length) {
      tryLoadLocalDatabase();
    }
  }, 1800);
  safeRenderTagLists();
  // Ensure image picker is hidden on boot.
  closeImagePickerModal();
  // Apply saved theme
  try {
    const savedTheme = localStorage.getItem("rtsTheme");
    applyTheme(savedTheme || "default");
  } catch { }
  toggleMode("view");
  downloadLogsBtn?.addEventListener("click", () => {
    try {
      window.downloadLogs?.();
    } catch (e) {
      console.warn("Download logs failed", e);
    }
  });
  function toNumber(val) {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const m = val.match(/-?\d+(\.\d+)?/);
      return m ? parseFloat(m[0]) : 0;
    }
    return 0;
  }

  function armorScore(armor) {
    const text = typeof armor === "string" ? armor.toLowerCase() : "";
    if (!text && typeof armor !== "number") return 5;
    if (text.includes("era") || text.includes("composite") || text.includes("heavy")) return 40;
    if (text.includes("kevlar") || text.includes("lvl") || text.includes("iii")) return 25;
    if (text.includes("light")) return 15;
    return Math.max(5, Math.min(35, toNumber(armor) * 2));
  }

  function clampScore(num) {
    return Math.max(0, Math.min(100, Math.round(num)));
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function applyTheme(name) {
    const t = themes[name] || themes.default;
    Object.entries({
      "--bg": t.bg,
      "--panel": t.panel,
      "--panel-strong": t.panelStrong,
      "--stroke": t.stroke,
      "--text": t.text,
      "--muted": t.muted,
      "--accent": t.accent,
    }).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    if (themeSelect) themeSelect.value = name;
    document.body.style.background = t.bg;
    document.body.style.backgroundImage = "none";
    try {
      localStorage.setItem("rtsTheme", name);
    } catch { }
  }

  function rebuildImageLibraryFromData(data) {
    Object.keys(imageLibrary).forEach((k) => (imageLibrary[k] = []));
    if (data && Array.isArray(data.units)) {
      data.units.forEach((u) => addImageToLibrary("units", u.image));
    }
    if (data && Array.isArray(data.formations)) {
      data.formations.forEach((f) => addImageToLibrary("formations", f.image));
    }
    if (data && Array.isArray(data.nations)) {
      data.nations.forEach((n) => addImageToLibrary("nations", n.image));
    }
    rebuildImageLists();
  }

  function addImageToLibrary(type, url) {
    if (!url) return;
    const list = imageLibrary[type];
    if (!Array.isArray(list)) return;
    if (!list.includes(url)) list.push(url);
  }

  function rebuildImageLists() {
    const unitList = document.getElementById("unitImageList");
    const formList = document.getElementById("formationImageList");
    const nationList = document.getElementById("nationImageList");
    if (unitList) {
      unitList.innerHTML = "";
      (imageLibrary.units || []).forEach((url) => {
        const opt = document.createElement("option");
        opt.value = url;
        unitList.appendChild(opt);
      });
    }
    if (formList) {
      formList.innerHTML = "";
      (imageLibrary.formations || []).forEach((url) => {
        const opt = document.createElement("option");
        opt.value = url;
        formList.appendChild(opt);
      });
    }
    if (nationList) {
      nationList.innerHTML = "";
      (imageLibrary.nations || []).forEach((url) => {
        const opt = document.createElement("option");
        opt.value = url;
        nationList.appendChild(opt);
      });
    }
  }

  function wireDropZone(zone, input, type) {
    if (!zone || !input) return;
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
      zone.addEventListener(evt, prevent);
    });
    zone.addEventListener("dragover", () => zone.classList.add("dragover"));
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (e) => {
      zone.classList.remove("dragover");
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        input.value = ev.target?.result || "";
        addImageToLibrary(type, input.value);
        rebuildImageLists();
      };
      reader.readAsDataURL(file);
    });
    zone.addEventListener("click", () => {
      input.focus();
    });
  }

  function openImagePickerModal(type, input) {
    if (!imagePicker || !imageGrid) return;
    imagePickerTarget = { input, type };
    imageSearch.value = "";
    renderImagePickerGrid();
    imagePicker.classList.remove("hidden-section");
  }

  function renderImagePickerGrid() {
    if (!imageGrid) return;
    const type = imagePickerTarget.type || "units";
    const term = (imageSearch?.value || "").toLowerCase().trim();
    const list = (imageLibrary[type] || []).filter((url) => url && url.toLowerCase().includes(term));
    imageGrid.innerHTML = "";
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "No images found for this type.";
      imageGrid.appendChild(empty);
      return;
    }
    list.forEach((url) => {
      const tile = document.createElement("div");
      tile.className = "image-tile";
      const img = document.createElement("img");
      img.src = url;
      img.alt = "library image";
      const urlLabel = document.createElement("div");
      urlLabel.className = "image-url";
      urlLabel.textContent = url;
      tile.appendChild(img);
      tile.appendChild(urlLabel);
      tile.addEventListener("click", () => {
        if (imagePickerTarget.input) {
          imagePickerTarget.input.value = url;
          addImageToLibrary(type, url);
          rebuildImageLists();
        }
        closeImagePickerModal();
      });
      imageGrid.appendChild(tile);
    });
  }

  function closeImagePickerModal() {
    if (imagePicker) imagePicker.classList.add("hidden-section");
  }

  // Reattach settings panel to body to avoid stacking/overflow issues.
  if (settingsPanel && settingsPanel.parentElement !== document.body) {
    document.body.appendChild(settingsPanel);
  }

  function showSettingsPanel() {
    if (!settingsPanel || !settingsBtn) return;
    settingsPanel.classList.remove("hidden-section");
    const rect = settingsBtn.getBoundingClientRect();
    const panelRect = settingsPanel.getBoundingClientRect();
    const left = Math.max(10, Math.min(rect.left, window.innerWidth - panelRect.width - 10)) + window.scrollX;
    const top = rect.bottom + 8 + window.scrollY;
    settingsPanel.style.left = `${left}px`;
    settingsPanel.style.top = `${top}px`;
  }

  function getAmmoDatalist(caliber) {
    try {
      if (!caliber) return null;
      if (!ammoDatalistContainer) {
        const div = document.createElement("div");
        div.id = "ammo-datalists";
        document.body.appendChild(div);
      }
      const safeCal = `${caliber}`;
      const id = `ammo-dl-${safeCal.replace(/[^a-z0-9]/gi, "")}`;
      let list = document.getElementById(id);
      if (!list) {
        list = document.createElement("datalist");
        list.id = id;
        ammoDatalistContainer.appendChild(list);
      }
      return list;
    } catch (e) {
      return null;
    }
  }

  function formatWithUnit(val, unit) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const num = toNumber(val);
    if (Number.isNaN(num)) return valueOrNA(val);
    return `${num} ${unit}`;
  }

  function formatPercent(val) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const num = toNumber(val);
    if (Number.isNaN(num)) return valueOrNA(val);
    return `${num}%`;
  }

  function formatSpeed(val) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const mps = toNumber(val);
    if (Number.isNaN(mps)) return valueOrNA(val);
    const kph = (mps * 3.6).toFixed(1);
    return `${mps} m/s (${kph} km/h)`;
  }

  function formatPoints(val) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const num = toNumber(val);
    if (Number.isNaN(num)) return valueOrNA(val);
    return `${num} pts`;
  }

  function scoreUnitDetailed(unit) {
    if (!unit) return null;
    const guns = Array.isArray(unit.guns) ? unit.guns : [];
    const caps = unit.capabilities || {};
    const stats = unit.stats || {};
    const gren = unit.grenades || {};

    const ammoListFlat = guns.flatMap((g) => (Array.isArray(g.ammoTypes) ? g.ammoTypes : []));
    const maxAmmoPen = Math.max(0, ...ammoListFlat.map((a) => toNumber(a.penetration) || 0));
    const maxAmmoHE = Math.max(0, ...ammoListFlat.map((a) => toNumber(a.heDeadliness) || 0));
    const avgRangeMod = ammoListFlat.length
      ? ammoListFlat.reduce((sum, a) => sum + (toNumber(a.rangeMod) || 0), 0) / ammoListFlat.length
      : 0;

    const lethality = clampScore(
      guns.reduce(
        (sum, g) =>
          sum +
          toNumber(g.totalAmmo || g.ammoPerSoldier) * 0.4 +
          Math.max(1, toNumber(g.count) || 1) * 4 +
          (toNumber(g.muzzleVelocity) || 0) * 0.05,
        0
      ) +
      toNumber(gren.total) * 2 +
      maxAmmoPen * 0.6 +
      maxAmmoHE * 1.5
    );
    const survivability = clampScore(armorScore(stats.armor) + toNumber(stats.health) * 0.5);
    const sustainability = clampScore(80 - toNumber(stats.weight) * 5 - toNumber(unit.price) * 0.001);
    const mobility = clampScore(toNumber(stats.speed) * 6 + toNumber(caps?.sprint?.speed) * 2);
    const versatility = clampScore(
      guns.length * 6 +
      new Set(guns.map((g) => (g.category || "").toLowerCase())).size * 4 +
      ammoListFlat.length * 2 +
      avgRangeMod * 0.3
    );
    const stealth = clampScore(toNumber(stats.stealth));
    const speed = clampScore(toNumber(stats.speed) * 10);
    const morale = clampScore(50 + toNumber(stats.health) * 0.2 + toNumber(unit.tier) * 4);
    const training = clampScore(toNumber(unit.tier) * 10);
    const antiInfantry = clampScore(
      guns.reduce((sum, g) => sum + (toNumber(g.heDeadliness) || maxAmmoHE ? 10 : 5), 0) + toNumber(gren.frag) * 6
    );
    const antiTank = clampScore(
      maxAmmoPen * 0.5 +
      guns.reduce((sum, g) => sum + (g.category || "").toLowerCase().includes("launcher") ? 15 : 0, 0)
    );
    const antiAir = clampScore(
      guns.reduce((sum, g) => sum + (g.category || "").toLowerCase().includes("aa") ? 20 : 0, 0)
    );

    return {
      metrics: {
        lethality,
        survivability,
        sustainability,
        mobility,
        versatility,
        stealth,
        speed,
        morale,
        training,
        antiInfantry,
        antiTank,
        antiAir,
      },
    };
  }

  function scoreFormationDetailed(formation, units) {
    if (!formation) return null;
    const unitIds = [];
    (formation.categories || []).forEach((cat) => (cat.units || []).forEach((uid) => unitIds.push(uid)));
    if (!unitIds.length) return null;
    const metricsArray = unitIds
      .map((uid) => scoreUnitDetailed(units[uid]))
      .filter(Boolean)
      .map((s) => s.metrics);
    if (!metricsArray.length) return null;
    const avg = (field) => metricsArray.reduce((sum, m) => sum + (m[field] || 0), 0) / metricsArray.length;

    const recon = clampScore(avg("stealth") + avg("speed") * 0.5);
    const support = clampScore(avg("sustainability") + avg("versatility") * 0.5);
    const armor = clampScore(avg("survivability"));
    const infantry = clampScore(
      unitIds.reduce((sum, uid) => {
        const u = units[uid];
        return sum + ((u?.internalCategory || "").toUpperCase() === "INF" ? 8 : 0);
      }, 0)
    );
    const logistics = clampScore(
      unitIds.reduce((sum, uid) => {
        const u = units[uid];
        return sum + ((u?.internalCategory || "").toUpperCase() === "LOG" ? 10 : 0);
      }, 0) + avg("sustainability") * 0.5
    );
    const air = clampScore(
      unitIds.reduce((sum, uid) => {
        const u = units[uid];
        return sum + ((u?.internalCategory || "").toUpperCase() === "AIR" ? 10 : 0);
      }, 0)
    );
    const sustaiment = clampScore(avg("sustainability"));
    const speed = clampScore(avg("speed"));
    const supplyEfficiency = clampScore(90 - avg("mobility") * 0.3 + avg("sustainability") * 0.2);
    const aoSize = clampScore(unitIds.length * 5);
    const versatility = clampScore(avg("versatility"));

    return {
      metrics: {
        recon,
        support,
        armor,
        infantry,
        logistics,
        air,
        sustaiment,
        speed,
        supplyEfficiency,
        aoSize,
        versatility,
      },
    };
  }

  function scoreNationDetailed(nation, formations, units) {
    if (!nation) return null;
    const formationIds = nation.formations || [];
    if (!formationIds.length) return null;
    const metricsArray = formationIds
      .map((fid) => scoreFormationDetailed(formations[fid], units))
      .filter(Boolean)
      .map((s) => s.metrics);
    if (!metricsArray.length) return null;
    const avg = (field) => metricsArray.reduce((sum, m) => sum + (m[field] || 0), 0) / metricsArray.length;

    const strategicMomentum = clampScore(avg("versatility") + avg("speed") * 0.5 + avg("armor") * 0.3);
    const supplyEfficiency = clampScore(avg("supplyEfficiency") + avg("logistics") * 0.5);
    const aoSize = clampScore(metricsArray.length * 10);
    const maneuverSpeed = clampScore(avg("speed"));

    return {
      metrics: {
        strategicMomentum,
        supplyEfficiency,
        aoSize,
        maneuverSpeed,
      },
    };
  }
})();
