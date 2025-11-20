import type { Formation, FormationCategory, SubFormationAttachment } from "../types";
import { formationService } from "../services/formationService";
import { unitService } from "../services/unitService";

const createFormation = (): Formation => ({
  name: "New Formation",
  role: "",
  hqLocation: "",
  commander: "",
  readiness: "",
  strengthSummary: "",
  supportAssets: "",
  communications: "",
  description: "",
  image: "",
  categories: [],
  subFormationLinks: [],
});

export class FormationsPanel {
  private root: HTMLElement;
  private listEl!: HTMLElement;
  private formEl!: HTMLFormElement;
  private statusEl!: HTMLElement;
  private categoryListEl!: HTMLElement;
  private unitsCountEl!: HTMLElement;
  private subFormationListEl!: HTMLElement;
  private formationCountEl?: HTMLElement;
  private formations: Formation[] = [];
  private unitOptions: { id: number; label: string }[] = [];
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
      const total = formations.length;
      this.formations = total ? formations : [createFormation()];
      this.rebuildFormationOptions();
      if (this.formationCountEl) this.formationCountEl.textContent = total.toString();
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
      <div class="workspace">
        <aside class="sidebar">
          <header class="sidebar-header">
            <div>
              <p class="eyebrow">Force structure</p>
              <h1>Formations Browser</h1>
            </div>
            <button type="button" class="ghost" data-action="add-formation">+ Formation</button>
          </header>
          <div class="unit-list" data-role="formation-list"></div>
          <div class="meta-bar compact">
            <span>Formations: <strong data-role="formation-count">0</strong></span>
            <span>Unique units: <strong data-role="formation-units-count">0</strong></span>
          </div>
        </aside>
        <section class="editor">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Formation Editor</p>
              <h2>Formation Editor</h2>
              <p class="muted">Capture HQ posture, leadership, and subordinate attachments.</p>
            </div>
          </header>
          <form data-role="formation-form" class="editor-form">
            <section class="panel grid-3">
              <div class="field">
                <label>Name</label>
                <input name="name" autocomplete="off" />
              </div>
              <div class="field">
                <label>Role / mission</label>
                <input name="role" />
              </div>
              <div class="field">
                <label>Headquarters location</label>
                <input name="hqLocation" />
              </div>
            </section>
            <section class="panel grid-3">
              <div class="field">
                <label>Commander</label>
                <input name="commander" />
              </div>
              <div class="field">
                <label>Readiness posture</label>
                <input name="readiness" placeholder="90% / 48h stand-up" />
              </div>
              <div class="field">
                <label>Strength summary</label>
                <input name="strengthSummary" placeholder="1,240 personnel / 220 vehicles" />
              </div>
            </section>
            <section class="panel grid-3">
              <div class="field">
                <label>Support assets</label>
                <input name="supportAssets" placeholder="Fires, sustainment, aviation" />
              </div>
              <div class="field">
                <label>Communications plan</label>
                <input name="communications" placeholder="FM 30-41 / SAT 2.5 GHz" />
              </div>
              <div class="field">
                <label>Image</label>
                <input name="image" placeholder="formations/path.png" />
              </div>
            </section>
            <section class="panel">
              <label>Description</label>
              <textarea name="description" rows="4" placeholder="Doctrine, employment concept, and sustainment notes."></textarea>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Categories</h3>
                <button type="button" class="ghost" data-action="add-category">Add category</button>
              </div>
              <div class="category-editor" data-role="category-editor"></div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Sub formations</h3>
                <button type="button" class="ghost" data-action="add-sub-formation">Attach formation</button>
              </div>
              <div class="sub-formation-list" data-role="sub-formation-list">
                <p class="empty">No attached formations.</p>
              </div>
            </section>
            <div class="form-actions">
              <button type="submit" class="primary">Save formation</button>
            </div>
          </form>
          <div class="status-bar" data-role="formation-status">Select a formation.</div>
        </section>
      </div>
    `;
  }

  private cacheElements(): void {
    this.listEl = this.root.querySelector<HTMLElement>('[data-role="formation-list"]')!;
    this.formEl = this.root.querySelector<HTMLFormElement>('[data-role="formation-form"]')!;
    this.statusEl = this.root.querySelector<HTMLElement>('[data-role="formation-status"]')!;
    this.categoryListEl = this.root.querySelector<HTMLElement>('[data-role="category-editor"]')!;
    this.unitsCountEl = this.root.querySelector<HTMLElement>('[data-role="formation-units-count"]')!;
    this.subFormationListEl = this.root.querySelector<HTMLElement>('[data-role="sub-formation-list"]')!;
    this.formationCountEl = this.root.querySelector<HTMLElement>('[data-role="formation-count"]');
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
      } else if (action === "add-sub-formation") {
        this.appendSubFormationRow();
        this.refreshSubFormationSelects();
      } else if (action === "remove-sub-formation") {
        const row = button.closest(".sub-formation-row");
        row?.remove();
        if (this.subFormationListEl && !this.subFormationListEl.querySelector(".sub-formation-row")) {
          this.subFormationListEl.innerHTML = '<p class="empty">No attached formations.</p>';
        }
      }
    });
  }

  private addFormation(): void {
    this.formations.push(createFormation());
    this.selectedIndex = this.formations.length - 1;
    this.rebuildFormationOptions();
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
      btn.className = `unit-pill${index === this.selectedIndex ? " active" : ""}`;
      btn.innerHTML = `
        <span class="unit-pill-body">
          <span class="title">${formation.name || "Untitled formation"}</span>
          <span class="meta">${formation.categories?.length ?? 0} categories</span>
        </span>
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
    const setValue = (name: string, value?: string) => {
      const field = this.formEl.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (field) field.value = value ?? "";
    };

