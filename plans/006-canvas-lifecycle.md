# Plan 006: Fix Canvas lifecycle — dispose the cutaway ExtrudeGeometry and pause its render loop when idle

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/lunar/TubeCutaway.tsx`
> This file was re-synced verbatim from upstream shortly before 6f6856b (constants
> HALF_X/DEPTH/TUBE_Y/TUBE_R/SHAFT_HALF at top; `SectionBlock` builds the geometry
> in a `useMemo`). If that structure is gone, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW/MED
- **Depends on**: none (003's suite recommended but not required)
- **Category**: perf / resource-leak
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

Two costs on the Fusion tab: (1) `SectionBlock` builds an `ExtrudeGeometry` imperatively inside `useMemo` and passes it as a prop — per R3F semantics, prop-provided objects are **not** auto-disposed, so every mount of the tab (Radix Tabs unmount inactive content) re-runs the extrude and leaks its GPU buffers; the sibling `LunarGlobe` already got an explicit dispose fix for its textures — this one was missed. (2) Neither `<Canvas>` sets `frameloop`, so both render at display refresh **continuously** — "Sounding: PAUSED" still burns full GPU because `RadarRays`' `useFrame` only early-returns its *animation* while the render loop keeps rendering identical frames.

Scope decision: this plan fixes the cutaway only (safe, self-contained). The globe deliberately KEEPS `frameloop="always"` — its markers pulse continuously by design (`useFrame` scale animation), and drei `<Stars>` would freeze under demand rendering. That trade-off is recorded, not an oversight.

## Current state

`src/components/lunar/TubeCutaway.tsx` (217 lines) — verified excerpts:

```ts
// :20-44 SectionBlock — geometry in useMemo, attached as prop, never disposed
function SectionBlock() {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    // … rect outline + bore hole (TUBE_Y/TUBE_R) + shaft hole …
    const g = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
    g.translate(0, 0, -DEPTH);
    return g;
  }, []);
  return <mesh geometry={geom}> … </mesh>;
}

// :176 Canvas — no frameloop prop ⇒ defaults to "always"
<Canvas camera={{ position: [3.2, 1.6, 12.5], fov: 42 }} dpr={[1, 2]}>
```

Elsewhere in the file: a running/paused state drives the "Sounding: ACTIVE/PAUSED" button and `RadarRays`' `useFrame` early-return (grep `running` — defined via `useState` in the `TubeCutaway` default-export component and threaded down as a prop). The upstream-matched exemplar for dispose, `LunarGlobe.tsx` Moon:

```ts
// Release GPU-backed canvas textures on unmount (StrictMode double-mounts included).
useEffect(() => () => { map.dispose(); bump.dispose(); }, [map, bump]);
```

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run typecheck` | exit 0 |
| Tests | `npm test` | all pass |
| Build | `npm run build` | `✓ built in …` |
| Dev smoke | `npm run dev` | fusion tab renders + toggle works |

## Scope

**In scope**:
- `src/components/lunar/TubeCutaway.tsx`

**Out of scope**:
- `src/components/lunar/LunarGlobe.tsx` — its frameloop stays "always" by design (marker pulses); its texture dispose already exists.
- Any change to the known transient OrbitControls teardown console error on tab switch (accepted cosmetic issue, upstream-matched).
- Geometry *shapes* — do not alter proportions; plan 017 explores parametrization separately.

## Git workflow

- Branch: `advisor/006-canvas-lifecycle`
- Commit style: `perf(cutaway): dispose ExtrudeGeometry on unmount and pause render loop when sounding is paused`
- Do NOT push.

## Steps

### Step 1: Dispose the extruded geometry

In `SectionBlock`, immediately after the `useMemo`:

```ts
useEffect(() => () => geom.dispose(), [geom]);
```

(import `useEffect` from react alongside the existing `useMemo, useRef, useState`).

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Pause the render loop when sounding is paused

On the `<Canvas>` (line ~176), add a frameloop driven by the same state that drives the radar animation:

```tsx
<Canvas
  camera={{ position: [3.2, 1.6, 12.5], fov: 42 }}
  dpr={[1, 2]}
  frameloop={running ? "always" : "demand"}
>
```

If the `running` state lives in a child rather than the component that renders `<Canvas>`, lift it to the `<Canvas>`-owning component (read the file first; at plan time the toggle button and the Canvas are in the same default-export component — verify with `grep -n "running\|useState" src/components/lunar/TubeCutaway.tsx`).

Under `"demand"`, drei `OrbitControls` invalidates on interaction by itself (camera still orbits); `Html` labels are DOM and unaffected.

**Verify**: `npm run typecheck` → exit 0; `npm run build` → `✓ built`.

### Step 3: Behavioral smoke

`npm run dev` → Fusion tab:
1. Cutaway renders identically to before (block, bore, shaft, radar rays, labels).
2. Toggle "Sounding: ACTIVE" → "PAUSED": radar pulses stop; drag to orbit — camera STILL responds (demand-mode invalidation from OrbitControls). Toggle back → animation resumes.
3. Switch Fusion → Atlas → Fusion 5 times: no accumulating WebGL warnings in console; canvas remounts fine.
4. Chrome DevTools (if available): Performance/Memory GPU buffers stop growing across the 5 remounts; absence of the tool is acceptable — checks 1-3 suffice.

**Verify**: all checks pass; `npm test` → all pass.

## Test plan

No unit tests (WebGL). If plan 003 landed its suites, they must remain green — they don't touch this file.

## Done criteria

- [ ] `grep -n "geom.dispose" src/components/lunar/TubeCutaway.tsx` → 1 match
- [ ] `grep -n 'frameloop' src/components/lunar/TubeCutaway.tsx` → 1 match
- [ ] `grep -n 'frameloop' src/components/lunar/LunarGlobe.tsx` → 0 matches (unchanged by design)
- [ ] `npm run typecheck && npm test && npm run build` all exit 0
- [ ] Only `src/components/lunar/TubeCutaway.tsx` modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- `running` state is not reachable from the Canvas-rendering component without threading a prop through `RadarRays` in a way that changes its animation behavior — report the layout instead of restructuring.
- Under `frameloop="demand"` the paused view renders BLACK (frame not flushed) — try adding `invalidate()` once via `useThree` in an effect after toggling; if still black, revert the frameloop line, keep Step 1, and report.
- OrbitControls interaction is dead in demand mode (drei version doesn't auto-invalidate) — same revert-and-report path.

## Maintenance notes

- Plan 017 (parametric cutaway spike) builds on this file — its geometry would move from constants to derived values; the dispose effect must survive that refactor (it keys on the memo, which will gain deps).
- The known dev-mode OrbitControls teardown error is unrelated to frameloop; do not "fix" it here.
- Reviewer: confirm the paused state is visually identical to the last animated frame (no flicker on toggle).
