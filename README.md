# LUNARVOID — Lunar Tube Explorer

The public portal of the LUNARVOID research program
([github.com/amrahman90/luna](https://github.com/amrahman90/luna)) — calibrated inference of
lunar lava tubes from orbital morphometry, gravity, and thermal screening, with FP bounds per
10⁴ km² and a $0-of-$800 frugal compute record. Program-level statistics on this site are
frozen from the repository; the interactive candidate atlas is a synthetic demonstration of
the method.

> We do not detect lava tubes. We infer them, with error bars.

## Stack

- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`, oklch design tokens in `src/index.css`)
- **shadcn/ui** (new-york style, 11 vendored primitives in `src/components/ui/`)
- **Three.js** via `@react-three/fiber` + `@react-three/drei` (3D globe + tube cutaway)
- **cmdk** command palette (⌘K / Ctrl+K)
- **vitest** for tests · **oxlint** for linting

## App structure

Single-page, 5-tab layout (`src/App.tsx`), deep-linkable via `?tab=`, `?site=`,
`?candidate=`:

| Tab | Content |
|---|---|
| **Overview & 3D Globe** | Manifesto, epistemic thesis, interactive 3D lunar globe with live cursor coordinates + site dossiers |
| **Candidate Atlas** | Searchable/filterable synthetic demonstration registry (12 of 257 illustrative candidates), likelihood scores, status badges, evidence drawer, CSV/JSON export |
| **3D Tube Cutaway & Fusion** | Animated 3D geological cross-section, four evidence-layer cards, live Bayesian likelihood calculator (seedable from candidates) |
| **Gates & Ledger** | Real 58-session program journey, G0′/G1/G2 FINAL-PASS criteria matrices, frozen program statistics, zero-spend budget ledger, knowledge-vault preview |
| **Knowledge** | Maps of Content (MOCs) with concept dossiers |

## Key directories

```
src/
├── components/
│   ├── lunar/       # 3D globe, tube cutaway, candidate drawer, calculator, client wrappers
│   ├── instruments/ # DTM transect chart, evidence radar chart, command palette, site pills
│   ├── layout/      # Header (sticky telemetry bar), Footer (frozen-stats line + provenance; BibTeX lands with arXiv DOI)
│   ├── sections/    # One component per tab content block
│   └── ui/          # 11 vendored shadcn primitives (verbatim)
└── lib/
    ├── lunarvoid-data.ts  # REAL program record + synthetic sites/candidates/gates data + inference math
    ├── chart-math.ts      # pure chart geometry (radar, transect, PDF)
    ├── chart-theme.ts     # oklch tokens for SVG attributes
    ├── registry-export.ts # CSV/JSON working-set export
    └── utils.ts           # cn() helper
```

## Development

```bash
npm install
npm run dev        # start dev server
npm run lint       # oxlint
npm run typecheck  # tsc -b
npm test           # vitest run
npm run build      # tsc -b && vite build
npm run preview    # preview production build (serves under /luna-web/)
```

Node 22 recommended (matches CI).

## Deployment

**Every push to `main` auto-deploys to GitHub Pages** via `.github/workflows/deploy.yml`:
a `validate` job (lint → typecheck → test → build) gates the deploy. Work on
branches; merge deliberately. Live site: https://ahnaf181419.github.io/luna-web/
(built with `base: '/luna-web/'`).

## Data sources & research provenance

LROC NAC stereo DTMs (ASU / NASA, PDS RDR), LRO Diviner GHRM thermal (Powell 2023),
GRAIL GRGM1200A gravity, NASA terrestrial LiDAR analogs (Kīlauea & Modoc basalts).
Inferences, not detections.

**Two data strata on this site:**

- **Real (program-level):** `PROGRAM_RECORD`, `GATES`, `BUDGET_LEDGER` in
  `src/lib/lunarvoid-data.ts` — frozen statistics of the research repository
  ([amrahman90/luna](https://github.com/amrahman90/luna)): 278-row registry
  (117 ACTIVE + 161 SUPERSEDED, all tier C), FP 3.74 [1.71, 7.10] per 10⁴ km²
  (calibration-context), 58 sessions, 124 tests, $0 of $800. Pinned by
  `src/lib/__tests__/program-record.test.ts`; update only to track the repository.
- **Synthetic (illustrative):** the interactive atlas's sites, candidates,
  `CATALOG_SIZE`, CPR/Bouguer values, and the calculator model — an authored
  demonstration of the method, labeled in the Atlas banner and every export.
