import React, { useState } from 'react';
import { LunarGlobe3D } from '../3d/LunarGlobe3D';
import { SITES } from '../../data/sites';
import type { SiteDossier } from '../../types';
import { ArrowRight, Crosshair, MapPin } from 'lucide-react';

interface ObservatorySectionProps {
  onFilterAtlasBySite: (siteId: string) => void;
}

export const ObservatorySection: React.FC<ObservatorySectionProps> = ({ onFilterAtlasBySite }) => {
  const [selectedSite, setSelectedSite] = useState<SiteDossier>(SITES[0]);
  const [hoveredSite, setHoveredSite] = useState<SiteDossier | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleSelectSite = (site: SiteDossier) => {
    setSelectedSite(site);
  };

  return (
    <section id="observatory" className="py-24 border-b border-space-700/60 bg-space-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="text-blue-400 font-mono text-xs uppercase tracking-wider font-semibold">
            04 • INTERACTIVE 3D LUNAR TARGET OBSERVATORY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Global Lunar Target Directory
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            Rotate the 3D globe to explore target coordinates across the lunar near and far sides. Click any coordinate pin to inspect its high-resolution LROC NAC DTM dossier.
          </p>
        </div>

        {/* Site Quick Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500 uppercase text-[10px] mr-1">Select Target:</span>
          {SITES.map((site) => {
            const isSelected = selectedSite.id === site.id;
            return (
              <button
                key={site.id}
                onClick={() => setSelectedSite(site)}
                className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-blue-950/80 text-blue-300 border-blue-600 shadow-md shadow-blue-950'
                    : 'bg-space-900 text-zinc-400 border-space-700 hover:text-white hover:border-zinc-600'
                }`}
              >
                {site.primaryAnchor && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                )}
                <span className="font-semibold">{site.id}</span>
                <span className="text-[10px] text-zinc-500 hidden sm:inline">({site.candidateCount})</span>
              </button>
            );
          })}
        </div>

        {/* Split Screen 3D Globe + Target Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 3D Lunar Globe Canvas (7 cols) */}
          <div className="lg:col-span-7 relative bg-space-950 rounded-2xl border border-space-700/80 overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between">
            {/* 3D Canvas */}
            <div className="absolute inset-0">
              <LunarGlobe3D
                selectedSiteId={selectedSite.id}
                onSelectSite={handleSelectSite}
                onHoverSite={setHoveredSite}
                onCursorCoords={setCursorCoords}
              />
            </div>

            {/* Top HUD Overlay */}
            <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
              <div className="bg-space-950/90 backdrop-blur-md border border-space-700 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-zinc-100 font-bold">LUNAR SURFACE PROJECTION</span>
                <span className="text-zinc-500 text-[10px]">| Mean Radius: 1,737.4 km</span>
              </div>

              {hoveredSite && (
                <div className="bg-space-950/95 backdrop-blur-md border border-blue-500/80 px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl">
                  <span className="text-blue-400 font-bold">{hoveredSite.name}</span>
                  <span className="text-zinc-400 text-[10px] ml-2">
                    {hoveredSite.lat >= 0 ? `${hoveredSite.lat.toFixed(1)}°N` : `${Math.abs(hoveredSite.lat).toFixed(1)}°S`},{' '}
                    {hoveredSite.lon.toFixed(1)}°E
                  </span>
                </div>
              )}
            </div>

            {/* Bottom HUD Coordinates Overlay */}
            <div className="relative z-10 p-4 pointer-events-none flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <div className="bg-space-950/90 backdrop-blur-md border border-space-700 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                {cursorCoords ? (
                  <span>
                    LAT: {cursorCoords.lat >= 0 ? `${cursorCoords.lat.toFixed(2)}°N` : `${Math.abs(cursorCoords.lat).toFixed(2)}°S`} • LON: {cursorCoords.lon.toFixed(2)}°E
                  </span>
                ) : (
                  <span className="text-zinc-500">Drag to rotate • Scroll to zoom</span>
                )}
              </div>

              <div className="bg-space-950/90 backdrop-blur-md border border-space-700 px-2.5 py-1.5 rounded-lg text-zinc-400 text-[10px] hidden sm:block">
                <span>Active Anchor: {selectedSite.id}</span>
              </div>
            </div>
          </div>

          {/* Target Dossier Inspector Card (5 cols) */}
          <div className="lg:col-span-5 bg-space-900 rounded-2xl border border-space-700/80 p-6 sm:p-8 flex flex-col justify-between shadow-2xl space-y-6">
            <div className="space-y-5">
              
              <div className="flex items-start justify-between border-b border-space-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">
                    TARGET DOSSIER
                  </span>
                  <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                    {selectedSite.name}
                  </h3>
                  <span className="text-xs font-mono text-blue-400">{selectedSite.id}</span>
                </div>
                {selectedSite.primaryAnchor ? (
                  <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-teal-950/80 text-teal-300 border border-teal-800">
                    BENCHMARK ANCHOR
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-space-850 text-zinc-300 border border-space-700">
                    {selectedSite.geologicalUnit}
                  </span>
                )}
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-space-950 p-3.5 rounded-xl border border-space-800">
                  <span className="text-zinc-500 text-[10px] block">LUNAR COORDINATES</span>
                  <span className="text-zinc-100 font-bold">
                    {selectedSite.lat >= 0 ? `${selectedSite.lat.toFixed(2)}°N` : `${Math.abs(selectedSite.lat).toFixed(2)}°S`},{' '}
                    {selectedSite.lon.toFixed(2)}°E
                  </span>
                </div>
                <div className="bg-space-950 p-3.5 rounded-xl border border-space-800">
                  <span className="text-zinc-500 text-[10px] block">NAC DTM RESOLUTION</span>
                  <span className="text-blue-400 font-bold">{selectedSite.dtmResolution}</span>
                </div>
              </div>

              {/* Geological Context */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  MORPHOLOGICAL CONTEXT & SCIENTIFIC VALUE
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-space-950/70 p-4 rounded-xl border border-space-800">
                  {selectedSite.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                <span>Features Cataloged at Target:</span>
                <span className="text-white font-bold">{selectedSite.candidateCount} candidates</span>
              </div>

            </div>

            {/* Jump to Atlas Button */}
            <div className="pt-4 border-t border-space-800">
              <button
                onClick={() => onFilterAtlasBySite(selectedSite.id)}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-950"
              >
                <MapPin className="w-4 h-4" />
                <span>Filter Candidate Atlas by {selectedSite.id}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
