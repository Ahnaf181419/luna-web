import React, { useState } from 'react';
import { LunarGlobe3D } from '../3d/LunarGlobe3D';
import { SITES } from '../../data/sites';
import type { SiteDossier } from '../../types';
import { ArrowRight, Shield, Mountain, Cpu } from 'lucide-react';

interface OverviewTabProps {
  onNavigateToAtlas: (siteId?: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateToAtlas }) => {
  const [selectedSite, setSelectedSite] = useState<SiteDossier>(SITES[0]);

  return (
    <div className="space-y-10">
      
      {/* HERO BANNER & EPISTEMIC MANIFESTO */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-6 sm:p-10 lunar-grid glow-cyan overflow-hidden">
        <div className="max-w-4xl space-y-4">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/70 border border-cyan-700/60 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>THE EPISTEMIC THESIS OF LUNARVOID</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            "We do not detect lava tubes. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
              We infer them, with error bars."
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            LUNARVOID rejects binary sensationalist claims. Nothing subsurface on the Moon is verifiable today except the radar-evidenced Tranquillitatis conduit. We pioneer a multi-evidence probabilistic framework uniting sub-meter LROC NAC photogrammetry, Mini-RF CPR radar, GRAIL Bouguer gravity mass-deficit bounds, and terrestrial basaltic analogs into calibrated Bayesian likelihood ratios.
          </p>

          {/* KPI Counters Strip */}
          <div className="pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-obsidian-950/90 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase">Calibration FP Rate</span>
              <span className="text-cyan-400 font-bold text-sm sm:text-base">6.06 [2.77, 11.51]</span>
              <span className="text-slate-500 block text-[10px]">per 10⁴ km² (calibration-context)</span>
            </div>

            <div className="bg-obsidian-950/90 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase">Photogrammetry Scope</span>
              <span className="text-white font-bold text-sm sm:text-base">21 DTM Sites</span>
              <span className="text-slate-500 block text-[10px]">N = 21 / 649 (3.2% sample)</span>
            </div>

            <div className="bg-obsidian-950/90 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase">Radar Benchmark Anchor</span>
              <span className="text-emerald-400 font-bold text-sm sm:text-base">TRANQPIT1 (MTP)</span>
              <span className="text-slate-500 block text-[10px]">8.33°N, 33.22°E (Conduit verified)</span>
            </div>

            <div className="bg-obsidian-950/90 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase">Frugal Science Compute</span>
              <span className="text-emerald-400 font-bold text-sm sm:text-base">$0.00 Spent</span>
              <span className="text-slate-500 block text-[10px]">24 sessions on Tier-0 hardware</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3D LUNAR GLOBE & SITE DOSSIER SPLIT VIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-mono flex items-center gap-2">
              <span>Interactive Lunar Target Observatory</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Rotate the 3D globe to explore target coordinates or click pins to inspect site dossiers
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 hidden sm:inline">
            Active Target: {selectedSite.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: 3D Lunar Globe */}
          <div className="lg:col-span-7">
            <LunarGlobe3D
              selectedSiteId={selectedSite.id}
              onSelectSite={(site) => setSelectedSite(site)}
            />
          </div>

          {/* Right: Site Dossier Card */}
          <div className="lg:col-span-5 bg-obsidian-900 border border-slate-800/90 rounded-2xl p-6 space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">TARGET DOSSIER</span>
                  <h3 className="text-lg font-bold text-white font-mono mt-0.5">{selectedSite.name}</h3>
                </div>
                {selectedSite.primaryAnchor ? (
                  <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    BENCHMARK ANCHOR
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedSite.geologicalUnit}
                  </span>
                )}
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-obsidian-950 p-3 rounded-lg border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">LUNAR COORDINATES</span>
                  <span className="text-cyan-400 font-bold">
                    {selectedSite.lat >= 0 ? `${selectedSite.lat.toFixed(2)}°N` : `${Math.abs(selectedSite.lat).toFixed(2)}°S`},{' '}
                    {selectedSite.lon.toFixed(2)}°E
                  </span>
                </div>
                <div className="bg-obsidian-950 p-3 rounded-lg border border-slate-850">
                  <span className="text-slate-500 text-[10px] block">NAC DTM RESOLUTION</span>
                  <span className="text-white font-bold">{selectedSite.dtmResolution}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-sans bg-obsidian-950/60 p-4 rounded-xl border border-slate-850">
                {selectedSite.description}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Candidates at this target:</span>
                <span className="text-white font-bold">{selectedSite.candidateCount} features indexed</span>
              </div>

            </div>

            {/* Action button to jump to Candidate Atlas */}
            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onNavigateToAtlas(selectedSite.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-obsidian-950 font-mono font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
              >
                <span>Inspect Candidates at {selectedSite.id}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* THREE SCIENTIFIC PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        <div className="bg-obsidian-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">01. Claim Discipline</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuous calibrated likelihoods rather than sensationalist binary labels. We mandate publishing the false positive rate per 10⁴ km² and account for observational bias (LOLA track density, NAC illumination angles).
          </p>
          <div className="text-[11px] font-mono text-cyan-400">Rule: FP per 10⁴ km² reported</div>
        </div>

        <div className="bg-obsidian-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
            <Mountain className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">02. Terrestrial Analogs</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Terrestrial LiDAR and geomechanics from Hawai'i (Kīlauea) and Valentine Cave (Modoc) anchor our structural beam equations. Under 1/6 lunar gravity, stable spans expand to hundreds of meters.
          </p>
          <div className="text-[11px] font-mono text-indigo-400">NASA Analog benchmark</div>
        </div>

        <div className="bg-obsidian-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">03. Frugal Science</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Planetary science does not require endless cloud expenditure. All 24 research sessions have run on local Tier-0 compute with $0 spent against an $800 lifetime ceiling over 30 months.
          </p>
          <div className="text-[11px] font-mono text-emerald-400">Strict budget ledger</div>
        </div>

      </div>

    </div>
  );
};
