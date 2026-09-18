import React from 'react';
import { ShieldCheck, ExternalLink, GitBranch } from 'lucide-react';
import { PROGRAM_RECORD } from '@/lib/lunarvoid-data';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border py-10 font-mono text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-4 lg:px-8">
        {/* Top: Provenance & governance */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6">
            <div className="collar-ribbon text-foreground font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span>LUNARVOID OPEN RESEARCH INITIATIVE</span>
            </div>
            <p className="font-sans text-xs leading-relaxed text-muted-foreground">
              This portal documents the research program of LUNARVOID: calibrated multi-evidence
              inference of subsurface basaltic conduits beneath the lunar mare. Program-level
              statistics shown here are frozen from the project repository; the interactive
              candidate atlas is a synthetic demonstration of the method.
            </p>
            <div className="workbench-panel space-y-1.5 p-3.5 rounded-[2px]">
              <div className="collar-ribbon text-[9px] text-warning">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>EPISTEMIC GOVERNANCE NOTICE</span>
              </div>
              <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">
                Nothing subsurface on the Moon is verifiable today except the radar-evidenced
                Tranquillitatis conduit. All candidates represent calibrated log-likelihood
                inferences anchored in terrestrial basalt geomechanics, with stated false positive
                rates per 10⁴ km² — every current candidate is tier C, morphometry only.
              </p>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-6">
            <div className="flex items-center justify-between">
              <span className="collar-ribbon text-[9px]">PROJECT PROVENANCE</span>
            </div>
            <a
              href={PROGRAM_RECORD.repoUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor-magnet
              className="workbench-panel group flex items-start gap-3 p-4 rounded-[2px] transition-colors hover:border-primary/50 btn-lift"
            >
              <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
                  <span>github.com/amrahman90/luna</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">
                  The complete research record: master plan v5, gate reports G0′/G1/G2, the 278-row
                  candidate registry, code and data manifests, verifier evidence, and the budget
                  ledger. Statistics frozen as of {PROGRAM_RECORD.frozenAsOf}.
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Middle: Mission & data acknowledgements */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 text-[11px] sm:grid-cols-4">
          <div>
            <span className="label-mono block">Photogrammetry</span>
            <span className="mt-1 block font-semibold text-foreground">LROC NAC Stereo</span>
            <span className="text-[10px] text-muted-foreground">ASU / NASA (PDS RDR DTMs)</span>
          </div>
          <div>
            <span className="label-mono block">Thermal screening</span>
            <span className="mt-1 block font-semibold text-foreground">LRO Diviner GHRM</span>
            <span className="text-[10px] text-muted-foreground">Powell 2023 derivative</span>
          </div>
          <div>
            <span className="label-mono block">Gravity field</span>
            <span className="mt-1 block font-semibold text-foreground">GRAIL GRGM1200A</span>
            <span className="text-[10px] text-muted-foreground">Degree-680 spherical</span>
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
            <span>
              {PROGRAM_RECORD.sessionsRun} sessions · ${PROGRAM_RECORD.spendUsd}.00 of $
              {PROGRAM_RECORD.ceilingUsd} ceiling
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={PROGRAM_RECORD.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <span>Source Repository</span>
              <ExternalLink className="h-3 w-3" />
            </a>
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
