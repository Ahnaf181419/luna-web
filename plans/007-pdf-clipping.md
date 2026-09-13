# Plan 007: Keep the posterior-density PDF curve inside its viewBox (clips above the chart for scores ≥ ~0.70)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/lunar/LikelihoodCalculator.tsx`
> Only chart-theme token changes are expected since 6f6856b. If the PDF block
> (pdfD/pdfFill useMemo) differs from the excerpt below, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/002-verification-baseline.md (test runner for the regression test)
- **Category**: bug
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The Likelihood Calculator's headline chart draws a Gaussian "posterior density" whose peak height is `1/(σ√2π)` with `σ = 0.12 − score·0.05`. The y-coordinate is computed as `SVG_H − (gaussian / 4.0) · (SVG_H · 0.85)` with `SVG_H = 100`. As the score climbs past ~0.70 (σ < ~0.085), `peak/4 · 85` exceeds 100 and the mode goes **negative — above the top of the SVG** — so the curve is visually truncated exactly in the high-confidence regime the instrument exists to showcase (morph ≥ 1.2 · CPR ≥ 2.9 · Bouguer ≤ −14 reaches score 0.99). Normalizing the curve to its own peak fixes the clip with zero downside: the *shape* is unchanged; only the vertical scale becomes score-independent.

## Current state

`src/components/lunar/LikelihoodCalculator.tsx` — verified excerpt (lines 11-12, 64-84):

```ts
const SVG_W = 420;
const SVG_H = 100;

/* Live Bayesian posterior density curve (Gaussian around the score) */
const { pdfD, pdfFill } = useMemo(() => {
  const mu = score;
  const sigma = 0.12 - score * 0.05;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 80; i++) {
    const val = i / 80;
    const gaussian =
      (1 / (sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((val - mu) / sigma, 1)); // NOTE: actual code is ((val - mu) / sigma), 2 — excerpt fidelity below
    pts.push({
      x: (i / 80) * SVG_W,
      y: SVG_H - (gaussian / 4.0) * (SVG_H * 0.85),
    });
  }
  const d = pts.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    "",
  );
  return { pdfD: d, pdfFill: `${d} L ${SVG_W} ${SVG_H} L 0 ${SVG_H} Z` };
}, [score]);
```

(Excerpt note: the exponent expression in the real file is `-0.5 * Math.pow((val - mu) / sigma, 2)` — trust the file, not this retype. The load-bearing defect is the magic `gaussian / 4.0` scale.)

Numeric check: at score 0.99 → σ = 0.0705 → peak = 1/(0.0705·√2π) ≈ 5.65 → y = 100 − (5.65/4)·85 ≈ **−19.9** (above the viewBox top, y=0).

