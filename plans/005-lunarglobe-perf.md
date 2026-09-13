# Plan 005: Stop per-pointermove globe re-renders and shrink the main-thread texture bake

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/lunar/LunarGlobe.tsx`
> Changes from the session's review fixes (texture dispose, Marker cursor cleanup)
> are expected. If the cursor-tracking feature itself (`vec3ToLatLon`,
> `onCursor`, `formatCursorCoord`) is absent, STOP — this plan is built on it.

## Status

- **Priority**: P2
- **Effort**: S/M
- **Risk**: LOW
- **Depends on**: plans/003-domain-test-suites.md (green suite as safety net; not strictly required)
- **Category**: perf
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

Hovering or dragging over the 3D globe fires `setCursor` on **every** pointer-move event (125 Hz mouse, more on trackpads). Each event re-renders the whole `Moon` subtree: React reconciles ~10 components, and 8 `Marker`s rebuild with a fresh `Vector3` (via `latLonToVec3`) and fresh closures, invalidating every `useMemo` in `Marker`. Separately, mount bakes a 2048×1024 procedural moon texture synchronously on the main thread (26 gradient fills + ~1400 craters + an `getImageData` per-pixel grain pass ≈ 8.3M iterations) — a 100-300 ms freeze right after the 903 kB lazy chunk loads. Both hit precisely when the user is interacting / first lands on the showcase view.

## Current state

`src/components/lunar/LunarGlobe.tsx` (323 lines) — verified excerpts:

```ts
// :108-126 Marker: memos keyed on position identity
const normal = useMemo(() => position.clone().normalize(), [position]);
const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(...), [normal]);

// :234-243 sphere handle — onPointerMove → onCursor(...) on every event
onPointerMove={(e) => { ...; onCursor(vec3ToLatLon(local)); }}

// :254-262 markers rebuilt per render with fresh Vector3 + fresh closures
{SITES.map((s) => (
  <Marker key={s.id} position={latLonToVec3(s.lat, s.lon)}
    active={activeSite === s.id}
    label={`${s.id} · ${s.coordLabel}`}
    onSelect={() => onSelect(s.id)} />
))}

// :275 cursor state lives in LunarGlobe (the re-render source)
const [cursor, setCursor] = useState<{ lat: number; lon: number } | null>(null);
```

Texture bake (`useMoonTextures`, :39-105): `const w = 2048; const h = 1024;` — 26 radial-gradient maria fills, ~1400 crater strokes, then `getImageData`/`putImageData` grain loop; `Moon` is not memoized; `Moon` props: `activeSite`, `autoRotate`, `onSelect`, `onCursor` (where `onCursor` is `setCursor` — a stable setState reference).

The cursor readout renders near the canvas: `{cursor ? formatCursorCoord(cursor.lat, cursor.lon) : "—.—° —.—°"}` (search `formatCursorCoord` usage near the bottom of the file).

Conventions: this file is the ONLY file with an intentional local divergence from the upstream design source (cursor telemetry added deliberately). Keep style/structure; `export default` at :267.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run typecheck` | exit 0 |
| Tests | `npm test` | all pass |
| Build | `npm run build` | `✓ built in …` |
| Dev smoke | `npm run dev` | globe renders, cursor readout tracks |

## Scope

**In scope**:
- `src/components/lunar/LunarGlobe.tsx`

**Out of scope**:
- `src/components/lunar/TubeCutaway.tsx`, `StratigraphyOverlay.tsx`, `Client3D.tsx` — plan 006 owns Canvas lifecycle; `Client3D.tsx` owns lazy loading (untouched).
- `frameloop` changes — plan 006, deliberately.
- `src/lib/lunarvoid-data.ts` (site coords) — read-only here; the shared formatter extraction is plan 010.

## Git workflow

- Branch: `advisor/005-lunarglobe-perf`
- Commit style: `perf(globe): isolate cursor telemetry from React renders and halve texture bake cost`
- Do NOT push.

## Steps

### Step 1: Hoist site positions to module scope

Above the `Marker` component, add:

```ts
const SITE_MARKERS = SITES.map((s) => ({
  id: s.id,
  label: `${s.id} · ${s.coordLabel}`,
  position: latLonToVec3(s.lat, s.lon),
}));
```

and map over `SITE_MARKERS` in `Moon`'s JSX instead of `SITES` (drop the inline `latLonToVec3` call and the inline label template).

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Stabilize Marker props and memoize both components

