---
name: 禮中齊讀經 BibleTogether
description: A dark, contemplative Bible reading tracker for church community
colors:
  midnight-ink: "#0a0d14"
  script-white: "#f5f7fa"
  dusk-surface: "#1e232b"
  quiet-silver: "#8896a6"
  deep-ember: "#7e1d1d"
  soft-ring: "#cdd5e0"
  accent-gold: "#facc15"
  completed-green: "#22c55e"
typography:
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontWeight: 600
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.script-white}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.script-white}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  card-default:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.script-white}"
    rounded: "{rounded.lg}"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.script-white}"
    rounded: "{rounded.md}"
  nav-bar:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.quiet-silver}"
---

# Design System: 禮中齊讀經 BibleTogether

## 1. Overview

**Creative North Star: "The Night Reading Room"**

A quiet, contemplative space designed for scripture reading in low-light environments. The interface is a dark canvas that recedes into the background, letting the Bible text take center stage. Like reading by lamplight: the page is lit, everything else is shadow.

The system is restrained and tonal — depth comes from layered neutrals and ring borders rather than shadows. Every element is measured against whether it helps or hinders the act of reading scripture. Motion is minimal and purposeful: state changes and feedback only, no choreographed entrances.

**This system explicitly rejects:** gamified UI (badges, streaks, leaderboards), SaaS-style dashboards with charts, over-designed "modern church" aesthetics (neon, heavy gradients), and anything that competes with the scripture text.

