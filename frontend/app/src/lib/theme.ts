import type { AppSettings } from "../types";

const DEFAULT_ACCENT = "#6dd5fa";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const shadeColor = (hex: string, percent: number): string => {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return hex;
  const num = parseInt(normalized, 16);
  const r = clamp(((num >> 16) & 0xff) + percent * 255, 0, 255);
  const g = clamp(((num >> 8) & 0xff) + percent * 255, 0, 255);
  const b = clamp((num & 0xff) + percent * 255, 0, 255);
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

export const applyTheme = (settings: AppSettings): void => {
  const root = document.documentElement;
  const theme = settings.theme || "";
  if (theme) {
    root.dataset.theme = theme;
  } else {
    root.removeAttribute("data-theme");
  }
  const accent = typeof settings.accentColor === "string" && settings.accentColor ? settings.accentColor : DEFAULT_ACCENT;
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-dark", shadeColor(accent, -0.35));
};
