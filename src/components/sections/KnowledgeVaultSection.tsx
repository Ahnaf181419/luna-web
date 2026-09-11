import React, { useState } from 'react';
import { BookOpen, Layers, GitBranch, Cpu, Compass, ArrowRight } from 'lucide-react';

interface MOCItem {
  id: string;
  title: string;
  category: string;
  icon: React.FC<{ className?: string }>;
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

export const KnowledgeVaultSection: React.FC = () => {
  const [activeMoc, setActiveMoc] = useState<MOCItem>(MOCS[0]);

  return (
    <section id="vault" className="py-24 border-b border-space-700/60 bg-space-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="text-blue-400 font-mono text-xs uppercase tracking-wider font-semibold">
            07 • ATOMIC REPOSITORY ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Obsidian Knowledge Graph & Maps of Content
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            The entire body of LUNARVOID research is organized as an interconnected bi-directional knowledge vault. Maps of Content (MOCs) cluster atomic markdown dossiers across geological sites, gates, and epistemology.
          </p>
        </div>

        {/* MOC Cards Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCS.map((moc) => {
            const isSelected = activeMoc.id === moc.id;
            const Icon = moc.icon;

            return (
              <div
                key={moc.id}
                onClick={() => setActiveMoc(moc)}
                className={`p-6 rounded-2xl border transition cursor-pointer space-y-4 ${
                  isSelected
                    ? 'bg-space-900 border-blue-600 shadow-xl shadow-blue-950/40'
                    : 'bg-space-900/60 border-space-700/80 hover:border-space-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-space-950 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-zinc-400 border border-space-800">
                    {moc.notesCount} atomic notes
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                    {moc.category}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono mt-0.5">{moc.title}</h3>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {moc.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Active MOC Focus Detail Card */}
        <div className="bg-space-900 border border-space-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-space-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                ACTIVE KNOWLEDGE CLUSTER
              </span>
              <h3 className="text-lg font-bold text-white font-mono mt-0.5">{activeMoc.title}</h3>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-blue-950/80 text-blue-300 border border-blue-800 self-start sm:self-auto">
              {activeMoc.category}
            </span>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">
              FIRST-CLASS WIKI GRAPH NODES & CORE ATOMIC REFERENCES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {activeMoc.keyConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-space-950 border border-space-800 rounded-xl flex items-center justify-between text-zinc-200 hover:border-blue-600/60 transition group cursor-pointer"
                >
                  <span className="text-zinc-300 group-hover:text-white">[[{concept}]]</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
