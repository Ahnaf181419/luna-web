# Plan 015: Wire the likelihood calculator to the candidate registry — "Open in calculator", seedable sliders, shareable scenario links

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/App.tsx src/components/lunar/LikelihoodCalculator.tsx src/components/lunar/CandidateDrawer.tsx`
> Expected drift: 001 (URL hardening), 007 (PDF builder). Reconcile with those
> changes; on structural mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S/M
- **Risk**: MED (two scoring systems coexist — must be labeled honestly, see Step 4)
- **Depends on**: plans/001-url-state-hardening.md (URL sync effect shape), plans/007-pdf-clipping.md (same file, land after)
- **Category**: direction
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The portal invites reviewers to "adjust the three empirical evidence sliders" — but the calculator starts from hardcoded defaults (0.85 / 1.6 / −8.0), while every candidate's actual `cprRatio`/`bouguerMGal`/`depthMeters`/`spanMeters` sit one click away in the drawer as static charts. A reviewer must hand-copy numbers to interrogate a candidate. This plan adds: an **"Open in calculator"** button in the drawer, calculator state seeded from the candidate, a **Reset**, and shareable `?m=&c=&b=` deep links (the URL-sync plumbing already exists for tab/site/candidate). Honest-labelling requirement: the published `candidate.score` (hand-authored) and the recomputed `targetWeightedScore(...)` are **different numbers by design** — the UI must show both, labeled, not silently pick one.

## Current state

Verified excerpts:

```ts
// src/components/lunar/LikelihoodCalculator.tsx:53-59 — hardcoded defaults, no props
export function LikelihoodCalculator() {
  const [morphRatio, setMorphRatio] = useState(0.85);
  const [radarCpr, setRadarCpr] = useState(1.6);
  const [bouguer, setBouguer] = useState(-8.0);
  const score = useMemo(() => targetWeightedScore(morphRatio, radarCpr, bouguer), …);

// src/components/lunar/CandidateDrawer.tsx:44-47 — drawer already binds structured fields
const site = candidate ? siteById(candidate.site) : null;
// (candidate.cprRatio / bouguerMGal / depthMeters / spanMeters rendered as static charts)

// src/App.tsx:59-68 — URL sync effect (post-001): persists tab/site/candidate via replaceState
```

The calculator renders inside the Fusion tab (via `CutawaySection` or `TheorySection` — grep `LikelihoodCalculator` for its mount point and thread props through that chain). Slider ranges: read the `Control` invocations in the render section (morph/cpr/bouguer min/max/step) — seeds must be clamped to them.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test` | all pass |
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | `✓ built in …` |
| Dev smoke | `npm run dev` | drawer → calculator flow works |

## Scope

**In scope**:
- `src/components/lunar/LikelihoodCalculator.tsx`
- `src/components/lunar/CandidateDrawer.tsx` (one button)
- `src/App.tsx` (calc seed state + URL params + prop threading)
- The mount-point file between App and the calculator (grep first — likely `CutawaySection.tsx` or `TheorySection.tsx`) — props passthrough only
- `src/App.test.tsx` (append URL-param cases)

**Out of scope**:
- Changing `targetWeightedScore` or any math.
- The atlas table / globe.
- Persisting scenarios to localStorage (shareable URLs cover it).

## Git workflow

- Branch: `advisor/015-calculator-wiring`
- Commit style: `feat(calculator): seed from candidates with shareable ?m/&c/&b scenario links`
- Do NOT push.

## Steps

### Step 1: Calculator props + reset

`LikelihoodCalculator` gains:

```ts
type CalcSeed = { morphRatio: number; radarCpr: number; bouguer: number; label?: string; publishedScore?: number };
export function LikelihoodCalculator({ seed }: { seed?: CalcSeed })
```

- Initial state = clamped seed values (clamp to each slider's min/max — reuse the slider bounds) or the current defaults when absent.
- A **Reset** button next to the score readout: clears seed back to defaults (setState to 0.85/1.6/−8.0).
- When `seed?.publishedScore !== undefined`, render a comparison chip under the score: `Published (authored): 0.71 · Fusion model: 0.62` styled with existing `label-mono`/`text-muted-foreground` utilities — two numbers, two labels, no averaging.

**Verify**: `npm run typecheck` → 0.

### Step 2: Thread the seed from App

- `App.tsx`: `const [calcSeed, setCalcSeed] = useState<CalcSeed | null>(null);`
- URL init: parse `?m=`, `?c=`, `?b=` (numbers, `Number.isFinite`-guarded, clamped) into the initial seed; also accept `?src=CAND-…` to attach label/publishedScore from `CANDIDATES.find`.
- Extend the sync effect: append `m/c/b/src` params only when a seed is active (mirror the default-stripping convention).
- Popstate: re-parse symmetrically (follow the 001 pattern).
- Drawer button "Open in calculator" (next to the existing actions, same button styling): `setCalcSeed({ morphRatio: <morph proxy>, radarCpr: candidate.cprRatio, bouguer: candidate.bouguerMGal, label: candidate.id, publishedScore: candidate.score }); setSelected(null); setTab("fusion");`
  - Morph proxy: candidates carry no morphRatio field — use `spanMeters/depthMeters`? NO — read `targetWeightedScore`: morphScore expects a ratio ~1.2. Use the slider default (0.85) for the unseeded axis and note in the chip `morph = default (registry lacks morphometry ratio)`. Do not invent a mapping.
- Thread `calcSeed` through the calculator's mount chain as `seed={calcSeed ?? undefined}`.

**Verify**: `npm run typecheck && npm run build` → 0.

### Step 3: Copy-link affordance

Small "Copy scenario link" button in the calculator: builds `${location.origin}${location.pathname}?tab=fusion&m=…&c=…&b=…` via `navigator.clipboard.writeText` **reusing the guarded clipboard pattern from plan 008** (await/catch; brief "COPIED"/"FAILED" state).

**Verify**: dev: set sliders → copy → open a new tab with the copied URL → Fusion tab opens with identical slider values.

### Step 4: Tests

Append to `src/App.test.tsx`:
- `/?tab=fusion&m=1.1&c=2.5&b=-12` → calculator renders with those values (assert the value readouts' text: `1.10`, `2.50`, `-12.00` — match the `toFixed(2)` display).
- Garbage `?m=abc` → defaults render, no crash.
- `/?tab=fusion&src=CAND-MARIUS-001` → comparison chip shows both numbers (assert both strings appear).

**Verify**: `npx vitest run src/App.test.tsx` → all pass.

## Test plan

Step 4's cases are the regression net. Pattern: plan 003's App suite.

## Done criteria

- [ ] Drawer has a working "Open in calculator" button that lands on Fusion with seeded values
- [ ] `?m=&c=&b=&src=` round-trips (copy-link → new tab → same values)
- [ ] Comparison chip renders BOTH scores with labels whenever src-seeded
- [ ] `npm test && npm run typecheck && npm run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- The calculator's mount chain is deeper/degenerate (rendered by a component with no props path from App) — report the chain; don't context-drill.
- Candidates' structured fields can't seed the sliders within their min/max without inventing mappings (beyond the documented morph default) — stop and report; inventing science is out of bounds.
- 001's URL-sync effect was restructured beyond recognition (e.g., replaced by a router) — reconcile with the new mechanism and report.

## Maintenance notes

- The published-vs-recomputed gap is now visible UI: if the maintainer later reconciles `candidate.score` with `targetWeightedScore`, the chip becomes redundant — remove then.
- `src=CAND-…` links depend on candidate ids staying stable — they're already the deep-link currency (`?candidate=`); no new constraint.
