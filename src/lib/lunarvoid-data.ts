/*
 * LUNARVOID merged data layer — two distinct strata:
 *
 * 1. PROGRAM_RECORD / GATES / BUDGET_LEDGER: REAL frozen program statistics
 *    from the research repository (github.com/amrahman90/luna, R3 report
 *    2026-09-12). Track the repository when updating.
 *
 * 2. SITES / CANDIDATES / CATALOG_SIZE / inference math: a SYNTHETIC
 *    demonstrATION working set (extended from a design source) that powers
 *    the interactive atlas, charts, and calculator. Labeled as illustrative
 *    in the Atlas banner and every export.
 */

export type CandidateStatus =
  | 'CONFIRMED ANCHOR'
  | 'HIGH CONFIDENCE'
  | 'INSPECTION BACKLOG'
  | 'PLAUSIBLE SAG'
  | 'DEFERRED DTM GAP';

export type Category = 'Primary Pits' | 'Collapse Sags' | 'Inspection Backlog';

export type SiteId =
  | 'TRANQPIT1'
  | 'MARIUS'
  | 'INGENIIPIT'
  | 'PHILOLAUS'
  | 'FECUNPIT'
  | 'TYCHOPK'
  | 'HYGINUS'
  | 'HADLEY';

export type GeologicalUnit = 'Mare' | 'Highland' | 'Impact Melt' | 'Polar';

export interface Site {
  id: SiteId;
  name: string;
  lat: number;
  lon: number;
  coordLabel: string;
  dtm: string;
  resolution: string;
  geologicalUnit: GeologicalUnit;
  candidateCount: number;
  primaryAnchor?: boolean;
  description: string;
}

