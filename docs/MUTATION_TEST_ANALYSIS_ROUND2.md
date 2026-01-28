# Mutation Test Analysis - Round 2

## Current Status

- **Overall Mutation Score**: 32.63% (403/1230 killed)
- **Unit Tests**: 237 passing (100%)
- **E2E Tests**: 310 scenarios passing (100%)
- **Previous Round**: Added 89 high-impact tests

## Files Analyzed

### Mutation Score Distribution

| Score Range | Count | Files                                                                                                                                              |
| ----------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 75-100%     | 5     | CardEditModal, OddityItem, ArtifactItem, EquipmentItem, SpecialAbilityItem, CardEditorBehavior, validation.ts, storageConstants.ts, fileStorage.ts |
| 50-74%      | 2     | localStorage.ts, characterValidation.ts                                                                                                            |
| 25-49%      | 4     | CyphersBox, AbilityItem, AttackItem, CypherItem                                                                                                    |
| 0-24%       | 16    | **All other components**                                                                                                                           |

## Priority 1: Critical Utility Testing (0% coverage)

### fieldValidation.ts - 0.00% (29 survived, 80 errors) ⚠️ HIGHEST PRIORITY

**Why Critical**: Core validation logic used throughout application

**Survived Mutant Types**:

1. **FIELD_CONFIGS mutations** (recoveryModifier min value: -10 → +10)
2. **validateNumericField** logic:
   - `isNaN(num) || !Number.isInteger()` conditions
   - `num < min || num > max` boundary checks
   - Conditional expressions flipped
3. **validateField** function:
   - Custom validator execution
   - Number type detection and validation
   - Return value mutations

**Test Cases Needed** (~20 tests):

```typescript
describe("fieldValidation", () => {
  describe("FIELD_CONFIGS", () => {
    // Verify configuration for each field type
    it("should have correct config for tier");
    it("should have correct config for xp");
    it("should have correct recoveryModifier bounds");
  });

  describe("validateNumericField", () => {
    it("should reject NaN values");
    it("should reject non-integer values");
    it("should reject values below minimum");
    it("should reject values above maximum");
    it("should accept values at exact boundaries");
    it("should accept valid values in range");
  });

  describe("validateField", () => {
    it("should use custom validator if provided");
    it("should validate numeric fields with min/max");
    it("should return valid for text fields");
    it("should handle empty strings");
  });

  describe("isNumericField", () => {
    it("should return true for number fields");
    it("should return false for text fields");
  });
});
```

## Priority 2: Text Field Components (0% coverage)

### BottomTextFields.ts - 0.00% (40 survived, 13 errors)

**Why Important**: Complex inline editing logic

**Survived Mutant Patterns**:

1. **Constructor binding** removal
2. **startEditing**: DOM manipulation, readonly removal, focus
3. **saveField**: State saving, readonly restoration
4. **handleClick**: Readonly detection, edit mode triggering
5. **render**: Conditional readonly, event handlers

**Test Cases Needed** (~15 tests):

```typescript
describe("BottomTextFields", () => {
  describe("Inline Editing - Background", () => {
    it("should start editing on click when readonly");
    it("should remove readonly attribute when editing starts");
    it("should focus textarea when editing starts");
    it("should save field on blur");
    it("should restore readonly after save");
    it("should not trigger edit when already editing");
  });

  describe("Inline Editing - Notes", () => {
    // Same tests for notes field
  });

  describe("Rendering", () => {
    it("should render both textareas");
    it("should apply readonly to non-editing fields");
    it("should update character state on input");
  });
});
```

### TextField.ts - 0.00% (12 survived, 1 error)

**Why Important**: Read-only field display with conditional logic

**Survived Mutant Patterns**:

1. **hasValue calculation**: `value && value.trim().length > 0`
2. **Conditional rendering**: empty vs filled state
3. **String literal mutations** in templates

**Test Cases Needed** (~10 tests):

```typescript
describe("TextField", () => {
  it("should display value when present");
  it("should show empty state for empty string");
  it("should show empty state for whitespace-only");
  it("should show empty state for undefined");
  it("should trim whitespace in value check");
  it("should render correct label");
  it("should use correct empty message");
  it("should apply correct test ids");
});
```

## Priority 3: Modal Service (0% coverage)

### modalService.ts - 0.00% (18 survived, 7 errors)

**Why Important**: Core modal management service

**Survived Mutant Patterns**:

1. **openEditModal**: Container creation, modal instantiation, callbacks
2. **openPortraitModal**: Similar pattern for portrait display
3. **closeModal**: DOM cleanup
4. **focusModalInput**: setTimeout, querySelector, focus/select

**Test Cases Needed** (~12 tests):

```typescript
describe("ModalService", () => {
  describe("openEditModal", () => {
    it("should create modal container");
    it("should append to document.body");
    it("should call onConfirm callback");
    it("should close modal after confirm");
    it("should call onCancel callback");
    it("should close modal after cancel");
    it("should focus input after render");
  });

  describe("openPortraitModal", () => {
    it("should create and render portrait modal");
    it("should focus backdrop after render");
    it("should call onClose callback");
  });

  describe("closeModal", () => {
    it("should remove container from DOM");
  });
});
```

## Priority 4: Header Component (0% coverage)

### Header.ts - 0.00% (6 survived, 1 error)

**Survived Mutant Patterns**:

1. String literals in button labels
2. Complete render method removal

**Test Cases Needed** (~8 tests):

```typescript
describe("Header", () => {
  it("should render title");
  it("should render all four buttons");
  it("should call onLoad when load clicked");
  it("should call onImport when import clicked");
  it("should call onExport when export clicked");
  it("should call onNew when new clicked");
  it("should have correct button test ids");
});
```

## Why Component Scores Remain Low

Most component mutations survive because they involve:

1. **lit-html Rendering**: Template changes require browser to detect
2. **Event Handlers**: Click/input handlers need actual DOM
3. **CSS Classes**: Visual changes not caught by unit tests
4. **String Literals**: UI text doesn't affect test behavior
5. **Arrow Functions**: Empty returns in event handlers

These require **E2E/Integration testing** (which we have and are passing!).

## Recommended Test Implementation Order

### Round 2 (Focus on 0% files):

1. ✅ **fieldValidation.ts** (~20 tests) - Core validation logic
2. ✅ **BottomTextFields.ts** (~15 tests) - Inline editing
3. ✅ **TextField.ts** (~10 tests) - Conditional rendering
4. ✅ **modalService.ts** (~12 tests) - Service layer
5. ✅ **Header.ts** (~8 tests) - Button interactions

**Expected Impact**: ~65 new tests, should increase mutation score from 32.63% to ~38-40%

### Round 3 (If needed):

- Focus on 1-20% files (BasicInfo, ItemsBox, etc.)
- These have more complex DOM interactions
- Consider integration tests instead of pure unit tests

## Key Insights

1. **Validation functions are under-tested**: fieldValidation.ts has 80 errors
2. **Service layer needs attention**: modalService.ts completely untested
3. **Component rendering logic**: Best tested through E2E (which we have)
4. **String literals**: Don't add value to test - they're UI text
5. **Event handler bodies**: Many survive because they need browser context

## Conclusion

The mutation testing reveals that while our component E2E testing is strong (310 passing scenarios), our **utility function and service layer testing** needs significant improvement. The next round should focus on these pure logic functions rather than additional component rendering tests.
