# Copilot Instructions

## Architecture Snapshot
- `next-gen/desktop/MainForm.cs` boots the SQLite-backed host. It loads `next-gen/frontend/app/dist/index.html` (run `npm run build` inside `next-gen/frontend/app` to refresh the bundle) and routes all WebView messages through `DatabaseService`.
- `DatabaseService` (`next-gen/desktop/DatabaseService.cs`) seeds the schema from `next-gen/desktop/database/schema.sql`, persists the monolithic `app_state` JSON, and mirrors normalized tables (units, formations, nations, etc.). Update both the schema and the service any time you add structured fields.
- The new frontend entry (`next-gen/frontend/app/src/main.ts`) builds the navigation shell, instantiates panel modules, and wires data services to the host bridge. Each service (`src/services/*.ts`) subscribes to WebView messages and exposes CRUD helpers to UI modules.
- The JSON contract (`payload.data.units/formations/nations` plus `weapons`, `ammo`, `weaponTags`, and `settings`) is still the single source of truth. Both hosts hydrate/dehydrate this shape, so keep any new fields nested under `payload.data` or as sibling collections.

## Data & Persistence
- Runtime state is exported into `database/state.json` along with the decomposed `units.json`, `formations.json`, `nations.json`, `weapons.json`, `ammo.json`, and `weaponTags.json`. Guard against missing files/arrays before mutating; `MainForm` will recreate empty arrays when needed.
- The next-gen host mirrors JSON writes into SQLite. `SaveStructuredDataAsync` currently rewrites units by default; call or extend the dedicated `RewriteFormationsAsync`, `RewriteNationsAsync`, and future rewrite helpers whenever you add structured payload sections.
- Schema migrations live in `next-gen/desktop/database/schema.sql`. Keep the schema, `DatabaseService`, and any TypeScript data types (`next-gen/frontend/app/src/types`) in sync.
- `LoadPayloadNodeAsync` first tries `app_state.payload`, then falls back to the JSON files in `database/`. Reuse the `TryRead` helper so relative paths stay portable.

## Host Messaging Contracts
- `load` → sent automatically after DOM ready; payload mirrors the full JSON contract.
- `save` → from either UI flavor; hosts must persist the payload, refresh SQLite mirrors, and rewrite the individual JSON files.
- `request-load` → force-refresh the payload inside the next-gen host.
- `host-info-request`/`host-info` → handshake for exposing host version, db path, and active frontend mode.
- `get-units`/`units-data`, `save-unit`, `delete-unit` → handled by `unitService` and the SQLite tables.
- `get-formations`/`save-formations` → persisted through `formationService` into `formations`, `formation_categories`, etc. Host falls back to JSON arrays when the DB is empty.
- `get-nations`/`save-nations` → mirrors the nation hierarchy and updates `formations.nation_id` accordingly.
- `get-settings`/`save-settings` → currently marshals to/from the payload JSON only; plan to add structured persistence when the schema supports it.
- Extend `CoreWebView2_WebMessageReceived` and add matching service/controller plumbing each time you introduce a new message type (e.g., weapons, ammo, export pipelines). Always include a `type` discriminator in the envelopes.

## Next-Gen Frontend
- `next-gen/frontend/app` is a Vite + TypeScript + SCSS workspace. Run `npm install`, `npm run dev`, and `npm run build` inside that folder; the desktop host will auto-load the built `dist/` output if it exists.
- `src/modules` currently ships `UnitEditor`, `FormationsPanel`, `NationsPanel`, `SettingsPanel`, `StatsPanel`, `WeaponWorkbench`, and supporting utilities. Each module renders its own layout, subscribes to the relevant service, and relies on shared helpers (`lib/helpers`, `lib/theme`).
- The `hostBridge` wrapper centralizes message dispatching and subscription logic. Use `hostBridge.request` for RPC-style flows and `hostBridge.on` for passive updates. Always gate features behind `hostBridge.isAvailable` so the Vite preview does not crash.
- SCSS sources live under `src/styles`. Keep tokens (colors, spacing, typography) in shared variables so both the TS modules and any future surfaces can share the same visual language.

## Developer Workflows
- `run_next_gen.bat` builds the Vite frontend (`npm run build` inside `next-gen/frontend/app`) and then compiles the next-gen desktop host (`next-gen/desktop/PhillyRTSToolkit.csproj`). Use this when iterating on the new stack.
- Manual build/run loop: `cd next-gen/frontend/app && npm run dev` for live TypeScript development, or `npm run build` followed by `dotnet run --project next-gen/desktop/PhillyRTSToolkit.csproj -c Release` for desktop validation.
- Keep bundles lean. The WebView hosts the static Vite output, so any experiments that require Node APIs should stay in the Vite workspace rather than ad-hoc scripts.

## Patterns & Conventions
- Favor declarative, data-driven updates: mutate the in-memory data object, call the appropriate render helper, and let the UI modules rebuild themselves.
- Persisted numbers often arrive as strings with units (e.g., "4.5 m/s"). Use the shared parsing helpers in `next-gen/frontend/app/src/lib/helpers` before doing math.
- When adding host communication, always send `{ type: string, payload: ... }` envelopes so both desktop hosts remain compatible. Update both the WinForms message switch and the TS service wrapper together.
- Charting/export libraries should be bundled through Vite (place dependencies in `package.json` under `next-gen/frontend/app`). Avoid ad-hoc global scripts.
- In the TS workspace, keep shared DOM queries behind `data-role` attributes and expose summary numbers via `services` rather than letting modules talk directly to each other.

## Implementation Roadmap
- **Normalize all structured saves**: `SaveStructuredDataAsync` only rewrites units today. Expand it (and the schema) to cover formations, nations, weapons, ammo templates, weapon tags, and eventually settings so the SQLite database is the canonical source. Keep the JSON fallbacks in sync.
- **Port weapon/ammo tooling**: Finish recreating any remaining functionality from the retired toolkit (service APIs, advanced editors, export helpers) inside the Vite app and SQLite backend.
- **Restore analytics + exports**: `StatsPanel` currently shows simple counts. Bring back the radar charts, statcard renderer, and `html2canvas` export pipeline using the new services.
- **Implement structured settings + theming**: Add a dedicated settings table or JSON column so `get-settings`/`save-settings` are durable outside of `app_state`. Wire SCSS theme tokens to host-provided preferences (accent color, high-contrast mode, etc.).
- **Data import/export + migrations**: Add UI affordances in the next-gen app for importing/exporting the JSON contract, triggering schema migrations, and seeding SQLite from the JSON backups. Reuse the `request-load`/`save` commands where possible to keep both hosts interoperable.

