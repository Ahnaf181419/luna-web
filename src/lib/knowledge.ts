/*
 * Knowledge-vault content: Maps of Content (MOCs) and concept dossiers.
 * Single source consumed by KnowledgeVaultSection and KnowledgePreviewSection.
 * Dossier summaries are grounded in the portal's published prose
 * (lunarvoid-data descriptions, section copy, gate reports).
 */

export interface ConceptDossier {
  id: string;
  title: string;
  summary: string;
  related: string[];
}

export interface Moc {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
  keyConcepts: string[];
  dossiers: Record<string, ConceptDossier>;
}

const d = (id: string, title: string, summary: string, related: string[]): ConceptDossier => ({
  id,
  title,
  summary,
  related,
});

export const MOCS: Moc[] = [
  {
    id: 'moc-gates',
    title: 'MOC Gates & Decisions',
    shortTitle: 'Gates & decisions',
    category: 'Governance & Criteria',
    summary:
      'Decision logs D1/D2, gate specifications G0′/G1/G2, and the 27-item visual inspection backlog triage protocol.',
    keyConcepts: [
      'Gate G2 Criteria',
      'Decision D1: Stereo Baseline',
      'Visual Backlog Triage',
      'AX52 Burst Scope',
    ],
    dossiers: {
      'Gate G2 Criteria': d(
        'Gate G2 Criteria',
        'Gate G2 — reproducibility milestone',
        'Gate G2 requires the full candidate registry, inference math, and gate evidence to be publicly inspectable with stated false-positive bounds. The portal itself is the G2 artifact: every score is traceable to the fusion model and every export carries provenance labels.',
        ['Calibration-Context FP', 'Decision D1: Stereo Baseline'],
      ),
      'Decision D1: Stereo Baseline': d(
        'Decision D1: Stereo Baseline',
        'Decision D1 — stereo photogrammetry as the primary morphometric baseline',
        'D1 selected LROC NAC stereo photogrammetry (ASP-derived DTMs at 0.5–1.5 m/px) as the morphometric baseline over radar-only screening. Rationale: only stereo resolves the rimless-pit geometry that separates candidate skylights from impact craters at comparable scales.',
        ['NASA Ames Stereo Pipeline', 'I14 Morphometric Funnel'],
      ),
      'Visual Backlog Triage': d(
        'Visual Backlog Triage',
        'The 27-item visual inspection backlog',
        'Candidates whose automated evidence lines disagree are parked in a 27-item visual backlog rather than promoted or discarded. Each item is re-inspected against new DTM releases; the protocol is deliberately conservative — backlog status is a claim of ignorance, not of doubt.',
        ['Gate G2 Criteria', 'Calibration-Context FP'],
      ),
      'AX52 Burst Scope': d(
        'AX52 Burst Scope',
        'AX52 radar burst scope decision',
        'The AX52 burst scope bounds which Mini-RF S-band tracks are admitted as evidence: only bursts with matched incidence geometry against the D1 stereo baseline count. This kills the largest historical false-positive source — CPR artifacts from unmatched look angles.',
        ['Mini-RF CPR Extraction', 'Gate G2 Criteria'],
      ),
    },
  },
  {
    id: 'moc-sites',
    title: 'MOC Sites & Candidates',
    shortTitle: 'Sites & candidates',
    category: 'Planetary Geology',
    summary:
      '21 LROC NAC DTM target dossiers, candidate registry coordinates, morphological feature classification, and false-positive clustering.',
    keyConcepts: [
      'TRANQPIT1 Anchor',
      'Marius Hills Rille System',
      'Mare Ingenii Swirl',
      'Philolaus Polar Pit',
    ],
    dossiers: {
      'TRANQPIT1 Anchor': d(
        'TRANQPIT1 Anchor',
        'Mare Tranquillitatis Pit — the ground-truth anchor',
        'The sole radar-evidenced lava tube conduit on the Moon today: a vertical collapse skylight at 8.33°N, 33.22°E with a subsurface lateral opening evidenced by Mini-RF and radar sounding echoes. Every scoring threshold in the registry is recalibrated against this anchor.',
        ['Gate G2 Criteria', 'Calibration-Context FP'],
      ),
      'Marius Hills Rille System': d(
        'Marius Hills Rille System',
        'Marius Hills — the densest rille field',
        'A 42-candidate target region where a sinuous rille disappears beneath a series of rimless pits — the classic "tube with skylights" signature. It contributes the widest span estimates in the working set and stresses the morphometry axis of the fusion model.',
        ['TRANQPIT1 Anchor', 'I14 Morphometric Funnel'],
      ),
      'Mare Ingenii Swirl': d(
        'Mare Ingenii Swirl',
        'Mare Ingenii — swirl-adjacent depressions',
        "Ingenii hosts the largest candidate count (38) but also the registry's most aggressive false-positive clustering: many swirl-adjacent depressions mimic pit geometry while lacking any radar or gravity corroboration. It is the primary calibration control for the FP bound.",
        ['Calibration-Context FP', 'Visual Backlog Triage'],
      ),
      'Philolaus Polar Pit': d(
        'Philolaus Polar Pit',
        'Philolaus — polar lighting geometry',
        'Near-polar targets like Philolaus suffer extreme grazing illumination that manufactures shadow-cued "pit mouths". Candidates here carry wide error bars and a DTM-gap flag unless stereo coverage resolves the floor — illumination bias is treated as a first-class uncertainty.',
        ['LOLA Track Density Bias', 'Mare Ingenii Swirl'],
      ),
    },
  },
  {
    id: 'moc-concepts',
    title: 'MOC Concepts & Methods',
    shortTitle: 'Concepts & methods',
    category: 'Epistemology & Theory',
    summary:
      'Epistemic calibration context, Bayesian evidence combination, beam deflection structural mechanics, and observational bias mitigation.',
    keyConcepts: [
      'Calibration-Context FP',
      'I14 Morphometric Funnel',
      'LOLA Track Density Bias',
      'Basalt Tensile Limits',
    ],
    dossiers: {
      'Calibration-Context FP': d(
        'Calibration-Context FP',
        'Calibration-context false-positive bounds',
        "The registry publishes a calibrated false-positive rate per 10⁴ km² (6.06 [2.77, 11.51], bootstrapped against non-void mare controls) and a score-dependent floor of 1.8. Claims are stated no stronger than these bounds allow — the portal's core epistemic commitment.",
        ['Gate G2 Criteria', 'Mare Ingenii Swirl'],
      ),
      'I14 Morphometric Funnel': d(
        'I14 Morphometric Funnel',
        'The I14 morphometric funnel',
        'I14 is the staged filter that takes raw DTM terrain through rim-absence tests, depth-to-span ratios, and wall-slope gates before any candidate reaches the fusion scorer. Each stage has a measured pass rate, so the funnel itself is auditable.',
        ['Decision D1: Stereo Baseline', 'Marius Hills Rille System'],
      ),
      'LOLA Track Density Bias': d(
        'LOLA Track Density Bias',
        'LOLA track-density artifacts',
        'Sparse LOLA track coverage at high latitudes produces stair-step artifacts that mimic pit floors in gridded products. The pipeline flags any candidate whose depth estimate depends on fewer than three independent tracks — those never reach the published set.',
        ['Philolaus Polar Pit', 'Calibration-Context FP'],
      ),
      'Basalt Tensile Limits': d(
        'Basalt Tensile Limits',
        'Terrestrial basalt beam mechanics, scaled to 1/6 g',
        'Structural beam deflection formulas calibrated against LiDAR scans of Kīlauea and Valentine Cave basalts set the physical prior on stable spans. Scaled to lunar gravity, intact roof widths beyond ~100 m remain physically plausible — which is why span alone never promotes a candidate.',
        ['I14 Morphometric Funnel', 'Marius Hills Rille System'],
      ),
    },
  },
  {
    id: 'moc-data',
    title: 'MOC Data & Code',
    shortTitle: 'Data & code',
    category: 'Pipeline & Artifacts',
    summary:
      'Dataset manifests, USGS ISIS3 stereo ingestion, ASP DTM point-cloud generation scripts, and reproducible smoke tests.',
    keyConcepts: [
      'ISIS3 Ingestion',
      'NASA Ames Stereo Pipeline',
      'SLDEM2015 Normalization',
      'Mini-RF CPR Extraction',
    ],
    dossiers: {
      'ISIS3 Ingestion': d(
        'ISIS3 Ingestion',
        'USGS ISIS3 ingestion stage',
        'ISIS3 handles radiometric calibration and map projection of LROC NAC stereo pairs before anything else touches the data. Identical processing parameters across all 21 targets are what make cross-site morphometric comparisons legitimate.',
        ['NASA Ames Stereo Pipeline', 'SLDEM2015 Normalization'],
      ),
      'NASA Ames Stereo Pipeline': d(
        'NASA Ames Stereo Pipeline',
        'ASP point-cloud generation',
        'The Ames Stereo Pipeline turns the ISIS3-prepared pairs into 0.5–1.5 m/px DTMs from which pit depth, span, wall slope, and rim absence are measured. ASP defaults are deliberately left untuned per-site to avoid introducing operator bias.',
        ['ISIS3 Ingestion', 'I14 Morphometric Funnel'],
      ),
      'SLDEM2015 Normalization': d(
        'SLDEM2015 Normalization',
        'SLDEM2015 normalization layer',
        'Where NAC stereo coverage thins out, SLDEM2015 provides a coarser but globally consistent elevation baseline. It is used only for normalization and sanity bounds — never for the fine morphometry that drives scoring.',
        ['LOLA Track Density Bias', 'NASA Ames Stereo Pipeline'],
      ),
      'Mini-RF CPR Extraction': d(
        'Mini-RF CPR Extraction',
        'Mini-RF circular-polarisation ratio extraction',
        'CPR contrast against background mare regolith is extracted per burst and admitted only within the AX52 matched-geometry scope. CPR values feed the radar axis of the fusion model at 0.35 weight.',
        ['AX52 Burst Scope', 'Calibration-Context FP'],
      ),
    },
  },
  {
    id: 'moc-sessions',
    title: 'MOC Sessions & Ops',
    shortTitle: 'Sessions & ops',
    category: 'Research History',
    summary:
      'Complete record of all 24 research sessions from repository initialization through Gate G2 review, paired with the budget ledger.',
    keyConcepts: [
      '24 Session Logs',
      'Zero-Spend Compliance',
      'Tier-0 Workstation Setup',
      'Master Plan v5 Synthesis',
    ],
    dossiers: {
      '24 Session Logs': d(
        '24 Session Logs',
        'The 24-session research record',
        'Every research session from repository initialization through Gate G2 review is logged with its objectives, artifacts, and spend. The gates tab renders this journey as a verifiable timeline rather than a retrospective narrative.',
        ['Zero-Spend Compliance', 'Master Plan v5 Synthesis'],
      ),
      'Zero-Spend Compliance': d(
        'Zero-Spend Compliance',
        'The $800 ceiling and $0.00 spent',
        'All 24 sessions executed on local Tier-0 compute against an $800 master ceiling with $0.00 drawn — "frugal science" as a verifiable constraint, not a slogan. The compute ledger in the gates tab is the audit artifact.',
        ['Tier-0 Workstation Setup', '24 Session Logs'],
      ),
      'Tier-0 Workstation Setup': d(
        'Tier-0 Workstation Setup',
        'Tier-0 local workstation profile',
        'The pipeline is sized to run on a single local workstation: no cloud services, no external compute, no paid data sources. Every tool in the chain (ISIS3, ASP, the scoring scripts) is reproducible from public inputs on equivalent hardware.',
        ['Zero-Spend Compliance', 'NASA Ames Stereo Pipeline'],
      ),
      'Master Plan v5 Synthesis': d(
        'Master Plan v5 Synthesis',
        'Master Plan v5.0 — the source synthesis',
        "The master plan (v5.0 full synthesis) is the source-of-truth document from which the portal's epistemic thesis, gate structure, and calibration commitments derive. The portal cites it wherever a displayed constant has a rationale.",
        ['Gate G2 Criteria', '24 Session Logs'],
      ),
    },
  },
];

export const DOSSIER_COUNT = MOCS.reduce((n, moc) => n + Object.keys(moc.dossiers).length, 0);

export function dossierFor(mocId: string, concept: string): ConceptDossier | undefined {
  return MOCS.find((m) => m.id === mocId)?.dossiers[concept];
}
