# Frontend (TS/SCSS)

This folder contains the new Vite + TypeScript + SCSS workspace. It currently renders a placeholder view, but it gives us a modern toolchain to port the legacy UI module by module.

## Usage

```
cd frontend/app
npm install
npm run dev        # runs the Sass watcher + Vite dev server
npm run build      # runs the Sass CLI then emits the Vite bundle under dist/
```

The styling pipeline now compiles `src/styles/main.scss` through the Dart Sass CLI. The watcher writes to `src/styles/.generated/main.css`, which is the asset imported by `src/main.ts`. You can also run `npm run sass:build` manually if you only need to refresh the CSS without starting Vite.

The C# WebView loads the built `dist/` output. During development you can attach the WebView to the Vite dev server, but production builds always come from `dist/`.

### Host Bridge
The placeholder `src/main.ts` illustrates how to talk to the WebView host via `window.chrome.webview.postMessage`. The desktop app responds to:

- `{"type":"host-info-request"}` → returns `{ type: "host-info", payload: { version, databasePath, mode } }`
- `{"type":"request-load"}` → returns the persisted payload
- `{"type":"save", payload: ... }` → persists the current payload

Use these message types when wiring new modules so the desktop host remains the single source of truth for data.
