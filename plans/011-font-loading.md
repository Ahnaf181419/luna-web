# Plan 011: Load web fonts without blocking first paint; prune unused variants

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- index.html`
> Only font/OG changes expected. If the font link markup differs from the excerpt,
> re-read before editing.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (brief FOUT possible instead of blank-then-paint)
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

`index.html` loads the Google Fonts CSS with a **render-blocking** `<link rel="stylesheet">`. This is a static SPA with no SSR/prerender: if `fonts.googleapis.com` is slow, users see a blank page even after the app's JS/CSS are ready — every cold visit takes a cross-origin round-trip penalty before first paint. The request also pulls ~15 weight/style variants across 4 families, more than the UI uses. The fix (async pattern + pruning) makes first paint independent of the font CDN; `display=swap` is already set, so text renders in fallback immediately and swaps when ready.

## Current state

Verified excerpt — `index.html:13-15`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
```

Families requested: Instrument Sans (5 incl. italic 400), JetBrains Mono (4), Newsreader variable (3), Syne (3). Font usage: mono (`font-mono`, `label-mono` utility) and display faces are wired via `src/index.css` (`--font-sans/--font-mono/--font-display`-style tokens — grep `font-family` in index.css to map families to utilities before pruning).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | `✓ built in …` |
| Built HTML check | `grep -o 'media="print"[^>]*' dist/index.html` | 1 match after Step 1 |
| Tests | `npm test` | all pass (if infra present) |

## Scope

**In scope**:
- `index.html` (font `<link>` strategy + variant list only)

**Out of scope**:
- `src/index.css` font-family tokens and utilities.
- Self-hosting fonts (`@fontsource`) — bigger change, revisit later (see maintenance notes).
- Favicon/OG tags.

## Git workflow

- Branch: `advisor/011-font-loading`
- Commit style: `perf(html): async-load Google Fonts and prune unused variants`
- Do NOT push.

## Steps

### Step 1: Switch to the async load pattern

Replace the stylesheet link with the print-media swap pattern (keeps preconnects):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=…PRUNED…&display=swap"
      media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=…PRUNED…&display=swap">
</noscript>
```

(The href is duplicated intentionally — `media="print"` hack + noscript fallback.)

**Verify**: `npm run build` → `✓ built`; `grep -c 'media="print"' dist/index.html` → 1.

### Step 2: Prune unused variants — evidence first

Before pruning, gather usage evidence per family/variant:

```bash
grep -n "font-syne\|font-newsreader\|font-mono\|font-sans\|italic\|font-black\|font-bold\|font-semibold\|font-medium" src/index.css | head -30
grep -rn "font-syne\|font-newsreader\|italic" src --include='*.tsx' | grep -v ui/ | head -10
```

Rules: keep a family/variant if any `font-*` utility or explicit class referencing it exists OR if default body text uses it (`--font-sans` default). Known-strong candidates to drop if unused: Instrument Sans **italic 400** (grep finds no `italic` utility in app code at plan time), Syne **600** if only 700/800 appear via `font-display` utilities. When evidence is ambiguous, KEEP the variant — pruning is secondary to not breaking a heading.

Apply the pruning inside BOTH hrefs from Step 1.

**Verify**: `npm run build`; dev server: headings still render in Syne/Newsreader, body in Instrument Sans, telemetry text in JetBrains Mono; some text flashes fallback then swaps (acceptable FOUT).

### Step 3: Cold-load sanity

Hard-reload the dev server (or `npm run preview`) with DevTools network throttling "Slow 4G" (optional but recommended): first paint appears with fallback text before fonts arrive; no blank screen while fonts load.

**Verify**: page interactive before font CDN responds (throttle fonts.googleapis.com request if DevTools available).

## Test plan

No unit tests (HTML loading strategy). `npm test` must remain green — it doesn't touch index.html.

## Done criteria

- [ ] `grep -c 'media="print"' dist/index.html` → 1
- [ ] `grep -c '<noscript>' dist/index.html` → 1
- [ ] Pruned href shorter than the original; every remaining family still referenced by a CSS utility (spot-check via the Step-2 greps)
- [ ] `npm run build` exits 0
- [ ] Only `index.html` modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Grep evidence shows an `italic` or Syne-600 usage the plan didn't predict — keep that variant (STOP only if usage evidence is contradictory and you can't decide).
- The `onload` attribute is stripped by some build step (check `dist/index.html` after build) — report; the pattern requires it inline.

## Maintenance notes

- Next level (deferred): self-host via `@fontsource/*` packages — removes the third-party dependency entirely and enables long-term caching with the app's own origin; do it as its own plan if the CDN ever becomes a liability (privacy-conscious visitors, blocked domains).
- Reviewer: check `dist/index.html` (not just source) — Vite rewrites/minifies the head; the print-media pattern must survive.
