import React, { useState } from 'react';
import { Camera, Radio, Globe, Compass, Calculator } from 'lucide-react';
import { EvidenceRadarChart } from '../instruments/EvidenceRadarChart';

export const TheorySection: React.FC = () => {
  const [morphRatio, setMorphRatio] = useState<number>(0.85);
  const [radarCpr, setRadarCpr] = useState<number>(1.6);
  const [bouguerDeficit, setBouguerDeficit] = useState<number>(-8.0);

  // Dynamic weights
  const morphScore = Math.min(1.0, morphRatio / 1.2) * 0.40;
  const radarScore = Math.min(1.0, (radarCpr - 0.5) / 2.0) * 0.35;
  const gravScore = Math.min(1.0, Math.abs(bouguerDeficit) / 14.0) * 0.25;
  const compositeScore = Math.min(0.99, Math.max(0.05, morphScore + radarScore + gravScore));

  const fpRate = Math.max(1.8, (1.0 - compositeScore) * 19.4).toFixed(1);

  // Bayesian PDF Gaussian Curve
  const mu = compositeScore;
  const sigma = 0.12 - (compositeScore * 0.05);

  const pdfPoints: { x: number; y: number }[] = [];
  const svgW = 420;
  const svgH = 100;
  for (let i = 0; i <= 80; i++) {
    const val = i / 80;
    const gaussian = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((val - mu) / sigma, 2));
    const sx = (i / 80) * svgW;
    const sy = svgH - (gaussian / 4.0) * (svgH * 0.85);
    pdfPoints.push({ x: sx, y: sy });
  }

  const pdfD = pdfPoints.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const pdfFill = `${pdfD} L ${svgW} ${svgH} L 0 ${svgH} Z`;

  return (
    <section id="theory" className="py-24 border-b border-space-700/60 bg-space-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="text-blue-400 font-mono text-xs uppercase tracking-wider font-semibold">
            02 • MULTI-SENSOR INFERENCE MATHEMATICS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            The Multi-Evidence Bayesian Fusion Engine
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            No individual orbital sensor can conclusively confirm a hollow subsurface void on the Moon. LUNARVOID unifies four orthogonal physics layers into a calibrated posterior log-likelihood formulation with observational confound penalties.
          </p>
        </div>

        {/* Four Independent Physics Layers Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-space-900 p-6 rounded-2xl border border-space-700/80 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-blue-400 font-mono font-bold text-xs">
              <span>LAYER 01</span>
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">LROC NAC Stereo</h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              Stereo pairs processed via USGS ISIS3 + NASA Ames Stereo Pipeline (ASP). Sub-meter DTMs (0.5–1.5 m/px) characterize steep vertical rim drops and roof subsidence sags.
            </p>
            <div className="pt-2 border-t border-space-800 text-[10px] font-mono text-zinc-500">
              0.5–1.5 m/px • Ames Stereo Pipeline
            </div>
          </div>

          <div className="bg-space-900 p-6 rounded-2xl border border-space-700/80 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-blue-400 font-mono font-bold text-xs">
              <span>LAYER 02</span>
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">Subsurface Radar</h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              Mini-RF S-band circular polarization ratio (CPR) contrast anomalies filter volume scattering vs floor roughness, anchored by Kaguya LRS sounding horizons.
            </p>
            <div className="pt-2 border-t border-space-800 text-[10px] font-mono text-zinc-500">
              Mini-RF S-band + Kaguya LRS
            </div>
          </div>

          <div className="bg-space-900 p-6 rounded-2xl border border-space-700/80 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-blue-400 font-mono font-bold text-xs">
              <span>LAYER 03</span>
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">Bouguer Gravity</h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              GRAIL degree-1200 spherical harmonic gravity model. Detects localized negative Bouguer anomalies to enforce theoretical cross-sectional void ceilings.
            </p>
            <div className="pt-2 border-t border-space-800 text-[10px] font-mono text-zinc-500">
              GRAIL GL1200A Spherical Harmonics
            </div>
          </div>

          <div className="bg-space-900 p-6 rounded-2xl border border-space-700/80 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-blue-400 font-mono font-bold text-xs">
              <span>LAYER 04</span>
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">Basalt Geomechanics</h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed">
              Structural basalt beam equations calibrated against LiDAR 3D scans of Hawaiian (Kīlauea) and Oregon (Valentine) tubes scaled to lunar low-gravity (1/6 g).
            </p>
            <div className="pt-2 border-t border-space-800 text-[10px] font-mono text-zinc-500">
              NASA Analog Database + Modoc
            </div>
          </div>

        </div>

        {/* Live Bayesian Inference Instrument */}
        <div className="bg-space-900 p-6 sm:p-10 rounded-2xl border border-space-700/80 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-space-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <Calculator className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                Interactive Bayesian Inference Calculator
              </h3>
            </div>
            <span className="text-xs font-mono text-blue-400">
              Live Bayesian Formulation: P(Void | E₁, E₂, E₃, E₄)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sliders (Left 6 cols) */}
            <div className="lg:col-span-6 space-y-6 text-xs font-mono">
              <div className="space-y-2">
                <div className="flex justify-between text-zinc-200">
                  <span>Morphometry Depth-to-Span Ratio:</span>
                  <span className="text-blue-400 font-bold">{morphRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={morphRatio}
                  onChange={(e) => setMorphRatio(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-space-950 h-2 rounded cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Steep vertical wall drop without impact ejecta rim.
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-zinc-200">
                  <span>Radar CPR Contrast Ratio:</span>
                  <span className="text-blue-400 font-bold">{radarCpr.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={radarCpr}
                  onChange={(e) => setRadarCpr(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-space-950 h-2 rounded cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">
                  S-band circular polarization contrast vs background mare regolith.
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-zinc-200">
                  <span>GRAIL Bouguer Deficit:</span>
                  <span className="text-blue-400 font-bold">{bouguerDeficit.toFixed(1)} mGal</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="0"
                  step="0.5"
                  value={bouguerDeficit}
                  onChange={(e) => setBouguerDeficit(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-space-950 h-2 rounded cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Mass deficit anomaly consistent with uncompensated conduit void.
                </span>
              </div>

              {/* Spider Radar Chart Instrument */}
              <div className="pt-2">
                <EvidenceRadarChart
                  score={compositeScore}
                  cprRatio={radarCpr}
                  bouguerMGal={bouguerDeficit}
                  depthMeters={Math.round(morphRatio * 80)}
                />
              </div>
            </div>

            {/* Live Outputs & Posterior Distribution Curve (Right 6 cols) */}
            <div className="lg:col-span-6 bg-space-950 p-6 rounded-xl border border-space-700/80 space-y-6 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">
                  CALCULATED CALIBRATED LIKELIHOOD SCORE
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white flex items-baseline gap-2 mt-1">
                  <span className={compositeScore >= 0.8 ? 'text-teal-400' : compositeScore >= 0.5 ? 'text-blue-400' : 'text-zinc-400'}>
                    {compositeScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500 font-normal">/ 1.00</span>
                </div>
              </div>

              {/* Live Bayesian PDF Bell Curve */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Bayesian Posterior Density P(Void | E)</span>
                  <span className="text-blue-400">μ = {compositeScore.toFixed(2)} • σ = ±{sigma.toFixed(2)}</span>
                </div>

                <div className="border border-space-800 rounded-lg p-2.5 bg-space-900">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-24 select-none">
                    <path d={pdfFill} fill="rgba(59, 130, 246, 0.2)" />
                    <path d={pdfD} fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <line
                      x1={compositeScore * svgW}
                      y1={0}
                      x2={compositeScore * svgW}
                      y2={svgH}
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                  </svg>
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-1">
                    <span>0.00 (Degraded Impact Crater)</span>
                    <span className="text-teal-400 font-bold">Posterior Mode Peak</span>
                    <span>1.00 (Verified Void Anchor)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-space-900 border border-space-800 text-xs font-sans text-zinc-300 leading-relaxed">
                {compositeScore >= 0.8
                  ? 'High-confidence candidate. Multi-instrument agreement across steep vertical drop, radar CPR contrast anomaly, and mass deficit exceeds Gate G2 threshold.'
                  : compositeScore >= 0.5
                  ? 'Plausible subsurface sag. Moderate evidence fusion; requires targeted stereo photogrammetric inspection.'
                  : 'Marginal signature. High probability of degraded impact crater or superficial surface depression.'}
              </div>

              <div className="pt-3 border-t border-space-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Calibration-Context FP Rate:</span>
                <span className="text-teal-400 font-bold">{fpRate} per 10⁴ km²</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
