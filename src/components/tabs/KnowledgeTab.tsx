import React, { useState } from 'react';
import { Network, BookOpen, Layers, GitBranch, Cpu, Compass } from 'lucide-react';

interface MOCItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  notesCount: number;
  summary: string;
  keyConcepts: string[];
}

const MOCS: MOCItem[] = [
  {
    id: 'moc-gates',
    title: 'MOC Gates & Decisions',
    category: 'Governance & Criteria',
    icon: GitBranch,
    notesCount: 14,
    summary: 'Decision logs D1/D2, gate specifications G0′/G1/G2, and the 27-item visual inspection backlog triage protocol.',
    keyConcepts: ['Gate G2 Criteria', 'Decision D1: Stereo Baseline', 'Visual Backlog Triage', 'AX52 Burst Scope']
  },
  {
    id: 'moc-sites',
    title: 'MOC Sites & Candidates',
    category: 'Planetary Geology',
    icon: Compass,
    notesCount: 28,
    summary: '21 LROC NAC DTM target dossiers, candidate registry coordinates, morphological feature classification, and false-positive clustering.',
    keyConcepts: ['TRANQPIT1 Anchor', 'Marius Hills Rille System', 'Mare Ingenii Swirl', 'Philolaus Polar Pit']
  },
  {
    id: 'moc-concepts',
    title: 'MOC Concepts & Methods',
    category: 'Epistemology & Theory',
    icon: BookOpen,
    notesCount: 22,
    summary: 'Epistemic calibration context, Bayesian evidence combination, beam deflection structural mechanics, and observational bias mitigation.',
    keyConcepts: ['Calibration-Context FP', 'I14 Morphometric Funnel', 'LOLA Track Density Bias', 'Basalt Tensile Limits']
  },
  {
    id: 'moc-data',
    title: 'MOC Data & Code',
    category: 'Pipeline & Artifacts',
    icon: Layers,
    notesCount: 19,
    summary: 'Dataset manifests, USGS ISIS3 stereo ingestion, ASP DTM point-cloud generation scripts, and reproducible smoke tests.',
    keyConcepts: ['ISIS3 Ingestion', 'NASA Ames Stereo Pipeline', 'SLDEM2015 Normalization', 'Mini-RF CPR Extraction']
  },
  {
    id: 'moc-sessions',
    title: 'MOC Sessions & Ops',
    category: 'Research History',
    icon: Cpu,
    notesCount: 24,
    summary: 'Complete record of all 24 research sessions from repository initialization through Gate G2 review, paired with the budget ledger.',
    keyConcepts: ['24 Session Logs', 'Zero-Spend Compliance', 'Tier-0 Workstation Setup', 'Master Plan v5 Synthesis']
  }
];

export const KnowledgeTab: React.FC = () => {
  const [activeMoc, setActiveMoc] = useState<MOCItem>(MOCS[0]);

  return (
    <div className="space-y-8">
      
      {/* SECTION HEADER */}
      <div className="bg-obsidian-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" />
          <span>Obsidian Knowledge Graph & Maps of Content</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1 max-w-3xl">
          The entire LUNARVOID research body is structured as an interconnected bi-directional knowledge vault. Maps of Content (MOCs) organize atomic notes across geological sites, gates, and epistemology.
        </p>
      </div>

      {/* MOC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCS.map((moc) => {
          const isSelected = activeMoc.id === moc.id;
          const IconComp = moc.icon;

          return (
            <div
              key={moc.id}
              onClick={() => setActiveMoc(moc)}
              className={`p-5 rounded-xl border transition cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-purple-950/40 border-purple-700 shadow-lg shadow-purple-950/40'
                  : 'bg-obsidian-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-purple-900 text-purple-300' : 'bg-obsidian-950 text-slate-400'
                }`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-950 text-slate-400 border border-slate-800">
                  {moc.notesCount} notes
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                  {moc.category}
                </span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">{moc.title}</h3>
              </div>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {moc.summary}
              </p>
            </div>
          );
        })}
      </div>

      {/* ACTIVE MOC DETAIL EXPLORER */}
      <div className="bg-obsidian-900 border border-purple-800/60 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE KNOWLEDGE CLUSTER</span>
            <h3 className="text-base font-bold text-white font-mono mt-0.5">{activeMoc.title}</h3>
          </div>
          <span className="px-3 py-1 text-xs font-mono rounded bg-purple-950 text-purple-300 border border-purple-800">
            {activeMoc.category}
          </span>
        </div>

        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            FIRST-CLASS GRAPH NODES & CORE REFS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {activeMoc.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-3 bg-obsidian-950 border border-slate-800 rounded-xl flex items-center justify-between text-slate-200"
              >
                <span>[[{concept}]]</span>
                <span className="text-[10px] text-purple-400 hover:underline">View node →</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
