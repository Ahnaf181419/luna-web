import React from 'react';
import { SITES } from '@/lib/lunarvoid-data';

interface SitePillsProps {
  label: string;
  labelClassName?: string;
  selectedId: string;
  onSelect: (id: 'ALL' | (typeof SITES)[number]['id']) => void;
  includeAll?: boolean;
  /** Observatory variant: anchor pulse dot + candidate count per pill. */
  showSiteMeta?: boolean;
}

export const SitePills: React.FC<SitePillsProps> = ({
  label,
  labelClassName = 'collar-ribbon text-[10px] mr-1',
  selectedId,
  onSelect,
  includeAll = false,
  showSiteMeta = false,
}) => {
  const ids = (includeAll ? ['ALL', ...SITES.map((s) => s.id)] : SITES.map((s) => s.id)) as Array<
    'ALL' | (typeof SITES)[number]['id']
  >;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={labelClassName}>{label}</span>
      {ids.map((id) => {
        const site = SITES.find((s) => s.id === id);
        const isSelected = selectedId === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`${showSiteMeta ? 'flex items-center gap-1.5 ' : ''}rounded-[2px] border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-all ${
              isSelected
                ? 'border-primary/80 bg-primary/20 text-primary font-bold'
                : 'border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {showSiteMeta && site?.primaryAnchor && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            )}
            <span>{id}</span>
            {showSiteMeta && site && (
              <span className="hidden text-[9px] text-muted-foreground sm:inline">
                [{site.candidateCount}]
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
