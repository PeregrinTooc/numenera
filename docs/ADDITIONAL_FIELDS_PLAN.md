# Implementation Plan: Additional Fields Editing

## Overview

Implement editing functionality for remaining character fields:

1. **Type field** → Dropdown selection (Nano, Glaive, Jack)
2. **Background field** → Direct inline editing (no modal)
3. **Notes field** → Direct inline editing (no modal)

## Current State Analysis

### Type Field (BasicInfo.ts)

- Currently static text: `<span class="char-type" data-testid="character-type">${this.character.type}</span>`
- Located in BasicInfo component
- No editing capability

### Background & Notes Fields (BottomTextFields.ts)

- Currently static textareas (read-only):
  - Background: `<textarea readonly data-testid="character-background">${this.character.background}</textarea>`
  - Notes: `<textarea readonly data-testid="character-notes">${this.character.notes}</textarea>`
- Located in BottomTextFields component
- No editing capability

## Design Decisions

### Type Field: Dropdown Pattern

**Why Dropdown?**

- Limited, predefined options (Nano, Glaive, Jack)
- Standard UI pattern for selection
- Prevents invalid input
- Accessible and mobile-friendly

**Implementation Approach:**

- Use native `<select>` element for accessibility
- Maintain consistent styling with existing UI
- No validation needed (select guarantees valid value)
- Direct change → immediate save (no modal)

### Background & Notes: Inline Editing Pattern

**Why Inline (No Modal)?**

- Large multi-line text content
- User needs context while editing
- Modal would hide too much information
- Better UX for long-form content

**Implementation Approach:**

- Toggle between readonly and editable state
- Click to enable editing
- Auto-save on blur (when clicking away)
- Escape key to cancel changes
- Visual indicator for edit state
- Maintain textarea size and layout

## Technical Implementation Plan

### 1. Type Dropdown Component

**Changes to BasicInfo.ts:**

```typescript
// Add state for dropdown
private isTypeDropdownOpen = false;

// Replace static span with select
<select
  class="char-type-select"
  data-testid="character-type-select"
  @change=${this.handleTypeChange}
  .value=${this.character.type}
>
  <option value="Nano">${t('character.type.nano')}</option>
  <option value="Glaive">${t('character.type.glaive')}</option>
  <option value="Jack">${t('character.type.jack')}</option>
</select>

// Handler
private handleTypeChange(e: Event) {
  const select = e.target as HTMLSelectElement;
  this.character.type = select.value as 'Nano' | 'Glaive' | 'Jack';
  saveToLocalStorage(this.character);
  this.dispatchEvent(new CustomEvent('character-updated', {
    detail: this.character,
    bubbles: true,
    composed: true
  }));
}
```

**Styling Considerations:**

- Match existing text field styling
- Clear dropdown indicator (down arrow)
- Hover/focus states
- Mobile-friendly tap targets
- Consistent with overall design

### 2. Inline Editing for Background & Notes

**Changes to BottomTextFields.ts:**

```typescript
// Add editing state
private editingField: 'background' | 'notes' | null = null;
private originalValue = '';

// Modified render for background
<textarea
  class=${this.editingField === 'background' ? 'editing' : ''}
  data-testid="character-background"
  ?readonly=${this.editingField !== 'background'}
  @click=${() => this.startEditing('background')}
  @blur=${() => this.saveField('background')}
  @keydown=${this.handleKeyDown}
  .value=${this.character.background}
></textarea>

// Handlers
private startEditing(field: 'background' | 'notes') {
  this.editingField = field;
  this.originalValue = this.character[field];
  this.requestUpdate();
  // Focus and select content after render
  setTimeout(() => {
    const textarea = this.querySelector(`[data-testid="character-${field}"]`) as HTMLTextAreaElement;
    textarea?.focus();
  }, 0);
}

private saveField(field: 'background' | 'notes') {
  if (this.editingField !== field) return;

  const textarea = this.querySelector(`[data-testid="character-${field}"]`) as HTMLTextAreaElement;
  this.character[field] = textarea.value;
  this.editingField = null;

  saveToLocalStorage(this.character);
  this.dispatchEvent(new CustomEvent('character-updated', {
    detail: this.character,
    bubbles: true,
    composed: true
  }));
}

private handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    const field = this.editingField;
    if (field) {
      this.character[field] = this.originalValue;
      this.editingField = null;
      this.requestUpdate();
    }
  }
}
```

**Visual States:**

- **Readonly state**: Light gray background, subtle border, cursor pointer
- **Editing state**: White background, highlighted border, cursor text
- **Edit indicator**: Small edit icon or visual cue

### 3. Validation Requirements

**Type Field:**

- No validation needed (select element guarantees valid value)
- Must be one of: 'Nano', 'Glaive', 'Jack'

**Background Field:**

- No strict validation required
- Empty string allowed
- Character limit: reasonable (e.g., 5000 chars) to prevent storage issues

**Notes Field:**

