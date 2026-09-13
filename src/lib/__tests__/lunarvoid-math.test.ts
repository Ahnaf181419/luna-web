import { describe, expect, it } from 'vitest';
import { calibratedFpRate, targetWeightedScore, verdict } from '@/lib/lunarvoid-data';

describe('targetWeightedScore', () => {
  it('matches the calculator default slider readout (0.62)', () => {
    expect(targetWeightedScore(0.85, 1.6, -8)).toBeCloseTo(0.6187, 3);
  });

  it('clamps to the [0.05, 0.99] bounds', () => {
    expect(targetWeightedScore(0, 0.5, 0)).toBe(0.05);
    expect(targetWeightedScore(99, 99, -99)).toBe(0.99);
  });

  it('is monotonic non-decreasing in each evidence input', () => {
    for (const axis of [
      (t: number) => [t, 1.6, -8] as const,
      (t: number) => [0.85, t, -8] as const,
      (t: number) => [0.85, 1.6, -t] as const,
    ]) {
      let prev = -Infinity;
      for (let i = 0; i <= 10; i++) {
        const [m, c, b] = axis(i / 10);
        const score = targetWeightedScore(m, c, b);
        expect(score).toBeGreaterThanOrEqual(prev);
        prev = score;
      }
    }
  });

  it('treats bouguer deficit symmetrically (Math.abs)', () => {
    expect(targetWeightedScore(0.9, 2, -10)).toBe(targetWeightedScore(0.9, 2, 10));
  });
});

describe('calibratedFpRate', () => {
  it('returns 19.4 at score 0', () => {
    expect(calibratedFpRate(0)).toBeCloseTo(19.4, 6);
  });

  it('floors at 1.8 per 10^4 km^2', () => {
    expect(calibratedFpRate(1.0)).toBe(1.8);
  });

  it('is monotonic non-increasing over [0, 1]', () => {
    let prev = Infinity;
    for (let i = 0; i <= 20; i++) {
      const fp = calibratedFpRate(i / 20);
      expect(fp).toBeLessThanOrEqual(prev);
      prev = fp;
    }
  });
});

describe('verdict thresholds', () => {
  const highConfidence = 'Three independent evidence lines agree';
  const suggestive = 'Evidence is suggestive but one line dominates';
  const ambiguous = 'Ambiguous. The morphology is compatible';
  const belowFloor = 'Below the calibration floor';

  it.each([
    [0.85, highConfidence],
    [0.84, suggestive],
    [0.65, suggestive],
    [0.64, ambiguous],
    [0.4, ambiguous],
    [0.39, belowFloor],
  ])('verdict(%s) bucket', (score, expectedPrefix) => {
    expect(verdict(score)).toContain(expectedPrefix);
  });
});
