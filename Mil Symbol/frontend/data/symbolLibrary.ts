export interface SymbolFunctionTemplate {
    id: string;
    label: string;
    description: string;
    sidc: string;
    dimension: string;
    functionId: string;
    modifier1?: string;
    modifier2?: string;
}

export const SYMBOL_FUNCTION_LIBRARY: SymbolFunctionTemplate[] = [
    {
        id: "infantry",
        label: "Infantry",
        description: "General-purpose infantry element.",
        sidc: "SFGPUCI----US",
        dimension: "G",
        functionId: "UCI---",
    },
    {
        id: "light-infantry",
        label: "Light infantry",
        description: "Foot-mobile or light motorized force.",
        sidc: "SFGPUCL----US",
        dimension: "G",
        functionId: "UCL---",
    },
    {
        id: "armor",
        label: "Armor",
        description: "Main battle tank or armored unit.",
        sidc: "SFGPUCAT---US",
        dimension: "G",
        functionId: "UCAT--",
    },
    {
        id: "recon",
        label: "Recon",
        description: "Reconnaissance / cavalry troop.",
        sidc: "SFGPUCRV---US",
        dimension: "G",
        functionId: "UCRV--",
    },
    {
        id: "artillery",
        label: "Artillery",
        description: "Tube / rocket artillery battery.",
        sidc: "SFGPUCAA---US",
        dimension: "G",
        functionId: "UCAA--",
    },
    {
        id: "air-defense",
        label: "Air defense",
        description: "Short-range air defense asset.",
        sidc: "SFGPUCAD---US",
        dimension: "G",
        functionId: "UCAD--",
    },
    {
        id: "logistics",
        label: "Logistics",
        description: "Sustainment / logistics company.",
        sidc: "SFGPUCSA---US",
        dimension: "G",
        functionId: "UCSA--",
    },
    {
        id: "naval",
        label: "Naval",
        description: "Surface combatant placeholder.",
        sidc: "SFFPUS-----US",
        dimension: "S",
        functionId: "US----",
    },
];

export interface SymbolModifierInfo {
    code: string;
    name: string;
    description: string;
}

export const SYMBOL_MODIFIER_LIBRARY: SymbolModifierInfo[] = [
    { code: "AA", name: "Air assault", description: "Rotary-wing inserted infantry or task force." },
    { code: "AB", name: "Airborne", description: "Parachute-qualified / drop-capable element." },
    { code: "MT", name: "Mountain", description: "Mountain-trained or terrain-specialized force." },
    { code: "MS", name: "Mechanized", description: "Infantry riding armored carriers." },
    { code: "AT", name: "Anti-armor", description: "Dedicated anti-armor capability." },
    { code: "CB", name: "Chemical / biological", description: "CBRN or decontamination unit." },
    { code: "SU", name: "Security", description: "Security / screening mission." },
    { code: "SO", name: "Special operations", description: "SOF-qualified element." },
];
