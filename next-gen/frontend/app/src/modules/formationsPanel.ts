import type { Formation, FormationCategory } from "../types";
import { formationService } from "../services/formationService";
import { unitService } from "../services/unitService";

const createFormation = (): Formation => ({
  name: "New Formation",
  description: "",
  image: "",
  categories: [],
});

export class FormationsPanel {
  private root: HTMLElement;
  private listEl!: HTMLElement;
  private formEl!: HTMLFormElement;
  private statusEl!: HTMLElement;
  private categoryListEl!: HTMLElement;
  private unitsCountEl!: HTMLElement;
  private formations: Formation[] = [];
  private unitOptions: { id: number; label: string }[] = [];
  private subSelectEl!: HTMLSelectElement;
  private formationOptions: { id: number; name: string }[] = [];
  private selectedIndex = 0;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  init(): void {
    this.renderLayout();
    this.cacheElements();
    this.bindEvents();
    formationService.subscribe((formations) => {
      this.formations = formations.length ? formations : [createFormation()];
      this.formationOptions = formations.map((formation, index) => ({
        id: formation.id ?? index + 1,
        name: formation.name || `Formation ${index + 1}`,
      }));
      this.renderList();
      this.syncSelection();
    });
    unitService.subscribe((units) => {
      this.unitOptions = units.map((unit, index) => ({
        id: unit.id ?? index,
        label: unit.name || `Unit ${index + 1}`,
      }));
      this.renderCategories();
    });
    formationService.loadFormations().catch((error) => {
      this.setStatus(error instanceof Error ? error.message : String(error), "error");
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="panel formations-panel">
        <div class="panel-heading">
          <h3>Formations</h3>
          <p class="muted">Capture compositions and assign unit categories.</p>
        </div>
        <div class="split-layout">
          <aside class="list-pane">
            <div class="list-actions">
              <button type="button" class="ghost" data-action="add-formation">+ Formation</button>
            </div>
            <div class="list-scroll" data-role="formation-list"></div>
          </aside>
          <section class="detail-pane">
            <form data-role="formation-form" class="grid-3">
              <div class="field">
                <label>Name</label>
                <input name="name" autocomplete="off" />
              </div>
              <div class="field">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
              </div>
              <div class="field">
                <label>Image</label>
                <input name="image" placeholder="formations/path.png" />
              </div>
              <div class="field full">
                <div class="panel-heading compact">
                  <label>Categories</label>
                  <button type="button" class="ghost" data-action="add-category">Add category</button>
                </div>
                <div class="category-editor" data-role="category-editor"></div>
              </div>
              <div class="field full">
                <label>Sub formations</label>
                <select data-role="sub-formations" multiple size="6"></select>
              </div>
              <div class="field full">
                <button type="submit" class="primary">Save formation</button>
              </div>
            </form>
            <div class="status-bar compact" data-role="formation-status">Select a formation.</div>
            <div class="helper-text">
              Unique units assigned: <strong data-role="formation-units-count">0</strong>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  private cacheElements(): void {
    this.listEl = this.root.querySelector<HTMLElement>('[data-role="formation-list"]')!;
    this.formEl = this.root.querySelector<HTMLFormElement>('[data-role="formation-form"]')!;
    this.statusEl = this.root.querySelector<HTMLElement>('[data-role="formation-status"]')!;
    this.categoryListEl = this.root.querySelector<HTMLElement>('[data-role="category-editor"]')!;
    this.unitsCountEl = this.root.querySelector<HTMLElement>('[data-role="formation-units-count"]')!;
    this.subSelectEl = this.root.querySelector<HTMLSelectElement>('[data-role="sub-formations"]')!;
  }

  private bindEvents(): void {
    this.listEl.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-index]");
      if (!button) return;
      this.selectedIndex = Number(button.dataset.index);
      this.syncSelection();
    });
    this.formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.saveFormation();
    });
    this.root.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      if (action === "add-formation") {
        this.addFormation();
      } else if (action === "add-category") {
        this.appendCategoryRow();
      } else if (action === "remove-category") {
        button.closest(".category-row")?.remove();
        this.updateUnitsCount(this.collectCategoriesFromDom());
      }
    });
  }

  private addFormation(): void {
    this.formations.push(createFormation());
    this.selectedIndex = this.formations.length - 1;
    this.renderList();
    this.syncSelection();
  }

  private renderList(): void {
    if (!this.formations.length) {
      this.listEl.innerHTML = '<p class="empty">No formations found.</p>';
      return;
    }
    this.listEl.innerHTML = "";
    this.formations.forEach((formation, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.index = index.toString();
      btn.className = `list-pill${index === this.selectedIndex ? " active" : ""}`;
      btn.innerHTML = `
        <span class="title">${formation.name || "Untitled formation"}</span>
        <span class="meta">${formation.categories?.length ?? 0} categories</span>
      `;
      this.listEl.appendChild(btn);
    });
  }

  private syncSelection(): void {
    if (!this.formations.length) {
      this.formations = [createFormation()];
    }
    if (this.selectedIndex < 0 || this.selectedIndex >= this.formations.length) {
      this.selectedIndex = 0;
    }
    const formation = this.formations[this.selectedIndex];
    (this.formEl.elements.namedItem("name") as HTMLInputElement).value = formation.name || "";
    (this.formEl.elements.namedItem("description") as HTMLTextAreaElement).value = formation.description || "";
    (this.formEl.elements.namedItem("image") as HTMLInputElement).value = formation.image || "";
    this.renderList();
    this.renderCategories();
    this.setStatus(`Editing ${formation.name || "formation"}.`, "default");
  }

  private renderCategories(): void {
    this.categoryListEl.innerHTML = "";
    const formation = this.formations[this.selectedIndex];
    const categories = formation.categories || [];
    if (!categories.length) {
      const helper = document.createElement("p");
      helper.className = "empty";
      helper.textContent = "No categories yet. Add one to assign units.";
      this.categoryListEl.appendChild(helper);
    } else {
      categories.forEach((category) => this.appendCategoryRow(category));
    }
    this.updateUnitsCount(categories);
  }

  private appendCategoryRow(category?: FormationCategory): void {
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `
      <div class="field">
        <label>Category name</label>
        <input data-field="name" value="${category?.name || ""}" />
      </div>
      <div class="field">
        <label>Assign units</label>
        <select data-field="units" multiple size="5"></select>
      </div>
      <div class="row-actions">
        <button type="button" class="ghost" data-action="remove-category">Remove</button>
      </div>
    `;
    const select = row.querySelector<HTMLSelectElement>('select[data-field="units"]')!;
    const selected = new Set((category?.units || []).map((value) => Number(value)));
    this.populateUnitOptions(select, selected);
    this.categoryListEl.appendChild(row);
  }

  private populateUnitOptions(select: HTMLSelectElement, selected: Set<number>): void {
    select.innerHTML = "";
    if (!this.unitOptions.length) {
      const option = document.createElement("option");
      option.textContent = "No units available";
      option.disabled = true;
      select.appendChild(option);
      return;
    }
    this.unitOptions.forEach(({ id, label }) => {
      const option = document.createElement("option");
      option.value = id.toString();
      option.textContent = label;
      if (selected.has(id)) option.selected = true;
      select.appendChild(option);
    });
  }

  private collectCategoriesFromDom(): FormationCategory[] {
    const rows = Array.from(this.categoryListEl.querySelectorAll<HTMLElement>(".category-row"));
    return rows.map((row) => {
      const nameInput = row.querySelector<HTMLInputElement>('input[data-field="name"]');
      const select = row.querySelector<HTMLSelectElement>('select[data-field="units"]');
      const units = select
        ? Array.from(select.selectedOptions)
            .map((opt) => Number(opt.value))
            .filter((value) => !Number.isNaN(value))
        : [];
      return {
        name: (nameInput?.value || "").trim(),
        units,
      };
    });
  }

  private updateUnitsCount(categories: FormationCategory[]): void {
    const unique = new Set<number>();
    categories.forEach((category) => (category.units || []).forEach((unitId) => unique.add(unitId)));
    this.unitsCountEl.textContent = unique.size.toString();
    this.renderSubFormationOptions();
  }

  private saveFormation(): void {
    if (!this.formations.length) return;
    const formation = { ...this.formations[this.selectedIndex] };
    formation.name = (this.formEl.elements.namedItem("name") as HTMLInputElement).value.trim();
    formation.description = (this.formEl.elements.namedItem("description") as HTMLTextAreaElement).value.trim();
    formation.image = (this.formEl.elements.namedItem("image") as HTMLInputElement).value.trim();
    formation.categories = this.collectCategoriesFromDom();
    formation.subFormations = Array.from(this.subSelectEl.selectedOptions)
      .map((option) => Number(option.value))
      .filter((value) => !Number.isNaN(value));
    this.updateUnitsCount(formation.categories || []);
    this.formations[this.selectedIndex] = formation;
    formationService
      .saveFormations(this.formations)
      .then(() => this.setStatus("Formation saved.", "success"))
      .catch((error) => this.setStatus(error instanceof Error ? error.message : String(error), "error"));
  }

  private renderSubFormationOptions(): void {
    if (!this.subSelectEl) return;
    const current = this.formations[this.selectedIndex];
    this.subSelectEl.innerHTML = "";
    const available = this.formationOptions.filter((option) => option.id && option.id !== current?.id);
    if (!available.length) {
      const option = document.createElement("option");
      option.disabled = true;
      option.textContent = "No other formations available";
      this.subSelectEl.appendChild(option);
      return;
    }
    available.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.id.toString();
      opt.textContent = option.name;
      if (current?.subFormations?.includes(option.id)) opt.selected = true;
      this.subSelectEl.appendChild(opt);
    });
  }

  private setStatus(message: string, tone: "default" | "success" | "error"): void {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }
}
