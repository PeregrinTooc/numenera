# Phase 4 Test Scenarios Review

## Current Mock Data (FULL_CHARACTER)

```typescript
recoveryRolls: {
  action: false,        // Available (unchecked)
  tenMinutes: true,     // Used (checked) ✓
  oneHour: false,       // Available (unchecked)
  tenHours: false,      // Available (unchecked)
  modifier: 2,          // Shows "1d6 + 2"
},
damageTrack: {
  impairment: 'healthy', // Healthy status selected
}
```

## Test Scenarios and Assumptions

### ✅ Scenarios That Match Mock Data (Should Pass)

1. **Display recovery rolls section**
   - Expects: "Recovery Rolls" title, "1d6 + 2" display, 4 checkboxes
   - Mock data: modifier = 2 ✓

2. **Display recovery roll labels with time durations**
   - Expects: Labels with "(1 action)", "(10 min)", "(1 hour)", "(10 hours)"
   - Should match component rendering ✓

3. **Track used recovery rolls**
   - Expects: "Ten Minutes" checked, others unchecked
   - Mock data: tenMinutes = true ✓

4. **Display damage track section**
   - Expects: "Damage Track" title, 3 radio options
   - Should match component rendering ✓

5. **Display damage track options with descriptions**
   - Expects: "Healthy", "Impaired (tasks +1 difficulty)", "Debilitated (move only)"
   - Should match component rendering ✓

6. **Show healthy status by default**
   - Expects: "Healthy" selected, others not selected
   - Mock data: impairment = 'healthy' ✓

7. **Recovery rolls section has green styling**
   - Expects: Green theme CSS classes
   - Component has green theme ✓

8. **Damage track section has red styling**
   - Expects: Red theme CSS classes
   - Component has red theme ✓

9. **Recovery modifier is displayed correctly**
   - Expects: "1d6 + 2" when modifier = 2
   - Mock data: modifier = 2 ✓

### ⚠️ Scenarios Using URL Parameters (May Fail)

10. **Show impaired status**
    - Given: `the character is "impaired"`
    - Step def: Reloads page with `?impairment=impaired`
    - **Assumption**: URL parameter will override localStorage
    - **Potential Issue**: May conflict with localStorage or schema version

11. **Show debilitated status**
    - Given: `the character is "debilitated"`
    - Step def: Reloads page with `?impairment=debilitated`
    - **Assumption**: URL parameter will override localStorage
    - **Potential Issue**: May conflict with localStorage or schema version

12. **Recovery modifier shows zero correctly**
    - Given: `the character has recovery modifier 0`
    - Step def: Reloads page with `?recoveryModifier=0`
    - **Assumption**: URL parameter will override localStorage
    - **Potential Issue**: May conflict with localStorage or schema version

13. **All recovery rolls available for new character**
    - Given: `the character is new`
    - Step def: Navigates to `?new=true`
    - **Assumption**: Will load NEW_CHARACTER
    - **Potential Issue**: May conflict with localStorage

### ⚠️ Scenarios Requiring Language Switcher (May Fail)

14. **Language switching for recovery rolls (German)**
    - When: `I switch to German language`
    - Step def: Clicks button `[data-lang="de"]`
    - **Assumption**: Language switcher exists in UI
    - **Status**: Language switcher was added to Header component ✓

15. **Language switching for damage track (German)**
    - When: `I switch to German language`
    - Step def: Clicks button `[data-lang="de"]`
    - **Assumption**: Language switcher exists in UI
    - **Status**: Language switcher was added to Header component ✓

## Key Issues Identified

### Issue 1: URL Parameters vs localStorage Conflicts

The test scenarios that use URL parameters (impairment, recoveryModifier, new) may fail because:

- The `Before` hook clears localStorage before each test
- But it also navigates to the base URL first, which saves FULL_CHARACTER to localStorage
- Then the step definition navigates with URL parameters
- The main.ts applies URL parameters AFTER checking localStorage
- **Conflict**: localStorage may take precedence, or schema version changes may clear data

### Issue 2: Test Execution Order

- Tests are not independent - they may be affected by localStorage state from previous tests
- The `Before` hook clears localStorage, but timing issues may occur

## Recommendations

### Option A: Simplify Tests (Remove URL Parameter Tests)

Remove scenarios 10-13 and just test what's in FULL_CHARACTER and NEW_CHARACTER:

- Test scenario 6 already tests healthy status (which is in FULL_CHARACTER)
- Remove scenarios 10-11 (impaired/debilitated status)
- Remove scenario 12 (modifier = 0, since FULL_CHARACTER has modifier = 2)
- Keep scenario 13 but modify it to test with LOAD button to load NEW_CHARACTER

### Option B: Fix URL Parameter Loading

Modify main.ts to:

1. Check URL parameters FIRST (before localStorage)
2. If URL params exist, don't save to localStorage (test mode)
3. This makes tests more reliable but changes app behavior

### Option C: Use Different Test Characters

Create additional mock characters:

- `IMPAIRED_CHARACTER` with impairment: 'impaired'
- `DEBILITATED_CHARACTER` with impairment: 'debilitated'
- `ZERO_MODIFIER_CHARACTER` with recoveryModifier: 0
  Then update step definitions to load these characters

## Questions for Review

1. **Should we keep the URL parameter tests?** Or simplify to only test FULL_CHARACTER and NEW_CHARACTER?

2. **Do we need to test all three damage states?** Or is testing healthy status sufficient?

3. **Should we test modifier = 0?** Or is testing modifier = 2 (from FULL_CHARACTER) enough?

4. **Are the language switching tests important?** They require the language switcher UI which may not be needed in production.
