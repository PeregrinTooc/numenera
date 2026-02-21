# CURRENT FEATURE: Settings & Layout Customization

## Overview

This feature set enables users to customize their Numenera character sheet experience through application settings and flexible layout options.

---

## Phase 1: Settings Gear

### Description

Add a settings gear icon to the Header that provides access to application-wide settings, starting with language switching.

### Goals

- Centralize application settings in one accessible location
- Enable runtime language switching (EN/DE)
- Prepare infrastructure for future settings (layout reset)

### Design Decisions

| Decision                          | Choice                   | Reasoning                                                              |
| --------------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| Location                          | Header, top-right corner | Consistent with common UX patterns; accessible but not intrusive       |
| Not obscured by Version Navigator | Yes                      | Version Navigator appears in same area; settings must remain clickable |
| UI Style                          | Dropdown/modal           | Keeps settings grouped; expandable for future options                  |
| Language selection                | Flag icons (🇬🇧 🇩🇪)       | Visual, universally understood; no text needed                         |
| Reset Layout                      | Placeholder (disabled)   | Infrastructure for Phase 3; shows users what's coming                  |

### E2E Tests

- File: `tests/e2e/features/settings-gear.feature`
- Scenarios:
  - Open settings panel
  - Switch language to German
  - Switch language to English
  - Settings gear visible when version navigator is shown

---

## Phase 2: Card Reordering

### Description

Allow users to reorder cards (cyphers, equipment, artifacts, oddities, abilities, special abilities, attacks) within their sections using drag-and-drop.

### Goals

- Enable quick card organization during gameplay
- Prioritize frequently-used items at the top
- Provide intuitive touch-friendly interaction on mobile

### Design Decisions

| Decision           | Choice                         | Reasoning                                                                                                |
| ------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Mobile activation  | Long-tap (250ms)               | Frequently-used feature deserves quick access; 250ms prevents accidental triggers while being responsive |
| Desktop activation | Immediate click-and-drag       | Desktop users expect click-and-drag; no delay needed                                                     |
| Edit mode required | No                             | Card reordering is frequent (during gameplay); shouldn't require mode switching                          |
| Visual feedback    | Card "lifts" with shadow/scale | Clear indication that drag is active; follows material design patterns                                   |
| Drop zones         | Highlighted between cards      | Shows valid drop targets; prevents confusion about where card will land                                  |
| Persistence        | Saved with character           | Card order is character-specific (e.g., frequently-used cyphers)                                         |

### Affected Sections

- Cyphers
- Equipment
- Artifacts
- Oddities
- Abilities
- Special Abilities
- Attacks

### E2E Tests (Cucumber - Outcome-focused)

- File: `tests/e2e/features/card-reordering.feature`
- Scenarios:
  - Card order persists after page reload
  - Reorder cards within cypher section
  - Reorder cards within equipment section

### Pure Playwright Tests (Interaction-focused)

- File: `tests/playwright/card-drag-drop.spec.ts`
- Tests:
  - Long-tap (250ms) activates drag mode on mobile
  - Click-and-drag works immediately on desktop
  - Visual lift effect appears during drag
  - Drop zones highlight on hover
  - Cancel drag by releasing outside drop zone
  - Touch gesture coordinates and timing

**Reasoning:** Drag-drop mechanics are highly visual and interaction-focused. Gherkin scenarios are better suited for business outcomes ("card order persists") while Playwright tests excel at verifying precise gesture timing, visual feedback, and coordinate-based interactions.

---

## Phase 3: Section Re-arrangement

### Description

Allow users to rearrange the major sections of the character sheet and optionally merge sections into 2-column grids.

### Goals

- Personalize character sheet layout for different play styles
- Put frequently-used sections at the top
- Support different screen sizes with grid merging

### Design Decisions

| Decision                 | Choice                                  | Reasoning                                                                                    |
| ------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Entry method             | "Edit Layout" button + right-click menu | Section arrangement is rare (one-time setup); doesn't need quick access like card reordering |
| Header fixed             | Yes                                     | Header contains critical actions (save, export, settings); should always be at top           |
| Recovery + Damage paired | Always together                         | Game mechanics are tightly coupled; splitting would be confusing                             |
| Grid support             | 2 columns only                          | Simple and clean; 3+ columns would be too complex and cramped                                |
| Grid creation            | Drag section onto another               | Intuitive "merge" gesture; familiar from other apps                                          |
| Grid splitting           | Drag section out of grid                | Reverse of creation gesture; consistent UX                                                   |
| Storage                  | Separate from character                 | Layout is a user preference, not character data                                              |
| Export behavior          | Include layout in character export      | Allows sharing complete setup; may have preferred layouts for certain character types        |
| Import behavior          | Prompt if different                     | User choice: keep existing layout or adopt imported layout                                   |
| Reset option             | In settings (enabled after this phase)  | Clear way to return to defaults                                                              |

