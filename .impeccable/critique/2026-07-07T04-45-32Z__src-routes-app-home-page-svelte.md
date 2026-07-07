---
target: home page
total_score: 30
p0_count: 1
p1_count: 2
timestamp: 2026-07-07T04-45-32Z
slug: src-routes-app-home-page-svelte
---

# Critique: BibleTogether Home Page

**Target:** src/routes/(app)/home/+page.svelte (includes VotdCard + ScheduleCard + NavBar layout)
**Slug:** src-routes-app-home-page-svelte
**Assessments:** Independent (parallel sub-agents)
**Viewing context:** Auth-required, source-code analysis

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                          |
| --------- | ------------------------------- | --------- | ------------------------------------------------------------------ |
| 1         | Visibility of System Status     | 3         | Votd fetch failure → infinite spinner, no error state              |
| 2         | Match System / Real World       | 4         | Chinese throughout, monthly schedule fits real reading rhythm      |
| 3         | User Control and Freedom        | 3         | No prev/next year jump, overscroll can corrupt index               |
| 4         | Consistency and Standards       | 3         | bg-black in nav vs bg-background, placeholder item hacks           |
| 5         | Error Prevention                | 2         | No votd error handling, 500ms setTimeout race, hardcoded 2024-2027 |
| 6         | Recognition Rather Than Recall  | 4         | Month cards show everything in one glance                          |
| 7         | Flexibility and Efficiency      | 3         | Chapter Today shortcut good, no keyboard nav                       |
| 8         | Aesthetic and Minimalist Design | 3         | Empty Card.Footer, competing CSS overflow                          |
| 9         | Error Recovery                  | 2         | No votd error path, no toast/retry                                 |
| 10        | Help and Documentation          | 3         | Self-explanatory happy path, no onboarding                         |
| **Total** |                                 | **30/40** | **Good — address P0/P1 issues**                                    |

## Anti-Patterns Verdict

Not AI-generated. Human-authored with intentional tradeoffs: ponytail comments, real Tailwind v4 migration issues, pragmatic setTimeout shortcut. One slop tell: empty Card.Footer remnant.

## What's Working

1. Faithful design-system execution — cards merge into background, subtle progress fills
2. Chapter Today CTA — one tap to next unread chapter
3. Smart integrated progress — month-card fill better than dashboard charts

## Priority Issues

### P0 — Votd fetch failure causes permanent loading spinner

+page.svelte:15, votdCard.svelte:23-28. Network failure → infinite spinner, no retry, no error. Complete task blocker.

### P1 — 500ms setTimeout race in Chapter Today

scheduleCard.svelte:62-65. Scroll animation may take >500ms on slow devices → navigates to wrong month. Also: $effect listeners never cleaned up.

### P1 — Carousel schedule cards not keyboard accessible

scheduleCard.svelte:69. Clickable div with no role="button", tabindex, or onkeydown. WCAG SC 4.1.2.

### P2 — Green progress bars on every card violate The Rarity Rule

scheduleCard.svelte:57-58, 76-78. 100% coverage vs ≤5% spec. Progress dashboard feel. USER ANSWER: THIS IS SUPPOSED TO BE A PROGRESS INDICATOR

### P2 — $effect event listeners never cleaned up

scheduleCard.svelte:30-39. api.on('scroll') and api.on('settle') registered with no cleanup → memory leaks on remount.

### P2 — Carousel empty placeholder items

scheduleCard.svelte:80-81, 111-112. Invisible focusable DOM capturing taps. Competing overflow values on .carouseldiv.

### P3 — Empty Card.Footer in votdCard

votdCard.svelte:21. Dead DOM, breaks visual continuity.

### P3 — bg-black in nav vs midnight-ink

+layout.svelte:32. Off-spec by hex points.

## Cognitive Load

Low in happy path. Spikes to high on votd failure (infinite spinner with no recourse).

## Persona Red Flags

- **Alex (Power User):** No keyboard nav or year jump
- **Jordan (First-Timer):** No onboarding, empty schedule list has no explanation
- **Casey (Mobile):** 48 DOM items always rendered, getMonthlyProgress 48× per render
- **Elderly Member:** Infinite spinner on votd failure, small progress text

## Minor Observations

- console.log debugging in production
- No skeleton loading (DESIGN.md requires it)
- Button size="icon" + class="h-14" — conflicting size
- transition-duration 300ms exceeds 150-200ms spec
- Hardcoded 2024-2027 carousel range
- No aria-current="page" on nav link
