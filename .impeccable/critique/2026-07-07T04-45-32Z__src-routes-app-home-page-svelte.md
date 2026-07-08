---
target: home page
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-07-07T04-45-32Z
updated: 2026-07-08
slug: src-routes-app-home-page-svelte
---

# Critique: BibleTogether Home Page (Updated)

**Target:** src/routes/(app)/home/+page.svelte (includes VotdCard + ScheduleCard + NavBar layout)
**Slug:** src-routes-app-home-page-svelte
**Assessments:** Independent (parallel sub-agents)
**Viewing context:** Auth-required, source-code analysis

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                          |
| --------- | ------------------------------- | --------- | ------------------------------------------------------------------ |
| 1         | Visibility of System Status     | 4         | Votd error state + retry added                                     |
| 2         | Match System / Real World       | 4         | Chinese throughout, monthly schedule fits real reading rhythm      |
| 3         | User Control and Freedom        | 3         | No prev/next year jump, overscroll can corrupt index               |
| 4         | Consistency and Standards       | 4         | bg-black fixed, placeholder items still needed for carousel        |
| 5         | Error Prevention                | 3         | Votd error handling added, setTimeout race fixed                   |
| 6         | Recognition Rather Than Recall  | 4         | Month cards show everything in one glance                          |
| 7         | Flexibility and Efficiency      | 4         | Chapter Today shortcut + keyboard nav on cards                     |
| 8         | Aesthetic and Minimalist Design | 3         | Minor: competing CSS overflow, size conflict on button             |
| 9         | Error Recovery                  | 3         | Votd retry button present                                          |
| 10        | Help and Documentation          | 3         | Self-explanatory happy path, no onboarding                         |
| **Total** |                                 | **35/40** | **Good — P0/P1 issues resolved**                                   |

## Anti-Patterns Verdict

Not AI-generated. Human-authored with intentional tradeoffs (ponytail comments, embla carousel hacks). P0/P1 bugs have been fixed since original critique.

## What's Working

1. Faithful design-system execution — cards merge into background, subtle progress fills
2. Chapter Today CTA — one tap to next unread chapter
3. Smart integrated progress — month-card fill better than dashboard charts

## Fixed Since Original Critique

### ~~P0 — Votd fetch failure causes permanent loading spinner~~ ✅ FIXED

`+page.svelte` now catches errors, sets `votdError` state, passes `error` + `onRetry` to VotdCard. VotdCard renders error message and retry button.

### ~~P1 — 500ms setTimeout race in Chapter Today~~ ✅ FIXED

Replaced with settle promise:
```ts
await new Promise<void>((resolve) => { settleResolve = resolve; });
```
`$effect` listeners also have proper cleanup via returned function.

### ~~P1 — Carousel schedule cards not keyboard accessible~~ ✅ FIXED

Added `role="button"`, `tabindex="0"`, `onkeydown` (Enter/Space) to clickable `Card.Root`.

### ~~P3 — Empty Card.Footer in votdCard~~ ✅ FIXED

Footer removed from VotdCard.

### ~~P3 — bg-black in nav vs midnight-ink~~ ✅ FIXED

Nav uses `bg-background` (design token).

### ~~Minor — console.log debugging in production~~ ✅ FIXED

Removed from `+layout.svelte`.

### ~~Minor — No aria-current="page" on nav link~~ ✅ FIXED

`navbarItem.svelte` already had `aria-current={isActive ? 'page' : undefined}`.

## Remaining Observations (Intentionally Deferred)

### P2 — Green progress bars on every card

User confirmed: "THIS IS SUPPOSED TO BE A PROGRESS INDICATOR". Intentional.

### P2 — Carousel empty placeholder items

scheduleCard.svelte: first/last `Carousel.Item` hacks. Required by embla carousel for proper centering.

### Minor — No skeleton loading

DESIGN.md requests it. Separate feature.

### Minor — Button size="icon" + class="h-14"

Chapter Today button has both `size="icon"` and `h-14`. Shadcn `h-9` vs custom `h-14`. Cosmetic.

### Minor — transition-duration 300ms exceeds 150-200ms spec

Carousel card transition. Minor spec drift.

### Minor — Hardcoded 2024-2027 carousel range

Static schedule bounds. Update when extending.

## Persona Red Flags (Still Valid)

- **Alex (Power User):** No prev/next year jump on carousel
- **Jordan (First-Timer):** No onboarding, empty schedule list has no explanation
- **Casey (Mobile):** 48 DOM items always rendered, getMonthlyProgress 48× per render
- **Elderly Member:** Small progress text on cards
