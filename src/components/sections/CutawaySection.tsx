import React from 'react';
import { Layers, Radio } from 'lucide-react';
import { LavaTubeCutaway3D } from '../3d/LavaTubeCutaway3D';

export const CutawaySection: React.FC = () => {
  return (
    <section id="cutaway" className="py-24 border-b border-space-700/60 bg-space-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="text-blue-400 font-mono text-xs uppercase tracking-wider font-semibold">
            03 • GEOMECHANICAL STRATIGRAPHY & 3D MODELLING
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            3D Geological Conduit Model
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            Interactive block cutaway of a lunar skylight pit breaching an intact subsurface basalt lava tube. Under 1/6 lunar gravity, structural basalt beam stability allows spans of 80 to 200 meters without roof collapse.
          </p>
        </div>

        {/* 3D Cutaway Canvas + Stratigraphy Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 3D Cutaway Viewport (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-space-700/80 overflow-hidden shadow-2xl bg-space-900">
              <LavaTubeCutaway3D />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-3 px-1">
              <span>● Interactive WebGL 3D Model • Drag to rotate block</span>
              <span>1/6 g Lunar Basalt Mechanics</span>
            </div>
          </div>

          {/* Stratigraphic Breakdown & Geomechanics (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-space-900 p-5 rounded-2xl border border-space-700/80 space-y-3 shadow-lg">
              <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold">
                <Layers className="w-4 h-4" />
                <span>GEOLOGICAL STRATA IDENTIFICATION</span>
              </div>

              <div className="space-y-3 font-mono text-xs divide-y divide-space-800">
                <div className="pt-2">
                  <div className="text-zinc-200 font-semibold flex items-center justify-between">
                    <span>1. Surface Regolith Blanket</span>
                    <span className="text-zinc-500 text-[10px]">Depth ~5–15 m</span>
                  </div>
                  <p className="text-zinc-400 font-sans text-[11px] mt-1 leading-relaxed">
                    Fine impact ejecta dust and micro-breccia with high dielectric loss tangent, dampening superficial radar reflections.
                  </p>
                </div>

                <div className="pt-3">
                  <div className="text-teal-400 font-semibold flex items-center justify-between">
                    <span>2. Vertical Skylight Pit Drop</span>
                    <span className="text-zinc-500 text-[10px]">-105 m depth</span>
                  </div>
                  <p className="text-zinc-400 font-sans text-[11px] mt-1 leading-relaxed">
                    Vertical collapse entrance created when molten lava evacuated the conduit, leaving an unreinforced basalt ceiling segment that subsequently breached.
                  </p>
                </div>

                <div className="pt-3">
                  <div className="text-blue-400 font-semibold flex items-center justify-between">
                    <span>3. Intact Subterranean Conduit</span>
                    <span className="text-zinc-500 text-[10px]">Span ~80 m</span>
                  </div>
                  <p className="text-zinc-400 font-sans text-[11px] mt-1 leading-relaxed">
                    Hollow, continuous basalt conduit. Natural thermal equilibrium maintains a steady -20°C shielded from surface diurnal swings (-130°C to +120°C).
                  </p>
                </div>

                <div className="pt-3">
                  <div className="text-zinc-300 font-semibold flex items-center justify-between">
                    <span>4. Talus Collapse Mound</span>
                    <span className="text-zinc-500 text-[10px]">Debris Cone</span>
                  </div>
                  <p className="text-zinc-400 font-sans text-[11px] mt-1 leading-relaxed">
                    Fallen basalt ceiling blocks forming a boulder cone on the tube floor directly beneath the skylight rim.
                  </p>
                </div>
              </div>
            </div>

            {/* Radar Sounding Callout */}
            <div className="p-4 rounded-xl bg-space-900 border border-space-700 text-xs font-sans text-zinc-300 space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-mono text-[11px] font-bold">
                <Radio className="w-3.5 h-3.5" />
                <span>RADAR SOUNDING REFLECTION SIGNATURE</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Mini-RF and Kaguya LRS radar waves penetrate the low-loss lunar regolith. A dielectric impedance contrast between solid basalt and the hollow void generates distinctive dual-horizon return echoes.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
