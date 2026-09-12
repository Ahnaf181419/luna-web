# LUNARVOID — Lunar Tube Explorer

An open planetary science research portal inferring lunar lava tubes from orbital
morphometry, Mini-RF radar, and GRAIL gravity — 257 calibrated candidates across
21 DTM sites, published with error bars.

> We do not detect lava tubes. We infer them, with error bars.

## Stack

- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`, oklch design tokens in `src/index.css`)
- **shadcn/ui** (new-york style, 46 primitives in `src/components/ui/`)
- **Three.js** via `@react-three/fiber` + `@react-three/drei` (3D globe + tube cutaway)
- **cmdk** command palette (⌘K / Ctrl+K)
- **oxlint** for linting

## App structure

Single-page, 5-tab layout (`src/App.tsx`):

| Tab | Content |
|---|---|
| **Overview & 3D Globe** | Manifesto, epistemic thesis, interactive 3D lunar globe with live cursor coordinates + site dossiers |
| **Candidate Atlas** | Searchable/filterable registry (shadcn Table), likelihood scores, status badges, evidence drawer |
| **3D Tube Cutaway & Fusion** | Animated 3D geological cross-section, four evidence-layer cards, live Bayesian likelihood calculator |
| **Gates & Ledger** | 24-session research journey, G0′/G1/G2 gate criteria matrices, zero-spend budget ledger, knowledge-vault preview |
| **Knowledge** | Obsidian-style Maps of Content (MOCs) with wiki-graph node links |

## Key directories

```
src/
├── components/
│   ├── lunar/      # 3D globe, tube cutaway, candidate drawer, calculator, client wrappers
│   ├── instruments/ # DTM transect chart, evidence radar chart, command palette
│   ├── layout/     # Header (sticky telemetry bar), Footer (BibTeX + provenance)
│   ├── sections/   # One component per tab content block
│   └── ui/         # shadcn primitives
├── lib/
│   ├── lunarvoid-data.ts  # Sites, candidates, gates, budget, inference math
│   └── utils.ts           # cn() helper
└── hooks/          # useIsMobile
```

## Development

```bash
npm install
npm run dev        # start dev server
npm run lint       # oxlint
npm run build      # tsc -b && vite build
npm run preview    # preview production build
```

## Data sources

LROC NAC stereo (ASU / NASA Ames ASP), Mini-RF S-band + Kaguya LRS, GRAIL
GL1200A gravity, NASA terrestrial LiDAR analogs (Kīlauea & Modoc basalts).
Inferences, not detections.
