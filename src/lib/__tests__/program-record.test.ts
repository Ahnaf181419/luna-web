import { describe, expect, it } from 'vitest';
import { BUDGET_LEDGER, GATES, PROGRAM_RECORD, WP05_RECORD } from '@/lib/lunarvoid-data';

/*
 * Pins for the REAL frozen program statistics (WP0.5 paper-draft v1
 * freeze, 2026-10-05, of github.com/amrahman90/luna). These guard against
 * accidental drift of program-level truth displayed on the portal; update
 * them only deliberately, to track the repository.
 */

describe('PROGRAM_RECORD — frozen real program statistics', () => {
  it('points at the research repository', () => {
    expect(PROGRAM_RECORD.repoUrl).toBe('https://github.com/amrahman90/luna');
  });

  it('pins the registry partition', () => {
    expect(PROGRAM_RECORD.registryRows).toBe(278);
    expect(PROGRAM_RECORD.registryActive).toBe(117);
    expect(PROGRAM_RECORD.registrySuperseded).toBe(161);
    expect(PROGRAM_RECORD.registryActive + PROGRAM_RECORD.registrySuperseded).toBe(
      PROGRAM_RECORD.registryRows,
    );
  });

  it('pins tier honesty — every candidate is tier C', () => {
    expect(PROGRAM_RECORD.tierA).toBe(0);
    expect(PROGRAM_RECORD.tierB).toBe(0);
  });

  it('pins the frozen FP bounds (calibration-context)', () => {
    expect(PROGRAM_RECORD.fpRowRate).toBeCloseTo(3.74, 2);
    expect(PROGRAM_RECORD.fpRowCi).toEqual([1.71, 7.1]);
    expect(PROGRAM_RECORD.fpUniqueRate).toBeCloseTo(2.08, 2);
    expect(PROGRAM_RECORD.fpUniqueCi).toEqual([0.67, 4.85]);
    for (const ci of [PROGRAM_RECORD.fpRowCi, PROGRAM_RECORD.fpUniqueCi]) {
      expect(ci[0]).toBeLessThan(ci[1]);
    }
  });

  it('pins scope, budget, and program scale', () => {
    expect(PROGRAM_RECORD.dtmsOnDisk).toBe(21);
    expect(PROGRAM_RECORD.goodTierPopulation).toBe(649);
    expect(PROGRAM_RECORD.areaSearchedKm2).toBe(24063);
    // sessionsRun = max numbered "execution session N" + dated 2026-10-05 entries = 68 + 2 = 70
    expect(PROGRAM_RECORD.sessionsRun).toBe(70);
    expect(PROGRAM_RECORD.testsGreen).toBe(124);
    expect(PROGRAM_RECORD.spendUsd).toBe(0);
    expect(PROGRAM_RECORD.ceilingUsd).toBe(800);
    expect(PROGRAM_RECORD.tier1CeilingUsd).toBe(150);
  });

  it('pins the WP0.5 paper-draft freeze label (not R3)', () => {
    expect(PROGRAM_RECORD.frozenAsOf).toBe('WP0.5 paper draft v1 · 2026-10-05');
    expect(PROGRAM_RECORD.frozenAsOf).not.toContain('R3 terminal report');
  });
});

