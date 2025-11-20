import type { MilitarySymbol, SpatialSymbolFields, SpatialSymbolStyle } from "../../types";

export type SpatialColorMode = SpatialSymbolStyle["colorMode"] extends string
    ? SpatialSymbolStyle["colorMode"]
    : "Light" | "Dark";

export interface SpatialSymbolState {
    sidc: string;
    fields?: SpatialSymbolFields;
    style?: Partial<SpatialSymbolStyle>;
}

export type SpatialSymbolPayload = MilitarySymbol & SpatialSymbolState;

export type SymbolRenderTheme = "light" | "dark" | "auto";

export interface SpatialSymbolRenderOptions {
    size?: number;
    style?: Partial<SpatialSymbolStyle>;
}

export interface SymbolRenderOptions extends SpatialSymbolRenderOptions {
    theme?: SymbolRenderTheme;
}
