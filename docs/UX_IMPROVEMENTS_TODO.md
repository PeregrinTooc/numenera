# UX Improvements TODO

This document tracks UI/UX improvements and bug fixes for the Numenera Character Sheet.

## Status: In Progress

### Issues to Address

1. **Recovery Roll Modifier Not Editable**
   - Status: ✅ Complete
   - Description: The recovery roll modifier field displays as `1d6 + ${modifier}` but cannot be edited
   - Location: `src/components/RecoveryRolls.ts`
   - Solution: Add click handler to open edit modal for the modifier field
   - Completed: Added recoveryModifier field type, validation, translations, and wired up editing

2. **Stats Section Too Large**
   - Status: ✅ Complete
   - Description: Current Stats section takes up significant space with three full StatPool cards side-by-side
   - Location: `src/components/Stats.ts`, `src/components/StatPool.ts`, `src/styles/components/stat-pool.css`
   - Solution: Design more condensed version maintaining same information and editability
   - Completed: Reduced padding (1.5rem → 1rem), reduced pool number font (4.5rem → 3rem), reduced label font (1.25rem → 1rem), reduced edge/current values (1.875rem → 1.5rem), reduced grid gap (gap-6 → gap-4), added E2E tests for condensed styling

3. **Empty Descriptor and Focus Fields Not Visible**
   - Status: ✅ Complete
   - Description: On new characters, empty descriptor and focus fields are not visible/clickable
   - Location: `src/components/BasicInfo.ts`
   - Solution: Show placeholder text ('Descriptor' and 'Focus') when fields are empty to make them visible and clickable
   - Completed: Modified BasicInfo component to use `|| t("character.descriptor")` and `|| t("character.focus")` to show translated placeholder text when fields are empty, added E2E tests

4. **Character Portrait Not Editable**
   - Status: 🔴 Not Started
   - Description: Portrait shows static placeholder, no upload/edit functionality
   - Location: `src/components/BasicInfo.ts`
   - Solution: Add image upload capability with preview, storage, and removal

5. **Ability Pool Dropdown Shows 'None' in German**
   - Status: 🔴 Not Started
   - Description: Hardcoded "None" text in ability pool dropdown instead of translation
   - Location: `src/components/AbilityItem.ts:72`
   - Solution: Replace with `t("abilities.pool.none")` or similar translation key

6. **Ability Cost Badge Needs Label in Display Mode**
   - Status: 🔴 Not Started
   - Description: Cost badge has no visible label (only title attribute)
   - Location: `src/components/AbilityItem.ts` (display mode)
   - Solution: Add visible label or tooltip for accessibility

7. **Special Ability Description Field Not Translated**
   - Status: 🔴 Not Started
   - Description: Hardcoded "Description" label in edit mode
   - Location: `src/components/SpecialAbilityItem.ts:56`
   - Solution: Replace with `t("character.description")` or similar

8. **Attack Badge Numbers Need Labels in Display Mode**
   - Status: 🔴 Not Started
   - Description: Damage and modifier badges have no visible labels
   - Location: `src/components/AttackItem.ts` (display mode)
   - Solution: Add visible labels for clarity

9. **Type Harmonization Across Edit Modals**
   - Status: 🔴 Not Started
   - Description: Different card types use inconsistent patterns for edited item state
   - Locations: `AbilityItem.ts`, `SpecialAbilityItem.ts`, `AttackItem.ts`, etc.
   - Solution: Create consistent interface/type for all card edit states

## Completion Criteria

- All issues resolved
- Tests updated/added as needed
- All tests passing
- Code committed after each issue
- This file deleted after completion

---

**Created:** 2026-01-27
**Last Updated:** 2026-01-27
