import type { MilitarySymbol, SymbolColorMode } from "../../types";
import { AFFILIATION_COLORS, FRAME_LIBRARY, THEMES, type FrameShape } from "./constants";
import { parseSidc } from "./parser";
import type { SymbolRenderOptions, SymbolRenderTheme } from "./types";
import { escapeXml, truncate } from "./utils";

export interface RenderContext {
    theme: SymbolRenderTheme;
    size: number;
}

const DEFAULT_SIZE = 140;

export function renderSymbol(symbol: MilitarySymbol, options?: SymbolRenderOptions): string {
    const parsed = parseSidc(symbol.sidc);
    const theme = resolveTheme(symbol.colorMode, options?.theme);
    const palette = THEMES[theme];
    const size = Math.max(60, options?.size ?? DEFAULT_SIZE);
    const colors = buildColors(parsed.affiliation, palette);
    const frame = FRAME_LIBRARY[parsed.dimension] ?? FRAME_LIBRARY.unknown;
    const annotations = collectAnnotations(symbol, parsed.functionId);
    const modifiers = collectModifiers(symbol, parsed);

    const frameMarkup = buildFrame(frame, colors, parsed.status);
    const textLayers = buildTextLayers({ annotations, modifiers, palette });

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="Military symbol">
  <rect width="200" height="200" fill="${palette.canvas}" rx="16" />
  ${frameMarkup}
  ${textLayers}
</svg>`;
}

function resolveTheme(symbolTheme?: SymbolColorMode, override?: SymbolRenderTheme): SymbolColorMode {
    if (override && override !== "auto") return override;
    if (symbolTheme) return symbolTheme;
    return "dark";
}

function buildColors(affiliation: string, palette: (typeof THEMES)["dark"]): { stroke: string; fill: string; text: string } {
    const stroke = AFFILIATION_COLORS[affiliation] ?? AFFILIATION_COLORS.friendly;
    return {
        stroke,
        fill: palette.surface,
        text: palette.text,
    };
}

function buildFrame(frame: FrameShape, colors: { stroke: string; fill: string; text: string }, status: "present" | "anticipated"): string {
    const dash = status === "anticipated" ? " stroke-dasharray=\"10 6\"" : "";
    if (frame.kind === "circle") {
        return `<circle cx="${frame.cx}" cy="${frame.cy}" r="${frame.r}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="6"${dash} />`;
    }
    return `<path d="${frame.d}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="6" stroke-linejoin="round"${dash} />`;
}

interface AnnotationPayload {
    annotations: ReturnType<typeof collectAnnotations>;
    modifiers: string[];
    palette: (typeof THEMES)["dark"];
}

function buildTextLayers({ annotations, modifiers, palette }: AnnotationPayload): string {
    const { functionLabel, designation, higher, dimension } = annotations;
    const modifierMarkup = modifiers
        .slice(0, 3)
        .map((value, index) => `<g transform="translate(${150}, ${70 + index * 18})">
        <rect x="-4" y="-12" width="40" height="16" rx="4" fill="${palette.canvas}" stroke="${palette.muted}" stroke-width="1" />
        <text x="16" y="0" fill="${palette.text}" font-size="10" font-family="'Segoe UI', 'Inter', sans-serif" text-anchor="middle" dominant-baseline="middle">${escapeXml(truncate(value, 6))}</text>
      </g>`)
        .join("\n");

    return `
    <text x="30" y="32" fill="${palette.muted}" font-size="12" font-family="'Segoe UI', 'Inter', sans-serif" text-anchor="start">${escapeXml(dimension)}</text>
    <text x="100" y="60" fill="${palette.text}" font-size="28" font-family="'IBM Plex Mono', 'Fira Mono', monospace" text-anchor="middle">${escapeXml(functionLabel)}</text>
    <text x="100" y="90" fill="${palette.muted}" font-size="12" font-family="'Segoe UI', 'Inter', sans-serif" text-anchor="middle">${escapeXml(higher)}</text>
    <text x="100" y="165" fill="${palette.text}" font-size="13" font-family="'Segoe UI', 'Inter', sans-serif" text-anchor="middle">${escapeXml(designation)}</text>
    ${modifierMarkup}
  `;
}

function collectAnnotations(symbol: MilitarySymbol, functionId: string) {
    const cleanedFunction = cleanupFunctionId(functionId);
    return {
        functionLabel: cleanedFunction || "--",
        designation: symbol.uniqueDesignation?.trim() || "",
        higher: symbol.higherFormation?.trim() || "",
        dimension: describeDimension(symbol.sidc),
    };
}

function collectModifiers(symbol: MilitarySymbol, parsed: ReturnType<typeof parseSidc>): string[] {
    const values = new Set<string>();
    if (parsed.modifier1) values.add(parsed.modifier1);
    if (parsed.modifier2) values.add(parsed.modifier2);
    Object.values(symbol.modifiers ?? {}).forEach(value => {
        if (value) values.add(String(value));
    });
    if (symbol.echelon) values.add(symbol.echelon);
    return Array.from(values).filter(Boolean);
}

function cleanupFunctionId(value: string): string {
    const trimmed = value.replace(/[-]/g, "").trim();
    if (!trimmed) return "";
    return trimmed.slice(0, 6);
}

function describeDimension(sidc: string): string {
    const dimensionCode = sidc?.charAt(2) ?? "";
    switch (dimensionCode) {
        case "A":
            return "Air";
        case "G":
            return "Ground";
        case "S":
            return "Sea";
        case "U":
            return "Subsurface";
        case "F":
            return "SOF";
        case "P":
            return "Space";
        default:
            return "Unknown";
    }
}
