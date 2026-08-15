---
date: 2026-08-15
topic: highlight-preferences
---

# Highlight Preferences: Default and Saved Custom Colors

## Problem Frame

Readers can currently recolor individual highlights with five presets or a custom hex color, but every new highlight defaults to gold and custom colors cannot be reused. Readers need lightweight personal color preferences without turning the Bible reader into a color-management dashboard.

The preference belongs to the signed-in reader, should work offline, and should sync across that reader's devices.

---

## Actors

- A1. Reader: chooses a default highlight color, applies colors, saves reusable custom colors, and manages the five custom slots.
- A2. Sync service: keeps private highlight preferences consistent across the reader's devices and preserves local changes while offline.

---

## Key Flows

- F1. Choose a default color
  - **Trigger:** The reader opens highlight preferences.
  - **Actors:** A1, A2
  - **Steps:** Choose one preset or saved custom color; confirm the choice; continue reading.
  - **Outcome:** Future newly created highlights use the chosen color; existing highlights do not change.
  - **Covered by:** R1, R2, R6

- F2. Save and reuse a custom color
  - **Trigger:** The reader creates a custom color in the existing picker.
  - **Actors:** A1, A2
  - **Steps:** Choose a valid opaque six-digit hex color; choose Save and apply; the color is added to saved custom colors; use it later as a swatch or default.
  - **Outcome:** The color is reusable across verses and devices.
  - **Covered by:** R2, R3, R4, R6

- F3. Replace a full custom slot
  - **Trigger:** The reader attempts to save a sixth custom color.
  - **Actors:** A1, A2
  - **Steps:** Show the five existing custom colors; the reader chooses which one to replace; confirm replacement; save and apply the new color.
  - **Outcome:** Only the selected slot is replaced; no color is silently evicted.
  - **Covered by:** R3, R5

- F4. Delete the current default custom color
  - **Trigger:** The reader deletes a saved custom color currently selected as default.
  - **Actors:** A1, A2
  - **Steps:** Remove the saved color; fall back to gold as the default; continue reading.
  - **Outcome:** Existing highlights retain their colors and new highlights use gold.
  - **Covered by:** R1, R5, R6

---

## Requirements

**Default color**
- R1. The reader can choose gold, blue, green, rose, violet, or any saved custom color as the default color.
- R2. Changing the default affects only newly created highlights. Existing highlights keep their current colors.

**Saved custom colors**
- R3. The reader can explicitly save a custom opaque six-digit hex color, with a maximum of five saved custom colors.
- R4. Saving a custom color also applies it to the current verse. Applying a custom color without saving remains possible but does not create a reusable slot.
- R5. When all five custom slots are used, saving another color requires the reader to choose an existing slot to replace; the app never automatically replaces the oldest or least recently used color.
- R6. The reader can reuse saved custom colors on any highlighted verse, select them as the default, and delete them. Deleting the current default custom color falls back to gold.

**Persistence and accessibility**
- R7. Default and saved custom color preferences are private to the signed-in reader, persist offline, and sync across the reader's devices.
- R8. Preference changes use the same canonical lowercase `#rrggbb` format and validation as verse highlight colors; invalid values are rejected without corrupting saved preferences.
- R9. Preference controls have localized labels, selected-state semantics, keyboard operation, visible focus, and do not rely on color alone.
- R10. The preference UI remains compact and Bible-first; it does not introduce a highlight-management dashboard or recolor existing verses in bulk.

---

## Acceptance Examples

- AE1. **Covers R1, R2.** Given gold is the default and one verse is blue, when the reader chooses violet as the default, the blue verse stays blue and the next newly highlighted verse is violet.
- AE2. **Covers R3, R4, R6.** Given fewer than five saved custom colors, when the reader enters `#12ABc0` and chooses Save and apply, the verse becomes `#12abc0` and the color appears as a reusable saved swatch.
- AE3. **Covers R5.** Given five saved custom colors, when the reader saves a sixth, the app asks which existing slot to replace and does not change any slot until the reader chooses one.
- AE4. **Covers R6.** Given a saved custom color is the default, when the reader deletes it, the default becomes gold and existing verses remain unchanged.
- AE5. **Covers R7, R8.** Given a reader saves a color offline, after reconnecting or opening the app on another device, the same default and saved custom colors are available for that reader only.

---

## Success Criteria

- Readers can establish a personal default once instead of recoloring every new verse.
- Custom colors can be intentionally saved and reused without unbounded preference clutter.
- Preferences remain private, durable offline, consistent across devices, and separate from existing verse color state.
- A planner can implement the feature without inventing replacement, deletion, default, or sync behavior.

---

## Scope Boundaries

- No recoloring of existing highlights when the default changes.
- No more than five saved custom color slots.
- No automatic slot eviction.
- No alpha-channel editing, color naming, notes, tags, bulk recoloring, filtering, sharing, or analytics.
- No separate color-management dashboard; use the existing reader palette/settings surface.

---

## Key Decisions

- Default color is an account preference and syncs across devices.
- The default applies only to new highlights.
- Custom colors require an explicit Save action; Save also applies the color to the current verse.
- A full custom collection requires explicit slot replacement by the reader.
- Saved custom colors may be defaults; deleting a default custom color falls back to gold.

---

## Dependencies / Assumptions

- Existing private UID-bound Firestore sync is extended for preferences without changing verse ownership rules.
- Existing local-first persistence remains the offline source of truth until sync succeeds.
- The existing five preset colors and custom picker remain the visual foundation.

---

## Outstanding Questions

### Deferred to Planning

- [Technical] Decide whether preferences live in the existing private settings document or a separate private preference document, while preserving owner-only rules.
- [Technical] Define conflict behavior when the same reader changes preferences on multiple offline devices before reconnecting.
- [Technical] Decide the smallest accessible UI for choosing a replacement slot when five custom colors are already saved.

## Next Steps

-> `/ce-plan` for structured implementation planning
