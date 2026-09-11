import React from 'react';

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
  const morphAxis = Math.min(1.0, Math.max(0.15, depthMeters / 105));
  const radarAxis = Math.min(1.0, Math.max(0.15, (cprRatio - 0.5) / 2.0));
  const gravAxis = Math.min(1.0, Math.max(0.15, Math.abs(bouguerMGal) / 14.0));
  const geomechAxis = Math.min(1.0, Math.max(0.2, score * 0.95));

  const axes = [
    { label: 'Morphometry (Depth/Span)', val: morphAxis },
    { label: 'Radar CPR Contrast', val: radarAxis },
    { label: 'GRAIL Bouguer Deficit', val: gravAxis },
    { label: 'Geomechanical Stability', val: geomechAxis },
  ];

  const size = 220;
  const center = size / 2;
  const radius = 80;

  const getCoordinates = (index: number, total: number, normVal: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = normVal * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axes.length, axis.val);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="bg-obsidian-950 border border-zinc-800 rounded-xl p-4 space-y-2 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>4-LAYER EVIDENCE RADAR</span>
        </span>
        <span className="text-[10px] text-amber-400 font-bold">
          Fusion Index: {(score * 100).toFixed(0)}%
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
        
        <div className="relative w-48 h-48 shrink-0">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {[0.25, 0.5, 0.75, 1.0].map((ringLevel, rIdx) => {
              const ringPoints = axes
                .map((_, i) => {
                  const { x, y } = getCoordinates(i, axes.length, ringLevel);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ');
              return (
                <polygon
                  key={rIdx}
                  points={ringPoints}
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="0.8"
                  strokeDasharray={rIdx < 3 ? '2 2' : 'none'}
                />
              );
            })}

            {axes.map((_, i) => {
              const { x, y } = getCoordinates(i, axes.length, 1.0);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#3f3f46"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Shaded Solar Gold Radar Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(245, 158, 11, 0.2)"
              stroke="#f59e0b"
              strokeWidth="1.8"
            />

            {axes.map((axis, i) => {
              const { x, y } = getCoordinates(i, axes.length, axis.val);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#fbbf24"
                  stroke="#0c0c0e"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        <div className="space-y-1.5 text-[11px] w-full">
          {axes.map((ax, idx) => (
            <div key={idx} className="flex items-center justify-between bg-obsidian-900 px-2.5 py-1 rounded border border-zinc-800">
              <span className="text-zinc-400 text-[10px] truncate max-w-[140px]">{ax.label}</span>
              <span className="text-amber-400 font-bold text-[10px]">
                {(ax.val * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
