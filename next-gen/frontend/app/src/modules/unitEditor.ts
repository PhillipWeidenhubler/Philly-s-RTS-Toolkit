import type {
  Equipment,
  Gun,
  GunAmmo,
  GunFireMode,
  Unit,
  UnitGrenades,
  UnitStats,
  WeaponTagMap,
} from "../types";
import { deepClone } from "../lib/helpers";
import { unitService } from "../services/unitService";
import { formationService } from "../services/formationService";
import { nationService } from "../services/nationService";
import { settingsService } from "../services/settingsService";
import { weaponLibraryService } from "../services/weaponLibraryService";
import { ammoLibraryService } from "../services/ammoLibraryService";
import { fireModeTemplateService } from "../services/fireModeTemplateService";
import { weaponTagService } from "../services/weaponTagService";
import {
  HEAVY_TRAIT_VALUES,
  TRAJECTORY_OPTIONS,
  WEAPON_TRAIT_GROUPS,
} from "../config/weaponOptions";

const createBlankUnit = (): Unit => ({
  name: "",
  category: "",
  internalCategory: "",
  tier: "",
  price: "",
  description: "",
  image: "",
  stats: {},
  grenades: {},
  capabilities: { sprint: {} },
  guns: [],
  equipment: [],
});

const booleanToSelectValue = (value: boolean | string | undefined): string => {
  if (value === true || value === "true") return "true";
  if (value === false || value === "false") return "false";
  return "";
};

const parseBool = (value: FormDataEntryValue | null): boolean | undefined => {
  if (!value) return undefined;
  if (value.toString() === "true") return true;
  if (value.toString() === "false") return false;
  return undefined;
};

export class UnitEditor {
  private root: HTMLElement;
  private units: Unit[] = [];

  private form!: HTMLFormElement;
  private unitListEl!: HTMLElement;
  private gunListEl!: HTMLElement;
  private equipmentListEl!: HTMLElement;
  private statusEl!: HTMLElement;
  private summaryEl!: HTMLElement;
  private speedInputEl?: HTMLInputElement | null;
  private speedHintEl?: HTMLElement | null;
  private grenadeInputs: HTMLInputElement[] = [];
  private grenadeTotalInput?: HTMLInputElement | null;
  private searchInput!: HTMLInputElement;
  private categoryFilter!: HTMLSelectElement;
  private sortModeSelect!: HTMLSelectElement;

