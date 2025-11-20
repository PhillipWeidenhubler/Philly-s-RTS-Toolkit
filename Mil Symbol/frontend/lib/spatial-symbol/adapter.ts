import type { MilitarySymbol } from "../../types";
import { DEFAULT_SPATIAL_FIELDS, DEFAULT_SPATIAL_STYLE } from "./defaults";
import type { SpatialSymbolFields, SpatialSymbolPayload, SpatialSymbolStyle } from "./types";

const STATUS_TO_COLOR_MODE: Record<string, SpatialSymbolStyle["colorMode"]> = {
    light: "Light",
    dark: "Dark",
};

export function normalizeSpatialFields(symbol?: SpatialSymbolPayload | null): SpatialSymbolFields {
    if (!symbol) return { ...DEFAULT_SPATIAL_FIELDS };
    const merged: SpatialSymbolFields = {
        ...DEFAULT_SPATIAL_FIELDS,
        ...symbol.fields,
    };

    if (!merged.higherFormation && symbol.higherFormation) {
        merged.higherFormation = symbol.higherFormation;
    }
    if (!merged.uniqueDesignation && symbol.uniqueDesignation) {
        merged.uniqueDesignation = symbol.uniqueDesignation;
    }
    return merged;
}

export function normalizeSpatialStyle(
    symbol?: SpatialSymbolPayload | null,
    overrides?: Partial<SpatialSymbolStyle>
): SpatialSymbolStyle {
    const merged: SpatialSymbolStyle = {
        ...DEFAULT_SPATIAL_STYLE,
        ...(symbol?.style ?? {}),
        ...(overrides ?? {}),
    };
    if (symbol?.colorMode) {
        merged.colorMode = STATUS_TO_COLOR_MODE[symbol.colorMode] ?? merged.colorMode;
    }
    return merged;
}

export function buildSpatialOptions(symbol: MilitarySymbol & { fields?: SpatialSymbolFields }): Record<string, unknown> {
    const base: Record<string, unknown> = {
        sidc: symbol.sidc,
    };
    const payload = normalizeSpatialFields(symbol);
    return { ...payload, ...base };
}
