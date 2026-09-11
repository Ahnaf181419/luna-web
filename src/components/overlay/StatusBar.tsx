import React from 'react';
import { Crosshair, Shield, Database } from 'lucide-react';

export interface StatusBarProps {
  selectedSiteName: string | null;
  cursorCoords: { lat: number; lon: number } | null;
  candidateCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  selectedSiteName,
  cursorCoords,
  candidateCount,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-7 bg-void-black/95 backdrop-blur-sm border-t border-panel-border z-30 flex items-center justify-between px-3 text-[10px] font-mono text-zinc-400 select-none">
      {/* Left: Cursor & Coordinates */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex items-center space-x-1.5 text-zinc-300 shrink-0">
          <Crosshair className="w-3 h-3 text-blue-400" />
          {cursorCoords ? (
            <span>
              {cursorCoords.lat >= 0 ? `${cursorCoords.lat.toFixed(2)}°N` : `${Math.abs(cursorCoords.lat).toFixed(2)}°S`},{' '}
              {cursorCoords.lon >= 0 ? `${cursorCoords.lon.toFixed(2)}°E` : `${Math.abs(cursorCoords.lon).toFixed(2)}°W`}
            </span>
          ) : (
            <span className="text-zinc-500">CURSOR: ORBITAL OVERVIEW</span>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 border-l border-panel-border pl-3 truncate">
          <span className="text-zinc-500">TARGET:</span>
          <span className="text-zinc-200 font-semibold truncate">
            {selectedSiteName || 'NONE SELECTED'}
          </span>
        </div>
      </div>

      {/* Center: Epistemic Core Principle */}
      <div className="hidden lg:flex items-center space-x-2 text-zinc-500">
        <span>"INFERRED WITH ERROR BARS"</span>
        <span>•</span>
        <span className="text-amber-400/90 font-medium">FP RATE: 6.06 / 10⁴ km²</span>
      </div>

      {/* Right: Telemetry Counts & State */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="hidden md:flex items-center space-x-1">
          <Database className="w-3 h-3 text-zinc-500" />
          <span>{candidateCount} CANDIDATES</span>
        </div>

        <div className="flex items-center space-x-1 border-l border-panel-border pl-3">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">G2 DRAFT</span>
        </div>

        <div className="hidden sm:block border-l border-panel-border pl-3 text-zinc-500">
          <span>ORTHO 3D</span>
        </div>
      </div>
    </footer>
  );
};
