import type { MilitarySymbol } from "../types";
import { renderSpatialSymbol } from "../lib/spatial-symbol";
import type { SymbolRenderOptions, SymbolRenderTheme } from "../lib/spatial-symbol";

export type { SymbolRenderOptions, SymbolRenderTheme } from "../lib/spatial-symbol";

const AFFILIATION_MAP: Record<string, string> = {
    friendly: "friendly",
    hostile: "hostile",
    neutral: "neutral",
    unknown: "unknown",
};

const STATUS_MAP: Record<string, string> = {
    present: "Present",
    anticipated: "Anticipated",
};

export function renderSymbolSVG(symbol?: MilitarySymbol | null, options?: SymbolRenderOptions): string | null {
    if (!symbol?.sidc?.trim()) return null;
    try {
        const normalizedSymbol: MilitarySymbol = {
            ...symbol,
            sidc: normalizeSidcLength(symbol.sidc),
            affiliation: mapAffiliation(symbol.affiliation),
            status: mapStatus(symbol.status),
        };
        return renderSpatialSymbol(normalizedSymbol, options);
    } catch (error) {
        console.warn("[symbolService] Failed to render symbol", error);
        return null;
    }
}

export function getSymbolPreviewMarkup(symbol?: MilitarySymbol | null, options?: SymbolRenderOptions): string {
    const svg = renderSymbolSVG(symbol, options);
    if (svg) return svg;
    return '<div class="symbol-preview__empty">No military symbol assigned</div>';
}

export function sanitizeSidc(value: string): string {
    return normalizeSidcLength(value);
}

function normalizeSidcLength(value: string): string {
    const trimmed = value.replace(/\s+/g, "").toUpperCase();
    if (!trimmed.length) return "";
    return trimmed.length >= 20 ? trimmed.slice(0, 20) : trimmed.padEnd(20, "-");
}

function mapAffiliation(affiliation?: string): string {
    if (!affiliation) return "friendly";
    const normalized = affiliation.toLowerCase();
    return AFFILIATION_MAP[normalized] ?? affiliation;
}

function mapStatus(status?: string): string {
    if (!status) return STATUS_MAP.present;
    const normalized = status.toLowerCase();
    return STATUS_MAP[normalized] ?? STATUS_MAP.present;
}
