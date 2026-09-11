import type { GateReport, BudgetRecord } from '../types';

export const GATES: GateReport[] = [
  {
    id: 'G0-PRIME',
    title: 'Gate G0′: Tier-0 Environment & Pipeline Baseline',
    status: 'PASSED',
    sessionCompleted: 6,
    spend: 0,
    summary: 'Proved offline Tier-0 workstation environment capability. Validated USGS ISIS3 ingestion and NASA Ames Stereo Pipeline (ASP) photogrammetric reproduction on TRANQPIT1 stereo pair without cloud compute.',
    criteria: [
      { id: 'C0-1', name: 'Tier-0 ISIS3 & ASP Pipeline Execution', verdict: 'PASS', detail: 'Local execution validated on Ubuntu LTS with 0 cloud spend.' },
      { id: 'C0-2', name: 'TRANQPIT1 DTM Reproduction', verdict: 'PASS', detail: '0.8 m/px elevation grid matched published LROC NAC DTM within 0.14m RMS.' },
      { id: 'C0-3', name: 'SLDEM2015 Normalization Pipeline', verdict: 'DEFERRED', detail: 'Normalisation Step 18.1 deferred to cloud burst.' },
      { id: 'C0-4', name: 'Confound Covariates Tracking', verdict: 'DEFERRED', detail: 'I12 LOLA track density and NAC image count logged.' }
    ]
  },
  {
    id: 'G1',
    title: 'Gate G1: Morphometric Filtering & Candidate Registry',
    status: 'PASSED',
    sessionCompleted: 18,
    spend: 0,
    summary: 'Extracted 257 candidate features across 17 ran DTM targets (4 deferred). Isolated the 27 visual-inspection backlog targets across FECUNPIT, TRANQPIT1, and INGENIIPIT.',
    criteria: [
      { id: 'C1-1', name: 'Morphometric Extraction Across Sites', verdict: 'PASS', detail: 'Ran over 21 sites, sample space N=21/649 = 3.2%.' },
      { id: 'C1-2', name: 'Candidate Feature Registration', verdict: 'PASS', detail: '257 features registered with lat/lon, depth, span, and DTM footprint.' },
      { id: 'C1-3', name: 'Visual Inspection Backlog Triage', verdict: 'PASS', detail: '27 ambiguous features tagged for human NAC browse inspection.' },
      { id: 'C1-4', name: 'Zero-Cost Budget Compliance', verdict: 'PASS', detail: 'Maintained strict $0 spend discipline through Session 18.' }
    ]
  },
  {
    id: 'G2',
    title: 'Gate G2: Multi-Evidence Fusion & Calibration',
    status: 'DRAFT-FOR-REVIEW',
    spend: 0,
    summary: '5 PASS / 1 PARTIAL / 2 DEMONSTRATION / 1 DEFERRED / 1 DEFERRED-DTM-gap-EXPANDED / 1 NOT MEASURED. Formulated calibration-context aggregate False Positive rate: 6.06 [2.77, 11.51] per 10⁴ km².',
    criteria: [
      { id: 'C2-1', name: 'Bayesian Fusion Formulation', verdict: 'PASS', detail: 'Log-likelihood ratio combining morphometry, Mini-RF CPR, and GRAIL Bouguer anomaly.' },
      { id: 'C2-2', name: 'Calibration-Context FP Quantification', verdict: 'PASS', detail: '6.06 [2.77, 11.51] per 10⁴ km² bound established against MTP.' },
      { id: 'C2-3', name: 'Terrestrial Analog Geomechanics Anchor', verdict: 'DEMONSTRATION', detail: 'Basalt roof beam deflection modeled using Kīlauea LiDAR analog data.' },
      { id: 'C2-4', name: 'Tier-1 Burst Readiness (AX52)', verdict: 'PARTIAL', detail: 'Hetzner AX52 script ready; pending human review to burst compute.' }
    ]
  }
];

export const BUDGET_LEDGER: BudgetRecord[] = [
  {
    tier: 'Tier-0 (Local Machine Execution)',
    allocation: 0,
    spent: 0,
    status: 'ACTIVE (24 Sessions)',
    description: 'All 24 research sessions, code compilation, and DTM testing executed with zero external cloud cost.'
  },
  {
    tier: 'Tier-1 Burst Buffer (Hetzner AX52)',
    allocation: 150,
    spent: 0,
    status: 'APPROVED / UNSPENT',
    description: 'Authorized interim buffer for 30-site random mare control sampling and ASP reproducibility validation.'
  },
  {
    tier: 'Master Plan v5 Lifetime Ceiling',
    allocation: 800,
    spent: 0,
    status: '30-MONTH CAP',
    description: 'Non-negotiable total compute ceiling across full multi-year project scope.'
  }
];
