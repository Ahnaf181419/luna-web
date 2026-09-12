import React from 'react';
import { ArrowRight, GitBranch, Compass, BookOpen, Layers, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOC_SUMMARY = [
  { icon: GitBranch, title: 'Gates & decisions', notes: 14 },
  { icon: Compass, title: 'Sites & candidates', notes: 28 },
  { icon: BookOpen, title: 'Concepts & methods', notes: 22 },
  { icon: Layers, title: 'Data & code', notes: 19 },
  { icon: Cpu, title: 'Sessions & ops', notes: 24 },
];

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
            Maps of content — 107 atomic notes
          </h3>
        </div>
        <Button onClick={onOpenKnowledge} variant="outline" size="sm" className="font-mono text-[11px]">
          Open knowledge tab
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MOC_SUMMARY.map((moc) => (
          <button
            key={moc.title}
            onClick={onOpenKnowledge}
            className="space-y-2 rounded-md border border-border bg-surface/60 p-3 text-left transition-colors hover:border-primary/40"
          >
            <moc.icon className="h-4 w-4 text-accent" />
            <div className="font-mono text-xs font-semibold text-foreground">{moc.title}</div>
            <div className="label-mono">{moc.notes} atomic notes</div>
          </button>
        ))}
      </div>
    </section>
  );
};
