# Plan 001: Harden the URL deep-link state machine (validate `?site=`, fix popstate symmetry, ⌘K consistency)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/App.tsx src/lib/lunarvoid-data.ts`
> If either file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

The app reads three query params (`?tab=`, `?site=`, `?candidate=`) on load and on browser back/forward. The `tab` param is validated against a whitelist; the `site` param is **cast without validation** and flows into `siteById()`, which uses a non-null assertion (`SITES.find(...)!`). Any shared/bookmarked URL with a typo'd or garbage site value (`?site=TRANQPIT`, `?site=0`) throws `TypeError: Cannot read properties of undefined` during render and white-screens the whole SPA. Additionally the back/forward handler resets params asymmetrically (missing `candidate` is reset, missing `tab`/`site` are left stale) and the ⌘K palette's site navigation sets the atlas filter but **not** the active site, leaving the Overview globe showing a different site than the Atlas the user just jumped to.

## Current state

- `src/App.tsx` — root component; owns `tab`, `activeSite`, `selected`, `siteFilter` state, URL sync, and popstate handling. 190 lines.
- `src/lib/lunarvoid-data.ts` — data layer; `siteById` at line 157: `export const siteById = (id: SiteId) => SITES.find((s) => s.id === id)!;`
- `src/components/sections/ObservatorySection.tsx:19` — `const selectedSite = activeSite ? siteById(activeSite) : SITES[0]!;` (crash site for garbage ids).

Verified excerpts (App.tsx):

```ts
// :22-30 — tab IS validated (the pattern to copy)
const t = params.get("tab") as TabId | null;
if (t && ["overview", "atlas", "fusion", "gates", "knowledge"].includes(t)) {
  return t;
}

// :32-37 — site is NOT validated (the bug)
const s = params.get("site") as SiteId | null;
return s ?? "TRANQPIT1";

// :49-54 — siteFilter init has the same unchecked cast
const s = params.get("site") as SiteId | null;
return s ?? "ALL";

// :71-93 — popstate handler: site unchecked (:78-81); absent tab/site left stale
const s = params.get("site") as SiteId | null;
if (s) {
  setActiveSite(s);
  setSiteFilter(s);
}
const candId = params.get("candidate");
if (candId) { ... } else { setSelected(null); }   // candidate IS reset when absent

// :179-182 — ⌘K site nav skips activeSite (contrast inspectSiteInAtlas :113-117 which sets all three)
onSelectSite={(siteId) => {
  setSiteFilter(siteId);
  setTab("atlas");
}}
```

Repo conventions: conventional commits (`fix:`, `feat:` — see `git log --oneline -5`). TypeScript with `verbatimModuleSyntax` — type-only imports must use `import type`. Named function declarations preferred in `src/lib/`.

## Commands you will need

| Purpose   | Command               | Expected on success |
|-----------|-----------------------|---------------------|
| Install   | `npm ci`              | exit 0              |
| Typecheck | `npx tsc -b`          | exit 0, no errors   |
| Lint      | `npm run lint`        | exit 0 (warnings in `src/components/ui/` are pre-existing and acceptable) |
| Build     | `npm run build`       | ends with `✓ built in …` |

No test runner exists yet at time of writing (plan 002 adds one). Verify via typecheck/build plus the greps below.

## Scope

**In scope** (the only files you should modify):
- `src/App.tsx`
- `src/lib/lunarvoid-data.ts` (add the guard helper only)

**Out of scope** (do NOT touch):
- `src/components/sections/ObservatorySection.tsx` — the crash disappears once `activeSite` can never hold an invalid id; its `SITES[0]!` is handled by plan 013.
- `src/components/lunar/LunarGlobe.tsx` — same reasoning.
- The URL *write* contract (`App.tsx:59-68`) — shared links omit defaults today (`tab=overview`, `site=TRANQPIT1` are stripped); do not change what is persisted.
- `siteFilter` is deliberately **not** persisted to the URL: it is ephemeral view state; `activeSite` is the canonical link state. Record this decision in the commit message.

## Git workflow

- Branch: `advisor/001-url-state-hardening`
- Commit style: `fix(app): validate ?site= param and symmetrize popstate/back-forward handling`
- Do NOT push.

## Steps

### Step 1: Add a site-id guard to the data layer

In `src/lib/lunarvoid-data.ts`, directly above `siteById` (line ~157), add:

```ts
const SITE_IDS = new Set<string>(SITES.map((s) => s.id));

export function isSiteId(value: string | null): value is SiteId {
  return value !== null && SITE_IDS.has(value);
}
```

