import type { Unit, Formation, Nation, SubFormationAttachment } from "../types";

export const valueOrNA = (value: unknown): string => {
  if (value === undefined || value === null || value === "") return "N/A";
  return String(value);
};

export const yesNo = (value: unknown): string => {
  if (value === undefined || value === null) return "N/A";
  if (value === true || value === "true") return "Yes";
  if (value === false || value === "false") return "No";
  return String(value);
};

export const parseBoolish = (value: unknown): boolean | "" => {
  if (value === "" || value === undefined || value === null) return "";
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return "";
};

export const createPill = (label: string, value: unknown): HTMLDivElement => {
  const pill = document.createElement("div");
  pill.className = "stat-pill";
  const key = document.createElement("span");
  key.className = "label";
  key.textContent = label;
  const val = document.createElement("span");
  val.className = "strong";
  val.textContent = valueOrNA(value);
  pill.append(key, val);
  return pill;
};

export const sectionTitle = (text: string): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "section-title";
  el.textContent = text;
  return el;
};

export const getTagColor = (
  kind: "category" | "caliber",
  key: string | undefined,
  weaponTags?: { categories?: Record<string, string>; calibers?: Record<string, string> }
): string | null => {
  if (!key || !weaponTags) return null;
  if (kind === "category") return weaponTags.categories?.[key] ?? null;
  if (kind === "caliber") return weaponTags.calibers?.[key] ?? null;
  return null;
};

export const toNumber = (val: unknown): number => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const m = val.match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  }
  return 0;
};

export const formatWithUnit = (val: unknown, unit: string): string => {
  if (val === "" || val === undefined || val === null) return "N/A";
  const num = toNumber(val);
  if (Number.isNaN(num)) return valueOrNA(val);
  return `${num} ${unit}`;
};

export const formatPercent = (val: unknown): string => {
  if (val === "" || val === undefined || val === null) return "N/A";
  const num = toNumber(val);
  if (Number.isNaN(num)) return valueOrNA(val);
  return `${num}%`;
};

export const formatSpeed = (val: unknown): string => {
  if (val === "" || val === undefined || val === null) return "N/A";
  const mps = toNumber(val);
  if (Number.isNaN(mps)) return valueOrNA(val);
  const kph = (mps * 3.6).toFixed(1);
  return `${mps} m/s (${kph} kp/h)`;
};

export const formatPoints = (val: unknown): string => {
  if (val === "" || val === undefined || val === null) return "N/A";
  const num = toNumber(val);
  if (Number.isNaN(num)) return valueOrNA(val);
  return `${num} pts`;
};

export const armorScore = (armor: unknown): number => {
  const text = typeof armor === "string" ? armor.toLowerCase() : "";
  if (!text && typeof armor !== "number") return 5;
  if (text.includes("era") || text.includes("composite") || text.includes("heavy")) return 40;
  if (text.includes("kevlar") || text.includes("lvl") || text.includes("iii")) return 25;
  if (text.includes("light")) return 15;
  return Math.max(5, Math.min(35, toNumber(armor) * 2));
};

export const clampScore = (num: number): number => Math.max(0, Math.min(100, Math.round(num)));

export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const toNumericId = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const indexById = <T extends { id?: number | string }>(items: T[]): Map<number, T> => {
  const map = new Map<number, T>();
  items.forEach((item) => {
    if (!item) return;
    const numericId = toNumericId(item.id);
    if (numericId !== undefined) {
      map.set(numericId, item);
    }
  });
  return map;
};

const resolveUnitReference = (reference: unknown, units: Unit[], lookup: Map<number, Unit>): Unit | undefined => {
  const numericId = toNumericId(reference);
  if (numericId === undefined) return undefined;
  if (lookup.has(numericId)) return lookup.get(numericId);
  if (numericId >= 0 && numericId < units.length) return units[numericId];
  return undefined;
};

const resolveFormationReference = (
  reference: unknown,
  formations: Formation[],
  lookup: Map<number, Formation>
): Formation | undefined => {
  const numericId = toNumericId(reference);
  if (numericId === undefined) return undefined;
  if (lookup.has(numericId)) return lookup.get(numericId);
  if (numericId >= 0 && numericId < formations.length) return formations[numericId];
  const oneBasedIndex = numericId - 1;
  if (oneBasedIndex >= 0 && oneBasedIndex < formations.length) return formations[oneBasedIndex];
  return undefined;
};

const collectSubFormationReferences = (formation: Formation): number[] => {
  const refs = new Set<number>();
  (formation.subFormations || []).forEach((value) => {
    const numericId = toNumericId(value);
    if (numericId !== undefined) refs.add(numericId);
  });
  (formation.subFormationLinks || []).forEach((link) => {
    if (!link || typeof link !== "object") return;
    const attachment = link as SubFormationAttachment & { id?: number | string; childId?: number | string };
    const numericId =
      toNumericId(attachment.formationId) ?? toNumericId(attachment.id) ?? toNumericId(attachment.childId);
    if (numericId !== undefined) refs.add(numericId);
  });
  return Array.from(refs);
};

