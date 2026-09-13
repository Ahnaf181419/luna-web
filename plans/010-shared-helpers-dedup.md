# Plan 010: Deduplicate shared helpers — coordinate formatter, SVG path builder, site-pill row

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/lib src/components/instruments src/components/sections/ObservatorySection.tsx src/components/sections/AtlasSection.tsx src/components/lunar/LunarGlobe.tsx`
> Expected drift: plan 003's chart-math extraction, plan 005's LunarGlobe changes.
> Anything else — compare excerpts; on mismatch beyond those, STOP.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW/MED (visual regressions possible — each step has an eyeball check)
- **Depends on**: plans/003-domain-test-suites.md (chart-math extraction must exist first; its tests guard the refactor)
- **Category**: tech-debt
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The same logic lives in 2-3 divergent copies. A coordinate formatter exists twice (`formatCoord` in `lunarvoid-data.ts:43-47` — comma+space output — vs `formatCursorCoord` in `LunarGlobe.tsx:32-36` — space-only; they already drifted). The SVG polyline idiom (`reduce((acc, p, idx) => idx === 0 ? 'M …' : 'L …')`) appears in `ElevationProfileChart.tsx:68-72` and `LikelihoodCalculator.tsx:79-83` (with `buildPdfCurve` now in chart-math via plan 007, one consumer remains in the component only if 007's builder took over — verify). The site-pill button row is duplicated between `ObservatorySection.tsx:42-59` and `AtlasSection.tsx:109-121` with identical conditional class strings. Changing formatting or pill tones currently requires lockstep edits.

## Current state

Verified excerpts:

```ts
// src/lib/lunarvoid-data.ts:43-47 (module-private)
function formatCoord(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

// src/components/lunar/LunarGlobe.tsx:32-36 — same logic, drifted separator (space, no comma)
export function formatCursorCoord(lat: number, lon: number) { … `${…}°${ns} ${…}°${ew}`; }
```

```tsx
// ObservatorySection.tsx:42-59 and AtlasSection.tsx:109-121 — same pill pattern:
className={`flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-all ${
  isSelected
    ? 'border-primary/80 bg-primary/20 text-primary font-bold'
    : 'border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground hover:border-border'
}`}
```

(Differences: Atlas includes an "ALL" pill; Observatory's onSelect routes through different handlers. Read both files fully before extracting.)

Conventions: `sections/*` single-quote named exports; extraction targets: formatting → `src/lib/`; cross-section UI → `src/components/instruments/` (project-owned, NOT `ui/` which is vendored).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test` | all pass |
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | `✓ built in …` |
| Dev smoke | `npm run dev` | visual parity on 3 surfaces |

## Scope

**In scope**:
- `src/lib/lunarvoid-data.ts` (export formatCoord with separator param)
- `src/components/lunar/LunarGlobe.tsx` (consume it; delete local copy)
- `src/lib/chart-math.ts` (add `toPolylinePath`)
- `src/components/instruments/ElevationProfileChart.tsx`, `EvidenceRadarChart.tsx`, `src/components/lunar/LikelihoodCalculator.tsx` (consume)
- `src/components/instruments/SitePills.tsx` (create)
- `src/components/sections/ObservatorySection.tsx`, `AtlasSection.tsx` (consume)

**Out of scope**:
- `src/components/ui/**` (vendored).
- The panel-header scaffolding (dot + title + stat) shared by the two charts — borderline value at this codebase size; deliberately not extracted.
- Any behavior/format change beyond the specified separator unification.

## Git workflow

- Branch: `advisor/010-shared-helpers`
- Commit style: `refactor: dedupe coordinate formatter, polyline builder, and site-pill row`
- Do NOT push.

## Steps

### Step 1: Unify the coordinate formatter

In `lunarvoid-data.ts`, change the private function to:

```ts
export function formatCoord(lat: number, lon: number, sep = ", ") {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}${sep}${Math.abs(lon).toFixed(2)}°${ew}`;
}
```

Existing `coordLabel` call sites keep default (comma) — output unchanged. In `LunarGlobe.tsx`: delete `formatCursorCoord`, import `formatCoord`, call `formatCoord(coord.lat, coord.lon, " ")` at the readout site (plan 005 moved it into `updateReadout`). **Display output must be byte-identical on both surfaces.**

**Verify**: `npm run typecheck` → 0; `grep -n "formatCursorCoord" src -r` → 0 matches; dev: globe readout shows `8.33°N 33.22°E` (space), atlas/dossier coords keep `8.33°N, 33.22°E`.

### Step 2: Shared polyline builder

In `src/lib/chart-math.ts` add:

```ts
export function toPolylinePath(points: Array<{ x: number; y: number }>): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
}
```

Consume in `ElevationProfileChart.tsx` (`pathD`) and, if `LikelihoodCalculator.tsx` still builds a path inline (plan 007 may have removed it), there too. Match the existing output format exactly (no toFixed if the originals had none — check before writing).

**Verify**: `npm test` (chart-math suite green); dev: transect path renders identically (compare hover + shape visually).

### Step 3: SitePills component

Create `src/components/instruments/SitePills.tsx`:

```tsx
type SitePillsProps = {
  sites: Array<{ id: string; coordLabel: string }>;
  selectedId: string | null | "ALL";
  onSelect: (id: string) => void;
  includeAll?: boolean;
};
```

Render the exact pill markup/class strings from the current duplicates (with `includeAll` adding the "ALL" pill used by Atlas). Wire `ObservatorySection` and `AtlasSection` to it, preserving their distinct `onSelect` handlers. Keep the wrappers/labels around the rows in each section.

**Verify**: `npm run typecheck && npm run build` → 0; dev: Overview site pills + Atlas filter pills look and behave identically (selection tone, hover, click routing).

### Step 4: Full gate + visual parity sweep

`npm run lint && npm run typecheck && npm test && npm run build`; eyeball: globe cursor readout, site dossier coords, atlas filter row, observatory pill row, both charts, calculator curve.

## Test plan

Add to `src/lib/__tests__/chart-math.test.ts`: `toPolylinePath([{x:0,y:1},{x:2,y:3}])` → `"M 0 1 L 2 3"`; empty array → `""`. Add `formatCoord` cases to the data-layer suite: default sep, space sep, negatives (S/W). Follow plan 003's table style.

## Done criteria

- [ ] `grep -rn "formatCursorCoord" src` → 0 matches
- [ ] `grep -rn "idx === 0 ? \`M" src/components` → 0 matches (builder absorbed them)
- [ ] `grep -c "border-primary/80 bg-primary/20" src/components/sections/ObservatorySection.tsx src/components/sections/AtlasSection.tsx` → 0,0 (moved into SitePills)
- [ ] `npm test && npm run typecheck && npm run build` all exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- The two pill rows' markup differs in more than the ALL pill (e.g., different icons per site) — parameterize only if trivial; otherwise extract the Observatory variant only and report.
- Unifying separators would change a displayed string that tests (plan 003) pin — update those expectations in the same commit ONLY if the new expectation is the documented visual intent; otherwise preserve per-surface separators via the `sep` param (already the design).
- `LikelihoodCalculator.tsx` no longer contains an inline path builder (plan 007 landed) — skip that consumer; note it in the commit.

## Maintenance notes

- SitePills is project-owned UI — it may NOT live under `src/components/ui/` (vendored directory); keep it in `instruments/` (or a future `components/common/`).
- Reviewer: side-by-side screenshots of the two pill rows before/after are the acceptance bar.
