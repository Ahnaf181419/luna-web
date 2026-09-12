import React from "react";
import { Compass, Search } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATALOG_SIZE } from "@/lib/lunarvoid-data";

function Telemetry({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-border bg-surface/60 px-2.5 py-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${tone ?? "bg-muted-foreground"}`} />
      <span className="label-mono">{label}</span>
      <span className="font-mono text-[11px] text-foreground">{value}</span>
    </div>
  );
}

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

const NAV_ITEMS: Array<{ value: string; label: string; badge?: string }> = [
  { value: "overview", label: "Overview & 3D Globe" },
  { value: "atlas", label: "Candidate Atlas", badge: String(CATALOG_SIZE) },
  { value: "fusion", label: "3D Tube Cutaway & Fusion" },
  { value: "gates", label: "Gates & Ledger" },
  { value: "knowledge", label: "Knowledge" },
];

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-primary/40 bg-primary/10">
              <Compass className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold tracking-[0.22em] text-foreground">
                LUNARVOID
              </h1>
              <p className="text-xs text-muted-foreground">
                Calibrated Multi-Evidence Subsurface Inference
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Telemetry label="Status" value="Gate G2: Draft for Review" tone="bg-warning" />
            <Telemetry label="Compute" value="$0 / $800 ceiling" tone="bg-success" />
            <Telemetry label="Cal FP" value="6.06 / 10⁴ km²" tone="bg-radar" />
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 rounded border border-border bg-surface/60 px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              title="Search Project Catalog (Cmd+K)"
            >
              <Search className="h-3.5 w-3.5 text-primary" />
              <kbd className="label-mono hidden text-[10px] sm:inline">⌘K</kbd>
            </button>
          </div>
        </div>

        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {NAV_ITEMS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="gap-2 rounded border border-border bg-surface/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest data-[state=active]:border-primary/50 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              {item.label}
              {item.badge && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
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
