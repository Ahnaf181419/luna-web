import React from 'react';
import { Layers, Database, Activity, ShieldCheck, Network } from 'lucide-react';

export type TabType = 'overview' | 'atlas' | 'evidence' | 'gates' | 'knowledge';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  candidateCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, candidateCount }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-obsidian-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Mission Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-mono font-black text-white text-base tracking-wider shadow-lg shadow-cyan-950">
            LV
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold tracking-wider text-base text-white">LUNARVOID</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                Gate G2 Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Calibrated Multi-Evidence Subsurface Inference
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-mono font-medium">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Overview & 3D</span>
          </button>

          <button
            onClick={() => onSelectTab('atlas')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'atlas'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Atlas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              {candidateCount}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('evidence')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fusion & Cutaway</span>
          </button>

          <button
            onClick={() => onSelectTab('gates')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'gates'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gates</span>
          </button>

          <button
            onClick={() => onSelectTab('knowledge')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'knowledge'
                ? 'bg-purple-950/70 text-purple-300 border border-purple-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Knowledge Graph</span>
          </button>
        </nav>

        {/* Right Telemetry Widget */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Compute: $0.00 / $800</span>
          </div>
        </div>

      </div>
    </header>
  );
};
