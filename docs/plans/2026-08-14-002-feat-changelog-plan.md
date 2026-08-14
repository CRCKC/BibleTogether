---
title: "feat: Add in-app changelog"
type: feat
status: active
date: 2026-08-14
---

# feat: Add in-app changelog

## Overview

Add a bundled “What’s New” experience for each app release. Returning users see a quiet, one-time notification after a version change, and everyone can reopen the full release history from Settings. Release notes remain available offline with the existing PWA shell.

---

## Problem Frame

BibleTogether is updated as a static SvelteKit PWA, but users currently have no in-app explanation of what changed. The existing service-worker toast only says that an update is available; it does not provide release notes. Users need a clear, low-friction way to discover the changes without interrupting Bible reading or adding a backend content-management system.

The smallest useful version is static, versioned release-note data shipped with the app, a Settings entry point, and a non-blocking post-update prompt keyed to the installed app version.

---

## Requirements Trace

- **R1. Versioned release notes:** Store one or more release entries containing a version, date, localized title, and localized bullet points.
- **R2. Reliable discovery:** After an existing user loads a different installed app version, show one dismissible “What’s New” notification with a link to the full changelog.
- **R3. Revisit access:** Add a localized Settings link to the complete changelog page.
- **R4. Offline availability:** Changelog content is bundled with the client and works through the existing PWA/offline navigation path.
- **R5. Quiet, accessible UI:** Do not block the reader with a modal; use existing accessible buttons/links, readable typography, keyboard access, and the project’s dark reading-room visual system.
- **R6. Release workflow:** The app version and newest changelog entry must stay aligned so a release reliably triggers discovery.

---

## Scope Boundaries

- No Firestore collection, remote CMS, admin editor, API, or server-rendered release-note feed.
- Release notes are public bundled content: never put secrets, personal data, or operationally sensitive details in them; render authored copy as escaped text.
- No email, push notification, analytics, or per-user cloud “read” state.
- No custom semantic-version comparison; any stored version different from the current version is treated as a new release.
- No change to the existing service-worker update detection or activation behavior.
- No redesign of the existing hardcoded PWA install/update copy; localizing that broader PWA surface is separate work.
- No changelog authoring workflow beyond editing the bundled release data and bumping `package.json` for a release.

---

## Context & Research

### Relevant Code and Patterns

- `src/routes/(app)/settings/+page.svelte` is the existing authenticated settings surface and already uses shared `Button`, `base`, and `$t()` patterns for navigation.
- `src/routes/(app)/+layout.svelte` owns the authenticated app shell and bottom navigation. It is the safe place for a post-update notice because it does not run on login/signup routes.
- `src/lib/pwa/pwa.svelte` owns the existing `needRefresh`/service-worker toast. The changelog prompt should remain separate: service-worker update availability is not the same as release-note discovery.
- `src/routes/+layout.svelte` mounts PWA behavior globally before auth/app content; do not put the changelog prompt there or it may appear during login/signup.
- `src/lib/components/ui/dialog` and `src/routes/(app)/settings/zoomPopup.svelte` show the repository’s dialog conventions, but the update notice should use a non-blocking toast to respect the product rule against modal surprises in the reading flow.
- `src/lib/utils/localStore.svelte.ts` is the existing local persistence pattern. The last-seen release marker is a single browser-local string and should use a small guarded storage helper rather than introducing a new persistence dependency.
- `src/lib/locales/en.json` and `src/lib/locales/zh.json` are the existing localization sources for labels and status copy.
- `vite.config.ts` and `src/sw.ts` already bundle client assets and provide SPA navigation fallback, so a static changelog route requires no new caching layer.
- `PRODUCT.md` and `DESIGN.md` require mobile-first, dark, Bible-first, quiet UI with no gamification or attention-stealing decoration.

### Institutional Learnings

- No `docs/solutions/` directory or applicable institutional learning was found.

### External References

- None needed. The repository already has the relevant Svelte, PWA, toast, localization, and persistence patterns.

---

## Key Technical Decisions

- **Bundle release notes in the client.** This is the existing deployment model, works offline, avoids auth/rules/API work, and lets release notes ship atomically with the code they describe.
- **Use `package.json` as the version source.** Vite already supports JSON imports, and this avoids maintaining a second runtime version file. A release bumps the package version and adds a matching newest entry.
- **Track only the last-seen version in `localStorage`.** The prompt is a device-local discovery aid, not account data. Missing storage must not prevent the app from loading; fall back to an in-memory “shown this session” guard.
- **Show a toast with an action, not a modal.** It is visible after an update but does not cover Scripture, steal focus, or interrupt the open → read → check flow. The Settings link remains the durable path to the full history.
- **Treat any version mismatch as new.** This is one equality check rather than a custom semver parser; downgrades or rollback builds should still surface the notes.
- **Keep release content bilingual in the changelog data.** Every entry must provide both English and Chinese title/bullet text; UI labels remain in `en.json`/`zh.json`. The selector may fall back to English only for an unsupported runtime locale, not for a missing required translation.

