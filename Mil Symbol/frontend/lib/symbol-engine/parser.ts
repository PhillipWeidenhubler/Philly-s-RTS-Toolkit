import type { ParsedSidc, SymbolDimension } from "./types";

const AFFILIATION_CODES: Record<string, string> = {
    P: "unknown",
    U: "unknown",
    A: "friendly",
    F: "friendly",
    D: "friendly",
    M: "friendly",
    N: "neutral",
    L: "neutral",
    H: "hostile",
    J: "hostile",
    K: "hostile",
    S: "hostile",
    G: "hostile",
};

const DIMENSION_CODES: Record<string, SymbolDimension> = {
    A: "air",
    F: "air",
    G: "ground",
    Z: "ground",
    O: "ground",
    S: "sea",
    W: "sea",
    J: "subsurface",
    U: "subsurface",
    X: "space",
    P: "space",
};

const STATUS_CODES: Record<string, "present" | "anticipated"> = {
    P: "present",
    C: "present",
    D: "present",
    X: "present",
    A: "anticipated",
    F: "anticipated",
    S: "anticipated",
};

export function parseSidc(sidc: string): ParsedSidc {
    const sanitized = sanitizeSidc(sidc);
    const affiliation = AFFILIATION_CODES[sanitized[1]] ?? "friendly";
    const dimension = DIMENSION_CODES[sanitized[2]] ?? "ground";
    const status = STATUS_CODES[sanitized[3]] ?? "present";
    const functionId = sanitized.slice(4, 10);
    const modifier1 = sanitized.slice(10, 12);
    const modifier2 = sanitized.slice(12, 14);

    return {
        raw: sanitized,
        affiliation,
        dimension,
        status,
        functionId,
        modifier1: isPlaceholder(modifier1) ? undefined : modifier1,
        modifier2: isPlaceholder(modifier2) ? undefined : modifier2,
    };
}

function sanitizeSidc(value: string): string {
    if (!value) return "".padEnd(15, "-");
    const trimmed = value.replace(/\s+/g, "").toUpperCase();
    return trimmed.padEnd(15, "-").slice(0, 15);
}

function isPlaceholder(value: string): boolean {
    return !value || /^[-0]+$/.test(value);
}
