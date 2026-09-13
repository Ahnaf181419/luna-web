# Plan 017: Parametric tube cutaway — design spike: drive the 3D cross-section from candidate geometry

> **Executor instructions**: This is a **design/spike plan**, not a
> build-everything plan. You will prototype, measure, and write up a
> recommendation; landing production polish is explicitly out of scope.
> Follow the steps; run every verification; when done, update the status row
> in `plans/README.md` and append your findings to docs/ as instructed.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/lunar/TubeCutaway.tsx src/components/lunar/StratigraphyOverlay.tsx src/components/sections/CutawaySection.tsx`
> Expected drift: plan 006 (dispose + frameloop). Reconcile; on structural mismatch, STOP.

## Status

- **Priority**: P3
- **Effort**: M (spike)
- **Risk**: LOW (spike branch; nothing merges without a follow-up decision)
- **Depends on**: plans/006-canvas-lifecycle.md (same file — land after)
- **Category**: direction (design/spike)
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The Fusion tab's 3D cross-section is frozen at the TRANQ-anchor constants (`TUBE_R = 1.15`, fixed shaft, fixed depths) while every candidate carries its own `depthMeters`/`spanMeters` — a 45 m-deep 180 m meander bench (CAND-HADLEY-003), an 85 m/62 m pit (CAND-MARIUS-001), a 1.9 m sag… the atlas tabulates morphological diversity the 3D tab could *show*. The original design spec promised controls to "inspect cross-section dimensions" (docs/architecture_and_design_plan.md:86, pre-rewrite). Deep links (`?candidate=`) already exist, so a candidate-driven cutaway is one prop-thread away. The open questions — extreme-ratio clamping, camera framing, exaggeration labeling — are exactly what a spike answers before committing to production UX.

## Current state

Verified excerpts:

```ts
// src/components/lunar/TubeCutaway.tsx:7-14 — module constants, no props
const HALF_X = 6;
const DEPTH = 6;
const TUBE_Y = -2.6;
const TUBE_R = 1.15;
const SHAFT_HALF = 0.7;
const CEIL_Y = TUBE_Y + TUBE_R;
const FLOOR_Y = TUBE_Y - TUBE_R;
```

- `SectionBlock` builds the extruded cutaway from those constants (:20-50, post-006 with dispose effect).
- `StratigraphyOverlay.tsx:27-32` — overlay badges hardcode "−105 m" and "span ~80 m"; `CutawaySection.tsx:13-23` — STRATA copy hardcodes the same anchor numbers.
- Every candidate: `depthMeters`, `spanMeters` in `src/lib/lunarvoid-data.ts` (`CANDIDATES`, 12 entries — read the value RANGE at execution time; extremes drive the clamps).
- `App.tsx` holds `selected` candidate globally; Fusion tab currently receives no candidate context (`CutawaySection` renders with no props).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | `✓ built in …` |
| Tests | `npm test` | all pass (no new tests; spike) |
| Dev visual | `npm run dev` | prototype renders for all 12 candidates |

## Scope

**In scope** (spike branch only):
- `src/components/lunar/TubeCutaway.tsx` (accept optional geometry props)
- `src/components/lunar/StratigraphyOverlay.tsx`, `src/components/sections/CutawaySection.tsx` (prop passthrough + dynamic badge/copy numbers)
- `src/App.tsx` (thread a candidate selector into Fusion — minimal pills, mirroring plan 010's SitePills if landed)
- `docs/cutaway-spike-findings.md` (create — the deliverable)

**Out of scope**:
- Production UX polish (final selector design, animations between candidates).
- LunarGlobe.
- Changing the default (no-candidate) view beyond keeping today's constants as the fallback.

## Git workflow

- Branch: `advisor/017-cutaway-spike`
- Commit style: `spike(cutaway): candidate-driven geometry prototype + findings`
- Do NOT push, do NOT merge — the write-up decides.

## Steps

### Step 1: Parameterize the geometry

Give `TubeCutaway` optional props with today's constants as defaults:

```ts
export default function TubeCutaway({ depthMeters = 105, spanMeters = 80 }: { depthMeters?: number; spanMeters?: number })
```

Map (initial hypothesis — the spike validates/tunes):
- `TUBE_R` ← lerp(`spanMeters` normalized over [20, 250] → [0.35, 2.2]), clamped.
- `TUBE_Y` ← keep `FLOOR_Y` anchored: derive so the floor sits at a fixed scene depth; ceiling follows `2·TUBE_R`.
- `SHAFT_HALF` ← fixed 0.7 (visual const) — document if extreme pits need it scaled.
- Constants become derived values inside the component; the extrude useMemo gains `[depthMeters, spanMeters]` deps (dispose effect from plan 006 keys along automatically).

### Step 2: Thread candidate selection

- `CutawaySection` accepts `candidate: Candidate | null` (+ optional selector pills listing the 12 candidates — minimal buttons, selected tone from existing pill classes).
- `StratigraphyOverlay` + STRATA copy: replace hardcoded "−105 m"/"span ~80 m" with the candidate's `depthMeters`/`spanMeters` (fallback = TRANQ anchor when null).
- Compute and display **vertical exaggeration** per candidate (scene Y scale vs. real depth ratio) — the HUD already claims "vertical exaggeration ×2"; make it true per view or drop the claim.

### Step 3: Evaluate the extremes (the spike's substance)

For EACH of the 12 candidates (script a quick dev-mode loop or manual pass): render, screenshot, record — does the block stay readable (bore visible, shaft visible, labels not overlapping)? Which candidates need clamps? Does the fixed camera still frame it? Tabulate in the findings doc: candidate → depth/span → derived TUBE_R/TUBE_Y → verdict (readable / clamped / broken).

### Step 4: Write docs/cutaway-spike-findings.md

Sections: approach (mapping + clamps tried), the 12-row table, recommended production clamps, camera/framing verdict, exaggeration-labeling recommendation, open questions (e.g., should extreme candidates get a "schematic, clamped" badge?), and an explicit recommendation: SHIP / SHIP-WITH-CHANGES / DON'T-SHIP.

**Verify**: `test -s docs/cutaway-spike-findings.md` and it contains a 12-row table + a SHIP/… verdict.

### Step 5: Gate

`npm run typecheck && npm test && npm run build` all green on the spike branch (prototype must not break the build even if never merged).

## Test plan

None new (spike). Suites stay green.

## Done criteria

- [ ] Spike branch builds green; all 12 candidates render without exceptions
- [ ] `docs/cutaway-spike-findings.md` exists with the table + verdict
- [ ] Default (null-candidate) view byte-equivalent to pre-spike behavior
- [ ] `plans/README.md` status row updated (status: DONE = spike complete, decision recorded — merging is a NEW plan)

## STOP conditions

- Extrude geometry with tiny TUBE_R (<0.4) produces degenerate/self-intersecting shapes (z-fighting, holes failing) — that's a finding (clamp floor higher), not a failure; record and continue with the clamp.
- Camera framing breaks for wide candidates in a way prop tweaks can't fix without reworking the scene layout — record as DON'T-SHIP-AS-IS with specifics; stop coding further.
- Threading props requires breaking `StratigraphyOverlay`'s lazy-loading contract (check `Client3D.tsx`/Suspense wiring first) — report.

## Maintenance notes

- If the verdict is SHIP*, the production plan lives off this spike's table — clamps and camera decisions come from the doc, not from taste.
- The "vertical exaggeration" HUD claim is currently static ("×2") — regardless of this spike's outcome, fixing or removing that claim is a 1-line follow-up either way.