export function formatCoord(lat: number, lon: number, sep = ', ') {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}${sep}${Math.abs(lon).toFixed(2)}°${ew}`;
}

export const SITES: Site[] = [
  {
    id: 'TRANQPIT1',
    name: 'Mare Tranquillitatis Pit',
    lat: 8.33,
    lon: 33.22,
    coordLabel: formatCoord(8.33, 33.22),
    dtm: 'NAC_DTM_TRANQPIT1',
    resolution: '0.8 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 14,
    primaryAnchor: true,
    description:
      'The sole radar-evidenced lava tube conduit on the Moon today. Vertical collapse skylight with subsurface lateral opening evidenced by Mini-RF and radar sounding echoes.',
  },
  {
    id: 'MARIUS',
    name: 'Marius Hills Pit',
    lat: 14.09,
    lon: 303.23,
    coordLabel: formatCoord(14.09, 303.23),
    dtm: 'NAC_DTM_MARIUS',
    resolution: '1.0 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 42,
    description:
      'Prominent sinuous rille complex featuring the deep Marius Hills Pit skylight and multiple collinear surface subsidence sags without impact ejecta.',
  },
  {
    id: 'INGENIIPIT',
    name: 'Mare Ingenii Pit',
    lat: -35.95,
    lon: 166.06,
    coordLabel: formatCoord(-35.95, 166.06),
    dtm: 'NAC_DTM_INGENII',
    resolution: '1.2 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 38,
    description:
      'Farside lunar swirl environment. Deep irregular pit collapse within ancient mare basalt deposits, exhibiting prominent talus ramp geometry.',
  },
  {
    id: 'PHILOLAUS',
    name: 'Philolaus Crater',
    lat: 72.1,
    lon: 327.5,
    coordLabel: formatCoord(72.1, 327.5),
    dtm: 'NAC_DTM_PHILOLAUS',
    resolution: '1.5 m/px',
    geologicalUnit: 'Polar',
    candidateCount: 19,
    description:
      'High-latitude polar pit complex. Deep shadows suggest permanent cold-trap thermal stability and possible volatile preservation within subsurface entryways.',
  },
  {
    id: 'FECUNPIT',
    name: 'Mare Fecunditatis',
    lat: -0.92,
    lon: 48.66,
    coordLabel: formatCoord(-0.92, 48.66),
    dtm: 'NAC_DTM_FECUNPIT',
    resolution: '1.0 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 12,
    description:
      'Equatorial low-slope basalt sheets displaying subtle collinear collapse troughs and chain depressions with visual inspection backlog pending.',
  },
  {
    id: 'TYCHOPK',
    name: 'Tycho Central Peak Impact Melt',
    lat: -43.31,
    lon: 348.64,
    coordLabel: formatCoord(-43.31, 348.64),
    dtm: 'NAC_DTM_TYCHOPK',
    resolution: '1.8 m/px',
    geologicalUnit: 'Impact Melt',
    candidateCount: 8,
    description:
      'Highland impact melt ponds exhibiting drainage channels and hollow flow features formed by rapid cooling of impact melt sheets.',
  },
  {
    id: 'HYGINUS',
    name: 'Rima Hyginus Volcanic Graben',
    lat: 7.77,
    lon: 6.27,
    coordLabel: formatCoord(7.77, 6.27),
    dtm: 'NAC_DTM_HYGINUS',
    resolution: '1.1 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 26,
    description:
      'Prominent linear graben interrupted by rimless collapse pits formed by internal explosive gas venting or magma withdrawal along fault planes.',
  },
  {
    id: 'HADLEY',
    name: 'Rima Hadley (Apollo 15)',
    lat: 25.8,
    lon: 3.65,
    coordLabel: formatCoord(25.8, 3.65),
    dtm: 'NAC_DTM_HADLEY',
    resolution: '0.9 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 31,
    description:
      'Historic meandering sinuous rille flanking the Apennine Mountain front. High-resolution DTM models reveal subtle terrace overhangs.',
  },
];

const SITE_IDS = new Set<string>(SITES.map((s) => s.id));

/** Statically non-empty (pinned by the smoke test asserting SITES.length === 8). */
export const FIRST_SITE = SITES[0]!;

export function isSiteId(value: string | null): value is SiteId {
  return value !== null && SITE_IDS.has(value);
}

export const siteById = (id: SiteId) => SITES.find((s) => s.id === id) ?? FIRST_SITE;

/** Synthetic demonstration catalog size (illustrative; real registry: 278 rows in the repository). */
export const CATALOG_SIZE = 257;

export interface Candidate {
  id: string;
  site: SiteId;
  lat: number;
  lon: number;
  coordLabel: string;
  morphology: string;
  score: number;
  status: CandidateStatus;
  category: Category;
  /* prose fields (source-style, shown in the evidence drawer) */
  cpr: string;
  bouguer: string;
  pit: string;
  notes: string;
  inspection: string;
  /* structured fields (target-style, drive the charts) */
  cprRatio: number;
  bouguerMGal: number;
  depthMeters?: number;
  spanMeters?: number;
  isBacklog: boolean;
}

export const CANDIDATES: Candidate[] = [
  {
    id: 'CAND-TRANQ-001',
    site: 'TRANQPIT1',
    lat: 8.33,
    lon: 33.22,
    coordLabel: formatCoord(8.33, 33.22),
    morphology: 'Vertical Skylight Pit',
    score: 0.98,
    status: 'CONFIRMED ANCHOR',
    category: 'Primary Pits',
    cprRatio: 2.3,
    bouguerMGal: -12.4,
    depthMeters: 105,
    spanMeters: 88,
    isBacklog: false,
    cpr: 'CPR 2.3 ± 0.1 — strong dihedral/blocky return over the pit floor with lateral extension to the west.',
    bouguer:
      '−12.4 mGal residual; void bound consistent with an uncompensated conduit west of the skylight.',
    pit: 'Depth 105 m, span 88 m, rimless, steep vertical basalt walls dropping onto a rubble floor.',
    notes:
      'Primary project anchor. Subsurface conduit evidenced laterally towards the west by Mini-RF radar and ground-penetrating sounding echoes. Every gate re-runs against this site.',
    inspection:
      'No further visual work required. Used as ground truth for false-positive rate estimation.',
  },
  {
    id: 'CAND-TRANQ-002',
    site: 'TRANQPIT1',
    lat: 8.31,
    lon: 33.19,
    coordLabel: formatCoord(8.31, 33.19),
    morphology: 'Collinear Sinuous Sag',
    score: 0.81,
    status: 'HIGH CONFIDENCE',
    category: 'Collapse Sags',
    cprRatio: 1.6,
    bouguerMGal: -7.8,
    depthMeters: 4.2,
    spanMeters: 65,
    isBacklog: false,
    cpr: 'CPR 1.6 ± 0.2 — moderate enhancement, aligned with the projected conduit strike.',
    bouguer:
      '−7.8 mGal residual; deficit consistent with a partially vacant continuation of the anchor conduit.',
    pit: 'Linear sag 65 m wide, 4.2 m relief, trending WSW along the projected strike of the main conduit.',
    notes:
      'Direct collinear extension of the anchor pit at ~1 km separation — plausible roof subsidence over vacant void.',
    inspection:
      'Cross-check with a second illumination-angle NAC pair before promoting above 0.85.',
  },
  {
    id: 'CAND-TRANQ-005',
    site: 'TRANQPIT1',
    lat: 8.36,
    lon: 33.26,
    coordLabel: formatCoord(8.36, 33.26),
    morphology: 'Rimless Circular Depression',
    score: 0.69,
    status: 'INSPECTION BACKLOG',
    category: 'Inspection Backlog',
    cprRatio: 1.2,
    bouguerMGal: -4.1,
    depthMeters: 2.8,
    spanMeters: 40,
    isBacklog: true,
    cpr: 'CPR 1.2 ± 0.2 — weak enhancement, barely above background mare.',
    bouguer: '−4.1 mGal; marginal deficit within the regional field noise.',
    pit: 'Rimless bowl, 40 m span, 2.8 m relief, soft regolith-mantled edge.',
    notes:
      'Subtle depression flagged for visual inspection against multi-incidence LROC NAC browse frames to distinguish from degraded crater.',
    inspection:
      'Backlog task: verify against high-incidence NAC frames and record a reject/keep decision.',
  },
  {
    id: 'CAND-MARIUS-001',
    site: 'MARIUS',
    lat: 14.09,
    lon: 303.23,
    coordLabel: formatCoord(14.09, 303.23),
    morphology: 'Deep Cylindrical Pit',
    score: 0.94,
    status: 'HIGH CONFIDENCE',
    category: 'Primary Pits',
    cprRatio: 2.1,
    bouguerMGal: -9.8,
    depthMeters: 85,
    spanMeters: 62,
    isBacklog: false,
    cpr: 'CPR 2.1 ± 0.1 — enhancement extends beyond the pit footprint along the rille axis.',
    bouguer: '−9.8 mGal residual, the largest deficit in the working set after the anchor.',
    pit: 'Depth 85 m, span 62 m, overhanging roof lip with steep talus slope.',
    notes:
      'Marius Hills Pit situated directly in the axis of a sinuous lava channel. Kaguya LRS shows a candidate reflector near 50 m depth extending west.',
    inspection: 'Photoclinometry pending on the shadowed west wall to bound overhang extent.',
  },
  {
    id: 'CAND-MARIUS-004',
    site: 'MARIUS',
    lat: 14.12,
    lon: 303.29,
    coordLabel: formatCoord(14.12, 303.29),
    morphology: 'Axial Channel Subsidence',
    score: 0.74,
    status: 'PLAUSIBLE SAG',
    category: 'Collapse Sags',
    cprRatio: 1.4,
    bouguerMGal: -5.6,
    depthMeters: 3.1,
    spanMeters: 90,
    isBacklog: false,
    cpr: 'CPR 1.4 ± 0.2 — moderate anomaly following the rille flow thalweg.',
    bouguer: '−5.6 mGal; consistent with partial roof sag prior to complete bridge breach.',
    pit: 'Elongated depression 90 m span, 3.1 m relief, matching the rille flow line.',
    notes:
      'Morphology alone cannot fully separate this from a drained channel segment; radar keeps it above the sag floor.',
    inspection: 'Requires a fresh DTM tile; current stereo pair has 1.8 px vertical residual.',
  },
  {
    id: 'CAND-MARIUS-012',
    site: 'MARIUS',
    lat: 14.18,
    lon: 303.35,
    coordLabel: formatCoord(14.18, 303.35),
    morphology: 'Collinear Pit Chain',
    score: 0.77,
    status: 'HIGH CONFIDENCE',
    category: 'Primary Pits',
    cprRatio: 1.5,
    bouguerMGal: -6.2,
    depthMeters: 5.5,
    spanMeters: 110,
    isBacklog: false,
    cpr: 'CPR 1.5 ± 0.2 — two of three depressions show enhancement.',
    bouguer: '−6.2 mGal; deficit strung along the chain axis.',
    pit: 'Three aligned rimless depressions, 110 m combined span, separated by intact surface bridges at 250 m interval.',
    notes:
      'Discontinuous roof failure along a continuous conduit — the intact bridges are the discriminating observation.',
    inspection:
      'Digitise all three rims at 1:2,000 and test collinearity against the rille azimuth.',
  },
  {
    id: 'CAND-INGENII-001',
    site: 'INGENIIPIT',
    lat: -35.95,
    lon: 166.06,
    coordLabel: formatCoord(-35.95, 166.06),
    morphology: 'Terraced Mare Pit',
    score: 0.89,
    status: 'HIGH CONFIDENCE',
    category: 'Primary Pits',
    cprRatio: 1.9,
    bouguerMGal: -8.5,
    depthMeters: 68,
    spanMeters: 120,
    isBacklog: false,
    cpr: 'CPR 1.9 ± 0.1 — multilevel volume backscatter anomaly over the collapse shelves.',
    bouguer: '−8.5 mGal residual; void bound 1.1–4.4 × 10⁷ m³ at 95%.',
    pit: 'Depth 68 m, irregular span 120 m, multilevel collapse shelves with talus ramps.',
    notes:
      'Farside setting; magnetic-anomaly swirl overlaps the site and may bias radar interpretation.',
    inspection: 'Radar interpretation flagged for swirl-related scattering review.',
  },
  {
    id: 'CAND-INGENII-008',
    site: 'INGENIIPIT',
    lat: -35.91,
    lon: 166.12,
    coordLabel: formatCoord(-35.91, 166.12),
    morphology: 'Discontinuous Trench Chain',
    score: 0.72,
    status: 'INSPECTION BACKLOG',
    category: 'Inspection Backlog',
    cprRatio: 1.3,
    bouguerMGal: -4.8,
    depthMeters: 3.6,
    spanMeters: 55,
    isBacklog: true,
    cpr: 'CPR 1.3 ± 0.2 — one of four depressions shows enhancement.',
    bouguer: '−4.8 mGal; deficit not separable from the adjacent basin signal.',
    pit: 'Cluster of 4 shallow depressions, 25–55 m spans, 3.6 m relief.',
    notes: 'Collinearity is suggestive but the chain also parallels a mapped graben trace.',
    inspection:
      'Backlog task: manual stereo visual inspection to verify rim absence on all four members.',
  },
  {
    id: 'CAND-PHIL-001',
    site: 'PHILOLAUS',
    lat: 72.1,
    lon: 327.5,
    coordLabel: formatCoord(72.1, 327.5),
    morphology: 'Polar Impact Melt Pit',
    score: 0.78,
    status: 'HIGH CONFIDENCE',
    category: 'Primary Pits',
    cprRatio: 1.7,
    bouguerMGal: -3.9,
    depthMeters: 38,
    spanMeters: 45,
    isBacklog: false,
    cpr: 'CPR 1.7 ± 0.2 — high incidence angle degrades the measurement.',
    bouguer: '−3.9 mGal; polar GRAIL resolution limits the void bound.',
    pit: "Depth ~38 m, span 45 m, located on the crater's inner melt terrace.",
    notes:
      'High-latitude illumination leaves the pit in permanent shadow for most of the year — possible volatile retention.',
    inspection: 'Only two usable stereo pairs; DTM vertical precision is the weakest in the set.',
  },
  {
    id: 'CAND-FECUN-002',
    site: 'FECUNPIT',
    lat: -0.92,
    lon: 48.66,
    coordLabel: formatCoord(-0.92, 48.66),
    morphology: 'Low-Relief Basalt Sag',
    score: 0.63,
    status: 'INSPECTION BACKLOG',
    category: 'Inspection Backlog',
    cprRatio: 1.1,
    bouguerMGal: -2.8,
    depthMeters: 1.9,
    spanMeters: 75,
    isBacklog: true,
    cpr: 'CPR 1.1 ± 0.2 — no detectable anomaly.',
    bouguer: '−2.8 mGal; consistent with zero deficit within noise.',
    pit: 'Span 75 m, relief 1.9 m, soft-edged and heavily regolith-mantled.',
    notes:
      'Part of 3 Fecunditatis candidate cluster; retained to keep the false-positive calibration set honest.',
    inspection:
      'Backlog task: verify against high-incidence LROC frames and record a reject/keep decision.',
  },
  {
    id: 'CAND-TYCHO-001',
    site: 'TYCHOPK',
    lat: -43.31,
    lon: 348.64,
    coordLabel: formatCoord(-43.31, 348.64),
    morphology: 'Impact Melt Drainage Cavity',
    score: 0.59,
    status: 'DEFERRED DTM GAP',
    category: 'Inspection Backlog',
    cprRatio: 1.3,
    bouguerMGal: -1.5,
    depthMeters: 14,
    spanMeters: 30,
    isBacklog: true,
    cpr: 'CPR 1.3 ± 0.3 — highland background inflates the uncertainty.',
    bouguer: "−1.5 mGal; within noise of the crater's central-peak signal.",
    pit: 'Depth 14 m, span 30 m, drainage channel into a hollow melt pond.',
    notes:
      'Deferred under Gate G2 pending Tier-1 ASP photogrammetry reproduction on AX52 instance.',
    inspection: 'Deferred — no manual inspection until the DTM gap is closed.',
  },
  {
    id: 'CAND-HADLEY-003',
    site: 'HADLEY',
    lat: 25.84,
    lon: 3.71,
    coordLabel: formatCoord(25.84, 3.71),
    morphology: 'Meander Channel Terrace Overhang',
    score: 0.83,
    status: 'HIGH CONFIDENCE',
    category: 'Collapse Sags',
    cprRatio: 1.8,
    bouguerMGal: -7.2,
    depthMeters: 45,
    spanMeters: 180,
    isBacklog: false,
    cpr: 'CPR 1.8 ± 0.1 — enhancement tracks the inner meander bench.',
    bouguer: '−7.2 mGal residual along the terrace front.',
    pit: 'Depth 45 m, span 180 m, acute negative slope inflection on the inner bench.',
    notes:
      'Inner meander bench displaying acute negative slope inflection indicating hollow lava bench undercutting — Apollo 15 ground context.',
    inspection: 'Compare terrace profile against the Apollo 15 traverse photography.',
  },
];

export const STATUS_TONE: Record<CandidateStatus, string> = {
  'CONFIRMED ANCHOR': 'border-primary/50 bg-primary/15 text-primary',
  'HIGH CONFIDENCE': 'border-success/50 bg-success/15 text-success',
  'INSPECTION BACKLOG': 'border-warning/40 bg-warning/10 text-warning',
  'PLAUSIBLE SAG': 'border-border bg-muted text-muted-foreground',
  'DEFERRED DTM GAP': 'border-destructive/40 bg-destructive/10 text-destructive',
};

/* ------------------------ real program record (frozen) ----------------------- */
/*
 * Frozen program statistics of the LUNARVOID research project
 * (github.com/amrahman90/luna), as of the R3 terminal status report
 * (2026-09-12, HEAD c5be2a2). These are REAL numbers — not part of the
 * illustrative working set below. Change them only to track the repository.
 */

export const PROGRAM_REPO_URL = 'https://github.com/amrahman90/luna';

export const PROGRAM_RECORD = {
  repoUrl: PROGRAM_REPO_URL,
  frozenAsOf: 'R3 terminal report · 2026-09-12',
  sessionsRun: 58,
  testsGreen: 124,
  spendUsd: 0,
  ceilingUsd: 800,
  tier1CeilingUsd: 150,
  dtmsOnDisk: 21,
  goodTierPopulation: 649,
  areaSearchedKm2: 24063,
  registryRows: 278,
  registryActive: 117,
  registrySuperseded: 161,
  tierA: 0,
  tierB: 0,
  fpRowRate: 3.74,
  fpRowCi: [1.71, 7.1],
  fpUniqueRate: 2.08,
  fpUniqueCi: [0.67, 4.85],
  puBaseline: { precision: 0.9, recall: 0.8182, auc: 0.8968 },
  puV5RunB: { f1: 0.824, auc: 0.93 },
} as const;

/* ------------------------------ gates & budget ----------------------------- */

export interface GateCriterion {
  id: string;
  name: string;
  verdict: 'PASS' | 'PARTIAL' | 'DEMONSTRATION' | 'DEFERRED' | 'DEFERRED-DTM-GAP' | 'NOT MEASURED';
  detail: string;
}

export interface GateReport {
  id: string;
  title: string;
  status: 'FINAL-PASS';
  datePassed: string;
  spend: number;
  criteria: GateCriterion[];
  summary: string;
}

export interface BudgetRecord {
  tier: string;
  allocation: number;
  spent: number;
  status: string;
  description: string;
}

export const GATES: GateReport[] = [
  {
    id: 'G0-PRIME',
    title: 'Gate G0′: Tier-0 Environment & Pipeline Baseline',
    status: 'FINAL-PASS',
    datePassed: '2026-08-21',
    spend: 0,
    summary:
      'Zero-cost subset of Gate G0: 9 PASS / 0 PARTIAL / 0 FAIL at $0. Kriging correction, measured noise floors, confusion layers, and the Z2 sag search — the Mare Tranquillitatis pit recovered at rank 11 of 29, 45 m from the catalogued feature. LLTB-1 v0.4 analog benchmark: best honest F1 0.362, recall 1.00 wherever ≥5 void cells.',
    criteria: [
      {
        id: 'C0-1',
        name: 'Pit-Recovery Primitive',
        verdict: 'PASS',
        detail:
          '7/8 covered pits recovered at ≥50% catalogued depth. The sole miss (Marius Hills) is the pre-registered v5 I14 rille-funnel mode — a finding, not a defect.',
      },
      {
        id: 'C0-2',
        name: 'Noise-Floor Measurement',
        verdict: 'PASS',
        detail:
          'Sag-band RMS 1.245–1.379 m ⇒ effective single-DTM detection floor ≥5 m (≥4 m at TRANQPIT1). 1–2 m sags are not single-DTM claimable.',
      },
      {
        id: 'C0-3',
        name: 'Confusion Layers & Scope Ranking',
        verdict: 'PASS',
        detail:
          '195 Hurwitz rilles + 4.45M CC-BY-4.0 craters as confusion rasters; 660-DTM scope ranking with MARIUSCONE as top WP2 target.',
      },
      {
        id: 'C0-4',
        name: 'Local ASP Stereo Attempt',
        verdict: 'DEFERRED',
        detail:
          'Time-boxed local Ames Stereo Pipeline run incomplete at the memory ceiling; Tier-1 rental path (trigger T1) unchanged. Published LROC RDR DTMs used meanwhile.',
      },
    ],
  },
  {
    id: 'G1',
    title: 'Gate G1: Calibration Freeze & Analog Transfer',
    status: 'FINAL-PASS',
    datePassed: '2026-08-22',
    spend: 0,
    summary:
      '5 PASS / 1 PARTIAL / 1 DEMONSTRATION / 1 DEFERRED / 1 DEFERRED-DTM-gap / 1 NOT MEASURED. The TRANQPIT1 recipe was frozen (F1 0.400, byte-identical reproduction) and transferred unchanged to 9 further DTMs — a portability demonstration, not a held-out evaluation. Honest per-DTM FP reading: 240.41 [49.58, 702.58] per 10⁴ km² at the calibration site.',
    criteria: [
      {
        id: 'C1-1',
        name: 'LLTB-1 v0.5 Degradation Story',
        verdict: 'PASS',
        detail:
          'Verify 11/11. Hapke mean F1 0.349→0.096 at 0.5 m attributed to shadow voiding of trench-hosted labels; caveats carried verbatim into the manuscript record.',
      },
      {
        id: 'C1-2',
        name: 'Indian Tunnel Analog Registration',
        verdict: 'PASS',
        detail:
          'Dense-gate RMS 0.490 m (9.3% inliers <1 m); entrance-trench mask semantics guardrailed; the 5-cell roofed-void ground truth is excluded from sag rungs.',
      },
      {
        id: 'C1-3',
        name: 'Registry Provenance & Tier Discipline',
        verdict: 'PASS',
        detail:
          'N=44 rows at G1, tier A=0 / B=0 / C=44. Rille-intersection candidates downgraded per the pre-registered I14 funnel rule; ring artifacts annotated in-row.',
      },
      {
        id: 'C1-4',
        name: 'Diviner Thermal Line',
        verdict: 'PARTIAL',
        detail:
          '2/7 DTMs fully usable in the Powell GHRM coverage gap; INGENIIPIT +2.65 K reframed as rocky-ejecta counter-evidence; tube-scale signatures are sub-pixel at 128 ppd.',
      },
    ],
  },
  {
    id: 'G2',
    title: 'Gate G2: N=7→N=21 Expansion & FP Bounds',
    status: 'FINAL-PASS',
    datePassed: '2026-08-24',
    spend: 0,
    summary:
      '5 PASS / 1 PARTIAL / 2 DEMONSTRATION / 1 DEFERRED / 1 DEFERRED-DTM-gap-PARTIAL / 1 NOT MEASURED. Eleven sha-verified NAC DTMs acquired at $0 (3.59 GiB); the registry grew to 278 rows at terminal state. The aggregate FP bound improved 6.06 → 3.74 per 10⁴ km² — purely denominator-driven (14,840 → 24,063 km² searched); all 9 FPs unchanged.',
    criteria: [
      {
        id: 'C2-1',
        name: 'Registry Expansion to N=21',
        verdict: 'PASS',
        detail:
          '44 → 257 rows (+213) with the 15-column schema preserved byte-identically; original 44 rows verified intact; tiers remain A=0 / B=0.',
      },
      {
        id: 'C2-2',
        name: 'By-Terrain Noise-Floor Split',
        verdict: 'PASS',
        detail:
          'N=19 floors: mare n=9 median pooled RMS 1.118 m vs highland n=5 at 1.089 m — central-peak impact melt is smoother than mare regolith; not a portability claim.',
      },
      {
        id: 'C2-3',
        name: 'Highland Extrapolation Handling',
        verdict: 'DEMONSTRATION',
        detail:
          '9 highland / impact-melt DTMs tested with 0 FPs counted at the calibration threshold; the FROZEN recipe is mare-only, so this is extrapolation handling, not portability.',
      },
      {
        id: 'C2-4',
        name: 'Survey-Grade FP Rate',
        verdict: 'NOT MEASURED',
        detail:
          'Aggregate 3.74 [1.71, 7.10] per 10⁴ km² over 24,063 km² is calibration-context, not a survey rate: all 21 DTMs are catalogued-pit or impact-melt selected, and the 30-random-mare control still lacks NAC coverage.',
      },
    ],
  },
];

export const BUDGET_LEDGER: BudgetRecord[] = [
  {
    tier: 'Tier-0 (Local Machine Execution)',
    allocation: 0,
    spent: 0,
    status: 'COMPLETE — 58 SESSIONS',
    description:
      'All 58 research sessions, registry tooling, verifier scripts, and the 124-test suite executed on local hardware with zero external compute cost.',
  },
  {
    tier: 'Tier-1 Burst Buffer (Hetzner AX52-class)',
    allocation: 150,
    spent: 0,
    status: 'APPROVED / UNSPENT (D2)',
    description:
      'Burst buffer for DTM-production gap closure and stereo reproduction. Trigger approved 2026-08-22 under a $150 ceiling; never drawn.',
  },
  {
    tier: 'Master Plan v5 Lifetime Ceiling',
    allocation: 800,
    spent: 0,
    status: '30-MONTH CAP',
    description: 'Non-negotiable total compute ceiling across full multi-year project scope.',
  },
];

/* ------------------------------ inference math ----------------------------- */

/** Target's hand-tuned weighted fusion: morphometry 0.40, radar 0.35, gravity 0.25. */
export function targetWeightedScore(morphRatio: number, radarCpr: number, bouguerDeficit: number) {
  const morphScore = Math.min(1.0, morphRatio / 1.2) * 0.4;
  const radarScore = Math.min(1.0, (radarCpr - 0.5) / 2.0) * 0.35;
  const gravScore = Math.min(1.0, Math.abs(bouguerDeficit) / 14.0) * 0.25;
  return Math.min(0.99, Math.max(0.05, morphScore + radarScore + gravScore));
}

/** Target-style calibrated FP rate, per 10⁴ km². */
export function calibratedFpRate(score: number) {
  return Math.max(1.8, (1.0 - score) * 19.4);
}

export function verdict(score: number) {
  if (score >= 0.85)
    return 'Three independent evidence lines agree. Report as a high-confidence inferred conduit with stated error bars — still not a detection.';
  if (score >= 0.65)
    return 'Evidence is suggestive but one line dominates the posterior. Publish as a candidate and queue targeted re-observation.';
  if (score >= 0.4)
    return 'Ambiguous. The morphology is compatible with degraded impact structures; keep in the inspection backlog.';
  return 'Below the calibration floor. Retain only as a false-positive control, do not report as a candidate.';
}