    setValue("name", formation.name);
    setValue("role", formation.role);
    setValue("hqLocation", formation.hqLocation);
    setValue("commander", formation.commander);
    setValue("readiness", formation.readiness);
    setValue("strengthSummary", formation.strengthSummary);
    setValue("supportAssets", formation.supportAssets);
    setValue("communications", formation.communications);
    setValue("description", formation.description);
    setValue("image", formation.image);
    this.renderList();
    this.renderCategories();
    this.renderSubFormationRows();
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

  private renderSubFormationRows(): void {
    if (!this.subFormationListEl) return;
    this.subFormationListEl.innerHTML = "";
    const formation = this.formations[this.selectedIndex];
    const links = this.normalizeSubFormationLinks(formation);
    if (!links.length) {
      this.subFormationListEl.innerHTML = '<p class="empty">No attached formations.</p>';
      return;
    }
    links.forEach((link) => this.appendSubFormationRow(link));
    this.refreshSubFormationSelects();
  }

  private normalizeSubFormationLinks(formation: Formation): SubFormationAttachment[] {
    if (Array.isArray(formation.subFormationLinks) && formation.subFormationLinks.length) {
      return formation.subFormationLinks
        .map((link) => {
          const parsedId = typeof link.formationId === "string" ? Number(link.formationId) : link.formationId;
          return {
            ...link,
            formationId: typeof parsedId === "number" && !Number.isNaN(parsedId) ? parsedId : undefined,
          };
        })
        .filter((link): link is SubFormationAttachment => typeof link.formationId === "number");
    }
    if (Array.isArray(formation.subFormations) && formation.subFormations.length) {
      return formation.subFormations
        .map((id) => (typeof id === "number" && !Number.isNaN(id) ? { formationId: id } : null))
        .filter((link): link is SubFormationAttachment => Boolean(link));
    }
    return [];
  }

  private appendSubFormationRow(link?: SubFormationAttachment): void {
    if (!this.subFormationListEl) return;
    if (this.subFormationListEl.querySelector(".empty")) {
      this.subFormationListEl.innerHTML = "";
    }
    const row = document.createElement("div");
    row.className = "sub-formation-row";
    row.innerHTML = `
      <div class="field">
        <label>Formation</label>
        <select data-field="formation"></select>
      </div>
      <div class="field">
        <label>Assignment</label>
        <input data-field="assignment" value="${link?.assignment ?? ""}" />
      </div>
      <div class="field">
        <label>Strength</label>
        <input data-field="strength" value="${link?.strength ?? ""}" />
      </div>
      <div class="field">
        <label>Readiness</label>
        <input data-field="readiness" value="${link?.readiness ?? ""}" />
      </div>
      <div class="field full-row">
        <label>Notes</label>
        <input data-field="notes" value="${link?.notes ?? ""}" />
      </div>
      <div class="row-actions">
        <button type="button" class="ghost" data-action="remove-sub-formation">Remove</button>
      </div>
    `;
    const select = row.querySelector<HTMLSelectElement>('select[data-field="formation"]');
    if (select) {
      this.populateSubFormationOptions(select, link?.formationId);
    }
    this.subFormationListEl.appendChild(row);
  }

