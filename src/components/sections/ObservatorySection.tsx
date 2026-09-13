import { SitePills } from '@/components/instruments/SitePills';
import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { GlobeClient } from '@/components/lunar/Client3D';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FIRST_SITE, siteById, type SiteId } from '@/lib/lunarvoid-data';

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
  const selectedSite = activeSite ? siteById(activeSite) : FIRST_SITE;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="label-mono">Interactive 3D lunar target observatory</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">Global lunar target directory</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Rotate the 3D globe to explore target coordinates across the lunar near and far sides.
          Click any coordinate pin to inspect its high-resolution LROC NAC DTM dossier; the cursor
          readout tracks live selenographic coordinates.
        </p>
      </div>

      {/* Site quick switcher pills */}
      <SitePills
        label="SELECT TARGET:"
        selectedId={selectedSite.id}
        onSelect={(id) => {
          if (id !== 'ALL') onSelectSite(id);
        }}
      />

      {/* Split screen: globe + dossier */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.35fr_1fr]">
        <GlobeClient activeSite={activeSite} onSelect={onSelectSite} />

        {/* Target dossier */}
        <div className="workbench-panel flex flex-col justify-between gap-6 p-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-border/70 pb-3">
              <div>
                <span className="collar-ribbon text-[9px]">TARGET DOSSIER // LROC NAC</span>
                <h4 className="font-display mt-1 text-xl font-bold tracking-tight text-foreground">
                  {selectedSite.name}
                </h4>
                <span className="font-mono text-xs text-primary">{selectedSite.id}</span>
              </div>
              {selectedSite.primaryAnchor ? (
                <Badge
                  variant="outline"
                  className="rounded-[2px] border-success/60 bg-success/15 font-mono text-[9px] tracking-widest text-success uppercase"
                >
                  GROUND TRUTH ANCHOR
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-[2px] border-border/80 bg-muted/60 font-mono text-[9px] tracking-widest text-muted-foreground uppercase"
                >
                  {selectedSite.geologicalUnit}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-[2px] border border-border/80 bg-surface/70 p-3">
                <p className="collar-ribbon text-[9px]">COORDINATES</p>
                <p className="mt-1 font-mono text-sm font-bold text-foreground">
                  {selectedSite.coordLabel}
                </p>
              </div>
              <div className="rounded-[2px] border border-border/80 bg-surface/70 p-3">
                <p className="collar-ribbon text-[9px]">DTM RESOLUTION</p>
                <p className="mt-1 font-mono text-sm font-bold text-accent">
                  {selectedSite.resolution}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="collar-ribbon text-[9px]">MORPHOLOGICAL & GEOPHYSICAL CONTEXT</p>
              <p className="rounded-[2px] border border-border/80 bg-surface/60 p-3.5 font-sans text-xs leading-relaxed text-foreground/80">
                {selectedSite.description}
              </p>
            </div>

            <div className="flex items-center justify-between px-1 font-mono text-xs text-muted-foreground border-t border-border/50 pt-2">
              <span>Cataloged Features:</span>
              <span className="font-bold text-foreground">
                {selectedSite.candidateCount} candidates
              </span>
            </div>
          </div>

          <Button
            onClick={() => onInspectInAtlas(selectedSite.id)}
            className="w-full rounded-[2px] font-mono text-xs"
          >
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            <span>Filter candidate atlas by {selectedSite.id}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
