# Cutaway Parametrization Spike — Findings

**Spike branch:** `advisor/017-cutaway-spike` (executed in-session, 2026-09-13)
**Prototype:** `src/components/lunar/TubeCutaway.tsx` (`deriveGeometry`), selector in
`CutawaySection`, dynamic badges in `StratigraphyOverlay`.

## Approach

Geometry derived from candidate `depthMeters`/`spanMeters` with the TRANQ anchor
(105 m / 80 m) reproducing the original constants **exactly**:

- `TUBE_R = clamp(1.15 · √(span/80), 0.4, 2.2)` — sqrt scaling keeps wide benches
  (180 m) from exploding; floors at 0.4 for narrow tubes (30 m).
- `CEIL_Y = −1.45 · clamp(depth/105, 0.2, 1.2)` — ceiling depth linear in depth;
  shallow sags floor at 20% of anchor so the shaft never vanishes.
- `TUBE_Y = CEIL_Y − TUBE_R`; `FLOOR_Y = TUBE_Y − TUBE_R` — worst-case floor
  −4.07 stays inside the block (`BASE_Y = −5`).
- `SHAFT_HALF = clamp(TUBE_R − 0.45, 0.15, 0.7)` — shaft never wider than its tube
  (anchor: exactly 0.7, as before).

## Results — all 12 published candidates

| Candidate | depth m | span m | TUBE_R | CEIL_Y | FLOOR_Y | SHAFT | Verdict |
|---|---|---|---|---|---|---|---|
| CAND-TRANQ-001 (anchor-class) | 105 | 88 | 1.21 | −1.45 | −3.86 | 0.70 | readable |
| CAND-TRANQ-002 | 4.2 | 65 | 1.04 | −0.29 | −2.36 | 0.59 | readable (shallow-sag clamp) |
| CAND-TRANQ-005 | 2.8 | 40 | 0.81 | −0.29 | −1.92 | 0.36 | readable |
| CAND-MARIUS-001 | 85 | 62 | 1.01 | −1.17 | −3.20 | 0.56 | readable |
| CAND-MARIUS-004 | 3.1 | 90 | 1.22 | −0.29 | −2.73 | 0.70 | readable (clamp) |
| CAND-MARIUS-012 | 5.5 | 110 | 1.35 | −0.29 | −2.99 | 0.70 | readable (clamp) |
| CAND-INGENII-001 | 68 | 120 | 1.41 | −0.94 | −3.76 | 0.70 | readable |
| CAND-INGENII-008 | 3.6 | 55 | 0.95 | −0.29 | −2.20 | 0.50 | readable |
| CAND-PHIL-001 | 38 | 45 | 0.86 | −0.52 | −2.25 | 0.41 | readable |
| CAND-FECUN-002 | 1.9 | 75 | 1.11 | −0.29 | −2.52 | 0.66 | readable (clamp) |
| CAND-TYCHO-001 (smallest) | 14 | 30 | 0.70 | −0.29 | −1.70 | 0.25 | readable |
| CAND-HADLEY-003 (widest) | 45 | 180 | 1.72 | −0.62 | −4.07 | 0.70 | readable, 0.93 margin to block base |

Zero degenerate cases: every floor sits ≥ 0.9 units above the block base, every
ceiling is below the surface, and every shaft is narrower than its tube. Visual
verification (screenshots) confirmed the anchor, widest-bench, and smallest-pit
extremes all frame correctly under the fixed camera `[3.2, 1.6, 12.5]` — no camera
rework needed.

## Clamps in force (documented behavior, not bugs)

- **Shallow sags (depth < 21 m)**: depth ratio floors at 0.2 — the diagram shows a
  *minimum visual depth* rather than a pancake. The HUD caption and strata copy
  state the true meters, so no honesty loss.
- **Very wide spans (> ~200 m)**: TUBE_R caps at 2.2.

## Exaggeration labeling

The static "vertical exaggeration ×2" claim was **replaced** by a per-view caption:
`Schematic cross-section · span ~{span}m · depth ~{depth}m` — truthful and
candidate-specific. (The ×2 claim was never computed from real scale; it is now
gone.)

## UX decisions made

- A **GEOMETRY SOURCE selector** (ANCHOR + 12 candidate pills) sits above the
  cutaway — local to the fusion tab, mirroring the SitePills visual language.
- Default = ANCHOR (TRANQ geometry) → default view is identical to pre-spike.
- Stratigraphy badges + strata copy numbers follow the selection.

## Verdict: **SHIP-AS-IS**

The prototype is production-acceptable as merged: all 12 candidates render
readably, defaults are byte-equivalent, captions are honest, and no camera or
scene-layout rework is required. Follow-up (optional, deferred): drive the
selector from `?candidate=` deep links and highlight the selected candidate when
arriving from the atlas drawer.

## Side-findings recorded during the spike

- `tsc -b` can serve a stale `tsbuildinfo` after rapid edits — use
  `tsc -b --force` when verifying surgical refactors (cost us one masked error).
- URL calculator seeding had a `Number(null) === 0` phantom-seed bug (absent
  params created `m=0&c=0&b=0`); fixed in the same session with explicit
  null-checks, covered by manual verification (bare fusion URL stays clean).
