const RTS = window.RTS || {};
const dom = RTS.dom || {};
const state = RTS.state || {
  weaponTemplates: {},
  ammoLibrary: {},
  weaponTags: { categories: {}, calibers: {} },
};
const { themes, fallbackImage, subcategoryMap, sampleData } = RTS.constants || {};
const {
  valueOrNA,
  yesNo,
  parseBoolish,
  createPill,
  sectionTitle,
  getTagColor,
  formatWithUnit,
  formatPercent,
  formatSpeed,
  formatPoints,
  toNumber,
  armorScore,
  clampScore,
  deepClone,
  scoreUnitDetailed,
  scoreFormationDetailed,
  scoreNationDetailed,
} = RTS.helpers || {};

const {
  dataInput,
  renderButton,
  loadSampleButton,
  loadSavedButton,
  saveDataButton,
  refreshAppButton,
  loadDataFile,
  settingsBtn,
  settingsPanel,
  themeSelect,
  applyThemeBtn,
  exportPngButton,
  printButton,
  cardsContainer,
  flash,
  unitSelect,
  unitName,
  unitPrice,
  unitCategory,
  unitTier,
  unitDescription,
  unitInternalCategory,
  unitSubCategory,
  unitImage,
  statArmor,
  statHealth,
  statSquad,
  statRange,
  statStealth,
  statSpeed,
  statWeight,
  grenSmoke,
  grenFlash,
  grenThermite,
  grenFrag,
  grenTotal,
  capStatic,
  capHalo,
  capLaser,
  sprintDistance,
  sprintSpeed,
  sprintCooldown,
  gunList,
  addGunButton,
  equipmentList,
  addEquipmentButton,
  weaponLibrary,
  categorySearch,
  saveUnitButton,
  addUnitButton,
  deleteUnitButton,
  downloadLogsBtn,
  viewModeBtn,
  editModeBtn,
  formationOverviewBtn,
  formationEditorBtn,
  nationOverviewBtn,
  nationEditorBtn,
  viewSection,
  editSection,
  viewControlsSection,
  formationEditorSection,
  formationOverviewSection,
  nationEditorSection,
  nationOverviewSection,
  weaponEditorSection,
  ammoEditorSection,
  nationOverviewSelect,
  searchInput,
  filterCategoryInput,
  filterInternalSelect,
  filterTierSelect,
  sortUnitsSelect,
  unitBrowser,
  formationSelect,
  formationName,
  formationDescription,
  formationImage,
  weaponEditorBtn,
  ammoEditorBtn,
  topUnitsList,
  topFormationsList,
  topNationsList,
  topUnitsBlock,
  topFormationsBlock,
  topNationsBlock,
  statsBtn,
  statsSection,
  statsTypeButtons,
  addFormationButton,
  saveFormationButton,
  deleteFormationButton,
  nationSelect,
  nationName,
  nationDescription,
  nationImage,
  nationFormationsList,
  addNationButton,
  saveNationButton,
  deleteNationButton,
  exportNationButton,
  importNationButton,
  importNationFile,
  categoryList,
  addCategoryButton,
  weaponSelect,
  weaponSearch,
  exportWeaponLibBtn,
  importWeaponLibBtn,
  importWeaponFile,
  weaponName,
  weaponCaliber,
  weaponRange,
  weaponCategory,
  weaponMuzzle,
  weaponDispersion,
  weaponBarrel,
  weaponReload,
  weaponFireModes,
  saveWeaponButton,
  addWeaponButton,
  duplicateWeaponButton,
  deleteWeaponButton,
  weaponPreview,
  ammoSelect,
  ammoSearch,
  exportAmmoLibBtn,
  importAmmoLibBtn,
  importAmmoFile,
  ammoNameInput,
  ammoCaliberInput,
  ammoCaliberDescInput,
  ammoPenetrationInput,
  ammoHEInput,
  ammoDispersionInput,
  ammoRangeInput,
  ammoGrainInput,
  ammoNotesInput,
  saveAmmoButton,
  addAmmoButton,
  duplicateAmmoButton,
  deleteAmmoButton,
  ammoPreview,
  ammoCaliberList,
  unitImageDrop,
  formationImageDrop,
  nationImageDrop,
  openUnitImagePicker,
  openFormationImagePicker,
  openNationImagePicker,
  imagePicker,
  imageGrid,
  imageSearch,
  closeImagePickerBtn,
  tagCategoryName,
  tagCategoryColor,
  tagCaliberName,
  tagCaliberColor,
  addCategoryTagBtn,
  addCaliberTagBtn,
  categoryTagList,
  caliberTagList,
} = dom;
const { weaponTemplates, ammoLibrary, weaponTags } = state;

