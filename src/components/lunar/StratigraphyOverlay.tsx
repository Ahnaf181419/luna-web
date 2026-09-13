import { lazy, Suspense, type ComponentType } from 'react';
import type { Candidate } from '@/lib/lunarvoid-data';

const TubeCutaway = lazy(() => import('./TubeCutaway')) as ComponentType<{
  depthMeters?: number;
  spanMeters?: number;
}>;

/**
 * Cutaway instrument: source's 3D cross-section with target's stratigraphy
 * badges overlaid on the right edge (surface / skylight / conduit depths).
 * Optionally driven by a candidate's own depth/span geometry.
 */
export function StratigraphyOverlay({ candidate }: { candidate?: Candidate | null }) {
  return (
    <div className="relative h-[460px] w-full sm:h-[560px]">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center rounded-lg border border-border bg-surface/40">
            <span className="label-mono animate-pulse">Building cross-section…</span>
          </div>
        }
      >
        <TubeCutaway
          depthMeters={candidate?.depthMeters ?? 105}
          spanMeters={candidate?.spanMeters ?? 80}
        />
      </Suspense>

      {/* Geological layer badges positioned below the top controls bar */}
      <div className="pointer-events-none absolute right-3 top-14 z-10 hidden flex-col items-end gap-1 font-mono text-[10px] sm:flex">
        <div className="rounded border border-border bg-background/80 px-2 py-0.5 text-muted-foreground backdrop-blur-md">
          ● Surface regolith (~5–15 m)
        </div>
        <div className="rounded border border-radar/40 bg-background/80 px-2 py-0.5 text-radar backdrop-blur-md">
          ● Vertical pit skylight (−{candidate?.depthMeters ?? 105} m)
        </div>
        <div className="rounded border border-primary/40 bg-background/80 px-2 py-0.5 text-primary backdrop-blur-md">
          ● Intact basalt conduit (span ~{candidate?.spanMeters ?? 80} m)
        </div>
      </div>
    </div>
  );
}
