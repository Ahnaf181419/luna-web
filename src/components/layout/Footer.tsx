import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer: React.FC = () => {
  const [copiedBib, setCopiedBib] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const resetTimer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const bibtex = `@article{lunarvoid2026,
  title={Calibrated Multi-Evidence Subsurface Inference of Lunar Lava Tubes from Orbital Morphometry and Geophysics},
  author={LUNARVOID Research Group},
  year={2026},
  institution={Autonomous Planetary Science Working Group},
  note={Gate G2 Reproducibility Milestone, 257 Candidate Catalog}
}`;

  const copyBibtex = async () => {
    setCopyFailed(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(bibtex);
      setCopiedBib(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopiedBib(false), 2000);
    } catch {
      setCopyFailed(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopyFailed(false), 2500);
    }
  };

  return (
    <footer className="border-t border-border py-10 font-mono text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-4 lg:px-8">
        {/* Top: Provenance & BibTeX */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6">
            <div className="collar-ribbon text-foreground font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span>LUNARVOID OPEN RESEARCH INITIATIVE</span>
            </div>
            <p className="font-sans text-xs leading-relaxed text-muted-foreground">
              This research portal documents the complete empirical pipeline, Bayesian
              inference mathematics, candidate registry, and milestone gate evidence for
              inferring subsurface basaltic conduits beneath the lunar mare.
            </p>
            <div className="workbench-panel space-y-1.5 p-3.5 rounded-[2px]">
              <div className="collar-ribbon text-[9px] text-warning">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>EPISTEMIC GOVERNANCE NOTICE</span>
              </div>
              <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">
                Nothing subsurface on the Moon is verifiable today except the
                radar-evidenced Tranquillitatis conduit. All candidates cataloged here
                represent calibrated log-likelihood inferences anchored in terrestrial
                basalt geomechanics, with published false positive rates per 10⁴ km².
              </p>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-6">
            <div className="flex items-center justify-between">
              <span className="collar-ribbon text-[9px]">ACADEMIC CITATION (BIBTEX)</span>
              <Button
                onClick={copyBibtex}
                variant="outline"
                size="sm"
                type="button"
                className="h-6 px-2 font-mono text-[9px] rounded-[2px]"
              >
                {copyFailed ? (
                  <X className="h-3 w-3 text-destructive" />
                ) : copiedBib ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copyFailed ? 'COPY FAILED' : copiedBib ? 'COPIED' : 'COPY BIBTEX'}</span>
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-[2px] border border-border/80 bg-card/60 p-3.5 font-mono text-[10px] leading-relaxed text-foreground/80">
              {bibtex}
            </pre>
          </div>
        </div>

        {/* Middle: Mission & data acknowledgements */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 text-[11px] sm:grid-cols-4">
          <div>
            <span className="label-mono block">Photogrammetry</span>
            <span className="mt-1 block font-semibold text-foreground">LROC NAC Stereo</span>
            <span className="text-[10px] text-muted-foreground">ASU / NASA Ames (ASP)</span>
          </div>
          <div>
            <span className="label-mono block">Radar backscatter</span>
            <span className="mt-1 block font-semibold text-foreground">Mini-RF S-Band</span>
            <span className="text-[10px] text-muted-foreground">LRO / Kaguya LRS horizons</span>
          </div>
          <div>
            <span className="label-mono block">Gravity mass deficit</span>
            <span className="mt-1 block font-semibold text-foreground">GRAIL GL1200A</span>
            <span className="text-[10px] text-muted-foreground">Degree-1200 spherical</span>
          </div>
          <div>
            <span className="label-mono block">Terrestrial analogs</span>
            <span className="mt-1 block font-semibold text-foreground">NASA LiDAR Archive</span>
            <span className="text-[10px] text-muted-foreground">Kīlauea & Modoc basalts</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-[10px] sm:flex-row">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 LUNARVOID Research Group</span>
            <span>·</span>
            <span>Zero-spend frugal science compliance ($0.00 / $800 spent)</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://quickmap.lroc.asu.edu/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <span>LROC QuickMap</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://pds-geosciences.wustl.edu/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <span>NASA PDS Geosciences</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
