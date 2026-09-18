import { describe, expect, it } from 'vitest';
import { BUDGET_LEDGER, GATES, PROGRAM_RECORD } from '@/lib/lunarvoid-data';

/*
 * Pins for the REAL frozen program statistics (R3 terminal report,
 * 2026-09-12, HEAD c5be2a2 of github.com/amrahman90/luna). These guard
 * against accidental drift of program-level truth displayed on the portal;
 * update them only deliberately, to track the repository.
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
    expect(PROGRAM_RECORD.sessionsRun).toBe(58);
    expect(PROGRAM_RECORD.testsGreen).toBe(124);
    expect(PROGRAM_RECORD.spendUsd).toBe(0);
    expect(PROGRAM_RECORD.ceilingUsd).toBe(800);
    expect(PROGRAM_RECORD.tier1CeilingUsd).toBe(150);
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
    expect(BUDGET_LEDGER[0]?.status).toContain('58 SESSIONS');
    expect(BUDGET_LEDGER[1]?.allocation).toBe(150);
    expect(BUDGET_LEDGER[2]?.allocation).toBe(800);
  });
});
