import React, { useState, useMemo } from 'react';
import { 
  X, 
  Compass, 
  Database, 
  Activity, 
  ShieldCheck, 
  Network, 
  ChevronRight, 
  Copy, 
  Check, 
  AlertTriangle, 
  Box
} from 'lucide-react';
import { SITES } from '../../data/sites';
import { CANDIDATES } from '../../data/candidates';
import { GATES, BUDGET_LEDGER } from '../../data/gates';
import type { PanelMode } from '../../App';
import { ElevationProfileChart } from '../instruments/ElevationProfileChart';
import { EvidenceRadarChart } from '../instruments/EvidenceRadarChart';
import { LavaTubeCutaway3D } from '../3d/LavaTubeCutaway3D';

export interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: PanelMode;
  selectedSiteId: string | null;
  selectedCandidateId: string | null;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onClose,
  activePanel,
  selectedSiteId,
  selectedCandidateId,
}) => {
  // Local state for copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Evidence interactive calculator state
  const [morphRatio, setMorphRatio] = useState<number>(0.85);
  const [radarCpr, setRadarCpr] = useState<number>(1.6);
  const [bouguerDeficit, setBouguerDeficit] = useState<number>(-8.0);
  const [showCutaway, setShowCutaway] = useState<boolean>(false);

  // Gates expanded state
  const [expandedGate, setExpandedGate] = useState<string>('G2');

  // Knowledge active MOC state
  const [selectedMocIdx, setSelectedMocIdx] = useState<number>(0);

  // Current selected site (fallback to TRANQPIT1 if none)
  const currentSite = useMemo(() => {
    if (selectedSiteId) {
      const found = SITES.find((s) => s.id === selectedSiteId);
      if (found) return found;
    }
    return SITES[0];
  }, [selectedSiteId]);

  // Current selected candidate (fallback to first if none)
  const currentCandidate = useMemo(() => {
    if (selectedCandidateId) {
      const found = CANDIDATES.find((c) => c.id === selectedCandidateId);
      if (found) return found;
    }
    return CANDIDATES[0];
  }, [selectedCandidateId]);

  // Candidates for current site
  const siteCandidates = useMemo(() => {
    return CANDIDATES.filter((c) => c.siteId === currentSite.id);
  }, [currentSite]);

  // Evidence Bayesian Calculations
  const morphScore = Math.min(1.0, morphRatio / 1.2) * 0.4;
  const radarScore = Math.min(1.0, (radarCpr - 0.5) / 2.0) * 0.35;
  const gravScore = Math.min(1.0, Math.abs(bouguerDeficit) / 14.0) * 0.25;
  const compositeScore = Math.min(0.99, Math.max(0.05, morphScore + radarScore + gravScore));
  const fpRate = Math.max(1.8, (1.0 - compositeScore) * 19.4).toFixed(1);

  const mu = compositeScore;
  const sigma = 0.12 - compositeScore * 0.05;
  const svgW = 340;
  const svgH = 80;
  const pdfPoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const val = i / 60;
    const gaussian =
      (1 / (sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((val - mu) / sigma, 2));
    const sx = (i / 60) * svgW;
    const sy = svgH - (gaussian / 4.0) * (svgH * 0.85);
    pdfPoints.push({ x: sx, y: sy });
  }
  const pdfD = pdfPoints.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );
  const pdfFill = `${pdfD} L ${svgW} ${svgH} L 0 ${svgH} Z`;

  const handleCopyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPanelTitle = () => {
    switch (activePanel) {
      case 'site':
        return { label: 'TARGET DOSSIER', icon: Compass };
      case 'candidate':
        return { label: 'CANDIDATE INSPECTION', icon: Database };
      case 'evidence':
        return { label: 'BAYESIAN EVIDENCE FUSION', icon: Activity };
      case 'gates':
        return { label: 'VERIFIABLE RESEARCH GATES', icon: ShieldCheck };
      case 'knowledge':
        return { label: 'KNOWLEDGE GRAPH VAULT', icon: Network };
      default:
        return { label: 'INSPECTOR', icon: Compass };
    }
  };

  const { label: panelLabel, icon: HeaderIcon } = getPanelTitle();

  const MOCS = [
    {
      title: 'MOC Gates & Decisions',
      category: 'Governance & Criteria',
      count: 14,
      desc: 'Decision logs D1/D2, gate specifications G0′/G1/G2, and the 27-item visual inspection backlog triage protocol.',
      nodes: ['Gate G2 Criteria', 'Decision D1: Stereo Baseline', 'Visual Backlog Triage', 'AX52 Burst Scope'],
    },
    {
      title: 'MOC Sites & Candidates',
      category: 'Planetary Geology',
      count: 28,
      desc: '21 LROC NAC DTM target dossiers, candidate registry coordinates, morphological feature classification, and false-positive clustering.',
      nodes: ['TRANQPIT1 Anchor', 'Marius Hills Rille System', 'Mare Ingenii Swirl', 'Philolaus Polar Pit'],
    },
    {
      title: 'MOC Concepts & Methods',
      category: 'Epistemology & Theory',
      count: 22,
      desc: 'Epistemic calibration context, Bayesian evidence combination, beam deflection structural mechanics, and observational bias mitigation.',
      nodes: ['Calibration-Context FP', 'I14 Morphometric Funnel', 'LOLA Track Density Bias', 'Basalt Tensile Limits'],
    },
    {
      title: 'MOC Data & Code',
      category: 'Pipeline & Artifacts',
      count: 19,
      desc: 'Dataset manifests, USGS ISIS3 stereo ingestion, ASP DTM point-cloud generation scripts, and reproducible smoke tests.',
      nodes: ['ISIS3 Ingestion', 'NASA Ames Stereo Pipeline', 'SLDEM2015 Normalization', 'Mini-RF CPR Extraction'],
    },
    {
      title: 'MOC Sessions & Ops',
      category: 'Research History',
      count: 24,
      desc: 'Complete record of all 24 research sessions from repository initialization through Gate G2 review, paired with the budget ledger.',
      nodes: ['24 Session Logs', 'Zero-Spend Compliance', 'Tier-0 Workstation Setup', 'Master Plan v5 Synthesis'],
    },
  ];

  return (
    <aside
      className={`fixed top-11 bottom-7 right-0 z-20 w-[420px] max-w-[92vw] bg-panel-bg border-l border-panel-border flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-label="Inspection and Analysis Panel"
    >
      {/* Top Header */}
      <div className="h-10 px-3.5 border-b border-panel-border flex items-center justify-between shrink-0 bg-void-black/40">
        <div className="flex items-center space-x-2">
          <HeaderIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-mono font-bold text-zinc-200 tracking-wider">
            {panelLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-panel-surface transition"
          title="Close Panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto panel-scroll p-4 space-y-5 text-xs font-mono">
        
        {/* ======================================================== */}
        {/* MODE 1: SITE DOSSIER */}
        {/* ======================================================== */}
        {activePanel === 'site' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-panel-border pb-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                  DTM TARGET ID: {currentSite.id}
                </span>
                <h2 className="text-base font-bold text-zinc-100 font-sans mt-0.5">
                  {currentSite.name}
                </h2>
              </div>
              {currentSite.primaryAnchor ? (
                <span className="px-2 py-0.5 text-[10px] rounded bg-teal-950/60 text-teal-300 border border-teal-800/80">
                  BENCHMARK ANCHOR
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] rounded bg-panel-surface text-zinc-400 border border-panel-border">
                  {currentSite.geologicalUnit}
                </span>
              )}
            </div>

            {/* Coordinates & DTM Spec Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-panel-surface p-2.5 rounded border border-panel-border">
                <span className="text-zinc-500 text-[10px] block">COORDINATES</span>
                <span className="text-zinc-100 font-semibold">
                  {currentSite.lat >= 0 ? `${currentSite.lat.toFixed(2)}°N` : `${Math.abs(currentSite.lat).toFixed(2)}°S`},{' '}
                  {currentSite.lon.toFixed(2)}°E
                </span>
              </div>
              <div className="bg-panel-surface p-2.5 rounded border border-panel-border">
                <span className="text-zinc-500 text-[10px] block">NAC DTM RESOLUTION</span>
                <span className="text-blue-400 font-semibold">{currentSite.dtmResolution}</span>
              </div>
            </div>

            {/* Geological Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                GEOLOGICAL CONTEXT & MORPHOMETRY
              </span>
              <p className="text-zinc-300 font-sans leading-relaxed text-xs bg-panel-surface/60 p-3 rounded border border-panel-border">
                {currentSite.description}
              </p>
            </div>

            {/* Features list at this site */}
            <div className="space-y-2 pt-2 border-t border-panel-border">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-bold uppercase">
                  CANDIDATES AT THIS SITE ({siteCandidates.length})
                </span>
                <span className="text-zinc-500 text-[10px]">
                  {currentSite.candidateCount} indexed
                </span>
              </div>

              {siteCandidates.length === 0 ? (
                <div className="p-3 bg-panel-surface/40 rounded text-zinc-500 text-center">
                  Detailed sub-meter candidates cataloged in WP0 scope.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {siteCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-2.5 rounded bg-panel-surface border border-panel-border flex items-center justify-between hover:border-blue-500/50 cursor-pointer transition"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-zinc-100">{cand.id}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-void-black text-zinc-400 border border-panel-border">
                            Score: {cand.score.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{cand.morphology}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: CANDIDATE INSPECTION */}
        {/* ======================================================== */}
        {activePanel === 'candidate' && (
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-panel-border pb-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                  CANDIDATE ID: {currentCandidate.id}
                </span>
                <h2 className="text-base font-bold text-zinc-100 font-sans mt-0.5">
                  {currentCandidate.morphology}
                </h2>
                <div className="text-[11px] text-zinc-400 mt-0.5">{currentCandidate.siteName}</div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() =>
                    handleCopyCitation(
                      `LUNARVOID Candidate ${currentCandidate.id}: ${currentCandidate.lat.toFixed(2)}°N, ${currentCandidate.lon.toFixed(2)}°E, Score: ${currentCandidate.score.toFixed(2)}`,
                      currentCandidate.id
                    )
                  }
                  className="p-1 rounded bg-panel-surface border border-panel-border text-zinc-400 hover:text-zinc-100 transition"
                  title="Copy Citation"
                >
                  {copiedId === currentCandidate.id ? (
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <span
                  className={`px-2 py-0.5 text-[10px] rounded border ${
                    currentCandidate.status === 'CONFIRMED ANCHOR'
                      ? 'bg-teal-950/60 text-teal-400 border-teal-800'
                      : currentCandidate.status === 'HIGH CONFIDENCE'
                      ? 'bg-blue-950/60 text-blue-400 border-blue-800'
                      : 'bg-orange-950/60 text-orange-400 border-orange-800'
                  }`}
                >
                  {currentCandidate.status}
                </span>
              </div>
            </div>

            {/* Coordinates & Geometry */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-panel-surface p-2.5 rounded border border-panel-border">
                <span className="text-zinc-500 text-[10px] block">COORDINATES</span>
                <span className="text-zinc-100 font-semibold">
                  {currentCandidate.lat.toFixed(2)}°N, {currentCandidate.lon.toFixed(2)}°E
                </span>
              </div>
              <div className="bg-panel-surface p-2.5 rounded border border-panel-border">
                <span className="text-zinc-500 text-[10px] block">DTM PRODUCT</span>
                <span className="text-blue-400 font-semibold truncate block">
                  {currentCandidate.dtmProduct}
                </span>
              </div>
            </div>

            {/* Scientific Instrument 1: Elevation Profile Cross-Section */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                TRANSECT 01: DTM ELEVATION CROSS-SECTION
              </span>
              <div className="bg-panel-surface p-2 rounded border border-panel-border">
                <ElevationProfileChart
                  depthMeters={currentCandidate.depthMeters}
                  spanMeters={currentCandidate.spanMeters}
                  candidateId={currentCandidate.id}
                  resolution={currentCandidate.resolution}
                />
              </div>
            </div>

            {/* Scientific Instrument 2: Evidence Radar Chart */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                TRANSECT 02: MULTI-AXIS EVIDENCE FUSION
              </span>
              <div className="bg-panel-surface p-2 rounded border border-panel-border">
                <EvidenceRadarChart
                  score={currentCandidate.score}
                  cprRatio={currentCandidate.cprRatio}
                  bouguerMGal={currentCandidate.bouguerMGal}
                  depthMeters={currentCandidate.depthMeters}
                />
              </div>
            </div>

            {/* Analyst Morphological Notes */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                ANALYST INTERPRETATION & NOTES
              </span>
              <p className="text-zinc-300 font-sans leading-relaxed text-xs bg-panel-surface/60 p-3 rounded border border-panel-border">
                {currentCandidate.notes}
              </p>
            </div>

            {currentCandidate.isBacklog && (
              <div className="flex items-center gap-2 p-2.5 rounded bg-orange-950/30 border border-orange-800/40 text-orange-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400" />
                <span>Visual Backlog (27 items) — requires stereo illumination verification.</span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: BAYESIAN EVIDENCE FUSION */}
        {/* ======================================================== */}
        {activePanel === 'evidence' && (
          <div className="space-y-5">
            <div className="border-b border-panel-border pb-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                BAYESIAN INFERENCE ENGINE
              </span>
              <h2 className="text-base font-bold text-zinc-100 font-sans mt-0.5">
                Subsurface Likelihood Formulation
              </h2>
              <p className="text-zinc-400 font-sans text-xs mt-1 leading-relaxed">
                Combines photogrammetric rim drops, Mini-RF CPR radar contrast, and GRAIL Bouguer deficits into a single calibrated posterior.
              </p>
            </div>

            {/* Sliders Console */}
            <div className="space-y-3.5 bg-panel-surface p-3.5 rounded border border-panel-border">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Morphometry (Depth/Span):</span>
                  <span className="text-blue-400 font-bold">{morphRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={morphRatio}
                  onChange={(e) => setMorphRatio(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-void-black h-1 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Mini-RF CPR Contrast Ratio:</span>
                  <span className="text-blue-400 font-bold">{radarCpr.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={radarCpr}
                  onChange={(e) => setRadarCpr(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-void-black h-1 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">GRAIL Bouguer Deficit:</span>
                  <span className="text-blue-400 font-bold">{bouguerDeficit.toFixed(1)} mGal</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="0"
                  step="0.5"
                  value={bouguerDeficit}
                  onChange={(e) => setBouguerDeficit(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-void-black h-1 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Score & Posterior Curve */}
            <div className="bg-void-black p-3.5 rounded border border-panel-border space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 block">POSTERIOR LIKELIHOOD</span>
                  <span className="text-2xl font-bold text-zinc-100">{compositeScore.toFixed(2)}</span>
                  <span className="text-zinc-500 text-xs"> / 1.00</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">FP RATE</span>
                  <span className="text-teal-400 font-bold text-sm">{fpRate}</span>
                  <span className="text-zinc-500 text-[10px]"> / 10⁴ km²</span>
                </div>
              </div>

              {/* Real-Time PDF SVG */}
              <div className="border border-panel-border/80 rounded p-1.5 bg-panel-bg">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-16 select-none">
                  <path d={pdfFill} fill="rgba(59, 130, 246, 0.15)" />
                  <path d={pdfD} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                  <line
                    x1={compositeScore * svgW}
                    y1={0}
                    x2={compositeScore * svgW}
                    y2={svgH}
                    stroke="#14b8a6"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>
                <div className="flex justify-between text-[8px] text-zinc-500 mt-1">
                  <span>0.00 (Degraded Crater)</span>
                  <span className="text-teal-400 font-semibold">Peak μ = {compositeScore.toFixed(2)}</span>
                  <span>1.00 (Anchor Void)</span>
                </div>
              </div>
            </div>

            {/* 3D Geological Cutaway Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  3D GEOLOGICAL CUTAWAY BLOCK
                </span>
                <button
                  onClick={() => setShowCutaway(!showCutaway)}
                  className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-panel-surface border border-panel-border text-blue-400 hover:text-blue-300 transition"
                >
                  <Box className="w-3 h-3" />
                  <span>{showCutaway ? 'Hide Cutaway' : 'Render 3D Cutaway'}</span>
                </button>
              </div>

              {showCutaway && (
                <div className="border border-panel-border rounded overflow-hidden">
                  <LavaTubeCutaway3D />
                </div>
              )}
            </div>

            {/* 4 Independent Physical Layers */}
            <div className="space-y-2 pt-2 border-t border-panel-border">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                INDEPENDENT PHYSICAL LAYERS
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-panel-surface rounded border border-panel-border">
                  <div className="text-blue-400 font-semibold text-[11px]">01. LROC NAC Photogrammetry</div>
                  <div className="text-zinc-400 font-sans text-[11px] mt-0.5">
                    Sub-meter DTMs characterize rimless vertical pit drops and structural collapse sags.
                  </div>
                </div>
                <div className="p-2 bg-panel-surface rounded border border-panel-border">
                  <div className="text-blue-400 font-semibold text-[11px]">02. Mini-RF S-Band Radar Echoes</div>
                  <div className="text-zinc-400 font-sans text-[11px] mt-0.5">
                    Circular polarization ratio (CPR) anomalies filter volume scattering vs floor roughness.
                  </div>
                </div>
                <div className="p-2 bg-panel-surface rounded border border-panel-border">
                  <div className="text-blue-400 font-semibold text-[11px]">03. GRAIL Bouguer Mass Deficit</div>
                  <div className="text-zinc-400 font-sans text-[11px] mt-0.5">
                    Degree-1200 spherical harmonics enforce theoretical cross-sectional void limits.
                  </div>
                </div>
                <div className="p-2 bg-panel-surface rounded border border-panel-border">
                  <div className="text-blue-400 font-semibold text-[11px]">04. Terrestrial Geomechanics</div>
                  <div className="text-zinc-400 font-sans text-[11px] mt-0.5">
                    Hawaiian and Valentine basalt tube LiDAR scans scaled to lunar 1/6 g environment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 4: GATES & BUDGET */}
        {/* ======================================================== */}
        {activePanel === 'gates' && (
          <div className="space-y-5">
            <div className="border-b border-panel-border pb-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                REPRODUCIBILITY & GOVERNANCE
              </span>
              <h2 className="text-base font-bold text-zinc-100 font-sans mt-0.5">
                Research Milestone Gates
              </h2>
              <p className="text-zinc-400 font-sans text-xs mt-1 leading-relaxed">
                Verification criteria must be satisfied numerically before work moves across boundaries.
              </p>
            </div>

            {/* Gates Accordion */}
            <div className="space-y-2">
              {GATES.map((gate) => {
                const isExpanded = expandedGate === gate.id;
                const isPassed = gate.status === 'PASSED';

                return (
                  <div
                    key={gate.id}
                    className="border border-panel-border rounded bg-panel-surface overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedGate(isExpanded ? '' : gate.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-panel-border/40 transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                            isPassed
                              ? 'bg-teal-950/80 text-teal-400 border border-teal-800'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {gate.id}
                        </div>
                        <div>
                          <div className="text-zinc-200 font-semibold text-xs">{gate.title}</div>
                          <div className="text-zinc-500 text-[10px]">
                            Spend: ${gate.spend}.00 • {gate.sessionCompleted ? `Session ${gate.sessionCompleted}` : 'Active'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          isPassed
                            ? 'bg-teal-950/60 text-teal-400 border-teal-800'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800'
                        }`}
                      >
                        {gate.status}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-panel-border/60 space-y-3 bg-void-black/40">
                        <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                          {gate.summary}
                        </p>
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                            CRITERIA CHECKLIST
                          </span>
                          {gate.criteria.map((c) => (
                            <div
                              key={c.id}
                              className="p-2 rounded bg-panel-surface border border-panel-border/80 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-zinc-200 text-[11px]">{c.name}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                    c.verdict === 'PASS'
                                      ? 'bg-teal-950 text-teal-400 border-teal-800'
                                      : 'bg-amber-950 text-amber-400 border-amber-800'
                                  }`}
                                >
                                  {c.verdict}
                                </span>
                              </div>
                              <p className="text-zinc-400 font-sans text-[11px] mt-0.5 leading-relaxed">
                                {c.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Frugal Compute Ledger */}
            <div className="space-y-2 pt-2 border-t border-panel-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  FRUGAL SCIENCE BUDGET LEDGER
                </span>
                <span className="text-teal-400 font-bold text-xs">$0.00 / $800</span>
              </div>

              <div className="space-y-1.5">
                {BUDGET_LEDGER.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-panel-surface border border-panel-border text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200 text-[11px]">{b.tier}</span>
                      <span className="text-teal-400 font-mono text-[10px]">
                        ${b.spent}.00 / ${b.allocation}.00
                      </span>
                    </div>
                    <p className="text-zinc-400 font-sans text-[11px] mt-0.5">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 5: KNOWLEDGE GRAPH */}
        {/* ======================================================== */}
        {activePanel === 'knowledge' && (
          <div className="space-y-5">
            <div className="border-b border-panel-border pb-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                OBSIDIAN RESEARCH REPOSITORY
              </span>
              <h2 className="text-base font-bold text-zinc-100 font-sans mt-0.5">
                Maps of Content (MOCs)
              </h2>
              <p className="text-zinc-400 font-sans text-xs mt-1 leading-relaxed">
                Bi-directional knowledge graph linking planetary geology, calibration epistemology, and scripts.
              </p>
            </div>

            {/* MOC Selector */}
            <div className="space-y-2">
              {MOCS.map((moc, idx) => {
                const isSelected = selectedMocIdx === idx;
                return (
                  <div
                    key={moc.title}
                    onClick={() => setSelectedMocIdx(idx)}
                    className={`p-2.5 rounded border transition cursor-pointer ${
                      isSelected
                        ? 'bg-panel-surface border-blue-500/80 text-zinc-100'
                        : 'bg-panel-surface/60 border-panel-border text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200 text-xs">{moc.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-void-black text-zinc-400 border border-panel-border">
                        {moc.count} notes
                      </span>
                    </div>
                    <div className="text-[10px] text-blue-400/90 mt-0.5">{moc.category}</div>
                    <p className="text-zinc-400 font-sans text-[11px] mt-1 leading-relaxed">
                      {moc.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Active MOC Nodes */}
            <div className="space-y-2 pt-2 border-t border-panel-border">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                CORE GRAPH NODES IN {MOCS[selectedMocIdx].title}
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {MOCS[selectedMocIdx].nodes.map((node, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-panel-surface border border-panel-border flex items-center justify-between text-zinc-300 font-mono text-[11px]"
                  >
                    <span>[[{node}]]</span>
                    <span className="text-blue-400 text-[10px]">linked</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Panel Bottom Help Strip */}
      <div className="h-7 px-3 border-t border-panel-border bg-void-black/50 flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
        <span>LUNARVOID INFERENCE SUITE</span>
        <span>Esc to close</span>
      </div>
    </aside>
  );
};