describe('WP05_RECORD — WP0.5 forward-model numbers', () => {
  it('papers the preprint status (text-only teaser, no link)', () => {
    expect(WP05_RECORD.paperStatus).toBe('preprint drafted · submission in preparation');
    // Claim discipline: never claim detection.
    expect(WP05_RECORD.paperStatus).not.toMatch(/detected|discovered|confirmed/i);
  });

  it('pins the per-DTM detection-floor band (B2-consistent: 1.97–4.39 m, NEVER 2.30 lower bound)', () => {
    expect(WP05_RECORD.floorBandM).toEqual([1.97, 4.39]);
    expect(WP05_RECORD.floorBandM[0]).toBeLessThan(WP05_RECORD.floorBandM[1]!);
    expect(WP05_RECORD.floorMedianM).toBeCloseTo(3.31, 2);
    expect(WP05_RECORD.dtmsProcessed).toBe(14);
    expect(WP05_RECORD.floorOutlierNote).toContain('KINGCRATER2');
    expect(WP05_RECORD.floorOutlierNote).toContain('1.97');
  });

  it('pins the 7/7 anchor reproduction (distinct from the 7/8 Z2 pit-recovery frozen at R3)', () => {
    expect(WP05_RECORD.anchorsReproduced).toBe('7/7');
    expect(WP05_RECORD.anchorMaxRelErrPct.rho2900).toBeCloseTo(3.48, 2);
    expect(WP05_RECORD.anchorMaxRelErrPct.rho3000).toBeCloseTo(1.1, 2);
  });

  it('pins the gap-orders range and the restricted-intact median (the honest single-DTM-claimability story)', () => {
    expect(WP05_RECORD.gapOrdersRange).toEqual([1, 5]);
    expect(WP05_RECORD.gapOrdersRange[0]).toBeLessThan(WP05_RECORD.gapOrdersRange[1]!);
    // gapMedianIntactOrders ~ 2 (paper headline framing, approximate)
    expect(WP05_RECORD.gapMedianIntactOrders).toBeGreaterThanOrEqual(1.5);
    expect(WP05_RECORD.gapMedianIntactOrders).toBeLessThanOrEqual(2.5);
    // gapMedianRestrictedIntactOrders = 2.95 (paper §3.2)
    expect(WP05_RECORD.gapMedianRestrictedIntactOrders).toBeCloseTo(2.95, 2);
  });

  it('pins the 3-regime model and the honest exceptions (claim discipline preserved)', () => {
    expect(WP05_RECORD.regimes).toBe(3);
    expect(WP05_RECORD.sweepRows).toBe(2880);
    // The honest exception list is required content — it names the one anchor above the floor
    expect(WP05_RECORD.honestExceptions).toContain('L=500 m');
    expect(WP05_RECORD.honestExceptions).toContain('9.18 m');
    expect(WP05_RECORD.honestExceptions).toContain('30/360');
    // No detection language in the honest-exceptions string
    expect(WP05_RECORD.honestExceptions).not.toMatch(/detected a lava tube|discovered/i);
  });
});

describe('GATES — real gate record', () => {
  it('has exactly the three FINAL-PASS gates with real dates', () => {
    expect(GATES).toHaveLength(3);
    expect(GATES.map((g) => g.id)).toEqual(['G0-PRIME', 'G1', 'G2']);
    expect(GATES.every((g) => g.status === 'FINAL-PASS')).toBe(true);
    expect(GATES.map((g) => g.datePassed)).toEqual(['2026-08-21', '2026-08-22', '2026-08-24']);
  });

  it('every gate is zero-spend with real criteria verdicts', () => {
    for (const gate of GATES) {
      expect(gate.spend).toBe(0);
      expect(gate.criteria.length).toBeGreaterThanOrEqual(4);
      for (const c of gate.criteria) {
        expect([
          'PASS',
          'PARTIAL',
          'DEMONSTRATION',
          'DEFERRED',
          'DEFERRED-DTM-GAP',
          'NOT MEASURED',
        ]).toContain(c.verdict);
        expect(c.detail.length).toBeGreaterThan(20);
      }
    }
  });

  it('no gate claims a survey-grade FP rate (claim discipline)', () => {
    const allDetails = GATES.flatMap((g) => [g.summary, ...g.criteria.map((c) => c.detail)]).join(
      ' ',
    );
    expect(allDetails).toContain('calibration-context');
  });
});

describe('BUDGET_LEDGER — real spend record', () => {
  it('is zero-spend against the real ceilings', () => {
    expect(BUDGET_LEDGER).toHaveLength(3);
    expect(BUDGET_LEDGER.every((b) => b.spent === 0)).toBe(true);
    // session count is 70 post-WP0.5 (was 58 at R3)
    expect(BUDGET_LEDGER[0]?.status).toContain('70 SESSIONS');
    expect(BUDGET_LEDGER[1]?.allocation).toBe(150);
    expect(BUDGET_LEDGER[2]?.allocation).toBe(800);
  });
});
