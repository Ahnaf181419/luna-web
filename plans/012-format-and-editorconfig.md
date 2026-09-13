# Plan 012: Add Prettier + EditorConfig and normalize the split quote/export/import styles

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- .editorconfig .prettierrc package.json`
> Run this plan LAST among code plans — formatting churn conflicts with every
> in-flight diff. If other plans are still un-merged, STOP and defer.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW (but the format commit touches nearly all app files — isolate it)
- **Depends on**: run after 001-011, 013-017 (any code-changing plan)
- **Category**: dx
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The codebase has no formatter, no `.editorconfig`, and no hooks — and its style has split along authoring-era lines: `sections/*`, `instruments/*`, `Footer.tsx` use single quotes; `lunar/*`, `Header.tsx`, `App.tsx` use double quotes; `App.tsx:3-16` imports via relative paths while every other file uses the `@/` alias; exports mix `export const` / `export function` / two stray `export default`s (`LunarGlobe.tsx:267`, `TubeCutaway.tsx:171`). Every future diff carries cosmetic noise, and agent executors reformat files to whichever convention they sampled first — the split deepens on its own. One mass-format commit freezes the drift.

## Current state

Evidence (verified): per-file quote counts — `AtlasSection.tsx` 9 single/0 double vs `CandidateDrawer.tsx` 0 single/6 double; `App.tsx` has BOTH `export const App` (:20) and `export default App` (:190) while `main.tsx:4` imports the default. No `.editorconfig`, no prettier/biome in devDeps (package.json:62-75), no husky/lefthook/prepare script. Lint is oxlint (stays — Prettier handles formatting, oxlint handles correctness; they don't overlap).

Majority convention to standardize on: **single quotes, semicolons, 100-col, 2-space** (matches the majority of `sections/`+`instruments/` by line count).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Format | `npm run format` | exit 0 |
| Check | `npm run format:check` | exit 0 after the mass-format commit |
| Tests | `npm test` | all pass |
| Build | `npm run build` | `✓ built in …` |

## Scope

**In scope**:
- `.editorconfig`, `.prettierrc`, `.prettierignore` (create)
- `package.json` (scripts + prettier devDep)
- Every app file EXCLUDING `src/components/ui/**` and `plans/**` (via .prettierignore)
- `src/App.tsx` import-path normalization (mechanical, done before formatting)

**Out of scope**:
- `src/components/ui/**` — vendored verbatim; formatting them would break the verbatim contract and future `shadcn` diffs.
- `package-lock.json`, `dist/`, `docs/`, `plans/`, `*.md` (leave markdown alone — content docs churn independently).

## Git workflow

- Branch: `advisor/012-format-and-editorconfig`
- Commit 1: `style(app): normalize imports to @/ alias and remove stray default exports`
- Commit 2: `chore: add prettier + editorconfig, mass-format app code (ui/ excluded)`
- Do NOT push. Keep the two commits separate so `git blame -w -M` and review can skip commit 2.

## Steps

### Step 1: Mechanical normalizations in App.tsx (pre-format)

- Convert `App.tsx:3-16` relative imports (`./components/…`, `./lib/…`) to `@/components/…`, `@/lib/…` (matching every other file).
- Delete `export default App;` (:190) and change `main.tsx:4` to `import { App } from './App.tsx'` (named import — matches the named-export majority). Leave `LunarGlobe.tsx`/`TubeCutaway.tsx` defaults alone (their consumers use dynamic `import()` inside `Client3D`/`StratigraphyOverlay` — changing them is not mechanical; note as accepted exception).

**Verify**: `npm run typecheck && npm run build` → both exit 0.

### Step 2: Config files

`.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

`.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

`.prettierignore`:

```
node_modules
dist
package-lock.json
src/components/ui
plans
docs
*.md
```

Install: `npm install --save-dev --save-exact prettier` (exact pin — formatter versions change output).

`package.json` scripts: `"format": "prettier --write .`, `"format:check": "prettier --check ."`.

**Verify**: `npx prettier --version` prints a version; `npm run format:check` fails (unformatted) — expected at this point.

### Step 3: Mass-format (isolated commit)

`npm run format` → `git add -A && git commit` as commit 2.

**Verify**: `npm run format:check` → exit 0; `git diff --stat HEAD~1 -- src/components/ui` → empty (vendored files untouched); `npm run lint && npm run typecheck && npm test && npm run build` → all green.

### Step 4: Regression eyeball

Dev server: all 5 tabs render; drawer, palette, calculator, charts intact. Formatting must not alter behavior — if anything visually changed, a dangerously-formatted template literal was touched: revert that file's format (add to .prettierignore with a comment) and report.

## Test plan

Existing suites are the regression net (`npm test` green post-format). No new tests.

## Done criteria

- [ ] `.editorconfig`, `.prettierrc`, `.prettierignore` exist
- [ ] `npm run format:check` exits 0
- [ ] `grep -c "from './components" src/App.tsx` → 0; `grep -c "export default App" src/App.tsx` → 0
- [ ] `git diff --stat <fmt-commit>~1..<fmt-commit> -- src/components/ui` → empty
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any OTHER plan's branch is still un-merged — defer this plan (format churn on top of pending diffs).
- Prettier reformats a `svg`/`d`-string template in a way that changes rendered output (check Step 4) — exclude that file and report.
- `prettier --write .` wants to touch files outside src/ not covered by .prettierignore — extend .prettierignore, don't format them.

## Maintenance notes

- `format:check` can join the CI validate job (plan 002's workflow) once this lands — one-line addition, do it in the same PR if CI file is handy.
- Future agents: run `npm run format` before committing — record in AGENTS.md (plan 009) if it lands after this one.
- The two surviving `export default`s in `lunar/` are deliberate (dynamic-import consumers); don't "fix" them without checking `Client3D.tsx`/`StratigraphyOverlay.tsx`.
