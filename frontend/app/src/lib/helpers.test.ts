import { describe, expect, it } from "vitest";
import type { Formation, Nation, Unit } from "../types";
import {
    armorScore,
    formatSpeed,
    parseBoolish,
    scoreFormationDetailed,
    scoreNationDetailed,
    valueOrNA,
    yesNo,
} from "./helpers";

const buildUnits = (): Unit[] => [
    {
        id: 1,
        name: "Alpha",
        price: 1000,
        tier: "3",
        stats: { armor: 20, health: 60, speed: 5, stealth: 30, weight: 4 },
        capabilities: { sprint: { speed: 4 } },
        grenades: { total: 3, frag: 2 },
        guns: [{ totalAmmo: 100, category: "Launcher" }],
    },
    {
        id: 2,
        name: "Bravo",
        price: 800,
        tier: "2",
        stats: { armor: 10, health: 40, speed: 6, stealth: 20, weight: 3 },
        capabilities: { sprint: { speed: 5 } },
        grenades: { total: 2, frag: 1 },
        guns: [{ totalAmmo: 60, category: "AA" }],
    },
];

describe("helpers", () => {
    it("falls back to N/A when value is empty", () => {
        expect(valueOrNA(null)).toBe("N/A");
        expect(valueOrNA("")).toBe("N/A");
        expect(valueOrNA(5)).toBe("5");
    });

    it("normalizes booleanish values", () => {
        expect(yesNo(true)).toBe("Yes");
        expect(yesNo("false")).toBe("No");
        expect(parseBoolish("")).toBe("");
    });

    it("formats speed with metric and imperial units", () => {
        expect(formatSpeed(5)).toBe("5 m/s (18.0 kp/h)");
        expect(formatSpeed("3.5")).toBe("3.5 m/s (12.6 kp/h)");
        expect(formatSpeed(undefined)).toBe("N/A");
    });

    it("estimates armor score using heuristics", () => {
        expect(armorScore("ERA composite")).toBe(40);
        expect(armorScore("kevlar vest")).toBe(25);
        expect(armorScore(12)).toBe(24);
    });
});

describe("scoreFormationDetailed", () => {
    it("returns null when formation data is missing", () => {
        expect(scoreFormationDetailed(undefined, [])).toBeNull();
    });

    it("aggregates assigned units into averaged metrics", () => {
        const units = buildUnits();
        const formation: Formation = {
            id: 10,
            name: "Task Force",
            categories: [{ name: "Assault", units: [1, 2] }],
        };
        const result = scoreFormationDetailed(formation, units, [formation]);
        expect(result).not.toBeNull();
        expect(result?.metrics).toMatchObject({
            recon: 53,
            armor: 53,
            air: 10,
            supplyEfficiency: 90,
            speed: 55,
            versatility: 6,
        });
    });
});

describe("scoreNationDetailed", () => {
    it("returns null without assigned formations", () => {
        expect(scoreNationDetailed({ id: 1, name: "Empty" }, [], [])).toBeNull();
    });

    it("rolls formation insights into a national posture", () => {
        const units = buildUnits();
        const formation: Formation = {
            id: 10,
            name: "Task Force",
            categories: [{ name: "Assault", units: [1, 2] }],
        };
        const nation: Nation = { id: 7, name: "Avalon", formations: [10] };
        const result = scoreNationDetailed(nation, [formation], units);
        expect(result).not.toBeNull();
        expect(result?.metrics).toMatchObject({
            strategicMomentum: 49,
            supplyEfficiency: 100,
            aoSize: 10,
            maneuverSpeed: 55,
        });
    });
});
