# Next-Gen RTS Toolkit

This directory hosts the rebuilt application using SQLite + C# (WebView host) + TS/SCSS/PostCSS (+ optional PHP) while the legacy app remains untouched in the repo root.

## Structure

- `desktop/` – WinForms WebView host that now boots from `frontend/legacy` and persists state in `desktop/database/rts.db`.
- `frontend/legacy/` – Snapshot of the existing HTML/CSS/JS assets for reference while porting features.
- `frontend/app/` – New Vite/TypeScript/SCSS workspace (see its README for usage).

## Next Steps

- Flesh out the SQLite data-access layer beyond the current `app_state` JSON storage and start populating the normalized tables defined in `desktop/database/schema.sql`.
- Hook the new TS frontend build into the WebView (and later PHP deployment) once features are ported.
- Add API endpoints / PHP scaffolding once the desktop pipeline is stable.

### Dev Notes
- When you run `npm run build` inside `frontend/app`, the output goes to `frontend/app/dist`. The desktop host automatically prefers this build; if the dist index is missing it falls back to `frontend/legacy/index.html`.
- The WebView bridge currently understands `request-load`, `save`, and `host-info-request` messages. The TS placeholder demonstrates how to request host info; expand this pattern for future modules.
