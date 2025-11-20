# Mil Symbol Archive

This folder stores the retired Military Symbol editor, renderer, and related assets. The active frontend and desktop hosts no longer reference these files, but the full implementation has been preserved here should the workflow need to be restored in the future.

```
Mil Symbol/
  frontend/
    modules/          # SymbolWorkbench UI module
    services/         # Symbol rendering helpers
    data/             # Symbol libraries, presets, and builder options
    lib/              # Spatial renderer and legacy symbol engine
    styles/           # Symbol-specific SCSS tokens
```

Move any of these files back into `next-gen/frontend/app/src` if you decide to reactivate the symbol creation tools.
