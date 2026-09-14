# Moon texture slot

This directory holds an **optional** upgrade for the 3D globe:

```
moon/ldam_4k.jpg   ← LROC-derived moon color map (recommended: 2K or 8K)
```

## Why

The 3D globe (`src/components/lunar/LunarGlobe.tsx`) currently renders a
procedural canvas texture (maria + craters). If a real LROC-derived moon
color map is present at `moon/ldam_4k.jpg`, the globe loads it asynchronously
on mount, uploads it onto the same `THREE.CanvasTexture` objects (no remount,
Markers stay memoized), and generates two derived textures in-canvas:

- **Normal map** (Sobel of luminance) — gives the sphere real surface relief
  so directional light sculpts maria/highland contrast accurately.
- **Roughness map** (luminance remapped into `[0.92, 0.99]`) — small mare /
  highland specular contrast consistent with the regolith being uniformly rough.

The HUD label flips from "LRO WAC basemap · shaded relief proxy" to
"LROC color basemap · derived normal & roughness · PBR" when the real texture
is loaded. The sphere is 192×192 subdivisions (up from 96×96) so the
displacement response reads cleanly across the terminator.

If the file is missing or fails to load, the procedural fallback stays in
place and nothing renders broken. The procedural fallback matches the real
texture's resolution (2048×1024) so the GPU texture slots don't need to be
reallocated when the real image loads — keeps WebGL silent (no "offset
overflows texture dimensions" warnings) and avoids a brief stall on the
upgrade.

## Source

**Solar System Scope — 2K Moon map** (the file currently in this slot was fetched from this URL)
https://www.solarsystemscope.com/textures/

Fetch the 2K file with:

```bash
curl -L -o public/moon/ldam_4k.jpg https://www.solarsystemscope.com/textures/download/2k_moon.jpg
```

Solar System Scope distributes the LROC WAC color shaded relief map under
CC-BY 3.0 (and an 8K version when you need the higher resolution —
`8k_moon.jpg` is 15 MB; download only if your audience has the bandwidth).
The map is a derivative of public-domain LROC WAC imagery (NASA/GSFC),
re-projected and tone-mapped for visualization.

CC-BY 3.0 requirements: credit + indicate changes. The HUD label satisfies
the credit; no changes are made to the texture itself.

## Attribution in the app

The globe HUD label states the active source. The portal's code license is
MIT; the **embedded texture is CC-BY 3.0** (Solar System Scope, derived from
NASA LROC WAC).

## After dropping the file in

The component keys the request with a cache-buster query string
(`?v=MOON_ASSET_VERSION`) defined in `src/components/lunar/LunarGlobe.tsx`.
**Bump `MOON_ASSET_VERSION` whenever you replace the texture** (e.g.
`'3'` → `'4'`) — this forces every existing browser cache to drop the old
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
