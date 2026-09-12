import React from 'react';
import { Radar, Layers, Waypoints, CircleDollarSign } from 'lucide-react';

const METRICS = [
  {
    icon: Radar,
    label: 'Calibration FP rate',
    value: '6.06',
    sub: '[2.77, 11.51] per 10⁴ km², bootstrapped over the anchor-verified control set.',
  },
  {
    icon: Layers,
    label: 'Sample space',
    value: '21 DTM sites',
    sub: 'N = 21 / 649 mapped pit-bearing regions (3.2% of the target population).',
  },
  {
    icon: Waypoints,
    label: 'Anchor benchmark',
    value: 'MTP',
    sub: 'Mare Tranquillitatis Pit — ground truth for every recalibration pass.',
  },
  {
    icon: CircleDollarSign,
    label: 'Compute spend',
    value: '$0.00',
    sub: 'Across 24 sessions. Tier-0 free compute only; burst cloud not yet triggered.',
  },
];

export const HeroSection: React.FC = () => {
  return (
    <section className="space-y-10">
      {/* Hero Manifesto */}
      <div className="max-w-3xl">
        <p className="label-mono">Manifesto</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-5xl">
          We do not detect lava tubes.{' '}
          <span className="text-primary">We infer them, with error bars.</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          No orbital instrument images a void directly. What we have are three weak,
          independent signals — surface morphometry from stereo DTMs, circular-polarisation
          anomalies from Mini-RF, and mass deficits in the GRAIL Bouguer field. LUNARVOID
          fuses them in an explicit Bayesian likelihood whose prior, calibration set and
          false-positive rate are all published. Every candidate carries an interval,
          every gate is re-runnable against the Mare Tranquillitatis anchor, and no claim
          is stated more strongly than the calibration supports.
        </p>
      </div>

      {/* Key metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="panel p-4">
            <div className="flex items-center gap-2">
              <m.icon className="h-4 w-4 text-primary" />
              <span className="label-mono">{m.label}</span>
            </div>
            <p className="mt-2 font-mono text-2xl text-foreground">{m.value}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
