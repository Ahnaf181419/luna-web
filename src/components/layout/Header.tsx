import React from 'react';
import { Layers, Database, Activity, ShieldCheck, Network, Search } from 'lucide-react';

export type TabType = 'overview' | 'atlas' | 'evidence' | 'gates' | 'knowledge';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  candidateCount: number;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  candidateCount,
  onOpenCommandPalette,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/90 bg-obsidian-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & NASA Archival Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 via-yellow-600 to-amber-500 flex items-center justify-center font-mono font-black text-black text-base tracking-wider shadow-md shadow-amber-950/40">
            LV
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold tracking-wider text-base text-zinc-100">LUNARVOID</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-950/70 border border-amber-800/70 text-amber-400">
                Gate G2 Active
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">
              Calibrated Multi-Evidence Subsurface Inference
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-mono font-medium">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-amber-950/50 text-amber-400 border border-amber-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Overview & 3D</span>
          </button>

          <button
            onClick={() => onSelectTab('atlas')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'atlas'
                ? 'bg-amber-950/50 text-amber-400 border border-amber-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Atlas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-700 font-mono">
              {candidateCount}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('evidence')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'bg-amber-950/50 text-amber-400 border border-amber-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fusion & Cutaway</span>
          </button>

          <button
            onClick={() => onSelectTab('gates')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'gates'
                ? 'bg-amber-950/50 text-amber-400 border border-amber-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gates</span>
          </button>

          <button
            onClick={() => onSelectTab('knowledge')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'knowledge'
                ? 'bg-amber-950/50 text-amber-400 border border-amber-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Knowledge Graph</span>
          </button>
        </nav>

        {/* Right Telemetry & Search */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-mono">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-obsidian-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition"
            title="Open Command Palette (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px]">Command</span>
            <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-obsidian-950 border border-zinc-700 text-zinc-400">
              ⌘K
            </kbd>
          </button>

          <div className="hidden xl:flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>$0.00 / $800</span>
          </div>
        </div>

      </div>
    </header>
  );
};
