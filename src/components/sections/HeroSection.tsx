import React from 'react';
import { Radar, Layers, Waypoints, CircleDollarSign, Terminal } from 'lucide-react';

const TELEMETRY_METRICS = [
  {
    icon: Radar,
    code: 'MET-01',
    label: 'Calibration FP Bound',
    value: '6.06',
    unit: '/ 10⁴ km²',
    interval: '[2.77, 11.51] 95% CI',
    sub: 'Bootstrapped control calibration against non-void mare',
  },
  {
    icon: Layers,
    code: 'MET-02',
    label: 'Target Sample Scope',
    value: '21 / 649',
    unit: 'DTM sites',
    interval: '3.2% sample',
    sub: 'High-resolution NAC stereo coverage of pit populations',
  },
  {
    icon: Waypoints,
    code: 'MET-03',
    label: 'Benchmark Anchor',
    value: 'MTP',
    unit: '8.33°N 33.22°E',
    interval: 'Conduit verified',
    sub: 'Mare Tranquillitatis Pit · Ground-truth recalibration datum',
  },
  {
    icon: CircleDollarSign,
    code: 'MET-04',
    label: 'Compute Ledger',
    value: '$0.00',
    unit: '/ $800 ceiling',
    interval: 'Tier-0 local',
    sub: '24 research sessions executed with zero cloud waste',
  },
];

export const HeroSection: React.FC = () => {
  return (
    <section className="space-y-8">
      {/* Precision Collar Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
        <div className="collar-ribbon">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground font-semibold">LUNARVOID</span>
          <span className="text-border">/</span>
          <span>AUTONOMOUS PLANETARY SCIENCE WORKBENCH</span>
          <span className="text-border">/</span>
          <span className="text-primary">GATE G2 REVIEW</span>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>EP-01 // NO VOID IMAGED DIRECTLY</span>
        </div>
      </div>

      {/* Hero Manifesto */}
      <div className="max-w-4xl space-y-4">
        <h2 className="font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          We do not detect lava tubes.{' '}
          <span className="serif-thesis block font-normal text-primary">
            We infer them, with error bars.
          </span>
        </h2>
        <p className="font-sans text-sm sm:text-base leading-relaxed text-muted-foreground max-w-3xl">
          Photogrammetry reconstructs only the illuminated outer envelope; a lunar point cloud contains
          zero direct information about a void 20–100 m beneath the regolith. LUNARVOID fuses three
          orthogonal physical observables — sub-meter stereo photogrammetry, Mini-RF circular-polarisation
          ratio (CPR) backscatter, and GRAIL Bouguer gravity deficits — anchored in terrestrial basalt
          geomechanics under 1/6 g. Every candidate carries an interval, and no claim is stated more
          strongly than the calibration supports.
        </p>
      </div>

      {/* Unified Telemetry Deck (Console Strip) */}
      <div className="workbench-panel grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
        {TELEMETRY_METRICS.map((m) => (
          <div key={m.code} className="p-4 sm:p-5 space-y-2 relative group hover:bg-surface/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <m.icon className="h-3.5 w-3.5 text-primary" />
                <span className="collar-ribbon text-[10px]">{m.label}</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{m.code}</span>
            </div>

            <div className="pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {m.value}
                </span>
                <span className="font-mono text-xs text-primary">{m.unit}</span>
              </div>
              <div className="font-mono text-[10px] text-accent mt-0.5">{m.interval}</div>
            </div>

            <p className="text-[11px] leading-snug text-muted-foreground pt-1 border-t border-border/50">
              {m.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
