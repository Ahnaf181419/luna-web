# LUNARVOID Portal — Comprehensive Project Audit

> **Date:** 2026-09-16 · **Auditor:** AI coding agent (opencode, full-repo scan + live browser verification)
> **Baseline:** commit `9df6f10` (pushed) **+ 25 uncommitted files across 3 in-flight changesets**
> (motion system + dual font themes; audit fixes; provenance/status-honesty reframe — see §12 F-06).
> Gate status at audit time: lint 0 · typecheck 0 · **67/67 tests** · build ✓ · format ✓ · `npm audit` 0.

---

## 1. Executive summary

**Verdict: production-ready static research portal with exemplary provenance hygiene and documentation; remaining risk is process (uncommitted work stack), not code.**

| Dimension | Score | Notes |
|---|---|---|
| Code quality & typing | 4.5 / 5 | 0 TODO/FIXME, `noUncheckedIndexedAccess` on, oxlint + Prettier clean |
| Testing | 3.5 / 5 | 67 tests across 8 suites; no E2E; 3D excluded by design |
| Data integrity & provenance | 5 / 5 | Two-strata data model, frozen numbers test-pinned, all exports labeled |
| Accessibility | 4 / 5 | AA contrast fixed at active nav; touch targets remain (F-01) |
| Performance | 4 / 5 | Lazy 3D, memoized globe, paused frameloop, async fonts; heavy `three` chunk is lazy |
| Security & privacy | 5 / 5 | 0 vulns, no secrets, single third-party runtime call (Google Fonts) |
| Docs & agent-readiness | 5 / 5 | AGENTS.md, as-built architecture, ROADMAP with lessons, 17 executed plans |
| Process & deployment | 3.5 / 5 | main = production; 3 uncommitted changesets stacked (F-06) |

The portal completed a 17-plan hardening program on 2026-09-13 (tests 0→58, runtime deps 47→16,
crash bugs →0), then gained a motion system, dual permanent font themes, a UI accessibility pass,
and — most significantly — a **provenance layer grounding all program-level claims in the real
research repository** (`github.com/amrahman90/luna`), with the synthetic atlas explicitly relabeled
as a demonstration registry.

---

## 2. Method & scope

Full-repo static scan (structure, LOC, dependencies, tests, bundle, CI, docs, git history) +
live browser verification (all 5 tabs, 375 px and 1280 px viewports, both font themes, console)
+ verification of every prior audit claim against current source. Findings were classified:
**P1** (blocker) / **P2** (should fix) / **P3** (nice to have) / **BY-DESIGN** (settled decision).

---

## 3. Codebase profile

| Metric | Value |
|---|---|
| Source LOC (ts/tsx/css incl. tests) | 7,260 |
| — `components/sections` (7 tab sections) | 1,425 |
| — `components/lunar` (3D + calculator + drawer) | 1,254 impl |
| — `lib` (data, knowledge, math, export; excl. tests) | 1,203 |
| — `components/ui` (11 vendored shadcn primitives) | 819 (verbatim, do-not-touch) |
| — `components/instruments` (charts, palette, pills) | 571 |
| — `components/system` + `layout` + hooks | 546 |
| — tests | 534 |
| Runtime dependencies | 16 (was 47 pre-purge, plan 004) |
| Dev dependencies | 17 |
| TODO / FIXME / HACK markers | **0** |
| Test suites / tests | 8 files / 67 tests |
| Improvement plans executed | 17/17 (`plans/`, all DONE) |
| React / R3F / three | ~19.2.8 (pinned) / v9 / 0.185 |

Architecture is a clean 5-tab SPA (`App.tsx`) with URL deep-linking (`?tab/?site/?candidate/?m/&c/&b`),
a purely functional data layer (`src/lib/`), and both 3D views behind dynamic `import()`
(`Client3D.tsx`) so first paint ships no WebGL.

---

## 4. Data layer integrity — the portal's strongest asset

Two clearly separated strata (documented in `AGENTS.md`, `README.md`, and the architecture doc):

1. **REAL program record** — `PROGRAM_RECORD`, `GATES`, `BUDGET_LEDGER` in
   `src/lib/lunarvoid-data.ts`, frozen from the research repo's R3 terminal report (2026-09-12):
   278-row registry (117 ACTIVE + 161 SUPERSEDED, all tier C), FP 3.74 [1.71, 7.10] per 10⁴ km²
   (calibration-context), gates G0′/G1/G2 FINAL-PASS (2026-08-21/22/24), 58 sessions, 124 tests,
   $0 of $800. **Pinned by 9 dedicated tests** (`program-record.test.ts`) so future agents cannot
   silently "fix" real numbers as if fictional.