Conventions: math helpers used by UI live either in `src/lib/lunarvoid-data.ts` (domain) or `src/lib/chart-math.ts` (plan 003 creates it; if absent, create it here for the PDF builder). Tests: vitest, `@/` alias, no globals.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test` | all pass incl. new file |
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | `✓ built in …` |
| Dev smoke | `npm run dev` | curve stays in view at max sliders |

## Scope

**In scope**:
- `src/lib/chart-math.ts` (create ONLY if plan 003 hasn't; otherwise append)
- `src/components/lunar/LikelihoodCalculator.tsx` (import the builder; delete the inline block)
- `src/lib/__tests__/chart-math.test.ts` (append PDF cases; create if absent)

**Out of scope**:
- `targetWeightedScore` / `calibratedFpRate` / `verdict` — domain math, pinned by plan 003; do not touch.
- The SVG chrome (axis labels, fill gradient, stroke colors from `CHART`).
- Slider ranges/defaults (`0.85 / 1.6 / −8.0` stay).

## Git workflow

- Branch: `advisor/007-pdf-clipping`
- Commit style: `fix(calculator): normalize posterior PDF to its peak so high scores stay in the viewBox`
- Do NOT push.

## Steps

### Step 1: Extract + fix the builder in src/lib/chart-math.ts

```ts
export function buildPdfCurve(score: number, width: number, height: number, steps = 80): { d: string; fill: string } {
  const mu = score;
  const sigma = 0.12 - score * 0.05;
  const peak = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const val = i / steps;
    const gaussian = peak * Math.exp(-0.5 * Math.pow((val - mu) / sigma, 2));
    pts.push({ x: (i / steps) * width, y: height - (gaussian / peak) * (height * 0.85) });
  }
  const d = pts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  return { d, fill: `${d} L ${width} ${height} L 0 ${height} Z` };
}
```

Key change: `gaussian / peak` (self-normalized — mode always at `height · 0.85`) instead of `gaussian / 4.0`. Preserve the two-decimal `toFixed` only in the new builder if the original had none — match original formatting exactly (it had none: raw `${p.x} ${p.y}`). Adjust to plain interpolation to match.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Use it in the component

Replace the whole `const { pdfD, pdfFill } = useMemo(...)` block with:

```ts
const { d: pdfD, fill: pdfFill } = useMemo(
  () => buildPdfCurve(score, SVG_W, SVG_H),
  [score],
);
```

(import `buildPdfCurve` from `@/lib/chart-math`).

**Verify**: `npm run typecheck && npm run build` → both exit 0.

### Step 3: Regression test

Append to `src/lib/__tests__/chart-math.test.ts` (or create with this describe):

```ts
describe('buildPdfCurve', () => {
  const H = 100, W = 420;
  for (const score of [0.05, 0.5, 0.7, 0.9, 0.99]) {
    it(`keeps every point inside the viewBox at score ${score}`, () => {
      const { d } = buildPdfCurve(score, W, H);
      const ys = [...d.matchAll(/[-\d.]+ ([-\d.]+)/g)].map((m) => parseFloat(m[1]!));
      expect(ys.length).toBeGreaterThan(0);
      for (const y of ys) expect(y).toBeGreaterThanOrEqual(0), expect(y).toBeLessThanOrEqual(H);
    });
  }
  it('peaks at 85% of the chart height', () => {
    const { d } = buildPdfCurve(0.5, W, H);
    const ys = [...d.matchAll(/[-\d.]+ ([-\d.]+)/g)].map((m) => parseFloat(m[1]!));
    expect(Math.min(...ys)).toBeCloseTo(H * 0.15, 0); // y = H - 0.85H
  });
});
```

**Verify**: `npx vitest run src/lib/__tests__/chart-math.test.ts` → all pass.

### Step 4: Visual smoke

`npm run dev` → Fusion tab → Likelihood Calculator: drag all three sliders to their confident extremes (morph high, CPR high, Bouguer most negative → score ≈ 0.99): the bell curve remains fully inside the chart with its peak just under the top edge. At default sliders (0.62) the shape looks as before, slightly taller peak.

**Verify**: curve never clipped; score readout and FP bound numbers unchanged (they come from untouched functions).

## Test plan

Covered by Step 3 (regression: scores 0.05→0.99 stay in [0, H]; peak = 0.85·H). Pattern follows plan 003's chart-math suite.

## Done criteria

- [ ] `grep -n "gaussian / 4.0" src/components/lunar/LikelihoodCalculator.tsx src/lib/chart-math.ts` → 0 matches
- [ ] `grep -n "buildPdfCurve" src/components/lunar/LikelihoodCalculator.tsx` → present
- [ ] `npm test` exits 0 with the new PDF cases
- [ ] `npm run typecheck && npm run build` exit 0
- [ ] No files outside in-scope modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- The component's PDF block uses additional consumed outputs beyond `pdfD`/`pdfFill` — extend the builder's return rather than forking logic; report the extra field.
- The original path string format (no toFixed) matters to a consumer you can't see — if any test/snapshot references exact coordinates, reconcile deliberately and report.
- `src/lib/chart-math.ts` doesn't exist and plan 003 is still TODO — creating it here is fine (STOP only if a *conflicting* same-name file exists).

## Maintenance notes

- Plan 015 adds slider seeding + shareable params to this component — the builder stays pure (`score` in, path out), which is what makes that plan cheap.
- If the σ model ever changes (`0.12 − score·0.05`), the normalization keeps the chart safe automatically — that's the point.
- Reviewer: verify score readout / FP-bound text unchanged before/after (only geometry should change).
