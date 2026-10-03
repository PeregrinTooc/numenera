# TODO - Numenera Character Sheet

## 🔨 Development Workflow

**When starting a new feature:**

1. Move the topmost feature from this file to `CURRENT_FEATURE.md`
2. Delete it from this TODO file
3. Fill out the detailed planning sections in CURRENT_FEATURE.md
4. Implement the feature
5. When complete, move to FEATURES.md and delete CURRENT_FEATURE.md
6. Repeat with next feature

**File Purposes:**

- **TODO.md** (this file) - Backlog of lightweight feature requests
- **CURRENT_FEATURE.md** - Active work with full implementation details
- **FEATURES.md** - Completed, documented features

---

## 📝 Feature Request Template

When adding a new feature to this TODO, provide these **required** sections:

### Feature Name

**Overview** (Required)  
Brief description of what the feature does and why it's needed.

**Goals** (Required)

- What problems does this solve?
- What user needs does it address?

**E2E Tests** (Required)

- File: `tests/e2e/features/[name].feature`
- List expected Gherkin scenarios

_Note: Detailed planning (Architecture, Implementation Steps, Unit Tests, Edge Cases, Success Criteria) is done in CURRENT_FEATURE.md when you start working on the feature._

---

## 📊 Current Status

**Test Coverage**: `npm run test:unit` — 906 tests passing. `npm run test:e2e:prod`
runs the Cucumber suite once per Rule 9 device profile (`DEVICE`, see
`docs/rules/testing.md`; CI runs all four in the `e2e-devices` job):

| Profile           | Engine   | Scenarios passing | Excluded by tag                                                     |
| ----------------- | -------- | ----------------- | ------------------------------------------------------------------- |
| desktop (default) | Chromium | 415 / 415         | 7 `@skip`ped (Grid Merge/Split below); 0 `@desktop-only`            |
| `DEVICE=pixel5`   | Chromium | 394 / 394         | 21 `@not-phone`                                                     |
| `DEVICE=iphone12` | WebKit   | 390 / 390         | 21 `@not-phone`, 3 `@chromium-only`, 1 `@known-issue-webkit-unload` |
| `DEVICE=ipadpro`  | WebKit   | 411 / 411         | 3 `@chromium-only`, 1 `@known-issue-webkit-unload`                  |

The `I reload the page` step now always waits out the 300 ms auto-save debounce
(the save indicator stays hidden until the first save completes, so it cannot
signal a pending one); this fixed the "Ability order persists after page reload"
flake. Of 4 full iPad Pro runs after the fix, 3 were 411 / 411 and 1 had a single
unidentified failure that did not recur.

665 step definitions, all used (`npm run check:steps`). Measured at the end of the
remaining-test-tech-debt work.  
**Documentation**: See [FEATURES.md](./FEATURES.md) for complete feature list

---

## 🚨 Must-Have (Technical Debt)

### Tracked elsewhere

Open debt that has its own home, listed here so the backlog is complete. The
detail lives in the linked file.

- [RULE_VIOLATIONS.md](./RULE_VIOLATIONS.md) "Open": `@/` path aliases barely
  used, `any` usages with `no-explicit-any` only warning, files over 300 lines,
  swallowed storage write errors, `console.log` in `src/`, and the E2E import
  path bypassing the real sanitizer
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) "Not addressed":
  `beforeunload` flushing of the buffered version-history change needs a
  deliberate decision
  - The 300 ms auto-save debounce is not flushed on unload either. The
    `beforeunload` handler (`src/main.ts:767-772`) flushes only
    `versionHistoryService`, so an edit followed by a reload or tab close
    within about 300 ms is lost on any browser.

### Test and Component Debt

- **Reorder coverage gaps.** No reorder scenario exists for attacks, special
  abilities or items; add them. Cross-section drops are covered only for
  cypher → abilities and ability → cypher. Add a unit test per component that a
  drop with a null `draggedIndex` leaves the array unchanged.
- **Untranslated-key check (low priority).** It reads body `innerText` only, so
  it misses `aria-label` and `title`. The three "...empty state should use
  translation keys" Thens (`combat.steps.ts` around lines 123 and 205,
  `ability-enhancements.steps.ts` around line 114) only assert non-empty and
  could use `RAW_I18N_KEY` (`tests/e2e/support/i18nKeys.ts`).

---

## 📋 Feature Backlog

### Grid Merge/Split & Import-Layout Conflict Prompt

**Overview**  
`CharacterSheet.mergeSections()`, `splitGrid()`, `updateLayout()` and `getLayout()`
are implemented and unit-tested in isolation, but have zero callers — `handleDrop`
only ever calls `reorderSections`. Separately, `fileStorage.ts` already computes
`layout` and a `hasLayoutDifference` flag on import, but `main.ts`'s
`handleLoadFromFile` reads only `character` and `warnings`, so the imported
layout is dropped. Decided: build this rather than delete the dead code — see
`docs/IMPLEMENTATION_PLAN.md` §3.1 (the original review, `PROJECT_REVIEW.md`
§2.7, was removed in `ad0f8b5` and is in git history).

