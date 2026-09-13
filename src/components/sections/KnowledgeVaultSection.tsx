import React, { useState } from 'react';
import { BookOpen, Layers, GitBranch, Cpu, Compass, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { DOSSIER_COUNT, MOCS, dossierFor } from '@/lib/knowledge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MOC_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'moc-gates': GitBranch,
  'moc-sites': Compass,
  'moc-concepts': BookOpen,
  'moc-data': Layers,
  'moc-sessions': Cpu,
};

export const KnowledgeVaultSection: React.FC = () => {
  const [activeMoc, setActiveMoc] = useState(MOCS[0]!);
  const [openConcept, setOpenConcept] = useState<string | null>(null);

  const dossier = openConcept ? dossierFor(activeMoc.id, openConcept) : undefined;

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
          The entire body of LUNARVOID research is organized as an interconnected bi-directional
          knowledge vault. Maps of Content (MOCs) cluster atomic markdown dossiers across geological
          sites, gates, and epistemology.
        </p>
      </div>

      {/* MOC cards selector grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCS.map((moc) => {
          const isSelected = activeMoc.id === moc.id;
          const Icon = MOC_ICONS[moc.id] ?? BookOpen;

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
                  {Object.keys(moc.dossiers).length} DOSSIERS
                </span>
              </div>

              <div>
                <span className="collar-ribbon text-[9px] text-accent">{moc.category}</span>
                <h3 className="font-mono text-xs font-bold text-foreground mt-0.5">{moc.title}</h3>
              </div>

              <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">
                {moc.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active MOC focus detail */}
      <div className="workbench-panel space-y-5 p-5 sm:p-6 rounded-[2px]">
        <div className="flex flex-col justify-between gap-3 border-b border-border/70 pb-3 sm:flex-row sm:items-center">
          <div>
            <span className="collar-ribbon text-[9px]">ACTIVE CLUSTER DOSSIER</span>
            <h3 className="font-display text-base font-bold tracking-tight text-foreground mt-0.5">
              {activeMoc.title}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="self-start rounded-[2px] font-mono text-[9px] tracking-widest text-primary border-primary/50 sm:self-auto uppercase"
          >
            {activeMoc.category}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <span className="collar-ribbon text-[9px]">
            WIKI GRAPH NODES · {DOSSIER_COUNT} CURATED CONCEPT DOSSIERS
          </span>
          <div className="grid grid-cols-1 gap-2.5 font-mono text-xs sm:grid-cols-2">
            {activeMoc.keyConcepts.map((concept) => {
              const hasDossier = !!activeMoc.dossiers[concept];
              return hasDossier ? (
                <button
                  key={concept}
                  type="button"
                  onClick={() => setOpenConcept(concept)}
                  className="group flex items-center justify-between rounded-[2px] border border-border/70 bg-surface/60 p-3 text-left transition-colors hover:border-accent/50 hover:bg-surface/90"
                >
                  <span className="text-xs text-foreground/80 group-hover:text-foreground">
                    [[{concept}]]
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground transition group-hover:text-accent" />
                </button>
              ) : (
                <div
                  key={concept}
                  className="flex items-center justify-between rounded-[2px] border border-border/70 bg-surface/60 p-3"
                >
                  <span className="text-xs text-foreground/80">[[{concept}]]</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={!!dossier} onOpenChange={(o) => !o && setOpenConcept(null)}>
        <DialogContent className="workbench-panel sm:max-w-md">
          {dossier && (
            <>
              <DialogHeader>
                <span className="collar-ribbon text-[9px]">CONCEPT DOSSIER</span>
                <DialogTitle className="font-display text-left">{dossier.title}</DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-left font-sans text-xs leading-relaxed text-muted-foreground">
                {dossier.summary}
              </DialogDescription>
              {dossier.related.length > 0 && (
                <div className="space-y-1.5">
                  <span className="collar-ribbon text-[9px]">RELATED NODES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dossier.related.map((ref) =>
                      activeMoc.dossiers[ref] ? (
                        <button
                          key={ref}
                          type="button"
                          onClick={() => setOpenConcept(ref)}
                          className="rounded-[2px] border border-border/70 bg-surface/60 px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                        >
                          [[{ref}]]
                        </button>
                      ) : (
                        <span
                          key={ref}
                          className="rounded-[2px] border border-border/70 bg-surface/40 px-2 py-1 font-mono text-[10px] text-muted-foreground"
                        >
                          [[{ref}]]
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
