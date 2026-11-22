# Shape Pop

A casual tap-to-pop shapes game built as an installable web app (Add to Home Screen) for iPhone.

## Play

1. Open the app on your phone or desktop.
2. Tap / click colorful shapes to pop them.
3. New shapes keep spawning so the field stays lively.

### Add to Home Screen (iPhone)

1. Open the site in Safari.
2. Share → **Add to Home Screen**.
3. Launch **Shape Pop** — it runs standalone without browser chrome.

## Develop

```bash
npm install
npm run icons   # generates PWA / Apple touch icons
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Stack

- Vite + TypeScript
- Canvas 2D shapes (circle, square, hexagon, star)
- `vite-plugin-pwa` for manifest + service worker
