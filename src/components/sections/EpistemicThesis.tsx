import React from 'react';
import { Shield, Mountain, Cpu, AlertTriangle, Check, BookOpen } from 'lucide-react';

const PRINCIPLES = [
  {
    code: 'PL-01',
    title: 'Claim Discipline & Error Bars',
    icon: Shield,
    accent: 'text-primary',
    body: 'Continuous calibrated likelihoods over sensational binary labels. We mandate publishing the numerical false positive rate per 10⁴ km² and explicit confidence intervals.',
    datum: 'FP: 6.06 [2.77, 11.51] / 10⁴ km²',
  },
  {
    code: 'PL-02',
    title: 'Terrestrial Analog Anchors',
    icon: Mountain,
    accent: 'text-accent',
    body: 'Terrestrial LiDAR 3D scans from Kīlauea (Hawaiʻi) and Valentine Cave (Modoc) anchor our structural beam deflection formulas. Scaled to 1/6 lunar gravity, stable spans exceed 100 m.',
    datum: 'NASA Analog LiDAR + Modoc Basalt',
  },
  {
    code: 'PL-03',
    title: 'Frugal Science Architecture',
    icon: Cpu,
    accent: 'text-success',
    body: 'Planetary science does not require endless cloud expenditure. All 24 research sessions have executed entirely on local Tier-0 compute with $0 spent against an $800 master ceiling.',
    datum: '$0.00 drawn / $800 ceiling',
  },
];

export const EpistemicThesis: React.FC = () => {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <span className="collar-ribbon">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            <span>EPISTEMIC GOVERNANCE // METHODOLOGICAL HUMILITY</span>
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            The Epistemic Thesis of LUNARVOID
          </h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          REF: MASTER PLAN v5.0 § 2
        </span>
      </div>

      {/* Comparative Epistemic Ledger (Replaces generic red/green cards) */}
      <div className="workbench-panel grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* The Sensationalist Binary Trap */}
        <div className="p-5 sm:p-6 space-y-4 bg-destructive/[0.03]">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 text-destructive font-mono text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Sensationalist Binary Traps</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">FLAWED PARADIGM</span>
          </div>

          <blockquote className="font-mono text-xs text-foreground/90 italic border-l-2 border-destructive/60 pl-3">
            "Giant lava tube discovered beneath lunar mare surface!"
          </blockquote>

          <ul className="space-y-3 font-mono text-xs text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <span className="text-destructive font-bold text-sm leading-none mt-0.5">✕</span>
              <span>
                <strong className="text-foreground/80">Treats surface depressions as confirmed voids:</strong> Conflates collapse sags and degraded impact craters with continuous subsurface conduits without dielectric proof.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-destructive font-bold text-sm leading-none mt-0.5">✕</span>
              <span>
                <strong className="text-foreground/80">Ignores observational bias:</strong> Disregards track-density artifacts in LOLA altimetry and low-sun grazing shadow illusions that mimic pit mouths.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-destructive font-bold text-sm leading-none mt-0.5">✕</span>
              <span>
                <strong className="text-foreground/80">Omits error rates:</strong> Publishes unconditional positive claims with zero false-positive bounds or posterior uncertainty intervals.
              </span>
            </li>
          </ul>
        </div>

        {/* The Calibrated Standard */}
        <div className="p-5 sm:p-6 space-y-4 bg-primary/[0.02]">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
              <Check className="h-4 w-4" />
              <span>The LUNARVOID Calibrated Standard</span>
            </div>
            <span className="font-mono text-[10px] text-primary">SCIENTIFIC RIGOR</span>
          </div>

          <blockquote className="font-mono text-xs text-foreground/90 italic border-l-2 border-primary pl-3">
            "We infer candidate likelihoods, bounded with published error bars."
          </blockquote>

          <ul className="space-y-3 font-mono text-xs text-foreground/80">
            <li className="flex items-start gap-2.5">
              <span className="text-primary font-bold text-sm leading-none mt-0.5">✓</span>
              <span>
                <strong className="text-foreground">Honest limits of orbital sensing:</strong> Explicitly acknowledges that nothing subsurface on the Moon is verifiable today except the radar-evidenced Tranquillitatis conduit.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-primary font-bold text-sm leading-none mt-0.5">✓</span>
              <span>
                <strong className="text-foreground">Published false-positive bounds:</strong> Publishes calibration metrics: <code className="text-primary">6.06 [2.77, 11.51] / 10⁴ km²</code> bootstrapped against non-void mare controls.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-primary font-bold text-sm leading-none mt-0.5">✓</span>
              <span>
                <strong className="text-foreground">Orthogonal physics fusion:</strong> Synthesizes sub-meter stereo photogrammetry with Mini-RF radar backscatter, GRAIL Bouguer gravity mass-deficits, and terrestrial basalt mechanics.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Scientific Pillars Deck */}
      <div className="workbench-panel grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-y-0 md:divide-x">
        {PRINCIPLES.map((p) => (
          <div key={p.code} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="collar-ribbon text-[10px]">{p.code}</span>
              <p.icon className={`h-4 w-4 ${p.accent}`} />
            </div>
            <h4 className="font-mono text-sm font-bold text-foreground">{p.title}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{p.body}</p>
            <div className="pt-2 border-t border-border/50 font-mono text-[10px] text-foreground/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{p.datum}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
