import type { AmmoTemplate, FireModeTemplate, WeaponTagMap, WeaponTemplate } from "../types";
import { deepClone } from "../lib/helpers";
import { weaponLibraryService } from "../services/weaponLibraryService";
import { ammoLibraryService } from "../services/ammoLibraryService";
import { weaponTagService } from "../services/weaponTagService";
import { fireModeTemplateService } from "../services/fireModeTemplateService";
import { TRAJECTORY_OPTIONS, WEAPON_TRAIT_GROUPS } from "../config/weaponOptions";

const createWeaponTemplate = (): WeaponTemplate => ({
  name: "Untitled Weapon",
  category: "",
  caliber: "",
  range: "",
  muzzleVelocity: "",
  dispersion: "",
  barrelLength: "",
  reloadSpeed: "",
  targetAcquisition: "",
  ammoTypes: [],
  fireModes: [],
  trajectories: [],
  traits: [],
  notes: "",
});

const createAmmoTemplate = (): AmmoTemplate => ({
  name: "New Template",
  caliber: "",
  caliberDesc: "",
  ammoType: "",
  penetration: "",
  heDeadliness: "",
  dispersion: "",
  rangeMod: "",
  grain: "",
  notes: "",
  airburst: false,
  subCount: "",
  subDamage: "",
  subPenetration: "",
  fps: "",
});

const createFireTemplate = (): FireModeTemplate => ({
  name: "New Mode",
  rounds: "",
  minRange: "",
  maxRange: "",
  cooldown: "",
  ammoRef: "",
  notes: "",
});

type TagScope = "categories" | "calibers";
type TagEntry = { id: string; name: string; color: string };
type WeaponAmmoEntry = NonNullable<WeaponTemplate["ammoTypes"]>[number];
type WeaponFireModeEntry = NonNullable<WeaponTemplate["fireModes"]>[number];

export class WeaponWorkbench {
  private root: HTMLElement;
  private weapons: WeaponTemplate[] = [];
  private ammo: AmmoTemplate[] = [];
  private fireTemplates: FireModeTemplate[] = [];
  private tags: WeaponTagMap = { categories: {}, calibers: {} };
  private tagDraft: Record<TagScope, TagEntry[]> = { categories: [], calibers: [] };

  private selectedWeapon = 0;
  private selectedAmmo = 0;
  private selectedFire = 0;
  private weaponSearchTerm = "";
  private ammoSearchTerm = "";
  private fireSearchTerm = "";

  private weaponListEl!: HTMLElement;
  private weaponFormEl!: HTMLFormElement;
  private weaponStatusEl!: HTMLElement;
  private weaponSearchInput!: HTMLInputElement;

  private ammoListEl!: HTMLElement;
  private ammoFormEl!: HTMLFormElement;
  private ammoStatusEl!: HTMLElement;
  private ammoSearchInput!: HTMLInputElement;

  private fireListEl!: HTMLElement;
  private fireFormEl!: HTMLFormElement;
  private fireStatusEl!: HTMLElement;
  private fireSearchInput!: HTMLInputElement;

  private categoryTagListEl!: HTMLElement;
  private caliberTagListEl!: HTMLElement;
  private tagStatusEl!: HTMLElement;

  private weaponAmmoListEl!: HTMLElement;
  private weaponFireListEl!: HTMLElement;
  private weaponAmmoImportSelect!: HTMLSelectElement;
  private weaponFireImportSelect!: HTMLSelectElement;
  private weaponTrajectoryWrapEl!: HTMLElement;
  private weaponTraitWrapEl!: HTMLElement;
  private weaponCategoryTagListEl!: HTMLDataListElement;
  private weaponCaliberTagListEl!: HTMLDataListElement;
  private weaponAmmoBallisticUpdaters: Array<() => void> = [];

  constructor(root: HTMLElement) {
    this.root = root;
  }