- Change `Marker`'s `onSelect` prop to `(id: SiteId) => void`; inside `Marker` call `onSelect(site.id)` (add `siteId: SiteId` prop). In `Moon`, pass the raw stable `onSelect` — no per-site closure.
- Wrap: `const Marker = memo(function Marker(…) { … });` and `const Moon = memo(function Moon(…) { … });` (import `memo` from react).
- `Moon`'s props after this are all stable across cursor updates (`activeSite` changes only on selection; `onSelect`/`onCursor`/`autoRotate` stable references).

**Verify**: `npm run typecheck` → exit 0; `npm run build` → `✓ built`.

### Step 3: Drive the cursor readout via DOM ref, not state

- Delete the `cursor` state. Add `const readoutRef = useRef<HTMLDivElement>(null);` in `LunarGlobe`.
- Replace `onCursor={setCursor}` with:

```ts
const updateReadout = useCallback((coord: { lat: number; lon: number } | null) => {
  const el = readoutRef.current;
  if (el) el.textContent = coord ? formatCursorCoord(coord.lat, coord.lon) : "—.—° —.—°";
}, []);
```

- Attach `ref={readoutRef}` to the readout `<div>` (keep its className — `label-mono pointer-events-none absolute bottom-3 left-3 …`) and replace its children with the literal placeholder text `"—.—° —.—°"` (static).

**Verify**: `grep -n "useState" src/components/lunar/LunarGlobe.tsx` → only `autoRotate` (and Marker's `hovered`) remain; `npm run typecheck` → exit 0.

### Step 4: Shrink the texture bake

In `useMoonTextures`: `const w = 1024; const h = 512;` — then scale crater count: the crater loop uses a count constant or loop bound derived from canvas size (read it first); halve it alongside (e.g. 1400 → 700). **Delete the grain pass entirely** (`getImageData` + per-pixel loop + `putImageData` block) — the gradient + crater strokes carry the visual at globe scale. Keep `map.colorSpace`/`anisotropy`/`bump` lines as-is.

**Verify**: `grep -n "getImageData" src/components/lunar/LunarGlobe.tsx` → no matches; `npm run build` → `✓ built`.

### Step 5: Behavioral smoke

`npm run dev` → Overview tab:
1. Globe renders with craters/maria visible (coarser grain is acceptable; flat-white or missing texture is NOT).
2. Move the pointer over the globe: bottom-left readout updates in real time; the site markers do not visually stutter.
3. Click a marker → site dossier updates; ⌘K → site → Overview globe still focused correctly.
4. Console: no new errors beyond the known transient OrbitControls teardown error on tab switch.

**Verify**: all four checks pass; `npm test` → all pass.

## Test plan

No new unit tests (WebGL component; the repo deliberately does not test 3D). `npm test` guards regressions in everything else. If plan 003 landed, its suites are the gate.

## Done criteria

- [ ] `grep -cn "setCursor\|cursor, setCursor" src/components/lunar/LunarGlobe.tsx` → 0 matches
- [ ] `grep -n "SITE_MARKERS" src/components/lunar/LunarGlobe.tsx` → present at module scope
- [ ] `grep -n "getImageData" src/components/lunar/LunarGlobe.tsx` → no matches
- [ ] `grep -n "const w = 1024" src/components/lunar/LunarGlobe.tsx` → 1 match
- [ ] `npm run typecheck && npm test && npm run build` all exit 0
- [ ] Only `src/components/lunar/LunarGlobe.tsx` modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- The cursor-tracking feature (onCursor/vec3ToLatLon/formatCursorCoord) is missing or shaped differently — plan assumes it; do not rebuild it from scratch without reporting.
- Marker click selection breaks when switching `onSelect` to id-passing style and the fix isn't obvious within the file — report rather than restructuring `Moon`'s contract.
- After the texture change the globe renders flat/untextured in `npm run dev` — restore 2048×1024, keep the grain-pass deletion, and report the trade-off question.
- React `<memo>` on `Moon` breaks marker `active` highlighting (stale visuals after site change) — that means a prop isn't actually stable; report the specific prop identity failure.

## Maintenance notes

- Plan 017 (parametric cutaway) touches the sibling `TubeCutaway.tsx`, not this file.
- If a future feature needs cursor data in React state (e.g. crosshair on map), reintroduce state but throttle to rAF — do not undo the DOM-ref readout for stateless display.
- Reviewer: the visual bar is "imperceptibly coarser texture"; look at the Overview globe before/after.
