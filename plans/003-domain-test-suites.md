# Plan 003: Characterization tests for the domain math, chart geometry, URL machine, and drawer binding

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/lib/lunarvoid-data.ts src/components/instruments src/components/lunar/CandidateDrawer.tsx`
> Changes from plans 001/002 are expected (URL guard, test infra). Anything else —
> compare excerpts; on a mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/002-verification-baseline.md (runner), plans/001-url-state-hardening.md (URL behavior to pin)
- **Category**: tests
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The product *is* its numbers: the likelihood calculator renders `targetWeightedScore`, `calibratedFpRate`, and `verdict` as the headline posterior, FP bound, and automated grade; the radar/elevation charts turn candidate fields into the "evidence" the site sells. None of it is tested — a silently changed coefficient would misgrade every candidate shown to users. These tests pin current behavior (characterization) so later perf/refactor plans (005, 007, 010, 013) can move code with a safety net.

## Current state

Verified excerpts — `src/lib/lunarvoid-data.ts` (math at file tail):

```ts
export function targetWeightedScore(morphRatio: number, radarCpr: number, bouguerDeficit: number) {
  const morphScore = Math.min(1.0, morphRatio / 1.2) * 0.4;
  const radarScore = Math.min(1.0, (radarCpr - 0.5) / 2.0) * 0.35;
  const gravScore = Math.min(1.0, Math.abs(bouguerDeficit) / 14.0) * 0.25;
  return Math.min(0.99, Math.max(0.05, morphScore + radarScore + gravScore));
}

