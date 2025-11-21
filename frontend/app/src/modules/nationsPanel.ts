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
  private warningEl!: HTMLElement;
  private loadErrorEl!: HTMLElement;
  private loadErrorTextEl!: HTMLElement;
  private formationSelectEl!: HTMLSelectElement;
  private nationCountEl?: HTMLElement;
  private availableFormationCountEl?: HTMLElement;
  private nations: Nation[] = [];
  private formationOptions: { id: number; name: string }[] = [];
  private selectedIndex = 0;
  private formationIdGate = false;
  private formationWarning?: string;
  private hostWarning?: string;

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
      const validFormations = formations.filter((formation) => typeof formation.id === "number" && Number.isFinite(formation.id));
      const missing = formations.length - validFormations.length;
      this.formationOptions = validFormations.map((formation) => {
        const id = formation.id as number;
        return {
          id,
          name: formation.name || `Formation ${id}`,
        };
      });
      this.formationIdGate = formations.length > 0 && validFormations.length === 0;
      this.formationWarning = missing
        ? `${missing} formation${missing === 1 ? "" : "s"} are missing IDs. Save formations before assigning them to nations.`
        : undefined;
      this.updateWarningBanner();
      if (this.availableFormationCountEl) this.availableFormationCountEl.textContent = validFormations.length.toString();
      this.renderFormationSelect();
    });
    void this.reloadNations();
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
          <div class="inline-warning hidden" data-role="nation-warning"></div>
          <div class="inline-error hidden" data-role="nation-load-error">
            <span data-role="nation-load-error-text"></span>
            <button type="button" class="ghost" data-action="retry-nations">Retry load</button>
          </div>
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
              <button type="button" class="ghost danger" data-action="delete-nation">Delete nation</button>
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
    this.warningEl = this.root.querySelector<HTMLElement>('[data-role="nation-warning"]')!;
    this.loadErrorEl = this.root.querySelector<HTMLElement>('[data-role="nation-load-error"]')!;
    this.loadErrorTextEl = this.loadErrorEl.querySelector<HTMLElement>('[data-role="nation-load-error-text"]')!;
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
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      if (action === "add-nation") {
        this.addNation();
      } else if (action === "retry-nations") {
        void this.reloadNations();
      } else if (action === "delete-nation") {
        this.deleteNation();
      }
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

  private deleteNation(): void {
    if (!this.nations.length) return;
    this.nations.splice(this.selectedIndex, 1);
    const payload = this.nations.slice();
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    if (!this.nations.length) {
      this.nations = [createNation()];
      this.selectedIndex = 0;
    }
    if (this.nationCountEl) this.nationCountEl.textContent = payload.length.toString();
    this.syncSelection();
    nationService
      .saveNations(payload)
      .then(() => {
        this.hostWarning = undefined;
        this.updateWarningBanner();
        this.setStatus("Nation deleted.", "success");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.hostWarning = message;
        this.updateWarningBanner();
        this.setStatus(message, "error");
      });
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
      opt.textContent = this.formationWarning || "No formations available";
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
    if (this.formationIdGate) {
      this.setStatus("Cannot save nations while formations are missing IDs. Save formations first.", "error");
      return;
    }
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
      .then(() => {
        this.hostWarning = undefined;
        this.updateWarningBanner();
        this.setStatus("Nation saved.", "success");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.hostWarning = message;
        this.updateWarningBanner();
        this.setStatus(message, "error");
      });
  }

  private updateWarningBanner(): void {
    if (!this.warningEl) return;
    const messages = [this.formationWarning, this.hostWarning].filter((msg): msg is string => Boolean(msg));
    if (!messages.length) {
      this.warningEl.classList.add("hidden");
      this.warningEl.textContent = "";
      this.warningEl.setAttribute("aria-hidden", "true");
      return;
    }
    this.warningEl.classList.remove("hidden");
    this.warningEl.removeAttribute("aria-hidden");
    this.warningEl.innerHTML = messages.map((msg) => `<p>${msg}</p>`).join("");
  }

  private setNationLoadError(message?: string): void {
    if (!this.loadErrorEl) return;
    if (!message) {
      this.loadErrorEl.classList.add("hidden");
      this.loadErrorEl.setAttribute("aria-hidden", "true");
      this.loadErrorTextEl.textContent = "";
      return;
    }
    this.loadErrorEl.classList.remove("hidden");
    this.loadErrorEl.removeAttribute("aria-hidden");
    this.loadErrorTextEl.textContent = message;
  }

  private async reloadNations(): Promise<void> {
    try {
      this.setNationLoadError();
      await nationService.loadNations();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setNationLoadError(`Failed to load nations: ${message}`);
      this.setStatus("Unable to load nations from host.", "error");
    }
  }

  private setStatus(message: string, tone: "default" | "success" | "error"): void {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }
}
