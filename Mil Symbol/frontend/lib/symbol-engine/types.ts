import type { SymbolColorMode } from "../../types";

export type SymbolRenderTheme = SymbolColorMode | "auto";

export interface SymbolRenderOptions {
    theme?: SymbolRenderTheme;
    size?: number;
}

export type SymbolDimension = "air" | "ground" | "sea" | "subsurface" | "space" | "unknown";

export interface ParsedSidc {
    raw: string;
    affiliation: string;
    dimension: SymbolDimension;
    status: "present" | "anticipated";
    functionId: string;
    modifier1?: string;
    modifier2?: string;
}