### Rearrangeable Sections

| Section ID         | Section Name      | Notes                                 |
| ------------------ | ----------------- | ------------------------------------- |
| `basicInfo`        | Basic Info        | Name, type, descriptor, focus, etc.   |
| `stats`            | Stats             | Might, Speed, Intellect pools         |
| `recoveryDamage`   | Recovery & Damage | Paired: Recovery Rolls + Damage Track |
| `abilities`        | Abilities         | Character abilities                   |
| `specialAbilities` | Special Abilities | Type/Focus abilities                  |
| `attacks`          | Attacks           | Combat attacks                        |
| `cyphers`          | Cyphers           | Cypher cards                          |
| `items`            | Items             | Equipment, Artifacts, Oddities        |
| `background`       | Background        | Character background text field       |
| `notes`            | Notes             | Player notes text field               |

### Layout Data Model

```typescript
type SectionId =
  | "basicInfo"
  | "stats"
  | "recoveryDamage"
  | "abilities"
  | "specialAbilities"
  | "attacks"
  | "cyphers"
  | "items"
  | "background"
  | "notes";

type LayoutItem =
  | { type: "single"; id: SectionId }
  | { type: "grid"; items: [SectionId, SectionId] };

type Layout = LayoutItem[];

// Example default layout:
const defaultLayout: Layout = [
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "grid", items: ["recoveryDamage", "recoveryDamage"] }, // special case: paired
  { type: "single", id: "abilities" },
  { type: "grid", items: ["specialAbilities", "attacks"] },
  { type: "single", id: "cyphers" },
  { type: "single", id: "items" },
  { type: "grid", items: ["background", "notes"] }, // can be merged or separate
];
```

### E2E Tests

- File: `tests/e2e/features/section-rearrangement.feature`
- Scenarios:
  - Enter layout edit mode via button
  - Enter layout edit mode via right-click (desktop)
  - Reorder sections
  - Merge sections into grid
  - Split sections from grid
  - Layout persists after reload
  - Exit edit mode saves layout
  - Import with different layout shows prompt
  - Keep existing layout on import
  - Use imported layout on import
  - Reset layout to default

---

## Implementation Order

| Phase | Feature                           | Commit Separately |
| ----- | --------------------------------- | ----------------- |
| 1     | Settings Gear (language switcher) | ✅ Yes            |
| 2     | Card Reordering (drag-and-drop)   | ✅ Yes            |
| 3     | Section Re-arrangement            | ✅ Yes            |

**Reasoning for order:**

1. **Settings Gear first**: Small, self-contained; provides infrastructure for Reset Layout
2. **Card Reordering second**: Most frequently used; immediate value for players
3. **Section Re-arrangement last**: Most complex; builds on settings infrastructure

---

## Testing Strategy

### Unit Tests

- Layout data model serialization/deserialization
- Card order persistence logic
- Settings state management
- Drag threshold detection (250ms)

### E2E Tests (Cucumber + Playwright)

- All user-facing scenarios listed above
- Test on desktop and mobile viewports
- Verify persistence across page reloads

### Interaction Testing Notes

- Mobile long-tap: Use Playwright's `page.touchscreen` API
- Drag-and-drop: Use Playwright's `dragTo()` method
- Right-click menu: Use `page.click({ button: 'right' })`

---

## Success Criteria

- [ ] All E2E tests pass (desktop + mobile viewports)
- [ ] All unit tests pass
- [ ] No regressions in existing tests
- [ ] Language switching works correctly
- [ ] Card reordering works on mobile and desktop
- [ ] Section rearrangement works on desktop (mobile via button)
- [ ] Layout persists across page reloads
- [ ] Layout included in character export
- [ ] Import prompts for layout choice when different

---

## Related Documentation

- [TODO.md](./TODO.md) - Feature backlog
- [FEATURES.md](./FEATURES.md) - Completed features
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Last Updated**: February 21, 2026
