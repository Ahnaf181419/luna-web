# Plan 009: Docs truth pass — as-built architecture note, fixed docs index and README, plus AGENTS.md

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- README.md docs/ AGENTS.md`
> If README or docs/ changed since 6f6856b, re-read them before editing — reconcile,
> don't overwrite fresh content.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/004-dead-weight-purge.md (records the post-purge primitive/dep list — this plan documents that state)
- **Category**: docs / dx
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The repo's docs describe a **different application**, and this repo is developed largely by AI agents that read docs first. `docs/architecture_and_design_plan.md` specifies React 18, Tailwind+PostCSS "glassmorphism", Inter/Geist fonts, and a component tree (`components/3d/`, `overview/`, `atlas/`, `src/data/candidates.ts`, a `KnowledgeGraph.tsx`) that doesn't exist — yet `docs/README.md` stamps it "Complete / Baseline Built", links a deleted spec file as "Specification Active", and embeds machine-local absolute paths (including a sibling private workspace) that leak local layout and 404 on GitHub. The README overstates the dataset ("257 … published" — 12 are published; the in-app copy is honest) and omits that **every push to `main` auto-deploys to the live site**. Finally there is no `AGENTS.md`, so every agent session re-derives settled decisions (React pin, vendored-ui rule, oxlint, deploy-on-push).

## Current state

Verified excerpts:

```markdown
<!-- docs/README.md -->
| [`architecture_and_design_plan.md`](./architecture_and_design_plan.md) | … | **Complete / Baseline Built** |
| [`ui_ux_visual_enhancement_plan.md`](./ui_ux_visual_enhancement_plan.md) | … | **Specification Active** |   <!-- file deleted in 05e66e1 -->
- **Repository Root:** [`/home/frostflux/Ahnaf_Shafin/Projects/lunar-lavatube`](../)
- **Primary Scientific Workspace:** [`/home/frostflux/Ahnaf_Shafin/research_project/Lunar_LavaTube`](../../research_project/Lunar_LavaTube)

<!-- docs/architecture_and_design_plan.md:24-25,12 -->
| **Runtime & Bundler** | Vite + React 18 + TypeScript | … |
| **Styling & Design System** | Tailwind CSS + PostCSS | … glassmorphism … |
-   Primary UI & Prose: Clean geometric sans-serif (Inter / Geist).

