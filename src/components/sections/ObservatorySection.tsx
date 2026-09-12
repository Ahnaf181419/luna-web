import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { GlobeClient } from '@/components/lunar/Client3D';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SITES, siteById, type SiteId } from '@/lib/lunarvoid-data';

interface ObservatorySectionProps {
  activeSite: SiteId | null;
  onSelectSite: (id: SiteId) => void;
  onInspectInAtlas: (id: SiteId) => void;
}

export const ObservatorySection: React.FC<ObservatorySectionProps> = ({
  activeSite,
  onSelectSite,
  onInspectInAtlas,
}) => {
  const selectedSite = activeSite ? siteById(activeSite) : SITES[0]!;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="label-mono">Interactive 3D lunar target observatory</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">
          Global lunar target directory
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Rotate the 3D globe to explore target coordinates across the lunar near and far
          sides. Click any coordinate pin to inspect its high-resolution LROC NAC DTM
          dossier; the cursor readout tracks live selenographic coordinates.
        </p>
      </div>

      {/* Site quick switcher pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="label-mono mr-1">Select target</span>
        {SITES.map((site) => {
          const isSelected = selectedSite.id === site.id;
          return (
            <button
              key={site.id}
              onClick={() => onSelectSite(site.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] tracking-widest transition-colors ${
                isSelected
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-border bg-surface/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {site.primaryAnchor && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              )}
              <span>{site.id}</span>
              <span className="hidden text-[10px] text-muted-foreground sm:inline">
                ({site.candidateCount})
              </span>
            </button>
          );
        })}
      </div>

      {/* Split screen: globe + dossier */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.35fr_1fr]">
        <GlobeClient activeSite={activeSite} onSelect={onSelectSite} />

        {/* Target dossier */}
        <div className="panel flex flex-col justify-between gap-6 p-6">
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="label-mono block">Target dossier</span>
                <h4 className="mt-1 text-xl font-bold text-foreground">{selectedSite.name}</h4>
                <span className="font-mono text-xs text-primary">{selectedSite.id}</span>
              </div>
              {selectedSite.primaryAnchor ? (
                <Badge
                  variant="outline"
                  className="border-success/50 bg-success/15 font-mono text-[10px] tracking-widest text-success"
                >
                  BENCHMARK ANCHOR
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-border bg-muted font-mono text-[10px] tracking-widest text-muted-foreground"
                >
                  {selectedSite.geologicalUnit}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border bg-surface/60 p-3.5">
                <p className="label-mono">Lunar coordinates</p>
                <p className="mt-1 font-mono text-sm font-bold text-foreground">
                  {selectedSite.coordLabel}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface/60 p-3.5">
                <p className="label-mono">NAC DTM resolution</p>
                <p className="mt-1 font-mono text-sm font-bold text-accent">
                  {selectedSite.resolution}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="label-mono">Morphological context & scientific value</p>
              <p className="rounded-md border border-border bg-surface/60 p-4 text-xs leading-relaxed text-foreground/80">
                {selectedSite.description}
              </p>
            </div>

            <div className="flex items-center justify-between px-1 font-mono text-xs text-muted-foreground">
              <span>Features cataloged at target</span>
              <span className="font-bold text-foreground">
                {selectedSite.candidateCount} candidates
              </span>
            </div>
          </div>

          <Button
            onClick={() => onInspectInAtlas(selectedSite.id)}
            className="w-full font-mono text-xs"
          >
            <MapPin className="h-4 w-4" />
            <span>Filter candidate atlas by {selectedSite.id}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
