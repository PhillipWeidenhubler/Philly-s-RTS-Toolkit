import type { AppSettings, ServerDiagnostics, ServerLogEntry, ServerMetadata } from "../types";
import { settingsService } from "../services/settingsService";
import { applyTheme } from "../lib/theme";
import { serverService } from "../services/serverService";

export class SettingsPanel {
  private root: HTMLElement;
  private formEl!: HTMLFormElement;
  private statusEl!: HTMLElement;
  private settings: AppSettings = {};
  private serverConsoleEl!: HTMLElement;
  private serverStatusPill!: HTMLElement;
  private serverMetaEl!: HTMLElement;
  private serverLogView!: HTMLElement;
  private serverDiagOutputEl!: HTMLElement;
  private serverConsoleStatusEl!: HTMLElement;
  private serverRefreshBtn?: HTMLButtonElement;
  private serverDiagBtn?: HTMLButtonElement;
  private serverFilterInput?: HTMLInputElement;
  private serverAutoScrollToggle?: HTMLInputElement;
  private serverLogs: ServerLogEntry[] = [];
  private serverMetadata?: ServerMetadata;
  private serverDiagnostics?: ServerDiagnostics;
  private autoScroll = true;
  private readonly unsubscribers: Array<() => void> = [];

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
        <div class="panel server-console" data-role="server-console">
          <div class="panel-heading spaced">
            <div>
              <h3>Local Server Console</h3>
              <p class="muted">Inspect embedded API health, logs, and diagnostics output.</p>
            </div>
            <span class="pill" data-role="server-status-pill">Host offline</span>
          </div>
          <div class="server-console-actions">
            <button type="button" class="ghost" data-role="refresh-logs">Refresh logs</button>
            <button type="button" class="ghost" data-role="run-diagnostics">Run diagnostics</button>
            <label class="inline">
              <input type="checkbox" data-role="auto-scroll" checked />
              Autoscroll
            </label>
            <input type="search" placeholder="Filter logs" data-role="log-filter" />
          </div>
          <div class="server-meta" data-role="server-meta">Server details unavailable.</div>
          <div class="server-log-view" data-role="server-log-view">
            <p class="muted">No log entries yet.</p>
          </div>
          <pre class="server-diagnostics-output" data-role="server-diagnostics-output">Run diagnostics to capture database and payload summaries.</pre>
          <div class="status-bar compact" data-role="server-console-status">Server console idle.</div>
        </div>
      </div>
    `;
  }

  private cacheElements(): void {
    this.formEl = this.root.querySelector<HTMLFormElement>('[data-role="settings-form"]')!;
    this.statusEl = this.root.querySelector<HTMLElement>('[data-role="settings-status"]')!;
    this.serverConsoleEl = this.root.querySelector<HTMLElement>('[data-role="server-console"]')!;
    this.serverStatusPill = this.root.querySelector<HTMLElement>('[data-role="server-status-pill"]')!;
    this.serverMetaEl = this.root.querySelector<HTMLElement>('[data-role="server-meta"]')!;
    this.serverLogView = this.root.querySelector<HTMLElement>('[data-role="server-log-view"]')!;
    this.serverDiagOutputEl = this.root.querySelector<HTMLElement>('[data-role="server-diagnostics-output"]')!;
    this.serverConsoleStatusEl = this.root.querySelector<HTMLElement>('[data-role="server-console-status"]')!;
    this.serverRefreshBtn = this.root.querySelector<HTMLButtonElement>('[data-role="refresh-logs"]') ?? undefined;
    this.serverDiagBtn = this.root.querySelector<HTMLButtonElement>('[data-role="run-diagnostics"]') ?? undefined;
    this.serverFilterInput = this.root.querySelector<HTMLInputElement>('[data-role="log-filter"]') ?? undefined;
    this.serverAutoScrollToggle = this.root.querySelector<HTMLInputElement>('[data-role="auto-scroll"]') ?? undefined;
  }

  private bindEvents(): void {
    this.formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      this.persist();
    });
    this.bindServerConsoleEvents();
  }

  private bindServerConsoleEvents(): void {
    if (!this.serverConsoleEl) return;
    this.serverRefreshBtn?.addEventListener("click", () => serverService.refreshLogs());
    this.serverDiagBtn?.addEventListener("click", () => {
      void this.runDiagnostics();
    });
    this.serverFilterInput?.addEventListener("input", () => this.renderServerLogs());
    if (this.serverAutoScrollToggle) {
      this.autoScroll = this.serverAutoScrollToggle.checked;
      this.serverAutoScrollToggle.addEventListener("change", (event) => {
        this.autoScroll = (event.target as HTMLInputElement).checked;
      });
    }
    this.wireServerConsole();
    this.renderServerMeta();
    this.renderServerLogs();
    this.renderDiagnostics();
  }

  private wireServerConsole(): void {
    if (!this.serverConsoleEl) return;
    if (!serverService.isSupported) {
      this.serverConsoleEl.classList.add("is-disabled");
      this.serverStatusPill.textContent = "Host unavailable";
      this.serverRefreshBtn?.setAttribute("disabled", "true");
      this.serverDiagBtn?.setAttribute("disabled", "true");
      this.setServerConsoleStatus("Embedded server unavailable in browser preview.", "error");
      return;
    }

    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers.length = 0;

    this.unsubscribers.push(
      serverService.subscribeToMetadata((metadata) => {
        this.serverMetadata = metadata;
        this.renderServerMeta();
      })
    );

    this.unsubscribers.push(
      serverService.subscribeToLogs((logs) => {
        this.serverLogs = logs;
        this.renderServerLogs();
        this.setServerConsoleStatus(`Received ${logs.length} log entries.`, "default");
      })
    );

    this.unsubscribers.push(
      serverService.subscribeToDiagnostics((diagnostics) => {
        this.serverDiagnostics = diagnostics;
        this.renderDiagnostics();
      })
    );

    serverService.refreshLogs();
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

  private renderServerMeta(): void {
    if (!this.serverMetaEl) return;
    if (!serverService.isSupported) {
      this.serverMetaEl.innerHTML = `<p class="muted">Server features are unavailable while running in the browser.</p>`;
      return;
    }

    if (!this.serverMetadata) {
      this.serverMetaEl.innerHTML = `<p class="muted">Awaiting handshake from the desktop host...</p>`;
      this.serverStatusPill.textContent = "Awaiting host";
      return;
    }

    const started = this.serverMetadata.startedAt ? new Date(this.serverMetadata.startedAt).toLocaleString() : "Unknown";
    const baseUrl = this.serverMetadata.baseUrl ?? "n/a";
    const port = this.serverMetadata.port ?? 0;
    this.serverStatusPill.textContent = `Online - Port ${port}`;

    this.serverMetaEl.innerHTML = `
      <dl class="server-meta-grid">
        <div><dt>Base URL</dt><dd>${baseUrl}</dd></div>
        <div><dt>Port</dt><dd>${port}</dd></div>
        <div><dt>Started</dt><dd>${started}</dd></div>
      </dl>
      <p class="muted">Auth token protected - bridge events stream live into the console.</p>
    `;

    this.serverRefreshBtn?.removeAttribute("disabled");
    this.serverDiagBtn?.removeAttribute("disabled");
  }

  private renderServerLogs(): void {
    if (!this.serverLogView) return;
    if (!this.serverLogs.length) {
      this.serverLogView.innerHTML = `<p class="muted">No log entries yet.</p>`;
      return;
    }

    const filter = this.serverFilterInput?.value?.trim().toLowerCase();
    const entries = filter
      ? this.serverLogs.filter((entry) =>
        [entry.level, entry.category, entry.message, entry.exception ?? ""]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(filter))
      )
      : this.serverLogs;

    if (!entries.length) {
      this.serverLogView.innerHTML = `<p class="muted">No log entries match "${filter}".</p>`;
      return;
    }

    this.serverLogView.innerHTML = entries
      .map((entry) => {
        const timestamp = new Date(entry.timestamp).toLocaleTimeString();
        const level = entry.level?.toUpperCase?.() ?? "INFO";
        const metaParts = [entry.category, entry.statusCode ? `HTTP ${entry.statusCode}` : undefined, entry.durationMs ? `${entry.durationMs.toFixed(1)} ms` : undefined]
          .filter(Boolean)
          .join(" | ");
        const exception = entry.exception ? `<div class="log-exception">${entry.exception}</div>` : "";
        return `
          <article class="log-entry" data-level="${level.toLowerCase()}">
            <header>
              <span class="log-time">${timestamp}</span>
              <span class="log-level">${level}</span>
              ${metaParts ? `<span class="log-meta">${metaParts}</span>` : ""}
            </header>
            <p>${entry.message}</p>
            ${exception}
          </article>
        `;
      })
      .join("");

    if (this.autoScroll) {
      this.serverLogView.scrollTop = this.serverLogView.scrollHeight;
    }
  }

  private renderDiagnostics(): void {
    if (!this.serverDiagOutputEl) return;
    if (!this.serverDiagnostics) {
      this.serverDiagOutputEl.textContent = "Run diagnostics to inspect database + backup metadata.";
      return;
    }

    const { backupFiles, ...rest } = this.serverDiagnostics;
    const payload = {
      ...rest,
      backupFiles,
    };
    this.serverDiagOutputEl.textContent = JSON.stringify(payload, null, 2);
  }

  private async runDiagnostics(): Promise<void> {
    if (!serverService.isSupported) return;
    if (this.serverDiagBtn) {
      this.serverDiagBtn.disabled = true;
      this.serverDiagBtn.textContent = "Running...";
    }

    try {
      const diagnostics = await serverService.fetchDiagnostics();
      this.serverDiagnostics = diagnostics;
      this.renderDiagnostics();
      this.setServerConsoleStatus("Diagnostics snapshot captured.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.serverDiagOutputEl.textContent = `Diagnostics failed: ${message}`;
      this.setServerConsoleStatus(message, "error");
    } finally {
      if (this.serverDiagBtn) {
        this.serverDiagBtn.disabled = false;
        this.serverDiagBtn.textContent = "Run diagnostics";
      }
    }
  }

  private setServerConsoleStatus(message: string, tone: "default" | "success" | "error"): void {
    if (!this.serverConsoleStatusEl) return;
    this.serverConsoleStatusEl.textContent = message;
    this.serverConsoleStatusEl.dataset.tone = tone;
  }

  private setStatus(message: string, tone: "default" | "success" | "error"): void {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }
}
