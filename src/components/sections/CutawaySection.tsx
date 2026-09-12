import React from 'react';
import { Layers, Radio } from 'lucide-react';
import { StratigraphyOverlay } from '@/components/lunar/StratigraphyOverlay';

const STRATA = [
  {
    title: '1. Surface regolith blanket',
    depth: 'Depth ~5–15 m',
    tone: 'text-foreground',
    body: 'Fine impact ejecta dust and micro-breccia with high dielectric loss tangent, dampening superficial radar reflections.',
  },
  {
    title: '2. Vertical skylight pit drop',
    depth: '−105 m depth',
    tone: 'text-radar',
    body: 'Vertical collapse entrance created when molten lava evacuated the conduit, leaving an unreinforced basalt ceiling segment that subsequently breached.',
  },
  {
    title: '3. Intact subterranean conduit',
    depth: 'Span ~80 m',
    tone: 'text-primary',
    body: 'Hollow, continuous basalt conduit. Natural thermal equilibrium maintains a steady −20°C shielded from surface diurnal swings (−130°C to +120°C).',
  },
  {
    title: '4. Talus collapse mound',
    depth: 'Debris cone',
    tone: 'text-muted-foreground',
    body: 'Fallen basalt ceiling blocks forming a boulder cone on the tube floor directly beneath the skylight rim.',
  },
];

export const CutawaySection: React.FC = () => {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="max-w-3xl border-b border-border/70 pb-3">
        <span className="collar-ribbon text-[10px]">
          <span>SUBSURFACE SONAR // DUAL-HORIZON RADAR SIGNATURE</span>
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
          Evidence Fusion & Subsurface Cutaway
        </h2>
        <p className="mt-2 font-sans text-xs leading-relaxed text-muted-foreground">
          The schematic below models the physical observable: a rimless skylight opening into a
          hollow basalt conduit, and orbital radar pulses that return twice — once from the conduit
          ceiling, once from its floor. The separation between those two returns is the observable;
          the void is the inference. Under 1/6 lunar gravity, structural basalt beam stability allows
          spans of 80 to 200 meters without roof collapse.
        </p>
      </div>

      {/* 3D cutaway + stratigraphy legend */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StratigraphyOverlay />
          <div className="flex items-center justify-between px-1 pt-3 font-mono text-[10px] text-muted-foreground">
            <span>● Interactive WebGL model · drag to orbit</span>
            <span>1/6 g lunar basalt mechanics</span>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="workbench-panel space-y-3 p-5">
            <div className="collar-ribbon text-[9px] text-primary">
              <Layers className="h-3.5 w-3.5" />
              <span>GEOLOGICAL STRATA IDENTIFICATION</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {STRATA.map((s) => (
                <div key={s.title} className="border-t border-border/60 pt-3 first:border-t-0 first:pt-0">
                  <div className={`${s.tone} flex items-center justify-between font-semibold`}>
                    <span>{s.title}</span>
                    <span className="text-[10px] text-muted-foreground">{s.depth}</span>
                  </div>
                  <p className="mt-1 font-sans text-[11px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="workbench-panel space-y-2 p-4">
            <div className="collar-ribbon text-[9px] text-radar">
              <Radio className="h-3.5 w-3.5" />
              <span>RADAR SOUNDING REFLECTION SIGNATURE</span>
            </div>
            <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">
              Mini-RF and Kaguya LRS radar waves penetrate the low-loss lunar regolith. A
              dielectric impedance contrast between solid basalt and the hollow void
              generates distinctive dual-horizon return echoes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
