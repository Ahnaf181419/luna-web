import { CANDIDATES, CATALOG_SIZE, siteById } from '@/lib/lunarvoid-data';

const PROVENANCE_NOTE =
  'Provenance: id/site/status/morphology/score and the structured fields (cprRatio/bouguerMGal/depthMeters/spanMeters) are authored working-set values. Elevation transects and 3D geometry rendered in the portal are parametric illustrations derived from depth/span, not measured profiles.';

const CSV_COLUMNS = [
  'id',
  'site',
  'siteName',
  'siteCoordLabel',
  'status',
  'morphology',
  'score',
  'cprRatio',
  'bouguerMGal',
  'depthMeters',
  'spanMeters',
  'lat',
  'lon',
] as const;

function csvEscape(value: string | number | undefined): string {
  const s = value === undefined ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function workingSetToCsv(): string {
  const header = `# ${PROVENANCE_NOTE}\n${CSV_COLUMNS.join(',')}`;
  const rows = CANDIDATES.map((c) => {
    const site = siteById(c.site);
    return [
      c.id,
      c.site,
      site.name,
      site.coordLabel,
      c.status,
      c.morphology,
      c.score,
      c.cprRatio,
      c.bouguerMGal,
      c.depthMeters ?? '',
      c.spanMeters ?? '',
      c.lat,
      c.lon,
    ]
      .map(csvEscape)
      .join(',');
  });
  return [header, ...rows].join('\n');
}

export function workingSetToJson(): string {
  return JSON.stringify(
    {
      schema_version: 1,
      catalog_size: CATALOG_SIZE,
      published: CANDIDATES.length,
      provenance: PROVENANCE_NOTE,
      candidates: CANDIDATES.map((c) => {
        const site = siteById(c.site);
        return {
          id: c.id,
          site: c.site,
          siteName: site.name,
          siteCoordLabel: site.coordLabel,
          status: c.status,
          morphology: c.morphology,
          score: c.score,
          structured: {
            cprRatio: c.cprRatio,
            bouguerMGal: c.bouguerMGal,
            depthMeters: c.depthMeters ?? null,
            spanMeters: c.spanMeters ?? null,
          },
          location: { lat: c.lat, lon: c.lon },
          prose: {
            cpr: c.cpr,
            bouguer: c.bouguer,
            pit: c.pit,
            notes: c.notes,
            inspection: c.inspection,
          },
        };
      }),
    },
    null,
    2,
  );
}

export function downloadWorkingSet(ext: 'csv' | 'json') {
  const body = ext === 'csv' ? workingSetToCsv() : workingSetToJson();
  const url = URL.createObjectURL(
    new Blob([body], { type: ext === 'csv' ? 'text/csv' : 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `lunarvoid-working-set.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
