(function initHelpers() {
  function valueOrNA(value) {
    return value === undefined || value === null || value === "" ? "N/A" : value;
  }

  function yesNo(value) {
    if (value === undefined || value === null) return "N/A";
    return value === true || value === "true" ? "Yes" : value === false || value === "false" ? "No" : value;
  }

  function parseBoolish(value) {
    if (value === "" || value === undefined || value === null) return "";
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
  }

  function createPill(label, value) {
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
  }

  function sectionTitle(text) {
    const el = document.createElement("div");
    el.className = "section-title";
    el.textContent = text;
    return el;
  }

  function getTagColor(kind, key, weaponTags) {
    if (!key || !weaponTags) return null;
    if (kind === "category") return weaponTags.categories[key] || null;
    if (kind === "caliber") return weaponTags.calibers[key] || null;
    return null;
  }

  function toNumber(val) {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const m = val.match(/-?\d+(\.\d+)?/);
      return m ? parseFloat(m[0]) : 0;
    }
    return 0;
  }

  function formatWithUnit(val, unit) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const num = toNumber(val);
    if (Number.isNaN(num)) return valueOrNA(val);
    return `${num} ${unit}`;
  }

  function formatPercent(val) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const num = toNumber(val);
    if (Number.isNaN(num)) return valueOrNA(val);
    return `${num}%`;
  }

  function formatSpeed(val) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const mps = toNumber(val);
    if (Number.isNaN(mps)) return valueOrNA(val);
    const kph = (mps * 3.6).toFixed(1);
    return `${mps} m/s (${kph} km/h)`;
  }

  function formatPoints(val) {
    if (val === "" || val === undefined || val === null) return "N/A";
    const num = toNumber(val);
    if (Number.isNaN(num)) return valueOrNA(val);
    return `${num} pts`;
  }

  function armorScore(armor) {
    const text = typeof armor === "string" ? armor.toLowerCase() : "";
    if (!text && typeof armor !== "number") return 5;
    if (text.includes("era") || text.includes("composite") || text.includes("heavy")) return 40;
    if (text.includes("kevlar") || text.includes("lvl") || text.includes("iii")) return 25;
    if (text.includes("light")) return 15;
    return Math.max(5, Math.min(35, toNumber(armor) * 2));
  }

  function clampScore(num) {
    return Math.max(0, Math.min(100, Math.round(num)));
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function scoreUnitDetailed(unit, helpers = { toNumber, clampScore, armorScore }) {
  if (!unit) return null;
  const guns = Array.isArray(unit.guns) ? unit.guns : [];
  const caps = unit.capabilities || {};
  const stats = unit.stats || {};
  const gren = unit.grenades || {};

  const ammoListFlat = guns.flatMap((g) => (Array.isArray(g.ammoTypes) ? g.ammoTypes : []));
  const maxAmmoPen = Math.max(0, ...ammoListFlat.map((a) => helpers.toNumber(a.penetration) || 0));
  const maxAmmoHE = Math.max(0, ...ammoListFlat.map((a) => helpers.toNumber(a.heDeadliness) || 0));
  const avgRangeMod = ammoListFlat.length
    ? ammoListFlat.reduce((sum, a) => sum + (helpers.toNumber(a.rangeMod) || 0), 0) / ammoListFlat.length
    : 0;

  const lethality = helpers.clampScore(
    guns.reduce(
      (sum, g) =>
        sum +
        helpers.toNumber(g.totalAmmo || g.ammoPerSoldier) * 0.4 +
        Math.max(1, helpers.toNumber(g.count) || 1) * 4 +
        (helpers.toNumber(g.muzzleVelocity) || 0) * 0.05,
      0
    ) +
      helpers.toNumber(gren.total) * 2 +
      maxAmmoPen * 0.6 +
      maxAmmoHE * 1.5
  );
  const survivability = helpers.clampScore(helpers.armorScore(stats.armor) + helpers.toNumber(stats.health) * 0.5);
  const sustainability = helpers.clampScore(80 - helpers.toNumber(stats.weight) * 5 - helpers.toNumber(unit.price) * 0.001);
  const mobility = helpers.clampScore(helpers.toNumber(stats.speed) * 6 + helpers.toNumber(caps?.sprint?.speed) * 2);
  const versatility = helpers.clampScore(
    guns.length * 6 +
      new Set(guns.map((g) => (g.category || "").toLowerCase())).size * 4 +
      ammoListFlat.length * 2 +
      avgRangeMod * 0.3
  );
  const stealth = helpers.clampScore(helpers.toNumber(stats.stealth));
  const speed = helpers.clampScore(helpers.toNumber(stats.speed) * 10);
  const morale = helpers.clampScore(50 + helpers.toNumber(stats.health) * 0.2 + helpers.toNumber(unit.tier) * 4);
  const training = helpers.clampScore(helpers.toNumber(unit.tier) * 10);
  const antiInfantry = helpers.clampScore(
    guns.reduce((sum, g) => sum + (helpers.toNumber(g.heDeadliness) || maxAmmoHE ? 10 : 5), 0) +
      helpers.toNumber(gren.frag) * 6
  );
  const antiTank = helpers.clampScore(
    maxAmmoPen * 0.5 +
      guns.reduce((sum, g) => sum + ((g.category || "").toLowerCase().includes("launcher") ? 15 : 0), 0)
  );
  const antiAir = helpers.clampScore(
    guns.reduce((sum, g) => sum + ((g.category || "").toLowerCase().includes("aa") ? 20 : 0), 0)
  );

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
  }

  function scoreFormationDetailed(formation, units, helpers = { clampScore }) {
  if (!formation) return null;
  const unitIds = [];
  (formation.categories || []).forEach((cat) => (cat.units || []).forEach((uid) => unitIds.push(uid)));
  if (!unitIds.length) return null;
  const metricsArray = unitIds
    .map((uid) => scoreUnitDetailed(units[uid]))
    .filter(Boolean)
    .map((s) => s.metrics);
  if (!metricsArray.length) return null;
  const avg = (field) => metricsArray.reduce((sum, m) => sum + (m[field] || 0), 0) / metricsArray.length;

  const recon = helpers.clampScore(avg("stealth") + avg("speed") * 0.5);
  const support = helpers.clampScore(avg("sustainability") + avg("versatility") * 0.5);
  const armor = helpers.clampScore(avg("survivability"));
  const infantry = helpers.clampScore(
    unitIds.reduce((sum, uid) => {
      const u = units[uid];
      return sum + ((u?.internalCategory || "").toUpperCase() === "INF" ? 8 : 0);
    }, 0)
  );
  const logistics = helpers.clampScore(
    unitIds.reduce((sum, uid) => {
      const u = units[uid];
      return sum + ((u?.internalCategory || "").toUpperCase() === "LOG" ? 10 : 0);
    }, 0) + avg("sustainability") * 0.5
  );
  const air = helpers.clampScore(
    unitIds.reduce((sum, uid) => {
      const u = units[uid];
      return sum + ((u?.internalCategory || "").toUpperCase() === "AIR" ? 10 : 0);
    }, 0)
  );
  const sustaiment = helpers.clampScore(avg("sustainability"));
  const speed = helpers.clampScore(avg("speed"));
  const supplyEfficiency = helpers.clampScore(90 - avg("mobility") * 0.3 + avg("sustainability") * 0.2);
  const aoSize = helpers.clampScore(unitIds.length * 5);
  const versatility = helpers.clampScore(avg("versatility"));

  return {
    metrics: {
      recon,
      support,
      armor,
      infantry,
      logistics,
      air,
      sustaiment,
      speed,
      supplyEfficiency,
      aoSize,
      versatility,
    },
  };
  }

  function scoreNationDetailed(nation, formations, units, helpers = { clampScore }) {
  if (!nation) return null;
  const formationIds = nation.formations || [];
  if (!formationIds.length) return null;
  const metricsArray = formationIds
    .map((fid) => scoreFormationDetailed(formations[fid], units))
    .filter(Boolean)
    .map((s) => s.metrics);
  if (!metricsArray.length) return null;
  const avg = (field) => metricsArray.reduce((sum, m) => sum + (m[field] || 0), 0) / metricsArray.length;

  const strategicMomentum = helpers.clampScore(avg("versatility") + avg("speed") * 0.5 + avg("armor") * 0.3);
  const supplyEfficiency = helpers.clampScore(avg("supplyEfficiency") + avg("logistics") * 0.5);
  const aoSize = helpers.clampScore(metricsArray.length * 10);
  const maneuverSpeed = helpers.clampScore(avg("speed"));

  return {
    metrics: {
      strategicMomentum,
      supplyEfficiency,
      aoSize,
      maneuverSpeed,
    },
  };
  }

  window.RTS = window.RTS || {};
  window.RTS.helpers = {
    valueOrNA,
    yesNo,
    parseBoolish,
    createPill,
    sectionTitle,
    getTagColor,
    toNumber,
    formatWithUnit,
    formatPercent,
    formatSpeed,
    formatPoints,
    armorScore,
    clampScore,
    deepClone,
    scoreUnitDetailed,
    scoreFormationDetailed,
    scoreNationDetailed,
  };
})();