2. **Synthetic demonstration set** — `SITES`, `CANDIDATES` (12 of `CATALOG_SIZE = 257`),
   `candidateCount` fuzziness (sums 190), calculator model. Labeled at every user surface:
   Atlas banner ("SYNTHETIC DEMONSTRATION REGISTRY" + link to the real 278-row registry),
   export provenance notes (`registry-export.ts`, schema v2 embeds a `program_record` block),
   footer provenance card.

Known deliberate fuzziness (F-05) is documented as intentional; elevation transects are labeled
parametric illustrations in every export. This is the honest-numbers pattern the ROADMAP's lesson 7
advocates, applied at the data-model level.

---

## 5. Quality gates & testing

| Gate | Result |
|---|---|
| `npm run lint` (oxlint) | 0 errors (2 known, intentional warnings) |
| `npm run typecheck` | 0 errors, `noUncheckedIndexedAccess` ON |
| `npm test` (vitest + happy-dom) | 67/67 — math characterization, chart geometry, URL machine, drawer, knowledge, registry export, program-record pins, smoke |
| `npm run build` | ✓ |
| `npm run format:check` | ✓ (Prettier; `ui/`, `plans/`, `docs/`, `*.md` excluded) |
| CI (`.github/workflows/deploy.yml`) | validate job runs the same gate on push/PR; deploy on main |

Coverage gaps (accepted/by design unless noted):
- **3D components (R3F/WebGL) are deliberately not unit-tested** (documented in AGENTS.md);
  verified manually in real browsers. Compensating control: geometry/math adjacent to 3D is tested.
- **No E2E smoke** — the manual 5-tab live checklist is not codified (F-08, ROADMAP item 6).

---

## 6. Dependencies, bundle & performance

- `npm audit --omit=dev`: **0 vulnerabilities** (re-verified this audit).
- Dependency tree is post-purge minimal: 6 Radix packages (dialog, progress, select, slider, slot,
  tabs) + R3F/drei/three + react + cva/clsx/cmdk/lucide/tailwind-merge. No dead deps remain from
  the plan-004 purge; `src/hooks/use-mobile.tsx` is the one dead **file** left (F-02).
- Production bundle (dist 2.5 MB; JS 1.4 MB raw):

| Chunk | Raw | gzip | Loading |
|---|---|---|---|
| `OrbitControls…js` (three + controls + drei) | 884 K | 233 K | lazy (dynamic import) |
| `index…js` (app) | 468 K | 146 K | initial |
| `index…css` | 68 K | 12 K | initial |
| `LunarGlobe` / `TubeCutaway` | 12 K / 8 K | — | lazy |

- Fonts: 4 Google families, async via print-media swap + `<noscript>` fallback, `display=swap`.
  The union payload (Console + Archive themes) is **permanent by settled decision (2026-09-16)** —
  F-03. Self-hosting via `@fontsource` remains the path to zero third-party runtime calls.
- 3D runtime hygiene (from plans 005/006, spot-verified): globe pointermove re-renders eliminated
  (memo + DOM-ref telemetry), texture + geometry disposal on unmount, cutaway frameloop pauses
  when sounding is paused, texture bake at 1024×512.

Improvement opportunity (P3, optional): modular `three` imports could shrink the 884 K chunk;
low priority because it is lazy-loaded after first paint.

---

## 7. Accessibility & responsive (carried from 2026-09-15 UI audit, 18/20)

Fixed since that audit:
- **P1** hero horizontal overflow at 375 px — `overflow-x-clip` on hero section; re-verified all
  5 tabs at 375 px this audit: no body-level overflow anywhere.
- **P2** active-tab contrast 4.23:1 → **5.56:1** (AA) via `--primary-bright` token
  (`oklch(0.87 0.115 74)`), verified in both font themes.

Open:
- **F-01 (P3)** header icon buttons ~36×28 px touch targets (< 44 px guideline).
- Keyboard operability confirmed (Radix primitives throughout; gates accordion keyboard-operable
  since plan 008).

---

## 8. Security & privacy

- No secrets in repo; no XSS sinks (Phase-3 audit, unchanged since — no `dangerouslySetInnerHTML`
  added; dynamic URLs are query params validated before coercion).