  init(): void {
    this.renderLayout();
    this.cacheElements();
    this.bindEvents();

    weaponLibraryService.subscribe((weapons) => {
      this.weapons = deepClone(weapons);
      if (!this.weapons.length) {
        this.weapons = [createWeaponTemplate()];
      }
      if (this.selectedWeapon >= this.weapons.length) {
        this.selectedWeapon = Math.max(0, this.weapons.length - 1);
      }
      this.renderWeaponList();
      this.populateWeaponForm();
    });

    ammoLibraryService.subscribe((templates) => {
      this.ammo = deepClone(templates);
      if (!this.ammo.length) {
        this.ammo = [createAmmoTemplate()];
      }
      if (this.selectedAmmo >= this.ammo.length) {
        this.selectedAmmo = Math.max(0, this.ammo.length - 1);
      }
      this.renderAmmoList();
      this.populateAmmoForm();
      this.populateWeaponAmmoImport();
    });

    weaponTagService.subscribe((tags) => {
      this.tags = tags;
      this.tagDraft = {
        categories: this.mapToEntries(tags.categories),
        calibers: this.mapToEntries(tags.calibers),
      };
      this.renderTagLists();
      this.renderWeaponTagSuggestions();
    });

    fireModeTemplateService.subscribe((templates) => {
      this.fireTemplates = deepClone(templates);
      if (!this.fireTemplates.length) {
        this.fireTemplates = [createFireTemplate()];
      }
      if (this.selectedFire >= this.fireTemplates.length) {
        this.selectedFire = Math.max(0, this.fireTemplates.length - 1);
      }
      this.renderFireList();
      this.populateFireForm();
      this.populateWeaponFireImport();
    });

    weaponLibraryService.loadWeapons().catch((error) => {
      this.setWeaponStatus(error instanceof Error ? error.message : String(error), "error");
    });
    ammoLibraryService.loadTemplates().catch((error) => {
      this.setAmmoStatus(error instanceof Error ? error.message : String(error), "error");
    });
    fireModeTemplateService.loadTemplates().catch((error) => {
      this.setFireStatus(error instanceof Error ? error.message : String(error), "error");
    });
    weaponTagService.loadTags().catch((error) => {
      this.setTagStatus(error instanceof Error ? error.message : String(error), "error");
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="weapon-workbench">
        <section class="panel">
          <div class="panel-heading">
            <h3>Weapon Library</h3>
            <div class="header-actions">
              <button type="button" class="ghost" data-action="weapon-new">+ Weapon</button>
              <button type="button" class="primary" data-action="weapon-save-all">Save weapons</button>
            </div>
          </div>
          <div class="split-layout">
            <div class="list-pane">
              <div class="list-actions">
                <input type="search" placeholder="Search weapons" data-role="weapon-search" />
              </div>
              <div class="list-scroll" data-role="weapon-list"></div>
            </div>
            <form class="detail-pane weapon-form" data-role="weapon-form">
              <datalist id="weapon-category-tags" data-role="weapon-category-tags"></datalist>
              <datalist id="weapon-caliber-tags" data-role="weapon-caliber-tags"></datalist>
              <div class="grid-3">
                <div class="field">
                  <label>Name</label>
                  <input name="weapon-name" required />
                </div>
                <div class="field">
                  <label>Category</label>
                  <input name="weapon-category" list="weapon-category-tags" />
                </div>
                <div class="field">
                  <label>Caliber</label>
                  <input name="weapon-caliber" list="weapon-caliber-tags" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Range</label>
                  <input name="weapon-range" />
                </div>
                <div class="field">
                  <label>Muzzle velocity</label>
                  <input name="weapon-mv" />
                </div>
                <div class="field">
                  <label>Dispersion</label>
                  <input name="weapon-dispersion" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Barrel length</label>
                  <input name="weapon-barrel" />
                </div>
                <div class="field">
                  <label>Reload speed</label>
                  <input name="weapon-reload" />
                </div>
                <div class="field">
                  <label>Target acquisition</label>
                  <input name="weapon-acquisition" />
                </div>
              </div>
              <div class="chip-field-row">
                <div class="chip-field">
                  <span class="label">Firing trajectories</span>
                  <div class="chip-wrap" data-role="weapon-trajectories"></div>
                </div>
                <div class="chip-field">
                  <span class="label">Weapon traits</span>
                  <div class="chip-wrap trait-wrap" data-role="weapon-traits"></div>
                </div>
              </div>
              <div class="field">
                <label>Notes</label>
                <textarea name="weapon-notes" rows="3"></textarea>
              </div>
              <div class="subpanel">
                <div class="subpanel-heading">
                  <strong>Ammo types</strong>
                  <div class="header-actions compact">
                    <select data-role="weapon-ammo-import" class="ghost small">
                      <option value="">From templates...</option>
                    </select>
                    <button type="button" class="ghost small" data-action="weapon-ammo-add">Add ammo</button>
                    <button type="button" class="ghost small" data-action="weapon-ammo-collapse">Collapse</button>
                  </div>
                </div>
                <div class="subpanel-body">
                  <div class="subpanel-list" data-role="weapon-ammo-list"></div>
                </div>
              </div>
              <div class="subpanel">
                <div class="subpanel-heading">
                  <strong>Fire modes</strong>
                  <div class="header-actions compact">
                    <select data-role="weapon-fire-import" class="ghost small">
                      <option value="">From templates...</option>
                    </select>
                    <button type="button" class="ghost small" data-action="weapon-fire-add">Add fire mode</button>
                    <button type="button" class="ghost small" data-action="weapon-fire-collapse">Collapse</button>
                  </div>
                </div>
                <div class="subpanel-body">
                  <div class="subpanel-list" data-role="weapon-fire-list"></div>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="ghost danger" data-action="weapon-delete">Delete</button>
                <button type="submit" class="primary">Apply changes</button>
              </div>
            </form>
          </div>
          <div class="status-bar" data-role="weapon-status">Load weapon data to begin.</div>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <h3>Ammo Templates</h3>
            <div class="header-actions">
              <button type="button" class="ghost" data-action="ammo-new">+ Template</button>
              <button type="button" class="primary" data-action="ammo-save-all">Save ammo</button>
            </div>
          </div>
          <div class="split-layout">
            <div class="list-pane">
              <div class="list-actions">
                <input type="search" placeholder="Search ammo" data-role="ammo-search" />
              </div>
              <div class="list-scroll" data-role="ammo-list"></div>
            </div>
            <form class="detail-pane" data-role="ammo-form">
              <div class="grid-3">
                <div class="field">
                  <label>Name</label>
                  <input name="ammo-name" required />
                </div>
                <div class="field">
                  <label>Caliber</label>
                  <input name="ammo-caliber" required />
                </div>
                <div class="field">
                  <label>Caliber desc</label>
                  <input name="ammo-caliber-desc" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Type</label>
                  <input name="ammo-type" />
                </div>
                <div class="field">
                  <label>Penetration</label>
                  <input name="ammo-pen" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>HE deadliness</label>
                  <input name="ammo-he" />
                </div>
                <div class="field">
                  <label>Dispersion</label>
                  <input name="ammo-dispersion" />
                </div>
                <div class="field">
                  <label>Range modifier</label>
                  <input name="ammo-range-mod" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Grain</label>
                  <input name="ammo-grain" />
                </div>
                <div class="field">
                  <label>FPS</label>
                  <input name="ammo-fps" />
                </div>
                <div class="field toggle-field">
                  <label>Airburst</label>
                  <label class="toggle-pill">
                    <input type="checkbox" name="ammo-airburst" />
                    <span class="toggle-track"></span>
                    <span class="toggle-label">Enabled</span>
                  </label>
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Sub munition count</label>
                  <input name="ammo-sub-count" />
                </div>
                <div class="field">
                  <label>Sub munition damage</label>
                  <input name="ammo-sub-damage" />
                </div>
                <div class="field">
                  <label>Sub munition penetration</label>
                  <input name="ammo-sub-pen" />
                </div>
              </div>
              <div class="field">
                <label>Notes</label>
                <textarea name="ammo-notes" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="ghost danger" data-action="ammo-delete">Delete</button>
                <button type="submit" class="primary">Apply changes</button>
              </div>
            </form>
          </div>
          <div class="status-bar" data-role="ammo-status">Synchronize ammo templates to edit.</div>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <h3>Fire Mode Templates</h3>
            <div class="header-actions">
              <button type="button" class="ghost" data-action="fire-new">+ Mode</button>
              <button type="button" class="primary" data-action="fire-save-all">Save modes</button>
            </div>
          </div>
          <div class="split-layout">
            <div class="list-pane">
              <div class="list-actions">
                <input type="search" placeholder="Search fire modes" data-role="fire-search" />
              </div>
              <div class="list-scroll" data-role="fire-list"></div>
            </div>
            <form class="detail-pane" data-role="fire-form">
              <div class="grid-3">
                <div class="field">
                  <label>Name</label>
                  <input name="fire-name" required />
                </div>
                <div class="field">
                  <label>Rounds per burst</label>
                  <input name="fire-rounds" type="number" min="0" step="1" />
                </div>
                <div class="field">
                  <label>Min range (m)</label>
                  <input name="fire-min-range" type="number" min="0" step="0.1" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Max range (m)</label>
                  <input name="fire-max-range" type="number" min="0" step="0.1" />
                </div>
                <div class="field">
                  <label>Cooldown (s)</label>
                  <input name="fire-cooldown" type="number" min="0" step="0.1" />
                </div>
                <div class="field">
                  <label>Ammo reference</label>
                  <input name="fire-ammo" />
                </div>
              </div>
              <div class="field">
                <label>Notes</label>
                <textarea name="fire-notes" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="ghost danger" data-action="fire-delete">Delete</button>
                <button type="submit" class="primary">Apply changes</button>
              </div>
            </form>
          </div>
          <div class="status-bar" data-role="fire-status">Draft firing solutions for reuse.</div>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <h3>Weapon Tags</h3>
            <div class="header-actions">
              <button type="button" class="primary" data-action="tags-save">Save tags</button>
            </div>
          </div>
          <div class="tag-grid">
            <div>
              <h4>Categories</h4>
              <div data-role="tag-categories"></div>
              <button type="button" class="ghost" data-action="add-tag" data-scope="categories">Add category tag</button>
            </div>
            <div>
              <h4>Calibers</h4>
              <div data-role="tag-calibers"></div>
              <button type="button" class="ghost" data-action="add-tag" data-scope="calibers">Add caliber tag</button>
            </div>
          </div>
          <div class="status-bar" data-role="tag-status">Define colors for quick filtering.</div>
        </section>
      </div>
    `;
  }

  private cacheElements(): void {
    this.weaponListEl = this.root.querySelector<HTMLElement>('[data-role="weapon-list"]')!;
    this.weaponFormEl = this.root.querySelector<HTMLFormElement>('[data-role="weapon-form"]')!;
    this.weaponStatusEl = this.root.querySelector<HTMLElement>('[data-role="weapon-status"]')!;
    this.weaponSearchInput = this.root.querySelector<HTMLInputElement>('[data-role="weapon-search"]')!;
    this.ammoListEl = this.root.querySelector<HTMLElement>('[data-role="ammo-list"]')!;
    this.ammoFormEl = this.root.querySelector<HTMLFormElement>('[data-role="ammo-form"]')!;
    this.ammoStatusEl = this.root.querySelector<HTMLElement>('[data-role="ammo-status"]')!;
    this.ammoSearchInput = this.root.querySelector<HTMLInputElement>('[data-role="ammo-search"]')!;
    this.fireListEl = this.root.querySelector<HTMLElement>('[data-role="fire-list"]')!;
    this.fireSearchInput = this.root.querySelector<HTMLInputElement>('[data-role="fire-search"]')!;
    this.fireFormEl = this.root.querySelector<HTMLFormElement>('[data-role="fire-form"]')!;
    this.fireStatusEl = this.root.querySelector<HTMLElement>('[data-role="fire-status"]')!;
    this.categoryTagListEl = this.root.querySelector<HTMLElement>('[data-role="tag-categories"]')!;
    this.caliberTagListEl = this.root.querySelector<HTMLElement>('[data-role="tag-calibers"]')!;
    this.tagStatusEl = this.root.querySelector<HTMLElement>('[data-role="tag-status"]')!;
    this.weaponAmmoListEl = this.root.querySelector<HTMLElement>('[data-role="weapon-ammo-list"]')!;
    this.weaponFireListEl = this.root.querySelector<HTMLElement>('[data-role="weapon-fire-list"]')!;
    this.weaponAmmoImportSelect = this.root.querySelector<HTMLSelectElement>('[data-role="weapon-ammo-import"]')!;
    this.weaponFireImportSelect = this.root.querySelector<HTMLSelectElement>('[data-role="weapon-fire-import"]')!;
    this.weaponTrajectoryWrapEl = this.root.querySelector<HTMLElement>('[data-role="weapon-trajectories"]')!;
    this.weaponTraitWrapEl = this.root.querySelector<HTMLElement>('[data-role="weapon-traits"]')!;
    this.weaponCategoryTagListEl = this.root.querySelector<HTMLDataListElement>('[data-role="weapon-category-tags"]')!;
    this.weaponCaliberTagListEl = this.root.querySelector<HTMLDataListElement>('[data-role="weapon-caliber-tags"]')!;
    this.populateWeaponAmmoImport();
    this.populateWeaponFireImport();
  }

  private bindEvents(): void {
    this.weaponListEl.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-index]');
      if (!button) return;
      this.selectedWeapon = Number(button.dataset.index);
      this.populateWeaponForm();
      this.renderWeaponList();
    });

    this.weaponFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.applyWeaponChanges();
    });

    this.ammoListEl.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-index]');
      if (!button) return;
      this.selectedAmmo = Number(button.dataset.index);
      this.populateAmmoForm();
      this.renderAmmoList();
    });

    this.ammoFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.applyAmmoChanges();
    });

    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-airburst"]')?.addEventListener("change", () => {
      this.syncAmmoTemplateAirburstFields();
    });

    this.fireListEl.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-index]');
      if (!button) return;
      this.selectedFire = Number(button.dataset.index);
      this.populateFireForm();
      this.renderFireList();
    });

    this.fireFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.applyFireChanges();
    });

    this.root.addEventListener("click", (event) => this.handleButtonActions(event));
    this.root.addEventListener("input", (event) => this.handleTagInput(event));

    this.weaponSearchInput.addEventListener("input", (event) => {
      this.weaponSearchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.renderWeaponList();
    });

    this.ammoSearchInput.addEventListener("input", (event) => {
      this.ammoSearchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.renderAmmoList();
    });

    this.fireSearchInput.addEventListener("input", (event) => {
      this.fireSearchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.renderFireList();
    });

    this.weaponAmmoImportSelect.addEventListener("change", () => {
      const index = Number(this.weaponAmmoImportSelect.value);
      if (!Number.isNaN(index)) {
        const template = this.ammo[index];
        if (template) {
          this.appendWeaponAmmoRow(deepClone(template));
          this.refreshWeaponFireAmmoOptions();
        }
      }
      this.weaponAmmoImportSelect.value = "";
    });

    this.weaponFireImportSelect.addEventListener("change", () => {
      const index = Number(this.weaponFireImportSelect.value);
      if (!Number.isNaN(index)) {
        const template = this.fireTemplates[index];
        if (template) {
          this.appendWeaponFireRow(deepClone(template));
          this.refreshWeaponFireAmmoOptions();
        }
      }
      this.weaponFireImportSelect.value = "";
    });

    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-caliber"]')?.addEventListener("input", () => {
      this.refreshWeaponAmmoCaliberAutoFill();
      this.weaponAmmoBallisticUpdaters.forEach((fn) => fn());
    });

    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-barrel"]')?.addEventListener("input", () => {
      this.weaponAmmoBallisticUpdaters.forEach((fn) => fn());
    });
  }

  private handleButtonActions(event: Event): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    switch (action) {
      case "weapon-new":
        this.weapons.push(createWeaponTemplate());
        this.selectedWeapon = this.weapons.length - 1;
        this.renderWeaponList();
        this.populateWeaponForm();
        break;
      case "weapon-delete":
        if (this.weapons.length > 1) {
          this.weapons.splice(this.selectedWeapon, 1);
          this.selectedWeapon = Math.max(0, this.selectedWeapon - 1);
          this.renderWeaponList();
          this.populateWeaponForm();
        }
        break;
      case "weapon-save-all":
        this.applyWeaponChanges();
        weaponLibraryService
          .saveWeapons(this.weapons)
          .then(() => this.setWeaponStatus("Weapon library saved.", "success"))
          .catch((error) => this.setWeaponStatus(error instanceof Error ? error.message : String(error), "error"));
        break;
      case "weapon-ammo-add":
        this.appendWeaponAmmoRow();
        this.refreshWeaponFireAmmoOptions();
        break;
      case "weapon-ammo-collapse":
        this.toggleSubpanel(button);
        break;
      case "weapon-fire-add":
        this.appendWeaponFireRow();
        this.refreshWeaponFireAmmoOptions();
        break;
      case "weapon-fire-collapse":
        this.toggleSubpanel(button);
        break;
      case "ammo-new":
        this.ammo.push(createAmmoTemplate());
        this.selectedAmmo = this.ammo.length - 1;
        this.renderAmmoList();
        this.populateAmmoForm();
        break;
      case "ammo-delete":
        if (this.ammo.length > 1) {
          this.ammo.splice(this.selectedAmmo, 1);
          this.selectedAmmo = Math.max(0, this.selectedAmmo - 1);
          this.renderAmmoList();
          this.populateAmmoForm();
        }
        break;
      case "ammo-save-all":
        this.applyAmmoChanges();
        ammoLibraryService
          .saveTemplates(this.ammo)
          .then(() => this.setAmmoStatus("Ammo templates saved.", "success"))
          .catch((error) => this.setAmmoStatus(error instanceof Error ? error.message : String(error), "error"));
        break;
      case "fire-new":
        this.fireTemplates.push(createFireTemplate());
        this.selectedFire = this.fireTemplates.length - 1;
        this.renderFireList();
        this.populateFireForm();
        break;
      case "fire-delete":
        if (this.fireTemplates.length > 1) {
          this.fireTemplates.splice(this.selectedFire, 1);
          this.selectedFire = Math.max(0, this.selectedFire - 1);
          this.renderFireList();
          this.populateFireForm();
        }
        break;
      case "fire-save-all":
        this.applyFireChanges();
        fireModeTemplateService
          .saveTemplates(this.fireTemplates)
          .then(() => this.setFireStatus("Fire mode templates saved.", "success"))
          .catch((error) => this.setFireStatus(error instanceof Error ? error.message : String(error), "error"));
        break;
      case "add-tag": {
        const scope = (button.dataset.scope as TagScope) || "categories";
        this.tagDraft[scope].push({ id: this.makeId(), name: "", color: "#5bc0ff" });
        this.renderTagLists();
        break;
      }
      case "remove-tag": {
        const scope = (button.dataset.scope as TagScope) || "categories";
        const id = button.dataset.id;
        this.tagDraft[scope] = this.tagDraft[scope].filter((entry) => entry.id !== id);
        this.renderTagLists();
        break;
      }
      case "tags-save": {
        const payload = this.buildTagPayload();
        weaponTagService
          .saveTags(payload)
          .then(() => this.setTagStatus("Tags saved.", "success"))
          .catch((error) => this.setTagStatus(error instanceof Error ? error.message : String(error), "error"));
        break;
      }
      default:
        break;
    }
  }

  private buildTagPayload(): WeaponTagMap {
    const toMap = (entries: TagEntry[]): Record<string, string> => {
      return entries.reduce<Record<string, string>>((acc, entry) => {
        const key = entry.name.trim();
        if (!key) return acc;
        acc[key] = entry.color || "#5bc0ff";
        return acc;
      }, {});
    };
    return {
      categories: toMap(this.tagDraft.categories),
      calibers: toMap(this.tagDraft.calibers),
    };
  }

  private renderWeaponList(): void {
    this.weaponListEl.innerHTML = "";
    this.weapons.forEach((weapon, index) => {
      if (
        this.weaponSearchTerm &&
        !(weapon.name || "")
          .toLowerCase()
          .includes(this.weaponSearchTerm) &&
        !(weapon.category || "")
          .toLowerCase()
          .includes(this.weaponSearchTerm)
      ) {
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.index = index.toString();
      button.className = `list-pill${index === this.selectedWeapon ? " active" : ""}`;
      button.innerHTML = `
        <span class="title">${weapon.name || "Untitled"}</span>
        <span class="meta">${weapon.category || "Unknown"}</span>
      `;
      this.weaponListEl.appendChild(button);
    });
  }

  private populateWeaponForm(): void {
    const weapon = this.weapons[this.selectedWeapon] ?? createWeaponTemplate();
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-name"]')!.value = weapon.name || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-category"]')!.value = weapon.category || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-caliber"]')!.value = weapon.caliber || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-range"]')!.value = weapon.range?.toString() || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-mv"]')!.value = weapon.muzzleVelocity?.toString() || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-dispersion"]')!.value = weapon.dispersion?.toString() || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-barrel"]')!.value = weapon.barrelLength?.toString() || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-reload"]')!.value = weapon.reloadSpeed?.toString() || "";
    this.weaponFormEl.querySelector<HTMLInputElement>('[name="weapon-acquisition"]')!.value = weapon.targetAcquisition?.toString() || "";
    this.renderWeaponTrajectoryChips(weapon.trajectories || []);
    this.renderWeaponTraitChips(weapon.traits || []);
    this.weaponFormEl.querySelector<HTMLTextAreaElement>('[name="weapon-notes"]')!.value = weapon.notes || "";
    this.renderWeaponAmmoRows(weapon.ammoTypes || []);
    this.renderWeaponFireRows(weapon.fireModes || []);
  }

  private applyWeaponChanges(): void {
    const weapon = this.weapons[this.selectedWeapon] ?? createWeaponTemplate();
    const data = new FormData(this.weaponFormEl);
    weapon.name = (data.get("weapon-name")?.toString().trim() || "Untitled Weapon").trim();
    weapon.category = data.get("weapon-category")?.toString().trim() || "";
    weapon.caliber = data.get("weapon-caliber")?.toString().trim() || "";
    weapon.range = data.get("weapon-range")?.toString().trim() || "";
    weapon.muzzleVelocity = data.get("weapon-mv")?.toString().trim() || "";
    weapon.dispersion = data.get("weapon-dispersion")?.toString().trim() || "";
    weapon.barrelLength = data.get("weapon-barrel")?.toString().trim() || "";
    weapon.reloadSpeed = data.get("weapon-reload")?.toString().trim() || "";
    weapon.targetAcquisition = data.get("weapon-acquisition")?.toString().trim() || "";
    weapon.trajectories = this.collectChipSelections(this.weaponTrajectoryWrapEl);
    weapon.traits = this.collectChipSelections(this.weaponTraitWrapEl);
    weapon.notes = data.get("weapon-notes")?.toString();
    weapon.ammoTypes = this.collectWeaponAmmoRows();
    weapon.fireModes = this.collectWeaponFireRows();

    this.weapons[this.selectedWeapon] = weapon;
    this.renderWeaponList();
  }

  private renderWeaponAmmoRows(ammoList: WeaponAmmoEntry[]): void {
    if (!this.weaponAmmoListEl) return;
    this.weaponAmmoListEl.innerHTML = "";
    this.weaponAmmoBallisticUpdaters = [];
    const source = ammoList && ammoList.length ? ammoList : [undefined];
    source.forEach((ammo) => this.appendWeaponAmmoRow(ammo));
    this.refreshWeaponFireAmmoOptions();
  }

  private renderWeaponFireRows(modes: WeaponFireModeEntry[]): void {
    if (!this.weaponFireListEl) return;
    this.weaponFireListEl.innerHTML = "";
    const source = modes && modes.length ? modes : [undefined];
    source.forEach((mode) => this.appendWeaponFireRow(mode));
    this.refreshWeaponFireAmmoOptions();
  }

  private toggleSubpanel(button: HTMLButtonElement): void {
    const panel = button.closest<HTMLElement>(".subpanel");
    if (!panel) return;
    panel.classList.toggle("collapsed");
    button.textContent = panel.classList.contains("collapsed") ? "Expand" : "Collapse";
  }

  private collectChipSelections(container?: HTMLElement): string[] {
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLButtonElement>("[data-value]"))
      .filter((btn) => btn.classList.contains("active"))
      .map((btn) => btn.dataset.value?.trim() || "")
      .filter(Boolean);
  }

  private renderWeaponTrajectoryChips(selected: string[]): void {
    if (!this.weaponTrajectoryWrapEl) return;
    const active = new Set((selected || []).map((value) => value.toLowerCase()));
    this.weaponTrajectoryWrapEl.innerHTML = "";
    TRAJECTORY_OPTIONS.forEach((option) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-button";
      btn.dataset.chipGroup = "trajectory";
      btn.dataset.value = option.value;
      btn.textContent = option.label;
      if (active.has(option.value.toLowerCase())) {
        btn.classList.add("active");
      }
      btn.addEventListener("click", () => btn.classList.toggle("active"));
      this.weaponTrajectoryWrapEl.appendChild(btn);
    });
  }

  private renderWeaponTraitChips(selected: string[]): void {
    if (!this.weaponTraitWrapEl) return;
    const active = new Set((selected || []).map((value) => value.toLowerCase()));
    this.weaponTraitWrapEl.innerHTML = "";
    WEAPON_TRAIT_GROUPS.forEach((group, index) => {
      group.forEach((option) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip-button";
        btn.dataset.chipGroup = "trait";
        btn.dataset.value = option.value;
        btn.textContent = option.label;
        if (active.has(option.value.toLowerCase())) {
          btn.classList.add("active");
        }
        btn.addEventListener("click", () => btn.classList.toggle("active"));
        this.weaponTraitWrapEl.appendChild(btn);
      });
      if (index === 0) {
        const separator = document.createElement("span");
        separator.className = "trait-separator";
        this.weaponTraitWrapEl.appendChild(separator);
      }
    });
  }

  private appendWeaponAmmoRow(ammo?: WeaponAmmoEntry): void {
    if (!this.weaponAmmoListEl) return;
    const toValue = (value: unknown) => this.toInputValue(value);
    const row = document.createElement("div");
    row.className = "ammo-row";
    row.dataset.role = "weapon-ammo-row";
    const airburstValue = ammo?.airburst === true || ammo?.airburst === "true" ? "yes" : "no";
    row.innerHTML = `
      <div class="subgrid">
        <label>Name<input data-ammo-field="name" value="${toValue(ammo?.name)}" /></label>
        <label>Type<input data-ammo-field="ammoType" value="${toValue(ammo?.ammoType)}" /></label>
        <label>Caliber<input data-ammo-field="caliber" value="${toValue(ammo?.caliber)}" readonly tabindex="-1" /></label>
        <label>Caliber notes<input data-ammo-field="caliberDesc" value="${toValue(ammo?.caliberDesc)}" /></label>
        <label>Penetration (mm)<input data-ammo-field="penetration" type="number" step="0.1" value="${toValue(ammo?.penetration)}" /></label>
        <label>HE value<input data-ammo-field="heDeadliness" type="number" step="0.1" value="${toValue(ammo?.heDeadliness)}" /></label>
        <label>Dispersion (%)<input data-ammo-field="dispersion" type="number" step="0.1" value="${toValue(ammo?.dispersion)}" /></label>
        <label>Range delta (%)<input data-ammo-field="rangeMod" type="number" step="0.1" value="${toValue(ammo?.rangeMod)}" /></label>
        <label>Ammo/Soldier<input data-ammo-field="ammoPerSoldier" type="number" min="0" step="1" value="${toValue(ammo?.ammoPerSoldier)}" /></label>
        <label>Grain<input data-ammo-field="grain" type="number" step="0.1" value="${toValue(ammo?.grain)}" /></label>
        <label>Muzzle velocity (fps)<input data-ammo-field="fps" type="number" step="1" value="${toValue(ammo?.fps)}" /></label>
        <label>Notes<input data-ammo-field="notes" value="${toValue(ammo?.notes)}" /></label>
        <label>Airburst
          <select data-ammo-field="airburst">
            <option value="yes" ${airburstValue === "yes" ? "selected" : ""}>Yes</option>
            <option value="no" ${airburstValue === "no" ? "selected" : ""}>No</option>
          </select>
        </label>
        <label>Sub munitions (#)<input data-ammo-field="subCount" type="number" min="0" step="1" data-airburst-dependent value="${toValue(ammo?.subCount)}" /></label>
        <label>Sub damage<input data-ammo-field="subDamage" type="number" step="0.1" data-airburst-dependent value="${toValue(ammo?.subDamage)}" /></label>
        <label>Sub penetration (mm)<input data-ammo-field="subPenetration" type="number" step="0.1" data-airburst-dependent value="${toValue(ammo?.subPenetration)}" /></label>
      </div>
      <div class="row-actions">
        <button type="button" class="ghost small" data-action="remove-weapon-ammo">Remove</button>
      </div>
    `;
    const grainInput = row.querySelector<HTMLInputElement>('input[data-ammo-field="grain"]');
    const fpsInput = row.querySelector<HTMLInputElement>('input[data-ammo-field="fps"]');
    const ammoCaliberInput = row.querySelector<HTMLInputElement>('input[data-ammo-field="caliber"]');
    if (ammoCaliberInput) {
      ammoCaliberInput.readOnly = true;
      ammoCaliberInput.tabIndex = -1;
      ammoCaliberInput.classList.add("readonly");
      if (typeof ammo?.caliber === "string" && ammo.caliber.trim()) {
        ammoCaliberInput.dataset.initialCaliber = ammo.caliber.trim();
      }
      const startingValue = this.getWeaponFormCaliber() || ammoCaliberInput.dataset.initialCaliber || "";
      ammoCaliberInput.value = startingValue;
      ammoCaliberInput.placeholder = startingValue || this.getWeaponFormCaliber();
      ammoCaliberInput.dataset.initialCaliber = startingValue;
    }
    const applyBallistics = () => {
      if (!grainInput || !fpsInput) return;
      const grain = Number.parseFloat(grainInput.value || "0");
      if (Number.isNaN(grain)) return;
      const barrel = this.getWeaponFormBarrelLength();
      const caliberSource = this.getWeaponFormCaliber() || ammoCaliberInput?.dataset.initialCaliber || "";
      const velocity = this.computeAmmoFpsEstimate(caliberSource, barrel, grain);
      fpsInput.value = velocity.toString();
    };
    const removeButton = row.querySelector<HTMLButtonElement>('[data-action="remove-weapon-ammo"]');
    removeButton?.addEventListener("click", () => {
      row.remove();
      const index = this.weaponAmmoBallisticUpdaters.indexOf(applyBallistics);
      if (index >= 0) this.weaponAmmoBallisticUpdaters.splice(index, 1);
      this.refreshWeaponFireAmmoOptions();
    });
    const airburstSelect = row.querySelector<HTMLSelectElement>('select[data-ammo-field="airburst"]');
    const subInputs = row.querySelectorAll<HTMLInputElement>('[data-airburst-dependent]');
    const syncAirburst = () => {
      const enabled = airburstSelect?.value === "yes";
      subInputs.forEach((input) => {
        input.disabled = !enabled;
      });
    };
    airburstSelect?.addEventListener("change", syncAirburst);
    syncAirburst();
    row.addEventListener("input", (event) => {
      if ((event.target as HTMLElement).matches('[data-ammo-field="name"]')) {
        this.refreshWeaponFireAmmoOptions();
      }
    });
    grainInput?.addEventListener("input", applyBallistics);
    this.weaponAmmoBallisticUpdaters.push(applyBallistics);
    this.weaponAmmoListEl.appendChild(row);
    this.refreshWeaponAmmoCaliberAutoFill();
    applyBallistics();
  }

  private appendWeaponFireRow(mode?: WeaponFireModeEntry): void {
    if (!this.weaponFireListEl) return;
    const toValue = (value: unknown) => this.toInputValue(value);
    const row = document.createElement("div");
    row.className = "fire-row";
    row.dataset.role = "weapon-fire-row";
    row.innerHTML = `
      <div class="subgrid">
        <label>Name<input data-fire-field="name" value="${toValue(mode?.name)}" /></label>
        <label>Rounds / burst<input data-fire-field="rounds" type="number" min="0" step="1" value="${toValue(mode?.rounds)}" /></label>
        <label>Min range (m)<input data-fire-field="minRange" type="number" min="0" step="0.1" value="${toValue(mode?.minRange)}" /></label>
        <label>Max range (m)<input data-fire-field="maxRange" type="number" min="0" step="0.1" value="${toValue(mode?.maxRange)}" /></label>
        <label>Cooldown (s)<input data-fire-field="cooldown" type="number" min="0" step="0.1" value="${toValue(mode?.cooldown)}" /></label>
        <label>Ammo reference<select data-fire-field="ammoRef"></select></label>
        <label>Notes<input data-fire-field="notes" value="${toValue(mode?.notes)}" /></label>
      </div>
      <div class="row-actions">
        <button type="button" class="ghost small" data-action="remove-weapon-fire">Remove</button>
      </div>
    `;
    row.querySelector<HTMLButtonElement>('[data-action="remove-weapon-fire"]')?.addEventListener("click", () => {
      row.remove();
      this.refreshWeaponFireAmmoOptions();
    });
    this.weaponFireListEl.appendChild(row);
    const select = row.querySelector<HTMLSelectElement>('select[data-fire-field="ammoRef"]');
    if (select) {
      if (mode?.ammoRef) {
        select.dataset.prefill = mode.ammoRef;
      }
    }
  }

  private collectWeaponAmmoRows(): WeaponAmmoEntry[] {
    if (!this.weaponAmmoListEl) return [];
    const rows = Array.from(this.weaponAmmoListEl.querySelectorAll<HTMLElement>('[data-role="weapon-ammo-row"]'));
    return rows
      .map((row) => {
        const read = (field: string, selector = "input") =>
          (row.querySelector<HTMLInputElement | HTMLSelectElement>(`${selector}[data-ammo-field="${field}"]`)?.value || "").trim();
        const ammo: WeaponAmmoEntry = {
          name: read("name") || undefined,
          ammoType: read("ammoType") || undefined,
          caliber: read("caliber") || undefined,
          caliberDesc: read("caliberDesc") || undefined,
          penetration: read("penetration") || undefined,
          heDeadliness: read("heDeadliness") || undefined,
          dispersion: read("dispersion") || undefined,
          rangeMod: read("rangeMod") || undefined,
          ammoPerSoldier: read("ammoPerSoldier") || undefined,
          grain: read("grain") || undefined,
          fps: read("fps") || undefined,
          notes: read("notes") || undefined,
          subCount: read("subCount") || undefined,
          subDamage: read("subDamage") || undefined,
          subPenetration: read("subPenetration") || undefined,
        };
        const airburst = read("airburst", "select");
        if (airburst === "yes" || airburst === "true") ammo.airburst = true;
        else if (airburst === "no" || airburst === "false" || airburst === "") ammo.airburst = false;
        else delete ammo.airburst;
        return ammo;
      })
      .filter((ammo) => Object.values(ammo).some((value) => value !== undefined && value !== ""));
  }

  private collectWeaponFireRows(): WeaponFireModeEntry[] {
    if (!this.weaponFireListEl) return [];
    const rows = Array.from(this.weaponFireListEl.querySelectorAll<HTMLElement>('[data-role="weapon-fire-row"]'));
    return rows
      .map((row) => {
        const read = (field: string) =>
          (row.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-fire-field="${field}"]`)?.value || "").trim();
        const mode: WeaponFireModeEntry = {
          name: read("name") || undefined,
          rounds: read("rounds") || undefined,
          minRange: read("minRange") || undefined,
          maxRange: read("maxRange") || undefined,
          cooldown: read("cooldown") || undefined,
          ammoRef: read("ammoRef") || undefined,
          notes: read("notes") || undefined,
        };
        return mode;
      })
      .filter((mode) => Object.values(mode).some((value) => value !== undefined && value !== ""));
  }

  private refreshWeaponFireAmmoOptions(): void {
    if (!this.weaponFireListEl || !this.weaponAmmoListEl) return;
    const names = Array.from(this.weaponAmmoListEl.querySelectorAll<HTMLInputElement>('input[data-ammo-field="name"]'))
      .map((input) => input.value.trim())
      .filter(Boolean);
    this.weaponFireListEl.querySelectorAll<HTMLSelectElement>('select[data-fire-field="ammoRef"]').forEach((select) => {
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
      if (current && names.includes(current)) {
        select.value = current;
      } else {
        select.value = "";
        if (current) select.dataset.prefill = current;
      }
    });
  }

  private populateWeaponAmmoImport(): void {
    if (!this.weaponAmmoImportSelect) return;
    this.weaponAmmoImportSelect.innerHTML = '<option value="">From templates...</option>';
    this.ammo.forEach((template, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = `${template.name || "Template"} · ${template.caliber || "?"}`;
      this.weaponAmmoImportSelect.appendChild(option);
    });
  }

  private populateWeaponFireImport(): void {
    if (!this.weaponFireImportSelect) return;
    this.weaponFireImportSelect.innerHTML = '<option value="">From templates...</option>';
    this.fireTemplates.forEach((template, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = template.name || `Mode ${index + 1}`;
      this.weaponFireImportSelect.appendChild(option);
    });
  }

  private renderAmmoList(): void {
    this.ammoListEl.innerHTML = "";
    let rendered = 0;
    const term = this.ammoSearchTerm;
    this.ammo.forEach((template, index) => {
      if (
        term &&
        !(template.name || "").toLowerCase().includes(term) &&
        !(template.caliber || "").toLowerCase().includes(term)
      ) {
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.index = index.toString();
      button.className = `list-pill${index === this.selectedAmmo ? " active" : ""}`;
      button.innerHTML = `
        <span class="title">${template.name || "Template"}</span>
        <span class="meta">${template.caliber || "Unknown"}</span>
      `;
      this.ammoListEl.appendChild(button);
      rendered += 1;
    });
    if (!rendered) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No templates match the search.";
      this.ammoListEl.appendChild(empty);
    }
  }

  private populateAmmoForm(): void {
    const template = this.ammo[this.selectedAmmo] ?? createAmmoTemplate();
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-name"]')!.value = template.name || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-caliber"]')!.value = template.caliber || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-caliber-desc"]')!.value = template.caliberDesc || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-type"]')!.value = template.ammoType || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-pen"]')!.value = template.penetration?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-he"]')!.value = template.heDeadliness?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-dispersion"]')!.value = template.dispersion?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-range-mod"]')!.value = template.rangeMod?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-grain"]')!.value = template.grain?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-fps"]')!.value = template.fps?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-sub-count"]')!.value = template.subCount?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-sub-damage"]')!.value = template.subDamage?.toString() || "";
    this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-sub-pen"]')!.value = template.subPenetration?.toString() || "";
    (this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-airburst"]') as HTMLInputElement).checked = Boolean(template.airburst);
    this.ammoFormEl.querySelector<HTMLTextAreaElement>('[name="ammo-notes"]')!.value = template.notes || "";
    this.syncAmmoTemplateAirburstFields();
  }

  private applyAmmoChanges(): void {
    const template = this.ammo[this.selectedAmmo] ?? createAmmoTemplate();
    const data = new FormData(this.ammoFormEl);
    template.name = data.get("ammo-name")?.toString().trim() || "New Template";
    template.caliber = data.get("ammo-caliber")?.toString().trim() || "";
    template.caliberDesc = data.get("ammo-caliber-desc")?.toString().trim() || "";
    template.ammoType = data.get("ammo-type")?.toString().trim() || "";
    delete template.ammoPerSoldier;
    template.penetration = data.get("ammo-pen")?.toString().trim() || "";
    template.heDeadliness = data.get("ammo-he")?.toString().trim() || "";
    template.dispersion = data.get("ammo-dispersion")?.toString().trim() || "";
    template.rangeMod = data.get("ammo-range-mod")?.toString().trim() || "";
    template.grain = data.get("ammo-grain")?.toString().trim() || "";
    template.fps = data.get("ammo-fps")?.toString().trim() || "";
    template.subCount = data.get("ammo-sub-count")?.toString().trim() || "";
    template.subDamage = data.get("ammo-sub-damage")?.toString().trim() || "";
    template.subPenetration = data.get("ammo-sub-pen")?.toString().trim() || "";
    template.airburst = Boolean(data.get("ammo-airburst"));
    template.notes = data.get("ammo-notes")?.toString();
    this.ammo[this.selectedAmmo] = template;
    this.renderAmmoList();
  }

  private renderFireList(): void {
    this.fireListEl.innerHTML = "";
    this.fireTemplates.forEach((template, index) => {
      if (
        this.fireSearchTerm &&
        !(template.name || "").toLowerCase().includes(this.fireSearchTerm) &&
        !(template.ammoRef || "").toLowerCase().includes(this.fireSearchTerm)
      ) {
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.index = index.toString();
      button.className = `list-pill${index === this.selectedFire ? " active" : ""}`;
      button.innerHTML = `
        <span class="title">${template.name || "Mode"}</span>
        <span class="meta">${template.rounds || "-"} rnd burst</span>
      `;
      this.fireListEl.appendChild(button);
    });
  }

  private populateFireForm(): void {
    const template = this.fireTemplates[this.selectedFire] ?? createFireTemplate();
    this.fireFormEl.querySelector<HTMLInputElement>('[name="fire-name"]')!.value = template.name || "";
    this.fireFormEl.querySelector<HTMLInputElement>('[name="fire-rounds"]')!.value = template.rounds?.toString() || "";
    this.fireFormEl.querySelector<HTMLInputElement>('[name="fire-min-range"]')!.value = template.minRange?.toString() || "";
    this.fireFormEl.querySelector<HTMLInputElement>('[name="fire-max-range"]')!.value = template.maxRange?.toString() || "";
    this.fireFormEl.querySelector<HTMLInputElement>('[name="fire-cooldown"]')!.value = template.cooldown?.toString() || "";
    this.fireFormEl.querySelector<HTMLInputElement>('[name="fire-ammo"]')!.value = template.ammoRef || "";
    this.fireFormEl.querySelector<HTMLTextAreaElement>('[name="fire-notes"]')!.value = template.notes || "";
  }

  private applyFireChanges(): void {
    const template = this.fireTemplates[this.selectedFire] ?? createFireTemplate();
    const data = new FormData(this.fireFormEl);
    template.name = data.get("fire-name")?.toString().trim() || "New Mode";
    template.rounds = data.get("fire-rounds")?.toString().trim() || "";
    template.minRange = data.get("fire-min-range")?.toString().trim() || "";
    template.maxRange = data.get("fire-max-range")?.toString().trim() || "";
    template.cooldown = data.get("fire-cooldown")?.toString().trim() || "";
    template.ammoRef = data.get("fire-ammo")?.toString().trim() || "";
    template.notes = data.get("fire-notes")?.toString().trim() || "";
    this.fireTemplates[this.selectedFire] = template;
    this.renderFireList();
  }

  private syncAmmoTemplateAirburstFields(): void {
    if (!this.ammoFormEl) return;
    const toggle = this.ammoFormEl.querySelector<HTMLInputElement>('[name="ammo-airburst"]');
    const enabled = Boolean(toggle?.checked);
    ["ammo-sub-count", "ammo-sub-damage", "ammo-sub-pen"].forEach((name) => {
      const input = this.ammoFormEl.querySelector<HTMLInputElement>(`[name="${name}"]`);
      if (input) {
        input.disabled = !enabled;
      }
    });
  }

  private renderTagLists(): void {
    const makeRow = (entry: TagEntry, scope: TagScope): HTMLElement => {
      const row = document.createElement("div");
      row.className = "tag-row";
      row.innerHTML = `
        <input type="text" data-tag-field="name" data-scope="${scope}" data-id="${entry.id}" placeholder="Label" value="${entry.name}" />
        <input type="color" data-tag-field="color" data-scope="${scope}" data-id="${entry.id}" value="${entry.color}" />
        <button type="button" class="ghost" data-action="remove-tag" data-scope="${scope}" data-id="${entry.id}">Remove</button>
      `;
      return row;
    };

    this.categoryTagListEl.innerHTML = "";
    this.tagDraft.categories.forEach((entry) => {
      this.categoryTagListEl.appendChild(makeRow(entry, "categories"));
    });

    this.caliberTagListEl.innerHTML = "";
    this.tagDraft.calibers.forEach((entry) => {
      this.caliberTagListEl.appendChild(makeRow(entry, "calibers"));
    });
  }

  private getWeaponFormCaliber(): string {
    return this.weaponFormEl?.querySelector<HTMLInputElement>('[name="weapon-caliber"]')?.value.trim() || "";
  }

  private getWeaponFormBarrelLength(): number {
    const rawValue = this.weaponFormEl?.querySelector<HTMLInputElement>('[name="weapon-barrel"]')?.value || "";
    const parsed = Number.parseFloat(rawValue);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private parseCaliberMeasurement(raw?: string | null): number | undefined {
    if (!raw) return undefined;
    const normalized = raw.replace(",", ".");
    const match = normalized.match(/\d+(?:\.\d+)?/);
    if (!match) return undefined;
    const value = Number.parseFloat(match[0]);
    return Number.isNaN(value) ? undefined : value;
  }

  private computeAmmoFpsEstimate(caliberRaw: string, barrelLength: number, grain: number): number {
    const normalized = caliberRaw.replace(/\s+/g, "");
    const caliberMatch = normalized.match(/(\d{1,3})(?:[.,](\d{1,3}))?x(\d{1,3})/i);
    let diameter = this.parseCaliberMeasurement(caliberRaw) ?? 5.56;
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
  }

  private refreshWeaponAmmoCaliberAutoFill(): void {
    if (!this.weaponAmmoListEl) return;
    const inherited = this.getWeaponFormCaliber();
    this.weaponAmmoListEl.querySelectorAll<HTMLInputElement>('input[data-ammo-field="caliber"]').forEach((input) => {
      const fallback = input.dataset.initialCaliber?.trim() || "";
      const value = inherited || fallback;
      input.value = value;
      input.placeholder = value || inherited;
      input.dataset.initialCaliber = value;
    });
  }

  private renderWeaponTagSuggestions(): void {
    if (this.weaponCategoryTagListEl) {
      this.weaponCategoryTagListEl.innerHTML = this.buildTagOptionMarkup(Object.keys(this.tags.categories || {}));
    }
    if (this.weaponCaliberTagListEl) {
      this.weaponCaliberTagListEl.innerHTML = this.buildTagOptionMarkup(Object.keys(this.tags.calibers || {}));
    }
  }

  private buildTagOptionMarkup(values: string[]): string {
    if (!values || !values.length) return "";
    return [...values]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => `<option value="${value}"></option>`)
      .join("");
  }

  private setWeaponStatus(message: string, level: "info" | "success" | "error" = "info"): void {
    this.setStatus(this.weaponStatusEl, message, level);
  }

  private setAmmoStatus(message: string, level: "info" | "success" | "error" = "info"): void {
    this.setStatus(this.ammoStatusEl, message, level);
  }

  private setFireStatus(message: string, level: "info" | "success" | "error" = "info"): void {
    this.setStatus(this.fireStatusEl, message, level);
  }

  private setTagStatus(message: string, level: "info" | "success" | "error" = "info"): void {
    this.setStatus(this.tagStatusEl, message, level);
  }

  private setStatus(target: HTMLElement, message: string, level: "info" | "success" | "error"): void {
    target.textContent = message;
    if (level === "info") {
      delete target.dataset.tone;
    } else {
      target.dataset.tone = level;
    }
  }

  private toInputValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  private handleTagInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target || !target.dataset.tagField) return;
    const scope = (target.dataset.scope as TagScope) || "categories";
    const id = target.dataset.id;
    const entry = this.tagDraft[scope].find((row) => row.id === id);
    if (!entry) return;
    if (target.dataset.tagField === "name") {
      entry.name = target.value;
    } else if (target.dataset.tagField === "color") {
      entry.color = target.value;
    }
  }

  private mapToEntries(map?: Record<string, string>): TagEntry[] {
    if (!map) return [];
    return Object.entries(map).map(([name, color]) => ({ id: this.makeId(), name, color }));
  }

  private makeId(): string {
    return Math.random().toString(36).slice(2, 9);
  }
}
