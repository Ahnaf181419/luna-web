import { describe, expect, it } from 'vitest';
import { DOSSIER_COUNT, MOCS, dossierFor } from '@/lib/knowledge';

describe('knowledge vault data', () => {
  it('every dossier key is a declared key concept of its MOC', () => {
    for (const moc of MOCS) {
      for (const key of Object.keys(moc.dossiers)) {
        expect(moc.keyConcepts).toContain(key);
      }
    }
  });

  it('every related reference resolves globally (cross-MOC wiki links allowed)', () => {
    const allConcepts = MOCS.flatMap((m) => m.keyConcepts);
    for (const moc of MOCS) {
      for (const dossier of Object.values(moc.dossiers)) {
        for (const ref of dossier.related) {
          expect(allConcepts).toContain(ref);
        }
      }
    }
  });

  it('DOSSIER_COUNT matches the computed total (guards hand-edited drift)', () => {
    const total = MOCS.reduce((n, moc) => n + Object.keys(moc.dossiers).length, 0);
    expect(DOSSIER_COUNT).toBe(total);
    expect(DOSSIER_COUNT).toBeGreaterThanOrEqual(15);
  });

  it('dossierFor resolves and misses correctly', () => {
    expect(dossierFor('moc-gates', 'Gate G2 Criteria')?.title).toBeTruthy();
    expect(dossierFor('moc-gates', 'Not A Concept')).toBeUndefined();
    expect(dossierFor('no-such-moc', 'Gate G2 Criteria')).toBeUndefined();
  });
});
