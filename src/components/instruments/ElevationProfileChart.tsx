import React, { useState } from 'react';
import { TRANSECT_LENGTH, buildTransectPoints } from '@/lib/chart-math';
import { CHART } from '@/lib/chart-theme';

interface ElevationProfileChartProps {
  depthMeters?: number;
  spanMeters?: number;
  candidateId: string;
  resolution: string;
}

export const ElevationProfileChart: React.FC<ElevationProfileChartProps> = ({
  depthMeters = 85,
  spanMeters = 70,
  candidateId,
  resolution,
}) => {
  const [hoverPoint, setHoverPoint] = useState<{ x: number; z: number; label: string } | null>(null);

  const maxDepth = Math.max(25, depthMeters);
  const points = buildTransectPoints(depthMeters, spanMeters);
  const totalLength = TRANSECT_LENGTH;

  const svgWidth = 540;
  const svgHeight = 160;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 25;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const minZ = -maxDepth * 1.15;
  const maxZ = 8;

  const scaleX = (x: number) => padLeft + (x / totalLength) * plotWidth;
  const scaleY = (z: number) => padTop + ((maxZ - z) / (maxZ - minZ)) * plotHeight;

  const pathD = points.reduce((acc, p, idx) => {
    const sx = scaleX(p.x).toFixed(1);
    const sy = scaleY(p.z).toFixed(1);
    return idx === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
  }, '');

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const fillD = `${pathD} L ${scaleX(lastPoint.x).toFixed(1)} ${scaleY(minZ).toFixed(1)} L ${scaleX(firstPoint.x).toFixed(1)} ${scaleY(minZ).toFixed(1)} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const clampedX = Math.max(padLeft, Math.min(svgWidth - padRight, mouseX));
    const normalizedRatio = (clampedX - padLeft) / plotWidth;
    const targetMeter = normalizedRatio * totalLength;

    let closest = points[0];
    let minDiff = Infinity;
    points.forEach((p) => {
      const diff = Math.abs(p.x - targetMeter);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    });

    setHoverPoint(closest);
  };

  return (
    <div className="rounded-lg border border-border bg-card/80 p-4 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center space-x-2 label-mono text-foreground">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>DTM Elevation Transect: {candidateId} (A — A′)</span>
          <span className="text-muted-foreground text-[10px]">| {resolution} grid</span>
        </div>
        <div className="text-[10px] text-primary">
          Span: ~{spanMeters}m • Max Drop: -{maxDepth}m
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <line
            x1={padLeft}
            y1={scaleY(0)}
            x2={svgWidth - padRight}
            y2={scaleY(0)}
            stroke={CHART.label}
            strokeDasharray="4 3"
            strokeWidth="1"
          />
          <text x={padLeft - 8} y={scaleY(0) + 3} fill={CHART.label} fontSize="9" textAnchor="end">
            0m
          </text>

          <line
            x1={padLeft}
            y1={scaleY(-maxDepth / 2)}
            x2={svgWidth - padRight}
            y2={scaleY(-maxDepth / 2)}
            stroke={CHART.grid}
            strokeWidth="0.8"
          />
          <text x={padLeft - 8} y={scaleY(-maxDepth / 2) + 3} fill={CHART.labelDim} fontSize="8" textAnchor="end">
            -{Math.round(maxDepth / 2)}m
          </text>

          <line
            x1={padLeft}
            y1={scaleY(-maxDepth)}
            x2={svgWidth - padRight}
            y2={scaleY(-maxDepth)}
            stroke={CHART.grid}
            strokeWidth="0.8"
          />
          <text x={padLeft - 8} y={scaleY(-maxDepth) + 3} fill={CHART.labelDim} fontSize="8" textAnchor="end">
            -{maxDepth}m
          </text>

          {/* Shaded subterranean bedrock */}
          <path d={fillD} fill={CHART.bedrockFill} />

          {/* Telemetry amber elevation profile */}
          <path d={pathD} fill="none" stroke={CHART.primary} strokeWidth="2" strokeLinecap="round" />

          {hoverPoint && (
            <>
              <line
                x1={scaleX(hoverPoint.x)}
                y1={padTop}
                x2={scaleX(hoverPoint.x)}
                y2={svgHeight - padBottom}
                stroke={CHART.primaryBright}
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <circle
                cx={scaleX(hoverPoint.x)}
                cy={scaleY(hoverPoint.z)}
                r="4.5"
                fill={CHART.primary}
                stroke={CHART.voidInk}
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {hoverPoint && (
          <div className="mt-2 p-2 bg-surface/60 border border-primary/30 rounded-md flex items-center justify-between text-[11px] text-foreground">
            <div>
              <span className="text-muted-foreground">Distance: </span>
              <span className="text-foreground font-bold">{hoverPoint.x.toFixed(1)}m</span>
            </div>
            <div>
              <span className="text-muted-foreground">Elevation: </span>
              <span className={hoverPoint.z < -10 ? 'text-primary font-bold' : 'text-foreground'}>
                {hoverPoint.z.toFixed(1)}m
              </span>
            </div>
            <div className="text-muted-foreground hidden sm:block">
              <span>{hoverPoint.label}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 label-mono pt-1">
        <span>Transect Start: A (West Rim)</span>
        <span className="hidden sm:inline">Collinear Axis: 092° Azimuth</span>
        <span>Transect End: A′ (East Rim)</span>
      </div>
    </div>
  );
};
