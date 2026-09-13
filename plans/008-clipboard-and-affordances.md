# Plan 008: Honest clipboard feedback in the Footer; keyboard-accessible Gates accordion; demote dead Knowledge nodes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 6f6856b..HEAD -- src/components/layout/Footer.tsx src/components/sections/GatesJourneySection.tsx src/components/sections/KnowledgeVaultSection.tsx`
> Expect only the earlier timer-cleanup edit in Footer. Anything else — compare
> excerpts; on mismatch beyond that, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug / a11y
- **Planned at**: commit `6f6856b`, 2026-09-12

## Why this matters

Three small honesty/robustness defects: (1) the Footer's "Copy BibTeX" flips to "COPIED" **synchronously** and never awaits or catches the clipboard promise — on permission denial the user is told a citation was copied when it wasn't, and on non-secure contexts `navigator.clipboard` is undefined → TypeError in the click handler. (2) The Gates accordion header is a plain `<div onClick>` — no `role`, no `tabIndex`, no key handling: the entire criteria matrix is unreachable without a mouse. (3) Knowledge-vault `[[concept]]` rows are styled `cursor-pointer` with hover affordances and an `ArrowRight` chevron but have **no onClick** — they look broken. (Real wiring for those nodes is plan 016; this plan removes the lie in the interim.)

## Current state

Verified excerpts:

```tsx
// src/components/layout/Footer.tsx:19-24
const copyBibtex = () => {
  navigator.clipboard.writeText(bibtex);
  setCopiedBib(true);                       // set before knowing the result
  window.clearTimeout(resetTimer.current);
  resetTimer.current = window.setTimeout(() => setCopiedBib(false), 2000);
};

// src/components/sections/GatesJourneySection.tsx:108-110 — plain div, keyboard-dead
<div
  onClick={() => setExpandedGate(isExpanded ? '' : gate.id)}
  className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-surface/40"
>

// src/components/sections/KnowledgeVaultSection.tsx:146-154 — affordance without behavior
<div
  key={concept}
  className="group flex cursor-pointer items-center justify-between rounded-[2px] border border-border/70 bg-surface/60 p-3 transition-colors hover:border-accent/50 hover:bg-surface/90"
>
  <span className="text-foreground/80 group-hover:text-foreground text-xs">[[{concept}]]</span>
  <ArrowRight className="h-3 w-3 text-muted-foreground transition group-hover:text-accent" />
</div>
```

Footer button label toggles between copied states via `copiedBib` (render section past line 45 — check how the button displays "COPIED"; reuse the same mechanism for an error label).

Conventions: single quotes + named exports in `sections/*` and `layout/*`; Tailwind utility classes; no new components unless necessary.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run typecheck` | exit 0 |
| Tests | `npm test` | all pass |
| Lint | `npm run lint` | exit 0 |
| Build | `npm run build` | `✓ built in …` |

## Scope

**In scope**:
- `src/components/layout/Footer.tsx`
- `src/components/sections/GatesJourneySection.tsx`
- `src/components/sections/KnowledgeVaultSection.tsx`

**Out of scope**:
- `src/components/sections/KnowledgePreviewSection.tsx` — plan 016 restructures both knowledge files around a shared data source; demotion here is the minimal interim fix.
- The BibTeX string content itself.
- Any redesign of the gates section beyond the header element swap.

## Git workflow

- Branch: `advisor/008-clipboard-and-affordances`
- Commit style: `fix(ui): honest clipboard feedback, keyboard-operable gate headers, demote inert wiki nodes`
- Do NOT push.

## Steps

### Step 1: Footer — guard, await, catch

Replace `copyBibtex` with:

```tsx
const [copyFailed, setCopyFailed] = useState(false);

const copyBibtex = async () => {
  setCopyFailed(false);
  try {
    if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
    await navigator.clipboard.writeText(bibtex);
    setCopiedBib(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopiedBib(false), 2000);
  } catch {
    setCopyFailed(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyFailed(false), 2500);
  }
};
```

In the button's rendering: when `copyFailed`, show label `COPY FAILED` (or the existing error-tone utility — check for a `text-warning`/`text-destructive` class already used in the file) with the `X` icon from lucide-react instead of `Check`; otherwise keep current copied/idle rendering. Button gets `type="button"`.

**Verify**: `npm run typecheck` → 0. Manual: dev server → click copy → "COPIED" appears then reverts after 2s. (Simulating denial: run dev over plain-HTTP IP or temporarily throw — optional, not required.)

### Step 2: Gates — make the accordion header a real button

Replace the header `<div onClick…>` with:

```tsx
<button
  type="button"
  aria-expanded={isExpanded}
  onClick={() => setExpandedGate(isExpanded ? '' : gate.id)}
  className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors hover:bg-surface/40"
>
```

(closing `</button>` instead of `</div>`). Note `w-full text-left` added — `<button>` defaults differ from the div it replaces; `aria-expanded` documents state. Verify no nested `<button>` ends up inside (check the row's inner content — if the expand chevron area contains a button, change it to a span).

**Verify**: `npm run typecheck` → 0; dev server → Gates tab: Tab key reaches each gate header; Enter/Space toggles; visual layout unchanged (header still spans the panel width).

### Step 3: Knowledge — demote the inert nodes

In `KnowledgeVaultSection.tsx:146-154`: remove `cursor-pointer`, `transition-colors`, `hover:border-accent/50`, `hover:bg-surface/90`, the `group` class, and the `<ArrowRight …>` element; drop the now-unused `ArrowRight` import. Keep the border/bg/base classes and the `[[{concept}]]` label — rows become static reference chips.

**Verify**: `grep -n "ArrowRight" src/components/sections/KnowledgeVaultSection.tsx` → 0 matches; `npm run lint` → exit 0 (no unused import).

### Step 4: Full gate

`npm run lint && npm run typecheck && npm test && npm run build` — all exit 0. Dev smoke: Footer copy works; Gates keyboard-toggle works; Knowledge tab shows static chips (no pointer cursor).

## Test plan

If plan 002/003 infra exists, add to `src/components/sections/GatesJourneySection.test.tsx` (create): render, `await userEvent.keyboard` focusing the first header and pressing Enter → criteria region appears. Optional — note in commit if skipped (a11y interaction depth is plan 003's domain).

## Done criteria

- [ ] `grep -n "await navigator.clipboard" src/components/layout/Footer.tsx` → 1 match
- [ ] `grep -c "copyFailed" src/components/layout/Footer.tsx` → ≥ 3 (state + set + render)
- [ ] Gates header element is `<button` with `aria-expanded` (grep)
- [ ] `grep -n "ArrowRight\|cursor-pointer" src/components/sections/KnowledgeVaultSection.tsx` → 0 matches
- [ ] `npm run lint && npm run typecheck && npm run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- Footer's render section doesn't have a distinct copied state to model `copyFailed` on — extend minimally but keep the visual language; report if it requires new CSS utilities.
- The gates header contains other interactive elements that would nest illegally inside a `<button>` — if restructuring exceeds a span swap, report with the specific conflict.
- `KnowledgePreviewSection` renders the same `[[node]]` affordance pattern — apply the same demotion there too (add file to scope, note it in the commit), or report if its markup differs materially.

## Maintenance notes

- Plan 016 will RE-ADD interactivity to the knowledge nodes (Dialog with real content) — when that lands, this demotion is superseded; the a11y pattern there must keep them as real buttons.
- Reviewer: keyboard pass over the Gates tab is the acceptance bar — every gate reachable, Enter/Space toggles, no focus trap.
