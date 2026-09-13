# Plan 013: Enable noUncheckedIndexedAccess and guard the indexed accesses it surfaces

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- tsconfig.app.json src/components/instruments/ElevationProfileChart.tsx src/components/sections/ObservatorySection.tsx src/components/lunar/LunarGlobe.tsx`
> Expected drift: plans 003/005/010 refactors. Compare excerpts; on mismatch
> beyond those, STOP.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED (each surfaced error needs a real guard, not a `!`)
- **Depends on**: plans/004-dead-weight-purge.md (dead files removed = smaller surface), plans/002-verification-baseline.md (`typecheck` gate)
- **Category**: tech-debt / type-safety
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

`tsconfig.app.json` omits `noUncheckedIndexedAccess`, so every `arr[i]` is typed as definitely-present. The code leans on that exactly where it hurts: chart hot paths chain `.x`/`.z` off indexed reads (`ElevationProfileChart.tsx:74-76`), data lookups use `find(...)!` (`lunarvoid-data.ts:157`), and 3D code indexes computed arrays (`LunarGlobe.tsx` radar/ray arrays). A future refactor that empties `points`, shifts ray indices, or passes an unknown site id compiles **cleanly** and throws at runtime in the render path. (Context: TS `strict` is deliberately off in this repo — settled; this single flag is the high-value nuance that was left on the table, and it composes with the flags that ARE on: `verbatimModuleSyntax`, `erasableSyntaxOnly`.)

## Current state

Verified excerpts (line numbers may shift ±10 after plans 003/005 land — locate by content):

```ts
// src/components/instruments/ElevationProfileChart.tsx:74-76
const firstPoint = points[0];
const lastPoint = points[points.length - 1];
const fillD = `${pathD} L ${scaleX(lastPoint.x).toFixed(1)} …`;   // lastPoint possibly undefined under the flag

// src/components/sections/ObservatorySection.tsx:19
const selectedSite = activeSite ? siteById(activeSite) : SITES[0]!;

// src/components/lunar/LunarGlobe.tsx (Marker/radar arrays — grep `rays[` for the site)
const r = rays[i]!;

// src/lib/lunarvoid-data.ts:157
export const siteById = (id: SiteId) => SITES.find((s) => s.id === id) ?? SITES[0]!;  // post-plan-001 shape
```

Also expect surfaced errors at: `LikelihoodCalculator.tsx` slider `onValueChange={(v) => onChange(v[0] ?? value)}` (already guarded — good pattern), `CommandPalette.tsx` group arrays, `App.tsx` param parsing. The full list is whatever `tsc` emits — the plan's guard rules cover the classes.

Guard style rules (follow these, in order of preference):
1. **Prove non-emptiness where it's structural**: loops that always push ≥1 element → early `if (!first || !last) return …` guard, or build from a `map` (total) instead of index loops.
2. **`.at(-1)`** for last element + null check.
3. **One module-scope anchor** for genuinely-static data: plan 003's test already asserts `SITES.length === 8`; a single `export const FIRST_SITE = SITES[0]!` in the data layer (justified by that test) is acceptable — do NOT scatter `!`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Flag probe | `npx tsc -b 2>&1 | head -40` | finite error list (the work queue) |
| Typecheck | `npm run typecheck` | exit 0 when done |
| Tests | `npm test` | all pass |
| Build | `npm run build` | `✓ built in …` |

## Scope

**In scope**:
- `tsconfig.app.json` (add the flag)
- Whatever app files the flag surfaces errors in (expected set: the four above + `App.tsx`, `CommandPalette.tsx`, `LikelihoodCalculator.tsx`, `EvidenceRadarChart.tsx`, `CandidateDrawer.tsx`, chart-math lib)

**Out of scope**:
- `src/components/ui/**` — vendored; if tsc errors point there (it shouldn't — they type their own props), STOP instead of editing.
- Enabling `strict` or any other tsconfig flag — this plan adds exactly one.
- `tsconfig.node.json` (vite.config context) unless the flag errors there.

## Git workflow

- Branch: `advisor/013-unchecked-indexed-access`
- Commit style: `feat(types): enable noUncheckedIndexedAccess and guard indexed reads`
- Do NOT push.

## Steps

### Step 1: Turn the flag on and inventory the errors

Add `"noUncheckedIndexedAccess": true` to `tsconfig.app.json` compilerOptions (next to `noUnusedLocals`).

**Verify**: `npx tsc -b 2>&1 | tee /tmp/nua-errors.txt | wc -l` → a finite count (expect 5-25 errors). If **0 errors**: the flag found nothing (plans already guarded everything) — skip to Done criteria with the flag on.

### Step 2: Guard each site by class

Work through `/tmp/nua-errors.txt` top-to-bottom, applying the guard rules:

- `ElevationProfileChart.tsx` — `const firstPoint = points[0]; const lastPoint = points.at(-1); if (!firstPoint || !lastPoint) return null;` before the JSX (a transect with 0 points renders nothing — sensible fallback; the loop structurally pushes 61).
- `ObservatorySection.tsx` — use `FIRST_SITE` from the data layer (add `export const FIRST_SITE = SITES[0]!;` next to `siteById`, justified by the 003 test asserting SITES.length === 8; update `siteById` to `?? FIRST_SITE`).
- `LunarGlobe.tsx` — replace index loops over ray/position arrays with `.map((r) => …)` where the index isn't semantic; where it is (`rays[i]` paired with another array), guard `if (!r) return null;` inside the callback.
- Param/lookup sites (`App.tsx`, palette groups) — narrow with the existing `??`/`if` patterns already present in the file.

Re-run after each file: `npx tsc -b 2>&1 | wc -l` must shrink monotonically.

**Verify**: `npm run typecheck` → exit 0; `grep -c '!;' /tmp/nua-errors.txt`-style scatter absent — specifically `git diff` shows **no new `!` assertions except the single `FIRST_SITE` line** (`git diff -U0 | grep -c '^+.*!;'` → ≤1).

### Step 3: Full gate + smoke

`npm run lint && npm test && npm run build` — green. Dev smoke: atlas drawer opens (transect renders — the `return null` guard didn't bite), globe markers pulse, calculator sliders work, ⌘K palette navigates.

## Test plan

If plan 003 landed, its suites cover the guarded code paths (drawer/transect render = the `points` guards; App render = param guards). Add one case to the data-layer suite: `FIRST_SITE` equals `SITES[0]` and `siteById(<valid id>)` never returns FIRST_SITE for a mismatch (guards the `?? FIRST_SITE` fallback semantics).

## Done criteria

- [ ] `grep -n "noUncheckedIndexedAccess" tsconfig.app.json` → 1 match, value `true`
- [ ] `npm run typecheck && npm test && npm run build` all exit 0
- [ ] `git diff -U0 | grep '^+' | grep -c '![.;,)]'` → ≤1 new non-null assertion (the FIRST_SITE anchor)
- [ ] No `src/components/ui/` file modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- tsc surfaces errors inside `src/components/ui/**` — vendored code is out of bounds; report the file/line list instead of editing.
- A guard requires changing a component's public props or control flow beyond an early-return — report that site; don't redesign components under this plan.
- Error count exceeds ~40 — surface is larger than audited (plan 004 likely didn't land); STOP and re-scope.

## Maintenance notes

- This flag makes future refactors safe, not the current code correct — new indexed reads must guard as they're written; `format:check`/CI `typecheck` (plans 002/012) enforce it mechanically from now on.
- If `FIRST_SITE` bothers a future reviewer, the alternative is `SITES.at(0)` + a render-time guard at each consumer — strictly more code for zero safety gain over the test-pinned anchor.