const gatherUnitsForFormation = (
  root: Formation,
  units: Unit[],
  unitLookup: Map<number, Unit>,
  formations: Formation[],
  formationLookup: Map<number, Formation>
): Unit[] => {
  const resolved: Unit[] = [];
  const seenUnits = new Set<Unit>();
  const visitedFormations = new Set<Formation>();

  const visit = (node: Formation | undefined): void => {
    if (!node || visitedFormations.has(node)) return;
    visitedFormations.add(node);
    (node.categories || []).forEach((category) => {
      (category.units || []).forEach((unitRef) => {
        const unit = resolveUnitReference(unitRef, units, unitLookup);
        if (unit && !seenUnits.has(unit)) {
          seenUnits.add(unit);
          resolved.push(unit);
        }
      });
    });
    collectSubFormationReferences(node).forEach((childRef) => {
      const child = resolveFormationReference(childRef, formations, formationLookup);
      if (child) visit(child);
    });
  };

  visit(root);
  return resolved;
};

export const scoreUnitDetailed = (
  unit: Unit | undefined
): { metrics: Record<string, number> } | null => {
  if (!unit) return null;
  const guns = Array.isArray(unit.guns) ? unit.guns : [];
  const caps = unit.capabilities || {};
  const stats = unit.stats || {};
  const gren = unit.grenades || {};

  const lethality = clampScore(
    guns.reduce((sum, g) => sum + toNumber(g.totalAmmo || g.ammoPerSoldier) * 0.4, 0) +
    toNumber(gren.total) * 2
  );
  const survivability = clampScore(armorScore(stats.armor) + toNumber(stats.health) * 0.5);
  const sustainability = clampScore(80 - toNumber(stats.weight) * 5 - toNumber(unit.price) * 0.001);
  const mobility = clampScore(toNumber(stats.speed) * 6 + toNumber(caps?.sprint?.speed) * 2);
  const versatility = clampScore(guns.length * 6);
  const stealth = clampScore(toNumber(stats.stealth));
  const speed = clampScore(toNumber(stats.speed) * 10);
  const morale = clampScore(50 + toNumber(stats.health) * 0.2 + toNumber(unit.tier) * 4);
  const training = clampScore(toNumber(unit.tier) * 10);
  const antiInfantry = clampScore(toNumber(gren.frag) * 6);
  const antiTank = clampScore(guns.reduce((sum, g) => sum + (g.category?.includes("Launcher") ? 15 : 0), 0));
  const antiAir = clampScore(guns.reduce((sum, g) => sum + (g.category?.includes("AA") ? 20 : 0), 0));

  return {
    metrics: {
      lethality,
      survivability,
      sustainability,
      mobility,
      versatility,
      stealth,
      speed,
      morale,
      training,
      antiInfantry,
      antiTank,
      antiAir,
    },
  };
};

export const scoreFormationDetailed = (
  formation: Formation | undefined,
  units: Unit[],
  allFormations: Formation[] = []
): { metrics: Record<string, number> } | null => {
  if (!formation) return null;
  const unitLookup = indexById(units);
  const formationLookup = indexById(allFormations);
  const resolvedUnits = gatherUnitsForFormation(formation, units, unitLookup, allFormations, formationLookup);
  if (!resolvedUnits.length) return null;
  const metricsArray = resolvedUnits
    .map((unit) => scoreUnitDetailed(unit))
    .filter(Boolean) as { metrics: Record<string, number> }[];
  if (!metricsArray.length) return null;
  const avg = (field: string) =>
    metricsArray.reduce((sum, m) => sum + (m.metrics[field] || 0), 0) / metricsArray.length;
  return {
    metrics: {
      recon: clampScore(avg("stealth") + avg("speed") * 0.5),
      support: clampScore(avg("sustainability") + avg("versatility") * 0.5),
      armor: clampScore(avg("survivability")),
      infantry: clampScore(avg("lethality")),
      logistics: clampScore(avg("sustainability")),
      air: clampScore(avg("antiAir")),
      sustaiment: clampScore(avg("sustainability")),
      speed: clampScore(avg("speed")),
      supplyEfficiency: clampScore(90 - avg("mobility") * 0.3 + avg("sustainability") * 0.2),
      aoSize: clampScore(resolvedUnits.length * 5),
      versatility: clampScore(avg("versatility")),
    },
  };
};

export const scoreNationDetailed = (
  nation: Nation | undefined,
  formations: Formation[],
  units: Unit[]
): { metrics: Record<string, number> } | null => {
  if (!nation) return null;
  const formationRefs = nation.formations || [];
  if (!formationRefs.length) return null;
  const formationLookup = indexById(formations);
  const metricsArray = formationRefs
    .map((ref) => resolveFormationReference(ref, formations, formationLookup))
    .map((formation) => scoreFormationDetailed(formation, units, formations))
    .filter(Boolean) as { metrics: Record<string, number> }[];
  if (!metricsArray.length) return null;
  const avg = (field: string) =>
    metricsArray.reduce((sum, m) => sum + (m.metrics[field] || 0), 0) / metricsArray.length;
  return {
    metrics: {
      strategicMomentum: clampScore(avg("versatility") + avg("speed") * 0.5 + avg("armor") * 0.3),
      supplyEfficiency: clampScore(avg("supplyEfficiency") + avg("logistics") * 0.5),
      aoSize: clampScore(metricsArray.length * 10),
      maneuverSpeed: clampScore(avg("speed")),
    },
  };
};
