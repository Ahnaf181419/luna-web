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
  // Normalize each of the 4 axes to [0.1, 1.0]
  const morphAxis = Math.min(1.0, Math.max(0.15, depthMeters / 105));
  const radarAxis = Math.min(1.0, Math.max(0.15, (cprRatio - 0.5) / 2.0));
  const gravAxis = Math.min(1.0, Math.max(0.15, Math.abs(bouguerMGal) / 14.0));
  const geomechAxis = Math.min(1.0, Math.max(0.2, score * 0.95));

  const axes = [
    { label: 'Morphometry (Pit Depth/Span)', val: morphAxis },
    { label: 'Radar CPR Contrast', val: radarAxis },
    { label: 'GRAIL Bouguer Deficit', val: gravAxis },
    { label: 'Geomechanical Stability', val: geomechAxis },
  ];

  // SVG Radar Dimensions
  const size = 220;
  const center = size / 2;
  const radius = 80;

  // Compute (x, y) for an axis angle and normalized radius [0, 1]
  const getCoordinates = (index: number, total: number, normVal: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = normVal * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build radar polygon path
  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axes.length, axis.val);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="bg-obsidian-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono">
      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>4-LAYER EVIDENCE RADAR</span>
        </span>
        <span className="text-[10px] text-indigo-400 font-bold">
          Fusion Index: {(score * 100).toFixed(0)}%
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
        
        {/* SVG Radar Spider */}
        <div className="relative w-48 h-48 shrink-0">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {/* Concentric Web Rings */}
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
                  stroke="#1e293b"
                  strokeWidth="0.8"
                  strokeDasharray={rIdx < 3 ? '2 2' : 'none'}
                />
              );
            })}

            {/* Axis Spokes */}
            {axes.map((_, i) => {
              const { x, y } = getCoordinates(i, axes.length, 1.0);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Evidence Polygon Shaded Area */}
            <polygon
              points={polygonPoints}
              fill="rgba(99, 102, 241, 0.25)"
              stroke="#6366f1"
              strokeWidth="1.8"
            />

            {/* Vertex Nodes */}
            {axes.map((axis, i) => {
              const { x, y } = getCoordinates(i, axes.length, axis.val);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#06b6d4"
                  stroke="#070a0f"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend & Readouts */}
        <div className="space-y-1.5 text-[11px] w-full">
          {axes.map((ax, idx) => (
            <div key={idx} className="flex items-center justify-between bg-obsidian-900 px-2.5 py-1 rounded border border-slate-850">
              <span className="text-slate-400 text-[10px] truncate max-w-[140px]">{ax.label}</span>
              <span className="text-cyan-400 font-bold text-[10px]">
                {(ax.val * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
