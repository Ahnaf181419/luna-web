/*
 * Pure chart geometry extracted from the instrument components so it can be
 * unit-tested. Rendering stays in the components; math lives here.
 */

/* --------------------------------- radar ---------------------------------- */

export const RADAR_SIZE = 220;
export const RADAR_CENTER = RADAR_SIZE / 2;
export const RADAR_RADIUS = 80;

export interface RadarInput {
  score: number;
  cprRatio: number;
  bouguerMGal: number;
  depthMeters: number;
}

export function radarAxisValues({ score, cprRatio, bouguerMGal, depthMeters }: RadarInput) {
  const morphAxis = Math.min(1.0, Math.max(0.15, depthMeters / 105));
  const radarAxis = Math.min(1.0, Math.max(0.15, (cprRatio - 0.5) / 2.0));
  const gravAxis = Math.min(1.0, Math.max(0.15, Math.abs(bouguerMGal) / 14.0));
  const geomechAxis = Math.min(1.0, Math.max(0.2, score * 0.95));
  return [morphAxis, radarAxis, gravAxis, geomechAxis];
}

export function getRadarCoordinates(index: number, total: number, normVal: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = normVal * RADAR_RADIUS;
  return {
    x: RADAR_CENTER + r * Math.cos(angle),
    y: RADAR_CENTER + r * Math.sin(angle),
  };
}

/* --------------------------------- pdf ------------------------------------ */

/**
 * Gaussian posterior-density curve for the likelihood calculator, normalized
 * to its own peak so the mode always sits at 85% of the chart height — the
 * legacy `gaussian / 4.0` scale clipped above the viewBox once sigma shrank
 * past ~0.085 (score > ~0.70).
 */
export function buildPdfCurve(score: number, width: number, height: number, steps = 80) {
  const mu = score;
  const sigma = 0.12 - score * 0.05;
  const peak = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const val = i / steps;
    const gaussian = peak * Math.exp(-0.5 * Math.pow((val - mu) / sigma, 2));
    pts.push({ x: (i / steps) * width, y: height - (gaussian / peak) * (height * 0.85) });
  }
  const d = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return { d, fill: `${d} L ${width} ${height} L 0 ${height} Z` };
}

/* ------------------------------ polyline ---------------------------------- */

export function toPolylinePath(points: Array<{ x: number | string; y: number | string }>): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

/* ------------------------------ transect ---------------------------------- */

export const TRANSECT_LENGTH = 260;
export const TRANSECT_CENTER = 130;

export interface TransectPoint {
  x: number;
  z: number;
  label: string;
}

export function buildTransectPoints(depthMeters: number, spanMeters: number): TransectPoint[] {
  const halfSpan = Math.max(20, spanMeters / 2);
  const maxDepth = Math.max(25, depthMeters);
  const points: TransectPoint[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * TRANSECT_LENGTH;
    let z = 0;
    let label = 'Surface Regolith';

    const distFromCenter = Math.abs(x - TRANSECT_CENTER);
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
  return points;
}
