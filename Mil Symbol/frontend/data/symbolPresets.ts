import type { MilitarySymbol } from "../types";

export interface SymbolPreset {
    id: string;
    name: string;
    description?: string;
    category: string;
    symbol: MilitarySymbol;
}

export interface SymbolPresetGroup {
    id: string;
    label: string;
    presets: SymbolPreset[];
}

export const symbolPresetGroups: SymbolPresetGroup[] = [
    {
        id: "maneuver",
        label: "Ground maneuver",
        presets: [
            {
                id: "infantry",
                name: "Infantry (line)",
                description: "Generic light infantry unit",
                category: "maneuver",
                symbol: {
                    sidc: "SFGPUCI----US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "mech-infantry",
                name: "Mechanized infantry",
                description: "Infantry riding armored carriers",
                category: "maneuver",
                symbol: {
                    sidc: "SFGPUCIM---US",
                    affiliation: "friendly",
                    status: "present",
                    echelon: "Company",
                },
            },
            {
                id: "armor",
                name: "Armor",
                description: "Tank or armored company",
                category: "maneuver",
                symbol: {
                    sidc: "SFGPUCA----US",
                    affiliation: "friendly",
                    status: "present",
                    echelon: "Company",
                },
            },
            {
                id: "recon",
                name: "Recon / cavalry",
                description: "Scout squadron or troop",
                category: "maneuver",
                symbol: {
                    sidc: "SFGPUCR----US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "airborne",
                name: "Airborne assault",
                description: "Parachute-capable formation",
                category: "maneuver",
                symbol: {
                    sidc: "SFGPUCAB---US",
                    affiliation: "friendly",
                    status: "present",
                    echelon: "Battalion",
                },
            },
        ],
    },
    {
        id: "fires",
        label: "Fires & air defense",
        presets: [
            {
                id: "artillery",
                name: "Field artillery",
                description: "Tube or rocket battery",
                category: "fires",
                symbol: {
                    sidc: "SFGPUCAT---US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "air-defense",
                name: "Air defense",
                description: "SHORAD or SAM unit",
                category: "fires",
                symbol: {
                    sidc: "SFGPUCAD---US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "targeting",
                name: "Fires support / FDC",
                description: "Fire support coordination element",
                category: "fires",
                symbol: {
                    sidc: "SFGPUCF----US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
        ],
    },
    {
        id: "special",
        label: "Recon & SOF",
        presets: [
            {
                id: "special-operations",
                name: "Special operations",
                description: "SOF task unit",
                category: "special",
                symbol: {
                    sidc: "SFGPUCSF---US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "sniper",
                name: "Sniper / marksman",
                description: "Dedicated marksman detachment",
                category: "special",
                symbol: {
                    sidc: "SFGPUCSN---US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
        ],
    },
    {
        id: "support",
        label: "Support & logistics",
        presets: [
            {
                id: "logistics",
                name: "Logistics",
                description: "Supply or sustainment unit",
                category: "support",
                symbol: {
                    sidc: "SFGPUCL----US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "medical",
                name: "Medical",
                description: "Medical company or detachment",
                category: "support",
                symbol: {
                    sidc: "SFGPUCM---US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "engineering",
                name: "Combat engineers",
                description: "Engineer company",
                category: "support",
                symbol: {
                    sidc: "SFGPUCE----US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
            {
                id: "signals",
                name: "Signals / comms",
                description: "Signal company",
                category: "support",
                symbol: {
                    sidc: "SFGPUCS----US",
                    affiliation: "friendly",
                    status: "present",
                },
            },
        ],
    },
];

const presetIndex = new Map<string, SymbolPreset>();
const sidcIndex = new Map<string, SymbolPreset>();

for (const group of symbolPresetGroups) {
    for (const preset of group.presets) {
        presetIndex.set(preset.id, preset);
        sidcIndex.set(preset.symbol.sidc.toUpperCase(), preset);
    }
}

export function findSymbolPresetById(id: string): SymbolPreset | undefined {
    return presetIndex.get(id);
}

export function findSymbolPresetBySidc(sidc?: string): SymbolPreset | undefined {
    if (!sidc) return undefined;
    return sidcIndex.get(sidc.toUpperCase());
}
