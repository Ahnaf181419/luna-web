import React, { useState } from 'react';
import { BookOpen, Layers, GitBranch, Cpu, Compass, ArrowRight } from 'lucide-react';
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
      <div className="max-w-3xl">
        <p className="label-mono">Atomic repository architecture</p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          Obsidian knowledge graph & maps of content
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The entire body of LUNARVOID research is organized as an interconnected
          bi-directional knowledge vault. Maps of Content (MOCs) cluster atomic markdown
          dossiers across geological sites, gates, and epistemology.
        </p>
      </div>

      {/* MOC cards selector grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCS.map((moc) => {
          const isSelected = activeMoc.id === moc.id;
          const Icon = moc.icon;

          return (
            <button
              key={moc.id}
              onClick={() => setActiveMoc(moc)}
              className={`panel cursor-pointer space-y-4 p-5 text-left transition-colors ${
                isSelected ? 'border-primary/50' : 'hover:border-input'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                    isSelected
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'border-border bg-background/60 text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {moc.notesCount} atomic notes
                </span>
              </div>

              <div>
                <span className="label-mono text-accent">{moc.category}</span>
                <h3 className="mt-0.5 font-mono text-sm font-bold text-foreground">{moc.title}</h3>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">{moc.summary}</p>
            </button>
          );
        })}
      </div>

      {/* Active MOC focus detail */}
      <div className="panel space-y-6 p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
          <div>
            <p className="label-mono">Active knowledge cluster</p>
            <h3 className="mt-1 font-mono text-lg font-bold text-foreground">{activeMoc.title}</h3>
          </div>
          <Badge
            variant="outline"
            className="self-start font-mono text-[10px] tracking-widest text-primary sm:self-auto"
          >
            {activeMoc.category}
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="label-mono">First-class wiki graph nodes & core atomic references</p>
          <div className="grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-2">
            {activeMoc.keyConcepts.map((concept) => (
              <div
                key={concept}
                className="group flex cursor-pointer items-center justify-between rounded-md border border-border bg-surface/60 p-3.5 transition-colors hover:border-accent/40"
              >
                <span className="text-foreground/80 group-hover:text-foreground">[[{concept}]]</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-accent" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