  private populateSubFormationOptions(select: HTMLSelectElement, selectedId?: number): void {
    const currentId = this.getCurrentFormationIdentity();
    const previousValue = selectedId ?? (select.value ? Number(select.value) : undefined);
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select formation";
    select.appendChild(placeholder);
    this.formationOptions
      .filter((option) => (currentId ? option.id !== currentId : true))
      .forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option.id.toString();
        opt.textContent = option.name;
        select.appendChild(opt);
      });
    if (previousValue && !Number.isNaN(previousValue)) {
      select.value = previousValue.toString();
    } else {
      select.value = "";
    }
  }

  private refreshSubFormationSelects(): void {
    if (!this.subFormationListEl) return;
    const selects = Array.from(this.subFormationListEl.querySelectorAll<HTMLSelectElement>('select[data-field="formation"]'));
    selects.forEach((select) => {
      const selected = select.value ? Number(select.value) : undefined;
      this.populateSubFormationOptions(select, selected && !Number.isNaN(selected) ? selected : undefined);
    });
  }

  private collectSubFormationLinks(): SubFormationAttachment[] {
    if (!this.subFormationListEl) return [];
    const rows = Array.from(this.subFormationListEl.querySelectorAll<HTMLElement>(".sub-formation-row"));
    return rows
      .map((row) => {
        const select = row.querySelector<HTMLSelectElement>('select[data-field="formation"]');
        if (!select || !select.value) return null;
        const formationId = Number(select.value);
        if (!Number.isFinite(formationId)) return null;
        const read = (field: string) =>
          row.querySelector<HTMLInputElement>(`[data-field="${field}"]`)?.value.trim() ?? "";
        const attachment: SubFormationAttachment = {
          formationId,
          assignment: read("assignment") || undefined,
          strength: read("strength") || undefined,
          readiness: read("readiness") || undefined,
          notes: read("notes") || undefined,
        };
        return attachment;
      })
      .filter((attachment): attachment is SubFormationAttachment => Boolean(attachment));
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
  }

  private rebuildFormationOptions(): void {
    this.formationOptions = this.formations.map((formation, index) => ({
      id: formation.id ?? index + 1,
      name: formation.name || `Formation ${index + 1}`,
    }));
    this.refreshSubFormationSelects();
  }

  private getCurrentFormationIdentity(): number | undefined {
    const formation = this.formations[this.selectedIndex];
    if (!formation) return undefined;
    if (typeof formation.id === "number" && !Number.isNaN(formation.id)) {
      return formation.id;
    }
    return this.selectedIndex >= 0 ? this.selectedIndex + 1 : undefined;
  }

  private saveFormation(): void {
    if (!this.formations.length) return;
    const formation = { ...this.formations[this.selectedIndex] };
    const readValue = (name: string) =>
      (this.formEl.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? "";

    formation.name = readValue("name");
    formation.role = readValue("role") || undefined;
    formation.hqLocation = readValue("hqLocation") || undefined;
    formation.commander = readValue("commander") || undefined;
    formation.readiness = readValue("readiness") || undefined;
    formation.strengthSummary = readValue("strengthSummary") || undefined;
    formation.supportAssets = readValue("supportAssets") || undefined;
    formation.communications = readValue("communications") || undefined;
    formation.description = readValue("description") || undefined;
    formation.image = readValue("image") || undefined;
    formation.categories = this.collectCategoriesFromDom();
    formation.subFormationLinks = this.collectSubFormationLinks();
    formation.subFormations = (formation.subFormationLinks || [])
      .map((link) => link.formationId)
      .filter((value): value is number => typeof value === "number" && !Number.isNaN(value));
    this.updateUnitsCount(formation.categories || []);
    this.formations[this.selectedIndex] = formation;
    this.rebuildFormationOptions();
    formationService
      .saveFormations(this.formations)
      .then(() => this.setStatus("Formation saved.", "success"))
      .catch((error) => this.setStatus(error instanceof Error ? error.message : String(error), "error"));
  }

  private setStatus(message: string, tone: "default" | "success" | "error"): void {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }
}
