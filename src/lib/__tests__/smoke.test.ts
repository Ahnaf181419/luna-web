import { describe, expect, it } from 'vitest';
import { CANDIDATES, CATALOG_SIZE, SITES } from '@/lib/lunarvoid-data';

describe('data layer smoke', () => {
  it('publishes the expected working set', () => {
    expect(SITES).toHaveLength(8);
    expect(CANDIDATES).toHaveLength(12);
    expect(CATALOG_SIZE).toBe(257);
  });

  it('every candidate references a known site', () => {
    const ids = new Set(SITES.map((s) => s.id));
    for (const c of CANDIDATES) expect(ids.has(c.site)).toBe(true);
  });
});