export function calibratedFpRate(score: number) {
  return Math.max(1.8, (1.0 - score) * 19.4);
}
```

`verdict(score)` exists nearby with thresholds 0.85 / 0.65 / 0.4 (grep `export function verdict`). Slider defaults in `LikelihoodCalculator.tsx:54-56` are `0.85 / 1.6 / −8.0`, and `targetWeightedScore(0.85, 1.6, −8.0) ≈ 0.62` (0.2833 + 0.1925 + 0.1429).

Chart components — the math to extract and pin:
- `src/components/instruments/EvidenceRadarChart.tsx:17-47` — axis normalization (`Math.min(1.0, Math.max(0.15, …))` clamps; floors 0.15×3, 0.2) and polar `getCoordinates(index, total, normVal)` (center 110, radius 80, angle = 2π·i/total − π/2).
- `src/components/instruments/ElevationProfileChart.tsx:19-50` — piecewise transect builder over `totalLength = 260`, `center = 130`, zones: undisturbed (`z = sin(x·0.15)·0.4`), rim sag (−3.5 ramp over 15 m), cliff lip (`−3.5 − drop·(maxDepth·0.7)` over 5 m), talus floor (`−maxDepth + talusRatio·(maxDepth·0.18)`).
- `src/components/lunar/CandidateDrawer.tsx:40-60` — binds `siteById(candidate.site)`, `STATUS_TONE[candidate.status]`, renders both charts + prose.

`src/App.tsx` after plan 001: validated `?site=`, symmetric popstate. Test infra from plan 002: `npm test`, alias `@/`, happy-dom, no globals.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests   | `npm test` | all pass |
| Single file | `npx vitest run src/lib/__tests__/lunarvoid-math.test.ts` | that file passes |
| Typecheck | `npm run typecheck` | exit 0 |
| Lint | `npm run lint` | exit 0 |

## Suggested executor toolkit

- Load the `javascript-testing-patterns` or `python-testing…` — no: use **javascript-testing-patterns** skill if available for vitest idioms.

## Scope

**In scope**:
- `src/lib/chart-math.ts` (create — pure extraction)
- `src/components/instruments/EvidenceRadarChart.tsx`, `ElevationProfileChart.tsx` (import the extracted fns; no behavior change)
- `src/lib/__tests__/lunarvoid-math.test.ts`, `src/lib/__tests__/chart-math.test.ts` (create)
- `src/App.test.tsx`, `src/components/lunar/CandidateDrawer.test.tsx` (create)

**Out of scope**:
- `src/components/lunar/LikelihoodCalculator.tsx` PDF curve — plan 007 owns it (and adds its own tests).
- `src/components/ui/**`, 3D components (`LunarGlobe`, `TubeCutaway`, `StratigraphyOverlay`, `Client3D`) — not renderable in happy-dom (WebGL); do not test them here.
- Any visual/design token changes.

## Git workflow

- Branch: `advisor/003-domain-test-suites`
- Commit style: `test: characterize domain math, chart geometry, URL machine, drawer binding`
- Do NOT push.

## Steps

### Step 1: Extract pure chart math to src/lib/chart-math.ts

Move (do not copy — refactor the components to import) from the two chart components:

```ts
// from EvidenceRadarChart.tsx
export const RADAR_SIZE = 220
export const RADAR_CENTER = 110
export const RADAR_RADIUS = 80

export function radarAxisValues(input: { score: number; cprRatio: number; bouguerMGal: number; depthMeters: number }): number[]
export function getRadarCoordinates(index: number, total: number, normVal: number): { x: number; y: number }

// from ElevationProfileChart.tsx
export const TRANSECT_LENGTH = 260
export function buildTransectPoints(depthMeters: number, spanMeters: number): { x: number; z: number; label: string }[]
```

Keep the exact arithmetic and clamp constants; the components keep only rendering.

**Verify**: `npm run typecheck` → 0; `npm run build` → `✓ built`; `npm run dev` spot-check: atlas → open a candidate drawer → radar polygon and transect render unchanged (no visual diff).

### Step 2: Math characterization suite

`src/lib/__tests__/lunarvoid-math.test.ts` — table-driven:

- `targetWeightedScore(0.85, 1.6, -8)` → `toBeCloseTo(0.6187, 3)`.
- Clamp bounds: `targetWeightedScore(0, 0.5, 0)` → `0.05`; `targetWeightedScore(99, 99, -99)` → `0.99`.
- Monotonicity: increasing morphRatio (0→1.5), radarCpr (0.5→3), |bouguer| (0→-20) each never decreases the score (sample 10 steps).
- Bouguer symmetry: `targetWeightedScore(m, c, -10) === targetWeightedScore(m, c, 10)` (it uses Math.abs).
- `calibratedFpRate`: `(1.0 - 0) * 19.4 = 19.4`; floor `calibratedFpRate(1.0)` → `1.8`; monotonic non-increasing over score 0→1.
- `verdict` (read its actual labels first with grep, then pin): boundaries at 0.40 / 0.65 / 0.85 — test 0.39, 0.40, 0.64, 0.65, 0.84, 0.85 land in the expected buckets.

**Verify**: `npx vitest run src/lib/__tests__/lunarvoid-math.test.ts` → all pass.

### Step 3: Chart-math suite

`src/lib/__tests__/chart-math.test.ts`:

- `radarAxisValues`: all four outputs within [0.15, 1]; `depthMeters: 0` floors at 0.15 (not 0); `depthMeters: 105` saturates at 1.0; negative bouguer uses abs.
- `getRadarCoordinates(0, 4, 1.0)` → `{ x: 110, y: 110 - 80 }` (top axis, 12 o'clock); `(1, 4, 0)` → center; all coordinates within the 220×220 viewBox for normVal ≤ 1.
- `buildTransectPoints(depth, span)`: returns 61 entries; x spans [0, 260]; at x=center (talus zone) z ≈ `-maxDepth` within `0.18 * maxDepth` tolerance; at x=0 z within ±0.4; `maxDepth = Math.max(25, depthMeters)` respected (call with depthMeters=10 → floor at 25); `halfSpan = Math.max(20, spanMeters / 2)` respected.

**Verify**: `npm test` → all files pass.

### Step 4: App URL-machine tests

`src/App.test.tsx` — needs history control; happy-dom provides `window.history`. Pattern per case: set URL, `render(<App />)`, assert.

- `/` renders the Overview tab (globally unique header text "Overview & 3D Globe" present as selected tab).
- `/?tab=atlas` → atlas table renders 12 rows (`document.querySelectorAll('table tbody tr')` — verify the row count matches `CANDIDATES.length`).
- `/?site=GARBAGE` (post-001) → renders without throwing; Overview active.
- `/?tab=atlas&candidate=CAND-MARIUS-001` → drawer opens with that candidate id in the Sheet (role="dialog" contains the id string).
- popstate: after rendering `/?tab=atlas`, execute `window.history.replaceState({}, '', '/')` then `window.dispatchEvent(new PopStateEvent('popstate'))` → Overview becomes the active tab (asserts 001's symmetry fix).

Use `@testing-library/react`'s `render`/`screen`; if querying by tab text is brittle, assert on the rendered section heading text per tab (e.g., atlas tab contains "Candidate Atlas").

**Verify**: `npx vitest run src/App.test.tsx` → all pass.

### Step 5: CandidateDrawer binding test

`src/components/lunar/CandidateDrawer.test.tsx`:

- Render `<CandidateDrawer candidate={CANDIDATES[0]} onOpenChange={() => {}} />` → dialog open; assert: candidate id text present; status badge has the `STATUS_TONE[candidate.status]` class substring (read the map first); site name from `siteById` present; both `<svg>` charts exist (radar + transect).
- Render with `candidate={null}` → no dialog.

**Verify**: `npm test` → all pass; `npm run lint` → exit 0.

## Test plan

This plan is the test plan. Pattern source: `src/lib/__tests__/smoke.test.ts` from plan 002.

## Done criteria

- [ ] `npm test` exits 0; ≥ 25 assertions across 4 new files
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` all exit 0
- [ ] `src/components/instruments/EvidenceRadarChart.tsx` no longer defines `getCoordinates` locally (grep → 0 matches)
- [ ] No 3D component is imported by any test file (`grep -rn "LunarGlobe\|TubeCutaway\|Client3D\|StratigraphyOverlay" src --include="*.test.*"` → empty)
- [ ] No files outside in-scope list modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- `verdict`'s labels or thresholds differ from 0.85/0.65/0.4 — pin what actually exists and note the discrepancy in the report; do not "fix" the data.
- The drawer test fails because Sheet/Radix portals need real focus management happy-dom lacks — try `@testing-library/user-event` once; if still failing, downgrade to asserting `document.body.textContent` and note it. If it cannot pass at all, drop to rendering the chart components directly with the candidate's props.
- App test renders throw on `window.history.replaceState` in happy-dom — STOP and report (environment mismatch worth surfacing, not hacking around).
- Extraction in Step 1 changes any rendered SVG attribute values (compare `dist/` before/after if unsure) — the refactor must be behavior-identical.

## Maintenance notes

- Plan 007 will add tests asserting the PDF curve stays inside its viewBox — follow this suite's style.
- When plan 010 dedups formatters, `buildTransectPoints` stays in `chart-math.ts` — it is the canonical home.
- If a future change intentionally alters scoring math, these tests SHOULD fail — update tables in the same commit with the scientific rationale in the message.
