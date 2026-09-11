import React, { useState, useEffect } from 'react';
import { Search, X, Compass, Database, ShieldCheck, Network, ArrowRight } from 'lucide-react';
import { CANDIDATES } from '../../data/candidates';
import { SITES } from '../../data/sites';
import { GATES } from '../../data/gates';
import type { TabType } from '../layout/Header';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  onSelectSite?: (siteId: string) => void;
  onSelectCandidate?: (candidateId: string) => void;
}

interface SearchItem {
  id: string;
  type: 'CANDIDATE' | 'SITE' | 'GATE' | 'KNOWLEDGE';
  title: string;
  subtitle: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectSite,
  onSelectCandidate,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable index
  const items: SearchItem[] = [
    // Sites
    ...SITES.map((s) => ({
      id: s.id,
      type: 'SITE' as const,
      title: `${s.name} (${s.id})`,
      subtitle: `${s.lat >= 0 ? `${s.lat.toFixed(1)}°N` : `${Math.abs(s.lat).toFixed(1)}°S`}, ${s.lon.toFixed(1)}°E • ${s.candidateCount} candidates`,
      action: () => {
        if (onSelectSite) onSelectSite(s.id);
        onSelectTab('atlas');
        onClose();
      },
    })),
    // Candidates
    ...CANDIDATES.map((c) => ({
      id: c.id,
      type: 'CANDIDATE' as const,
      title: `${c.id} — ${c.morphology}`,
      subtitle: `${c.siteName} • Score: ${c.score.toFixed(2)} • ${c.status}`,
      action: () => {
        if (onSelectCandidate) onSelectCandidate(c.id);
        onSelectTab('atlas');
        onClose();
      },
    })),
    // Gates
    ...GATES.map((g) => ({
      id: g.id,
      type: 'GATE' as const,
      title: g.title,
      subtitle: `Status: ${g.status} • Spend: $${g.spend}.00`,
      action: () => {
        onSelectTab('gates');
        onClose();
      },
    })),
    // Knowledge Hub
    {
      id: 'knowledge-mocs',
      type: 'KNOWLEDGE' as const,
      title: 'Obsidian Knowledge Graph & MOCs',
      subtitle: '5 Maps of Content, 11 dossiers, decision logs D1/D2',
      action: () => {
        onSelectTab('knowledge');
        onClose();
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl bg-obsidian-900 border border-cyan-800/80 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-obsidian-950">
          <Search className="w-4 h-4 text-cyan-400 mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, target site, candidate ID, or gate..."
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No matching lunar records found.
            </div>
          ) : (
            filteredItems.slice(0, 15).map((item) => {
              let typeBadge = 'bg-slate-800 text-slate-400 border-slate-700';
              let Icon = Database;
              if (item.type === 'SITE') {
                typeBadge = 'bg-cyan-950 text-cyan-400 border-cyan-800';
                Icon = Compass;
              } else if (item.type === 'GATE') {
                typeBadge = 'bg-emerald-950 text-emerald-400 border-emerald-800';
                Icon = ShieldCheck;
              } else if (item.type === 'KNOWLEDGE') {
                typeBadge = 'bg-purple-950 text-purple-400 border-purple-800';
                Icon = Network;
              }

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/50 cursor-pointer transition group"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-slate-200 group-hover:text-white font-bold truncate">
                        {item.title}
                      </div>
                      <div className="text-slate-500 text-[10px] truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className={`px-1.5 py-0.5 text-[9px] rounded border ${typeBadge}`}>
                      {item.type}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-obsidian-950/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Navigate: ↑ ↓ • Select: Enter • Dismiss: Esc</span>
          <span className="text-cyan-400 font-semibold">LUNARVOID Telemetry Bus</span>
        </div>
      </div>
    </div>
  );
};
