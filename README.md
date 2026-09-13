# LUNARVOID — Lunar Tube Explorer

An open planetary science research portal inferring lunar lava tubes from orbital
morphometry, Mini-RF radar, and GRAIL gravity — a 257-candidate index across 21
DTM sites; 12 candidates published in the public working set, each with error bars.

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
| **Candidate Atlas** | Searchable/filterable registry (12 published of 257 indexed), likelihood scores, status badges, evidence drawer, CSV/JSON export |
| **3D Tube Cutaway & Fusion** | Animated 3D geological cross-section, four evidence-layer cards, live Bayesian likelihood calculator (seedable from candidates) |
| **Gates & Ledger** | 24-session research journey, G0′/G1/G2 gate criteria matrices, zero-spend budget ledger, knowledge-vault preview |
| **Knowledge** | Maps of Content (MOCs) with concept dossiers |

## Key directories

```
src/
├── components/
│   ├── lunar/       # 3D globe, tube cutaway, candidate drawer, calculator, client wrappers
│   ├── instruments/ # DTM transect chart, evidence radar chart, command palette, site pills
│   ├── layout/      # Header (sticky telemetry bar), Footer (BibTeX + provenance)
│   ├── sections/    # One component per tab content block
│   └── ui/          # 11 vendored shadcn primitives (verbatim)
└── lib/
    ├── lunarvoid-data.ts  # Sites, candidates, gates, budget, inference math
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

## Data sources

LROC NAC stereo (ASU / NASA Ames ASP), Mini-RF S-band + Kaguya LRS, GRAIL
GL1200A gravity, NASA terrestrial LiDAR analogs (Kīlauea & Modoc basalts).
Inferences, not detections.
