import React from 'react';
import { Radar, Layers, Waypoints, CircleDollarSign, Terminal } from 'lucide-react';

const TELEMETRY_METRICS = [
  {
    icon: Radar,
    code: 'MET-01',
    label: 'Calibration FP Bound',
    value: '3.74',
    unit: '/ 10⁴ km²',
    interval: '[1.71, 7.10] 95% CI',
    sub: 'Row-based calibration-context rate; unique-feature 2.08 [0.67, 4.85]',
  },
  {
    icon: Layers,
    code: 'MET-02',
    label: 'DTM Working Scope',
    value: '21 / 649',
    unit: 'NAC DTMs',
    interval: '24,063 km² searched',
    sub: 'Catalogued-pit selection bias — not a random survey',
  },
  {
    icon: Waypoints,
    code: 'MET-03',
    label: 'Benchmark Anchor',
    value: 'MTP',
    unit: '8.33°N 33.22°E',
    interval: 'Radar-evidenced',
    sub: 'Mare Tranquillitatis Pit · Calibration-freeze datum',
  },
  {
    icon: CircleDollarSign,
    code: 'MET-04',
    label: 'Compute Ledger',
    value: '$0.00',
    unit: '/ $800 ceiling',
    interval: 'Tier-0 local',
    sub: '58 research sessions executed with zero cloud spend',
  },
];

export const HeroSection: React.FC = () => {
  return (
    <section className="relative space-y-8 overflow-x-clip">
      <div className="hero-drift" aria-hidden="true" />

      {/* Precision Collar Ribbon */}
      <div
        data-boot="fade"
        style={{ '--boot-i': 0 } as React.CSSProperties}
        className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3"
      >
        <div className="collar-ribbon">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground font-semibold">LUNARVOID</span>
          <span className="text-border">/</span>
          <span>AUTONOMOUS PLANETARY SCIENCE WORKBENCH</span>
          <span className="text-border">/</span>
          <span className="text-primary">G0′ / G1 / G2 FINAL-PASS</span>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>EP-01 // NO VOID IMAGED DIRECTLY</span>
        </div>
      </div>

      {/* Hero Manifesto */}
      <div className="max-w-4xl space-y-4">
        <h2 className="hero-headline text-3xl leading-[1.12] text-foreground sm:text-5xl lg:text-6xl">
          <span data-boot="rise" style={{ '--boot-i': 1 } as React.CSSProperties} className="block">
            We do not detect lava tubes.
          </span>
          <span
            data-boot="rise"
            style={{ '--boot-i': 2 } as React.CSSProperties}
            className="serif-thesis block text-primary"
          >
            We infer them, with error bars.
          </span>
        </h2>
        <p
          data-boot="fade"
          style={{ '--boot-i': 3 } as React.CSSProperties}
          className="font-sans text-sm sm:text-base leading-relaxed text-muted-foreground max-w-3xl"
        >
          Photogrammetry reconstructs only the illuminated outer envelope; a lunar point cloud
          contains zero direct information about a void 20–100 m beneath the regolith. LUNARVOID
          infers void candidates from orbital morphometry — sub-metre NAC stereo sag detection over
          measured per-DTM noise floors — with gravity and Diviner thermal as independent evidence
          legs, anchored in terrestrial basalt geomechanics under 1/6 g. Every candidate carries an
          interval, and no claim is stated more strongly than the calibration supports.
        </p>
      </div>

      {/* Unified Telemetry Deck (Console Strip) */}
      <div
        data-boot="fade"
        style={{ '--boot-i': 3 } as React.CSSProperties}
        className="workbench-panel grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4"
      >
        {TELEMETRY_METRICS.map((m, i) => (
          <div
            key={m.code}
            data-boot="power"
            style={{ '--boot-i': 4 + i } as React.CSSProperties}
            className="p-4 sm:p-5 space-y-2 relative group hover:bg-surface/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <m.icon className="h-3.5 w-3.5 text-primary" />
                <span className="collar-ribbon text-[10px]">{m.label}</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{m.code}</span>
            </div>

            <div className="pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="numeric-readout text-2xl font-bold text-foreground sm:text-3xl">
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
