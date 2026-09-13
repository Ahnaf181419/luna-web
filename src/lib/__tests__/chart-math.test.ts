import { describe, expect, it } from 'vitest'
import {
  RADAR_CENTER,
  RADAR_SIZE,
  buildPdfCurve,
  buildTransectPoints,
  getRadarCoordinates,
  radarAxisValues,
} from '@/lib/chart-math'

describe('radarAxisValues', () => {
  it('keeps every axis within its clamp floor and 1.0', () => {
    const vals = radarAxisValues({ score: 0.5, cprRatio: 0.1, bouguerMGal: 0, depthMeters: 0 })
    for (const v of vals) expect(v).toBeGreaterThanOrEqual(0.15)
    for (const v of vals) expect(v).toBeLessThanOrEqual(1.0)
  })

  it('floors morphometry at 0.15 for zero depth', () => {
    expect(radarAxisValues({ score: 0.5, cprRatio: 2, bouguerMGal: -10, depthMeters: 0 })[0]).toBe(0.15)
  })

  it('saturates morphometry at 1.0 for depth >= 105 m', () => {
    expect(radarAxisValues({ score: 0.5, cprRatio: 2, bouguerMGal: -10, depthMeters: 105 })[0]).toBe(1.0)
  })

  it('uses |bouguer| (negative deficits count)', () => {
    const neg = radarAxisValues({ score: 0.5, cprRatio: 2, bouguerMGal: -7, depthMeters: 50 })[2]
    const pos = radarAxisValues({ score: 0.5, cprRatio: 2, bouguerMGal: 7, depthMeters: 50 })[2]
    expect(neg).toBe(pos)
    expect(neg).toBeCloseTo(0.5, 6)
  })
})

describe('getRadarCoordinates', () => {
  it("places axis 0 at 12 o'clock for full value", () => {
    const { x, y } = getRadarCoordinates(0, 4, 1.0)
    expect(x).toBeCloseTo(RADAR_CENTER, 6)
    expect(y).toBeCloseTo(RADAR_CENTER - 80, 6)
  })

  it('returns the center for zero value', () => {
    const { x, y } = getRadarCoordinates(1, 4, 0)
    expect(x).toBeCloseTo(RADAR_CENTER, 6)
    expect(y).toBeCloseTo(RADAR_CENTER, 6)
  })

  it('stays inside the viewBox for values <= 1', () => {
    for (let i = 0; i < 4; i++) {
      const { x, y } = getRadarCoordinates(i, 4, 1.0)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(RADAR_SIZE)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(RADAR_SIZE)
    }
  })
})

describe('buildPdfCurve', () => {
  const W = 420
  const H = 100

  const yValues = (d: string) =>
    [...d.matchAll(/[ML] [-\d.]+ ([-\d.]+)/g)].map((m) => parseFloat(m[1]!))

  it.each([0.05, 0.5, 0.7, 0.9, 0.99])('keeps every point inside the viewBox at score %s', (score) => {
    const ys = yValues(buildPdfCurve(score, W, H).d)
    expect(ys.length).toBe(81)
    for (const y of ys) {
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(H)
    }
  })

  it('peaks at 85% of the chart height (mode at y = 0.15 * H)', () => {
    const ys = yValues(buildPdfCurve(0.5, W, H).d)
    expect(Math.min(...ys)).toBeCloseTo(H * 0.15, 1)
  })

  it('closes the fill path along the baseline', () => {
    const { fill } = buildPdfCurve(0.6, W, H)
    expect(fill).toContain(`L ${W} ${H}`)
    expect(fill).toContain(`L 0 ${H} Z`)
  })
})

describe('buildTransectPoints', () => {
  it('produces 61 samples spanning [0, 260] m', () => {
    const pts = buildTransectPoints(85, 70)
    expect(pts).toHaveLength(61)
    expect(pts[0]!.x).toBeCloseTo(0, 6)
    expect(pts[60]!.x).toBeCloseTo(260, 6)
  })

  it('reaches the talus floor near the center', () => {
    const depth = 85
    const pts = buildTransectPoints(depth, 70)
    const mid = pts[Math.floor(pts.length / 2)]!
    expect(mid.z).toBeLessThanOrEqual(-depth + 0.18 * depth + 1e-9)
    expect(mid.z).toBeGreaterThanOrEqual(-depth - 1e-9)
  })

  it('undisturbed surface stays within ±0.4 m at the transect ends', () => {
    const pts = buildTransectPoints(85, 70)
    expect(Math.abs(pts[0]!.z)).toBeLessThanOrEqual(0.4 + 1e-9)
    expect(Math.abs(pts[60]!.z)).toBeLessThanOrEqual(0.4 + 1e-9)
    expect(pts[0]!.label).toBe('Undisturbed Mare Surface')
  })

  it('floors depth at 25 m and span at 40 m', () => {
    const pts = buildTransectPoints(10, 10)
    const mid = pts[Math.floor(pts.length / 2)]!
    expect(mid.z).toBeCloseTo(-25 * (1 - 0.18), 1)
    const labels = new Set(pts.map((p) => p.label))
    expect(labels).toContain('Subsurface Talus Floor')
  })
})
