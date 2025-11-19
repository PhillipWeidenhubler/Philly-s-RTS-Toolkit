# Frontend (TS/SCSS)

This folder contains the new Vite + TypeScript + SCSS workspace. It currently renders a placeholder view, but it gives us a modern toolchain to port the legacy UI module by module.

## Usage

```
cd next-gen/frontend/app
npm install
npm run dev     # start Vite dev server
npm run build   # emit production bundle to dist/
```

The C# WebView will eventually load the `dist/` output. During development you can attach the WebView to the dev server or use the static `frontend/legacy` copy for comparison.

### Host Bridge
The placeholder `src/main.ts` illustrates how to talk to the WebView host via `window.chrome.webview.postMessage`. The desktop app responds to:

- `{"type":"host-info-request"}` → returns `{ type: "host-info", payload: { version, databasePath, mode } }`
- `{"type":"request-load"}` → returns the persisted payload
- `{"type":"save", payload: ... }` → persists the current payload

Use these message types when wiring new modules so the desktop host remains the single source of truth for data.
