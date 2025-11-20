import Chart from "chart.js/auto";
import type { Unit, UnitStats } from "../types";
import { unitService } from "../services/unitService";
import { formationService } from "../services/formationService";
import { nationService } from "../services/nationService";

export class StatsPanel {
  private root: HTMLElement;
  private unitCountEl!: HTMLElement;
  private formationCountEl!: HTMLElement;
  private nationCountEl!: HTMLElement;
  private favoriteCategoryEl!: HTMLElement;
  private radarCanvas!: HTMLCanvasElement;
  private categoryCanvas!: HTMLCanvasElement;
  private radarEmptyEl!: HTMLElement;
  private categoryEmptyEl!: HTMLElement;
  private radarChart?: Chart;
  private categoryChart?: Chart;

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
      this.updateCharts(units);
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
        <div class="chart-grid">
          <div class="chart-card">
            <div class="chart-card-head">
              <h4>Category posture</h4>
              <p class="muted small">Avg armor / health / speed / stealth / weight</p>
            </div>
            <canvas aria-label="Category stat radar" data-role="chart-radar"></canvas>
            <p class="empty-note" data-role="chart-radar-empty">Add unit stats to visualize radar output.</p>
          </div>
          <div class="chart-card">
            <div class="chart-card-head">
              <h4>Unit distribution</h4>
              <p class="muted small">Counts by category</p>
            </div>
            <canvas aria-label="Category counts" data-role="chart-category"></canvas>
            <p class="empty-note" data-role="chart-category-empty">Add units to see category mix.</p>
          </div>
        </div>
      </div>
    `;
    this.unitCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-units"]')!;
    this.formationCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-formations"]')!;
    this.nationCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-nations"]')!;
    this.favoriteCategoryEl = this.root.querySelector<HTMLElement>('[data-role="stat-category"]')!;
    this.radarCanvas = this.root.querySelector<HTMLCanvasElement>('[data-role="chart-radar"]')!;
    this.categoryCanvas = this.root.querySelector<HTMLCanvasElement>('[data-role="chart-category"]')!;
    this.radarEmptyEl = this.root.querySelector<HTMLElement>('[data-role="chart-radar-empty"]')!;
    this.categoryEmptyEl = this.root.querySelector<HTMLElement>('[data-role="chart-category-empty"]')!;
  }

  private updateCharts(units: Unit[]): void {
    if (!this.radarCanvas || !this.categoryCanvas) return;
    const statKeys: (keyof Pick<UnitStats, "armor" | "health" | "speed" | "stealth" | "weight">)[] = [
      "armor",
      "health",
      "speed",
      "stealth",
      "weight",
    ];
    type StatAccumulator = Record<(typeof statKeys)[number], { sum: number; count: number }>;
    const createAccumulator = (): StatAccumulator =>
      statKeys.reduce((acc, key) => {
        acc[key] = { sum: 0, count: 0 };
        return acc;
      }, {} as StatAccumulator);

    const categoryBuckets = new Map<
      string,
      { count: number; stats: StatAccumulator }
    >();

    units.forEach((unit) => {
      const key = (unit.category || "Unknown").toUpperCase();
      const bucket = categoryBuckets.get(key) ?? { count: 0, stats: createAccumulator() };
      bucket.count += 1;
      const stats = unit.stats || {};
      statKeys.forEach((statKey) => {
        const value = this.toNumber(stats[statKey]);
        if (value !== undefined) {
          bucket.stats[statKey].sum += value;
          bucket.stats[statKey].count += 1;
        }
      });
      categoryBuckets.set(key, bucket);
    });

    const orderedCategories = Array.from(categoryBuckets.entries()).sort((a, b) => b[1].count - a[1].count);

    this.renderRadarChart(statKeys, orderedCategories.slice(0, 4));
    this.renderCategoryChart(orderedCategories);
  }

  private renderRadarChart(
    statKeys: (keyof Pick<UnitStats, "armor" | "health" | "speed" | "stealth" | "weight">)[],
    topCategories: Array<[string, { count: number; stats: Record<string, { sum: number; count: number }> }]>
  ): void {
    if (!this.radarCanvas) return;
    if (this.radarChart) {
      this.radarChart.destroy();
    }
    if (!topCategories.length) {
      this.radarEmptyEl.hidden = false;
      this.radarCanvas.hidden = true;
      this.radarChart = undefined;
      return;
    }
    this.radarEmptyEl.hidden = true;
    this.radarCanvas.hidden = false;
    const palette = this.getPalette();
    const datasets = topCategories.map(([label, bucket], index) => ({
      label,
      data: statKeys.map((key) => {
        const { sum, count } = bucket.stats[key];
        return count ? Number((sum / count).toFixed(2)) : 0;
      }),
      borderColor: palette[index % palette.length],
      backgroundColor: this.withAlpha(palette[index % palette.length], 0.25),
      pointBackgroundColor: palette[index % palette.length],
    }));

    this.radarChart = new Chart(this.radarCanvas, {
      type: "radar",
      data: {
        labels: statKeys.map((key) => this.formatStatLabel(key)),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: this.getGridColor(0.1) },
            grid: { color: this.getGridColor(0.1) },
            pointLabels: {
              color: this.getTextColor(),
              font: { size: 11 },
            },
            ticks: {
              backdropColor: "transparent",
              color: this.getTextColor(0.6),
              showLabelBackdrop: false,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: this.getTextColor(),
            },
          },
        },
      },
    });
  }

  private renderCategoryChart(
    orderedCategories: Array<[string, { count: number; stats: Record<string, { sum: number; count: number }> }]>
  ): void {
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (!orderedCategories.length) {
      this.categoryEmptyEl.hidden = false;
      this.categoryCanvas.hidden = true;
      this.categoryChart = undefined;
      return;
    }
    this.categoryEmptyEl.hidden = true;
    this.categoryCanvas.hidden = false;
    const palette = this.getPalette();
    const labels = orderedCategories.map(([label]) => label);
    const data = orderedCategories.map(([, bucket]) => bucket.count);
    this.categoryChart = new Chart(this.categoryCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Units",
            data,
            backgroundColor: labels.map((_, index) => this.withAlpha(palette[index % palette.length], 0.35)),
            borderColor: labels.map((_, index) => palette[index % palette.length]),
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: this.getTextColor() },
          },
          y: {
            beginAtZero: true,
            grid: { color: this.getGridColor(0.1) },
            ticks: { color: this.getTextColor() },
          },
        },
      },
    });
  }

  private formatStatLabel(key: keyof UnitStats): string {
    switch (key) {
      case "armor":
        return "Armor";
      case "health":
        return "Health";
      case "speed":
        return "Speed";
      case "stealth":
        return "Stealth";
      case "weight":
        return "Weight";
      default:
        return key.toString();
    }
  }

  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const normalized = value.replace(/[^0-9.-]+/g, "");
      if (!normalized) return undefined;
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private getPalette(): string[] {
    const accent = this.getCssVar("--accent", "#6dd5fa");
    const accentDark = this.getCssVar("--accent-dark", "#2980b9");
    return [accent, "#ff6b6b", "#ffd166", "#c792ea", accentDark, "#5ad1cd"];
  }

  private getCssVar(name: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value ? value.trim() : fallback;
  }

  private withAlpha(color: string, alpha: number): string {
    const hexMatch = color.replace("#", "");
    if (hexMatch.length === 3 || hexMatch.length === 6) {
      const hex = hexMatch.length === 3 ? hexMatch.split("").map((c) => c + c).join("") : hexMatch;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  private getTextColor(opacity = 1): string {
    const color = this.getCssVar("--text", "#f8f8f2");
    return this.withAlpha(color, opacity);
  }

  private getGridColor(opacity = 0.1): string {
    const border = this.getCssVar("--border", "#2a2f4a");
    return this.withAlpha(border, opacity);
  }
}