const weaponModule = RTS.weaponEditor;
const rebuildWeaponLibrary = (data) => weaponModule?.rebuildFromData?.(data);
const safeRenderTagLists = () => weaponModule?.safeRenderTagLists?.();
const refreshWeaponSelect = (selected) => weaponModule?.refreshWeaponSelect?.(selected);
const refreshAmmoSelect = (selected) => weaponModule?.refreshAmmoSelect?.(selected);
const loadWeaponIntoForm = (index) => weaponModule?.loadWeaponIntoForm?.(index);
const loadAmmoIntoForm = (key) => weaponModule?.loadAmmoIntoForm?.(key);

(function initApp() {
  const ammoDatalistContainer = document.createElement("div");
  ammoDatalistContainer.id = "ammo-datalists";
  document.body.appendChild(ammoDatalistContainer);

  let currentMode = "view";
  let statsChart;
  let selectedRadar = { unit: null, formation: null, nation: null };
  let statsViewType = "unit";
  const imageLibrary = { units: [], formations: [], nations: [] };
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
  const dirtyState = { unit: false, nation: false };
  const autoSaveTimers = { unit: null, nation: null };
  function updateDirtyIndicator() {
    if (!document || !document.body) return;
    const anyDirty = dirtyState.unit || dirtyState.nation;
    if (anyDirty) {
      document.body.dataset.dirty = "true";
    } else {
      delete document.body.dataset.dirty;
    }
  }

  function markDirty(scope = "unit") {
    if (!dirtyState[scope]) {
      dirtyState[scope] = true;
      updateDirtyIndicator();
    }
  }
  function resetDirty(scope = "unit") {
    if (dirtyState[scope]) {
      dirtyState[scope] = false;
      updateDirtyIndicator();
    }
  }

  function autoSaveUnit() {
    markDirty("unit");
    clearTimeout(autoSaveTimers.unit);
    autoSaveTimers.unit = setTimeout(() => {
      const parsed = ensureDataObject();
      if (!parsed.units.length) parsed.units.push(emptyUnit());
      let idx = parseInt(unitSelect?.value ?? "0", 10);
      if (Number.isNaN(idx) || idx < 0 || idx >= parsed.units.length) idx = 0;
      parsed.units[idx] = buildUnitFromForm();
      dataInput.value = JSON.stringify(parsed, null, 2);
      resetDirty("unit");
      debouncedHostSave();
      logEvent("autoSaveUnit", { idx });
    }, 900);
  }

  function autoSaveNation() {
    markDirty("nation");
    clearTimeout(autoSaveTimers.nation);
    autoSaveTimers.nation = setTimeout(() => {
      const parsed = ensureDataObject();
      if (!parsed.nations.length) return;
      let idx = parseInt(nationSelect?.value ?? "0", 10);
      if (Number.isNaN(idx) || idx < 0 || idx >= parsed.nations.length) idx = 0;
      parsed.nations[idx] = buildNationFromForm();
      dataInput.value = JSON.stringify(parsed, null, 2);
      refreshNationSelect(parsed, idx);
      refreshNationOverviewSelect(parsed, idx);
      renderNations();
      resetDirty("nation");
      debouncedHostSave();
      logEvent("autoSaveNation", { idx });
    }, 900);
  }

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

  function ensureDataObject(seed) {
    let parsed = seed;
    if (!parsed) parsed = parseData(false);
    if (!parsed || typeof parsed !== "object") parsed = {};
    if (!Array.isArray(parsed.units)) parsed.units = [];
    if (!Array.isArray(parsed.formations)) parsed.formations = [];
    if (!Array.isArray(parsed.nations)) parsed.nations = [];
    return parsed;
  }

  function showMessage(text, type = "success") {
    flash.textContent = text;
    flash.className = `alert ${type}`;
  }

  function clearMessage() {
    flash.textContent = "";
    flash.className = "alert hidden";
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
    const catColor = getTagColor("category", gun.category, weaponTags);
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
        const color = getTagColor("caliber", value, weaponTags);
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
        const color = getTagColor("category", value, weaponTags);
          if (color) display = `<span class="color-badge"><span class="color-dot" style="background:${color}"></span>${value}</span>`;
        }
        if (label === "Caliber") {
        const color = getTagColor("caliber", value, weaponTags);
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

  function processTagInput(nameInput, colorInput, targetMap) {
    if (!nameInput || !colorInput || !targetMap) return;
    const label = (nameInput.value || "").trim();
    if (!label) {
      showMessage("Enter a name before saving the tag.", "error");
      return;
    }
    const color = (colorInput.value || "").trim();
    if (!color) {
      if (targetMap[label]) {
        delete targetMap[label];
        safeRenderTagLists();
        showMessage(`Removed tag "${label}".`, "success");
        debouncedHostSave();
      } else {
        showMessage("Pick a color for the tag.", "error");
      }
      return;
    }
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
      showMessage("Provide a valid hex color (e.g., #ff8800).", "error");
      return;
    }
    targetMap[label] = color;
    safeRenderTagLists();
    showMessage(`Saved tag "${label}".`, "success");
    debouncedHostSave();
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

  function createDirtyPrompt() { }

  function getGunListElement() {
    return gunList || document.getElementById("gunList");
  }

  function getAmmoDatalist(caliber) {
    try {
      if (!caliber) return null;
      const safeCal = `${caliber}`;
      const id = `ammo-dl-${safeCal.replace(/[^a-z0-9]/gi, "")}`;
      let list = document.getElementById(id);
      if (!list) {
        list = document.createElement("datalist");
        list.id = id;
        document.body.appendChild(list);
      }
      return list;
    } catch {
      return null;
    }
  }

  function addGunEditRow(gun = {}) {
    const list = getGunListElement();
    if (!list) {
      console.error("gunList element not found!");
      showMessage("Error: gunList element missing.", "error");
      return;
    }
    if (list.children.length >= 10) {
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
    collapseBtn.addEventListener("click", () => {
      const hidden = body.classList.toggle("hidden-section");
      collapseBtn.textContent = hidden ? "Expand weapon" : "Collapse weapon";
    });

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

    list.appendChild(row);
    autoSaveUnit();
  }

  function collectGunRows() {
    const list = getGunListElement();
    if (!list) return [];
    return Array.from(list.querySelectorAll(".gun-edit-row")).map((row) => {
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

    const list = getGunListElement();
    if (list) {
      list.innerHTML = "";
      const guns = Array.isArray(unit.guns) ? unit.guns.slice(0, 10) : [];
      guns.forEach((gun) => addGunEditRow(gun));
      if (typeof logEvent === "function") logEvent("gunsLoaded", { count: guns.length, unit: unit.name || index });
    }

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
    resetDirty("unit");
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
    resetDirty("nation");
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
    resetDirty("nation");
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
    resetDirty("unit");
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

  function getActiveData() {
    const parsed = parseData(false);
    if (parsed && Array.isArray(parsed.units) && parsed.units.length) return parsed;
    return ensureDataObject(parsed);
  }

  function getFilteredUnits(parsed, limit = 50) {
    const term = (searchInput?.value || "").toLowerCase().trim();
    const catTerm = (filterCategoryInput?.value || "").toLowerCase().trim();
    const internalFilter = (filterInternalSelect?.value || "").toUpperCase();
    const tierFilter = (filterTierSelect?.value || "").trim();
    const sorter = sortUnitsSelect?.value || "name-asc";

    return parsed.units
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
      .slice(0, limit);
  }

  function renderCards({ rebuild = true } = {}) {
    clearMessage();
    const parsed = getActiveData();
    if (!parsed.units.length) {
      cardsContainer.innerHTML = "";
      renderUnitBrowser([]);
      showMessage("No units found in data.", "error");
      return;
    }
    if (rebuild) {
      rebuildWeaponLibrary(parsed);
      const currentIndex = Math.max(0, Math.min(parseInt(unitSelect.value, 10) || 0, parsed.units.length - 1));
      refreshUnitSelect(parsed, currentIndex);
      loadUnitIntoForm(currentIndex);
      refreshFormationSelect(parsed, 0);
      refreshNationSelect(parsed, 0);
      refreshNationOverviewSelect(parsed, 0);
    }

    const unitsLimited = getFilteredUnits(parsed);
    cardsContainer.innerHTML = "";

    if (!unitsLimited.length) {
      renderUnitBrowser([]);
      showMessage("No units match the filters.", "error");
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
    showMessage(`Rendered ${unitsLimited.length} unit statcard(s).`, "success");

    // Keep formation/nation summaries in sync with unit changes when requested.
    if (rebuild) {
      renderFormations();
      renderNations();
    }
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
  (addGunButton || document.getElementById("addGun"))?.addEventListener("click", () => addGunEditRow());
  addEquipmentButton.addEventListener("click", () => addEquipmentRow());
  saveUnitButton.addEventListener("click", () => {
    saveCurrentUnit();
  });
  addUnitButton.addEventListener("click", () => {
    addNewUnit();
    debouncedHostSave();
  });
  deleteUnitButton.addEventListener("click", () => {
    deleteCurrentUnit();
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
    const target = weaponSelect?.value ?? 0;
    RTS.weaponEditor?.loadWeaponIntoForm?.(target);
  });
  ammoEditorBtn?.addEventListener("click", () => {
    if (!saveCurrentUnit()) return;
    toggleMode("ammo-edit");
    const target = ammoSelect?.value ?? 0;
    RTS.weaponEditor?.loadAmmoIntoForm?.(target);
  });
  document.addEventListener("click", (event) => {
    const addGunAction = event.target.closest("#addGun");
    if (addGunAction) {
      event.preventDefault();
      addGunEditRow();
    }
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

  ammoSelect?.addEventListener("change", () => loadAmmoIntoForm(ammoSelect.value));


  addFormationButton?.addEventListener("click", () => {
    addNewFormation();
    debouncedHostSave();
  });
  saveFormationButton?.addEventListener("click", () => {
    saveCurrentFormation();
  });
  deleteFormationButton?.addEventListener("click", () => {
    deleteFormation();
    debouncedHostSave();
  });
  formationSelect?.addEventListener("change", () =>
    loadFormationIntoForm(parseInt(formationSelect.value, 10) || 0)
  );
  addCategoryButton?.addEventListener("click", () => {
    if (!categoryList) return;
    const parsed = parseData(false) || {};
    const units = Array.isArray(parsed.units) ? parsed.units : [];
    categoryList.appendChild(buildCategoryRow({}, units));
    applyCategoryFilter();
  });

  addNationButton?.addEventListener("click", () => {
    addNewNation();
    debouncedHostSave();
  });
  saveNationButton?.addEventListener("click", () => {
    saveCurrentNation();
  });
  deleteNationButton?.addEventListener("click", () => {
    deleteNation();
    debouncedHostSave();
  });
  nationSelect?.addEventListener("change", () =>
    loadNationIntoForm(parseInt(nationSelect.value, 10) || 0)
  );
  exportNationButton?.addEventListener("click", exportSelectedNation);
  importNationButton?.addEventListener("click", () => importNationFile?.click());
  settingsBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (settingsPanel?.classList.contains("hidden-section")) {
      showSettingsPanel();
    } else {
      settingsPanel?.classList.add("hidden-section");
    }
  });
  document.addEventListener("click", (event) => {
    if (!settingsPanel || settingsPanel.classList.contains("hidden-section")) return;
    if (!settingsPanel.contains(event.target) && event.target !== settingsBtn) {
      settingsPanel.classList.add("hidden-section");
    }
  });
  applyThemeBtn?.addEventListener("click", () => applyTheme(themeSelect?.value || "default"));
  themeSelect?.addEventListener("change", () => applyTheme(themeSelect?.value || "default"));
  exportPngButton?.addEventListener("click", exportCardsAsPng);
  saveDataButton?.addEventListener("click", saveToStorage);
  loadSavedButton?.addEventListener("click", () => loadDataFile?.click());
  loadDataFile?.addEventListener("change", handleDataFile);
  refreshAppButton?.addEventListener("click", () => window.location.reload());
  printButton?.addEventListener("click", () => window.print());

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

  RTS.weaponEditor?.init({
    showMessage,
    parseData,
    debouncedHostSave,
    saveToStorage,
  });
})();

