import {
  CANDIDATES,
  CATALOG_SIZE,
  PROGRAM_RECORD,
  WP05_RECORD,
  siteById,
} from '@/lib/lunarvoid-data';

const PROVENANCE_NOTE = `Provenance: SYNTHETIC DEMONSTRATION working set. Id/site/status/morphology/score and the structured fields (cprRatio/bouguerMGal/depthMeters/spanMeters) are authored demonstration values, not the research registry. The real ${PROGRAM_RECORD.registryRows}-row candidate registry and frozen program statistics live in the project repository: ${PROGRAM_RECORD.repoUrl}. Elevation transects and 3D geometry rendered in the portal are parametric illustrations derived from depth/span, not measured profiles.`;

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
      schema_version: 2,
      catalog_size: CATALOG_SIZE,
      published: CANDIDATES.length,
      provenance: PROVENANCE_NOTE,
      program_record: {
        repository: PROGRAM_RECORD.repoUrl,
        frozen_as_of: PROGRAM_RECORD.frozenAsOf,
        registry_rows: PROGRAM_RECORD.registryRows,
        registry_partition: {
          active: PROGRAM_RECORD.registryActive,
          superseded: PROGRAM_RECORD.registrySuperseded,
        },
        tiers: `A=${PROGRAM_RECORD.tierA} B=${PROGRAM_RECORD.tierB} C=all`,
        fp_per_1e4km2: {
          row_based: PROGRAM_RECORD.fpRowRate,
          row_based_ci: PROGRAM_RECORD.fpRowCi,
          unique_feature: PROGRAM_RECORD.fpUniqueRate,
          unique_feature_ci: PROGRAM_RECORD.fpUniqueCi,
          context: 'calibration-context, not a survey rate',
        },
        wp05: {
          paper_status: WP05_RECORD.paperStatus,
          sweep_rows: WP05_RECORD.sweepRows,
          dtms_processed: WP05_RECORD.dtmsProcessed,
          floor_band_m: WP05_RECORD.floorBandM,
          floor_median_m: WP05_RECORD.floorMedianM,
          anchors_reproduced: WP05_RECORD.anchorsReproduced,
          anchor_max_rel_err_pct: WP05_RECORD.anchorMaxRelErrPct,
          gap_orders_range: WP05_RECORD.gapOrdersRange,
          gap_median_intact_orders: WP05_RECORD.gapMedianIntactOrders,
          gap_median_restricted_intact_orders: WP05_RECORD.gapMedianRestrictedIntactOrders,
          regimes: WP05_RECORD.regimes,
        },
      },
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
