import type { Nation } from "../types";
import { nationService } from "../services/nationService";
import { formationService } from "../services/formationService";

const createNation = (): Nation => ({
  name: "New Nation",
  description: "",
  image: "",
  formations: [],
});

export class NationsPanel {
  private root: HTMLElement;
  private listEl!: HTMLElement;
  private formEl!: HTMLFormElement;
  private statusEl!: HTMLElement;
  private formationSelectEl!: HTMLSelectElement;
  private nationCountEl?: HTMLElement;
  private availableFormationCountEl?: HTMLElement;
  private nations: Nation[] = [];
  private formationOptions: { id: number; name: string }[] = [];
  private selectedIndex = 0;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  init(): void {
    this.renderLayout();
    this.cacheElements();
    this.bindEvents();
    nationService.subscribe((nations) => {
      this.nations = nations.length ? nations : [createNation()];
      if (this.nationCountEl) this.nationCountEl.textContent = nations.length.toString();
      this.renderList();
      this.syncSelection();
    });
    formationService.subscribe((formations) => {
      this.formationOptions = formations.map((formation, index) => ({
        id: formation.id ?? index,
        name: formation.name || `Formation ${index + 1}`,
      }));
      if (this.availableFormationCountEl) this.availableFormationCountEl.textContent = formations.length.toString();
      this.renderFormationSelect();
    });
    nationService.loadNations().catch((error) => {
      this.setStatus(error instanceof Error ? error.message : String(error), "error");
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="workspace">
        <aside class="sidebar">
          <header class="sidebar-header">
            <div>
              <p class="eyebrow">Doctrine profiles</p>
              <h1>Nation Builder</h1>
              <p class="muted">Bind formations to geopolitical blueprints.</p>
            </div>
            <button type="button" class="ghost" data-action="add-nation">+ Nation</button>
          </header>
          <div class="unit-list" data-role="nation-list"></div>
          <div class="meta-bar compact">
            <span>Nations: <strong data-role="nation-count">0</strong></span>
            <span>Formations ready: <strong data-role="nation-formation-count">0</strong></span>
          </div>
        </aside>
        <section class="editor">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Nation Editor</p>
              <h2>Strategic Profiles</h2>
              <p class="muted">Track doctrine notes, emblems, and attached formations.</p>
            </div>
          </header>
          <form data-role="nation-form" class="editor-form">
            <section class="panel grid-3">
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
                <input name="image" placeholder="nations/emblem.png" />
              </div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Assigned formations</h3>
                <span class="muted small">Ctrl/Cmd + click to multi-select</span>
              </div>
              <select data-role="formation-select" multiple size="6"></select>
            </section>
            <div class="form-actions">
              <button type="submit" class="primary">Save nation</button>
            </div>
          </form>
          <div class="status-bar" data-role="nation-status">Select a nation.</div>
        </section>
      </div>
    `;
  }

  private cacheElements(): void {
    this.listEl = this.root.querySelector<HTMLElement>('[data-role="nation-list"]')!;
    this.formEl = this.root.querySelector<HTMLFormElement>('[data-role="nation-form"]')!;
    this.statusEl = this.root.querySelector<HTMLElement>('[data-role="nation-status"]')!;
    this.formationSelectEl = this.root.querySelector<HTMLSelectElement>('[data-role="formation-select"]')!;
    this.nationCountEl = this.root.querySelector<HTMLElement>('[data-role="nation-count"]') ?? undefined;
    this.availableFormationCountEl = this.root.querySelector<HTMLElement>('[data-role="nation-formation-count"]') ?? undefined;
  }

  private bindEvents(): void {
    this.listEl.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-index]");
      if (!button) return;
      const index = Number(button.dataset.index);
      if (Number.isNaN(index)) return;
      this.selectedIndex = index;
      this.syncSelection();
    });

    this.formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.saveNation();
    });

    this.root.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action="add-nation"]');
      if (!button) return;
      this.addNation();
    });
  }

  private addNation(): void {
    this.nations.push(createNation());
    this.selectedIndex = this.nations.length - 1;
    if (this.nationCountEl) this.nationCountEl.textContent = this.nations.length.toString();
    this.renderList();
    this.syncSelection();
    this.setStatus("New nation ready for details.", "success");
  }

  private renderList(): void {
    if (!this.nations.length) {
      this.listEl.innerHTML = '<p class="empty">No nations defined.</p>';
      return;
    }
    this.listEl.innerHTML = "";
    this.nations.forEach((nation, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.index = index.toString();
      btn.className = `unit-pill${index === this.selectedIndex ? " active" : ""}`;
      btn.innerHTML = `
        <span class="title">${nation.name || "Unnamed nation"}</span>
        <span class="meta">${nation.formations?.length ?? 0} formations</span>
      `;
      this.listEl.appendChild(btn);
    });
  }

  private syncSelection(): void {
    if (!this.nations.length) {
      this.nations = [createNation()];
    }
    if (this.selectedIndex < 0 || this.selectedIndex >= this.nations.length) {
      this.selectedIndex = 0;
    }
    const nation = this.nations[this.selectedIndex];
    (this.formEl.elements.namedItem("name") as HTMLInputElement).value = nation.name || "";
    (this.formEl.elements.namedItem("description") as HTMLTextAreaElement).value = nation.description || "";
    (this.formEl.elements.namedItem("image") as HTMLInputElement).value = nation.image || "";
    this.renderList();
    this.renderFormationSelect();
    this.setStatus(`Editing ${nation.name || "nation"}.`, "default");
  }

  private renderFormationSelect(): void {
    if (!this.formationSelectEl) return;
    const nation = this.nations[this.selectedIndex];
    const selected = new Set((nation?.formations || []).map((value) => Number(value)));
    this.formationSelectEl.innerHTML = "";
    if (!this.formationOptions.length) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "No formations available";
      this.formationSelectEl.appendChild(opt);
      return;
    }
    this.formationOptions.forEach(({ id, name }) => {
      const option = document.createElement("option");
      option.value = id.toString();
      option.textContent = name;
      if (selected.has(id)) option.selected = true;
      this.formationSelectEl.appendChild(option);
    });
  }

  private saveNation(): void {
    if (!this.nations.length) return;
    const nation = { ...this.nations[this.selectedIndex] };
    nation.name = (this.formEl.elements.namedItem("name") as HTMLInputElement).value.trim();
    nation.description = (this.formEl.elements.namedItem("description") as HTMLTextAreaElement).value.trim();
    nation.image = (this.formEl.elements.namedItem("image") as HTMLInputElement).value.trim();
    nation.formations = Array.from(this.formationSelectEl.selectedOptions)
      .map((option) => Number(option.value))
      .filter((value) => !Number.isNaN(value));
    this.nations[this.selectedIndex] = nation;
    nationService
      .saveNations(this.nations)
      .then(() => this.setStatus("Nation saved.", "success"))
      .catch((error) => this.setStatus(error instanceof Error ? error.message : String(error), "error"));
  }

  private setStatus(message: string, tone: "default" | "success" | "error"): void {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }
}