<!-- README.md:3-5 -->
An open planetary science research portal inferring lunar lava tubes from orbital
morphometry, Mini-RF radar, and GRAIL gravity — 257 calibrated candidates across
21 DTM sites, published with error bars.
```

Actual state to document (verified): React ~19.2.8 (pinned — `@react-three/fiber` peers `react <19.3`), Vite 8, TypeScript ~6.0, Tailwind v4 via `@tailwindcss/vite` (oklch tokens; custom `--radar`/`--gravity`/`--surface`/`--regolith` color tokens — grep `src/index.css` for the full list), oxlint, R3F v9/drei/three 0.185, fonts Instrument Sans/JetBrains Mono/Newsreader/Syne (index.html:15), tree = `App.tsx` + `components/{lunar,instruments,layout,sections,ui}` + `lib/{lunarvoid-data,chart-theme,chart-math,utils}`, deploy via `.github/workflows/deploy.yml` to https://ahnaf181419.github.io/luna-web/ (base `/luna-web/` in vite.config.ts), 12 of 257 candidates published, 8 of 21 sites modeled.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Link check | `grep -rn "\.md)" docs/README.md` | every referenced file exists |
| Path leak check | `grep -rn "/home/" README.md docs/ AGENTS.md` | 0 matches |
| Build | `npm run build` | `✓ built in …` (docs-only plan; sanity) |

## Scope

**In scope**:
- `docs/architecture_and_design_plan.md` (rewrite as as-built)
- `docs/README.md` (fix index)
- `README.md` (headline + Deployment section + testing note)
- `AGENTS.md` (create)

**Out of scope**:
- Any `src/` file.
- `plans/**` (this directory).
- Historical preservation beyond the "superseded decisions" appendix specified below.

## Git workflow

- Branch: `advisor/009-docs-truth-pass`
- Commit style: `docs: rewrite architecture plan as-built, fix docs index and README claims, add AGENTS.md`
- Do NOT push.

## Steps

### Step 1: Rewrite docs/architecture_and_design_plan.md as as-built

Replace the file with an accurate document of the CURRENT system:

1. **Stack table** (verified values above — re-grep before writing: `node -e "const p=require('./package.json'); …"` for versions; `grep -n "font-family\|--radar\|--gravity\|--surface\|--regolith" src/index.css | head -20` for tokens).
2. **Actual module tree** with one line per directory describing its role (`lunar/` = 3D + drawer + calculator; `instruments/` = charts + palette; `sections/` = tab content; `ui/` = vendored shadcn primitives; `lib/` = data + math + tokens).
3. **Data model summary**: `SITES` (8 of 21 DTM targets modeled), `CANDIDATES` (12 published of `CATALOG_SIZE = 257`; site `candidateCount`s sum to 190 — known, deliberate fuzziness of the fictional registry, not a bug), `GATES`, `BUDGET`, math functions (`targetWeightedScore`, `calibratedFpRate`, `verdict`).
4. **Deployment**: push to `main` → Actions build → GitHub Pages at `/luna-web/`; `vite.config.ts` `base` is load-bearing.
5. **Appendix: superseded decisions** — keep the original plan's intent record in ≤10 lines: it prescribed React 18/PostCSS/glassmorphism/Inter and a `KnowledgeGraph.tsx`; superseded by the planetary-cartography/sonar-workbench design overhaul (commit `6f6856b`) — retained so the pivot rationale survives.

**Verify**: every stack claim in the new doc matches `package.json` (spot-check 5 values by command, not memory).

### Step 2: Fix docs/README.md

- Delete the `ui_ux_visual_enhancement_plan.md` row.
- Change the arch plan's status to `As-built (rewritten 2026-09)`.
- Replace the absolute-path links block with repo-relative pointers: Repository Root → `../README.md`; drop the private-workspace link entirely (it does not exist on GitHub).
- If docs/ gains no other files, the table has exactly one row.

**Verify**: `for f in $(grep -oP '\]\(\./[^)]+\)' docs/README.md | tr -d ']()' ); do test -f "docs/$f" || echo "MISSING $f"; done` → prints nothing; `grep -c "/home/" docs/README.md` → 0.

### Step 3: README corrections

- Headline: replace "257 calibrated candidates across 21 DTM sites, published with error bars" with the Atlas section's honest phrasing, e.g. "a 257-candidate index across 21 DTM sites; 12 candidates published in the public working set, each with error bars."
- Add a **Deployment** section: pushes to `main` auto-deploy via GitHub Actions to https://ahnaf181419.github.io/luna-web/; the site builds with Node 22; `vite.config.ts` sets `base: '/luna-web/'` (local `npm run preview` also serves under `/luna-web/`); work on branches, merge deliberately.
- Testing note: reflect reality — if plans 002/003 landed: `npm test` (vitest); otherwise one line: "No test suite yet (see plans/)."

**Verify**: `grep -n "luna-web" README.md` → ≥2 matches (URL + base-path mention); `grep -n "257 calibrated" README.md` → 0 matches.

### Step 4: Create AGENTS.md

Root-level, covering (each as 1-3 lines, table where apt):

- **Commands**: dev/build/lint/test/typecheck + what "done" means (`npm run lint && npm run typecheck && npm test && npm run build` all green).
- **Deploy warning**: push to `main` = live production; work on branches.
- **Settled decisions** (do not re-litigate): react/react-dom pinned `~19.2.8` (R3F peer constraint — check `@react-three/fiber` peer range before any bump); `src/components/ui/` vendored from shadcn new-york, verbatim by design (only documented deviation: pagination type-import was removed with the file in plan 004 — if re-added, apply `import type` under verbatimModuleSyntax); lint is **oxlint**, not eslint; TS `strict` deliberately off (see plans/013 for the indexed-access nuance); 3D teardown console error on tab switch is known/cosmetic.
- **Vendored-primitives rule**: before deleting/adding ui primitives, run the import-reachability check (reproduce the grep from plans/004 Step 1 and cite it).
- **Design tokens**: all colors via `src/index.css` oklch tokens / `CHART` in `src/lib/chart-theme.ts` for SVG attributes — never hardcode hex/oklch in components (rule already stated in index.css header).
- **Data layer facts**: 8 sites modeled of 21; 12 published of CATALOG_SIZE 257; `candidateCount` sums to 190 (deliberate); math functions are load-bearing — pin changes with tests.
- Pointer to `docs/architecture_and_design_plan.md` (as-built) and `plans/README.md`.

**Verify**: `test -s AGENTS.md && echo OK`; `grep -c "19.2.8" AGENTS.md` → ≥1; `grep -rn "/home/" AGENTS.md` → 0.

## Test plan

Docs-only plan — no tests. Verification is the greps above plus a final read-through.

## Done criteria

- [ ] `grep -rn "/home/" README.md docs/ AGENTS.md` → 0 matches
- [ ] `grep -n "React 18\|glassmorphism\|Inter / Geist" docs/architecture_and_design_plan.md` → matches only inside the superseded-decisions appendix (or none)
- [ ] `grep -rn "ui_ux_visual_enhancement_plan" docs/ README.md` → 0 matches
- [ ] `AGENTS.md` exists, non-empty, mentions oxlint, the react pin, and deploy-on-push
- [ ] `npm run build` still exits 0 (untouched code)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The private-workspace reference in docs/README.md is load-bearing for some workflow you can identify (e.g., scripts sourcing it) — report before deleting the link.
- Plan 004 hasn't landed and the primitives list is still 46 — write AGENTS.md against the current reality (46 primitives) instead of the post-purge state, and flag the dependency note.
- README was independently rewritten since 6f6856b — reconcile sections rather than duplicating Deployment/Testing headings.

## Maintenance notes

- AGENTS.md should be updated whenever a settled decision changes (new pin rationale, new tooling) — cheap insurance; reviewers should enforce its accuracy like code.
- The superseded-decisions appendix is the seed of an ADR habit: append, don't delete, future pivots.
