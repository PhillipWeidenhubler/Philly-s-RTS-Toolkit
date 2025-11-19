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
      this.renderList();
      this.syncSelection();
    });
    formationService.subscribe((formations) => {
      this.formationOptions = formations.map((formation, index) => ({
        id: formation.id ?? index,
        name: formation.name || `Formation ${index + 1}`,
      }));
      this.renderFormationSelect();
    });
    nationService.loadNations().catch((error) => {
      this.setStatus(error instanceof Error ? error.message : String(error), "error");
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="panel nations-panel">
        <div class="panel-heading">
          <h3>Nations</h3>
          <p class="muted">Assign formations to a nation profile.</p>
        </div>
        <div class="split-layout">
          <aside class="list-pane">
            <div class="list-actions">
              <button type="button" class="ghost" data-action="add-nation">+ Nation</button>
            </div>
            <div class="list-scroll" data-role="nation-list"></div>
          </aside>
          <section class="detail-pane">
            <form data-role="nation-form" class="grid-3">
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
              <div class="field full">
                <div class="panel-heading compact">
                  <label>Assigned formations</label>
                  <span class="muted small">Ctrl/Cmd + Click to multi-select</span>
                </div>
                <select data-role="formation-select" multiple size="6"></select>
              </div>
              <div class="field full">
                <button type="submit" class="primary">Save nation</button>
              </div>
            </form>
            <div class="status-bar compact" data-role="nation-status">Select a nation.</div>
          </section>
        </div>
      </div>
    `;
  }

  private cacheElements(): void {
    this.listEl = this.root.querySelector<HTMLElement>('[data-role="nation-list"]')!;
    this.formEl = this.root.querySelector<HTMLFormElement>('[data-role="nation-form"]')!;
    this.statusEl = this.root.querySelector<HTMLElement>('[data-role="nation-status"]')!;
    this.formationSelectEl = this.root.querySelector<HTMLSelectElement>('[data-role="formation-select"]')!;
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
      this.saveNation();
    });
    this.root.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
      if (!button) return;
      if (button.dataset.action === "add-nation") {
        this.addNation();
      }
    });
  }

  private addNation(): void {
    this.nations.push(createNation());
    this.selectedIndex = this.nations.length - 1;
    this.renderList();
    this.syncSelection();
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
      btn.className = `list-pill${index === this.selectedIndex ? " active" : ""}`;
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
