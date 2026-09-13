import React from 'react';
import {
  RADAR_SIZE,
  getRadarCoordinates,
  radarAxisValues,
} from '@/lib/chart-math';
import { CHART } from '@/lib/chart-theme';

interface EvidenceRadarChartProps {
  score: number;
  cprRatio: number;
  bouguerMGal: number;
  depthMeters?: number;
}

export const EvidenceRadarChart: React.FC<EvidenceRadarChartProps> = ({
  score,
  cprRatio,
  bouguerMGal,
  depthMeters = 50,
}) => {
  const axes = [
    { label: 'Morphometry (Depth/Span)', val: 0 },
    { label: 'Radar CPR Contrast', val: 0 },
    { label: 'GRAIL Bouguer Deficit', val: 0 },
    { label: 'Geomechanical Stability', val: 0 },
  ].map((axis, i) => ({
    ...axis,
    val: radarAxisValues({ score, cprRatio, bouguerMGal, depthMeters })[i] ?? 0,
  }));

  const size = RADAR_SIZE;
  const center = size / 2;

  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getRadarCoordinates(i, axes.length, axis.val);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="rounded-lg border border-border bg-card/80 p-4 space-y-2 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="label-mono flex items-center gap-1.5 text-foreground">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>4-Layer Evidence Radar</span>
        </span>
        <span className="text-[10px] text-primary font-bold">
          Fusion Index: {(score * 100).toFixed(0)}%
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">

        <div className="relative w-48 h-48 shrink-0">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {[0.25, 0.5, 0.75, 1.0].map((ringLevel, rIdx) => {
              const ringPoints = axes
                .map((_, i) => {
                  const { x, y } = getRadarCoordinates(i, axes.length, ringLevel);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ');
              return (
                <polygon
                  key={rIdx}
                  points={ringPoints}
                  fill="none"
                  stroke={CHART.grid}
                  strokeWidth="0.8"
                  strokeDasharray={rIdx < 3 ? '2 2' : 'none'}
                />
              );
            })}

            {axes.map((_, i) => {
              const { x, y } = getRadarCoordinates(i, axes.length, 1.0);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={CHART.gridStrong}
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Shaded telemetry amber radar polygon */}
            <polygon
              points={polygonPoints}
              fill={CHART.primaryFill}
              stroke={CHART.primary}
              strokeWidth="1.8"
            />

            {axes.map((axis, i) => {
              const { x, y } = getRadarCoordinates(i, axes.length, axis.val);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={CHART.primaryBright}
                  stroke={CHART.voidInk}
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        <div className="space-y-1.5 text-[11px] w-full">
          {axes.map((ax, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 bg-surface/60 px-2.5 py-1 rounded border border-border">
              <span className="text-muted-foreground text-[10px] truncate flex-1">{ax.label}</span>
              <span className="text-primary font-bold text-[10px] shrink-0">
                {(ax.val * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
