import React, { useState, useMemo } from 'react';
import { X, Search, ChevronRight, Filter } from 'lucide-react';
import { SITES } from '../../data/sites';
import { CANDIDATES } from '../../data/candidates';

export interface LeftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
}

export const LeftDrawer: React.FC<LeftDrawerProps> = ({
  isOpen,
  onClose,
  selectedSiteId,
  onSelectSite,
  selectedCandidateId,
  onSelectCandidate,
}) => {
  const [tab, setTab] = useState<'SITES' | 'CANDIDATES'>('SITES');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PITS' | 'SAGS' | 'BACKLOG'>('ALL');

  const filteredSites = useMemo(() => {
    return SITES.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.geologicalUnit.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const filteredCandidates = useMemo(() => {
    return CANDIDATES.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.id.toLowerCase().includes(q) ||
        c.siteName.toLowerCase().includes(q) ||
        c.morphology.toLowerCase().includes(q);

      let matchesCat = true;
      if (categoryFilter === 'PITS') {
        matchesCat = c.morphology.toLowerCase().includes('pit');
      } else if (categoryFilter === 'SAGS') {
        matchesCat =
          c.morphology.toLowerCase().includes('sag') ||
          c.morphology.toLowerCase().includes('depression');
      } else if (categoryFilter === 'BACKLOG') {
        matchesCat = c.isBacklog;
      }

      return matchesSearch && matchesCat;
    });
  }, [search, categoryFilter]);

  return (
    <aside
      className={`fixed top-11 bottom-7 left-0 z-20 w-[320px] max-w-[85vw] bg-panel-bg border-r border-panel-border flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Target Sites and Candidates Directory"
    >
      {/* Header Bar */}
      <div className="h-10 px-3 border-b border-panel-border flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-zinc-200 tracking-wider">
            CATALOG DIRECTORY
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-panel-surface transition"
          title="Close Drawer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="p-2 border-b border-panel-border bg-void-black/50 shrink-0">
        <div className="grid grid-cols-2 gap-1 p-0.5 rounded bg-panel-surface border border-panel-border text-xs font-mono">
          <button
            onClick={() => setTab('SITES')}
            className={`py-1 rounded text-center transition ${
              tab === 'SITES'
                ? 'bg-void-black text-blue-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sites ({SITES.length})
          </button>
          <button
            onClick={() => setTab('CANDIDATES')}
            className={`py-1 rounded text-center transition ${
              tab === 'CANDIDATES'
                ? 'bg-void-black text-blue-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Candidates ({CANDIDATES.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mt-2">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'SITES' ? 'Filter target sites...' : 'Filter candidates...'}
            className="w-full pl-8 pr-2.5 py-1 text-xs font-mono bg-panel-surface border border-panel-border rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Candidate Category Pills (Only in Candidates mode) */}
        {tab === 'CANDIDATES' && (
          <div className="flex items-center space-x-1 mt-2 text-[10px] font-mono text-zinc-400 overflow-x-auto pb-0.5">
            <Filter className="w-3 h-3 text-zinc-500 shrink-0" />
            {(['ALL', 'PITS', 'SAGS', 'BACKLOG'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-1.5 py-0.5 rounded border transition shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-blue-950/60 text-blue-400 border-blue-800'
                    : 'bg-panel-surface text-zinc-400 border-panel-border hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto panel-scroll divide-y divide-panel-border/60">
        {tab === 'SITES' ? (
          filteredSites.length === 0 ? (
            <div className="p-4 text-xs font-mono text-zinc-500 text-center">
              No matching sites found.
            </div>
          ) : (
            filteredSites.map((site) => {
              const isSelected = selectedSiteId === site.id;
              return (
                <div
                  key={site.id}
                  onClick={() => onSelectSite(site.id)}
                  className={`p-2.5 cursor-pointer transition flex items-center justify-between text-xs font-mono ${
                    isSelected
                      ? 'bg-panel-surface border-l-2 border-blue-500 text-zinc-100'
                      : 'hover:bg-panel-surface/60 text-zinc-300'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-zinc-100">{site.id}</span>
                      {site.primaryAnchor && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-teal-950/60 text-teal-400 border border-teal-800/60">
                          ANCHOR
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">{site.name}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center space-x-2 mt-0.5">
                      <span>
                        {site.lat >= 0 ? `${site.lat.toFixed(1)}°N` : `${Math.abs(site.lat).toFixed(1)}°S`},{' '}
                        {site.lon.toFixed(1)}°E
                      </span>
                      <span>•</span>
                      <span>{site.candidateCount} features</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-2" />
                </div>
              );
            })
          )
        ) : filteredCandidates.length === 0 ? (
          <div className="p-4 text-xs font-mono text-zinc-500 text-center">
            No matching candidates found.
          </div>
        ) : (
          filteredCandidates.map((cand) => {
            const isSelected = selectedCandidateId === cand.id;
            const scoreColor =
              cand.score >= 0.85
                ? 'text-teal-400'
                : cand.score >= 0.65
                ? 'text-amber-400'
                : 'text-zinc-400';

            return (
              <div
                key={cand.id}
                onClick={() => onSelectCandidate(cand.id)}
                className={`p-2.5 cursor-pointer transition flex items-center justify-between text-xs font-mono ${
                  isSelected
                    ? 'bg-panel-surface border-l-2 border-blue-500 text-zinc-100'
                    : 'hover:bg-panel-surface/60 text-zinc-300'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center justify-between space-x-2">
                    <span className="font-bold text-zinc-100 truncate">{cand.id}</span>
                    <span className={`text-[11px] font-bold ${scoreColor}`}>
                      {cand.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">{cand.morphology}</div>
                  <div className="text-[10px] text-zinc-500 flex items-center space-x-2 mt-0.5">
                    <span>{cand.siteId}</span>
                    <span>•</span>
                    <span>{cand.depthMeters ? `${cand.depthMeters}m depth` : 'Sag'}</span>
                    {cand.isBacklog && (
                      <span className="text-orange-400 text-[9px]">• Backlog</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-2" />
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="h-7 px-3 border-t border-panel-border bg-void-black/50 flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
        <span>Click target to focus 3D globe</span>
        <span>Esc to close</span>
      </div>
    </aside>
  );
};
