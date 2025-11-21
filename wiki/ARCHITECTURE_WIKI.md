# Architecture
WinForms + WebView2 C# host + Vite/TypeScript/SCSS frontend.

## Host
- MainForm.cs: WebView bootstrap + message switch.
- DatabaseService.cs: SQLite schema management + rewrite helpers.
- schema.sql: Canonical tables (units, formations, nations, weapons, ammo, fire_modes, weapon_tags, etc.).

## Frontend
- main.ts: Navigation shell + panel registry.
- modules/: Units, Formations, Nations, Templates, Insights, Settings.
- services/: CRUD + message envelopes.
- lib/hostBridge: request/on helpers; gate via isAvailable.

## Data Contract
payload: {
  data: { units[], formations[], nations[] },
  weapons[], ammo[], fireModes[], weaponTags{}, settings{}
}

## Lifecycle
DOMContentLoaded => load message.
User edits => save => JSON + SQLite mirror + JSON backups.
Subsequent get-* fetch from DB, fallback to JSON when empty.