**Key Characteristics:**
- Dark-by-default, always. Light mode is not a priority.
- Flat tonal layering, not shadows, for depth
- Generous reading typography with user-controlled zoom
- Bottom navigation bar (mobile-native PWA)
- Accent colors used sparingly for state indication only (completion, today's highlight)
- System sans-serif throughout — the font fades into the background

## 2. Colors

A restrained dark palette. One neutral surface (midnight-ink) carries everything. Accents are reserved for state: completion markers, today-indicators, and links only.

### Primary
- **Script White** (#f5f7fa): Primary UI text, primary button backgrounds, active nav icons. The "lit page" color — what the reader actually reads.

### Secondary
- **Dusk Surface** (#1e232b): Secondary surfaces, muted backgrounds, secondary buttons, hover states. The layer one step up from the deepest background.

### Neutral
- **Midnight Ink** (#0a0d14): Body background, card background, nav bar. The canvas everything sits on. A very dark blue-black that's warmer than pure black for readability.
- **Quiet Silver** (#8896a6): Secondary/muted text, inactive nav icons, placeholders, labels. Medium gray with a slight cool cast.
- **Soft Ring** (#cdd5e0): Focus rings, subtle borders. Only appears on interaction.

### Semantic
- **Deep Ember** (#7e1d1d): Destructive actions, error states.
- **Completed Green** (#22c55e): Chapter completion indicators, progress bars.
- **Accent Gold** (#facc15 / oklch 86% 0.14 85): Today's schedule highlight, current-month indicator. Used very sparingly (one card border).

### Named Rules
- **The Rarity Rule.** The accent gold and completion green appear on less than 5% of any given screen. Their scarcity gives them meaning. Overuse would flatten the reading experience into a dashboard.

## 3. Typography

**Body Font:** System UI stack (system-ui, -apple-system, sans-serif)

The system sans is a deliberate choice: no font stands between the reader and the scripture. The stack resolves to whatever the device renders best — San Francisco on iOS, Roboto on Android, Inter-like on desktop.

**Character:** Not expressive. Utilitarian and warm. The typeface disappears into the task. The Bible text itself carries all the voice needed.

### Hierarchy
- **Display** (600 weight, 2.25rem / 36px, 1.1 line-height): Page titles (login, settings headers). Never inside the Bible reader.
- **Headline** (600 weight, 1.5rem / 24px, 1.2): Home screen card titles, Bible navigation titles. These are the loudest things in the UI and still quiet.
- **Title** (600 weight, 1.125rem / 18px, 1.3): Card descriptions, section headers.
- **Body** (400 weight, 1rem / 16px base, 1.5 line-height, 65–75ch max for prose): The Bible text itself. User-zoomable via a persisted preference (50-200%).
- **Label** (500 weight, 0.875rem / 14px, normal letter-spacing): Buttons, form labels, tab labels, nav items.
- **Caption** (400 weight, 0.75rem / 12px): People-already-read counts, progress percentages, timestamps. Kept small and visually de-emphasized.

## 4. Elevation

Flat tonal layering. The stack has three levels:

1. **Background** (midnight-ink): The canvas.
2. **Surface** (midnight-ink, with `ring-foreground/10` border): Cards and containers. Visually indistinguishable from the background at rest — only the 1px ring separates them.
3. **Interactive** (dusk-surface on hover, or primary-foreground for primary buttons): Elements that respond to the user.

**No drop shadows.** Depth is conveyed entirely through color contrast, border rings, and state transitions. The flat-ink quality of the background is the point: the app is a quiet room, not a layered dashboard.

## 5. Components

### Buttons
- **Shape:** Gently rounded (8px / rounded-lg). No full-pill shapes.
- **Primary** (bg-primary text-primary-foreground on dark = white on dark-ink): The single call-to-action per screen. Used for "read today's chapter", login, submit.
- **Outline** (border border-border bg-transparent hover:bg-muted): All non-primary buttons. Schedule entries, settings actions, cancel. The default button for most surfaces.
- **Destructive** (bg-destructive/10 text-destructive): Error-resolved actions. Used only in alert dialogs (logout, delete progress).
- **Hover / Focus:** Hover nudges the background color; focus adds a ring-3 at the ring color. Active state pushes the button down 1px (translate-y-px).
- **Size:** Standard at h-8 (32px), large at h-9 for schedule entries, extended at h-14 for primary call-to-action buttons.

### Cards / Containers
- **Corner Style:** Rounded (12px / rounded-xl).
- **Background:** Same as body background (midnight-ink). Only the thin ring (`ring-foreground/10`) distinguishes them from the canvas.
- **Internal Padding:** py-4 (16px) default, py-3 (12px) for sm variant.
- **States:** The today-gold card adds `border-yellow-300` for the current month in the schedule carousel. The completed card has a green progress bar filling from the bottom.
- **No nesting.** Cards are leaf-level containers only.

### Inputs / Fields
- **Shape:** Rounded (8px / rounded-lg), 1px border at border color.
- **Background:** Transparent at rest; `dark:bg-input/30` subtle fill.
- **Focus:** Ring-3 at ring color, border shifts to ring color.
- **Disabled:** Reduced opacity (50%) with pointer-events disabled.
- **Error:** Red ring at destructive color, red border.

### Bottom Navigation
- **Background:** Midnight ink, same as body. A 2px `border-t border-gray-600` separates it from content.
- **Items:** 3-icon grid (Home, Bible, Settings). Icons at 24px size in `text-gray-400` at rest, `text-white` when active.
- **Labels:** 12px (`text-xs`) under each icon.
- **Bible sub-nav:** Appears above the main nav when on the bible page. Contains chapter navigation controls.
- **Position:** Fixed at the bottom of the viewport. z-40 to stay above content.

### Custom Scrollbar
- **Track:** Transparent (10px wide).
- **Thumb:** `#aaa` gray with 5px border-radius.
- **Overscroll:** `overscroll-behavior: none` on html/body to prevent pull-to-refresh conflicts with reading.

### Bible Checkbox
- Simple checked/unchecked toggle rendered beside the chapter completion line.
- State is synced with Firestore progress.
- Triggers the progress bar and completion visual on the schedule card.

### Avatar
- Rounded (size-24 on settings page, standard sizes for shadcn components).
- Image with fallback initial letters.
- Used on settings page for user profile display.

## 6. Do's and Don'ts

### Do:
- **Do** let the Bible text occupy 80%+ of the reading viewport. Every UI element is a guest in the reader's space.
- **Do** keep the reading flow linear: open → read → check → done. No extra friction.
- **Do** use the system sans-serif stack. Custom fonts would add personality at the cost of reading comfort.
- **Do** make interactive elements quiet and consistent. Same button shapes, same form vocabulary, same icon style.
- **Do** use accent gold and completion green sparingly — their rarity gives them meaning.
- **Do** respect reduced motion. All transitions are quick (150-200ms) and limited to state changes.

### Don't:
- **Don't** use gamified UI — no badges, streaks, leaderboards, or competitive elements.
- **Don't** use SaaS-style dashboards with charts, widgets, or metrics panels.
- **Don't** use neon colors, heavy gradients, or glassmorphism effects.
- **Don't** use display fonts or decorative typography anywhere in the UI.
- **Don't** pair `border: 1px solid` with a wide `box-shadow` on the same element. Pick one.
- **Don't** use border-radius larger than 12px on cards or 8px on buttons/inputs.
- **Don't** put anything decorative between the reader and the scripture content.
- **Don't** use gradient text (`background-clip: text`), side-stripe borders, the hero-metric template, or numbered section markers (01/02/03).
- **Don't** create orphan loading states — use skeleton patterns consistent with the surface.
