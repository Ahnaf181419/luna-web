import { describe, expect, it } from 'vitest';
import { workingSetToCsv, workingSetToJson } from '@/lib/registry-export';
import { CANDIDATES } from '@/lib/lunarvoid-data';

describe('workingSetToJson', () => {
  const parsed = JSON.parse(workingSetToJson());

  it('carries catalog size, published count, and provenance', () => {
    expect(parsed.catalog_size).toBe(257);
    expect(parsed.published).toBe(CANDIDATES.length);
    expect(parsed.provenance).toContain('parametric illustrations');
  });

  it('includes site names and structured fields per candidate', () => {
    for (const c of parsed.candidates) {
      expect(c.siteName).toBeTruthy();
      expect(typeof c.structured.cprRatio).toBe('number');
      expect(c.location).toHaveProperty('lat');
    }
  });

  it('embeds the WP0.5 forward-model record (additive, post-R3)', () => {
    expect(parsed.program_record.wp05).toBeTruthy();
    expect(parsed.program_record.wp05.paper_status).toBe(
      'preprint drafted · submission in preparation',
    );
    expect(parsed.program_record.wp05.sweep_rows).toBe(2880);
    expect(parsed.program_record.wp05.floor_band_m).toEqual([1.97, 4.39]);
    expect(parsed.program_record.wp05.floor_median_m).toBeCloseTo(3.31, 2);
    expect(parsed.program_record.wp05.anchors_reproduced).toBe('7/7');
    expect(parsed.program_record.wp05.gap_orders_range).toEqual([1, 5]);
  });
});

describe('workingSetToCsv', () => {
  const csv = workingSetToCsv();
  const lines = csv.split('\n');

  it('leads with a provenance comment and a header row', () => {
    expect(lines[0]).toMatch(/^# Provenance:/);
    expect(lines[1]).toContain('id,site,siteName,siteCoordLabel,status');
  });

  it('has one row per published candidate', () => {
    expect(lines).toHaveLength(2 + CANDIDATES.length);
  });

  it('keeps field counts consistent (quotes protect commas)', () => {
    for (const row of lines.slice(2)) {
      const fields = row.match(/("([^"]|"")*"|[^,]*)/g)?.filter((_, i) => i % 2 === 0) ?? [];
      expect(fields.length).toBe(13);
    }
  });
});
