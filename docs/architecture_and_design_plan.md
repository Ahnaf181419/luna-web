# LUNARVOID Portal — As-Built Architecture

> **Status**: As-built (rewritten 2026-09-13). This document describes the system
> as it exists in the repository. The original pre-build design plan is preserved
> in the appendix (superseded).

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | React `~19.2.8` + react-dom `~19.2.8` | **Pinned** — `@react-three/fiber` peer range requires `react <19.3`; check peer ranges before any bump |
| Bundler | Vite 8 | `base: '/luna-web/'` (GitHub Pages subpath) — load-bearing |
| Language | TypeScript ~6.0 | `verbatimModuleSyntax`, `noUncheckedIndexedAccess` on; `strict` deliberately off |
| Styling | Tailwind v4 via `@tailwindcss/vite` | CSS-first: tokens in `src/index.css` (`@theme inline`, oklch); no `tailwind.config` |
| 3D | `@react-three/fiber` v9, `@react-three/drei` v10, `three` 0.185 | Lazy-loaded via `React.lazy` (see `Client3D.tsx`, `StratigraphyOverlay.tsx`) |
| UI kit | shadcn/ui, new-york style — **11 vendored primitives** in `src/components/ui/` | verbatim by design; re-add via `npx shadcn@latest add <name>` |
| Charts | Hand-rolled SVG | math in `src/lib/chart-math.ts`, colors in `src/lib/chart-theme.ts` — no charting library |
| Lint | oxlint (`.oxlintrc.json`) | not eslint |
| Tests | vitest + @testing-library + happy-dom | `npm test`; suites in `src/**/__tests__` + `src/App.test.tsx` |
| Deploy | GitHub Actions → GitHub Pages | push to `main` = live. https://ahnaf181419.github.io/luna-web/ |

Fonts (Google Fonts, `index.html`): Instrument Sans (body), JetBrains Mono
(telemetry/mono), Newsreader (serif accents), Syne (display).

## 2. Module tree

```
src/
├── App.tsx                  # 5-tab root; URL deep-linking (?tab/?site/?candidate)
├── main.tsx                 # StrictMode mount
├── index.css                # design tokens (oklch), utilities, legacy aliases
├── test/setup.ts            # vitest setup (jest-dom)
├── lib/
│   ├── lunarvoid-data.ts    # SITES(8), CANDIDATES(12/257), GATES, BUDGET, math
│   ├── chart-math.ts        # pure chart geometry (radar, transect, PDF curve)
│   ├── chart-theme.ts       # CHART oklch tokens for SVG attributes
│   ├── registry-export.ts   # CSV/JSON working-set export
│   ├── knowledge.ts         # knowledge-vault MOCs + concept dossiers
│   └── utils.ts             # cn() helper
├── hooks/                   # (none — use-mobile removed with sidebar)
├── components/
│   ├── lunar/               # 3D + inspector: LunarGlobe, TubeCutaway,
│   │                        #   StratigraphyOverlay, Client3D (lazy loaders),
│   │                        #   CandidateDrawer, LikelihoodCalculator
│   ├── instruments/         # ElevationProfileChart, EvidenceRadarChart,
│   │                        #   CommandPalette, SitePills
│   ├── sections/            # tab content: Hero, EpistemicThesis, Observatory,
│   │                        #   Atlas, Cutaway, Theory, GatesJourney,
│   │                        #   KnowledgePreview, KnowledgeVault
│   ├── layout/              # Header, Footer
│   └── ui/                  # 11 vendored shadcn primitives (verbatim)
└── App.test.tsx             # URL state machine tests
```

Tabs: `overview` (globe + dossier) · `atlas` (candidate table + drawer) ·
`fusion` (3D cutaway + likelihood calculator) · `gates` (milestones + knowledge
preview) · `knowledge` (vault).

## 3. Data model

- `SITES` — 8 of 21 DTM targets modeled; `siteById` falls back to the first site.
- `CANDIDATES` — 12 published of `CATALOG_SIZE = 257`; site `candidateCount`s sum
  to 190 — deliberate fuzziness of the fictional registry, not a bug.
- Math (load-bearing, test-pinned): `targetWeightedScore` (0.4/0.35/0.25 fusion,
  clamped [0.05, 0.99]), `calibratedFpRate` (floor 1.8/10⁴ km²), `verdict`
  (thresholds 0.85/0.65/0.4). Chart geometry: `src/lib/chart-math.ts`.
- Statuses: CONFIRMED ANCHOR · HIGH CONFIDENCE · INSPECTION BACKLOG · PLAUSIBLE
  SAG · DEFERRED DTM GAP (`STATUS_TONE` map).

## 4. Design system

- Palette: oklch tokens in `src/index.css` — telemetry-amber `--primary`,
  radar-cyan `--radar`/`--accent`, gravity, surface/regolith greys, plus legacy
  `space-*` aliases kept for compat. **Never hardcode hex/oklch in components**;
  SVG attributes use `CHART` from `chart-theme.ts`.
- Signature utilities: `.panel`/`.workbench-panel`, `.collar-ribbon`,
  `.label-mono`, `.font-display`, archival-grid background.
- Aesthetic: "planetary cartography & sonar workbench" — flat, instrument-panel;
  gradients/glassmorphism explicitly purged (commit `6f6856b`).

## 5. Deployment

- `.github/workflows/deploy.yml`: `validate` job (lint → typecheck → test →
  build; runs on push to `main` AND pull requests) gates the `deploy` job
  (Pages artifact, Pages API). Only `main`/manual deploys.
- Node 22 in CI. Local parity: Node ≥ 20.19.
- `vite.config.ts` `base: '/luna-web/'` — local `npm run preview` also serves
  under `/luna-web/`.

## Appendix: superseded decisions (historical)

The original plan (initial commit era) specified React 18, Tailwind+PostCSS
"glassmorphism", Inter/Geist/Space Mono fonts, a `src/data/` + `components/3d|`
`overview|atlas|fusion|gates|graph/` tree, and a `KnowledgeGraph.tsx`. All
superseded by the portal migration (commit `05e66e1`) and the design overhaul
(`6f6856b`, "planetary cartography & sonar workbench"). Retained here only as
the record of the pivot rationale; nothing in this appendix describes the
current system.
