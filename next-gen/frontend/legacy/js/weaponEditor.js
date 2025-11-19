(() => {
  const RTS = (window.RTS = window.RTS || {});
  const state =
    RTS.state ||
    (RTS.state = {
      weaponTemplates: {},
      ammoLibrary: {},
      weaponTags: { categories: {}, calibers: {} },
    });
  const helpers = RTS.helpers || {};
  const { deepClone, formatWithUnit, valueOrNA, toNumber } = helpers;

  const weaponTemplates = state.weaponTemplates;
  const ammoLibrary = state.ammoLibrary;
  const weaponTags = state.weaponTags;

  const elements = {};
  let api = {};
  let eventsWired = false;

  function cacheDom() {
    const dom = RTS.dom || {};
    Object.assign(elements, {
      weaponLibrary: dom.weaponLibrary,
      weaponSelect: dom.weaponSelect,
      weaponSearch: dom.weaponSearch,
      weaponName: dom.weaponName,
      weaponCaliber: dom.weaponCaliber,
      weaponRange: dom.weaponRange,
      weaponCategory: dom.weaponCategory,
      weaponMuzzle: dom.weaponMuzzle,
      weaponDispersion: dom.weaponDispersion,
      weaponBarrel: dom.weaponBarrel,
      weaponReload: dom.weaponReload,
      weaponFireModes: dom.weaponFireModes,
      saveWeaponButton: dom.saveWeaponButton,
      addWeaponButton: dom.addWeaponButton,
      duplicateWeaponButton: dom.duplicateWeaponButton,
      deleteWeaponButton: dom.deleteWeaponButton,
      weaponPreview: dom.weaponPreview,
      ammoSelect: dom.ammoSelect,
      ammoSearch: dom.ammoSearch,
      exportWeaponLibBtn: dom.exportWeaponLibBtn,
      importWeaponLibBtn: dom.importWeaponLibBtn,
      importWeaponFile: dom.importWeaponFile,
      exportAmmoLibBtn: dom.exportAmmoLibBtn,
      importAmmoLibBtn: dom.importAmmoLibBtn,
      importAmmoFile: dom.importAmmoFile,
      ammoNameInput: dom.ammoNameInput,
      ammoCaliberInput: dom.ammoCaliberInput,
      ammoCaliberDescInput: dom.ammoCaliberDescInput,
      ammoPenetrationInput: dom.ammoPenetrationInput,
      ammoHEInput: dom.ammoHEInput,
      ammoDispersionInput: dom.ammoDispersionInput,
      ammoRangeInput: dom.ammoRangeInput,
      ammoGrainInput: dom.ammoGrainInput,
      ammoNotesInput: dom.ammoNotesInput,
      saveAmmoButton: dom.saveAmmoButton,
      addAmmoButton: dom.addAmmoButton,
      duplicateAmmoButton: dom.duplicateAmmoButton,
      deleteAmmoButton: dom.deleteAmmoButton,
      ammoPreview: dom.ammoPreview,
      ammoCaliberList: dom.ammoCaliberList,
      addCategoryTagBtn: dom.addCategoryTagBtn,
      addCaliberTagBtn: dom.addCaliberTagBtn,
      tagCategoryName: dom.tagCategoryName,
      tagCategoryColor: dom.tagCategoryColor,
      tagCaliberName: dom.tagCaliberName,
      tagCaliberColor: dom.tagCaliberColor,
      categoryTagList: dom.categoryTagList,
      caliberTagList: dom.caliberTagList,
    });
  }

  function init(appApi = {}) {
    api = appApi;
    cacheDom();
    if (!eventsWired) {
      wireEvents();
      eventsWired = true;
    }
    refreshAmmoCaliberList();
    refreshWeaponSelect();
    refreshAmmoSelect();
    safeRenderTagLists();
  }

  function showMessage(msg, type) {
    if (typeof api.showMessage === "function") {
      api.showMessage(msg, type);
    }
  }

  function debouncedHostSave() {
    if (typeof api.debouncedHostSave === "function") api.debouncedHostSave();
  }

  function saveToStorage() {
    if (typeof api.saveToStorage === "function") api.saveToStorage();
  }

  function parseData(showErrors = false) {
    return typeof api.parseData === "function" ? api.parseData(showErrors) : null;
  }

  function rebuildWeaponLibrary(dataObj) {
    const { weaponLibrary } = elements;
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
    safeRenderTagLists();
  }

  function refreshWeaponSelect(selectedName = null) {
    const { weaponSelect, weaponSearch } = elements;
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
    if (weaponSelect.value) {
      loadWeaponIntoForm(weaponSelect.value);
    } else {
      clearWeaponForm();
    }
  }

  function refreshAmmoSelect(selectedKey = null) {
    const { ammoSelect, ammoSearch } = elements;
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
    if (ammoSelect.value) loadAmmoIntoForm(ammoSelect.value);
  }

  function clearWeaponForm() {
    const {
      weaponName,
      weaponCaliber,
      weaponRange,
      weaponCategory,
      weaponMuzzle,
      weaponDispersion,
      weaponBarrel,
      weaponReload,
      weaponFireModes,
    } = elements;
    if (weaponName) weaponName.value = "";
    if (weaponCaliber) weaponCaliber.value = "";
    if (weaponRange) weaponRange.value = "";
    if (weaponCategory) weaponCategory.value = "";
    if (weaponMuzzle) weaponMuzzle.value = "";
    if (weaponDispersion) weaponDispersion.value = "";
    if (weaponBarrel) weaponBarrel.value = "";
    if (weaponReload) weaponReload.value = "";
    if (weaponFireModes) weaponFireModes.value = "";
    renderWeaponPreview();
  }

  function loadWeaponIntoForm(indexOrName = 0) {
    const { weaponSelect } = elements;
    if (!weaponSelect) return;
    const names = Object.keys(weaponTemplates).sort();
    const name = typeof indexOrName === "string" ? indexOrName : names[indexOrName] || names[0];
    const weapon = weaponTemplates[name] || {};
    weaponSelect.value = name || "";
    elements.weaponName && (elements.weaponName.value = weapon.name || "");
    elements.weaponCaliber && (elements.weaponCaliber.value = weapon.caliber || "");
    elements.weaponRange && (elements.weaponRange.value = weapon.range || "");
    elements.weaponCategory && (elements.weaponCategory.value = weapon.category || "");
    elements.weaponMuzzle && (elements.weaponMuzzle.value = weapon.muzzleVelocity || "");
    elements.weaponDispersion && (elements.weaponDispersion.value = weapon.dispersion || "");
    elements.weaponBarrel && (elements.weaponBarrel.value = weapon.barrelLength || "");
    elements.weaponReload && (elements.weaponReload.value = weapon.reloadSpeed || "");
    if (elements.weaponFireModes) {
      elements.weaponFireModes.value = Array.isArray(weapon.fireModes)
        ? weapon.fireModes.join(", ")
        : weapon.fireModes || "";
    }
    renderWeaponPreview();
  }

  function saveWeaponTemplate() {
    const { weaponName } = elements;
    if (!weaponName) return;
    const name = weaponName.value.trim();
    if (!name) {
      showMessage("Weapon name is required.", "error");
      return;
    }
    const entry = {
      name,
      caliber: elements.weaponCaliber?.value.trim() || "",
      range: parseFloat(elements.weaponRange?.value) || 0,
      category: elements.weaponCategory?.value.trim() || "",
      muzzleVelocity: parseFloat(elements.weaponMuzzle?.value) || 0,
      dispersion: parseFloat(elements.weaponDispersion?.value) || 0,
      barrelLength: parseFloat(elements.weaponBarrel?.value) || 0,
      reloadSpeed: parseFloat(elements.weaponReload?.value) || 0,
      fireModes: (elements.weaponFireModes?.value || "")
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

  function addWeaponTemplate() {
    const fields = [
      "weaponName",
      "weaponCaliber",
      "weaponRange",
      "weaponCategory",
      "weaponMuzzle",
      "weaponDispersion",
      "weaponBarrel",
      "weaponReload",
      "weaponFireModes",
    ];
    fields.forEach((key) => {
      if (elements[key]) elements[key].value = "";
    });
    if (elements.weaponSelect) elements.weaponSelect.value = "";
    renderWeaponPreview();
  }

  function deleteWeaponTemplate() {
    const { weaponSelect } = elements;
    if (!weaponSelect) return;
    const name = weaponSelect.value;
    if (name && weaponTemplates[name]) {
      delete weaponTemplates[name];
      refreshWeaponSelect();
      rebuildWeaponLibrary(parseData(false));
      saveToStorage();
      showMessage("Weapon deleted.", "success");
    }
  }

  function duplicateWeaponTemplate() {
    const { weaponSelect } = elements;
    if (!weaponSelect) return;
    const name = weaponSelect.value;
    if (!name || !weaponTemplates[name]) return;
    const original = weaponTemplates[name];
    elements.weaponName && (elements.weaponName.value = `${original.name} (Copy)`);
    elements.weaponCaliber && (elements.weaponCaliber.value = original.caliber || "");
    elements.weaponRange && (elements.weaponRange.value = original.range || "");
    elements.weaponCategory && (elements.weaponCategory.value = original.category || "");
    elements.weaponMuzzle && (elements.weaponMuzzle.value = original.muzzleVelocity || "");
    elements.weaponDispersion && (elements.weaponDispersion.value = original.dispersion || "");
    elements.weaponBarrel && (elements.weaponBarrel.value = original.barrelLength || "");
    elements.weaponReload && (elements.weaponReload.value = original.reloadSpeed || "");
    if (elements.weaponFireModes) {
      elements.weaponFireModes.value = (original.fireModes || []).map((f) => f.name).join(", ");
    }
    showMessage("Weapon duplicated. Adjust name and save.", "success");
  }

  function renderWeaponPreview() {
    const { weaponPreview, weaponName, weaponRange, weaponCategory, weaponMuzzle, weaponDispersion, weaponReload } =
      elements;
    if (!weaponPreview) return;
    weaponPreview.innerHTML = "";
    const row = document.createElement("div");
    row.className = "gun-row";
    const title = document.createElement("div");
    title.className = "gun-title";
    title.innerHTML = `<strong>1x ${weaponName?.value || "Weapon Name"}</strong> <span class="muted">(${
      weaponCategory?.value || "Category"
    })</span>`;
    const meta = document.createElement("div");
    meta.className = "gun-meta-wrap";
    [
      ["Range", formatWithUnit(weaponRange?.value || 0, "m")],
      ["Muzzle", formatWithUnit(weaponMuzzle?.value || 0, "m/s")],
      ["Dispersion", formatWithUnit(weaponDispersion?.value || 0, "cm")],
      ["Reload", formatWithUnit(weaponReload?.value || 0, "s")],
    ].forEach(([label, value]) => {
      const d = document.createElement("div");
      d.className = "gun-meta";
      d.innerHTML = `<span class="label">${label}</span> ${value}`;
      meta.appendChild(d);
    });
    row.append(title, meta);
    weaponPreview.appendChild(row);
  }

  function loadAmmoIntoForm(keyOrIndex = "") {
    const { ammoSelect } = elements;
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
    const data = selected.data || {};
    elements.ammoNameInput && (elements.ammoNameInput.value = data.name || "");
    elements.ammoCaliberInput && (elements.ammoCaliberInput.value = data.caliber || "");
    elements.ammoCaliberDescInput && (elements.ammoCaliberDescInput.value = data.caliberDesc || "");
    elements.ammoPenetrationInput && (elements.ammoPenetrationInput.value = data.penetration || "");
    elements.ammoHEInput && (elements.ammoHEInput.value = data.heDeadliness || "");
    elements.ammoDispersionInput && (elements.ammoDispersionInput.value = data.dispersion || "");
    elements.ammoRangeInput && (elements.ammoRangeInput.value = data.rangeMod || "");
    if (elements.ammoGrainInput) elements.ammoGrainInput.value = data.grain ?? "";
    elements.ammoNotesInput && (elements.ammoNotesInput.value = data.notes || "");
    renderAmmoPreview();
  }

  function saveAmmoTemplate() {
    const name = elements.ammoNameInput?.value.trim();
    const cal = elements.ammoCaliberInput?.value.trim();
    if (!cal) {
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
      caliberDesc: elements.ammoCaliberDescInput?.value || "",
      penetration: parseFloat(elements.ammoPenetrationInput?.value) || 0,
      heDeadliness: parseFloat(elements.ammoHEInput?.value) || 0,
      dispersion: parseFloat(elements.ammoDispersionInput?.value) || 0,
      rangeMod: parseFloat(elements.ammoRangeInput?.value) || 0,
      grain: parseFloat(elements.ammoGrainInput?.value) || 0,
      notes: elements.ammoNotesInput?.value || "",
    };
    if (existing) {
      Object.assign(existing, entry);
    } else {
      ammoLibrary[cal].push(entry);
    }
    refreshAmmoSelect(`${cal}::${name}`);
    refreshAmmoCaliberList();
    rebuildWeaponLibrary(parseData(false));
    saveToStorage();
    showMessage("Ammo saved.", "success");
  }

  function addAmmoTemplate() {
    const fields = [
      "ammoNameInput",
      "ammoCaliberInput",
      "ammoCaliberDescInput",
      "ammoPenetrationInput",
      "ammoHEInput",
      "ammoDispersionInput",
      "ammoRangeInput",
      "ammoGrainInput",
      "ammoNotesInput",
    ];
    fields.forEach((key) => {
      if (elements[key]) elements[key].value = "";
    });
    if (elements.ammoSelect) elements.ammoSelect.value = "";
    renderAmmoPreview();
  }

  function deleteAmmoTemplate() {
    const { ammoSelect } = elements;
    if (!ammoSelect) return;
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

  function duplicateAmmoTemplate() {
    const { ammoSelect } = elements;
    if (!ammoSelect) return;
    const key = ammoSelect.value;
    if (!key) return;
    const [cal, name] = key.split("::");
    const original = (ammoLibrary[cal] || []).find((a) => a.name === name);
    if (!original) return;
    if (elements.ammoNameInput) elements.ammoNameInput.value = `${original.name} (Copy)`;
    elements.ammoCaliberInput && (elements.ammoCaliberInput.value = original.caliber || "");
    elements.ammoCaliberDescInput && (elements.ammoCaliberDescInput.value = original.caliberDesc || "");
    elements.ammoPenetrationInput && (elements.ammoPenetrationInput.value = original.penetration || "");
    elements.ammoHEInput && (elements.ammoHEInput.value = original.heDeadliness || "");
    elements.ammoDispersionInput && (elements.ammoDispersionInput.value = original.dispersion || "");
    elements.ammoRangeInput && (elements.ammoRangeInput.value = original.rangeMod || "");
    elements.ammoGrainInput && (elements.ammoGrainInput.value = original.grain || "");
    elements.ammoNotesInput && (elements.ammoNotesInput.value = original.notes || "");
    showMessage("Ammo duplicated. Adjust name and save.", "success");
  }

  function renderAmmoPreview() {
    const { ammoPreview, ammoNameInput, ammoCaliberInput, ammoPenetrationInput, ammoHEInput, ammoDispersionInput, ammoRangeInput } =
      elements;
    if (!ammoPreview) return;
    ammoPreview.innerHTML = "";
    const row = document.createElement("div");
    row.className = "gun-row";
    const title = document.createElement("div");
    title.className = "gun-title";
    title.innerHTML = `<strong>${ammoNameInput?.value || "Ammo Name"}</strong> <span class="muted">(${
      ammoCaliberInput?.value || "Caliber"
    })</span>`;
    const meta = document.createElement("div");
    meta.className = "gun-meta-wrap";
    [
      ["Pen", `${ammoPenetrationInput?.value || 0} mm`],
      ["HE", ammoHEInput?.value || 0],
      ["Disp", `${ammoDispersionInput?.value || 0}%`],
      ["Range Mod", `${ammoRangeInput?.value || 0}m`],
    ].forEach(([label, display]) => {
      const d = document.createElement("div");
      d.className = "gun-meta";
      d.innerHTML = `<span class="label">${label}</span> ${display}`;
      meta.appendChild(d);
    });
    row.append(title, meta);
    ammoPreview.appendChild(row);
  }

  function refreshAmmoCaliberList() {
    const { ammoCaliberList } = elements;
    if (!ammoCaliberList) return;
    ammoCaliberList.innerHTML = "";
    const calibers = new Set(Object.keys(ammoLibrary));
    calibers.forEach((cal) => {
      const opt = document.createElement("option");
      opt.value = cal;
      ammoCaliberList.appendChild(opt);
    });
  }

  function processTagInput(nameInput, colorInput, targetMap) {
    if (!nameInput || !colorInput || !targetMap) return;
    const label = (nameInput.value || "").trim();
    const color = (colorInput.value || "").trim();
    if (!label) {
      showMessage("Enter a name before saving the tag.", "error");
      return;
    }
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

  function safeRenderTagLists() {
    const { categoryTagList, caliberTagList } = elements;
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

  function getAmmoDatalist(caliber) {
    try {
      if (!caliber) return null;
      let list = document.getElementById(`ammo-dl-${caliber.replace(/[^a-z0-9]/gi, "")}`);
      if (!list) {
        list = document.createElement("datalist");
        list.id = `ammo-dl-${caliber.replace(/[^a-z0-9]/gi, "")}`;
        document.body.appendChild(list);
      }
      return list;
    } catch (err) {
      console.warn("Unable to build ammo datalist", err);
      return null;
    }
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
      fileInput.value = "";
    };
    reader.readAsText(file);
  }

  function wireEvents() {
    const {
      saveWeaponButton,
      addWeaponButton,
      deleteWeaponButton,
      duplicateWeaponButton,
      weaponSelect,
      weaponSearch,
      weaponName,
      weaponRange,
      weaponCategory,
      weaponMuzzle,
      weaponDispersion,
      weaponBarrel,
      weaponReload,
      weaponFireModes,
      ammoSelect,
      ammoSearch,
      saveAmmoButton,
      addAmmoButton,
      deleteAmmoButton,
      duplicateAmmoButton,
      exportWeaponLibBtn,
      importWeaponLibBtn,
      importWeaponFile,
      exportAmmoLibBtn,
      importAmmoLibBtn,
      importAmmoFile,
      addCategoryTagBtn,
      addCaliberTagBtn,
      tagCategoryName,
      tagCategoryColor,
      tagCaliberName,
      tagCaliberColor,
    } = elements;

    saveWeaponButton?.addEventListener("click", saveWeaponTemplate);
    addWeaponButton?.addEventListener("click", addWeaponTemplate);
    deleteWeaponButton?.addEventListener("click", deleteWeaponTemplate);
    duplicateWeaponButton?.addEventListener("click", duplicateWeaponTemplate);
    weaponSelect?.addEventListener("change", () => loadWeaponIntoForm(weaponSelect.value));
    weaponSearch?.addEventListener("input", () => refreshWeaponSelect());
    [
      weaponName,
      weaponRange,
      weaponCategory,
      weaponMuzzle,
      weaponDispersion,
      weaponBarrel,
      weaponReload,
      weaponFireModes,
    ].forEach((input) => input?.addEventListener("input", renderWeaponPreview));

    ammoSelect?.addEventListener("change", () => loadAmmoIntoForm(ammoSelect.value));
    ammoSearch?.addEventListener("input", () => refreshAmmoSelect());
    saveAmmoButton?.addEventListener("click", saveAmmoTemplate);
    addAmmoButton?.addEventListener("click", addAmmoTemplate);
    deleteAmmoButton?.addEventListener("click", deleteAmmoTemplate);
    duplicateAmmoButton?.addEventListener("click", duplicateAmmoTemplate);
    [
      elements.ammoNameInput,
      elements.ammoCaliberInput,
      elements.ammoPenetrationInput,
      elements.ammoHEInput,
      elements.ammoDispersionInput,
      elements.ammoRangeInput,
    ].forEach((input) => input?.addEventListener("input", renderAmmoPreview));

    exportWeaponLibBtn?.addEventListener("click", () => exportLibrary(weaponTemplates, "weapon_library.json"));
    importWeaponLibBtn?.addEventListener("click", () => importWeaponFile?.click());
    importWeaponFile?.addEventListener("change", () =>
      importLibrary(importWeaponFile, (data) => {
        Object.assign(weaponTemplates, data);
        refreshWeaponSelect();
        rebuildWeaponLibrary(parseData(false));
      })
    );

    exportAmmoLibBtn?.addEventListener("click", () => exportLibrary(ammoLibrary, "ammo_library.json"));
    importAmmoLibBtn?.addEventListener("click", () => importAmmoFile?.click());
    importAmmoFile?.addEventListener("change", () =>
      importLibrary(importAmmoFile, (data) => {
        Object.keys(data).forEach((cal) => {
          if (ammoLibrary[cal]) {
            ammoLibrary[cal] = [...ammoLibrary[cal], ...data[cal]];
          } else {
            ammoLibrary[cal] = data[cal];
          }
        });
        refreshAmmoSelect();
        refreshAmmoCaliberList();
        rebuildWeaponLibrary(parseData(false));
      })
    );

    addCategoryTagBtn?.addEventListener("click", () =>
      processTagInput(tagCategoryName, tagCategoryColor, weaponTags.categories)
    );
    addCaliberTagBtn?.addEventListener("click", () =>
      processTagInput(tagCaliberName, tagCaliberColor, weaponTags.calibers)
    );
  }

  RTS.weaponEditor = {
    init,
    rebuildFromData: rebuildWeaponLibrary,
    safeRenderTagLists,
    refreshWeaponSelect,
    refreshAmmoSelect,
    loadWeaponIntoForm,
    loadAmmoIntoForm,
  };
})();
