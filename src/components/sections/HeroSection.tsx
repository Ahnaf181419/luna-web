import React from 'react';
import { Compass, Box, Database, ShieldCheck, ArrowDown } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden archival-grid border-b border-space-700/60">
      {/* Ambient background glow - subtle deep indigo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Badges */}
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-950/60 border border-blue-800/80 text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>AUTONOMOUS PLANETARY SCIENCE RESEARCH • GATE G2 DRAFT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-sans">
            LUNARVOID
          </h1>

          <p className="text-xl sm:text-2xl text-zinc-300 font-sans font-medium max-w-3xl leading-snug">
            Calibrated Multi-Evidence Subsurface Inference of Lunar Lava Tubes from Orbital Morphometry & Geophysics
          </p>

          {/* Authoritative Epistemic Quotation Callout */}
          <div className="p-6 rounded-2xl bg-space-900/90 border-l-4 border-l-blue-500 border border-space-700/80 shadow-2xl backdrop-blur-sm space-y-2">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              CORE EPISTEMIC THESIS
            </div>
            <blockquote className="text-xl sm:text-2xl font-sans font-bold text-white leading-snug">
              "We do not detect lava tubes.{' '}
              <span className="text-blue-400">We infer them, with error bars."</span>
            </blockquote>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed pt-1">
              Rejecting binary detection claims in favor of continuous, calibrated Bayesian likelihood ratios anchored in terrestrial basalt analogs and bounded by GRAIL Bouguer gravity mass-deficits.
            </p>
          </div>
        </div>

        {/* 4 Empirical Proof Points */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-space-900/80 p-4 rounded-xl border border-space-700/80 space-y-1 shadow-lg">
            <span className="text-zinc-500 uppercase text-[10px] block">Calibration FP Rate</span>
            <div className="text-lg sm:text-xl font-bold text-blue-400">6.06 [2.77, 11.51]</div>
            <span className="text-zinc-500 text-[10px] block">per 10⁴ km² (calibration-context)</span>
          </div>

          <div className="bg-space-900/80 p-4 rounded-xl border border-space-700/80 space-y-1 shadow-lg">
            <span className="text-zinc-500 uppercase text-[10px] block">Photogrammetry Scope</span>
            <div className="text-lg sm:text-xl font-bold text-zinc-100">21 DTM Sites</div>
            <span className="text-zinc-500 text-[10px] block">N = 21 / 649 (3.2% sample)</span>
          </div>

          <div className="bg-space-900/80 p-4 rounded-xl border border-space-700/80 space-y-1 shadow-lg">
            <span className="text-zinc-500 uppercase text-[10px] block">Benchmark Anchor</span>
            <div className="text-lg sm:text-xl font-bold text-teal-400">TRANQPIT1 (MTP)</div>
            <span className="text-zinc-500 text-[10px] block">8.33°N, 33.22°E • Conduit Verified</span>
          </div>

          <div className="bg-space-900/80 p-4 rounded-xl border border-space-700/80 space-y-1 shadow-lg">
            <span className="text-zinc-500 uppercase text-[10px] block">Frugal Science Compute</span>
            <div className="text-lg sm:text-xl font-bold text-teal-400">$0.00 USD</div>
            <span className="text-zinc-500 text-[10px] block">24 sessions on Tier-0 hardware</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
          <a
            href="#observatory"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-950 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Explore 3D Lunar Target Observatory</span>
          </a>

          <a
            href="#cutaway"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-space-850 hover:bg-space-800 border border-space-700 text-zinc-200 hover:text-white transition shadow-sm"
          >
            <Box className="w-4 h-4 text-blue-400" />
            <span>Interactive 3D Subterranean Cutaway</span>
          </a>

          <a
            href="#atlas"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-space-850 hover:bg-space-800 border border-space-700 text-zinc-200 hover:text-white transition shadow-sm"
          >
            <Database className="w-4 h-4 text-teal-400" />
            <span>Browse 257 Candidate Atlas</span>
          </a>

          <a
            href="#gates"
            className="flex items-center space-x-2 px-4 py-3 rounded-xl text-zinc-400 hover:text-zinc-200 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Gate G2 Report & Ledger</span>
            <ArrowDown className="w-3.5 h-3.5 ml-1 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
