import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copiedBib, setCopiedBib] = useState(false);

  const bibtex = `@article{lunarvoid2026,
  title={Calibrated Multi-Evidence Subsurface Inference of Lunar Lava Tubes from Orbital Morphometry and Geophysics},
  author={LUNARVOID Research Group},
  year={2026},
  institution={Autonomous Planetary Science Working Group},
  note={Gate G2 Reproducibility Milestone, 257 Candidate Catalog}
}`;

  const copyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopiedBib(true);
    setTimeout(() => setCopiedBib(false), 2000);
  };

  return (
    <footer className="border-t border-space-700/80 bg-space-950 py-16 text-xs font-mono text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top: Provenance & BibTeX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center space-x-2 text-zinc-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider text-sm">LUNARVOID OPEN RESEARCH INITIATIVE</span>
            </div>
            <p className="text-zinc-400 font-sans leading-relaxed text-xs">
              This research portal documents the complete empirical pipeline, Bayesian inference mathematics, candidate registry, and milestone gate evidence for inferring subsurface basaltic conduits beneath the lunar mare.
            </p>
            <div className="p-3.5 rounded-lg bg-space-900 border border-space-700/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-400 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Epistemic Governance Notice</span>
              </div>
              <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                Nothing subsurface on the Moon is verifiable today except the radar-evidenced Tranquillitatis conduit. All candidates cataloged here represent calibrated log-likelihood inferences anchored in terrestrial basalt geomechanics, with published false positive rates per 10⁴ km².
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
                Academic Citation (BibTeX)
              </span>
              <button
                onClick={copyBibtex}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-zinc-300 hover:text-white transition"
              >
                {copiedBib ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copiedBib ? 'Copied' : 'Copy BibTeX'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-space-900 border border-space-700 text-[10px] text-zinc-300 overflow-x-auto leading-relaxed">
              {bibtex}
            </pre>
          </div>
        </div>

        {/* Middle: Mission & Data Acknowledgements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-space-800 text-[11px]">
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">Photogrammetry</span>
            <span className="text-zinc-200 font-semibold block mt-1">LROC NAC Stereo</span>
            <span className="text-zinc-400 text-[10px]">ASU / NASA Ames (ASP)</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">Radar Backscatter</span>
            <span className="text-zinc-200 font-semibold block mt-1">Mini-RF S-Band</span>
            <span className="text-zinc-400 text-[10px]">LRO / Kaguya LRS Horizons</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">Gravity Mass Deficit</span>
            <span className="text-zinc-200 font-semibold block mt-1">GRAIL GL1200A</span>
            <span className="text-zinc-400 text-[10px]">Degree-1200 Spherical</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block text-[10px]">Terrestrial Analogs</span>
            <span className="text-zinc-200 font-semibold block mt-1">NASA LiDAR Archive</span>
            <span className="text-zinc-400 text-[10px]">Kīlauea & Modoc Basalts</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-space-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-400">
          <div className="flex items-center space-x-3">
            <span>© 2026 LUNARVOID Research Group</span>
            <span>•</span>
            <span>Zero-Spend Frugal Science Compliance ($0.00 / $800 spent)</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://quickmap.lroc.asu.edu/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 transition"
            >
              <span>LROC QuickMap</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://pds-geosciences.wustl.edu/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 transition"
            >
              <span>NASA PDS Geosciences</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