  private workingCopy: Unit = createBlankUnit();
  private currentUnitId?: number;
  private pendingName?: string;
  private metaFormationsEl: HTMLElement | null = null;
  private metaNationsEl: HTMLElement | null = null;
  private metaThemeEl: HTMLElement | null = null;
  private unitCategoryTagListEl: HTMLDataListElement | null = null;
  private unitCaliberTagListEl: HTMLDataListElement | null = null;
  private ammoTemplates: GunAmmo[] = [];
  private fireTemplates: GunFireMode[] = [];
  private ammoLibraryByCaliber = new Map<string, GunAmmo[]>();
  private weaponTemplates: Gun[] = [];
  private hostAmmoTemplates: GunAmmo[] = [];
  private hostFireTemplates: GunFireMode[] = [];
  private fireLibraryTemplates: GunFireMode[] = [];
  private weaponTags: WeaponTagMap = { categories: {}, calibers: {} };

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async init(): Promise<void> {
    this.renderLayout();
    this.cacheElements();
    this.bindEvents();
    this.bindMetaFeeds();
    weaponLibraryService.subscribe((weapons) => {
      this.weaponTemplates = deepClone(weapons);
      this.hostFireTemplates = this.weaponTemplates.flatMap((weapon) => weapon.fireModes || []);
      this.updateTemplateLibraries(this.units);
    });
    weaponLibraryService.loadWeapons().catch(() => undefined);

    ammoLibraryService.subscribe((templates) => {
      this.hostAmmoTemplates = deepClone(templates);
      this.updateTemplateLibraries(this.units);
    });
    ammoLibraryService.loadTemplates().catch(() => undefined);

    fireModeTemplateService.subscribe((templates) => {
      this.fireLibraryTemplates = deepClone(templates);
      this.updateTemplateLibraries(this.units);
    });
    fireModeTemplateService.loadTemplates().catch(() => undefined);

    weaponTagService.subscribe((tags) => {
      this.weaponTags = tags;
      this.renderWeaponTagDatalists();
    });
    weaponTagService.loadTags().catch(() => undefined);

    unitService.subscribe((units) => {
      this.units = units;
      this.updateTemplateLibraries(units);
      this.renderUnitList();
      this.syncSelection();
    });

    await unitService.loadUnits().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(`Failed to load units: ${message}`, "error");
    });

    if (!this.units.length) {
      this.startNewUnit();
    }
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="workspace">
        <aside class="sidebar">
          <header class="sidebar-header">
            <div>
              <p class="eyebrow">SQLite source</p>
              <h1>Unit Browser</h1>
            </div>
            <button type="button" class="ghost" data-action="refresh-units">Refresh</button>
          </header>
          <div class="sidebar-actions">
            <input type="search" placeholder="Search name or category" data-role="search" />
            <button type="button" class="primary" data-action="new-unit">+ New unit</button>
          </div>
          <div class="sidebar-actions">
            <select data-role="category-filter">
              <option value="">All categories</option>
              <option value="INF">Infantry</option>
              <option value="ARM">Armor</option>
              <option value="LOG">Logistics</option>
              <option value="AIR">Air</option>
            </select>
            <select data-role="sort-mode">
              <option value="name-asc">Name A â†’ Z</option>
              <option value="name-desc">Name Z â†’ A</option>
              <option value="price-asc">Price low â†’ high</option>
              <option value="price-desc">Price high â†’ low</option>
            </select>
          </div>
          <div class="unit-list" data-role="unit-list"></div>
        </aside>
        <section class="editor">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Unit Editor</p>
              <h2>Unit Designer</h2>
              <p class="muted" data-role="unit-summary">Select a unit to begin.</p>
            </div>
            <div class="editor-actions">
              <button type="button" class="ghost" data-action="reset-unit">Reset</button>
              <button type="button" class="ghost danger" data-action="delete-unit">Delete</button>
              <button type="submit" class="primary" form="unitForm">Save unit</button>
            </div>
          </header>
          <form id="unitForm" data-role="unit-form" class="editor-form">
            <input type="hidden" name="unit-id" />
            <datalist id="unit-category-tags" data-role="unit-category-tags"></datalist>
            <datalist id="unit-caliber-tags" data-role="unit-caliber-tags"></datalist>
            <section class="panel grid-3">
              <div class="field">
                <label>Name</label>
                <input name="name" autocomplete="off" />
              </div>
              <div class="field">
                <label>Category</label>
                <input name="category" placeholder="INF, ARM, LOG" />
              </div>
              <div class="field">
                <label>Internal category</label>
                <input name="internalCategory" />
              </div>
              <div class="field">
                <label>Tier</label>
                <input name="tier" placeholder="Elite, Regular ..." />
              </div>
              <div class="field">
                <label>Price</label>
                <input name="price" type="number" step="1" min="0" />
              </div>
              <div class="field">
                <label>Image</label>
                <input name="image" placeholder="assets/units/pathfinder.png" />
              </div>
            </section>
            <section class="panel">
              <label>Description</label>
              <textarea name="description" rows="4" placeholder="Overview, strengths, doctrine..."></textarea>
            </section>
            <section class="panel">
              <div class="panel-title">Core stats</div>
              <div class="core-stats-grid">
                <div class="field"><label>Armor (rating)</label><input name="stats.armor" type="number" step="0.1" /></div>
                <div class="field"><label>Health (HP)</label><input name="stats.health" type="number" step="0.1" /></div>
                <div class="field"><label>Squad size (#)</label><input name="stats.squadSize" type="number" step="1" min="0" /></div>
                <div class="field"><label>Visual range (m)</label><input name="stats.visualRange" type="number" step="1" min="0" /></div>
                <div class="field"><label>Stealth (%)</label><input name="stats.stealth" type="number" step="1" min="0" /></div>
                <div class="field speed-field">
                  <label>Speed (m/s)</label>
                  <div class="input-with-hint">
                    <input name="stats.speed" type="number" step="0.1" data-role="speed-input" />
                    <span class="unit-hint" data-role="speed-kph">0 km/h</span>
                  </div>
                </div>
                <div class="field"><label>Weight (kg)</label><input name="stats.weight" type="number" step="0.1" /></div>
              </div>
            </section>
            <section class="panel grid-4">
              <div class="panel-title">Capabilities</div>
              <div class="field">
                <label>Static line jump</label>
                <select name="cap.staticLineJump">
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div class="field">
                <label>HALO/HAHO</label>
                <select name="cap.haloHaho">
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div class="field">
                <label>Laser designator</label>
                <select name="cap.laserDesignator">
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div class="field">
                <label>Sprint distance (m)</label>
                <input name="cap.sprint.distance" type="number" step="1" min="0" />
              </div>
              <div class="field">
                <label>Sprint speed (m/s)</label>
                <input name="cap.sprint.speed" type="number" step="0.1" />
              </div>
              <div class="field">
                <label>Sprint cooldown (s)</label>
                <input name="cap.sprint.cooldown" type="number" step="0.1" min="0" />
              </div>
            </section>
            <section class="panel grid-5">
              <div class="panel-title">Grenades</div>
              <div class="field"><label>Smoke (qty)</label><input name="grenades.smoke" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field"><label>Flash (qty)</label><input name="grenades.flash" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field"><label>Thermite (qty)</label><input name="grenades.thermite" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field"><label>Frag (qty)</label><input name="grenades.frag" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field grenade-total-field">
                <label>Total grenades</label>
                <input name="grenades.total" type="number" step="1" min="0" data-role="grenade-total" readonly tabindex="-1" />
              </div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Weapons</h3>
                <button type="button" class="ghost" data-action="add-gun">Add weapon</button>
              </div>
              <div class="repeatable-list" data-role="gun-list">
                <p class="empty">No weapons configured.</p>
              </div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Equipment</h3>
                <button type="button" class="ghost" data-action="add-equipment">Add equipment</button>
              </div>
              <div class="repeatable-list" data-role="equipment-list">
                <p class="empty">No equipment entries yet.</p>
              </div>
            </section>
          </form>
          <div class="status-bar" data-role="status-bar">Ready.</div>
          <div class="meta-bar" data-role="meta-bar">
            <span>Formations: <strong data-role="meta-formations">0</strong></span>
            <span>Nations: <strong data-role="meta-nations">0</strong></span>
            <span>Theme: <strong data-role="meta-theme">System</strong></span>
          </div>
        </section>
      </div>
    `;
  }

  private cacheElements(): void {
    this.form = this.root.querySelector<HTMLFormElement>('[data-role="unit-form"]')!;
    this.unitListEl = this.root.querySelector<HTMLElement>('[data-role="unit-list"]')!;
    this.gunListEl = this.root.querySelector<HTMLElement>('[data-role="gun-list"]')!;
    this.equipmentListEl = this.root.querySelector<HTMLElement>('[data-role="equipment-list"]')!;
    this.statusEl = this.root.querySelector<HTMLElement>('[data-role="status-bar"]')!;
    this.summaryEl = this.root.querySelector<HTMLElement>('[data-role="unit-summary"]')!;
    this.speedInputEl = this.root.querySelector<HTMLInputElement>('[data-role="speed-input"]');
    this.speedHintEl = this.root.querySelector<HTMLElement>('[data-role="speed-kph"]');
    this.grenadeInputs = Array.from(this.root.querySelectorAll<HTMLInputElement>('[data-role="grenade-input"]'));
    this.grenadeTotalInput = this.root.querySelector<HTMLInputElement>('[data-role="grenade-total"]');
    this.searchInput = this.root.querySelector<HTMLInputElement>('[data-role="search"]')!;
    this.categoryFilter = this.root.querySelector<HTMLSelectElement>('[data-role="category-filter"]')!;
    this.sortModeSelect = this.root.querySelector<HTMLSelectElement>('[data-role="sort-mode"]')!;
    this.metaFormationsEl = this.root.querySelector<HTMLElement>('[data-role="meta-formations"]');
    this.metaNationsEl = this.root.querySelector<HTMLElement>('[data-role="meta-nations"]');
    this.metaThemeEl = this.root.querySelector<HTMLElement>('[data-role="meta-theme"]');
    this.unitCategoryTagListEl = this.root.querySelector<HTMLDataListElement>('[data-role="unit-category-tags"]');
    this.unitCaliberTagListEl = this.root.querySelector<HTMLDataListElement>('[data-role="unit-caliber-tags"]');
  }

  private bindEvents(): void {
    this.unitListEl.addEventListener("click", (event) => this.handleUnitListClick(event));
    this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    this.root.addEventListener("click", (event) => this.handleAction(event));
    this.searchInput.addEventListener("input", () => {
      this.renderUnitList();
    });
    this.categoryFilter.addEventListener("change", () => this.renderUnitList());
    this.sortModeSelect.addEventListener("change", () => this.renderUnitList());
    this.speedInputEl?.addEventListener("input", () => this.updateSpeedHint());
    this.updateSpeedHint();
    this.grenadeInputs.forEach((input) => input.addEventListener("input", () => this.updateGrenadeTotal()));
    this.updateGrenadeTotal();
  }

  private bindMetaFeeds(): void {
    formationService.subscribe((formations) => {
      if (this.metaFormationsEl) this.metaFormationsEl.textContent = formations.length.toString();
    });
    nationService.subscribe((nations) => {
      if (this.metaNationsEl) this.metaNationsEl.textContent = nations.length.toString();
    });
    settingsService.subscribe((settings) => {
      if (this.metaThemeEl) this.metaThemeEl.textContent = settings.theme || "System";
    });

    formationService.loadFormations().catch((error) => {
      console.error("Failed to load formations", error);
    });
    nationService.loadNations().catch((error) => {
      console.error("Failed to load nations", error);
    });
    settingsService.loadSettings().catch((error) => {
      console.error("Failed to load settings", error);
    });
  }

  private handleUnitListClick(event: Event): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".unit-pill");
    if (!button) return;
    const index = Number(button.dataset.index);
    const unit = this.units[index];
    if (unit) {
      this.loadUnit(unit);
    }
  }

  private async handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const unit = this.collectFormData();
    if (!unit.name) {
      this.setStatus("Name is required.", "error");
      return;
    }

    try {
      if (!unit.id) {
        this.pendingName = unit.name.toLowerCase();
      } else {
        this.currentUnitId = unit.id;
      }
      this.setStatus("Saving unit...", "default");
      await unitService.saveUnit(unit);
      this.setStatus("Unit saved.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(`Failed to save unit: ${message}`, "error");
    }
  }

  private handleAction(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (!action) return;
    event.preventDefault();

    switch (action) {
      case "refresh-units":
        this.setStatus("Refreshing from host...", "default");
        unitService.loadUnits().catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          this.setStatus(`Refresh failed: ${message}`, "error");
        });
        break;
      case "new-unit":
        this.startNewUnit();
        break;
      case "reset-unit":
        this.resetCurrentUnit();
        break;
      case "add-gun":
        this.appendGunRow();
        break;
      case "add-equipment":
        this.appendEquipmentRow();
        break;
      case "delete-unit":
        this.deleteCurrentUnit();
        break;
      case "remove-gun": {
        const row = button.closest(".repeatable-row");
        row?.remove();
        if (!this.gunListEl.querySelector(".repeatable-row")) {
          this.gunListEl.innerHTML = '<p class="empty">No weapons configured.</p>';
        }
        break;
      }
      case "remove-equipment": {
        const row = button.closest(".repeatable-row");
        row?.remove();
        if (!this.equipmentListEl.querySelector(".repeatable-row")) {
          this.equipmentListEl.innerHTML = '<p class="empty">No equipment entries yet.</p>';
        }
        break;
      }
      default:
        break;
    }
  }

  private async deleteCurrentUnit(): Promise<void> {
    if (!this.currentUnitId) {
      this.setStatus("Select a saved unit before deleting.", "error");
      return;
    }
    const confirmed = window.confirm("Delete this unit permanently?");
    if (!confirmed) return;
    try {
      this.setStatus("Deleting unit...", "default");
      await unitService.deleteUnit(this.currentUnitId);
      this.currentUnitId = undefined;
      this.startNewUnit();
      this.setStatus("Unit removed.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(`Failed to delete unit: ${message}`, "error");
    }
  }

  private renderUnitList(): void {
    if (!this.unitListEl) return;
    this.unitListEl.innerHTML = "";
    const search = this.searchInput.value.trim().toLowerCase();
    const categoryFilter = this.categoryFilter.value;
    const items = this.units
      .map((unit, index) => ({ unit, index }))
      .filter(({ unit }) => {
        if (!search) return true;
        const haystack = `${unit.name ?? ""} ${unit.category ?? ""}`.toLowerCase();
        return haystack.includes(search);
      })
      .filter(({ unit }) => {
        if (!categoryFilter) return true;
        return (unit.category || "").toUpperCase() === categoryFilter;
      });

    const sortMode = this.sortModeSelect.value;
    items.sort((a, b) => {
      switch (sortMode) {
        case "name-desc":
          return (b.unit.name || "").localeCompare(a.unit.name || "");
        case "price-asc":
          return (Number(a.unit.price) || 0) - (Number(b.unit.price) || 0);
        case "price-desc":
          return (Number(b.unit.price) || 0) - (Number(a.unit.price) || 0);
        case "name-asc":
        default:
          return (a.unit.name || "").localeCompare(b.unit.name || "");
      }
    });

    if (!items.length) {
      this.unitListEl.innerHTML = '<p class="empty">No units match the current search.</p>';
      return;
    }

    items.forEach(({ unit, index }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "unit-pill";
      btn.dataset.index = index.toString();
      if (this.currentUnitId && unit.id === this.currentUnitId) {
        btn.classList.add("active");
      }
      btn.innerHTML = `
        <span class="unit-pill-body">
          <span class="title">${unit.name || "Unnamed unit"}</span>
          <span class="meta">${unit.category || "?"} Â· ${unit.tier || "Tier ?"} Â· ${unit.price ?? "â€”"} pts</span>
        </span>
      `;
      this.unitListEl.appendChild(btn);
    });
  }

  private loadUnit(unit: Unit): void {
    this.workingCopy = deepClone(unit);
    this.currentUnitId = typeof unit.id === "number" ? unit.id : undefined;
    this.pendingName = undefined;
    this.populateForm(this.workingCopy);
    this.setSummary(this.workingCopy.name ? `Editing ${this.workingCopy.name}` : "Editing unit");
    this.renderUnitList();
    this.setStatus("Unit loaded.", "default");
  }

  private startNewUnit(): void {
    this.workingCopy = createBlankUnit();
    this.currentUnitId = undefined;
    this.pendingName = undefined;
    this.populateForm(this.workingCopy);
    this.setSummary("New unit draft");
    this.renderUnitList();
    this.setStatus("Ready to capture a new unit.", "default");
  }

  private resetCurrentUnit(): void {
    if (this.currentUnitId) {
      const match = this.units.find((u) => u.id === this.currentUnitId);
      if (match) {
        this.loadUnit(match);
        return;
      }
    }
    this.startNewUnit();
  }

  private populateForm(unit: Unit): void {
    const setValue = (name: string, value: unknown) => {
      const field = this.form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        `[name="${name}"]`
      );
      if (!field) return;
      field.value = value === undefined || value === null ? "" : String(value);
    };

    setValue("unit-id", unit.id);
    setValue("name", unit.name ?? "");
    setValue("category", unit.category ?? "");
    setValue("internalCategory", unit.internalCategory ?? "");
    setValue("tier", unit.tier ?? "");
    setValue("price", unit.price ?? "");
    setValue("image", unit.image ?? "");
    setValue("description", unit.description ?? "");

    const stats = unit.stats ?? {};
    setValue("stats.armor", stats.armor ?? "");
    setValue("stats.health", stats.health ?? "");
    setValue("stats.squadSize", stats.squadSize ?? "");
    setValue("stats.visualRange", stats.visualRange ?? "");
    setValue("stats.stealth", stats.stealth ?? "");
    setValue("stats.speed", stats.speed ?? "");
    setValue("stats.weight", stats.weight ?? "");
    this.updateSpeedHint();

    const caps = unit.capabilities ?? {};
    setValue("cap.staticLineJump", booleanToSelectValue(caps.staticLineJump));
    setValue("cap.haloHaho", booleanToSelectValue(caps.haloHaho));
    setValue("cap.laserDesignator", booleanToSelectValue(caps.laserDesignator));
    setValue("cap.sprint.distance", caps.sprint?.distance ?? "");
    setValue("cap.sprint.speed", caps.sprint?.speed ?? "");
    setValue("cap.sprint.cooldown", caps.sprint?.cooldown ?? "");

    const gren = unit.grenades ?? {};
    setValue("grenades.smoke", gren.smoke ?? "");
    setValue("grenades.flash", gren.flash ?? "");
    setValue("grenades.thermite", gren.thermite ?? "");
    setValue("grenades.frag", gren.frag ?? "");
    if (this.grenadeTotalInput) {
      this.grenadeTotalInput.value = gren.total === undefined || gren.total === null ? "" : String(gren.total);
    }
    this.updateGrenadeTotal();

    this.renderGunList(unit.guns ?? []);
    this.renderEquipmentList(unit.equipment ?? []);
  }

  private renderGunList(guns: Gun[]): void {
    if (!this.gunListEl) return;
    if (!guns.length) {
      this.gunListEl.innerHTML = '<p class="empty">No weapons configured.</p>';
      return;
    }
    this.gunListEl.innerHTML = "";
    guns.forEach((gun) => this.appendGunRow(gun));
  }

  private renderEquipmentList(items: Equipment[]): void {
    if (!this.equipmentListEl) return;
    if (!items.length) {
      this.equipmentListEl.innerHTML = '<p class="empty">No equipment entries yet.</p>';
      return;
    }
    this.equipmentListEl.innerHTML = "";
    items.forEach((equipment) => this.appendEquipmentRow(equipment));
  }

  private appendGunRow(gun?: Gun): void {
    if (!this.gunListEl) return;
    if (this.gunListEl.querySelector(".empty")) {
      this.gunListEl.innerHTML = "";
    }
    const row = document.createElement("div");
    row.className = "repeatable-row";
    row.innerHTML = `
      <div class="row-header">
        <strong data-role="row-title">${gun?.name || "New weapon"}</strong>
        <div class="row-controls">
          <button type="button" class="ghost small" data-action="toggle-gun">Collapse</button>
          <button type="button" class="ghost danger" data-action="remove-gun">Remove</button>
        </div>
      </div>
      <div class="row-body">
        <div class="repeatable-grid">
          <label>Name<input data-field="name" value="${gun?.name ?? ""}" /></label>
          <label>Category<input data-field="category" list="unit-category-tags" value="${gun?.category ?? ""}" /></label>
          <label>Caliber<input data-field="caliber" list="unit-caliber-tags" value="${gun?.caliber ?? ""}" /></label>
          <label>Barrel length (cm)<input data-field="barrelLength" type="number" step="0.1" value="${gun?.barrelLength ?? ""}" /></label>
          <label>Range (m)<input data-field="range" type="number" step="1" value="${gun?.range ?? ""}" /></label>
          <label>Dispersion (%)<input data-field="dispersion" type="number" step="0.01" value="${gun?.dispersion ?? ""}" /></label>
          <label>Amount of weapons (#)<input data-field="count" type="number" step="1" min="0" value="${gun?.count ?? ""}" /></label>
          <label>Ammo / soldier (#)<input data-field="ammoPerSoldier" type="number" step="1" min="0" value="${gun?.ammoPerSoldier ?? ""}" /></label>
          <label>Total ammo (rounds)<input data-field="totalAmmo" type="number" step="1" min="0" value="${gun?.totalAmmo ?? ""}" readonly tabindex="-1" /></label>
          <label>Magazine size (rnds)<input data-field="magazineSize" type="number" step="1" min="0" value="${gun?.magazineSize ?? ""}" /></label>
          <label>Reload speed (s)<input data-field="reloadSpeed" type="number" step="0.1" value="${gun?.reloadSpeed ?? ""}" /></label>
          <label>Target acquisition (s)<input data-field="targetAcquisition" type="number" step="0.1" value="${gun?.targetAcquisition ?? ""}" /></label>
        </div>
      </div>
    `;
    const nameInput = row.querySelector<HTMLInputElement>('[data-field="name"]');
    const title = row.querySelector<HTMLSpanElement>('[data-role="row-title"]');
    const rowBody = row.querySelector<HTMLElement>(".row-body")!;
    nameInput?.addEventListener("input", () => {
      if (title) title.textContent = nameInput.value || "New weapon";
    });
    const amountInput = row.querySelector<HTMLInputElement>('[data-field="count"]');
    const ammoPerInput = row.querySelector<HTMLInputElement>('[data-field="ammoPerSoldier"]');
    const totalAmmoInput = row.querySelector<HTMLInputElement>('[data-field="totalAmmo"]');
    const weaponCaliberInput = row.querySelector<HTMLInputElement>('[data-field="caliber"]');
    const recalcTotalAmmo = () => {
      if (!totalAmmoInput || !amountInput || !ammoPerInput) return;
      const amount = Number.parseInt(amountInput.value || "0", 10);
      const per = Number.parseInt(ammoPerInput.value || "0", 10);
      const total = (Number.isFinite(amount) ? amount : 0) * (Number.isFinite(per) ? per : 0);
      totalAmmoInput.value = total > 0 ? total.toString() : "";
    };
    amountInput?.addEventListener("input", recalcTotalAmmo);
    ammoPerInput?.addEventListener("input", recalcTotalAmmo);
    recalcTotalAmmo();

    const traitButtons: HTMLButtonElement[] = [];
    const ammoBallisticUpdaters: Array<() => void> = [];
    const notifyTraitChange = () => {
      ammoBallisticUpdaters.forEach((fn) => fn());
    };
    const allowBallisticAutomation = (): boolean => {
      return !traitButtons.some(
        (btn) =>
          btn.classList.contains("active") && HEAVY_TRAIT_VALUES.has((btn.dataset.value || "").toLowerCase())
      );
    };


    const chipRow = document.createElement("div");
    chipRow.className = "chip-field-row";

    const trajectoryField = document.createElement("div");
    trajectoryField.className = "chip-field";
    const trajectoryLabel = document.createElement("span");
    trajectoryLabel.className = "label";
    trajectoryLabel.textContent = "Firing trajectories";
    const trajectoryWrap = document.createElement("div");
    trajectoryWrap.className = "chip-wrap";
    const activeTrajectories = new Set((gun?.trajectories || []).map((value) => value.toLowerCase()));
    TRAJECTORY_OPTIONS.forEach((option) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-button";
      btn.dataset.chipGroup = "trajectory";
      btn.dataset.value = option.value;
      btn.textContent = option.label;
      if (activeTrajectories.has(option.value.toLowerCase())) {
        btn.classList.add("active");
      }
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
      });
      trajectoryWrap.appendChild(btn);
    });
    trajectoryField.append(trajectoryLabel, trajectoryWrap);

    const traitField = document.createElement("div");
    traitField.className = "chip-field";
    const traitLabel = document.createElement("span");
    traitLabel.className = "label";
    traitLabel.textContent = "Weapon traits";
    const traitWrap = document.createElement("div");
    traitWrap.className = "chip-wrap trait-wrap";
    const activeTraits = new Set((gun?.traits || []).map((value) => value.toLowerCase()));
    WEAPON_TRAIT_GROUPS.forEach((group, index) => {
      group.forEach((option) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip-button";
        btn.dataset.chipGroup = "trait";
        btn.dataset.value = option.value;
        btn.textContent = option.label;
        if (activeTraits.has(option.value.toLowerCase())) {
          btn.classList.add("active");
        }
        btn.addEventListener("click", () => {
          btn.classList.toggle("active");
          notifyTraitChange();
        });
        traitButtons.push(btn);
        traitWrap.appendChild(btn);
      });
      if (index === 0) {
        const separator = document.createElement("span");
        separator.className = "trait-separator";
        traitWrap.appendChild(separator);
      }
    });
    traitField.append(traitLabel, traitWrap);

    chipRow.append(trajectoryField, traitField);
    rowBody.appendChild(chipRow);

    const ammoSection = document.createElement("div");
    ammoSection.className = "subpanel";
    const ammoHeader = document.createElement("div");
    ammoHeader.className = "subpanel-heading";
    ammoHeader.innerHTML = `<strong>Ammo types</strong>`;
    const ammoActions = document.createElement("div");
    ammoActions.className = "header-actions compact";
    const ammoLibrarySelect = document.createElement("select");
    ammoLibrarySelect.className = "ghost small";
    const populateAmmoLibrary = () => {
      ammoLibrarySelect.innerHTML = `<option value="">From library...</option>`;
      this.ammoTemplates.forEach((tpl, index) => {
        const option = document.createElement("option");
        option.value = index.toString();
        option.textContent = tpl.name || `Template ${index + 1}`;
        ammoLibrarySelect.appendChild(option);
      });
    };
    populateAmmoLibrary();
    ammoLibrarySelect.addEventListener("focus", populateAmmoLibrary);
    ammoLibrarySelect.addEventListener("change", () => {
      if (!ammoLibrarySelect.value) return;
      const template = this.ammoTemplates[Number(ammoLibrarySelect.value)];
      if (template) {
        appendAmmoRow(deepClone(template));
        refreshFireAmmoOptions();
      }
      ammoLibrarySelect.value = "";
    });
    const addAmmoBtn = document.createElement("button");
    addAmmoBtn.type = "button";
    addAmmoBtn.className = "ghost small";
    addAmmoBtn.textContent = "Add ammo";
    const collapseAmmoBtn = document.createElement("button");
    collapseAmmoBtn.type = "button";
    collapseAmmoBtn.className = "ghost small";
    collapseAmmoBtn.textContent = "Collapse";
    collapseAmmoBtn.addEventListener("click", () => {
      ammoSection.classList.toggle("collapsed");
      collapseAmmoBtn.textContent = ammoSection.classList.contains("collapsed") ? "Expand" : "Collapse";
    });
    ammoActions.append(ammoLibrarySelect, addAmmoBtn, collapseAmmoBtn);
    ammoHeader.appendChild(ammoActions);
    const ammoList = document.createElement("div");
    ammoList.className = "subpanel-list ammo-list";
    const ammoBody = document.createElement("div");
    ammoBody.className = "subpanel-body";
    ammoBody.appendChild(ammoList);

    const parseCaliberMeasurement = (raw?: string | null): number | undefined => {
      if (!raw) return undefined;
      const normalized = raw.replace(",", ".");
      const match = normalized.match(/\d+(?:\.\d+)?/);
      if (!match) return undefined;
      const value = Number.parseFloat(match[0]);
      return Number.isNaN(value) ? undefined : value;
    };

    const computeAmmoFpsEstimate = (caliberRaw: string, barrelLength: number, grain: number): number => {
      const normalized = caliberRaw.replace(/\s+/g, "");
      const caliberMatch = normalized.match(/(\d{1,3})(?:[.,](\d{1,3}))?x(\d{1,3})/i);
      let diameter = parseCaliberMeasurement(caliberRaw) ?? 5.56;
      if (caliberMatch) {
        const decimalPart = caliberMatch[2] ?? "";
        diameter = Number.parseFloat(decimalPart ? `${caliberMatch[1]}.${decimalPart}` : caliberMatch[1]);
      }
      const base = 2000;
      const barrelComponent = barrelLength * 45;
      const grainPenalty = grain * 1.5;
      const caliberTweak = (6 - diameter) * 15;
      const estimate = base + barrelComponent - grainPenalty + caliberTweak;
      return Math.max(300, Math.round(estimate));
    };

    const getWeaponCaliberValue = (): string => weaponCaliberInput?.value.trim() || "";

    const refreshAmmoCaliberAutoFill = () => {
      const inherited = getWeaponCaliberValue();
      ammoList.querySelectorAll<HTMLInputElement>('input[data-ammo-field="caliber"]').forEach((input) => {
        const fallback = input.dataset.initialCaliber?.trim() || "";
        const value = inherited || fallback;
        input.value = value;
        input.placeholder = value || inherited;
        input.dataset.initialCaliber = value;
      });
    };

    weaponCaliberInput?.addEventListener("input", () => {
      refreshAmmoCaliberAutoFill();
      ammoBallisticUpdaters.forEach((fn) => fn());
    });

    const fireSection = document.createElement("div");
    fireSection.className = "subpanel";
    const fireHeader = document.createElement("div");
    fireHeader.className = "subpanel-heading";
    fireHeader.innerHTML = `<strong>Fire modes</strong>`;
    const fireActions = document.createElement("div");
    fireActions.className = "header-actions compact";
    const fireLibrarySelect = document.createElement("select");
    fireLibrarySelect.className = "ghost small";
    const populateFireLibrary = () => {
      fireLibrarySelect.innerHTML = `<option value="">From library...</option>`;
      this.fireTemplates.forEach((tpl, index) => {
        const option = document.createElement("option");
        option.value = index.toString();
        option.textContent = tpl.name || `Mode ${index + 1}`;
        fireLibrarySelect.appendChild(option);
      });
    };
    populateFireLibrary();
    fireLibrarySelect.addEventListener("focus", populateFireLibrary);
    fireLibrarySelect.addEventListener("change", () => {
      if (!fireLibrarySelect.value) return;
      const template = this.fireTemplates[Number(fireLibrarySelect.value)];
      if (template) {
        appendFireRow(deepClone(template));
        refreshFireAmmoOptions();
      }
      fireLibrarySelect.value = "";
    });
    const addFireBtn = document.createElement("button");
    addFireBtn.type = "button";
    addFireBtn.className = "ghost small";
    addFireBtn.textContent = "Add fire mode";
    const collapseFireBtn = document.createElement("button");
    collapseFireBtn.type = "button";
    collapseFireBtn.className = "ghost small";
    collapseFireBtn.textContent = "Collapse";
    collapseFireBtn.addEventListener("click", () => {
      fireSection.classList.toggle("collapsed");
      collapseFireBtn.textContent = fireSection.classList.contains("collapsed") ? "Expand" : "Collapse";
    });
    fireActions.append(fireLibrarySelect, addFireBtn, collapseFireBtn);
    fireHeader.appendChild(fireActions);
    const fireList = document.createElement("div");
    fireList.className = "subpanel-list fire-list";
    const fireBody = document.createElement("div");
    fireBody.className = "subpanel-body";
    fireBody.appendChild(fireList);

    const appendAmmoRow = (ammo?: GunAmmo) => {
      const ammoRow = document.createElement("div");
      ammoRow.className = "ammo-row";
      const airburstValue = ammo?.airburst === true || ammo?.airburst === "true" ? "yes" : "no";
      ammoRow.innerHTML = `
        <div class="subgrid">
          <label>Name<input data-ammo-field="name" value="${ammo?.name ?? ""}" /></label>
          <label>Type<input data-ammo-field="ammoType" value="${ammo?.ammoType ?? ""}" /></label>
          <label>Caliber<input data-ammo-field="caliber" value="${ammo?.caliber ?? ""}" readonly tabindex="-1" /></label>
          <label>Caliber notes<input data-ammo-field="caliberDesc" value="${ammo?.caliberDesc ?? ""}" /></label>
          <label>Penetration (mm)<input type="number" step="0.1" data-ammo-field="penetration" value="${ammo?.penetration ?? ""}" /></label>
          <label>HE value<input type="number" step="0.1" data-ammo-field="heDeadliness" value="${ammo?.heDeadliness ?? ""}" /></label>
          <label>Dispersion (%)<input type="number" step="0.1" data-ammo-field="dispersion" value="${ammo?.dispersion ?? ""}" /></label>
          <label>Range delta (%)<input type="number" step="0.1" data-ammo-field="rangeMod" value="${ammo?.rangeMod ?? ""}" /></label>
          <label>Ammo/Soldier (#)<input type="number" step="1" min="0" data-ammo-field="ammoPerSoldier" value="${ammo?.ammoPerSoldier ?? ""}" /></label>
          <label>Grain (gr)<input type="number" step="0.1" data-ammo-field="grain" value="${ammo?.grain ?? ""}" /></label>
          <label>Muzzle velocity (fps)<input type="number" step="1" data-ammo-field="fps" value="${ammo?.fps ?? ""}" /></label>
          <label>Notes<input data-ammo-field="notes" value="${ammo?.notes ?? ""}" /></label>
          <label>Airburst
            <select data-ammo-field="airburst">
              <option value="yes" ${airburstValue === "yes" ? "selected" : ""}>Yes</option>
              <option value="no" ${airburstValue === "no" ? "selected" : ""}>No</option>
            </select>
          </label>
          <label>Sub munitions (#)<input type="number" step="1" min="0" data-ammo-field="subCount" data-airburst-dependent value="${ammo?.subCount ?? ""}" /></label>
          <label>Sub damage<input type="number" step="0.1" data-ammo-field="subDamage" data-airburst-dependent value="${ammo?.subDamage ?? ""}" /></label>
          <label>Sub penetration (mm)<input type="number" step="0.1" data-ammo-field="subPenetration" data-airburst-dependent value="${ammo?.subPenetration ?? ""}" /></label>
        </div>
        <div class="row-actions">
          <button type="button" class="ghost small" data-action="remove-ammo">Remove ammo</button>
        </div>
      `;
      const grainInput = ammoRow.querySelector<HTMLInputElement>('input[data-ammo-field="grain"]');
      const fpsInput = ammoRow.querySelector<HTMLInputElement>('input[data-ammo-field="fps"]');
      const ammoCaliberInput = ammoRow.querySelector<HTMLInputElement>('input[data-ammo-field="caliber"]');
      if (ammoCaliberInput) {
        ammoCaliberInput.readOnly = true;
        ammoCaliberInput.tabIndex = -1;
        ammoCaliberInput.classList.add("readonly");
        if (typeof ammo?.caliber === "string" && ammo.caliber.trim()) {
          ammoCaliberInput.dataset.initialCaliber = ammo.caliber.trim();
        }
        const startingValue = getWeaponCaliberValue() || ammoCaliberInput.dataset.initialCaliber || "";
        ammoCaliberInput.value = startingValue;
        ammoCaliberInput.placeholder = startingValue || getWeaponCaliberValue();
        ammoCaliberInput.dataset.initialCaliber = startingValue;
      }
      const getBarrelLength = () =>
        parseFloat(row.querySelector<HTMLInputElement>('[data-field="barrelLength"]')?.value || "0") || 0;
      const applyBallistics = () => {
        if (!allowBallisticAutomation()) return;
        if (!grainInput || !fpsInput) return;
        const grain = parseFloat(grainInput.value || "0");
        const barrel = getBarrelLength();
        const caliberSource = getWeaponCaliberValue() || ammoCaliberInput?.dataset.initialCaliber || "";
        if (Number.isNaN(grain) || Number.isNaN(barrel)) return;
        const velocity = computeAmmoFpsEstimate(caliberSource, barrel, grain);
        fpsInput.value = velocity.toString();
      };
      ammoRow.querySelector<HTMLButtonElement>('[data-action="remove-ammo"]')?.addEventListener("click", () => {
        ammoRow.remove();
        const index = ammoBallisticUpdaters.indexOf(applyBallistics);
        if (index >= 0) ammoBallisticUpdaters.splice(index, 1);
        refreshFireAmmoOptions();
      });
      const airburstSelect = ammoRow.querySelector<HTMLSelectElement>('select[data-ammo-field="airburst"]');
      const subInputs = ammoRow.querySelectorAll<HTMLInputElement>('[data-airburst-dependent]');
      const syncAirburstFields = () => {
        const enabled = airburstSelect?.value === "yes";
        subInputs.forEach((input) => {
          input.disabled = !enabled;
        });
      };
      airburstSelect?.addEventListener("change", () => {
        syncAirburstFields();
      });
      syncAirburstFields();
      ammoList.appendChild(ammoRow);
      grainInput?.addEventListener("input", applyBallistics);
      row.querySelector<HTMLInputElement>('[data-field="barrelLength"]')?.addEventListener("input", applyBallistics);
      ammoBallisticUpdaters.push(applyBallistics);
      refreshAmmoCaliberAutoFill();
      applyBallistics();
    };

    const appendFireRow = (mode?: GunFireMode) => {
      const fireRow = document.createElement("div");
      fireRow.className = "fire-row";
      fireRow.innerHTML = `
        <div class="subgrid">
          <label>Name<input data-fire-field="name" value="${mode?.name ?? ""}" /></label>
          <label>Rounds / burst (#)<input type="number" step="1" min="0" data-fire-field="rounds" value="${mode?.rounds ?? ""}" /></label>
          <label>Min range (m)<input type="number" step="0.1" min="0" data-fire-field="minRange" value="${mode?.minRange ?? ""}" /></label>
          <label>Max range (m)<input type="number" step="0.1" min="0" data-fire-field="maxRange" value="${mode?.maxRange ?? ""}" /></label>
          <label>Cooldown (s)<input type="number" step="0.1" min="0" data-fire-field="cooldown" value="${mode?.cooldown ?? ""}" /></label>
          <label>Ammo reference<select data-fire-field="ammoRef"></select></label>
        </div>
        <div class="row-actions">
          <button type="button" class="ghost small" data-action="remove-fire">Remove mode</button>
        </div>
      `;
      fireRow.querySelector<HTMLButtonElement>('[data-action="remove-fire"]')?.addEventListener("click", () => {
        fireRow.remove();
      });
      fireList.appendChild(fireRow);
    };

    const getAmmoNames = () =>
      Array.from(ammoList.querySelectorAll<HTMLInputElement>('input[data-ammo-field="name"]'))
        .map((input) => input.value.trim())
        .filter(Boolean);

    const refreshFireAmmoOptions = () => {
      const names = getAmmoNames();
      fireList.querySelectorAll<HTMLSelectElement>('select[data-fire-field="ammoRef"]').forEach((select) => {
        const current = select.value || select.dataset.prefill || "";
        select.innerHTML = "";
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "None";
        select.appendChild(empty);
        names.forEach((name) => {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          select.appendChild(opt);
        });
        if (names.includes(current)) {
          select.value = current;
        } else {
          select.value = "";
          if (current) select.dataset.prefill = current;
        }
      });
    };

    addAmmoBtn.addEventListener("click", () => {
      appendAmmoRow();
      refreshFireAmmoOptions();
    });
    addFireBtn.addEventListener("click", () => {
      appendFireRow();
      refreshFireAmmoOptions();
    });

    const ammoSource = Array.isArray(gun?.ammoTypes) && gun?.ammoTypes.length ? gun!.ammoTypes! : [undefined];
    ammoSource.forEach((ammo) => appendAmmoRow(ammo));
    const fireSource = Array.isArray(gun?.fireModes) && gun?.fireModes.length ? gun!.fireModes! : [undefined];
    fireSource.forEach((mode) => appendFireRow(mode));

    ammoList.addEventListener("input", (event) => {
      if ((event.target as HTMLElement).matches('[data-ammo-field="name"]')) {
        refreshFireAmmoOptions();
      }
    });

    ammoSection.append(ammoHeader, ammoBody);
    fireSection.append(fireHeader, fireBody);
    rowBody.append(fireSection, ammoSection);
    row.querySelector('[data-action="toggle-gun"]')?.addEventListener("click", (event) => {
      event.preventDefault();
      row.classList.toggle("collapsed");
      const button = event.currentTarget as HTMLButtonElement;
      button.textContent = row.classList.contains("collapsed") ? "Expand" : "Collapse";
    });
    this.gunListEl.appendChild(row);
    refreshFireAmmoOptions();
  }

  private appendEquipmentRow(item?: Equipment): void {
    if (!this.equipmentListEl) return;
    if (this.equipmentListEl.querySelector(".empty")) {
      this.equipmentListEl.innerHTML = "";
    }
    const row = document.createElement("div");
    row.className = "repeatable-row";
    row.innerHTML = `
      <div class="row-header">
        <strong data-role="row-title">${item?.name || "New equipment"}</strong>
        <button type="button" class="ghost" data-action="remove-equipment">Remove</button>
      </div>
      <div class="repeatable-grid">
        <label>Name<input data-field="name" value="${item?.name ?? ""}" /></label>
        <label>Type<input data-field="type" value="${item?.type ?? ""}" /></label>
        <label>Description<input data-field="description" value="${item?.description ?? ""}" /></label>
        <label>Notes<input data-field="notes" value="${item?.notes ?? ""}" /></label>
        <label>Quantity<input data-field="count" type="number" step="1" min="0" value="${item?.count ?? ""}" /></label>
      </div>
    `;
    const nameInput = row.querySelector<HTMLInputElement>('[data-field="name"]');
    const title = row.querySelector<HTMLSpanElement>('[data-role="row-title"]');
    nameInput?.addEventListener("input", () => {
      if (title) title.textContent = nameInput.value || "New equipment";
    });
    this.equipmentListEl.appendChild(row);
  }

  private collectFormData(): Unit {
    const data = new FormData(this.form);
    const stats: UnitStats = {};
    const gren: UnitGrenades = {};

    const unit: Unit = {
      id: this.toInt(data.get("unit-id")),
      name: this.toStringValue(data.get("name")) ?? "",
      category: this.toStringValue(data.get("category"))?.toUpperCase(),
      internalCategory: this.toStringValue(data.get("internalCategory")),
      tier: this.toStringValue(data.get("tier")),
      price: this.toInt(data.get("price")),
      image: this.toStringValue(data.get("image")),
      description: this.toStringValue(data.get("description")),
    };

    const statFields: (keyof UnitStats)[] = [
      "armor",
      "health",
      "squadSize",
      "visualRange",
      "stealth",
      "speed",
      "weight",
    ];
    statFields.forEach((key) => {
      const value = this.toNumber(data.get(`stats.${key}`));
      if (value !== undefined) {
        stats[key] = value;
      }
    });
    if (Object.keys(stats).length) unit.stats = stats;

    const grenadeInputs: (keyof UnitGrenades)[] = ["smoke", "flash", "thermite", "frag"];
    grenadeInputs.forEach((key) => {
      const value = this.toInt(data.get(`grenades.${key}`));
      if (value !== undefined) {
        gren[key] = value;
      }
    });
    const grenadeSum = grenadeInputs.reduce((sum, key) => {
      const value = gren[key];
      return sum + (typeof value === "number" ? value : 0);
    }, 0);
    if (grenadeSum > 0) {
      gren.total = grenadeSum;
    }
    if (Object.keys(gren).length) unit.grenades = gren;

    const capabilities: Unit["capabilities"] = {};
    const staticLineJump = parseBool(data.get("cap.staticLineJump"));
    if (staticLineJump !== undefined) capabilities.staticLineJump = staticLineJump;
    const haloHaho = parseBool(data.get("cap.haloHaho"));
    if (haloHaho !== undefined) capabilities.haloHaho = haloHaho;
    const laser = parseBool(data.get("cap.laserDesignator"));
    if (laser !== undefined) capabilities.laserDesignator = laser;

    const sprintDistance = this.toNumber(data.get("cap.sprint.distance"));
    const sprintSpeed = this.toNumber(data.get("cap.sprint.speed"));
    const sprintCooldown = this.toNumber(data.get("cap.sprint.cooldown"));
    if (sprintDistance !== undefined || sprintSpeed !== undefined || sprintCooldown !== undefined) {
      capabilities.sprint = {
        distance: sprintDistance,
        speed: sprintSpeed,
        cooldown: sprintCooldown,
      };
    }
    if (Object.keys(capabilities).length) unit.capabilities = capabilities;

    unit.guns = this.collectGunRows();
    unit.equipment = this.collectEquipmentRows();

    if (this.workingCopy.symbol) {
      unit.symbol = deepClone(this.workingCopy.symbol);
    } else {
      delete unit.symbol;
    }

    return unit;
  }

  private collectGunRows(): Gun[] {
    const rows = Array.from(this.gunListEl.querySelectorAll<HTMLElement>(".repeatable-row"));
    const guns: Gun[] = [];
    rows.forEach((row) => {
      const gun: Gun = {};
      const str = (key: string) =>
        row.querySelector<HTMLInputElement>(`[data-field="${key}"]`)?.value.trim() ?? "";
      const num = (key: string) => this.parseNumberString(str(key));
      const int = (key: string) => this.parseIntegerString(str(key));

      gun.name = str("name") || undefined;
      gun.category = str("category") || undefined;
      gun.caliber = str("caliber") || undefined;
      gun.barrelLength = num("barrelLength");
      gun.range = num("range");
      gun.dispersion = num("dispersion");
      gun.count = int("count");
      gun.ammoPerSoldier = int("ammoPerSoldier");
      gun.totalAmmo = int("totalAmmo");
      if (!gun.totalAmmo && gun.count && gun.ammoPerSoldier) {
        gun.totalAmmo = gun.count * gun.ammoPerSoldier;
      }
      gun.magazineSize = int("magazineSize");
      gun.reloadSpeed = num("reloadSpeed");
      gun.targetAcquisition = num("targetAcquisition");

      const ammoRows = Array.from(row.querySelectorAll<HTMLElement>(".ammo-row"));
      const ammoTypes: GunAmmo[] = ammoRows
        .map((ammoRow) => {
          const text = (key: string) =>
            ammoRow.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-ammo-field="${key}"]`)?.value.trim() ?? "";
          const numberValue = (key: string) => this.parseNumberString(text(key));
          const intValue = (key: string) => this.parseIntegerString(text(key));
          const ammo: GunAmmo = {
            name: text("name") || undefined,
            ammoType: text("ammoType") || undefined,
            caliber: text("caliber") || undefined,
            caliberDesc: text("caliberDesc") || undefined,
            ammoPerSoldier: intValue("ammoPerSoldier"),
            penetration: numberValue("penetration"),
            heDeadliness: numberValue("heDeadliness"),
            dispersion: numberValue("dispersion"),
            rangeMod: numberValue("rangeMod"),
            grain: numberValue("grain"),
            notes: text("notes") || undefined,
            fps: numberValue("fps"),
            subCount: intValue("subCount"),
            subDamage: numberValue("subDamage"),
            subPenetration: numberValue("subPenetration"),
          };
          const airburst = text("airburst");
          if (airburst === "yes") ammo.airburst = true;
          else if (airburst === "no") ammo.airburst = false;
          const hasContent = Object.values(ammo).some((value) => value !== undefined && value !== "");
          return hasContent ? ammo : null;
        })
        .filter((ammo): ammo is GunAmmo => Boolean(ammo));
      if (ammoTypes.length) gun.ammoTypes = ammoTypes;

      const fireRows = Array.from(row.querySelectorAll<HTMLElement>(".fire-row"));
      const fireModes: GunFireMode[] = fireRows
        .map((fireRow) => {
          const text = (key: string) =>
            fireRow.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-fire-field="${key}"]`)?.value.trim() ?? "";
          const numberValue = (key: string) => this.parseNumberString(text(key));
          const intValue = (key: string) => this.parseIntegerString(text(key));
          const fire: GunFireMode = {
            name: text("name") || undefined,
            rounds: intValue("rounds"),
            minRange: numberValue("minRange"),
            maxRange: numberValue("maxRange"),
            cooldown: numberValue("cooldown"),
            ammoRef: text("ammoRef") || undefined,
          };
          const hasContent = Object.values(fire).some((value) => value !== undefined && value !== "");
          return hasContent ? fire : null;
        })
        .filter((mode): mode is GunFireMode => Boolean(mode));
      if (fireModes.length) gun.fireModes = fireModes;

      const trajectoryValues = Array.from(
        row.querySelectorAll<HTMLButtonElement>('[data-chip-group="trajectory"]')
      )
        .filter((chip) => chip.classList.contains("active"))
        .map((chip) => chip.dataset.value || "")
        .filter(Boolean);
      if (trajectoryValues.length) {
        gun.trajectories = trajectoryValues;
      }

      const traitValues = Array.from(row.querySelectorAll<HTMLButtonElement>('[data-chip-group="trait"]'))
        .filter((chip) => chip.classList.contains("active"))
        .map((chip) => chip.dataset.value || "")
        .filter(Boolean);
      if (traitValues.length) {
        gun.traits = traitValues;
      }

      if (Object.values(gun).some((value) => value !== undefined && value !== "")) {
        guns.push(gun);
      }
    });
    return guns;
  }

  private collectEquipmentRows(): Equipment[] {
    const rows = Array.from(this.equipmentListEl.querySelectorAll<HTMLElement>(".repeatable-row"));
    const items: Equipment[] = [];
    rows.forEach((row) => {
      const equipment: Equipment = {};
      const str = (key: string) =>
        row.querySelector<HTMLInputElement>(`[data-field="${key}"]`)?.value.trim() ?? "";
      const int = (key: string) => this.parseIntegerString(str(key));

      equipment.name = str("name") || undefined;
      equipment.type = str("type") || undefined;
      equipment.description = str("description") || undefined;
      equipment.notes = str("notes") || undefined;
      equipment.count = int("count");

      if (Object.values(equipment).some((value) => value !== undefined && value !== "")) {
        items.push(equipment);
      }
    });
    return items;
  }

  private syncSelection(): void {
    if (this.currentUnitId) {
      const match = this.units.find((unit) => unit.id === this.currentUnitId);
      if (match) {
        this.loadUnit(match);
        return;
      }
    }
    if (this.pendingName) {
      const match = this.units.find((unit) => unit.name?.toLowerCase() === this.pendingName);
      if (match) {
        this.loadUnit(match);
        return;
      }
    }
  }

  private toNumber(value: FormDataEntryValue | null): number | undefined {
    if (value === null) return undefined;
    return this.parseNumberString(value.toString());
  }

  private toInt(value: FormDataEntryValue | null): number | undefined {
    if (value === null) return undefined;
    return this.parseIntegerString(value.toString());
  }

  private parseNumberString(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private parseIntegerString(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private toStringValue(value: FormDataEntryValue | null): string | undefined {
    if (value === null) return undefined;
    const text = value.toString().trim();
    return text.length ? text : undefined;
  }

  private renderWeaponTagDatalists(): void {
    if (this.unitCategoryTagListEl) {
      this.unitCategoryTagListEl.innerHTML = this.buildTagOptionMarkup(Object.keys(this.weaponTags.categories || {}));
    }
    if (this.unitCaliberTagListEl) {
      this.unitCaliberTagListEl.innerHTML = this.buildTagOptionMarkup(Object.keys(this.weaponTags.calibers || {}));
    }
  }

  private buildTagOptionMarkup(values: string[]): string {
    if (!values || !values.length) return "";
    return [...values]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => `<option value="${value}"></option>`)
      .join("");
  }

  private setStatus(message: string, tone: "default" | "success" | "error"): void {
    if (!this.statusEl) return;
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }

  private setSummary(message: string): void {
    if (this.summaryEl) {
      this.summaryEl.textContent = message;
    }
  }

  private updateSpeedHint(): void {
    if (!this.speedHintEl || !this.speedInputEl) return;
    const value = Number.parseFloat(this.speedInputEl.value);
    if (!Number.isFinite(value)) {
      this.speedHintEl.textContent = "-- km/h";
      return;
    }
    const kph = value * 3.6;
    this.speedHintEl.textContent = `${kph.toFixed(1)} km/h`;
  }

  private updateGrenadeTotal(): void {
    if (!this.grenadeTotalInput) return;
    const total = this.grenadeInputs.reduce((sum, input) => {
      const value = Number.parseInt(input.value, 10);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    this.grenadeTotalInput.value = total > 0 ? total.toString() : "";
  }

  private updateTemplateLibraries(units: Unit[]): void {
    const ammoMap = new Map<string, GunAmmo>();
    const fireMap = new Map<string, GunFireMode>();
    const ammoPerCaliber = new Map<string, GunAmmo[]>();
    const registerAmmo = (ammo: GunAmmo, fallbackName: string, caliberHint?: string | number) => {
      const label = (ammo.name ?? fallbackName).toString().toLowerCase();
      const key = `${label}-${ammo.ammoType || ""}`;
      if (!ammoMap.has(key)) ammoMap.set(key, deepClone(ammo));
      const caliberSource =
        caliberHint ?? (typeof ammo.caliber === "string" ? ammo.caliber : undefined) ?? "generic";
      const calKey = caliberSource.toString().toLowerCase();
      const bucket = ammoPerCaliber.get(calKey) ?? [];
      bucket.push(deepClone(ammo));
      ammoPerCaliber.set(calKey, bucket);
      const genericBucket = ammoPerCaliber.get("generic") ?? [];
      genericBucket.push(deepClone(ammo));
      ammoPerCaliber.set("generic", genericBucket);
    };

    const registerFire = (mode: GunFireMode, fallbackName: string) => {
      const key = (mode.name ?? fallbackName).toString().toLowerCase();
      if (!fireMap.has(key)) fireMap.set(key, deepClone(mode));
    };

    this.hostAmmoTemplates.forEach((ammo, index) => {
      registerAmmo(ammo, `hostAmmo${index}`, typeof ammo.caliber === "string" ? ammo.caliber : undefined);
    });

    this.hostFireTemplates.forEach((mode, index) => {
      registerFire(mode, `hostMode${index}`);
    });

    this.fireLibraryTemplates.forEach((mode, index) => {
      registerFire(mode, `libraryMode${index}`);
    });

    units.forEach((unit) => {
      (unit.guns || []).forEach((gun) => {
        (gun.ammoTypes || []).forEach((ammo, index) => {
          registerAmmo(ammo, `unitAmmo${index}`, gun.caliber);
        });
        (gun.fireModes || []).forEach((mode, index) => {
          registerFire(mode, `unitMode${index}`);
        });
      });
    });
    this.ammoTemplates = Array.from(ammoMap.values());
    this.fireTemplates = Array.from(fireMap.values());
    this.ammoLibraryByCaliber = ammoPerCaliber;
  }
}

