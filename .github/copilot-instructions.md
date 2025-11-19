# Copilot Instructions

## Architecture Snapshot
- `desktop/MainForm.cs` is the WinForms/WebView2 host for the legacy toolkit; it loads `index.html`, merges JSON from `database/*.json`, and handles `load/save/request-load` messages.
- `next-gen/desktop/MainForm.cs` adds SQLite persistence via `DatabaseService` plus a `host-info-request` channel and prefers `frontend/app/dist/index.html`, falling back to `frontend/legacy/index.html`.
- Legacy UI lives in plain HTML/JS (`index.html`, `js/*.js`, `style.css`, `libs/`); everything shares the global `window.RTS` namespace so new modules should register there instead of adding new globals.
- The JSON data contract (units → formations → nations plus weapons/ammo/tags) is the single source of truth; both desktop hosts hydrate/dehydrate that shape, so keep new fields nested under `payload.data`.

## Data & Persistence
- Runtime state is written to `database/state.json` plus the decomposed `units.json`, `formations.json`, etc.; the host will recreate missing arrays, so guard against `undefined` before mutating.
- The next-gen host mirrors JSON writes to SQLite tables defined in `next-gen/desktop/database/schema.sql`; update that schema + `DatabaseService.SaveStructuredDataAsync` together whenever you add new structured fields.
- When reading legacy assets from `desktop/bin/.../data`, prefer `TryRead` logic from `MainForm.cs` so portable builds keep working.

## Frontend Layers
- `js/domElements.js` caches every DOM node once; downstream modules (e.g. `js/app.js`, `js/weaponEditor.js`) pull references from `window.RTS.dom` instead of calling `getElementById` repeatedly.
- `js/app.js` orchestrates editors, charting, and host saves; use its helper hooks (`markDirty`, `autoSaveUnit`, `debouncedHostSave`) instead of inventing new timers.
- Shared utilities live in `js/helpers.js` and `js/constants.js` (theme tokens, scoring helpers, `sampleData`); reuse these when formatting metrics or rendering pills to keep cards uniform.
- Weapon/ammo tooling is isolated inside `js/weaponEditor.js`, which expects `window.RTS.weaponEditor` to expose `rebuildFromData`, `refreshWeaponSelect`, etc.; extend that API rather than reaching into internal maps.

## Next-Gen Frontend
- `next-gen/frontend/app` is a Vite + TS + SCSS app; install deps with `npm install`, run `npm run dev` for local preview, and `npm run build` to refresh `dist/` for the desktop host.
- The TS entry (`src/main.ts`) shows how to talk to WebView via `window.chrome.webview.postMessage({ type: ... })`; handle responses in `addEventListener("message", ...)` and always gate on `data.type`.
- SCSS lives under `src/styles`; the build outputs CSS modules into `dist/assets`. Keep colors/tokens in SCSS vars so themes remain tweakable later.

## Developer Workflows
- Fastest way to ship the desktop build is `run_toolkit.bat`, which kills stale processes, runs `dotnet build desktop/PhillyRTSToolkit.csproj -c Release`, then launches the exe.
- Manual steps: `cd desktop && dotnet restore && dotnet build -c Release` (or `dotnet run -c Release` during iteration). The project targets `net8.0-windows` and depends on `Microsoft.Web.WebView2`.
- JS tooling currently relies on plain ES modules; keep bundles lightweight so WebView loads instantly. For experiments requiring Node APIs, wire them through the Vite workspace instead of patching the legacy `index.html` directly.

## Patterns & Conventions
- Keep instructions/data-driven UIs declarative: update `dataInput` JSON, call `renderCards`, and let helpers rebuild DOM rather than mutating disparate sections.
- When adding host communication, follow existing message names (`load`, `save`, `request-load`, `host-info-request`) and always include a `type` discriminator so both legacy and next-gen hosts remain compatible.
- Persisted numbers are often stored as strings with units (e.g., "4.5 m/s"); use `RTS.helpers.toNumber/formatWithUnit` before doing math to avoid locale bugs.
- Chart rendering uses `libs/chart.umd.min.js` and html export uses `libs/html2canvas.min.js`; load new libraries via `libs/` and reference them from `index.html` so the offline desktop app keeps working.

