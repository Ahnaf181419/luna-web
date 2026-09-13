# Plan 002: Stand up a verification baseline — vitest, test scripts, and CI quality gates

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- package.json .github/workflows/deploy.yml tsconfig.app.json`
> If any changed beyond this plan's own additions, compare "Current state" excerpts
> against live files; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (but land before 003, 005, 007, 013)
- **Category**: tests / dx
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The repo has **zero tests, no test runner, and a CI pipeline that only builds**. Every push to `main` auto-deploys to the live GitHub Pages site (https://ahnaf181419.github.io/luna-web/) with no lint, typecheck-only, or test signal — the deploy log is the only reviewer of a fast-moving, agent-developed codebase. This plan adds vitest + Testing Library, a `typecheck` script (today type feedback is coupled to full builds, and `build:dev` skips `tsc` entirely), and a CI `validate` job that gates deploys.

## Current state

- `package.json` scripts (verbatim, lines 6-12):

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "build:dev": "vite build --mode development",
  "lint": "oxlint",
  "preview": "vite preview"
}
```

- `.github/workflows/deploy.yml` — current shape: `on: push: branches: [main]` + `workflow_dispatch`; permissions `contents: read, pages: write, id-token: write`; single `deploy` job (environment `github-pages`, url from `steps.deployment.outputs.page_url`), steps: `actions/checkout@v4` → `actions/setup-node@v4` (node-version 22, cache npm) → `npm ci` → `npm run build` → `actions/upload-pages-artifact@v3` (path `dist`) → `actions/deploy-pages@v4`. Concurrency: `group: pages`, `cancel-in-progress: true`.
- `tsconfig.app.json` — `verbatimModuleSyntax: true`, `noEmit: true`, `moduleResolution: bundler`, `paths: {"@/*": ["./src/*"]}`, `include: ["src"]`.
- `src/main.tsx` — mounts `<App />` in StrictMode; no test-setup coupling.
- Lint is **oxlint** (`.oxlintrc.json` exists) — this plan does NOT introduce eslint; vitest coexists with oxlint.
- Constraints: react/react-dom are pinned `~19.2.8` (an R3F peer-range requirement) — do not let any tooling bump them. Vite 8 + `@vitejs/plugin-react` 6 already in devDeps; vitest can reuse them.

## Commands you will need

| Purpose   | Command                | Expected on success |
|-----------|------------------------|---------------------|
| Install   | `npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom` | exit 0; react/react-dom still `~19.2.8` |
| Tests     | `npm test`             | all pass (after Step 3) |
| Typecheck | `npm run typecheck`    | exit 0 |
| Lint      | `npm run lint`         | exit 0 |
| Build     | `npm run build`        | `✓ built in …` |

## Scope

**In scope**:
- `package.json` (scripts + new devDeps)
- `vitest.config.ts` (create)
- `src/test/setup.ts` (create)
- `src/lib/__tests__/smoke.test.ts` (create)
- `.github/workflows/deploy.yml`

**Out of scope**:
- Any `src/` application code — the smoke test asserts existing constants only.
- `src/components/ui/**` — vendored, never touch.
- Prettier/formatting (plan 012).

## Git workflow

- Branch: `advisor/002-verification-baseline`
- Commit style: `test: add vitest baseline, typecheck script, and CI validate job`
- Do NOT push.

## Steps

### Step 1: Install runner deps

Run the install command above. Then confirm pins survived:

**Verify**: `node -e "const p=require('./package.json'); console.log(p.dependencies.react, p.dependencies['react-dom'])"` → `~19.2.8 ~19.2.8`.

### Step 2: Create vitest config + setup

`vitest.config.ts` (repo root) — deliberately minimal; do NOT import the app's `vite.config.ts` (it carries `base: '/luna-web/'` and Tailwind plugins irrelevant to tests):

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

TS must resolve `vitest/config` and the setup file: they live in `src/`, which `tsconfig.app.json` includes — the setup file's import is a runtime-only module; if `npx tsc -b` complains about types, add `"types": ["vite/client", "@testing-library/jest-dom/vitest"]`? Do not guess: first try `npx tsc -b`; only if it errors on the setup file, add to `tsconfig.app.json` compilerOptions `"types": ["vite/client", "@testing-library/jest-dom/vitest"]` replacing the existing `"types": ["vite/client"]`.