- Third-party runtime calls: **Google Fonts only** (both links are preconnect + async stylesheet;
  no duplicate fetch — the second link is the `<noscript>` fallback).
- External links (`github.com/amrahman90/luna`) are plain anchors, no `target="_blank"` rel gaps.
- Papers/Zenodo links deliberately omitted until public (user decision 2026-09-15) — no
  placeholder/dead links shipped.

---

## 9. Documentation & agent-readiness

Exceptional for a project this size:
- `AGENTS.md` — commands, 7 hard rules, 6 settled decisions (incl. both-fonts-permanent added
  2026-09-16), data-layer facts with do-not-re-litigate warnings.
- `docs/architecture_and_design_plan.md` — as-built, kept current through the provenance reframe.
- `docs/ROADMAP.md` — phase history, metrics table, 14 candid lessons learned.
- `plans/001–017` — executed improvement program, each with commit hashes.
- `docs/README.md` — docs index (this audit added to it).

Drift check: no stale claims found in docs; ROADMAP "Current phase" table still shows 58 tests
(pre-provenance-reframe count; now 67) — cosmetic, will self-correct on next ROADMAP touch (F-11).

---

## 10. Live verification log (2026-09-16)

| Check | Result |
|---|---|
| All 5 tabs render (1280×720 + 375×812) | ✓ |
| Hero telemetry = real program numbers (3.74, 21/649, $0.00) | ✓ |
| Gates tab: 58-session journey, FINAL-PASS badges ×3, real dates, frozen-record strip (6 cells), 3 repo links | ✓ |
| Atlas: synthetic banner + REAL REGISTRY (278 ROWS) link + 12 rows | ✓ |
| Footer: PROJECT PROVENANCE card, no BibTeX, "58 sessions · $0.00 of $800" | ✓ |
| Console errors | 1 — known cosmetic R3F OrbitControls teardown race (settled, AGENTS.md) |
| 375 px overflow (all tabs) | none |
| Both font themes | render + persist correctly |

---

## 11. Findings register

| ID | Severity | Finding | Status / Action |
|---|---|---|---|
| F-01 | P3 | Header touch targets 36×28 px (< 44 px) | Open — small CSS fix |
| F-02 | P3 | `src/hooks/use-mobile.tsx` dead (0 importers confirmed) | Open — delete or wire |
| F-03 | BY-DESIGN | Union font payload (both themes permanent) | Settled 2026-09-16, AGENTS.md |
| F-04 | COSMETIC | R3F OrbitControls teardown console error on tab switch | Settled — do not chase |
| F-05 | BY-DESIGN | `candidateCount` sums 190 vs `CATALOG_SIZE` 257 fuzziness | Intentional, documented |
| F-06 | **P2 (process)** | 25 uncommitted files across 3 stacked changesets; push to main = deploy | **Slice + commit + push deliberately** |
| F-07 | INFO | Papers/Zenodo links omitted until public | User-gated decision 2026-09-15 |
| F-08 | P3 | No E2E smoke (Playwright) codifying the manual 5-tab checklist | Open — ROADMAP item 6 |
| F-09 | BY-DESIGN | 3D components excluded from unit tests (happy-dom/WebGL) | Documented in AGENTS.md |
| F-10 | P3 | `three` chunk 884 K raw / 233 K gzip | Optional: modular imports; lazy-loaded already |
| F-11 | INFO | ROADMAP header table says 58 tests (now 67) | Cosmetic doc drift |

No P1 findings. One process-grade P2 (F-06). Everything else is P3 or settled.

---

## 12. Recommendations (priority order)

1. **Slice and commit the 3 stacked changesets** (motion+fonts / audit fixes / provenance), then
   push to main deliberately — each is independently green; F-06.
2. Touch-target fix for header icon buttons — F-01 (minutes).
3. Delete `use-mobile.tsx` (with the plan-004 import-reachability ritual) — F-02 (minutes).
4. Codify the manual live-smoke checklist as a Playwright E2E job in CI — F-08 / ROADMAP 6.
5. Self-host fonts via `@fontsource` — removes the last third-party runtime call (ROADMAP 4);
   note both themes are permanent, so self-host the full union payload.
6. Optional: modular `three` imports to shrink the lazy chunk — F-10.
7. When papers/Zenodo go public: add DOI links to the footer provenance card (F-07 placeholder
   language already says "see repository").
8. Touch `docs/ROADMAP.md` current-status table when committing (test count 58→67) — F-11.
