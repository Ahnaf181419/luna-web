import React from 'react';
import { Compass, Search } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FontThemeToggle } from '@/components/system/FontThemeToggle';
import { CATALOG_SIZE } from '@/lib/lunarvoid-data';

function Telemetry({
  label,
  value,
  shortValue,
  tone,
  className = '',
}: {
  label: string;
  value: string;
  shortValue?: string;
  tone?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 rounded-[2px] border border-border/80 bg-surface/70 px-2 sm:px-2.5 py-1 sm:py-1.5 ${className}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone ?? 'bg-muted-foreground'}`} />
      <span className="collar-ribbon text-[9px]">{label}</span>
      <span className="font-mono text-[10px] sm:text-[11px] text-foreground">
        {shortValue ? (
          <>
            <span className="sm:hidden">{shortValue}</span>
            <span className="hidden sm:inline">{value}</span>
          </>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

const NAV_ITEMS: Array<{ value: string; label: string; badge?: string }> = [
  { value: 'overview', label: 'Overview & 3D Globe' },
  { value: 'atlas', label: 'Candidate Atlas', badge: String(CATALOG_SIZE) },
  { value: 'fusion', label: '3D Tube Cutaway & Fusion' },
  { value: 'gates', label: 'Gates & Ledger' },
  { value: 'knowledge', label: 'Knowledge' },
];

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-3 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-primary/50 bg-primary/10">
              <Compass className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="wordmark text-lg text-foreground">LUNARVOID</h1>
              <p className="text-xs text-muted-foreground">
                Calibrated Multi-Evidence Subsurface Inference
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Telemetry
              label="Status"
              value="Gates G0′ / G1 / G2: Final-Pass"
              shortValue="G2 Passed"
              tone="bg-success"
            />
            <Telemetry
              label="Compute"
              value="$0 / $800 ceiling"
              shortValue="$0"
              tone="bg-success"
              className="hidden sm:flex"
            />
            <Telemetry
              label="Cal FP"
              value="3.74 / 10⁴ km²"
              tone="bg-radar"
              className="hidden md:flex"
            />
            <button
              onClick={onOpenCommandPalette}
              className="flex min-h-11 items-center gap-2 rounded border border-border bg-surface/60 px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground touch-action-manipulation"
              title="Search Project Catalog (Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 text-primary" />
              <kbd className="label-mono hidden text-[10px] sm:inline">⌘K</kbd>
            </button>
            <FontThemeToggle />
          </div>
        </div>

        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {NAV_ITEMS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="gap-2 rounded-[2px] border border-border/70 bg-surface/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all min-h-11 touch-action-manipulation data-[state=active]:border-primary/70 data-[state=active]:bg-primary/15 data-[state=active]:text-primary-bright"
            >
              {item.label}
              {item.badge && (
                <span className="rounded-[2px] bg-muted/80 px-1.5 py-0.5 text-[9px] text-muted-foreground font-mono">
                  {item.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </header>
  );
};
