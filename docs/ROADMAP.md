# LUNARVOID Portal — Roadmap, Status & Lessons

> Living document. Current as of **2026-09-13**.
> Execution record for the 17-plan improvement program lives in
> [`../plans/README.md`](../plans/README.md).

## Current phase & status

**Phase 4 — Hardening & Growth (COMPLETE). Status: 🟢 ALL GREEN, ready to ship.**

| Gate | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ 0 errors (2 known warnings: vendored `ui/button.tsx` fast-refresh + intentional `TubeCutaway` export) |
| Typecheck | `npm run typecheck` | ✅ 0 errors — with `noUncheckedIndexedAccess` ON |
| Tests | `npm test` | ✅ 7 files, **67 tests** passing (was 0 at program start) |
| Format | `npm run format:check` | ✅ clean (Prettier, ui/ excluded) |
| Build | `npm run build` | ✅ ~0.9s |
| Live smoke | dev server, all 5 tabs | ✅ globe WebGL, 12 atlas rows, CSV export, calculator seeding, 20 knowledge dossiers |

**17/17 improvement plans executed** (commits `826e98b` → `06432ca`, 2026-09-13).
CI (`validate` → `deploy`) runs the same gate on every push/PR; pushing `main`
publishes to https://ahnaf181419.github.io/luna-web/ — **not yet pushed: run
`git push` when ready to publish this batch.**

## Complete roadmap

### Phase 0 — Original app (pre-2026-09) ✅
Cinematic Research Showcase, own UI stack, deep-linking + hydration-safe hooks.

### Phase 1 — Portal migration ✅ (commit `05e66e1`, 2026-09-12)
- Full UI migration from `lunarvoid-explorer`: design system, 46 shadcn
  primitives, R3F globe + tube cutaway, 5-tab layout, merged richer data layer.
- Deploy pipeline: GitHub Actions → Pages at `/luna-web/`, live verified.
- Independent code review + fixes (drawer state, texture/cursor/timer cleanup,
  `CHART` tokens, `CATALOG_SIZE`).

### Phase 2 — Design overhaul ✅ (commits `af73770`, `6f6856b`, upstream author)
"Planetary cartography & sonar workbench" design system; overlay-collision and
responsive fixes. (Landed between advisor sessions; audited as-found.)

### Phase 3 — Audit ✅ (2026-09-13)
`improve` skill: 4 parallel audit agents, 9 categories, every finding vetted
against source; 19 findings + 4 directions → 17 self-contained plans.
Security: clean (no XSS sinks, 0 `npm audit` vulns, no secrets).

### Phase 4 — Hardening & Growth ✅ (2026-09-13, 17 commits)
| Plan | Delivered | Commit |
|---|---|---|
| 001 | URL `?site=` crash fixed; popstate symmetry; ⌘K consistency | `826e98b` |
| 002 | vitest + happy-dom + Testing Library; `typecheck` script; CI validate job gates deploy; actions v5 | `3db8c65` |
| 003 | 35-test characterization suite: math, chart geometry, URL machine, drawer | `c91b4fd` |
| 004 | 35 dead ui primitives + 32 dead deps removed (runtime deps 47→16); dead math exports dropped | `8ef217f` |
| 005 | Globe: per-pointermove re-renders eliminated (memo + DOM-ref readout); texture bake halved (1024×512, no grain pass) | `28bbd95` |
| 006 | Cutaway: ExtrudeGeometry dispose; frameloop pauses when sounding paused (verified orbit still works in demand mode) | `f43b559` |
| 007 | PDF curve self-normalized — no more clipping above score ~0.70 | `e5bcfc5` |
| 008 | Clipboard honesty (await/catch/fallback label); gates accordion keyboard-operable; inert wiki nodes demoted | `6d4eab3` |
| 009 | As-built architecture doc; docs index + README truth pass; **AGENTS.md** | `12d5f57` |
| 010 | Dedup: `formatCoord(sep)`, `toPolylinePath`, `SitePills` component | `ce3b129` |
| 011 | Fonts async-loaded (print-media swap) + 4 unused variants pruned | `93f4a0f` |
| 012 | Prettier + EditorConfig; mass-format (ui/ excluded); format gate in CI | `06432ca` |
| 013 | `noUncheckedIndexedAccess` ON; real guards; single `FIRST_SITE` anchor | `e0d5f2a` |
| 014 | CSV/JSON registry export with provenance labels (atlas buttons + ⌘K action); MIT LICENSE | `5ca7063` |
| 015 | Calculator ↔ registry: "Open in calculator", seeded sliders, published-vs-fusion comparison chip, `?m/&c/&b/&src=` shareable scenarios | `e59b4cb` |
| 016 | Knowledge vault made real: 20 curated dossiers via Dialog, single MOC source, honest counts (was "107 atomic notes", zero existed) | `6204356` |
| 017 | Parametric cutaway spike: candidate geometry drives the 3D view (all 12 verified readable); verdict **SHIP-AS-IS** | `6e7df1b` |

