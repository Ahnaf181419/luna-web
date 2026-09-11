import React from 'react';
import { 
  PanelLeft, 
  PanelRight, 
  Compass, 
  Database, 
  Activity, 
  ShieldCheck, 
  Network, 
  Search 
} from 'lucide-react';
import type { PanelMode } from '../../App';

export interface FloatingToolbarProps {
  activePanel: PanelMode;
  onSetPanel: (panel: PanelMode) => void;
  onToggleLeftDrawer: () => void;
  onToggleRightDrawer: () => void;
  onOpenCommandPalette: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  activePanel,
  onSetPanel,
  onToggleLeftDrawer,
  onToggleRightDrawer,
  onOpenCommandPalette,
}) => {
  const navItems: { id: PanelMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'site', label: 'Dossier', icon: Compass },
    { id: 'candidate', label: 'Atlas', icon: Database },
    { id: 'evidence', label: 'Fusion', icon: Activity },
    { id: 'gates', label: 'Gates', icon: ShieldCheck },
    { id: 'knowledge', label: 'Vault', icon: Network },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-11 bg-void-black/90 backdrop-blur-md border-b border-panel-border z-30 flex items-center justify-between px-3 select-none">
      {/* Left: Drawer Toggle + Branding */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onToggleLeftDrawer}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-panel-surface border border-transparent hover:border-panel-border transition"
          title="Toggle Target Directory ( [ )"
          aria-label="Toggle Target Directory"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-mono font-bold text-xs text-white tracking-wider">
            LV
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono font-bold text-xs sm:text-sm tracking-wider text-zinc-100">
              LUNARVOID
            </span>
            <span className="hidden md:inline text-[9px] font-mono uppercase tracking-widest text-zinc-400 bg-panel-surface px-1.5 py-0.5 rounded border border-panel-border">
              GIS EXPLORER
            </span>
          </div>
        </div>
      </div>

      {/* Center: Scientific Panel Switchers */}
      <nav className="flex items-center space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetPanel(item.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
                isActive
                  ? 'bg-panel-surface text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-panel-surface/60 border border-transparent'
              }`}
              title={`View ${item.label} Panel`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Search & Right Drawer Toggle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-panel-surface/80 border border-panel-border text-zinc-400 hover:text-zinc-200 text-xs font-mono transition"
          title="Quick Search (Cmd+K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline text-[11px]">Command</span>
          <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 rounded bg-void-black border border-panel-border text-zinc-400">
            ⌘K
          </kbd>
        </button>

        <div className="hidden xl:flex items-center space-x-1 text-[10px] font-mono text-teal-400 bg-teal-950/30 border border-teal-800/40 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span>$0.00 / $800</span>
        </div>

        <button
          onClick={onToggleRightDrawer}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-panel-surface border border-transparent hover:border-panel-border transition"
          title="Toggle Inspection Panel ( ] )"
          aria-label="Toggle Inspection Panel"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
