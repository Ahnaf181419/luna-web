import React from 'react';
import { Camera, Radio, Globe, Compass } from 'lucide-react';
import { LikelihoodCalculator, type CalcSeed } from '@/components/lunar/LikelihoodCalculator';

interface TheorySectionProps {
  calcSeed?: CalcSeed;
  onCalcReset?: () => void;
  onCopyScenario?: (m: number, c: number, b: number) => void;
}

const LAYERS = [
  {
    icon: Camera,
    title: 'Surface photogrammetry',
    body: 'USGS ISIS3 plus NASA Ames Stereo Pipeline turn LROC NAC stereo pairs into 0.5–1.5 m/px DTMs. Outputs: pit depth, span, wall slope, rim absence.',
    footer: 'Ames Stereo Pipeline · 0.5–1.5 m/px',
  },
  {
    icon: Radio,
    title: 'Radar sounding',
    body: 'Mini-RF S-band circular-polarisation ratio anomalies flag blocky or void-bounded surfaces; Kaguya LRS traces candidate subsurface reflectors to tens of metres.',
    footer: 'Mini-RF S-band + Kaguya LRS',
  },
  {
    icon: Globe,
    title: 'Gravity mass deficit',
    body: 'GRAIL degree-1200 spherical harmonics (GL1200A) bound the missing mass. Resolution caps what is knowable, so void volume is always reported as an interval.',
    footer: 'GRAIL GL1200A spherical harmonics',
  },
  {
    icon: Compass,
    title: 'Terrestrial geomechanics',
    body: 'Structural basalt beam equations calibrated against LiDAR 3D scans of Hawaiian (Kīlauea) and Oregon (Valentine) tubes, scaled to lunar low-gravity (1/6 g), set the physical prior.',
    footer: 'NASA analog database + Modoc',
  },
];

export const TheorySection: React.FC<TheorySectionProps> = ({
  calcSeed,
  onCalcReset,
  onCopyScenario,
}) => {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="max-w-3xl border-b border-border/70 pb-3">
        <span className="collar-ribbon text-[10px]">
          <span>BAYESIAN FUSION // ORTHOGONAL EVIDENCE LAYERS // LOG-LIKELIHOOD RATIO</span>
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
          The Multi-Evidence Bayesian Fusion Engine
        </h2>
        <p className="mt-2 font-sans text-xs leading-relaxed text-muted-foreground">
          No individual orbital sensor can conclusively confirm a hollow subsurface void
          on the Moon. LUNARVOID unifies four orthogonal physics layers into a calibrated
          posterior log-likelihood formulation with observational confound penalties.
        </p>
      </div>

      {/* Four independent physics layers */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {LAYERS.map((layer, i) => (
          <div key={layer.title} className="workbench-panel space-y-2.5 p-4 rounded-[2px]">
            <div className="collar-ribbon text-[9px] text-primary justify-between">
              <span>LAYER 0{i + 1}</span>
              <layer.icon className="h-3.5 w-3.5" />
            </div>
            <h4 className="font-mono text-sm font-bold text-foreground">{layer.title}</h4>
            <p className="font-sans text-xs leading-relaxed text-muted-foreground">{layer.body}</p>
            <div className="border-t border-border/50 pt-2 font-mono text-[10px] text-muted-foreground">
              {layer.footer}
            </div>
          </div>
        ))}
      </div>

      {/* Live Bayesian inference instrument */}
      <LikelihoodCalculator seed={calcSeed} onReset={onCalcReset} onCopyScenario={onCopyScenario} />
    </section>
  );
};