- No strict validation required
- Empty string allowed
- Character limit: reasonable (e.g., 5000 chars)

### 4. i18n Additions

**New Translation Keys Needed:**

```json
// en.json
{
  "character": {
    "type": {
      "label": "Type",
      "nano": "Nano",
      "glaive": "Glaive",
      "jack": "Jack"
    },
    "background": {
      "label": "Background",
      "placeholder": "Click to edit background..."
    },
    "notes": {
      "label": "Notes",
      "placeholder": "Click to edit notes..."
    }
  }
}

// de.json
{
  "character": {
    "type": {
      "label": "Typ",
      "nano": "Nano",
      "glaive": "Glaive",
      "jack": "Jack"
    },
    "background": {
      "label": "Hintergrund",
      "placeholder": "Zum Bearbeiten klicken..."
    },
    "notes": {
      "label": "Notizen",
      "placeholder": "Zum Bearbeiten klicken..."
    }
  }
}
```

### 5. Accessibility Requirements

**Type Dropdown:**

- `<label>` element properly associated
- Keyboard navigable (arrow keys, Enter)
- Screen reader announces current selection
- Focus visible indicator

**Background & Notes:**

- `aria-label` or associated label
- Clear focus indicators
- Keyboard shortcuts work (Escape to cancel)
- Screen reader announces edit state
- `aria-describedby` for edit instructions

### 6. Mobile Considerations

**Type Dropdown:**

- Native `<select>` provides optimal mobile UX
- Large enough tap target (min 44x44px)
- Works with mobile OS picker UI

**Background & Notes:**

- Touch-friendly activation (no double-tap required)
- Prevent zoom on focus (font-size: 16px minimum)
- Virtual keyboard doesn't obscure content
- Blur on "Done" keyboard button

## Testing Strategy

### Unit Tests

Not applicable - these are UI interaction features best tested via E2E

### E2E Test Scenarios

**Type Dropdown:**

1. Display current type value
2. Open dropdown and select different type
3. Type is saved and persists after refresh
4. Keyboard navigation (Tab, Arrow keys, Enter)
5. Accessible to screen readers
6. Mobile touch interaction
7. i18n: Labels and options in correct language

**Background Inline Editing:**

1. Display current background text
2. Click to enter edit mode
3. Edit text and blur to save
4. Text is saved and persists after refresh
5. Escape key cancels changes
6. Visual state changes (readonly → editing)
7. Empty value allowed
8. Long text handled properly
9. Mobile interaction
10. Accessibility (focus, screen reader)
11. i18n: Labels and placeholders

**Notes Inline Editing:**
(Same scenarios as Background)

## CSS Styling Plan

### Type Dropdown Styling

```css
/* src/styles/components/basic-info.css */
.char-type-select {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border: 1px solid theme(colors.gray.300);
  border-radius: 0.25rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.char-type-select:hover {
  border-color: theme(colors.blue.500);
}

.char-type-select:focus {
  outline: 2px solid theme(colors.blue.500);
  outline-offset: 2px;
}
```

### Inline Editing Styling

```css
/* src/styles/components/text-field.css */
textarea[readonly] {
  background-color: theme(colors.gray.50);
  border: 1px solid theme(colors.gray.300);
  cursor: pointer;
  transition: all 0.2s;
}

textarea[readonly]:hover {
  background-color: theme(colors.gray.100);
  border-color: theme(colors.gray.400);
}

textarea.editing,
textarea:not([readonly]) {
  background-color: white;
  border: 2px solid theme(colors.blue.500);
  cursor: text;
  outline: none;
}
```

## Implementation Order

1. **Add i18n keys** (en.json, de.json)
2. **Implement Type Dropdown** (BasicInfo.ts)
   - Add select element
   - Add change handler
   - Add styling
3. **Implement Background Inline Edit** (BottomTextFields.ts)
   - Add editing state
   - Add click/blur handlers
   - Add Escape key handler
   - Add styling
4. **Implement Notes Inline Edit** (BottomTextFields.ts)
   - Same pattern as Background
5. **Run all existing tests** to ensure no regressions
6. **Create and run new E2E tests** from feature file
7. **Manual testing** on desktop and mobile
8. **Commit and push**

## Risk Assessment

### Low Risk

- Type dropdown: Simple select element with limited options
- Inline editing: Well-established pattern

### Medium Risk

- Mobile textarea focus/blur behavior
- Virtual keyboard interactions
- Proper event sequencing (click → blur on same element)

### Mitigation

- Test thoroughly on mobile devices
- Use setTimeout for focus after state change
- Handle edge case: click background textarea while notes is editing

## Success Criteria

- [ ] Type can be changed via dropdown
- [ ] Background can be edited inline
- [ ] Notes can be edited inline
- [ ] All changes persist to localStorage
- [ ] Character-updated event dispatched
- [ ] All E2E tests pass (100%)
- [ ] Accessibility requirements met
- [ ] Mobile-friendly interactions
- [ ] i18n works correctly
- [ ] No regressions in existing features
