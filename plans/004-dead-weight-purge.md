# Plan 004: Purge dead weight — 35 never-imported ui primitives, 32 dead dependencies, and dead math exports

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/ui src/hooks package.json`
> If any ui primitive was added/deleted since, re-derive the keep/delete lists via
> the import check in Step 1 instead of trusting the tables below verbatim; on a
> mismatch beyond that, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (land before 013 — it shrinks the surface that plan must typefix)
- **Category**: tech-debt / deps
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

67% of the runtime dependency tree is dead: 35 of the 46 vendored shadcn primitives are never imported by app code, and 31 runtime deps + 1 devDep exist only to keep those dead files compiling (recharts, zod, date-fns, sonner, vaul, embla, input-otp, react-day-picker, react-hook-form, react-resizable-panels, @hookform/resolvers, and 20 Radix packages). Nothing dead is bundled today (tree-shaking removes it), so removal cannot change runtime behavior — but it shrinks every `npm ci`, the lockfile, the audit surface, and the tax every future agent pays scanning `src/`. Additionally `src/lib/lunarvoid-data.ts` exports two functions with **zero importers** — `inferenceScore` (which also contains a latent sign bug: its gravity term is identically zero for the dataset's negative mGal values) and `falsePositiveBound`.

## Current state

- `package.json` dependencies block is 47 lines (lines 13-61) — full list verified at plan time.
- `src/components/ui/` contains 46 vendored shadcn primitives. **Convention: vendored files are verbatim-by-design** — this plan deletes whole files; it does not edit survivors.
- `src/hooks/use-mobile.tsx` — its only importer is the dead `ui/sidebar.tsx`.
- App code imports exactly these 11 primitives: `button`, `tabs` (App.tsx, Header.tsx), `sheet`, `badge`, `progress` (CandidateDrawer.tsx), `slider` (LikelihoodCalculator.tsx), `command` (CommandPalette.tsx), `input`, `select`, `table` (AtlasSection.tsx), plus `dialog` transitively (command.tsx imports ui/dialog; sheet.tsx also uses @radix-ui/react-dialog).
- `components.json` (shadcn CLI config, new-york style) — any deleted primitive is re-addable later with `npx shadcn@latest add <name>`; leave this file untouched.
- Vite 8 resolves `@/*` natively (`resolve: { tsconfigPaths: true }` in vite.config.ts); `vite-tsconfig-paths` in devDeps is unused legacy.
- `src/lib/lunarvoid-data.ts:572-600` — the two dead exports:

```ts
export function inferenceScore(depthSpan: number, cpr: number, bouguer: number) { … }   // zero importers
export function falsePositiveBound(score: number) { return 6.06 * Math.exp(-2.9 * (score - 0.5)); }  // zero importers
```

(`Header.tsx:83` displays the string `"6.06 / 10⁴ km²"` — authored display copy, intentionally left as a string.)

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test` | all pass (if plan 002 landed) |
| Typecheck | `npm run typecheck` or `npx tsc -b` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Build | `npm run build` | `✓ built in …` |

## Scope

**In scope**:
- 35 files under `src/components/ui/` (list in Step 2)
- `src/hooks/use-mobile.tsx` (and `src/hooks/` if empty afterwards)
- `package.json`, `package-lock.json` (via npm uninstall)
- `src/lib/lunarvoid-data.ts` (delete the two dead functions only)

**Out of scope**:
- The 11 live primitives and `components.json`.
- `Header.tsx` — its "6.06" string stays (display copy).
- The four internal-only type exports (`Category`, `GeologicalUnit`, `GateReport`, `BudgetRecord`) — un-exporting them is churn without benefit; skip.

## Git workflow

- Branch: `advisor/004-dead-weight-purge`
- Commit style: `chore: remove 35 unused ui primitives, 32 dead deps, and dead math exports`
- Do NOT push.

## Steps

### Step 1: Re-derive the live set (safety check before deleting)

Run:

```bash
grep -rhoE '@/components/ui/[a-z-]+' src --include='*.tsx' --include='*.ts' | sort -u
grep -rhoE "from ['\"]\.\.?/components/ui/[a-z-]+" src/components/ui --include='*.tsx' | sort -u
```

Union of both = files reachable from app code (the second catches ui→ui imports like command→dialog, sheet→dialog). Expected: exactly `badge button command dialog input progress select sheet slider table tabs`.

**Verify**: the union equals the 11-name list above. Any extra name → that file is alive; move it from the delete list to keep, and report the delta.

### Step 2: Delete the 35 dead primitives + dead hook

```bash
cd src/components/ui && rm accordion.tsx alert-dialog.tsx alert.tsx aspect-ratio.tsx avatar.tsx breadcrumb.tsx calendar.tsx card.tsx carousel.tsx chart.tsx checkbox.tsx collapsible.tsx context-menu.tsx drawer.tsx dropdown-menu.tsx form.tsx hover-card.tsx input-otp.tsx label.tsx menubar.tsx navigation-menu.tsx pagination.tsx popover.tsx radio-group.tsx resizable.tsx scroll-area.tsx separator.tsx sidebar.tsx skeleton.tsx sonner.tsx switch.tsx textarea.tsx toggle-group.tsx toggle.tsx tooltip.tsx
cd .. && rm -rf hooks
```

(If Step 1 flagged any of these as alive, skip that file. `src/hooks/` contains only `use-mobile.tsx` at plan time.)

**Verify**: `ls src/components/ui | wc -l` → `11`; `ls src/hooks 2>/dev/null` → no such directory; `grep -rn "use-mobile" src` → no matches.

### Step 3: Uninstall the 32 dead dependencies

```bash
npm uninstall @hookform/resolvers zod date-fns embla-carousel-react input-otp react-day-picker react-hook-form react-resizable-panels recharts sonner vaul \
  @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip \
  vite-tsconfig-paths
```

Kept Radix set (6): `react-dialog`, `react-progress`, `react-select`, `react-slider`, `react-slot`, `react-tabs`. Also kept: `cmdk`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `three`, `@react-three/fiber`, `@react-three/drei`, `react`, `react-dom`.

**Verify**: `node -e "const d=require('./package.json').dependencies; console.log(Object.keys(d).length)"` → `19`; `node -e "console.log(require('./package.json').dependencies.react)"` → `~19.2.8`; `npm run build` → `✓ built in …`.

### Step 4: Delete the two dead math exports

In `src/lib/lunarvoid-data.ts`, remove the entire `inferenceScore` function (with its doc comment `/** Source's Bayesian-flavoured toy score … */`) and the entire `falsePositiveBound` function. Keep `targetWeightedScore` and `calibratedFpRate` (both have live importers).

**Verify**: `grep -n "inferenceScore\|falsePositiveBound" src -r` → no matches; `npm run typecheck` → exit 0.

### Step 5: Full gate + smoke

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Then `npm run dev` spot-check: all 5 tabs render; atlas table shows 12 rows; drawer opens; ⌘K palette opens; globe and cutaway canvases mount (lazy chunks still load).

**Verify**: all commands exit 0; spot-check passes.

## Test plan

No new tests required (deletion plan; suite from 002/003 must stay green — `npm test` covers it). If plan 003 has landed, its `CandidateDrawer`/`App` tests double as render smoke for the surviving primitives.

## Done criteria

- [ ] `ls src/components/ui | wc -l` → 11
- [ ] `node -e "console.log(Object.keys(require('./package.json').dependencies).length)"` → 19
- [ ] `npm run lint && npm run typecheck && npm run build` all exit 0
- [ ] `npm test` exits 0 (if infra present)
- [ ] `grep -rn "inferenceScore\|falsePositiveBound" src` → empty
- [ ] `git status` shows no modifications outside in-scope paths
- [ ] `plans/README.md` status row updated

## STOP conditions

- Step 1's live-set derivation yields names beyond the 11 expected — the audit's import graph is stale; re-derive the delete list but report the discrepancy.
- `npm uninstall` attempts to modify `react`/`react-dom` versions (watch its output) — abort and report.
- Build fails after deletion with an import error pointing at a deleted file — some app file DOES import it; restore that file via `git checkout -- <file>` and report which one.
- `ui/sidebar.tsx` does not exist (list drift) — proceed with the files that do exist, note the delta.

## Maintenance notes

- To restore any primitive later: `npx shadcn@latest add <name>` (components.json is intact) — then re-add its deps; `npm i` will handle it.
- Plan 009 (AGENTS.md) records the surviving-primitives list and the "run the Step-1 import check before deleting or adding primitives" rule — land this plan first so the doc records the post-purge state.
- The `inferenceScore` sign bug (`bouguer / 5` vs sibling's `Math.abs(bouguerDeficit) / 14`) is now moot (deleted); if anyone re-adds a GRAIL term, use `Math.abs`.
- Reviewer: confirm zero diff under `src/components/ui` for the 11 survivors — this plan must not restyle vendored files.
