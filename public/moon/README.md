# Moon texture slot

This directory holds an **optional** upgrade for the 3D globe:

```
moon/ldam_4k.jpg   ← drop the NASA CGI Moon Kit color map here (recommended: 4K)
```

## Why

The 3D globe (`src/components/lunar/LunarGlobe.tsx`) currently renders a
procedural canvas texture (maria + craters). If a real moon color map is
present at `moon/ldam_4k.jpg`, the globe loads it asynchronously on mount and
substitutes it into the same `THREE.CanvasTexture` (no remount, Markers stay
memoized). A grayscale luminance pass over the color map becomes the bump map,
so the basemap actually shapes lighting. The HUD label flips from
"LRO WAC basemap · shaded relief proxy" to "NASA LRO WAC basemap · luminance-derived normal".

If the file is missing or fails to load, the procedural fallback stays in
place and nothing renders broken. The page weight stays identical to baseline
when this asset is absent.

## Source

**NASA Scientific Visualization Studio — CGI Moon Kit**
https://svs.gsfc.nasa.gov/4720/

The high-resolution LROC WAC (Wide Angle Camera) color / normal / spec / shade
maps produced by NASA's SVS for 3D / IMAX / print use. All files in the kit
are **NASA public domain**.

Recommended file for this slot:
`ldam_20150915_4k.jpg` (LDAM = LROC Digital Elevation / Albedo Map, 4K).

Alternative sources (same data lineage):
- `nasa3d.arc.nasa.gov` — NASA-3D-Resources archive.
- `eoimages.gsfc.nasa.gov` — LROC WAC mosaic (different mosaic style).
- Wikipedia Commons hosts NASA-derived full-moon and equatorial moon maps
  (also public domain); useful for prototyping, but the CGI Moon Kit is the
  canonical source.

## Attribution (already in the app)

The globe HUD label states the active source. The portal's license file is MIT
(code); the **embedded image retains NASA's public-domain status** under
17 U.S.C. § 105 — no additional credit required, though NASA's media usage
guidelines request a line of attribution where feasible. This README and the
HUD label together satisfy that.

## After dropping the file in

The component keys the request with a cache-buster query string
(`?v=MOON_ASSET_VERSION`) defined in `src/components/lunar/LunarGlobe.tsx`.
**Bump `MOON_ASSET_VERSION` whenever you replace the texture** (e.g.
`'1'` → `'2'`) — this forces every existing browser cache to drop the old
file, so users on stale tabs see the new texture on next load.

## Dev / production note

When this image is missing, the globe falls back to the procedural canvas
texture and the HUD reads "LRO WAC basemap · shaded relief proxy".

- **Dev** (`npm run dev`): Vite returns the SPA HTML for unknown asset paths,
  so the missing `/moon/ldam_4k.jpg` resolves with status 200 + `text/html`.
  The browser fails to decode HTML as an image and the fallback runs silently —
  no console errors, but the missing-asset signal is hidden.
- **Production** (`npm run build` → GitHub Pages): static files with extensions
  return a real `404`, which the browser also fails to decode and triggers the
  same fallback. Net behavior identical to dev.

If you want the dev server to surface a real 404 for this path, add to
`vite.config.ts`:

```ts
appType: 'spa',
  plugins: [react(), tailwindcss(), { name: 'moon-asset-guard', configureServer(s) {
    s.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/moon/') && !req.url.endsWith('.md')) { res.statusCode = 404; res.end('Not Found'); return; }
      next();
    }); }}],
```

