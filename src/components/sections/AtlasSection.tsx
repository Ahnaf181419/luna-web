import React, { useState, useMemo } from 'react';
import { CANDIDATES } from '../../data/candidates';
import { SITES } from '../../data/sites';
import type { Candidate } from '../../types';
import { Search, ChevronRight, LayoutList, LayoutGrid, Filter, ExternalLink } from 'lucide-react';
import { CandidateInspectorModal } from '../instruments/CandidateInspectorModal';

interface AtlasSectionProps {
  siteFilter: string;
  onSetSiteFilter: (siteId: string) => void;
}

export const AtlasSection: React.FC<AtlasSectionProps> = ({ siteFilter, onSetSiteFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PITS' | 'SAGS' | 'BACKLOG'>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [inspectedCandidate, setInspectedCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = useMemo(() => {
    return CANDIDATES.filter((c) => {
      const matchesSite = siteFilter === 'ALL' || c.siteId === siteFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.id.toLowerCase().includes(q) ||
        c.siteName.toLowerCase().includes(q) ||
        c.morphology.toLowerCase().includes(q);

      let matchesCat = true;
      if (categoryFilter === 'PITS') {
        matchesCat = c.morphology.toLowerCase().includes('pit');
      } else if (categoryFilter === 'SAGS') {
        matchesCat = c.morphology.toLowerCase().includes('sag') || c.morphology.toLowerCase().includes('depression');
      } else if (categoryFilter === 'BACKLOG') {
        matchesCat = c.isBacklog;
      }

      return matchesSite && matchesSearch && matchesCat;
    });
  }, [siteFilter, searchTerm, categoryFilter]);

  return (
    <section id="atlas" className="py-24 border-b border-space-700/60 bg-space-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="text-blue-400 font-mono text-xs uppercase tracking-wider font-semibold">
              05 • CANDIDATE FEATURE REGISTRY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Lunar Subsurface Candidate Atlas
            </h2>
            <p className="text-zinc-400 font-sans text-sm leading-relaxed">
              257 morphological candidate features cataloged across 21 calibrated LROC NAC DTM targets. Click any candidate to inspect its high-resolution DTM cross-section and multi-axis evidence score.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-space-900 border border-space-700 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'TABLE' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'CARDS' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-space-900 p-4 sm:p-5 rounded-2xl border border-space-700/80 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, target site, or morphology..."
                className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-space-950 border border-space-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono text-zinc-400 pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0 mr-1" />
              {(['ALL', 'PITS', 'SAGS', 'BACKLOG'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg border transition shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-blue-950/80 text-blue-300 border-blue-600'
                      : 'bg-space-950 text-zinc-400 border-space-700 hover:text-white'
                  }`}
                >
                  {cat === 'ALL'
                    ? 'All Features'
                    : cat === 'PITS'
                    ? 'Primary Pits'
                    : cat === 'SAGS'
                    ? 'Roof Sags'
                    : 'Visual Backlog (27)'}
                </button>
              ))}
            </div>

          </div>

          {/* Site Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-space-800 text-[11px] font-mono">
            <span className="text-zinc-500 uppercase text-[10px] mr-1">Target Site:</span>
            <button
              onClick={() => onSetSiteFilter('ALL')}
              className={`px-2.5 py-1 rounded border transition ${
                siteFilter === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-space-950 text-zinc-400 border-space-700 hover:text-white'
              }`}
            >
              ALL SITES ({CANDIDATES.length})
            </button>
            {SITES.map((site) => (
              <button
                key={site.id}
                onClick={() => onSetSiteFilter(site.id)}
                className={`px-2.5 py-1 rounded border transition ${
                  siteFilter === site.id
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-space-950 text-zinc-400 border-space-700 hover:text-white'
                }`}
              >
                {site.id}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Table or Card Grid */}
        {viewMode === 'TABLE' ? (
          <div className="bg-space-900 rounded-2xl border border-space-700/80 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-space-950 text-zinc-400 border-b border-space-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Candidate ID</th>
                    <th className="p-4">Target Site</th>
                    <th className="p-4">Morphological Feature</th>
                    <th className="p-4">Coordinates</th>
                    <th className="p-4">Calibrated Score</th>
                    <th className="p-4">Audit Status</th>
                    <th className="p-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-space-800/80 text-zinc-300">
                  {filteredCandidates.map((cand) => {
                    const isAnchor = cand.status === 'CONFIRMED ANCHOR';
                    const isHigh = cand.status === 'HIGH CONFIDENCE';

                    return (
                      <tr
                        key={cand.id}
                        onClick={() => setInspectedCandidate(cand)}
                        className="hover:bg-space-850/60 transition cursor-pointer group"
                      >
                        <td className="p-4 font-bold text-white whitespace-nowrap group-hover:text-blue-400">
                          {cand.id}
                        </td>
                        <td className="p-4 text-zinc-400 whitespace-nowrap">{cand.siteName}</td>
                        <td className="p-4 text-zinc-300 whitespace-nowrap">{cand.morphology}</td>
                        <td className="p-4 text-zinc-400 whitespace-nowrap">
                          {cand.lat.toFixed(2)}°N, {cand.lon.toFixed(2)}°E
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold">
                          <span className={cand.score >= 0.8 ? 'text-teal-400' : 'text-zinc-300'}>
                            {cand.score.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded border ${
                              isAnchor
                                ? 'bg-teal-950/80 text-teal-300 border-teal-800'
                                : isHigh
                                ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                                : 'bg-orange-950/80 text-orange-300 border-orange-800'
                            }`}
                          >
                            {cand.status}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1 text-zinc-500 group-hover:text-blue-400">
                            <span className="text-[10px]">Open</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                onClick={() => setInspectedCandidate(cand)}
                className="bg-space-900 p-5 rounded-2xl border border-space-700/80 hover:border-blue-600 transition cursor-pointer space-y-3 font-mono text-xs shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-blue-400 text-sm">
                    {cand.id}
                  </span>
                  <span className="text-teal-400 font-bold">{cand.score.toFixed(2)}</span>
                </div>
                <div className="text-zinc-300 text-[11px] font-sans">{cand.morphology}</div>
                <div className="text-zinc-500 text-[10px]">{cand.siteName} • {cand.dtmProduct}</div>
                <div className="flex items-center justify-between pt-2 border-t border-space-800 text-[10px] text-zinc-400">
                  <span>{cand.depthMeters ? `${cand.depthMeters}m depth` : 'Collapse Sag'}</span>
                  <span className="text-blue-400 group-hover:underline flex items-center gap-1">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Candidate Detail Modal */}
        <CandidateInspectorModal
          candidate={inspectedCandidate}
          onClose={() => setInspectedCandidate(null)}
        />

      </div>
    </section>
  );
};
