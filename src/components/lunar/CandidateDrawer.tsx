import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { siteById, STATUS_TONE, type Candidate } from '@/lib/lunarvoid-data';
import { ElevationProfileChart } from '@/components/instruments/ElevationProfileChart';
import { EvidenceRadarChart } from '@/components/instruments/EvidenceRadarChart';

function Layer({
  tag,
  title,
  body,
  tone,
}: {
  tag: string;
  title: string;
  body: string;
  tone: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface/60 p-3">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone}`} />
        <span className="label-mono">{tag}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export function CandidateDrawer({
  candidate,
  onOpenChange,
  onOpenInCalculator,
}: {
  candidate: Candidate | null;
  onOpenChange: (open: boolean) => void;
  onOpenInCalculator?: (candidate: Candidate) => void;
}) {
  const site = candidate ? siteById(candidate.site) : null;

  return (
    <Sheet open={!!candidate} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {candidate && site && (
          <>
            <SheetHeader className="space-y-3 pr-8 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`font-mono text-[10px] tracking-widest ${STATUS_TONE[candidate.status]}`}
                >
                  {candidate.status}
                </Badge>
                <span className="label-mono">{candidate.site}</span>
              </div>
              <SheetTitle className="font-mono text-xl">{candidate.id}</SheetTitle>
              <SheetDescription className="text-sm">
                {site.name} — {candidate.coordLabel} · {candidate.morphology}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 pt-4 pb-8">
              <div className="rounded-md border border-border bg-surface/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="label-mono">Likelihood score</span>
                  <span className="font-mono text-lg text-primary">
                    {candidate.score.toFixed(2)}
                  </span>
                </div>
                <Progress value={candidate.score * 100} className="mt-2 h-1.5" />
              </div>

              <div>
                <p className="label-mono">DTM product</p>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {site.dtm} ({site.resolution})
                </p>
              </div>

              <ElevationProfileChart
                candidateId={candidate.id}
                depthMeters={candidate.depthMeters}
                spanMeters={candidate.spanMeters}
                resolution={site.resolution}
              />

              <EvidenceRadarChart
                score={candidate.score}
                cprRatio={candidate.cprRatio}
                bouguerMGal={candidate.bouguerMGal}
                depthMeters={candidate.depthMeters}
              />

              {onOpenInCalculator && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-[2px] font-mono text-[10px] tracking-widest"
                  onClick={() => onOpenInCalculator(candidate)}
                >
                  <Calculator className="h-3 w-3" />
                  OPEN IN LIKELIHOOD CALCULATOR
                </Button>
              )}

              <div className="space-y-3">
                <p className="label-mono">Evidence layers</p>
                <Layer
                  tag="Layer 1 · Surface morphometry"
                  title="Pit geometry"
                  body={candidate.pit}
                  tone="bg-primary"
                />
                <Layer
                  tag="Layer 2 · Mini-RF"
                  title="Circular polarisation ratio anomaly"
                  body={candidate.cpr}
                  tone="bg-radar"
                />
                <Layer
                  tag="Layer 3 · GRAIL"
                  title="Bouguer mass deficit"
                  body={candidate.bouguer}
                  tone="bg-gravity"
                />
              </div>

              <div>
                <p className="label-mono">Inspection notes</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {candidate.notes}
                </p>
              </div>

              <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <p className="label-mono text-warning">Backlog verification</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {candidate.inspection}
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
