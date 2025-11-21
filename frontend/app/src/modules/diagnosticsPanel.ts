import { valueOrNA } from "../lib/helpers";
import { serverService } from "../services/serverService";
import type { ServerDiagnostics, ServerLogEntry, ServerMetadata } from "../types";

export class DiagnosticsPanel {
  private readonly root: HTMLElement;
  private statusEl?: HTMLElement;
  private summaryEl?: HTMLElement;
  private logsEl?: HTMLElement;
  private filesEl?: HTMLElement;

  constructor(container: HTMLElement) {
    this.root = container;
  }

  init(): void {
    this.root.innerHTML = `
      <div class="diagnostics-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Runtime Diagnostics</p>
            <h2>Host Health Monitor</h2>
            <p class="muted">Inspect WebView host, local API server, and storage consistency.</p>
          </div>
          <div class="header-actions">
            <button type="button" class="ghost" data-role="refresh-logs">Refresh logs</button>
            <button type="button" class="primary" data-role="refresh-diagnostics">Refresh diagnostics</button>
          </div>
        </div>
        <div class="diagnostics-grid">
          <section class="diagnostic-card">
            <header>
              <span class="label">Server status</span>
              <span class="badge" data-role="status-indicator">Pending...</span>
            </header>
            <dl data-role="metadata"></dl>
          </section>
          <section class="diagnostic-card" data-role="summary">
            <header>
              <span class="label">Database snapshot</span>
            </header>
            <div class="grid-2" data-role="summary-body"></div>
          </section>
        </div>
        <section class="diagnostic-card">
          <header>
            <span class="label">JSON backups</span>
          </header>
          <div class="file-grid" data-role="files"></div>
        </section>
        <section class="diagnostic-card">
          <header>
            <span class="label">Server log tail</span>
          </header>
          <div class="log-table" data-role="logs"></div>
        </section>
      </div>
    `;

    this.statusEl = this.root.querySelector<HTMLElement>("[data-role='status-indicator']") ?? undefined;
    this.summaryEl = this.root.querySelector<HTMLElement>("[data-role='summary-body']") ?? undefined;
    this.logsEl = this.root.querySelector<HTMLElement>("[data-role='logs']") ?? undefined;
    this.filesEl = this.root.querySelector<HTMLElement>("[data-role='files']") ?? undefined;

    this.root.querySelector<HTMLButtonElement>("[data-role='refresh-diagnostics']")?.addEventListener("click", () => {
      this.setStatus("Refreshing...");
      serverService
        .fetchDiagnostics()
        .then(() => this.setStatus("Healthy"))
        .catch((error) => {
          console.error("Failed to refresh diagnostics", error);
          this.setStatus("Error");
        });
    });

    this.root.querySelector<HTMLButtonElement>("[data-role='refresh-logs']")?.addEventListener("click", () => {
      serverService.refreshLogs();
    });

    serverService.subscribeToMetadata((metadata) => this.renderMetadata(metadata));
    serverService.subscribeToDiagnostics((diagnostics) => this.renderDiagnostics(diagnostics));
    serverService.subscribeToLogs((entries) => this.renderLogs(entries));

    if (serverService.isSupported) {
      serverService.fetchDiagnostics().catch(() => undefined);
    } else {
      this.setStatus("Unavailable");
    }
  }

  private setStatus(text: string): void {
    if (this.statusEl) {
      this.statusEl.textContent = text;
    }
  }

  private renderMetadata(metadata?: ServerMetadata): void {
    const target = this.root.querySelector<HTMLElement>("[data-role='metadata']");
    if (!target) return;

    target.innerHTML = "";
    if (!metadata) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Waiting for host handshake...";
      target.appendChild(empty);
      this.setStatus("Pending");
      return;
    }

    const entries: Array<[string, string | number | undefined]> = [
      ["Base URL", metadata.baseUrl],
      ["Port", metadata.port],
      ["Started", metadata.startedAt],
      ["Token", metadata.token?.slice(0, 6) ? `${metadata.token.slice(0, 6)}…` : undefined],
    ];

    entries.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "meta-row";
      row.innerHTML = `<span>${label}</span><strong>${valueOrNA(value)}</strong>`;
      target.appendChild(row);
    });

    this.setStatus("Connected");
  }

  private renderDiagnostics(diagnostics?: ServerDiagnostics): void {
    if (!this.summaryEl || !diagnostics) {
      if (this.summaryEl) this.summaryEl.innerHTML = "<p class='muted'>No diagnostics yet.</p>";
      if (this.filesEl) this.filesEl.innerHTML = "";
      return;
    }

    const rows = [
      { label: "Database", value: diagnostics.databasePath },
      { label: "Schema", value: diagnostics.schemaPath },
      { label: "JSON root", value: diagnostics.jsonBackupDirectory },
      { label: "App state", value: diagnostics.appStateUpdatedAtUtc ?? "Unknown" },
      { label: "DB Size", value: diagnostics.databaseSizeBytes ? `${diagnostics.databaseSizeBytes.toLocaleString()} bytes` : "Unknown" },
      { label: "Pending logs", value: String(diagnostics.pendingLogEntries ?? 0) },
    ];

    this.summaryEl.innerHTML = rows
      .map((row) => `<div><span class="label">${row.label}</span><strong>${valueOrNA(row.value)}</strong></div>`)
      .join("");

    if (this.filesEl) {
      this.filesEl.innerHTML = diagnostics.backupFiles
        .map((file) => {
          const status = file.exists ? "ok" : "miss";
          const size = file.sizeBytes ? `${file.sizeBytes.toLocaleString()} B` : "--";
          const timestamp = file.lastWriteTimeUtc ?? "--";
          return `
            <article class="file-card ${status}">
              <header>
                <span>${file.name}</span>
                <span class="tag">${file.exists ? "Present" : "Missing"}</span>
              </header>
              <p class="path">${file.path}</p>
              <footer>
                <span>${size}</span>
                <span>${timestamp}</span>
              </footer>
            </article>
          `;
        })
        .join("");
    }
  }

  private renderLogs(entries: ServerLogEntry[]): void {
    if (!this.logsEl) return;
    if (!entries.length) {
      this.logsEl.innerHTML = "<p class='muted'>No recent log entries.</p>";
      return;
    }

    const latest = entries.slice(-50).reverse();
    this.logsEl.innerHTML = latest
      .map((entry) => {
        const status = entry.level?.toLowerCase() ?? "info";
        return `
          <article class="log-row ${status}">
            <div>
              <span class="timestamp">${entry.timestamp}</span>
              <strong>${entry.category ?? "server"}</strong>
              <span>${entry.level}</span>
            </div>
            <p>${entry.message}</p>
          </article>
        `;
      })
      .join("");
  }
}
