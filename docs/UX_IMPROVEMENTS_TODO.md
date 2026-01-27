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
   - Completed: Modified BasicInfo component to use `|| t("character.descriptor")` and `|| t("character.focus")` to show translated placeholder text when fields are empty. Added E2E tests that use the New button to create a character with empty fields (like a real user would). All 310 test scenarios passed. Committed and pushed.

4. **Character Portrait Not Editable**
   - Status: ✅ Complete
   - Description: Portrait shows static placeholder, no upload/edit functionality
   - Location: `src/components/BasicInfo.ts`
   - Solution: Add image upload capability with preview, storage, and removal
   - Completed: Added optional portrait field to Character type (base64 storage). Implemented file upload with validation (image type, 2MB max). Added upload button for empty portraits, hover overlay with Change/Remove buttons for existing portraits. Portrait displays with object-fit: cover in 150x200px frame. All 310 test scenarios passed. Committed and pushed.

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
   - Status: ✅ Complete
   - Description: Hardcoded "Action" and "Description" labels in edit mode for abilities and special abilities
   - Locations: `src/components/AbilityItem.ts:93,104`, `src/components/SpecialAbilityItem.ts:56`
   - Solution: Replace with `t("abilities.action")` and `t("abilities.description")`
   - Completed: Added translation keys to en.json and de.json, replaced hardcoded text in both component files. All 310 test scenarios passed.

8. **Attack Badge Numbers Need Labels in Display Mode**
   - Status: ✅ Complete
   - Description: Damage and modifier badges have no visible labels
   - Location: `src/components/AttackItem.ts` (display mode, lines 166-177)
   - Solution: Add visible labels for clarity
   - Completed: Added labels to display badges similar to ability cost badge. Damage badge now shows "Damage: X" and modifier badge shows "Modifier: +X". All 310 test scenarios passed.

9. **Type Harmonization Across Edit Modals**
   - Status: 🔴 Not Started
   - Description: Different card types use inconsistent patterns for edited item state
   - Locations: `AbilityItem.ts`, `SpecialAbilityItem.ts`, `AttackItem.ts`, etc.
   - Solution: Create consistent interface/type for all card edit states

10. **Portrait Display Modal on Click**

- Status: 🔴 Not Started
- Description: Clicking on portrait should open a modal showing the full-size image
- Location: `src/components/BasicInfo.ts`
- Solution: Add click handler to open modal displaying portrait at original size or capped at 1500×2000px if larger

## Completion Criteria

- All issues resolved
- Tests updated/added as needed
- All tests passing
- Code committed after each issue
- This file deleted after completion

---

**Created:** 2026-01-27
**Last Updated:** 2026-01-27