**Goals**

- Let users create a new side-by-side grid pairing by dragging one section onto
  another (needs drop-position disambiguation in `handleDrop`/`handleDragOver`:
  centre of target = merge, edge = reorder, plus matching drop-zone CSS)
- Let users split an existing grid pairing back into two single-column sections
  by dragging one out of it
- Warn on import when the imported file's layout differs from the current one,
  offering "Keep current layout" / "Use imported layout" via a new prompt,
  wired to the existing `hasLayoutDifference` flag

**Implementation notes**

- The four `CharacterSheet` methods above already exist and persist correctly
  once called — the missing piece is gesture wiring and the import prompt
  component, not the underlying layout logic.
- Section drags are automatable: use `dragSectionTo` (mouse) or `TouchGesture`
  inside `withFullHeightViewport` (touch) from `tests/e2e/support/sections.ts`.
  `locator.dragTo()` fails when it has to scroll mid-drag — see
  `docs/superpowers/specs/2026-09-26-section-dnd-e2e-design.md`.

**E2E Tests**

- File: `tests/e2e/features/section-rearrangement.feature` (scenarios already
  written, currently `@skip`ped). Note: the step
  `the sections should remain in single-column layout` is a no-op (empty body) that this feature must
  implement when un-skipping the scenarios.
  - Merge sections into grid by dragging onto another section
  - Cannot merge non-eligible sections into grid
  - Split sections from grid by dragging out
  - Import with different layout shows prompt
  - Keep existing layout on import
  - Use imported layout on import
  - Import with same layout does not show prompt

### Edge Auto-Scroll for Touch Section Drags

**Overview**  
Touch long-press section dragging has no auto-scroll, so on a phone a section
can only be dropped onto a section that is already on screen.

**Goals**

- Scroll the page while a touch drag is held near the top/bottom edge of the
  viewport
- Cover it with an E2E scenario that drags between sections that aren't both
  on screen (don't use `withFullHeightViewport` for that one)

### Multiple Images

**Overview**  
Support multiple images per character including portrait, gear art, and reference images.

**Goals**

- Store multiple images for each character
- Switch between different character portraits
- Add reference images for equipment and abilities
- Manage image gallery per character

**E2E Tests**

- File: `tests/e2e/features/multiple-images.feature`
- Scenarios:
  - Upload multiple images for a character
  - Switch active portrait image
  - View image gallery
  - Delete images from gallery

### Game Reference Info Modals

**Overview**  
Add help modals with game reference information for character types, descriptors, foci, cyphers, artifacts, and oddities.

**Goals**

- Provide quick reference during character creation and playing
- Help new players understand game concepts
- Reduce need to consult rulebooks
- Critical Note: only refer publicly available information (wikis, other internet sources with stable links, they can be rendered in-modal ) and don't store this data in the app since it might breach IP rules!

**E2E Tests**

- File: `tests/e2e/features/reference-info-modals.feature`
- Scenarios:
  - Open character types info modal
  - View descriptor reference
  - Browse foci information
  - Search cypher reference
  - View artifact and oddity descriptions

### Character Sharing

**Overview**  
Share characters with other players via export links or shareable JSON.

**Goals**

- Generate shareable character link including the character data (without pictures)
- Export character for sharing
- Import shared character from others
- Preview shared character before importing

**E2E Tests**

- File: `tests/e2e/features/character-sharing.feature`
- Scenarios:
  - Generate shareable character link
  - Copy character JSON for sharing
  - Import character from shared link
  - Preview shared character

### PWA Support

**Overview**  
Add Progressive Web App support for installing the app and offline functionality.

**Goals**

- Enable app installation on devices
- Support offline character sheet access
- Cache character data locally
- Provide app-like experience

**E2E Tests**

- File: `tests/e2e/features/pwa-support.feature`
- Scenarios:
  - Install app on device
  - Access app while offline
  - Character data persists offline
  - Sync when coming back online

### Multiple Characters

**Overview**
Add the option to have multiple characters, switch between them and also store them in one file on export

### Import/Export Cards

**Overview**
Let the gamemaster prepare cards (cyphers, artifacts...) and export them as files by dragging them onto the desktop or the explorer/finder. Let players import them by dropping them into the character sheet (auto-detect type)

## 🔗 Related Documentation

- **[FEATURES.md](./FEATURES.md)** - Completed and documented features
- **[CURRENT_FEATURE.md](./CURRENT_FEATURE.md)** - Feature currently being implemented
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment and hosting setup

---

**Last Updated**: October 3, 2026
