import Chart from "chart.js/auto";
import type { Formation, Nation, Unit, UnitStats } from "../types";
import { scoreFormationDetailed, scoreNationDetailed } from "../lib/helpers";
import { unitService } from "../services/unitService";
import { formationService } from "../services/formationService";
import { nationService } from "../services/nationService";

type RadarStatKey = keyof Pick<UnitStats, "armor" | "health" | "speed" | "stealth" | "weight">;

type PerformanceMetric = {
  label: string;
  percent: number;
  hint: string;
};

type MeterRefs = {
  meterEl: HTMLElement;
  valueEl: HTMLElement;
  percentEl: HTMLElement;
  barEl: HTMLElement;
  hintEl: HTMLElement;
};

export class StatsPanel {
  private root: HTMLElement;
  private unitCountEl!: HTMLElement;
  private formationCountEl!: HTMLElement;
  private nationCountEl!: HTMLElement;
  private favoriteCategoryEl!: HTMLElement;
  private refreshBadgeEl!: HTMLElement;
  private radarCanvas!: HTMLCanvasElement;
  private categoryCanvas!: HTMLCanvasElement;
  private radarEmptyEl!: HTMLElement;
  private categoryEmptyEl!: HTMLElement;
  private formationMetricsEl!: HTMLElement;
  private formationMetricsEmptyEl!: HTMLElement;
  private nationMetricsEl!: HTMLElement;
  private nationMetricsEmptyEl!: HTMLElement;
  private mobilityValueEl!: HTMLElement;
  private mobilityMeterEl!: HTMLElement;
  private mobilityPercentEl!: HTMLElement;
  private mobilityBarEl!: HTMLElement;
  private mobilityHintEl!: HTMLElement;
  private survivabilityValueEl!: HTMLElement;
  private survivabilityMeterEl!: HTMLElement;
  private survivabilityPercentEl!: HTMLElement;
  private survivabilityBarEl!: HTMLElement;
  private survivabilityHintEl!: HTMLElement;
  private stealthValueEl!: HTMLElement;
  private stealthMeterEl!: HTMLElement;
  private stealthPercentEl!: HTMLElement;
  private stealthBarEl!: HTMLElement;
  private stealthHintEl!: HTMLElement;
  private readinessValueEl!: HTMLElement;
  private readinessMeterEl!: HTMLElement;
  private readinessPercentEl!: HTMLElement;
  private readinessBarEl!: HTMLElement;
  private readinessHintEl!: HTMLElement;
  private issueListEl!: HTMLElement;
  private issueEmptyEl!: HTMLElement;
  private radarChart?: Chart;
  private categoryChart?: Chart;
  private readonly radarStatKeys: RadarStatKey[] = ["armor", "health", "speed", "stealth", "weight"];
  private units: Unit[] = [];
  private formations: Formation[] = [];
  private nations: Nation[] = [];

  constructor(root: HTMLElement) {
    this.root = root;
  }

