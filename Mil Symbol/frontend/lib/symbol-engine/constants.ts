import type { SymbolDimension } from "./types";

export const AFFILIATION_COLORS: Record<string, string> = {
    friendly: "#38bdf8",
    hostile: "#f87171",
    neutral: "#4ade80",
    unknown: "#facc15",
};

export const THEMES = {
    dark: {
        canvas: "#020617",
        surface: "#0f172a",
        text: "#e2e8f0",
        muted: "#94a3b8",
        accent: "#38bdf8",
    },
    light: {
        canvas: "#f8fafc",
        surface: "#ffffff",
        text: "#0f172a",
        muted: "#475569",
        accent: "#0f172a",
    },
};

export type FrameShape =
    | { kind: "circle"; cx: number; cy: number; r: number }
    | { kind: "path"; d: string };

export const FRAME_LIBRARY: Record<SymbolDimension, FrameShape> = {
    air: { kind: "circle", cx: 100, cy: 95, r: 70 },
    ground: {
        kind: "path",
        d: "M40 55 H160 Q170 55 170 65 V135 Q170 145 160 145 H40 Q30 145 30 135 V65 Q30 55 40 55 Z",
    },
    sea: {
        kind: "path",
        d: "M45 60 H155 V120 L100 155 L45 120 Z",
    },
    subsurface: {
        kind: "path",
        d: "M35 70 L100 35 L165 70 L165 130 L100 165 L35 130 Z",
    },
    space: {
        kind: "path",
        d: "M100 25 L125 65 L170 75 L140 115 L150 165 L100 140 L50 165 L60 115 L30 75 L75 65 Z",
    },
    unknown: {
        kind: "path",
        d: "M40 60 H160 V140 H40 Z",
    },
};
