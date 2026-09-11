import React, { useState, useMemo } from 'react';
import { CANDIDATES } from '../../data/candidates';
import { SITES } from '../../data/sites';
import type { Candidate } from '../../types';
import { Search, AlertTriangle, ChevronRight } from 'lucide-react';

interface AtlasTabProps {
  initialSiteFilter?: string;
}

export const AtlasTab: React.FC<AtlasTabProps> = ({ initialSiteFilter = 'ALL' }) => {
  const [selectedSite, setSelectedSite] = useState<string>(initialSiteFilter);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [inspectedCandidate, setInspectedCandidate] = useState<Candidate | null>(CANDIDATES[0]);

  // Filtering candidates
  const filteredCandidates = useMemo(() => {
    return CANDIDATES.filter((c) => {
      const matchesSite = selectedSite === 'ALL' || c.siteId === selectedSite;
      const matchesSearch =
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.morphology.toLowerCase().includes(searchTerm.toLowerCase());

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
  }, [selectedSite, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls Bar */}
      <div className="bg-obsidian-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <span>Lunar Subsurface Candidate Registry</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              257 detected candidate features across 21 calibrated LROC NAC DTM targets
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ID, site, feature..."
                className="pl-9 pr-3 py-1.5 text-xs font-mono bg-obsidian-950 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1.5 px-3 text-xs font-mono bg-obsidian-950 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ALL">All Features</option>
                <option value="PITS">Primary Skylight Pits</option>
                <option value="SAGS">Roof Subsidence Sags</option>
                <option value="BACKLOG">Visual Backlog (27)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Site Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <button
            onClick={() => setSelectedSite('ALL')}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedSite === 'ALL'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'bg-obsidian-950 text-slate-400 border border-slate-850 hover:text-white'
            }`}
          >
            ALL TARGETS ({CANDIDATES.length})
          </button>

          {SITES.map((site) => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site.id)}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedSite === site.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-obsidian-950 text-slate-400 border border-slate-850 hover:text-white'
              }`}
            >
              {site.id}
            </button>
          ))}
        </div>

      </div>

      {/* Main Content Split: Candidate Table & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Candidates Table (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-obsidian-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-obsidian-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Candidate ID</th>
                  <th className="p-3.5">Site</th>
                  <th className="p-3.5">Morphology</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredCandidates.map((cand) => {
                  const isSelected = inspectedCandidate?.id === cand.id;
                  let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
                  if (cand.status === 'CONFIRMED ANCHOR') badgeColor = 'bg-emerald-950 text-emerald-400 border-emerald-800';
                  else if (cand.status === 'HIGH CONFIDENCE') badgeColor = 'bg-cyan-950 text-cyan-400 border-cyan-800';
                  else if (cand.status === 'INSPECTION BACKLOG') badgeColor = 'bg-amber-950 text-amber-400 border-amber-800';

                  return (
                    <tr
                      key={cand.id}
                      onClick={() => setInspectedCandidate(cand)}
                      className={`hover:bg-slate-800/40 transition cursor-pointer ${
                        isSelected ? 'bg-slate-800/60 border-l-2 border-l-cyan-400' : ''
                      }`}
                    >
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">{cand.id}</td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{cand.siteId}</td>
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">{cand.morphology}</td>
                      <td className="p-3.5 font-bold whitespace-nowrap">
                        <span className={cand.score >= 0.8 ? 'text-cyan-400' : 'text-slate-300'}>
                          {cand.score.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] rounded border ${badgeColor}`}>
                          {cand.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <ChevronRight className="w-4 h-4 inline text-slate-500 hover:text-cyan-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Detail Inspection Drawer (Right 5 Cols) */}
        {inspectedCandidate && (
          <div className="lg:col-span-5 bg-obsidian-900 border border-cyan-800/80 rounded-2xl p-6 space-y-5 shadow-2xl sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  CANDIDATE DOSSIER
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">
                  {inspectedCandidate.id}
                </h3>
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-mono rounded border ${
                inspectedCandidate.status === 'CONFIRMED ANCHOR'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : inspectedCandidate.status === 'HIGH CONFIDENCE'
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {inspectedCandidate.status}
              </span>
            </div>

            {/* Coordinates & Geometry Card */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-obsidian-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LUNAR COORDINATES</span>
                <span className="text-white font-bold">
                  {inspectedCandidate.lat.toFixed(2)}°N, {inspectedCandidate.lon.toFixed(2)}°E
                </span>
              </div>

              <div className="bg-obsidian-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DTM PRODUCT</span>
                <span className="text-cyan-400 font-bold">{inspectedCandidate.dtmProduct}</span>
              </div>
            </div>

            {/* Physical Metrics */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-obsidian-950 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-500 text-[10px] block">EST. DEPTH</span>
                <span className="text-white font-bold text-sm">
                  {inspectedCandidate.depthMeters ? `${inspectedCandidate.depthMeters}m` : 'N/A'}
                </span>
              </div>

              <div className="bg-obsidian-950 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-500 text-[10px] block">RADAR CPR</span>
                <span className="text-indigo-400 font-bold text-sm">
                  {inspectedCandidate.cprRatio.toFixed(1)}x
                </span>
              </div>

              <div className="bg-obsidian-950 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-500 text-[10px] block">GRAIL DEFICIT</span>
                <span className="text-purple-400 font-bold text-sm">
                  {inspectedCandidate.bouguerMGal} mGal
                </span>
              </div>
            </div>

            {/* Analyst Notes */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                SCIENTIFIC EVALUATION & NOTES
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-obsidian-950/80 p-3.5 rounded-xl border border-slate-800">
                {inspectedCandidate.notes}
              </p>
            </div>

            {inspectedCandidate.isBacklog && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Requires human stereo review via LROC NAC browse image suite</span>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
