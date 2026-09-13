# Plan 014: Ship a machine-readable registry export (CSV/JSON) and a LICENSE

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/sections/AtlasSection.tsx src/components/instruments/CommandPalette.tsx LICENSE`
> AtlasSection may have drifted via plans 004/010. Re-read before editing.

## Status

- **Priority**: P2
- **Effort**: S/M
- **Risk**: MED (provenance honesty — see below; the export must label authored vs. synthesized fields)
- **Depends on**: none (soft: after 002 for test infra)
- **Category**: direction
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The portal asks to be cited (Footer BibTeX references a "257 Candidate Catalog") and its Gate G3 explicitly promises "Zenodo artifact archiving, and open code release" — yet **no dataset can be downloaded and no LICENSE exists**. The typed `CANDIDATES` array is trivially serializable; the export closes the loop between citation and artifact (and is the honest move: the app already admits "12 published in this public working set"). One integrity constraint: the DTM transects are **parametrically generated** from depth/span (see `buildTransectPoints`), not measured — the export must label provenance so the calibration-honesty brand survives contact with a spreadsheet.

## Current state

- `src/lib/lunarvoid-data.ts` — `Candidate` type: id, site, status, morphClass, coordLabel (site-level), depthMeters, spanMeters, cprRatio, bouguerMGal, score, plus prose fields (grep `interface Candidate` / read lines ~162-184). `CATALOG_SIZE = 257` vs 12 published; `siteById` for join.
- `src/components/sections/AtlasSection.tsx` — header row + table; currently two small header actions at most (read the file's header block; the export buttons join it).
- `src/components/instruments/CommandPalette.tsx` — command groups (Tabs / Sites / Candidates / Gates); the CSV download joins as an action (`subtitle: \`${CATALOG_SIZE}-candidate registry…\`` at ~line 45 shows the CATALOG_SIZE import pattern).
- No `LICENSE` at repo root.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test` | all pass |
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | `✓ built in …` |

## Scope

**In scope**:
- `src/lib/registry-export.ts` (create)
- `src/lib/__tests__/registry-export.test.ts` (create)
- `src/components/sections/AtlasSection.tsx` (header buttons)
- `src/components/instruments/CommandPalette.tsx` (one action)
- `LICENSE` (create)

**Out of scope**:
- Footer BibTeX changes (no DOI yet — link Zenodo when it exists).
- The data inconsistencies (G1 "17 targets" vs C1-1 "21 sites" vs candidateCount sum 190) — content decisions for the maintainer, noted in maintenance.
- Any new dependency (no file-saver libs — use Blob + anchor).

## Git workflow

- Branch: `advisor/014-registry-export`
- Commit style: `feat(atlas): download working set as CSV/JSON with provenance labels; add MIT LICENSE`
- Do NOT push.

## Steps

### Step 1: The export module

`src/lib/registry-export.ts`:

```ts
import { CANDIDATES, siteById } from "@/lib/lunarvoid-data";

const PROVENANCE_NOTE =
  "Provenance: id/site/status/morphClass/depthMeters/spanMeters/cprRatio/bouguerMGal/score are authored working-set values. Elevation transects and 3D geometry rendered in the portal are parametric illustrations derived from depth/span, not measured profiles.";

export function workingSetToJson(): string { … }   // { catalog_size, published: N, provenance, candidates: [...] }
export function workingSetToCsv(): string { … }    // leading comment line with PROVENANCE_NOTE (prefix "# "), then header row, then 12 rows
```

Details: join `siteById(c.site).coordLabel` and site lat/lon into each row; CSV quoting — wrap prose fields containing commas in double quotes (or omit prose fields from CSV entirely, keeping them JSON-only — prefer the latter: CSV = numeric/enum columns only, JSON = full records). Escape nothing by hand beyond standard `"`-doubling if you keep prose.

**Verify**: `npm run typecheck` → 0.

### Step 2: Download wiring

In `AtlasSection`'s header area, add two compact buttons (match existing button sizing/classes in the file — `label-mono` styling):

```tsx
const download = (ext: "csv" | "json", body: string) => {
  const url = URL.createObjectURL(new Blob([body], { type: ext === "csv" ? "text/csv" : "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `lunarvoid-working-set.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};
```

Labels: `CSV` / `JSON` with a Download icon (lucide). In `CommandPalette`, add an "Actions" entry (or append to the Tabs group — match the existing group structure): "Download registry (CSV)" invoking the same helper via a new prop `onDownloadRegistry` threaded from `App.tsx` — read how other palette actions receive handlers and mirror it exactly.

**Verify**: `npm run build` → 0; dev: atlas buttons download files; ⌘K action downloads.

### Step 3: Tests

`src/lib/__tests__/registry-export.test.ts`:
- JSON parses; `published === 12`, `catalog_size === 257`; every candidate has `provenance`-bearing parent; site coordLabel present.
- CSV: first line starts with `# Provenance:`; header contains `id,site,status,depthMeters,spanMeters,cprRatio,bouguerMGal,score`; 13 content lines (header + 12); no unquoted commas beyond separators (split a row and count fields).

**Verify**: `npx vitest run src/lib/__tests__/registry-export.test.ts` → pass.

### Step 4: LICENSE

MIT license text, copyright line: `Copyright (c) 2026 Ahnaf Shafin`. **Assumption**: MIT for code. Data note: the exported JSON/CSV carries the provenance note; if the maintainer prefers CC-BY-4.0 for the dataset specifically, that's a one-line README addition later (STOP only if you have evidence of a different intent).

**Verify**: `test -s LICENSE && head -3 LICENSE` shows MIT title/copyright.

## Test plan

Covered by Step 3. Pattern: plan 003's data-layer suite.

## Done criteria

- [ ] `npm test` green incl. new export suite
- [ ] `grep -n "provenance" src/lib/registry-export.ts` and the CSV first line check in tests
- [ ] LICENSE exists (MIT)
- [ ] `npm run typecheck && npm run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- The `Candidate` type has gained/lost fields materially (drift) — derive columns from the actual type; report the delta.
- Palette action wiring requires restructuring `CommandPalette`'s props beyond adding one callback — report instead of redesigning.
- You find an existing LICENSE or license header (drift) — STOP; reconciling licensing is a maintainer decision.

## Maintenance notes

- When Zenodo archiving happens (G3), add the DOI next to the BibTeX in the Footer and to the export's provenance note; version the export (`schema_version: 1` in JSON) so archived artifacts stay comparable.
- Data inconsistencies to resolve in content (not this plan): G1 summary "17 ran DTM targets" vs C1-1 "21 sites" vs `candidateCount` sum 190 vs CATALOG_SIZE 257 — pick the canonical story, then update data + export together.
