import React, { useState } from 'react';
import { LavaTubeCutaway3D } from '../3d/LavaTubeCutaway3D';
import { Camera, Radio, Globe, Compass, Calculator } from 'lucide-react';

export const EvidenceTab: React.FC = () => {
  // Calculator state
  const [morphRatio, setMorphRatio] = useState<number>(0.85);
  const [radarCpr, setRadarCpr] = useState<number>(1.6);
  const [bouguerDeficit, setBouguerDeficit] = useState<number>(-8.0);

  // Real-time calculated inference
  const morphScore = Math.min(1.0, morphRatio / 1.2) * 0.40;
  const radarScore = Math.min(1.0, (radarCpr - 0.5) / 2.0) * 0.35;
  const gravScore = Math.min(1.0, Math.abs(bouguerDeficit) / 14.0) * 0.25;
  const compositeScore = Math.min(0.99, Math.max(0.05, morphScore + radarScore + gravScore));

  // False positive envelope calculation
  const fpRate = Math.max(1.8, ((1.0 - compositeScore) * 19.4)).toFixed(1);

  return (
    <div className="space-y-10">
      
      {/* SECTION HEADER */}
      <div className="bg-obsidian-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <span>Multi-Evidence Subsurface Bayesian Fusion</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1 max-w-3xl">
          Because no single orbital instrument can verify subsurface voids unambiguously, LUNARVOID couples four independent physical layers into a calibrated log-likelihood ratio with observational confound penalties.
        </p>
      </div>

      {/* 3D SUBTERRANEAN CONDUIT CUTAWAY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white font-mono">
            3D Geological Block Model: Skylight Pit & Basalt Conduit Void
          </span>
          <span className="text-xs font-mono text-indigo-400">
            Simulated 1/6 g basalt span
          </span>
        </div>
        <LavaTubeCutaway3D />
      </div>

      {/* FOUR INDEPENDENT EVIDENCE LAYERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        
        {/* Layer 1 */}
        <div className="bg-obsidian-900 border border-cyan-800/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-cyan-400 font-bold">
            <span>LAYER 01</span>
            <Camera className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">NAC Photogrammetry</h3>
          <p className="text-slate-400 leading-relaxed font-sans text-xs">
            USGS ISIS3 + NASA Ames Stereo Pipeline (ASP) stereo pair ingestion. Sub-meter DTMs characterize rimless vertical pit drops, collapse sags, and wall overhanging benches.
          </p>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Resolution: 0.5–1.5 m/px • ASP stereo
          </div>
        </div>

        {/* Layer 2 */}
        <div className="bg-obsidian-900 border border-indigo-800/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-indigo-400 font-bold">
            <span>LAYER 02</span>
            <Radio className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">Subsurface Radar Echoes</h3>
          <p className="text-slate-400 leading-relaxed font-sans text-xs">
            Mini-RF S-band circular polarization ratio (CPR) contrast anomalies filter volume scattering vs floor roughness, anchored by Kaguya LRS sounding reflection horizons.
          </p>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Instrument: Mini-RF + Kaguya LRS
          </div>
        </div>

        {/* Layer 3 */}
        <div className="bg-obsidian-900 border border-purple-800/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-purple-400 font-bold">
            <span>LAYER 03</span>
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">Bouguer Mass Deficit</h3>
          <p className="text-slate-400 leading-relaxed font-sans text-xs">
            GRAIL degree-1200 spherical harmonic gravity model. Detects localized negative Bouguer anomalies to enforce theoretical cross-sectional void ceilings.
          </p>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Model: GRAIL GL1200A spherical harmonics
          </div>
        </div>

        {/* Layer 4 */}
        <div className="bg-obsidian-900 border border-emerald-800/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span>LAYER 04</span>
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-sans">Terrestrial Geomechanics</h3>
          <p className="text-slate-400 leading-relaxed font-sans text-xs">
            Structural basalt beam models calibrated against LiDAR 3D scans of Hawaiian (Kīlauea) and Oregon (Valentine) tubes scaled to lunar low-gravity (1/6 g) environments.
          </p>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Analog: NASA LiDAR database + Modoc
          </div>
        </div>

      </div>

      {/* INTERACTIVE BAYESIAN INFERENCE CALCULATOR */}
      <div className="bg-obsidian-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono">
            Interactive Multi-Evidence Fusion Calculator
          </h3>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Adjust observational instrument inputs to observe how evidence accumulation dynamically shapes the calibrated likelihood score and false-positive risk envelope.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sliders (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-5 text-xs font-mono">
            
            {/* Morphometry Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Morphometry Depth-to-Span Ratio:</span>
                <span className="text-cyan-400 font-bold">{morphRatio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={morphRatio}
                onChange={(e) => setMorphRatio(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-obsidian-950 h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Higher ratios indicate steep rimless collapse walls typical of skylights.
              </span>
            </div>

            {/* Radar CPR Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Radar CPR Contrast Ratio:</span>
                <span className="text-indigo-400 font-bold">{radarCpr.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={radarCpr}
                onChange={(e) => setRadarCpr(parseFloat(e.target.value))}
                className="w-full accent-indigo-400 bg-obsidian-950 h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Elevated circular polarized ratio relative to background regolith backscatter.
              </span>
            </div>

            {/* GRAIL Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>GRAIL Bouguer Deficit:</span>
                <span className="text-purple-400 font-bold">{bouguerDeficit.toFixed(1)} mGal</span>
              </div>
              <input
                type="range"
                min="-15"
                max="0"
                step="0.5"
                value={bouguerDeficit}
                onChange={(e) => setBouguerDeficit(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-obsidian-950 h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Negative Bouguer anomaly consistent with subsurface uncompensated mass deficiency.
              </span>
            </div>

          </div>

          {/* Calculator Output Card (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-obsidian-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                CALCULATED LIKELIHOOD SCORE
              </span>
              <div className="text-4xl font-black font-mono text-white flex items-baseline gap-2 mt-1">
                <span className={compositeScore >= 0.8 ? 'text-cyan-400' : compositeScore >= 0.5 ? 'text-indigo-400' : 'text-slate-400'}>
                  {compositeScore.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-normal">/ 1.00</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-obsidian-900 border border-slate-850 text-xs font-sans text-slate-300 leading-relaxed">
              {compositeScore >= 0.8
                ? 'High-confidence candidate. Significant multi-instrument agreement across morphometry, radar backscatter, and mass deficiency.'
                : compositeScore >= 0.5
                ? 'Plausible subsurface sag. Moderate evidence fusion; requires targeted stereo photogrammetric inspection.'
                : 'Marginal signature. High probability of degraded impact crater or superficial surface depression.'}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Calibration FP Bound:</span>
              <span className="text-emerald-400 font-bold">{fpRate} per 10⁴ km²</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