---

## Open Questions

### Resolved During Planning

- **Where should users enter the feature?** Settings gets a “What’s New” link, and the authenticated app shell shows a one-time post-version toast.
- **When should the automatic prompt appear?** On the first authenticated app-shell mount after the stored version differs from the current package version. A fresh browser with no stored version silently records the current version instead of showing historical notes as an update.
- **Should the prompt block reading?** No. It is a dismissible toast with a keyboard-operable action.
- **When is the version marked seen?** The action marks it after `${base}/changelog` navigation succeeds; an explicit dismiss marks it seen; automatic timeout does not, so a user who never interacts can discover it on the next full app-shell mount. Failed navigation does not mark it seen.
- **Is the changelog private?** No. It lives under the existing client-side app route and is public bundled content without secrets or user data. Existing client-side auth routing still handles unauthenticated deep links; the feature does not claim a new server-side auth boundary.
- **How are dates presented?** Store a calendar date as ISO `YYYY-MM-DD` and render that same date in the release entry, avoiding timezone shifts. Localize the surrounding date/version labels, not the stored calendar value.
- **Should notes work offline?** Yes. They are bundled route content and use the existing SPA/service-worker fallback.

### Deferred to Implementation

- The exact `package.json` JSON import shape if the current SvelteKit/Vite configuration rejects a direct package import; use the smallest build-supported equivalent without adding a generated version service.
- The exact release copy for the first seeded entry and the next shipped version; product/release owners must supply the real user-visible changes.
- Whether the existing Playwright suite already has a reusable authenticated session fixture after concurrent work lands; reuse it if present, otherwise add only the smallest fixture needed for the changelog spec.

---

## Implementation Units

- [x] U1. **Define bundled changelog data and release-version contract**

**Goal:** Create the single source of truth for release entries, current version lookup, and the last-seen version marker used by both the page and update notice.

**Requirements:** R1, R4, R6

**Dependencies:** None

**Files:**
- Create: `src/lib/changelog.ts`
- Create: `src/lib/changelog.test.ts`
- Modify: `package.json` (bump to the release version when this feature ships)

**Approach:**
- Define a small typed entry shape: version, ISO date, and English/Chinese title plus bullet points. Keep entries newest-first and render the full history without a separate sorting layer.
- Read the current app version from `package.json`; require the newest entry to match it. Seed the current release entry with the actual changes shipped in this update rather than placeholder copy.
- Export a localized-entry selector with English fallback only for an unsupported runtime locale, plus guarded `readLastSeenVersion()` and `markLastSeenVersion()` helpers. Treat a missing, empty, or whitespace-only marker as absent; otherwise keep the stored value as an opaque non-empty string. Storage errors must not crash the app.
- Keep the marker key stable and app-specific. Do not use Firebase or user identity for it.
- Use a tiny in-memory `Storage` mock in the unit test for browser-marker cases; do not add a jsdom test configuration just for this string.

**Patterns to follow:**
- `src/lib/utils/localStore.svelte.ts` for the existing browser-local persistence intent, while adding the minimal error guard needed for a single release marker.
- `src/lib/locales/en.json` and `src/lib/locales/zh.json` for locale naming and fallback expectations.

**Test scenarios:**
- **Happy path:** The newest changelog entry version equals the runtime package version and all entry versions are unique.
- **Happy path:** Selecting `zh` returns Chinese release text; selecting `en` returns English text; an unsupported locale falls back to English.
- **Edge case:** Missing, empty/whitespace, or inaccessible local storage returns no prior version and does not throw.
- **Edge case:** Reading and writing a non-empty marker round-trips the exact string without applying semver ordering or coercion.
- **Error path:** A storage write failure leaves the app able to continue and does not make the release data unavailable.

**Verification:**
- One release entry is enough to render the page, and adding a future release requires only adding data plus bumping `package.json`.
- The module has no Firebase dependency and no write path to user data.

---

- [x] U2. **Build the localized changelog page and Settings entry**

**Goal:** Give users a durable, readable page showing the current release and prior entries, reachable from the existing Settings screen.

**Requirements:** R1, R3, R4, R5

**Dependencies:** U1

