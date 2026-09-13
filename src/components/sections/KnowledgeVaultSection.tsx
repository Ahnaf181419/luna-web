import React, { useState } from 'react';
import { BookOpen, Layers, GitBranch, Cpu, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    summary:
      'Decision logs D1/D2, gate specifications G0′/G1/G2, and the 27-item visual inspection backlog triage protocol.',
    keyConcepts: ['Gate G2 Criteria', 'Decision D1: Stereo Baseline', 'Visual Backlog Triage', 'AX52 Burst Scope'],
  },
  {
    id: 'moc-sites',
    title: 'MOC Sites & Candidates',
    category: 'Planetary Geology',
    icon: Compass,
    notesCount: 28,
    summary:
      '21 LROC NAC DTM target dossiers, candidate registry coordinates, morphological feature classification, and false-positive clustering.',
    keyConcepts: ['TRANQPIT1 Anchor', 'Marius Hills Rille System', 'Mare Ingenii Swirl', 'Philolaus Polar Pit'],
  },
  {
    id: 'moc-concepts',
    title: 'MOC Concepts & Methods',
    category: 'Epistemology & Theory',
    icon: BookOpen,
    notesCount: 22,
    summary:
      'Epistemic calibration context, Bayesian evidence combination, beam deflection structural mechanics, and observational bias mitigation.',
    keyConcepts: ['Calibration-Context FP', 'I14 Morphometric Funnel', 'LOLA Track Density Bias', 'Basalt Tensile Limits'],
  },
  {
    id: 'moc-data',
    title: 'MOC Data & Code',
    category: 'Pipeline & Artifacts',
    icon: Layers,
    notesCount: 19,
    summary:
      'Dataset manifests, USGS ISIS3 stereo ingestion, ASP DTM point-cloud generation scripts, and reproducible smoke tests.',
    keyConcepts: ['ISIS3 Ingestion', 'NASA Ames Stereo Pipeline', 'SLDEM2015 Normalization', 'Mini-RF CPR Extraction'],
  },
  {
    id: 'moc-sessions',
    title: 'MOC Sessions & Ops',
    category: 'Research History',
    icon: Cpu,
    notesCount: 24,
    summary:
      'Complete record of all 24 research sessions from repository initialization through Gate G2 review, paired with the budget ledger.',
    keyConcepts: ['24 Session Logs', 'Zero-Spend Compliance', 'Tier-0 Workstation Setup', 'Master Plan v5 Synthesis'],
  },
];

export const KnowledgeVaultSection: React.FC = () => {
  const [activeMoc, setActiveMoc] = useState<MOCItem>(MOCS[0]!);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="max-w-3xl border-b border-border/70 pb-3">
        <span className="collar-ribbon text-[10px]">
          <span>ATOMIC REPOSITORY ARCHITECTURE // BI-DIRECTIONAL GRAPH</span>
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
          Knowledge Vault & Maps of Content (MOCs)
        </h2>
        <p className="mt-2 font-sans text-xs leading-relaxed text-muted-foreground">
          The entire body of LUNARVOID research is organized as an interconnected
          bi-directional knowledge vault. Maps of Content (MOCs) cluster atomic markdown
          dossiers across geological sites, gates, and epistemology.
        </p>
      </div>

      {/* MOC cards selector grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCS.map((moc) => {
          const isSelected = activeMoc.id === moc.id;
          const Icon = moc.icon;

          return (
            <button
              key={moc.id}
              onClick={() => setActiveMoc(moc)}
              className={`workbench-panel cursor-pointer space-y-3 p-4 text-left transition-all rounded-[2px] ${
                isSelected ? 'border-primary/80 bg-surface/80' : 'hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-[2px] border ${
                    isSelected
                      ? 'border-primary/60 bg-primary/15 text-primary'
                      : 'border-border/70 bg-background/60 text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="rounded-[2px] bg-muted/70 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {moc.notesCount} NOTES
                </span>
              </div>

              <div>
                <span className="collar-ribbon text-[9px] text-accent">{moc.category}</span>
                <h3 className="font-mono text-xs font-bold text-foreground mt-0.5">{moc.title}</h3>
              </div>

              <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">{moc.summary}</p>
            </button>
          );
        })}
      </div>

      {/* Active MOC focus detail */}
      <div className="workbench-panel space-y-5 p-5 sm:p-6 rounded-[2px]">
        <div className="flex flex-col justify-between gap-3 border-b border-border/70 pb-3 sm:flex-row sm:items-center">
          <div>
            <span className="collar-ribbon text-[9px]">ACTIVE CLUSTER DOSSIER</span>
            <h3 className="font-display text-base font-bold tracking-tight text-foreground mt-0.5">{activeMoc.title}</h3>
          </div>
          <Badge
            variant="outline"
            className="self-start rounded-[2px] font-mono text-[9px] tracking-widest text-primary border-primary/50 sm:self-auto uppercase"
          >
            {activeMoc.category}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <span className="collar-ribbon text-[9px]">FIRST-CLASS WIKI GRAPH NODES & CORE ATOMIC REFERENCES</span>
          <div className="grid grid-cols-1 gap-2.5 font-mono text-xs sm:grid-cols-2">
            {activeMoc.keyConcepts.map((concept) => (
              <div
                key={concept}
                className="flex items-center justify-between rounded-[2px] border border-border/70 bg-surface/60 p-3"
              >
                <span className="text-foreground/80 text-xs">[[{concept}]]</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
