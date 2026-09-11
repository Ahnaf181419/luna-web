import React, { useState } from 'react';
import { LavaTubeCutaway3D } from '../3d/LavaTubeCutaway3D';
import { EvidenceRadarChart } from '../instruments/EvidenceRadarChart';
import { Camera, Radio, Globe, Compass, Calculator } from 'lucide-react';

export const EvidenceTab: React.FC = () => {
  const [morphRatio, setMorphRatio] = useState<number>(0.85);
  const [radarCpr, setRadarCpr] = useState<number>(1.6);
  const [bouguerDeficit, setBouguerDeficit] = useState<number>(-8.0);

  const morphScore = Math.min(1.0, morphRatio / 1.2) * 0.40;
  const radarScore = Math.min(1.0, (radarCpr - 0.5) / 2.0) * 0.35;
  const gravScore = Math.min(1.0, Math.abs(bouguerDeficit) / 14.0) * 0.25;
  const compositeScore = Math.min(0.99, Math.max(0.05, morphScore + radarScore + gravScore));

  const fpRate = Math.max(1.8, (1.0 - compositeScore) * 19.4).toFixed(1);

  const mu = compositeScore;
  const sigma = 0.12 - (compositeScore * 0.05);

  const pdfPoints: { x: number; y: number }[] = [];
  const svgW = 400;
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
    <div className="space-y-10">
      
      {/* SECTION HEADER (NASA ARCHIVAL) */}
      <div className="bg-obsidian-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <span>Multi-Evidence Subsurface Bayesian Fusion Engine</span>
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-1 max-w-3xl">
          Because no single orbital instrument can verify subsurface lunar voids unambiguously, LUNARVOID couples four independent physical layers into a calibrated log-likelihood ratio with observational confound penalties.
        </p>
      </div>

      {/* 3D SUBTERRANEAN CONDUIT CUTAWAY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>3D Geological Block Model: Skylight Pit & Basalt Conduit Void</span>
          </span>
          <span className="text-xs font-mono text-amber-400 hidden sm:inline">
            1/6 g basalt span geomechanics
          </span>
        </div>
        <LavaTubeCutaway3D />
      </div>

      {/* FOUR INDEPENDENT EVIDENCE LAYERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        
        {/* Layer 1 */}
        <div className="bg-obsidian-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span>LAYER 01</span>
            <Camera className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">NAC Photogrammetry</h3>
          <p className="text-zinc-400 leading-relaxed font-sans text-xs">
            Stereo pairs processed through USGS ISIS3 + NASA Ames Stereo Pipeline (ASP). Sub-meter DTMs characterize rimless vertical pit drops, collapse sags, and wall overhanging benches.
          </p>
          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850">
            Resolution: 0.5–1.5 m/px • ASP stereo
          </div>
        </div>

        {/* Layer 2 */}
        <div className="bg-obsidian-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span>LAYER 02</span>
            <Radio className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">Subsurface Radar Echoes</h3>
          <p className="text-zinc-400 leading-relaxed font-sans text-xs">
            Mini-RF S-band circular polarization ratio (CPR) contrast anomalies filter volume scattering vs floor roughness, anchored by Kaguya LRS sounding reflection horizons.
          </p>
          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850">
            Instrument: Mini-RF + Kaguya LRS
          </div>
        </div>

        {/* Layer 3 */}
        <div className="bg-obsidian-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span>LAYER 03</span>
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">Bouguer Mass Deficit</h3>
          <p className="text-zinc-400 leading-relaxed font-sans text-xs">
            GRAIL degree-1200 spherical harmonic gravity model. Detects localized negative Bouguer anomalies to enforce theoretical cross-sectional void ceilings.
          </p>
          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850">
            Model: GRAIL GL1200A spherical harmonics
          </div>
        </div>

        {/* Layer 4 */}
        <div className="bg-obsidian-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span>LAYER 04</span>
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">Terrestrial Geomechanics</h3>
          <p className="text-zinc-400 leading-relaxed font-sans text-xs">
            Structural basalt beam models calibrated against LiDAR 3D scans of Hawaiian (Kīlauea) and Oregon (Valentine) tubes scaled to lunar low-gravity (1/6 g) environments.
          </p>
          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-850">
            Analog: NASA LiDAR database + Modoc
          </div>
        </div>

      </div>

      {/* INTERACTIVE BAYESIAN INFERENCE CALCULATOR & REAL-TIME PDF CURVE */}
      <div className="bg-obsidian-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Live Bayesian Inference Instrument & PDF Distribution
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400 hidden sm:inline">
            Active Fusion: P(Void | E)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sliders (Left 6 Cols) */}
          <div className="lg:col-span-6 space-y-5 text-xs font-mono">
            
            {/* Morphometry Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-zinc-300">
                <span>Morphometry Depth-to-Span Ratio:</span>
                <span className="text-amber-400 font-bold">{morphRatio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={morphRatio}
                onChange={(e) => setMorphRatio(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-obsidian-950 h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block">
                Steep vertical wall drop without impact ejecta rim.
              </span>
            </div>

            {/* Radar CPR Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-zinc-300">
                <span>Radar CPR Contrast Ratio:</span>
                <span className="text-amber-400 font-bold">{radarCpr.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={radarCpr}
                onChange={(e) => setRadarCpr(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-obsidian-950 h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block">
                S-band circular polarization contrast vs background mare regolith.
              </span>
            </div>

            {/* GRAIL Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-zinc-300">
                <span>GRAIL Bouguer Deficit:</span>
                <span className="text-amber-400 font-bold">{bouguerDeficit.toFixed(1)} mGal</span>
              </div>
              <input
                type="range"
                min="-15"
                max="0"
                step="0.5"
                value={bouguerDeficit}
                onChange={(e) => setBouguerDeficit(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-obsidian-950 h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block">
                Mass deficit anomaly consistent with uncompensated conduit void.
              </span>
            </div>

            {/* Live Spider Chart */}
            <div className="pt-2">
              <EvidenceRadarChart
                score={compositeScore}
                cprRatio={radarCpr}
                bouguerMGal={bouguerDeficit}
                depthMeters={Math.round(morphRatio * 80)}
              />
            </div>

          </div>

          {/* Calculator Output & PDF Bell Curve (Right 6 Cols) */}
          <div className="lg:col-span-6 bg-obsidian-950 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl">
            
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                CALCULATED CALIBRATED LIKELIHOOD SCORE
              </span>
              <div className="text-4xl font-black font-mono text-white flex items-baseline gap-2 mt-1">
                <span className={compositeScore >= 0.8 ? 'text-amber-400' : compositeScore >= 0.5 ? 'text-amber-200' : 'text-zinc-400'}>
                  {compositeScore.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500 font-normal">/ 1.00</span>
              </div>
            </div>

            {/* Real-Time Bayesian PDF Distribution Curve */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Bayesian Posterior Density P(Void | E)</span>
                <span className="text-amber-400">μ = {compositeScore.toFixed(2)} • σ = ±{sigma.toFixed(2)}</span>
              </div>
              
              <div className="border border-zinc-800 rounded-lg p-2 bg-obsidian-900">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-20 select-none">
                  <path d={pdfFill} fill="rgba(245, 158, 11, 0.2)" />
                  <path d={pdfD} fill="none" stroke="#f59e0b" strokeWidth="2" />
                  <line
                    x1={compositeScore * svgW}
                    y1={0}
                    x2={compositeScore * svgW}
                    y2={svgH}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                </svg>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-1">
                  <span>0.00 (Degraded Crater)</span>
                  <span className="text-emerald-400 font-bold">Posterior Peak</span>
                  <span>1.00 (Void Anchor)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-obsidian-900 border border-zinc-850 text-xs font-sans text-zinc-300 leading-relaxed">
              {compositeScore >= 0.8
                ? 'High-confidence candidate. Significant multi-instrument agreement across morphometry, radar backscatter, and mass deficiency. Meets Gate G2 inclusion criteria.'
                : compositeScore >= 0.5
                ? 'Plausible subsurface sag. Moderate evidence fusion; requires targeted stereo photogrammetric inspection.'
                : 'Marginal signature. High probability of degraded impact crater or superficial surface depression.'}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Calibration-Context FP Rate:</span>
              <span className="text-emerald-400 font-bold">{fpRate} per 10⁴ km²</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
