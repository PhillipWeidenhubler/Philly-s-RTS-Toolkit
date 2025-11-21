import { deepClone } from "../lib/helpers";
import type {
    AmmoTemplate,
    AppSettings,
    FireModeTemplate,
    Formation,
    Nation,
    Unit,
    WeaponTagMap,
    WeaponTemplate,
} from "../types";

const sampleUnits: Unit[] = [
    {
        id: 1,
        name: "Pathfinder Platoon",
        category: "INF",
        tier: "Elite",
        price: 1200,
        stats: { armor: 25, health: 80, squadSize: 12, speed: 4.5 },
        grenades: { frag: 4, smoke: 2, total: 6 },
        capabilities: { staticLineJump: true, haloHaho: true, sprint: { distance: 200, speed: 6 } },
        guns: [
            {
                name: "M4A1",
                category: "Rifle",
                ammoPerSoldier: 180,
                totalAmmo: 2160,
                traits: ["Suppressed", "Thermal"],
            },
        ],
    },
];

const sampleFormations: Formation[] = [
    {
        id: 1,
        name: "173rd ABN",
        role: "Rapid deployment",
        categories: [
            {
                name: "Infantry",
                units: [1],
            },
        ],
    },
];

const sampleNations: Nation[] = [
    {
        id: 1,
        name: "NATO",
        formations: [1],
    },
];

const sampleWeapons: WeaponTemplate[] = [
    {
        id: 100,
        name: "M2 Browning",
        category: "HMG",
        caliber: ".50 BMG",
    },
];

const sampleAmmo: AmmoTemplate[] = [
    {
        id: 200,
        name: "AP",
        ammoType: ".50 BMG",
        penetration: 30,
    },
];

const sampleFireModes: FireModeTemplate[] = [
    {
        id: 300,
        name: "Rapid",
        rounds: 12,
    },
];

const sampleWeaponTags: WeaponTagMap = {
    categories: { Rifle: "#4cc9f0", HMG: "#f72585" },
    calibers: { ".50 BMG": "#4361ee" },
};

const sampleSettings: AppSettings = {
    theme: "dark",
    accentColor: "#6dd5fa",
};

const sandboxDb = {
    units: deepClone(sampleUnits),
    formations: deepClone(sampleFormations),
    nations: deepClone(sampleNations),
    weapons: deepClone(sampleWeapons),
    ammo: deepClone(sampleAmmo),
    fireModes: deepClone(sampleFireModes),
    weaponTags: deepClone(sampleWeaponTags),
    settings: { ...sampleSettings },
};

const nextUnitId = (): number => {
    const maxExisting = sandboxDb.units.reduce((max, unit) => Math.max(max, unit.id ?? 0), 0);
    return maxExisting + 1;
};

export const sandboxHandlers = {
    getUnits: () => ({ units: deepClone(sandboxDb.units) }),
    saveUnit: (unit: Unit) => {
        const copy = deepClone(unit);
        if (!copy.id) {
            copy.id = nextUnitId();
            sandboxDb.units.push(copy);
        } else {
            const index = sandboxDb.units.findIndex((u) => u.id === copy.id);
            if (index >= 0) {
                sandboxDb.units[index] = copy;
            } else {
                sandboxDb.units.push(copy);
            }
        }
        return { units: deepClone(sandboxDb.units) };
    },
    deleteUnit: (id: number) => {
        sandboxDb.units = sandboxDb.units.filter((unit) => unit.id !== id);
        return { units: deepClone(sandboxDb.units) };
    },
    getFormations: () => ({ formations: deepClone(sandboxDb.formations) }),
    saveFormations: (formations: Formation[]) => {
        sandboxDb.formations = deepClone(formations);
        return { formations: deepClone(sandboxDb.formations) };
    },
    getNations: () => ({ nations: deepClone(sandboxDb.nations) }),
    saveNations: (nations: Nation[]) => {
        sandboxDb.nations = deepClone(nations);
        return { nations: deepClone(sandboxDb.nations) };
    },
    getWeapons: () => ({ weapons: deepClone(sandboxDb.weapons) }),
    saveWeapons: (weapons: WeaponTemplate[]) => {
        sandboxDb.weapons = deepClone(weapons);
        return { weapons: deepClone(sandboxDb.weapons) };
    },
    getAmmo: () => ({ ammo: deepClone(sandboxDb.ammo) }),
    saveAmmo: (ammo: AmmoTemplate[]) => {
        sandboxDb.ammo = deepClone(ammo);
        return { ammo: deepClone(sandboxDb.ammo) };
    },
    getFireModes: () => ({ fireModes: deepClone(sandboxDb.fireModes) }),
    saveFireModes: (fireModes: FireModeTemplate[]) => {
        sandboxDb.fireModes = deepClone(fireModes);
        return { fireModes: deepClone(sandboxDb.fireModes) };
    },
    getWeaponTags: () => sandboxDb.weaponTags,
    saveWeaponTags: (tags: WeaponTagMap) => {
        sandboxDb.weaponTags = deepClone(tags);
        return sandboxDb.weaponTags;
    },
    getSettings: () => sandboxDb.settings,
    saveSettings: (settings: AppSettings) => {
        sandboxDb.settings = { ...settings };
        return sandboxDb.settings;
    },
};
