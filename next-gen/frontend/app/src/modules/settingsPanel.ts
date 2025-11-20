import type { AppSettings } from "../types";
import { settingsService } from "../services/settingsService";
import { applyTheme } from "../lib/theme";

export class SettingsPanel {
  private root: HTMLElement;
  private formEl!: HTMLFormElement;
  private statusEl!: HTMLElement;
  private settings: AppSettings = {};

  constructor(root: HTMLElement) {
    this.root = root;
  }

  init(): void {
    this.renderLayout();
    this.cacheElements();
    this.bindEvents();
    settingsService.subscribe((settings) => {
      this.settings = settings;
      this.syncForm();
    });
    settingsService.loadSettings().catch((error) => {
      this.setStatus(error instanceof Error ? error.message : String(error), "error");
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="panel settings-panel">
        <div class="panel-heading">
          <h3>Application Settings</h3>
          <p class="muted">Customize theme, locale, and experimental flags.</p>
        </div>
        <form class="grid-3" data-role="settings-form">
          <div class="field">
            <label>Theme</label>
            <select name="theme">
              <option value="">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="midnight">Midnight</option>
              <option value="aurora">Aurora</option>
              <option value="terminal">Terminal</option>
            </select>
          </div>
          <div class="field">
            <label>Locale</label>
            <input name="locale" placeholder="en-US" />
          </div>
          <div class="field">
            <label>Accent color</label>
            <input name="accentColor" type="color" value="#6dd5fa" />
          </div>
          <div class="field">
            <label>
              <input type="checkbox" name="enableExperimental" />
              Enable experimental modules
            </label>
          </div>
          <div class="field full">
            <button type="submit" class="primary">Save settings</button>
          </div>
        </form>
        <div class="status-bar compact" data-role="settings-status">Adjust settings and save.</div>
      </div>
    `;
  }

  private cacheElements(): void {
    this.formEl = this.root.querySelector<HTMLFormElement>('[data-role="settings-form"]')!;
    this.statusEl = this.root.querySelector<HTMLElement>('[data-role="settings-status"]')!;
  }

  private bindEvents(): void {
    this.formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.persist();
    });
  }

  private syncForm(): void {
    (this.formEl.elements.namedItem("theme") as HTMLSelectElement).value = this.settings.theme || "";
    (this.formEl.elements.namedItem("locale") as HTMLInputElement).value = this.settings.locale || "";
    (this.formEl.elements.namedItem("accentColor") as HTMLInputElement).value =
      typeof this.settings.accentColor === "string" && this.settings.accentColor.startsWith("#")
        ? this.settings.accentColor
        : "#6dd5fa";
    (this.formEl.elements.namedItem("enableExperimental") as HTMLInputElement).checked =
      Boolean(this.settings.enableExperimental);
  }

  private persist(): void {
    const payload: AppSettings = {
      theme: (this.formEl.elements.namedItem("theme") as HTMLSelectElement).value || undefined,
      locale: (this.formEl.elements.namedItem("locale") as HTMLInputElement).value || undefined,
      accentColor: (this.formEl.elements.namedItem("accentColor") as HTMLInputElement).value || undefined,
      enableExperimental: (this.formEl.elements.namedItem("enableExperimental") as HTMLInputElement).checked,
    };
    applyTheme(payload);
    settingsService
      .saveSettings(payload)
      .then(() => this.setStatus("Settings saved.", "success"))
      .catch((error) => this.setStatus(error instanceof Error ? error.message : String(error), "error"));
  }

  private setStatus(message: string, tone: "default" | "success" | "error"): void {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }
}
