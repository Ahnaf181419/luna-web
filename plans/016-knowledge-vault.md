# Plan 016: Make the Knowledge vault honest — single MOC data source, real (small) concept dossiers, accurate counts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/sections/KnowledgeVaultSection.tsx src/components/sections/KnowledgePreviewSection.tsx src/components/instruments/CommandPalette.tsx`
> Plan 008 demoted the inert nodes (expected drift). Anything else — re-read.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW/MED (content-heavy; code is the easy half)
- **Depends on**: plans/008-clipboard-and-affordances.md (nodes demoted there; this plan re-adds real behavior)
- **Category**: direction
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The Knowledge tab is the only section whose core interaction is fake: `[[concept]]` nodes look interactive but do nothing (plan 008 removed the lie; this plan adds the truth). The five MOC titles + note counts (14/28/22/19/24) are **hardcoded twice** (`KnowledgeVaultSection.tsx:15-66` and `KnowledgePreviewSection.tsx:5-11` — a drift risk), "107 atomic notes" is claimed in two places while **zero note content exists in the repo**, and the README promises "Obsidian-style Maps of Content (MOCs) with wiki-graph node links". The honest version: one data source, a small set of REAL concept dossiers (2-3 sentences each, maintainable), a Dialog per node, and counts that match reality.

## Current state

- `src/components/sections/KnowledgeVaultSection.tsx` — 160 lines; local `MOCS` array (5 entries: title, category, noteCount, summary, keyConcepts: string[]); `activeMoc` state selects one; concept nodes rendered at :146-154 (post-008: static chips).
- `src/components/sections/KnowledgePreviewSection.tsx` — duplicates the 5 MOC titles + counts for the Gates-tab preview; claims "107 atomic notes" (~:26).
- `src/components/instruments/CommandPalette.tsx:61` — second "107 atomic notes" claim (grep `107`).
- `src/components/ui/dialog.tsx` — vendored Dialog primitive, ALIVE (imported via command.tsx chain; confirmed in plan 004's keep-list).
- Data convention: content data lives in `src/lib/lunarvoid-data.ts` (typed, commented). Knowledge content is portal content, not science data — a sibling module is appropriate.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test` | all pass |
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | `✓ built in …` |
| Duplication check | `grep -c "Marius" src/components/sections/KnowledgeVaultSection.tsx src/components/sections/KnowledgePreviewSection.tsx` | 0 hardcoded copies after Step 1 |

## Scope

**In scope**:
- `src/lib/knowledge.ts` (create — MOCs + concept dossiers)
- `src/components/sections/KnowledgeVaultSection.tsx`, `KnowledgePreviewSection.tsx` (consume; remove local data)
- `src/components/instruments/CommandPalette.tsx` (fix count claim)
- `README.md` (one line: align the MOC claim)
- `src/lib/__tests__/knowledge.test.ts` (create)

**Out of scope**:
- A graph visualization — high-effort decoration over small content; explicitly rejected.
- Writing all ~107 notes — the count claim is REMOVED instead; the maintainer grows real dossiers over time.
- Gates/Footer sections.

## Git workflow

- Branch: `advisor/016-knowledge-vault`
- Commit style: `feat(knowledge): single MOC source, real concept dossiers via dialog, honest counts`
- Do NOT push.

## Steps

### Step 1: Extract + extend the data

Create `src/lib/knowledge.ts`:

```ts
export interface ConceptDossier {
  id: string;            // matches a keyConcepts entry
  title: string;
  summary: string;       // 2-3 sentences, factual, portal-voice
  related: string[];     // other concept ids
}
export interface Moc {
  id: string; title: string; category: string; summary: string;
  keyConcepts: string[]; dossiers: Record<string, ConceptDossier>; // keyed by concept id
}
export const MOCS: Moc[] = [ /* port the 5 existing entries; noteCount field DELETED */ ];
export const DOSSIER_COUNT = /* computed: total distinct dossiers */;
```

Author dossiers: port each `keyConcepts` string into a `ConceptDossier` with a 2-3 sentence summary grounded in the portal's existing vocabulary (rille types, CPR contrast, Bouguer deficit, DTM morphometry, skylight collapse mechanics — mine `lunarvoid-data.ts` descriptions and section prose for phrasing). Aim 3-5 dossiers per MOC's most prominent concepts; remaining concepts without dossiers render as static chips (no fake affordance).

**Verify**: `npm run typecheck` → 0; `grep -c "noteCount" src/lib/knowledge.ts` → 0.

### Step 2: Consume in both sections

- `KnowledgeVaultSection`: delete the local MOCS; import from `@/lib/knowledge`. Concept chips WITH a dossier become `<button type="button">` opening a Dialog (vendored `ui/dialog.tsx`) showing title + summary + related concept names (related chips are buttons that swap dialog content). Concepts WITHOUT a dossier stay static (plan 008's demotion style).
- `KnowledgePreviewSection`: delete its duplicated array; render from the shared source.
- Replace every "107 atomic notes"-style count with `DOSSIER_COUNT` + the word "dossiers" (vault section + CommandPalette subtitle). No inflated note counts anywhere: `grep -rn "atomic notes\|107" src README.md` → 0 matches after this step (README line updated to "curated concept dossiers").

**Verify**: `npm run typecheck && npm run build` → 0; grep above clean.

### Step 3: Tests

`src/lib/__tests__/knowledge.test.ts`:
- Every MOC's `dossiers` keys ⊆ its `keyConcepts`.
- Every `related` id exists within the same MOC (or globally if you design cross-Moc links — pick one, assert it).
- `DOSSIER_COUNT` equals the computed total (guards hand-edited drift).

**Verify**: `npx vitest run src/lib/__tests__/knowledge.test.ts` → pass.

### Step 4: Smoke

Dev → Knowledge tab: MOC switcher works; dossier chips open the Dialog with real content; related chips navigate; static chips inert (no pointer cursor). Gates tab: preview shows same titles as the vault. ⌘K: subtitle shows the dossier count.

## Test plan

Step 3. Pattern: plan 003's data-layer suite.

## Done criteria

- [ ] `grep -rn "107\|atomic notes" src README.md` → 0 matches
- [ ] `grep -c "keyConcepts" src/components/sections/KnowledgeVaultSection.tsx` reflects import-only usage (no local literal array)
- [ ] Dialog opens with content for ≥15 dossiers total (`DOSSIER_COUNT >= 15`)
- [ ] `npm test && npm run typecheck && npm run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- You find yourself authoring >2 sentences of NEW scientific claims not derivable from existing repo prose — stop; ground every summary in `lunarvoid-data.ts` descriptions/section copy and cite the source section in the commit message.
- The vendored Dialog is missing (plan 004 executed differently) — re-add via `npx shadcn@latest add dialog` or use Sheet (alive) instead; report the choice.

## Maintenance notes

- Growing the vault = adding entries to `src/lib/knowledge.ts`; the test enforces referential integrity automatically.
- If a future plan wants the full graph view, the `related` edges defined here are its data model — this plan is the prerequisite.