**Verify**: `npx tsc -b` → exit 0.

### Step 3: Add scripts and the smoke test

`package.json` scripts become:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "build:dev": "tsc -b && vite build --mode development",
  "lint": "oxlint",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc -b"
}
```

(Note `build:dev` gains the `tsc -b` prefix — it previously skipped typechecking entirely.)

`src/lib/__tests__/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { CANDIDATES, CATALOG_SIZE, SITES } from '@/lib/lunarvoid-data'

describe('data layer smoke', () => {
  it('publishes the expected working set', () => {
    expect(SITES).toHaveLength(8)
    expect(CANDIDATES).toHaveLength(12)
    expect(CATALOG_SIZE).toBe(257)
  })

  it('every candidate references a known site', () => {
    const ids = new Set(SITES.map((s) => s.id))
    for (const c of CANDIDATES) expect(ids.has(c.site)).toBe(true)
  })
})
```

**Verify**: `npm test` → `1 file passed` (2 tests). If the `@/` alias fails inside tests, the vitest config alias in Step 2 is wrong — fix there, not in the test.

### Step 4: CI — validate job gating deploy

Restructure `.github/workflows/deploy.yml` to:

- `on: push: branches: [main]` **and** `pull_request: branches: [main]` (keep `workflow_dispatch`).
- New job `validate` (runs-on ubuntu-latest, no environment): `actions/checkout@v5` → `actions/setup-node@v5` (node-version 22, cache npm) → `npm ci` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`.
- `deploy` job gains `needs: validate`; bump its `checkout`/`setup-node` to `@v5` too (both v5 tags exist; the v4 tags currently emit Node-20-deprecation annotations). Keep `upload-pages-artifact@v3` and `deploy-pages@v4` as-is. Keep permissions, concurrency, and environment blocks unchanged.

**Verify**: `act` is not available here — validate by YAML parse: `node -e "const y=require('js-yaml');"` is NOT a dependency; instead run `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml'))" && echo YAML-OK` (pyyaml is commonly present; if not, careful visual review is acceptable — note it). Then `git add .github/ && git status --short` shows only expected files.

### Step 5: Full local gate

**Verify**: `npm run lint && npm run typecheck && npm test && npm run build` — all exit 0, in that order, one command.

## Test plan

This plan *is* the test infrastructure. The smoke test is the structural pattern for plan 003's suites: plain vitest imports, `@/` alias, `describe/it/expect` from 'vitest' (no globals — `globals: true` is deliberately NOT set).

## Done criteria

- [ ] `npm test` exits 0 with 2 passing tests
- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` exits 0
- [ ] `node -e "console.log(require('./package.json').scripts.typecheck)"` prints `tsc -b`
- [ ] `.github/workflows/deploy.yml` parses as YAML, contains a `validate` job, and `deploy` has `needs: validate`
- [ ] `git status` shows no modifications outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

- Installing vitest wants to change `react`/`react-dom` away from `~19.2.8` (peer conflict) — abort the install and report; we need a vitest version compatible with React 19.2.
- `npm test` hangs >60s with happy-dom — switch attempt to `environment: 'jsdom'` once; if it still hangs, STOP and report.
- The workflow file has drifted from the described shape (e.g., someone already added a validate job) — reconcile with what exists rather than duplicating.
- `actions/checkout@v5` or `actions/setup-node@v5` does not exist when pushed (job fails with "unable to resolve action") — fall back to `@v4` for that action only and note it in the commit message.

## Maintenance notes

- Every subsequent plan's "Tests" verification uses `npm test` — this plan lands first for a reason.
- The PR-triggered `validate` job intentionally does not deploy; only `main` deploys. Reviewers: confirm no `pages: write` permission on the `validate` job.
- Future: coverage reporting (`vitest --coverage`) deliberately deferred — no threshold exists yet to enforce.
