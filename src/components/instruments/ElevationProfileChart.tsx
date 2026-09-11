import React, { useState } from 'react';

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

  const totalLength = 260; // meters
  const center = 130; // meters
  const halfSpan = Math.max(20, spanMeters / 2);
  const maxDepth = Math.max(25, depthMeters);

  const points: { x: number; z: number; label: string }[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * totalLength;
    let z = 0;
    let label = 'Surface Regolith';

    const distFromCenter = Math.abs(x - center);
    if (distFromCenter > halfSpan + 15) {
      z = Math.sin(x * 0.15) * 0.4;
      label = 'Undisturbed Mare Surface';
    } else if (distFromCenter > halfSpan) {
      const sagProgress = 1 - (distFromCenter - halfSpan) / 15;
      z = -sagProgress * 3.5;
      label = 'Rim Tension Sag';
    } else if (distFromCenter > halfSpan - 5) {
      const dropProgress = 1 - (distFromCenter - (halfSpan - 5)) / 5;
      z = -3.5 - dropProgress * (maxDepth * 0.7);
      label = 'Vertical Basalt Cliff Lip';
    } else {
      const talusRatio = 1 - distFromCenter / (halfSpan - 5);
      z = -maxDepth + talusRatio * (maxDepth * 0.18);
      label = distFromCenter < 12 ? 'Central Rubble Talus Mound' : 'Subsurface Talus Floor';
    }

    points.push({ x, z, label });
  }

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
    <div className="bg-obsidian-950 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-bold text-zinc-100">DTM ELEVATION TRANSECT: {candidateId} (A — A′)</span>
          <span className="text-zinc-500 text-[10px]">| {resolution} grid</span>
        </div>
        <div className="text-[10px] text-amber-400">
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
            stroke="#52525b"
            strokeDasharray="4 3"
            strokeWidth="1"
          />
          <text x={padLeft - 8} y={scaleY(0) + 3} fill="#71717a" fontSize="9" textAnchor="end">
            0m
          </text>

          <line
            x1={padLeft}
            y1={scaleY(-maxDepth / 2)}
            x2={svgWidth - padRight}
            y2={scaleY(-maxDepth / 2)}
            stroke="#27272a"
            strokeWidth="0.8"
          />
          <text x={padLeft - 8} y={scaleY(-maxDepth / 2) + 3} fill="#52525b" fontSize="8" textAnchor="end">
            -{Math.round(maxDepth / 2)}m
          </text>

          <line
            x1={padLeft}
            y1={scaleY(-maxDepth)}
            x2={svgWidth - padRight}
            y2={scaleY(-maxDepth)}
            stroke="#27272a"
            strokeWidth="0.8"
          />
          <text x={padLeft - 8} y={scaleY(-maxDepth) + 3} fill="#52525b" fontSize="8" textAnchor="end">
            -{maxDepth}m
          </text>

          {/* Shaded subterranean bedrock */}
          <path d={fillD} fill="rgba(24, 24, 28, 0.75)" />

          {/* Warm Solar Gold Elevation Profile Line */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

          {hoverPoint && (
            <>
              <line
                x1={scaleX(hoverPoint.x)}
                y1={padTop}
                x2={scaleX(hoverPoint.x)}
                y2={svgHeight - padBottom}
                stroke="#fbbf24"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <circle
                cx={scaleX(hoverPoint.x)}
                cy={scaleY(hoverPoint.z)}
                r="4.5"
                fill="#f59e0b"
                stroke="#0c0c0e"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {hoverPoint && (
          <div className="mt-2 p-2 bg-obsidian-900 border border-amber-700/80 rounded-lg flex items-center justify-between text-[11px] text-zinc-300">
            <div>
              <span className="text-zinc-500">Distance: </span>
              <span className="text-zinc-100 font-bold">{hoverPoint.x.toFixed(1)}m</span>
            </div>
            <div>
              <span className="text-zinc-500">Elevation: </span>
              <span className={hoverPoint.z < -10 ? 'text-amber-400 font-bold' : 'text-zinc-300'}>
                {hoverPoint.z.toFixed(1)}m
              </span>
            </div>
            <div className="text-zinc-400 hidden sm:block">
              <span>{hoverPoint.label}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
        <span>Transect Start: A (West Rim)</span>
        <span>Collinear Axis: 092° Azimuth</span>
        <span>Transect End: A′ (East Rim)</span>
      </div>
    </div>
  );
};
