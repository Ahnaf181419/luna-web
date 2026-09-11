import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-obsidian-950/90 py-8 text-xs font-mono text-zinc-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="space-y-1 text-center md:text-left">
          <p className="text-zinc-300 font-semibold">
            LUNARVOID — Calibrated Multi-Evidence Inference of Lunar Lava Tubes
          </p>
          <p className="text-[11px] text-zinc-500">
            Source of Truth: <span className="text-zinc-400">LUNARVOID_Master_Plan_v5</span> • Active Gate: <span className="text-amber-400">G2 Draft</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400">
          <span>LROC NAC Stereo DTM</span>
          <span>•</span>
          <span>Mini-RF S-band CPR</span>
          <span>•</span>
          <span>GRAIL Bouguer Gravity</span>
          <span>•</span>
          <span>Terrestrial Analogs</span>
        </div>

        <div className="text-[10px] text-zinc-500 text-center md:text-right">
          <div>Claim Discipline: FP reported per 10⁴ km²</div>
          <div className="text-emerald-500 font-semibold">Tier-0 Frugal Science Compliance</div>
        </div>

      </div>
    </footer>
  );
};