**Files:**
- Create: `src/routes/(app)/changelog/+page.svelte`
- Modify: `src/routes/(app)/settings/+page.svelte`
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/zh.json`
- Create: `tests/changelog.spec.ts`

**Approach:**
- Render a clear page hierarchy: a localized `h1`, a localized back link to `${base}/settings`, a “Current release” section for the newest entry, and a “Previous updates” section when older entries exist. Each release is an `article` with a heading, version/date metadata using `<time datetime>`, and a bullet list. Keep newest release first.
- Use the existing `base` path and shared `Button`/link pattern in Settings; place “What’s New” after the profile/font-size actions and before feedback/logout without changing bottom navigation.
- Keep layout mobile-first with normal page scrolling, a readable `min(100%, 65ch)` content width, wrapping long copy, and bottom padding that clears the fixed app nav plus the device safe area. Apply the persisted `settingsStore.fontZoom` (currently 0.5–1.7) without clipping at the supported range; avoid adding a new zoom control.
- Use existing dark surfaces, restrained borders, system typography, and no decorative badges, gradients, or dashboard treatment. The version label is informational, not a gamified badge. No new animation is needed, so reduced motion requires no special transition.
- Use localized UI labels from the two locale files and the bilingual content selector from U1. Store/render the release date as a calendar date (`YYYY-MM-DD`) so it does not shift by timezone. Release copy is authored, non-secret text and is rendered through normal escaped Svelte text interpolation.
- Keep the page static and offline-safe. Do not fetch release notes or add a loading state. Preserve the existing client-side redirect behavior for unauthenticated deep links; no sensitive content is introduced.

**Patterns to follow:**
- `src/routes/(app)/settings/+page.svelte` for authenticated settings navigation and shared controls.
- `DESIGN.md` card, typography, spacing, and accessibility rules.
- Existing app-route layout so the page automatically receives the authenticated bottom navigation.

**Test scenarios:**
- **Happy path:** An authenticated user opens the Settings “What’s New” action and reaches `${base}/changelog`; the current release appears before older entries with its version, date, title, and bullets, followed by the previous-updates section.
- **Happy path:** The page renders the selected locale’s labels and both locales’ release copy; an unsupported runtime locale falls back to English.
- **Edge case:** A long release title or many bullets remains scrollable, wraps within the content width, and does not overflow the mobile viewport or fixed bottom nav.
- **Edge case:** At the persisted `settingsStore.fontZoom` range on a mobile viewport, version/date text and bullet content remain readable without clipping or horizontal scrolling.
- **Edge case:** An unauthenticated deep link to `${base}/changelog` follows the existing client-side redirect to login rather than exposing an authenticated app session.
- **Integration:** The changelog route loads from the cached app shell while offline after the app assets are available; no network data request is required.
- **Accessibility:** The page has one clear heading, semantic release sections, a keyboard-operable back link, readable contrast, and no information conveyed by color alone.

**Verification:**
- Settings exposes one localized entry point and no new bottom-nav item is added.
- A user can revisit all shipped release notes without relying on the automatic prompt.
- Existing profile, font-size, feedback, and logout actions remain unchanged.

---

- [x] U3. **Add one-time post-update discovery notice**

**Goal:** Surface the newest release to returning users after an app update without interrupting Bible reading or showing on auth-only screens.

**Requirements:** R2, R4, R5, R6

**Dependencies:** U1, U2

**Files:**
- Modify: `src/routes/(app)/+layout.svelte`
- Modify: `tests/changelog.spec.ts`

**Approach:**
- On the authenticated app layout’s client mount, read the local last-seen version. If none exists, store the current version silently. If it differs, show one localized `svelte-sonner` toast with a “View changes” action that navigates to `${base}/changelog`.
- Mark the version seen only after the action’s navigation promise succeeds or the user explicitly dismisses the toast. Do not mark it on automatic timeout; a user who never interacts can see it on the next full app-shell mount. A failed navigation leaves the old marker so discovery can retry. Guard the layout so rerenders cannot create duplicate toasts.
- Keep the prompt separate from `src/lib/pwa/pwa.svelte`: the PWA layer tells users an update can be installed, while the app shell explains the already-installed release. Do not show the changelog prompt from `src/routes/+layout.svelte`, where it could appear during login/signup.
- Use the existing toast position and a finite duration that pauses while hovered or focused when supported by the library. Ensure the toast has a live-region announcement, a named dismiss control, and a keyboard-operable “View changes” action. Do not steal focus, block route changes, or add a modal overlay.
- If local storage is unavailable, use a session-only guard so the notice cannot loop during the same mount/session. The full Settings page remains available even when persistence fails.
- Do not mark a version as new based on service-worker events alone; the version mismatch is the stable signal after the new bundle is active.

**Patterns to follow:**
- Existing `toast` usage in `src/lib/pwa/pwa.svelte` and `src/lib/pwa/pwa.ts`.
- App-layout mount/lifecycle behavior in `src/routes/(app)/+layout.svelte`.
- `base`-prefixed navigation already used by Settings.

**Test scenarios:**
- **Happy path:** With an older stored version, loading an authenticated app route shows exactly one localized update notice; activating its action navigates to `${base}/changelog` and then records the current version.
- **Happy path:** After the action succeeds or the user explicitly dismisses the notice, reloading or navigating between app routes does not show it again.
- **Edge case:** A first visit with no stored marker records the current version silently and does not present stale historical notes as a new update.
- **Edge case:** Automatic timeout without interaction leaves the marker unchanged; a failed changelog navigation also leaves it unchanged so the notice can retry on a later full mount.
- **Edge case:** The same version opened in multiple app routes does not create duplicate notices from layout rerenders.
- **Error path:** Local-storage read/write failure does not block the app shell or create a repeated toast loop; the Settings page remains usable.
- **Accessibility:** The toast is announced by the existing live region, has a named dismiss control, pauses while focused/hovered when supported, and lets keyboard users activate “View changes” without moving focus away from the reader or covering chapter content with a modal.
- **Integration:** A version bump plus matching newest entry causes returning users to see the notice after the new PWA bundle is loaded; an unauthenticated deep link still follows the existing redirect; no change is required to service-worker registration or update activation.

**Verification:**
- Returning users discover the release once, while new users and users who already acknowledged the version do not receive repeated interruptions.
- The notice is absent from login/signup flows and does not alter Bible completion, navigation, audio, or offline chapter behavior.
- The existing service-worker update toast continues to function independently.

---

## System-Wide Impact

- **Interaction graph:** `src/routes/(app)/+layout.svelte` reads the version marker and emits a toast; its action navigates to the new app-route changelog at `${base}/changelog`. Settings provides the durable link. Existing client-side auth routing handles unauthenticated deep links; no Firebase listener, Firestore path, or service-worker message changes.
- **Error propagation:** Changelog content is static. Storage failures degrade only the one-time prompt to session memory and must not prevent rendering the app shell or page.
- **State lifecycle risks:** The marker must be read once per app-shell mount and guarded against rerender duplication. Version mismatch is intentionally device-local; clearing browser storage may show the notice again, which is acceptable.
- **API surface parity:** The same bundled route and version contract serve the web PWA and Capacitor Android build. No platform-specific implementation is needed.
- **Integration coverage:** Browser coverage should prove Settings navigation, release ordering/localization, one-time prompt behavior, and offline route availability. Unit coverage should prove version/marker edge cases.
- **Unchanged invariants:** Existing auth routing, bottom-nav structure, PWA update activation, Firestore data, progress sync, Bible reading controls, and user settings remain unchanged.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| The package version changes without a matching newest entry | Unit test asserts the newest entry equals the runtime package version; release notes and version bump are one release checklist item. |
| A toast appears during login or signup | Mount the prompt only in the authenticated `(app)` layout, not the global layout or PWA component. |
| The notice interrupts Scripture reading | Use a short, dismissible toast with no focus stealing or modal overlay; keep the durable page in Settings. |
| Browser storage is disabled or contains invalid data | Guard reads/writes, fall back to an in-memory session marker, and keep the full page functional. |
| Release notes are unavailable offline | Ship them as route code in the existing precached SPA shell; verify navigation with the offline service-worker path. |
| Release content is untranslated or too dense | Keep English/Chinese copy together in typed data, require both localized forms, and test long/mobile content. |
| A public bundle accidentally contains sensitive release details | Treat entries as public text, keep secrets/personal/operational data out, and use escaped rendering only. |
| Existing uncommitted PWA/test work changes app-shell behavior | Reuse the current app-layout and Playwright patterns during implementation; avoid modifying unrelated highlight/auth changes. |

---

## Documentation / Operational Notes

- For every user-visible release: bump `package.json` version, add the matching newest bilingual entry in `src/lib/changelog.ts`, and include the meaningful user-facing changes rather than implementation jargon.
- The initial feature release must use a version different from the prior deployed build if existing users are expected to receive the automatic notice.
- No data migration, Firebase rules change, rollout flag, or monitoring service is required.
- Keep the existing PWA update toast and the changelog notice conceptually separate: one handles update availability, the other handles release communication.
- Future work can add richer release content or an admin workflow only if static bundled authoring becomes a real maintenance problem.

---

## Sources & References

- Project constraints: `PRODUCT.md`, `DESIGN.md`
- Existing settings surface: `src/routes/(app)/settings/+page.svelte`
- Existing app shell: `src/routes/(app)/+layout.svelte`
- Existing PWA update handling: `src/lib/pwa/pwa.svelte`, `src/sw.ts`, `vite.config.ts`
- Existing local persistence: `src/lib/utils/localStore.svelte.ts`
- Existing localization: `src/lib/locales/en.json`, `src/lib/locales/zh.json`
- Existing test configuration: `playwright.config.ts`, `tests/test.ts`
