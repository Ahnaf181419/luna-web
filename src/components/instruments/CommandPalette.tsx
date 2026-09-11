import React, { useState, useEffect } from 'react';
import { Search, X, Compass, Database, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { CANDIDATES } from '../../data/candidates';
import { SITES } from '../../data/sites';
import { GATES } from '../../data/gates';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSite?: (siteId: string) => void;
  onSelectCandidate?: (candidateId: string) => void;
}

interface SearchItem {
  id: string;
  type: 'SECTION' | 'CANDIDATE' | 'SITE' | 'GATE';
  title: string;
  subtitle: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
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

  const scrollTo = (hash: string) => {
    onClose();
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const items: SearchItem[] = [
    {
      id: 'sec-thesis',
      type: 'SECTION',
      title: 'Epistemic Thesis & Scientific Humility',
      subtitle: 'Jump to Section 01 • "We infer them, with error bars"',
      action: () => scrollTo('#thesis'),
    },
    {
      id: 'sec-theory',
      type: 'SECTION',
      title: 'Multi-Evidence Bayesian Fusion & Calculator',
      subtitle: 'Jump to Section 02 • 4 physical evidence layers and live PDF curve',
      action: () => scrollTo('#theory'),
    },
    {
      id: 'sec-cutaway',
      type: 'SECTION',
      title: '3D Subterranean Conduit Cutaway',
      subtitle: 'Jump to Section 03 • Interactive WebGL geological block model',
      action: () => scrollTo('#cutaway'),
    },
    {
      id: 'sec-observatory',
      type: 'SECTION',
      title: '3D Lunar Target Observatory & Globe',
      subtitle: 'Jump to Section 04 • 21 target coordinates and DTM dossiers',
      action: () => scrollTo('#observatory'),
    },
    {
      id: 'sec-atlas',
      type: 'SECTION',
      title: '257 Candidate Feature Registry',
      subtitle: 'Jump to Section 05 • Filterable DTM cross-sections & radar scores',
      action: () => scrollTo('#atlas'),
    },
    {
      id: 'sec-gates',
      type: 'SECTION',
      title: '24-Session Research Journey & Milestone Gates',
      subtitle: 'Jump to Section 06 • Gate G0′, G1, G2 reproducibility criteria',
      action: () => scrollTo('#gates'),
    },
    {
      id: 'sec-ledger',
      type: 'SECTION',
      title: 'Frugal Science Compute Ledger',
      subtitle: 'Jump to Section 06 • Zero cloud spend compliance ($0.00 / $800 spent)',
      action: () => scrollTo('#ledger'),
    },
    {
      id: 'sec-vault',
      type: 'SECTION',
      title: 'Obsidian Knowledge Vault & Maps of Content',
      subtitle: 'Jump to Section 07 • 5 MOCs, atomic dossiers, and wiki graph links',
      action: () => scrollTo('#vault'),
    },
    ...SITES.map((s) => ({
      id: s.id,
      type: 'SITE' as const,
      title: `${s.name} (${s.id})`,
      subtitle: `${s.lat >= 0 ? `${s.lat.toFixed(1)}°N` : `${Math.abs(s.lat).toFixed(1)}°S`}, ${s.lon.toFixed(1)}°E • ${s.candidateCount} candidates`,
      action: () => {
        if (onSelectSite) onSelectSite(s.id);
        scrollTo('#observatory');
      },
    })),
    ...CANDIDATES.map((c) => ({
      id: c.id,
      type: 'CANDIDATE' as const,
      title: `${c.id} — ${c.morphology}`,
      subtitle: `${c.siteName} • Score: ${c.score.toFixed(2)} • ${c.status}`,
      action: () => {
        if (onSelectCandidate) onSelectCandidate(c.id);
        scrollTo('#atlas');
      },
    })),
    ...GATES.map((g) => ({
      id: g.id,
      type: 'GATE' as const,
      title: g.title,
      subtitle: `Status: ${g.status} • Spend: $${g.spend}.00`,
      action: () => scrollTo('#gates'),
    })),
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-space-900 border border-space-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-space-800 bg-space-950">
          <Search className="w-4 h-4 text-blue-400 mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections, target sites, candidates, or gates..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none text-xs"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-space-800/80 p-2">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              No matching lunar records found.
            </div>
          ) : (
            filteredItems.slice(0, 15).map((item) => {
              let typeBadge = 'bg-space-850 text-zinc-400 border-space-700';
              let Icon = Database;
              if (item.type === 'SECTION') {
                typeBadge = 'bg-blue-950/80 text-blue-300 border-blue-800';
                Icon = BookOpen;
              } else if (item.type === 'SITE') {
                typeBadge = 'bg-teal-950/80 text-teal-300 border-teal-800';
                Icon = Compass;
              } else if (item.type === 'GATE') {
                typeBadge = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
                Icon = ShieldCheck;
              }

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-space-850 cursor-pointer transition group"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Icon className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-zinc-200 group-hover:text-white font-semibold truncate">
                        {item.title}
                      </div>
                      <div className="text-zinc-500 text-[10px] truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className={`px-1.5 py-0.5 text-[9px] rounded border ${typeBadge}`}>
                      {item.type}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-space-950 border-t border-space-800 flex items-center justify-between text-[10px] text-zinc-500">
          <span>↑ ↓ Navigate • Enter Select • Esc Close</span>
          <span className="text-blue-400 font-mono">LUNARVOID Telemetry</span>
        </div>
      </div>
    </div>
  );
};
