import React from 'react';
import { ArrowRight, GitBranch, Compass, BookOpen, Layers, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DOSSIER_COUNT, MOCS } from '@/lib/knowledge';

const MOC_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'moc-gates': GitBranch,
  'moc-sites': Compass,
  'moc-concepts': BookOpen,
  'moc-data': Layers,
  'moc-sessions': Cpu,
};

interface KnowledgePreviewSectionProps {
  onOpenKnowledge: () => void;
}

export const KnowledgePreviewSection: React.FC<KnowledgePreviewSectionProps> = ({
  onOpenKnowledge,
}) => {
  return (
    <section className="panel space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="label-mono">Obsidian knowledge vault</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            Maps of content — {DOSSIER_COUNT} curated concept dossiers
          </h3>
        </div>
        <Button onClick={onOpenKnowledge} variant="outline" size="sm" className="font-mono text-[11px]">
          Open knowledge tab
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MOCS.map((moc) => {
          const Icon = MOC_ICONS[moc.id] ?? BookOpen;
          return (
            <button
              key={moc.id}
              onClick={onOpenKnowledge}
              className="space-y-2 rounded-md border border-border bg-surface/60 p-3 text-left transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-accent" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {Object.keys(moc.dossiers).length} dossiers
                </span>
              </div>
              <p className="text-xs font-medium text-foreground">{moc.shortTitle}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