  init(): void {
    this.renderLayout();
    unitService.subscribe((units) => {
      this.units = units;
      this.unitCountEl.textContent = units.length.toString();
      const categories = units.reduce<Record<string, number>>((map, unit) => {
        const key = (unit.category || "Unknown").toUpperCase();
        map[key] = (map[key] || 0) + 1;
        return map;
      }, {});
      const favorite = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      this.favoriteCategoryEl.textContent = favorite ? `${favorite[0]} (${favorite[1]})` : "—";
      this.updateCharts(units);
      this.updatePerformanceMeters();
      this.refreshDeepInsights();
      this.markDataRefreshed();
    });

    formationService.subscribe((formations) => {
      this.formations = formations;
      this.formationCountEl.textContent = formations.length.toString();
      this.refreshDeepInsights();
      this.markDataRefreshed();
    });

    nationService.subscribe((nations) => {
      this.nations = nations;
      this.nationCountEl.textContent = nations.length.toString();
      this.refreshDeepInsights();
      this.markDataRefreshed();
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      <div class="panel stats-panel insights-panel">
        <header class="insights-head">
          <div>
            <p class="eyebrow">Operational insights</p>
            <h3>Force overview</h3>
            <p class="muted">Live metrics pulled from SQLite</p>
          </div>
          <span class="sync-chip" data-role="insights-refresh">Awaiting data…</span>
        </header>
        <div class="summary-grid">
          <div class="summary-card">
            <span class="label">Units</span>
            <strong data-role="stat-units">0</strong>
            <span class="meta">Tracked assets</span>
          </div>
          <div class="summary-card">
            <span class="label">Formations</span>
            <strong data-role="stat-formations">0</strong>
            <span class="meta">Structured orders of battle</span>
          </div>
          <div class="summary-card">
            <span class="label">Nations</span>
            <strong data-role="stat-nations">0</strong>
            <span class="meta">Doctrine profiles</span>
          </div>
          <div class="summary-card">
            <span class="label">Top category</span>
            <strong data-role="stat-category">—</strong>
            <span class="meta">Most common unit type</span>
          </div>
        </div>
        <div class="meter-grid">
          <div class="meter-card">
            <div class="meter-card-head">
              <div>
                <span class="label">Mobility index</span>
                <strong data-role="meter-mobility-value">—</strong>
              </div>
              <span class="meter-percent" data-role="meter-mobility-percent">0%</span>
            </div>
            <div
              class="meter-track"
              data-role="meter-mobility-track"
              role="meter"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
              aria-valuetext="Awaiting mobility stats"
              aria-label="Mobility index"
              tabindex="0"
            >
              <div class="meter-fill" data-role="meter-mobility-bar"></div>
            </div>
            <p class="muted small" data-role="meter-mobility-hint">Needs speed stats.</p>
          </div>
          <div class="meter-card">
            <div class="meter-card-head">
              <div>
                <span class="label">Survivability</span>
                <strong data-role="meter-survivability-value">—</strong>
              </div>
              <span class="meter-percent" data-role="meter-survivability-percent">0%</span>
            </div>
            <div
              class="meter-track"
              data-role="meter-survivability-track"
              role="meter"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
              aria-valuetext="Awaiting survivability stats"
              aria-label="Survivability index"
              tabindex="0"
            >
              <div class="meter-fill" data-role="meter-survivability-bar"></div>
            </div>
            <p class="muted small" data-role="meter-survivability-hint">Add armor stats to trend protection.</p>
          </div>
          <div class="meter-card">
            <div class="meter-card-head">
              <div>
                <span class="label">Stealth discipline</span>
                <strong data-role="meter-stealth-value">—</strong>
              </div>
              <span class="meter-percent" data-role="meter-stealth-percent">0%</span>
            </div>
            <div
              class="meter-track"
              data-role="meter-stealth-track"
              role="meter"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
              aria-valuetext="Awaiting stealth stats"
              aria-label="Stealth discipline"
              tabindex="0"
            >
              <div class="meter-fill" data-role="meter-stealth-bar"></div>
            </div>
            <p class="muted small" data-role="meter-stealth-hint">Log stealth percentages for squads.</p>
          </div>
          <div class="meter-card">
            <div class="meter-card-head">
              <div>
                <span class="label">Data readiness</span>
                <strong data-role="meter-readiness-value">—</strong>
              </div>
              <span class="meter-percent" data-role="meter-readiness-percent">0%</span>
            </div>
            <div
              class="meter-track"
              data-role="meter-readiness-track"
              role="meter"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
              aria-valuetext="Awaiting readiness stats"
              aria-label="Data readiness"
              tabindex="0"
            >
              <div class="meter-fill" data-role="meter-readiness-bar"></div>
            </div>
            <p class="muted small" data-role="meter-readiness-hint">Stat coverage across units.</p>
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
        <div class="analytics-grid">
          <div class="chart-card">
            <div class="chart-card-head">
              <h4>Formation insights</h4>
              <p class="muted small">Averages from nested formations</p>
            </div>
            <div class="metric-list" data-role="formation-metrics"></div>
            <p class="empty-note" data-role="formation-metrics-empty">Save formations with units to unlock insights.</p>
          </div>
          <div class="chart-card">
            <div class="chart-card-head">
              <h4>Nation insights</h4>
              <p class="muted small">Supply efficiency & momentum</p>
            </div>
            <div class="metric-list" data-role="nation-metrics"></div>
            <p class="empty-note" data-role="nation-metrics-empty">Assign formations to nations to unlock insights.</p>
          </div>
        </div>
        <div class="diagnostics-grid">
          <div class="chart-card issues-card">
            <div class="chart-card-head">
              <h4>Data health</h4>
              <p class="muted small">Automatic validation on load</p>
            </div>
            <ul class="issue-list" data-role="issue-list"></ul>
            <p class="empty-note" data-role="issue-empty">No blocking issues detected.</p>
          </div>
        </div>
      </div>
    `;
    this.unitCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-units"]')!;
    this.formationCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-formations"]')!;
    this.nationCountEl = this.root.querySelector<HTMLElement>('[data-role="stat-nations"]')!;
    this.favoriteCategoryEl = this.root.querySelector<HTMLElement>('[data-role="stat-category"]')!;
    this.refreshBadgeEl = this.root.querySelector<HTMLElement>('[data-role="insights-refresh"]')!;
    this.radarCanvas = this.root.querySelector<HTMLCanvasElement>('[data-role="chart-radar"]')!;
    this.categoryCanvas = this.root.querySelector<HTMLCanvasElement>('[data-role="chart-category"]')!;
    this.radarCanvas.height = 260;
    this.categoryCanvas.height = 260;
    this.radarEmptyEl = this.root.querySelector<HTMLElement>('[data-role="chart-radar-empty"]')!;
    this.categoryEmptyEl = this.root.querySelector<HTMLElement>('[data-role="chart-category-empty"]')!;
    this.formationMetricsEl = this.root.querySelector<HTMLElement>('[data-role="formation-metrics"]')!;
    this.formationMetricsEmptyEl = this.root.querySelector<HTMLElement>('[data-role="formation-metrics-empty"]')!;
    this.nationMetricsEl = this.root.querySelector<HTMLElement>('[data-role="nation-metrics"]')!;
    this.nationMetricsEmptyEl = this.root.querySelector<HTMLElement>('[data-role="nation-metrics-empty"]')!;
    this.mobilityValueEl = this.root.querySelector<HTMLElement>('[data-role="meter-mobility-value"]')!;
    this.mobilityMeterEl = this.root.querySelector<HTMLElement>('[data-role="meter-mobility-track"]')!;
    this.mobilityPercentEl = this.root.querySelector<HTMLElement>('[data-role="meter-mobility-percent"]')!;
    this.mobilityBarEl = this.root.querySelector<HTMLElement>('[data-role="meter-mobility-bar"]')!;
    this.mobilityHintEl = this.root.querySelector<HTMLElement>('[data-role="meter-mobility-hint"]')!;
    this.survivabilityValueEl = this.root.querySelector<HTMLElement>('[data-role="meter-survivability-value"]')!;
    this.survivabilityMeterEl = this.root.querySelector<HTMLElement>('[data-role="meter-survivability-track"]')!;
    this.survivabilityPercentEl = this.root.querySelector<HTMLElement>('[data-role="meter-survivability-percent"]')!;
    this.survivabilityBarEl = this.root.querySelector<HTMLElement>('[data-role="meter-survivability-bar"]')!;
    this.survivabilityHintEl = this.root.querySelector<HTMLElement>('[data-role="meter-survivability-hint"]')!;
    this.stealthValueEl = this.root.querySelector<HTMLElement>('[data-role="meter-stealth-value"]')!;
    this.stealthMeterEl = this.root.querySelector<HTMLElement>('[data-role="meter-stealth-track"]')!;
    this.stealthPercentEl = this.root.querySelector<HTMLElement>('[data-role="meter-stealth-percent"]')!;
    this.stealthBarEl = this.root.querySelector<HTMLElement>('[data-role="meter-stealth-bar"]')!;
    this.stealthHintEl = this.root.querySelector<HTMLElement>('[data-role="meter-stealth-hint"]')!;
    this.readinessValueEl = this.root.querySelector<HTMLElement>('[data-role="meter-readiness-value"]')!;
    this.readinessMeterEl = this.root.querySelector<HTMLElement>('[data-role="meter-readiness-track"]')!;
    this.readinessPercentEl = this.root.querySelector<HTMLElement>('[data-role="meter-readiness-percent"]')!;
    this.readinessBarEl = this.root.querySelector<HTMLElement>('[data-role="meter-readiness-bar"]')!;
    this.readinessHintEl = this.root.querySelector<HTMLElement>('[data-role="meter-readiness-hint"]')!;
    this.issueListEl = this.root.querySelector<HTMLElement>('[data-role="issue-list"]')!;
    this.issueEmptyEl = this.root.querySelector<HTMLElement>('[data-role="issue-empty"]')!;
  }

  private updateCharts(units: Unit[]): void {
    if (!this.radarCanvas || !this.categoryCanvas) return;
    const statKeys = this.radarStatKeys;
    type StatAccumulator = Record<RadarStatKey, { sum: number; count: number }>;
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
        const value = this.normalizeStatValue(statKey, stats[statKey]);
        if (value !== undefined) {
          bucket.stats[statKey].sum += value;
          bucket.stats[statKey].count += 1;
        }
      });
      categoryBuckets.set(key, bucket);
    });

    const orderedCategories = Array.from(categoryBuckets.entries()).sort((a, b) => b[1].count - a[1].count);
    const summaries = orderedCategories.map(([label, bucket]) => ({
      label,
      count: bucket.count,
      averages: this.calculateAverageStats(statKeys, bucket.stats),
    }));
    const radarCandidates = summaries.filter((summary) => statKeys.some((key) => typeof summary.averages[key] === "number"));
    this.renderRadarChart(statKeys, radarCandidates.slice(0, 4));
    this.renderCategoryChart(summaries);
  }

  private refreshDeepInsights(): void {
    this.updateAnalytics();
    this.renderQualityIssues();
  }

  private updatePerformanceMeters(): void {
    if (!this.mobilityValueEl) return;
    const snapshot = this.buildPerformanceSnapshot();
    this.writeMeter(
      {
        meterEl: this.mobilityMeterEl,
        valueEl: this.mobilityValueEl,
        percentEl: this.mobilityPercentEl,
        barEl: this.mobilityBarEl,
        hintEl: this.mobilityHintEl,
      },
      snapshot.mobility,
      "Add speed stats to units to track mobility."
    );
    this.writeMeter(
      {
        meterEl: this.survivabilityMeterEl,
        valueEl: this.survivabilityValueEl,
        percentEl: this.survivabilityPercentEl,
        barEl: this.survivabilityBarEl,
        hintEl: this.survivabilityHintEl,
      },
      snapshot.survivability,
      "Provide armor values to compute survivability."
    );
    this.writeMeter(
      {
        meterEl: this.stealthMeterEl,
        valueEl: this.stealthValueEl,
        percentEl: this.stealthPercentEl,
        barEl: this.stealthBarEl,
        hintEl: this.stealthHintEl,
      },
      snapshot.stealth,
      "Capture stealth ratings to trend signature management."
    );
    this.writeMeter(
      {
        meterEl: this.readinessMeterEl,
        valueEl: this.readinessValueEl,
        percentEl: this.readinessPercentEl,
        barEl: this.readinessBarEl,
        hintEl: this.readinessHintEl,
      },
      snapshot.readiness,
      "Fill in stat blocks to raise data readiness."
    );
  }

  private buildPerformanceSnapshot(): Record<"mobility" | "survivability" | "stealth" | "readiness", PerformanceMetric | undefined> {
    const speedValues = this.collectStatSamples("speed");
    const armorValues = this.collectStatSamples("armor");
    const stealthValues = this.collectStatSamples("stealth");
    const avgSpeed = this.average(speedValues);
    const avgArmor = this.average(armorValues);
    const avgStealth = this.average(stealthValues);
    const readinessPercent = this.units.length
      ? Math.round((this.units.filter((unit) => this.hasStatBlock(unit)).length / this.units.length) * 100)
      : undefined;

    const mobility = avgSpeed
      ? {
        label: `${avgSpeed.toFixed(1)} m/s (${(avgSpeed * 3.6).toFixed(1)} kp/h)`,
        percent: this.toPercent(avgSpeed, 12),
        hint: this.metricSampleHint(speedValues.length),
      }
      : undefined;
    const survivability = avgArmor
      ? {
        label: `${avgArmor.toFixed(1)} armor`,
        percent: this.toPercent(avgArmor, 40),
        hint: this.metricSampleHint(armorValues.length),
      }
      : undefined;
    const stealth = avgStealth
      ? {
        label: `${avgStealth.toFixed(1)}% stealth`,
        percent: this.toPercent(avgStealth, 80),
        hint: this.metricSampleHint(stealthValues.length),
      }
      : undefined;
    const readiness = readinessPercent === undefined
      ? undefined
      : {
        label: `${readinessPercent}% coverage`,
        percent: readinessPercent,
        hint: readinessPercent >= 80 ? "Data set looks healthy." : "Complete missing stat sheets.",
      };
    return { mobility, survivability, stealth, readiness };
  }

  private writeMeter(refs: MeterRefs, metric: PerformanceMetric | undefined, fallbackHint: string): void {
    if (!metric) {
      refs.valueEl.textContent = "—";
      refs.percentEl.textContent = "0%";
      refs.barEl.style.width = "0%";
      refs.hintEl.textContent = fallbackHint;
      refs.meterEl.setAttribute("aria-valuenow", "0");
      refs.meterEl.setAttribute("aria-valuetext", fallbackHint);
      return;
    }
    refs.valueEl.textContent = metric.label;
    refs.percentEl.textContent = `${metric.percent}%`;
    refs.barEl.style.width = `${metric.percent}%`;
    refs.hintEl.textContent = metric.hint;
    refs.meterEl.setAttribute("aria-valuenow", metric.percent.toString());
    refs.meterEl.setAttribute("aria-valuetext", metric.label);
  }

  private renderQualityIssues(): void {
    if (!this.issueListEl || !this.issueEmptyEl) return;
    const issues = this.detectDataIssues();
    if (!issues.length) {
      this.issueEmptyEl.hidden = false;
      this.issueListEl.innerHTML = "";
      return;
    }
    this.issueEmptyEl.hidden = true;
    this.issueListEl.innerHTML = issues.map((issue) => `<li>${issue}</li>`).join("");
  }

  private detectDataIssues(): string[] {
    const issues: string[] = [];
    if (!this.units.length) {
      issues.push("No units loaded from host.");
      return issues;
    }
    const unitsMissingCategory = this.units.filter((unit) => !unit.category?.trim()).length;
    if (unitsMissingCategory) {
      issues.push(`${unitsMissingCategory} ${this.pluralize(unitsMissingCategory, "unit")} missing category labels.`);
    }
    const speedMissing = this.units.filter((unit) => this.normalizeStatValue("speed", unit.stats?.speed) === undefined).length;
    if (speedMissing) {
      issues.push(`${speedMissing} ${this.pluralize(speedMissing, "unit")} missing speed stats.`);
    }
    const armorMissing = this.units.filter((unit) => this.normalizeStatValue("armor", unit.stats?.armor) === undefined).length;
    if (armorMissing) {
      issues.push(`${armorMissing} ${this.pluralize(armorMissing, "unit")} missing armor values.`);
    }
    const formationsWithoutAssignments = this.formations.filter((formation) => !formation.categories?.some((category) => category.units?.length)).length;
    if (formationsWithoutAssignments) {
      issues.push(`${formationsWithoutAssignments} ${this.pluralize(formationsWithoutAssignments, "formation")} lack assigned units.`);
    }
    const nationsWithoutFormations = this.nations.filter((nation) => !nation.formations?.length).length;
    if (nationsWithoutFormations) {
      issues.push(`${nationsWithoutFormations} ${this.pluralize(nationsWithoutFormations, "nation")} missing formation links.`);
    }
    const knownFormationIds = new Set(
      this.formations
        .map((formation) => formation.id)
        .filter((id): id is number => typeof id === "number" && Number.isFinite(id))
    );
    const orphanedRefs = this.nations.reduce((count, nation) => {
      const refs = nation.formations || [];
      return count + refs.filter((id) => typeof id === "number" && !knownFormationIds.has(id)).length;
    }, 0);
    if (orphanedRefs) {
      issues.push(`${orphanedRefs} orphaned formation reference${orphanedRefs === 1 ? "" : "s"} in nations.`);
    }
    return issues;
  }

  private metricSampleHint(samples: number): string {
    if (!samples) return "No samples yet.";
    return `${samples} ${this.pluralize(samples, "unit")} reporting`;
  }

  private collectStatSamples(statKey: RadarStatKey): number[] {
    return this.units
      .map((unit) => this.normalizeStatValue(statKey, unit.stats?.[statKey]))
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  }

  private average(values: number[]): number | undefined {
    if (!values.length) return undefined;
    const total = values.reduce((sum, value) => sum + value, 0);
    return total / values.length;
  }

  private toPercent(value: number | undefined, optimal: number, invert = false): number {
    if (value === undefined || Number.isNaN(value) || optimal <= 0) return 0;
    const ratio = Math.max(0, Math.min(value / optimal, 1));
    const percent = invert ? 1 - ratio : ratio;
    return Math.round(percent * 100);
  }

  private hasStatBlock(unit: Unit): boolean {
    const stats = unit.stats;
    if (!stats) return false;
    return Object.values(stats).some((value) => value !== undefined && value !== null && value !== "");
  }

  private markDataRefreshed(): void {
    if (!this.refreshBadgeEl) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.refreshBadgeEl.textContent = `Updated ${timestamp}`;
  }

  private pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular;
    return plural ?? `${singular}s`;
  }

  private updateAnalytics(): void {
    if (!this.formationMetricsEl || !this.nationMetricsEl) return;
    this.renderMetricList(this.formationMetricsEl, this.formationMetricsEmptyEl, this.buildFormationMetrics());
    this.renderMetricList(this.nationMetricsEl, this.nationMetricsEmptyEl, this.buildNationMetrics());
  }

  private renderRadarChart(
    statKeys: RadarStatKey[],
    summaries: Array<{ label: string; averages: Record<RadarStatKey, number | undefined> }>
  ): void {
    if (!this.radarCanvas) return;
    if (this.radarChart) {
      this.radarChart.destroy();
    }
    if (!summaries.length) {
      this.radarEmptyEl.hidden = false;
      this.radarCanvas.hidden = true;
      this.radarChart = undefined;
      return;
    }
    this.radarEmptyEl.hidden = true;
    this.radarCanvas.hidden = false;
    const palette = this.getPalette();
    const weightValues = summaries
      .map((summary) => summary.averages.weight)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    const weightMax = weightValues.length ? Math.max(...weightValues) : undefined;
    const weightMin = weightValues.length ? Math.min(...weightValues) : undefined;
    const datasets = summaries.map((summary, index) => ({
      label: summary.label,
      data: statKeys.map((key) => {
        const value = summary.averages[key];
        if (typeof value !== "number" || Number.isNaN(value)) {
          return 0;
        }
        if (key === "weight") {
          return this.transformWeightForDisplay(value, weightMin, weightMax);
        }
        return Number(value.toFixed(2));
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

  private renderCategoryChart(summaries: Array<{ label: string; count: number }>): void {
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (!summaries.length) {
      this.categoryEmptyEl.hidden = false;
      this.categoryCanvas.hidden = true;
      this.categoryChart = undefined;
      return;
    }
    this.categoryEmptyEl.hidden = true;
    this.categoryCanvas.hidden = false;
    const palette = this.getPalette();
    const labels = summaries.map((summary) => summary.label);
    const data = summaries.map((summary) => summary.count);
    const datasetColor = palette[0];
    this.categoryChart = new Chart(this.categoryCanvas, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Unit distribution",
            data,
            borderColor: datasetColor,
            backgroundColor: this.withAlpha(datasetColor, 0.25),
            pointBackgroundColor: datasetColor,
            pointBorderColor: datasetColor,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: this.getTextColor(),
            },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            grid: { color: this.getGridColor(0.1) },
            angleLines: { color: this.getGridColor(0.1) },
            pointLabels: {
              color: this.getTextColor(),
            },
            ticks: {
              backdropColor: "transparent",
              color: this.getTextColor(0.6),
            },
          },
        },
      },
    });
  }

  private calculateAverageStats(
    statKeys: RadarStatKey[],
    accumulator: Record<RadarStatKey, { sum: number; count: number }>
  ): Record<RadarStatKey, number | undefined> {
    return statKeys.reduce((acc, key) => {
      const entry = accumulator[key];
      acc[key] = entry.count ? entry.sum / entry.count : undefined;
      return acc;
    }, {} as Record<RadarStatKey, number | undefined>);
  }

  private renderMetricList(
    target: HTMLElement,
    emptyEl: HTMLElement,
    rows: Array<{ label: string; value: string }>
  ): void {
    if (!rows.length) {
      emptyEl.hidden = false;
      target.innerHTML = "";
      return;
    }
    emptyEl.hidden = true;
    target.innerHTML = rows
      .map((row) => `<div class="metric-row"><span>${row.label}</span><strong>${row.value}</strong></div>`)
      .join("");
  }

  private buildFormationMetrics(): Array<{ label: string; value: string }> {
    if (!this.formations.length || !this.units.length) return [];
    const scores = this.formations
      .map((formation) => scoreFormationDetailed(formation, this.units, this.formations))
      .filter(Boolean) as Array<{ metrics: Record<string, number> }>;
    if (!scores.length) return [];
    const average = (key: string) =>
      scores.reduce((sum, entry) => sum + (entry.metrics[key] ?? 0), 0) / scores.length;
    const descriptors = [
      { key: "supplyEfficiency", label: "Supply efficiency" },
      { key: "aoSize", label: "AO size" },
      { key: "recon", label: "Recon coverage" },
      { key: "speed", label: "Mobility" },
    ];
    return descriptors.map(({ key, label }) => ({
      label,
      value: average(key).toFixed(1),
    }));
  }

  private buildNationMetrics(): Array<{ label: string; value: string }> {
    if (!this.nations.length || !this.formations.length || !this.units.length) return [];
    const scores = this.nations
      .map((nation) => scoreNationDetailed(nation, this.formations, this.units))
      .filter(Boolean) as Array<{ metrics: Record<string, number> }>;
    if (!scores.length) return [];
    const average = (key: string) =>
      scores.reduce((sum, entry) => sum + (entry.metrics[key] ?? 0), 0) / scores.length;
    const descriptors = [
      { key: "supplyEfficiency", label: "Supply efficiency" },
      { key: "aoSize", label: "AO span" },
      { key: "strategicMomentum", label: "Strategic momentum" },
      { key: "maneuverSpeed", label: "Maneuver speed" },
    ];
    return descriptors.map(({ key, label }) => ({
      label,
      value: average(key).toFixed(1),
    }));
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

  private normalizeStatValue(statKey: RadarStatKey, raw: unknown): number | undefined {
    const measurement = this.extractMeasurement(raw);
    if (!measurement) return undefined;
    const { numeric, unit } = measurement;
    switch (statKey) {
      case "speed":
        return this.normalizeSpeed(numeric, unit);
      case "weight":
        return this.normalizeWeight(numeric, unit);
      default:
        return numeric;
    }
  }

  private extractMeasurement(value: unknown): { numeric: number; unit?: string } | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "number" && Number.isFinite(value)) {
      return { numeric: value };
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const normalized = trimmed.replace(/,/g, "");
      const match = normalized.match(/(-?\d+(?:\.\d+)?)(.*)/);
      if (!match) return undefined;
      const numeric = Number(match[1]);
      if (!Number.isFinite(numeric)) return undefined;
      const unit = match[2]?.trim().toLowerCase() || undefined;
      return { numeric, unit };
    }
    return undefined;
  }

  private normalizeSpeed(value: number, unit?: string): number {
    if (!unit) return value;
    if (/m\/s|mps/.test(unit)) return value;
    if (/km|kph|kilometer/.test(unit)) return value / 3.6;
    if (/mph|mile/.test(unit)) return value * 0.44704;
    if (/knot|kt/.test(unit)) return value * 0.514444;
    if (/ft\/s|fps/.test(unit)) return value * 0.3048;
    return value;
  }

  private normalizeWeight(value: number, unit?: string): number {
    if (!unit) return value;
    if (/kg/.test(unit)) return value;
    if (/lb|pound/.test(unit)) return value * 0.453592;
    if (/ton/.test(unit)) return value * 1000;
    if (/g\b|gram/.test(unit)) return value / 1000;
    return value;
  }

  private transformWeightForDisplay(value: number, min?: number, max?: number): number {
    if (max === undefined || min === undefined || max === min) {
      const normalized = value > 0 ? 1 / value : 0;
      return Number((normalized * 100).toFixed(2));
    }
    const inverted = max - value;
    const normalized = inverted / (max - min);
    return Number((normalized * 100).toFixed(2));
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
