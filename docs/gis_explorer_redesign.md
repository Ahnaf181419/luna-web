# LUNARVOID — Full-Screen Scientific GIS Explorer Redesign

**Version:** 1.0  
**Date:** 2026-09-11  
**Status:** IN PROGRESS  
**Supersedes:** `docs/ui_ux_visual_enhancement_plan.md` (warm NASA archival theme — rejected by user)

---

## 1. Design Direction

The user explicitly rejected the tab-based card dashboard ("AI slop") and selected:

> **Full-Screen Scientific GIS Explorer** — LROC QuickMap / NASA Eyes style: full-height
> interactive 3D globe as the main view, compact floating toolbars, and side drawers.

### Reference Applications
- [LROC QuickMap](https://quickmap.lroc.asu.edu/) — Full-viewport orthographic lunar map, floating layer controls
- [NASA Eyes on the Solar System](https://eyes.nasa.gov/) — 3D immersive viewport, minimal chrome
- [Cesium Ion](https://cesium.com/platform/cesiumjs/) — Full-viewport globe, floating panels

---

## 2. Architecture: Before → After

### Before (Tab-Based Dashboard)
```
┌─────────────────────────────────────┐
│  Header (sticky nav bar + tabs)     │
├─────────────────────────────────────┤
│  max-w-7xl centered content         │
│  ┌──────────────────────────────┐   │
│  │ Hero Banner Card             │   │
│  ├──────────────────────────────┤   │
│  │ Globe (480px card) │ Dossier │   │
│  ├──────────────────────────────┤   │
│  │ Pillar Cards (3-col grid)    │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│  Footer                            │
└─────────────────────────────────────┘
```

### After (GIS Explorer)
```
┌─────────────────────────────────────────────┐
│                                             │
│        FULL-VIEWPORT 3D LUNAR GLOBE         │
│        (100vw × 100vh, no borders)          │
│                                             │
│  ┌──────┐                      ┌─────────┐  │
│  │ Logo │                      │ Compact │  │
│  │ +Nav │ ← floating toolbar → │ Search  │  │
│  └──────┘                      └─────────┘  │
│                                             │
│  ┌──────────────┐     ┌──────────────────┐  │
│  │ Left Drawer  │     │ Right Drawer     │  │
│  │ (collapse)   │     │ (collapse)       │  │
│  │              │     │                  │  │
│  │ • Sites list │     │ • Site Dossier   │  │
│  │ • Candidates │     │ • Evidence Radar │  │
│  │ • Filters    │     │ • Elevation      │  │
│  │              │     │ • Gates summary  │  │
│  └──────────────┘     └──────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ Bottom Status Bar (compact 32px)     │   │
│  │ Coordinates │ Gate │ Budget │ FP Rate │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 3. Color & Typography System

### Palette — "Deep Space Instrument"

No warm golds, no decorative gradients. Clean instrument-grade UI.

| Token          | Hex       | Usage                              |
|----------------|-----------|-------------------------------------|
| `void-black`   | `#0a0a0c` | Viewport background (behind globe) |
| `panel-bg`     | `#111114` | Drawer / panel background          |
| `panel-surface`| `#18181b` | Elevated card surfaces             |
| `border`       | `#27272a` | All borders — single muted tone    |
| `text-primary` | `#e4e4e7` | Primary readable text              |
| `text-muted`   | `#71717a` | Labels, secondary text             |
| `accent-blue`  | `#3b82f6` | Primary interactive (links, focus) |
| `accent-teal`  | `#14b8a6` | Anchor / verified markers          |
| `accent-amber` | `#f59e0b` | Warning / candidate pins           |
| `accent-red`   | `#ef4444` | Critical / backlog                 |

### Typography
- **Font:** Inter (sans), JetBrains Mono (mono) — already installed
- **No gradient text.** No decorative glow effects.
- **Sizing:** Drawers use 11–13px body, 10px labels, 14–16px headings

### Anti-Slop Rules
1. NO cards-inside-cards nesting
2. NO gradient text (`bg-clip-text bg-gradient-to-r`)
3. NO decorative pulse animations on non-data elements
4. NO `glow-solar`, `lunar-grid` utilities
5. NO rounded-2xl everywhere — use `rounded-lg` max
6. Panel backgrounds: solid flat colors, no radial gradients
7. Borders: 1px solid, one color, no colored borders on containers

---

## 4. Component Architecture

### Deleted Components
- `src/components/layout/Header.tsx` — replaced by `FloatingToolbar`
- `src/components/layout/Footer.tsx` — replaced by `StatusBar`
- `src/components/tabs/OverviewTab.tsx` — content merged into globe view
- `src/components/tabs/AtlasTab.tsx` — content merged into left drawer
- `src/components/tabs/EvidenceTab.tsx` — content merged into right drawer
- `src/components/tabs/GatesTab.tsx` — content merged into right drawer
- `src/components/tabs/KnowledgeTab.tsx` — content merged into right drawer

### New Components
```
src/
├── App.tsx                          ← Full-viewport shell
├── components/
│   ├── 3d/
│   │   ├── LunarGlobe3D.tsx        ← REWRITE: fills 100vw×100vh
│   │   └── LavaTubeCutaway3D.tsx   ← KEEP (shown in right drawer modal)
│   ├── instruments/
│   │   ├── ElevationProfileChart.tsx ← KEEP
│   │   ├── EvidenceRadarChart.tsx    ← KEEP
│   │   └── CommandPalette.tsx        ← KEEP (restyle)
│   ├── overlay/
│   │   ├── FloatingToolbar.tsx      ← NEW: compact top bar
│   │   ├── LeftDrawer.tsx           ← NEW: sites + candidates list
│   │   ├── RightDrawer.tsx          ← NEW: detail panels
│   │   └── StatusBar.tsx            ← NEW: bottom telemetry strip
│   └── panels/
│       ├── SiteListPanel.tsx        ← NEW: sites list for left drawer
│       ├── CandidateListPanel.tsx   ← NEW: candidate registry for left drawer
│       ├── SiteDossierPanel.tsx     ← NEW: selected site detail
│       ├── CandidateDetailPanel.tsx ← NEW: selected candidate detail  
│       ├── EvidenceFusionPanel.tsx  ← NEW: Bayesian inference + cutaway
│       ├── GatesSummaryPanel.tsx    ← NEW: gates accordion
│       └── KnowledgePanel.tsx       ← NEW: MOC explorer
```

### State Management
- `App.tsx` holds global state:
  - `leftDrawerOpen: boolean`
  - `rightDrawerOpen: boolean`
  - `rightPanelMode: 'site' | 'candidate' | 'evidence' | 'gates' | 'knowledge'`
  - `selectedSiteId: string | null`
  - `selectedCandidateId: string | null`
  - Globe click → sets `selectedSiteId` → opens right drawer with site dossier
  - Candidate click → sets `selectedCandidateId` → opens right drawer with candidate detail

---

## 5. Interaction Model

### Globe Interactions
- **Drag rotate** (existing) — no change
- **Scroll zoom** (existing) — no change
- **Pin click** → select site → open right drawer with `SiteDossierPanel`
- **Pin hover** → tooltip near cursor (not a card overlay)
- **Double-click pin** → zoom to site + open candidate list

### Keyboard Shortcuts
- `Cmd+K` / `Ctrl+K` — Command palette (existing)
- `[` — Toggle left drawer
- `]` — Toggle right drawer
- `Esc` — Close active drawer / deselect
- `1–5` — Switch right panel mode

### Drawer Behavior
- **Left drawer** (320px): slides in from left, pushes nothing (overlays globe)
- **Right drawer** (380px): slides in from right, overlays globe
- Both use `backdrop-blur-sm` on the panel edge for depth
- Both have a compact close button (X or chevron)

---

## 6. Implementation Order

### Phase 1: Foundation (This Session)
1. Rewrite `tailwind.config.js` — new token system
2. Rewrite `index.css` — strip all decorative utilities
3. Rewrite `App.tsx` — full-viewport shell with drawer state
4. Rewrite `LunarGlobe3D.tsx` — fill viewport, no container borders
5. Create `FloatingToolbar.tsx`
6. Create `StatusBar.tsx`
7. Create `LeftDrawer.tsx` + `SiteListPanel` + `CandidateListPanel`
8. Create `RightDrawer.tsx` + all detail panels
9. Wire command palette
10. Build verification

### Phase 2: Polish (Next Session)
- Smooth drawer animations (CSS transitions)
- Keyboard shortcut overlay
- Mobile responsive (drawers become bottom sheets)
- Performance: globe LOD, lazy panel rendering

---

## 7. Files Preserved (No Rewrite Needed)
- `src/types/index.ts` — all data interfaces
- `src/data/candidates.ts` — candidate records
- `src/data/sites.ts` — site dossiers
- `src/data/gates.ts` — gate reports + budget ledger
- `src/components/instruments/ElevationProfileChart.tsx` — SVG chart
- `src/components/instruments/EvidenceRadarChart.tsx` — radar chart
- `src/components/3d/LavaTubeCutaway3D.tsx` — cutaway 3D