Also make `siteById` total (defensive; the App fix makes it unreachable, but it is exported API):

```ts
export const siteById = (id: SiteId) => SITES.find((s) => s.id === id) ?? SITES[0]!;
```

**Verify**: `npx tsc -b` → exit 0.

### Step 2: Validate the site param in all three readers in App.tsx

Add to the existing `@/lib/lunarvoid-data` import: `isSiteId`.

Replace the `activeSite` initializer (:32-37) with:

```ts
const [activeSite, setActiveSite] = useState<SiteId | null>(() => {
  if (typeof window === "undefined") return "TRANQPIT1";
  const s = params.get("site");
  return isSiteId(s) ? s : "TRANQPIT1";
});
```

(Note: hoist `const params = new URLSearchParams(window.location.search);` is already per-initializer in the current code; keep the existing per-initializer style.)

Replace the `siteFilter` initializer (:49-54) with the same guard, defaulting to `"ALL"`.

Replace the popstate site block (:78-81) with:

```ts
const s = params.get("site");
if (isSiteId(s)) {
  setActiveSite(s);
  setSiteFilter(s);
}
```

**Verify**: `npx tsc -b` → exit 0. `grep -n 'as SiteId | null' src/App.tsx` → **no matches** (the tab cast `as TabId | null` may remain — check it is only applied to `tab`).

### Step 3: Make popstate symmetric for absent params

In the popstate handler, reset to defaults when a param is absent, mirroring the existing `candidate` handling:

```ts
const t = params.get("tab");
if (t && ["overview", "atlas", "fusion", "gates", "knowledge"].includes(t)) {
  setTab(t);
} else {
  setTab("overview");
}
const s = params.get("site");
if (isSiteId(s)) {
  setActiveSite(s);
  setSiteFilter(s);
} else {
  setActiveSite("TRANQPIT1");
  setSiteFilter("ALL");
}
```

**Verify**: `npx tsc -b` → exit 0.

### Step 4: Fix ⌘K site navigation to set activeSite

Change the `CommandPalette` prop at :179-182 to mirror `inspectSiteInAtlas`:

```ts
onSelectSite={(siteId) => {
  setSiteFilter(siteId);
  setActiveSite(siteId);
  setTab("atlas");
}}
```

**Verify**: `npm run build` → `✓ built in …`.

### Step 5: Manual smoke of the crash case

1. `npm run dev` → open the printed localhost URL.
2. Append `?site=GARBAGE` → app must render the Overview tab with TRANQPIT1 dossier, no blank page, no console TypeError.
3. Append `?site=MARIUS&tab=atlas` → atlas filtered to MARIUS.
4. Open ⌘K → Sites → HADLEY → Atlas opens filtered to HADLEY, and switching to the Overview tab shows the HADLEY dossier (site pills highlight HADLEY).

**Verify**: all four URL cases behave as described; `npm run lint` → exit 0.

## Test plan

No runner exists yet. When plan 002 lands, plan 003 adds `src/App.test.tsx` cases: `?site=GARBAGE` renders without crash; popstate with bare URL resets to overview/TRANQPIT1/ALL. Note this in the commit message as a follow-up.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx tsc -b` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -n 'as SiteId' src/App.tsx` returns no matches
- [ ] `grep -n 'isSiteId' src/lib/lunarvoid-data.ts src/App.tsx` shows the export and ≥3 usages
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `src/App.tsx` no longer contains the three `useState` initializers and one popstate handler as excerpted (structure drifted).
- `SITES` in `lunarvoid-data.ts` no longer has 8 entries with string `id`s.
- Fixing the popstate symmetry causes a visible navigation loop (URL flickering between states) — that means the write-effect at :59-68 and popstate now fight each other; report before changing the write-effect.
- You find `siteFilter` is already persisted to the URL (someone landed that independently) — coordinate instead of double-fixing.

## Maintenance notes

- Plan 015 extends this same URL-sync effect with calculator params — keep the effect's shape (single effect, `replaceState`, default-stripping) intact.
- The default site `"TRANQPIT1"` is hardcoded in three places after this plan; acceptable (it is also the write-effect's stripped default at :62). A future `DEFAULT_SITE` constant in the data layer would consolidate.
- Reviewer should scrutinize: no behavior change for valid URLs (before/after on `?tab=atlas&site=MARIUS&candidate=CAND-MARIUS-001` must be identical).
