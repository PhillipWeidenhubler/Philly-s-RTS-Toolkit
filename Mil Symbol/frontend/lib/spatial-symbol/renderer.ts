import type { MilitarySymbol } from "../../types";
import BattleStaffTools from "./vendor/battle-staff-tools";
import { buildSpatialOptions, normalizeSpatialStyle } from "./adapter";
import type { SymbolRenderOptions } from "./types";

export function renderSpatialSymbol(
    symbol?: MilitarySymbol | null,
    options?: SymbolRenderOptions
): string | null {
    if (!symbol?.sidc?.trim()) return null;
    const fields = buildSpatialOptions(symbol);
    const style = normalizeSpatialStyle(symbol, {
        ...options?.style,
        ...(options?.theme && options.theme !== "auto"
            ? { colorMode: options.theme === "dark" ? "Dark" : "Light" }
            : undefined),
    });
    if (options?.size) {
        style.size = options.size;
    }
    try {
        const spatial = new BattleStaffTools.Symbol(fields, style);
        return spatial.asSVG();
    } catch (error) {
        console.warn("[spatial-symbol] Failed to render symbol", error);
        return null;
    }
}

export function createSpatialSymbolInstance(symbol: MilitarySymbol, options?: SymbolRenderOptions) {
    const fields = buildSpatialOptions(symbol);
    const style = normalizeSpatialStyle(symbol, {
        ...options?.style,
        ...(options?.theme && options.theme !== "auto"
            ? { colorMode: options.theme === "dark" ? "Dark" : "Light" }
            : undefined),
    });
    if (options?.size) {
        style.size = options.size;
    }
    return new BattleStaffTools.Symbol(fields, style);
}
