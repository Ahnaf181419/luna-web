import React, { useState, useEffect } from 'react';
import { Search, X, Compass, Database, ShieldCheck, Network, ArrowRight } from 'lucide-react';
import { CANDIDATES } from '../../data/candidates';
import { SITES } from '../../data/sites';
import { GATES } from '../../data/gates';

export type TabType = 'overview' | 'atlas' | 'evidence' | 'gates' | 'knowledge';

export interface CommandPaletteProps {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: SearchItem[] = [
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-void-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-xl bg-panel-bg border border-panel-border rounded-lg shadow-2xl overflow-hidden font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-3.5 py-3 border-b border-panel-border bg-void-black/60">
          <Search className="w-4 h-4 text-blue-400 mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search target sites, candidates, or gates..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto panel-scroll divide-y divide-panel-border/60 p-1.5">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              No matching lunar records found.
            </div>
          ) : (
            filteredItems.slice(0, 15).map((item) => {
              let typeBadge = 'bg-panel-surface text-zinc-400 border-panel-border';
              let Icon = Database;
              if (item.type === 'SITE') {
                typeBadge = 'bg-blue-950/60 text-blue-400 border-blue-800';
                Icon = Compass;
              } else if (item.type === 'GATE') {
                typeBadge = 'bg-teal-950/60 text-teal-400 border-teal-800';
                Icon = ShieldCheck;
              } else if (item.type === 'KNOWLEDGE') {
                typeBadge = 'bg-panel-surface text-zinc-300 border-panel-border';
                Icon = Network;
              }

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between p-2 rounded hover:bg-panel-surface cursor-pointer transition group"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <Icon className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-zinc-200 group-hover:text-white font-semibold truncate">
                        {item.title}
                      </div>
                      <div className="text-zinc-500 text-[10px] truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className={`px-1.5 py-0.2 text-[9px] rounded border ${typeBadge}`}>
                      {item.type}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-blue-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-3 py-1.5 bg-void-black/80 border-t border-panel-border flex items-center justify-between text-[10px] text-zinc-500">
          <span>↑ ↓ Navigate • Enter Select • Esc Close</span>
          <span className="text-blue-400 font-mono">LUNARVOID BUS</span>
        </div>
      </div>
    </div>
  );
};
