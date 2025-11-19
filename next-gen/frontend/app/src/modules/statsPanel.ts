import { unitService } from "../services/unitService";
import { formationService } from "../services/formationService";
import { nationService } from "../services/nationService";

export class StatsPanel {
  private root: HTMLElement;
  private unitCountEl!: HTMLElement;
  private formationCountEl!: HTMLElement;
  private nationCountEl!: HTMLElement;
  private favoriteCategoryEl!: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  init(): void {
    this.renderLayout();
    unitService.subscribe((units) => {
      this.unitCountEl.textContent = units.length.toString();
      const categories = units.reduce<Record<string, number>>((map, unit) => {
        const key = (unit.category || "Unknown").toUpperCase();
        map[key] = (map[key] || 0) + 1;
        return map;
      }, {});
      const favorite = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      this.favoriteCategoryEl.textContent = favorite ? `${favorite[0]} (${favorite[1]})` : "—";
    });

    formationService.subscribe((formations) => {
      this.formationCountEl.textContent = formations.length.toString();
    });

    nationService.subscribe((nations) => {
      this.nationCountEl.textContent = nations.length.toString();
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="panel stats-panel">
        <div class="panel-heading">
          <h3>Force Overview</h3>
          <p class="muted">Live metrics pulled from SQLite</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="label">Units</span>
            <strong data-role="stat-units">0</strong>
          </div>
          <div class="stat-card">
            <span class="label">Formations</span>
            <strong data-role="stat-formations">0</strong>
          </div>
          <div class="stat-card">
            <span class="label">Nations</span>
            <strong data-role="stat-nations">0</strong>
          </div>
          <div class="stat-card">
            <span class="label">Top category</span>
            <strong data-role="stat-category">—</strong>
          </div>
        </div>
        <p class="muted">Radar visualizations and legacy views will return here soon.</p>
      </div>
    `;
    this.unitCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-units"]')!;
    this.formationCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-formations"]')!;
    this.nationCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-nations"]')!;
    this.favoriteCategoryEl = this.root.querySelector<HTMLElement>('[data-role="stat-category"]')!;
  }
}
