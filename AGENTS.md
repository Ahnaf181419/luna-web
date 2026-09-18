# AGENTS.md

Working agreements for AI coding agents in this repo. Human-readable context:
`README.md`, as-built architecture: `docs/architecture_and_design_plan.md`,
roadmap/status/lessons: `docs/ROADMAP.md`.

## Commands

| Purpose | Command |
|---|---|
| Dev server | `npm run dev` |
| Lint (oxlint) | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Tests | `npm test` (watch: `npm run test:watch`) |
| Production build | `npm run build` |
| Format | `npm run format` / check: `npm run format:check` |

**"Done" means all of these pass:** `npm run lint && npm run typecheck && npm
test && npm run build`. CI runs the same gate on every push/PR.

## Hard rules

1. **Pushing to `main` deploys to production** (GitHub Pages, auto-build). Work
   on branches; merge deliberately.
2. **`src/components/ui/` is vendored shadcn code, verbatim by design.** Do not
   restyle, reformat, or "improve" the 11 live primitives. Before deleting or
   adding primitives, run an import-reachability check (see
   `plans/004-dead-weight-purge.md` Step 1) — deleted ones are re-addable via
   `npx shadcn@latest add <name>`.
3. **react/react-dom are pinned `~19.2.8`** because `@react-three/fiber` peers
   `react <19.3`. Check fiber's peer range before any React bump.
4. **Never hardcode colors** — oklch tokens in `src/index.css` for CSS, `CHART`
   in `src/lib/chart-theme.ts` for SVG attributes.
5. **The domain math is load-bearing** (`targetWeightedScore`,
   `calibratedFpRate`, `verdict`, `src/lib/chart-math.ts`). Tests pin it
   (`src/lib/__tests__/`); change math and tests together, with rationale.
6. Format before committing: `npm run format` (Prettier; `src/components/ui`
   and `plans/` are excluded).
7. **Third-party assets go in `public/`, not at runtime.** `public/moon/ldam_4k.jpg`
   is the LROC moon color map (CC-BY 3.0, attribution via HUD label). When
   swapping it, bump `MOON_ASSET_VERSION` in `LunarGlobe.tsx` so stale
   browsers refetch. Same convention for any future asset additions.

## Settled decisions (do not re-litigate)

- TS `strict` is off **deliberately**; `noUncheckedIndexedAccess` is on — guard
  indexed reads with real checks, not `!` (one allowed anchor: `FIRST_SITE`).
- Lint is **oxlint**, not eslint (plus Prettier for formatting).
- The 3D tab-switch OrbitControls teardown console error is known and cosmetic
  (transient unmount race in R3F v9 + React 19); canvases recover. Don't chase it.
- `LunarGlobe`'s cursor telemetry (lat/lon readout) is an intentional local
  extension over the design source — keep it.
- Two `export default`s survive in `lunar/` (LunarGlobe, TubeCutaway) because
  dynamic `import()` consumers rely on them.
- **Both font themes (Console + Archive) are permanent** — the union Google
  Fonts payload in `index.html` is intentional; do not prune a theme or remove
  the `FontThemeToggle`.

## Data-layer facts

- **Two strata in `src/lib/lunarvoid-data.ts`:**
  - **REAL program record** — `PROGRAM_RECORD`, `GATES`, `BUDGET_LEDGER` are
    frozen statistics of the research repository
    (github.com/amrahman90/luna, R3 report 2026-09-12): 278-row registry
    (117 ACTIVE + 161 SUPERSEDED, all tier C), FP 3.74 [1.71, 7.10] per 10⁴ km²
    (calibration-context, not survey), gates G0′/G1/G2 FINAL-PASS, 58 sessions,
    124 tests, $0 of $800. Pinned by
    `src/lib/__tests__/program-record.test.ts`. Do NOT "fix" these as if
    fictional; update only deliberately to track the repository.
  - **Synthetic demonstration set** — `SITES` (8 of 21 modeled), `CANDIDATES`
    (12 of `CATALOG_SIZE = 257`), site `candidateCount`s sum to 190
    (deliberate fictional-registry fuzziness), and the calculator model.
    Labeled as illustrative in the Atlas banner and all exports.
- Elevation transects are **parametric illustrations** derived from depth/span,
  not measured profiles — any export must label provenance
  (`src/lib/registry-export.ts` does).

## Verification notes

- Tests run in happy-dom; 3D components (R3F/WebGL) are deliberately NOT unit-
  tested — verify 3D changes via `npm run dev` in a real browser.
- `vite.config.ts` sets `base: '/luna-web/'`; `npm run preview` serves under
  `/luna-web/`, not `/`.