### Phase 5 — Recommended next (proposals, not yet planned)

Ordered by leverage; each needs a design pass before implementation:

1. **Zenodo + DOI closure of the G3 promise** — the export (plan 014) is the
   artifact; archiving it + linking the DOI next to the BibTeX completes the
   "open artifact" story. Small effort, high credibility.
2. **Optional NASA moon basemap** (commit `c47f482`, 2026-09-13) — DONE in-session.
   Drop `public/moon/ldam_4k.jpg` from NASA's CGI Moon Kit (SVS #4720,
   public-domain LROC WAC color map) and the 3D globe upgrades automatically;
   bump `MOON_ASSET_VERSION` in `LunarGlobe.tsx` to defeat stale caches. The
   embedsolar system.nasa.gov/gltf_embed/2366 URL is dead (maintenance page
   since the site's 2024 migration to science.nasa.gov); the right NASA asset
   for our sphere is the public-domain color map, not the 3D viewer.
3. **Photorealistic PBR moon** (2026-09-14, in-session) — DONE. Replaced the
   bump-map-from-luminance hack with proper Sobel-derived normal maps and a
   luminance-derived roughness map (both computed at upload time in canvas
   getImageData loops, no extra assets). Bumped sphere subdivisions 96→192 so
   the displacement reads cleanly across the terminator. Tuned lighting for the
   airless-moon model: minimal ambient, single harsh "sun" directional, faint
   earthshine fill, slight hemisphere sky. Source: Solar System Scope 2K moon
   color map (CC-BY 3.0; LROC WAC derivative, public-domain lineage). HUD label
   updated honestly: "LROC color basemap · derived normal & roughness · PBR".
3. **Content reconciliation** — the registry's numeric story has known deliberate
   fuzziness (candidateCount sum 190 vs CATALOG_SIZE 257; G1 "17 targets" vs C1-1
   "21 sites"): pick the canon, update data + export together.
4. **Self-host fonts** (`@fontsource`) — removes the last third-party runtime
   dependency (privacy + resilience); mechanical.
5. **Coverage expansion** — more of the 21 DTM sites / 245 unpublished candidates
   when the fictional registry grows; the data layer + export scale for free.
6. **E2E smoke (Playwright)** — the manual live-smoke checklist (5 tabs, drawer,
   calculator, export) codified; guards regressions CI can't catch with happy-dom.

## Progress metrics

| Metric | Program start (6f6856b) | Now |
|---|---|---|
| Tests | 0 | 67 passing |
| Runtime dependencies | 47 | 16 |
| Vendored ui files | 46 | 11 (verbatim) |
| CI gates on push | build only | lint + typecheck + test + format + build |
| Known crash bugs | 1 (garbage `?site=` white-screens SPA) | 0 |
| Instrument rendering bugs | 1 (PDF clip > 0.70) + 1 latent (inferenceScore sign) | 0 |
| Dead interactive UI | 20 fake wiki nodes, keyboard-dead gates | 0 |
| Honest content claims | "107 atomic notes" (nonexistent), "257 published" (12) | 20 real dossiers, "257 indexed / 12 published" |
| 3D resource hygiene | 1 texture dispose | texture + geometry dispose + paused frameloop |
| Docs | stale (React 18, glassmorphism, phantom tree) | as-built + AGENTS.md |

## Lessons learned

1. **Vendored ≠ exempt from reachability checks.** Two-thirds of the dependency
   tree existed only to compile never-imported shadcn files. The transitive
   import-closure script (plans/004 Step 1) is now the recorded gate for any
   primitive add/delete.
2. **Tests before perf work.** The 003 characterization suite is what made 005/007
   (render-sensitive 3D + math-adjacent chart changes) safe to land same-day.
3. **`Number(null) === 0`** — absent query params validated only with
   `Number.isFinite` silently create zero-seeds. Null-check the raw string before
   coercion (caught live during the 017 spike).
4. **`tsc -b` can serve stale tsbuildinfo** after rapid consecutive edits — verify
   surgical refactors with `tsc -b --force` (masked a real error once this session).
5. **Headless WebGL pointer events are not representative.** R3F pointer-move
   raycasts didn't fire under headless Chromium for old AND new code alike —
   behavioral parity between versions, not absolute behavior, was the valid check.
6. **Static analysis over-reports; vet every finding.** ~15% of subagent findings
   were by-design (settled decisions) or mis-attributed; each table entry was
   confirmed against source before a plan was written.
7. **Honest-number fixes beat fake-content fixes.** Replacing "107 atomic notes"
   with 20 real dossiers (and "257 published" with "12 of 257") cost less than
   generating filler and aligns with the portal's own epistemic thesis.
8. **Write AGENTS.md when decisions are settled, not when they're needed.** The
   react-pin rationale, vendored-ui rule, and oxlint choice survived three agent
   sessions undocumented — the fourth session would have re-litigated them.
9. **Docs labeled "baseline built" that describe a different app are worse than
   no docs** — agents follow them into phantom directories. Rewrite as-built or
   mark historical (plan 009 pattern).
10. **Small clamps beat camera rework.** The cutaway spike's geometry clamps
    (sqrt-span radius, depth-ratio floor, shaft-width cap) made all 12 candidates
    readable under the existing fixed camera — zero scene-layout changes needed.
11. **Bust the cache when the asset's later arrival must be observable.** A page that
    loads a not-yet-present asset (404/HTML fallback cached) will keep showing the
    stale fallback indefinitely once the file appears, unless the URL itself
    changes. A small `?v=` constant in code — bumped when the asset changes —
    turns this from a sticky bug into a deploy-time signal (`MOON_ASSET_VERSION`
    in `LunarGlobe.tsx`).
12. **MIME matters even when bytes are decodable.** Browsers vary on whether they
    decode an image via magic bytes when `Content-Type` disagrees with the
    extension. Our test fixture (PNG bytes served via `.jpg` extension with
    `Content-Type: image/jpeg`) decoded in `curl` and `Pillow` but tripped some
    Image-decoder paths in Chromium. Always match the file's extension to its real
    format and verify with a real browser before claiming "the texture loads".
13. **Procedurally-derived PBR maps beat shipped placeholder bumps.** With only
    the LROC color map reachable (the SVS 4K/16K derivative maps were
    unreachable from the build sandbox), the highest-fidelity moon came from
    a Sobel-of-luminance normal map + luminance-→-roughness map, both
    computed in `getImageData` loops at upload time. Zero extra assets, no extra
    network dependency, real surface relief + mare/highland specular contrast.
14. **Match GPU texture-slot dimensions across procedural and real paths.**
    When the procedural canvas was 1024×512 and the real LROC map was 2048×1024,
    Three.js raised `glTexSubImage2D: Offset overflows texture dimensions`
    because the GPU texture had been allocated at the smaller dimensions and a
    new image was being uploaded into it. Resizing the procedural canvas to
    match the real asset's dimensions eliminated the warning and avoided a
    brief reallocation stall on the upgrade path.
