# Architecture Decisions

This document explains key architectural decisions made for the Numenera Character Sheet project.

## Table of Contents

1. [Component Template Co-location](#1-component-template-co-location)
2. [Class-Based Components vs Lit Element](#2-class-based-components-vs-lit-element)
3. [Component Organization Strategy](#3-component-organization-strategy)

---

## 1. Component Template Co-location

### Decision

**Templates (HTML) are co-located with component logic (TypeScript) using lit-html tagged template literals.**

```typescript
// Example: src/components/StatPool.ts
export class StatPool {
  render(): TemplateResult {
    return html`
      <div class="stat-pool">
        <h3>${this.name}</h3>
        <div>Pool: ${this.pool}</div>
      </div>
    `;
  }
}
```

### Rationale

1. **Industry Standard Pattern**
   - React pioneered this with JSX (2013), now the dominant pattern
   - Vue Single File Components co-locate template/script/style
   - Svelte components keep everything together
   - Angular recommends inline templates for small components
   - **Our choice (lit-html) is designed for this pattern**

2. **Component Cohesion Over File Type Separation**
   - Modern view: "Separation of concerns" = separating by **component**, not file type
   - A Button component should contain all Button-related code in one place
   - Changes to a component typically require modifying both template and logic together

3. **Type Safety & IDE Support**
   - lit-html templates are **type-checked by TypeScript**
   - Full IDE support: autocomplete, refactoring, error highlighting
   - Template variables are validated at compile time

4. **Excellent Tooling**
   - IDEs (VSCode, WebStorm) provide syntax highlighting for lit-html
   - Prettier formats templates
   - ESLint can lint template expressions
   - Works seamlessly with AI coding assistants

5. **Simplicity**
   - No template interpolation logic needed
   - No build-time template compilation
   - Direct mapping between code and output

### Alternatives Considered

#### A. External HTML Files with String Imports

```typescript
import templateHtml from "./StatPool.html?raw";
// Would need custom interpolation logic
```

**Rejected because:**

- Lose lit-html features (conditionals, loops, event handlers)
- Need custom interpolation system
- No type safety for template variables
- Goes against framework design
- More complex with no real benefit

#### B. Lit Element Web Components

```typescript
@customElement("stat-pool")
export class StatPool extends LitElement {
  @property() name: string;
  render() {
    return html`...`;
  }
}
```

**Rejected because:**

- Shadow DOM encapsulation broke E2E tests
- Web component registration timing issues
- Over-engineering for internal components
- Added complexity without clear benefits
- **Tested and reverted** (see Git history for details)

#### C. JSX/TSX (React-style)

```tsx
export class StatPool {
  render() {
    return <div className="stat-pool">{this.name}</div>;
  }
}
```

**Rejected because:**

- Would require switching to React/Preact
- Major paradigm shift from current lit-html
- Unnecessary dependency change
- Not worth the migration effort

### Conclusion

Template co-location with lit-html is the right choice because:

- ✅ Aligns with modern best practices
- ✅ Leverages TypeScript type system
- ✅ Excellent tooling support
- ✅ Simple and maintainable
- ✅ Works with the framework, not against it

---

## 2. Class-Based Components vs Lit Element

### Decision

**Use plain TypeScript classes with lit-html templates, NOT Lit Element web components.**

```typescript
// Our approach: Plain class with render() method
export class StatPool {
  constructor(
    private name: string,
    private pool: number
  ) {}

  render(): TemplateResult {
    return html`<div>...</div>`;
  }
}
```

### Rationale

1. **Simplicity**
   - Just classes with `render()` methods
   - No decorators, no lifecycle hooks (unless needed)
   - Easy to understand and test

2. **Flexibility**
   - Not locked into web component lifecycle
   - Can compose components however we want
   - No shadow DOM complications

3. **Testing**
   - E2E tests can directly access elements
   - No shadow root penetration needed
   - Simpler test setup

4. **Performance**
   - No custom element registration overhead
   - Immediate rendering (no web component connectedCallback delay)
   - Lighter runtime

5. **Pragmatic**
   - Web components are great for **library authors** (cross-framework components)
   - For **application code**, simpler is better
   - Don't need custom element features

### Alternatives Considered

#### A. Lit Element Web Components

```typescript
@customElement("stat-pool")
export class StatPool extends LitElement {
  @property() name: string;
  static styles = css`...`;
  render() {
    return html`...`;
  }
}
```

**Actually tried this (see Git history), then reverted because:**

- ❌ E2E tests failed (shadow DOM encapsulation issues)
- ❌ Page rendered blank (registration timing problems)
- ❌ Added complexity without clear benefits
- ❌ Fighting framework instead of working with it
- ❌ Over-engineered for our use case

Key learning: Web components are for **reusable library components**, not **internal app components**.

### Conclusion

Plain classes + lit-html is better than Lit Element because:

- ✅ Simpler architecture
- ✅ Tests work reliably
- ✅ No unnecessary abstraction
- ✅ Easier to maintain
- ✅ Sufficient for our needs

---

## 3. Component Organization Strategy

### Decision

**Hierarchical component structure with clear separation of concerns.**

```
src/
├── types/character.ts          # Type definitions
├── data/mockCharacters.ts      # Test data
├── components/
│   ├── StatPool.ts            # Item components (render single items)
│   ├── CypherItem.ts
│   ├── ArtifactItem.ts
│   ├── OddityItem.ts
│   ├── TextField.ts
│   ├── Stats.ts               # Container components (compose items)
│   ├── Cyphers.ts
│   ├── Artifacts.ts
│   ├── Oddities.ts
│   ├── TextFields.ts
│   ├── BasicInfo.ts
│   ├── Header.ts              # Top-level components
│   └── CharacterSheet.ts
└── main.ts                     # Entry point (48 lines)
```

### Component Hierarchy

```
CharacterSheet
├── Header
├── BasicInfo
├── Stats
│   ├── StatPool (Might)
│   ├── StatPool (Speed)
│   └── StatPool (Intellect)
├── Cyphers
│   └── CypherItem (list)
├── Artifacts
│   └── ArtifactItem (list)
├── Oddities
│   └── OddityItem (list)
└── TextFields
    ├── TextField (Background)
    ├── TextField (Notes)
    ├── TextField (Equipment)
    └── TextField (Abilities)
```

### Component Types

1. **Item Components** (smallest units)
   - Render a single item (stat pool, cypher, artifact, oddity, text field)
   - 10-25 lines each
   - Highly reusable
   - Examples: `StatPool`, `CypherItem`, `TextField`

2. **Container Components** (compose items)
   - Manage lists/collections of items
   - Handle empty states
   - 20-40 lines each
   - Examples: `Stats`, `Cyphers`, `Artifacts`

3. **Top-Level Components** (page structure)
   - Compose containers into full page
   - Handle application-wide concerns (buttons, layout)
   - Examples: `Header`, `CharacterSheet`

### Benefits of This Structure

1. **Single Responsibility**
   - Each component has one clear purpose
   - Easy to locate and modify code

2. **Reusability**
   - `StatPool` used 3 times (Might, Speed, Intellect)
   - `TextField` used 4 times (Background, Notes, Equipment, Abilities)
   - Item components can be reused anywhere

3. **Testability**
   - Small components are easy to test
   - Clear boundaries for unit tests
   - E2E tests target composed behavior

4. **Maintainability**
   - Most files are 10-40 lines
   - Easy to understand at a glance
   - Changes are localized

5. **Scalability**
   - Clear pattern for adding new components
   - Easy to extract reusable patterns
   - Room to grow (forms, validation, etc.)

### Alternatives Considered

#### A. Monolithic main.ts (Original Approach)

- All HTML templates in one 365-line file
- **Rejected**: Hard to maintain, poor organization

#### B. Flat Component Structure

- All components at same level (no hierarchy)
- **Rejected**: Harder to understand relationships, no clear composition pattern

#### C. Feature-Based Folders

```
src/
├── stats/
│   ├── Stats.ts
│   └── StatPool.ts
├── items/
│   ├── Cyphers.ts
│   └── CypherItem.ts
```

- **Rejected**: Unnecessary complexity for current size, prefer simplicity

### Refactoring Impact

**Before refactoring:**

- `main.ts`: 365 lines
- All logic and templates in one file
- Hard to navigate and maintain

**After refactoring:**

- `main.ts`: 48 lines (87% reduction!)
- 13 focused component files
- Clear separation of concerns
- Same functionality, better organization

### Conclusion

Hierarchical component organization provides:

- ✅ Clear structure and relationships
- ✅ High reusability
- ✅ Easy maintenance
- ✅ Good scalability
- ✅ Excellent code quality

---

---

## 4. Modal System Architecture

### Decision

**Centralized modal behavior with reusable patterns for backdrop handling, keyboard shortcuts, and focus trapping.**

```typescript
// Modal base class with common behavior
export class ModalBehavior {
  protected handleBackdropClick(event: MouseEvent): void;
  protected handleEscapeKey(event: KeyboardEvent): void;
}

// Focus trapping for keyboard navigation
export class FocusTrappingBehavior {
  handleTabKey(event: KeyboardEvent, modal: HTMLElement): void;
}

// Shared button rendering
export function renderModalButtons(onConfirm: () => void, onCancel: () => void): TemplateResult;
```

### Rationale

1. **Eliminate Duplication**
   - Backdrop click handling was duplicated in EditFieldModal and CardEditModal
   - Escape key handling was duplicated in both modals
   - Tab focus trapping logic was 120 lines in EditFieldModal
   - Confirm/Cancel button rendering was duplicated with same SVG icons

2. **Consistent User Experience**
   - All modals behave identically for backdrop clicks
   - Consistent keyboard shortcuts (Escape to close, Tab to navigate)
   - Uniform button styling and positioning
   - Predictable focus management

3. **Maintainability**
   - Fix modal bugs once, not multiple times
   - Easy to add new modal types
   - Clear separation of modal concerns
   - Well-tested base behavior

4. **Reusability**
   - `ModalBehavior` base class for common functionality
   - `FocusTrappingBehavior` for keyboard navigation
   - `renderModalButtons()` for consistent button rendering
   - `ModalContainer` for lifecycle management

### Components Using Modal System

**EditFieldModal.ts** (179 lines, down from 270)

- Extends `ModalBehavior` for backdrop and Escape handling
- Uses `FocusTrappingBehavior` for Tab key navigation
- Uses `renderModalButtons()` for confirm/cancel buttons
- Handles field-specific validation logic

**CardEditModal.ts** (82 lines, down from 150)

- Extends `ModalBehavior` for backdrop and Escape handling
- Uses `renderModalButtons()` for confirm/cancel buttons
- Wraps arbitrary card content for editing

**PortraitDisplayModal** (managed by modalService)

- Uses `ModalContainer` for lifecycle management
- Handles image display with zoom functionality

### Code Reduction Achieved

**Before Refactoring**:

- EditFieldModal: 270 lines
- CardEditModal: 150 lines
- modalService: 100 lines
- **Total**: 520 lines

**After Refactoring**:

- EditFieldModal: 179 lines (-91 lines)
- CardEditModal: 82 lines (-68 lines)
- modalService: 69 lines (-31 lines)
- modalBehavior: 230 lines (new helper)
- **Total**: 560 lines
- **Net**: +40 lines, but with centralized patterns

**Benefits**: Code is more maintainable with single source of truth for modal behavior, despite slight line count increase.

### Modal Behavior Features

1. **Backdrop Click Handling**

   ```typescript
   protected handleBackdropClick(event: MouseEvent): void {
     if (event.target === event.currentTarget) {
       this.onCancel();
     }
   }
   ```

2. **Keyboard Shortcuts**
   - Escape: Close modal
   - Tab: Navigate between focusable elements (with wrapping)
   - Enter: Confirm action (in EditFieldModal)

3. **Focus Management**
   - Auto-focus input field on open
   - Trap focus within modal
   - Restore focus to trigger element on close

4. **Lifecycle Management**
   - Create modal container
   - Render modal content
   - Handle user interaction
   - Clean up on close

### Conclusion

Centralized modal system provides:

- ✅ Zero code duplication in modal behavior
- ✅ Consistent user experience across all modals
- ✅ Easy to add new modal types
- ✅ Well-tested base functionality
- ✅ Clear separation of concerns

---

## 5. Container & Collection Patterns

### Decision

**Centralized collection management patterns for container components using generic TypeScript helpers.**

```typescript
// Generic add handler factory
export function createAddHandler<T>(
  ItemClass: new (...args: any[]) => T,
  onUpdate?: (items: T[]) => void,
  character?: Character
): () => void;

// Generic item instance creation
export function createItemInstances<T>(
  items: any[],
  ItemClass: new (...args: any[]) => any,
  onEdit: (index: number, item: any) => void,
  onDelete: (index: number) => void
): T[];

// Shared rendering helpers
export function renderAddButton(onClick: () => void, label: string): TemplateResult;
export function renderEmptyState(message: string): TemplateResult;
export function renderCollection<T>(items: T[], emptyMessage: string): TemplateResult;
```

### Rationale

1. **DRY Principle**
   - 5 container components had nearly identical add/edit/delete patterns
   - Same handleAdd\*() methods repeated 8 times (~76 lines)
   - Same item update callbacks repeated 11 times (~110 lines)
   - Same item delete callbacks repeated 11 times (~88 lines)
   - Same add button rendering repeated 8 times (~80 lines)
   - Same empty state rendering repeated 8 times (~40 lines)
   - **Total duplication**: ~394 lines

2. **Consistency**
   - All collections behave identically
   - Same user interaction patterns
   - Consistent error handling
   - Uniform visual presentation

3. **Type Safety**
   - Generic helpers work with any item type
   - Full TypeScript type inference
   - Compile-time type checking
   - No runtime type errors

4. **Maintainability**
   - Fix collection bugs once
   - Easy to add new collection types
   - Clear, predictable patterns
   - Well-tested helper functions

### Container Components Refactored

**Abilities.ts** (112 → 69 lines, -43 lines, 38% reduction)

- Uses `createAddHandler()` for ability addition
- Uses `createItemInstances()` for ability mapping
- Uses `renderAddButton()` for consistent button
- Uses callback-based pattern

**SpecialAbilities.ts** (115 → 67 lines, -48 lines, 42% reduction)

- Same pattern as Abilities
- Manages special abilities collection

**Attacks.ts** (128 → 87 lines, -41 lines, 32% reduction)

- Same pattern as Abilities
- Manages attacks collection

**CyphersBox.ts** (107 → 75 lines, -32 lines, 30% reduction)

- Uses event-based pattern (character parameter instead of callbacks)
- Single collection management

**ItemsBox.ts** (246 → 154 lines, -92 lines, 37% reduction)

- Most complex: manages 3 collections (Equipment, Artifacts, Oddities)
- Uses event-based pattern
- Three separate `createAddHandler()` calls

### Code Reduction Achieved

**Before Refactoring**:

- Abilities: 112 lines
- SpecialAbilities: 115 lines
- Attacks: 128 lines
- CyphersBox: 107 lines
- ItemsBox: 246 lines
- **Total**: 708 lines

**After Refactoring**:

- Abilities: 69 lines
- SpecialAbilities: 67 lines
- Attacks: 87 lines
- CyphersBox: 75 lines
- ItemsBox: 154 lines
- CollectionBehavior: 230 lines (new helper)
- **Total**: 682 lines
- **Net**: -26 lines with centralized patterns

**Effective Reduction**: 35% reduction in container code (256 lines eliminated from containers)

### Patterns Supported

1. **Callback-Based Updates**

   ```typescript
   // Used by Abilities, Attacks, SpecialAbilities
   const handleAdd = createAddHandler(AbilityItem, onUpdate);
   ```

2. **Event-Based Updates**

   ```typescript
   // Used by CyphersBox, ItemsBox
   const handleAdd = createAddHandler(CypherItem, undefined, character);
   ```

3. **Single Collections**

   ```typescript
   // Abilities, Attacks, SpecialAbilities, CyphersBox
   const instances = createItemInstances(items, ItemClass, onEdit, onDelete);
   ```

4. **Multiple Collections**
   ```typescript
   // ItemsBox with Equipment, Artifacts, Oddities
   const equipmentInstances = createItemInstances(equipment, EquipmentItem, ...);
   const artifactInstances = createItemInstances(artifacts, ArtifactItem, ...);
   const oddityInstances = createItemInstances(oddities, OddityItem, ...);
   ```

### Collection Behavior Features

1. **Generic Add Handler**
   - Creates temporary item
   - Opens edit modal
   - Handles save/cancel
   - Updates state automatically

2. **Item Instance Management**
   - Maps data to component instances
   - Wires up edit/delete callbacks
   - Maintains item references
   - Type-safe operations

3. **Consistent Rendering**
   - Add buttons with same styling
   - Empty state messages
   - Collection wrapping logic
   - Uniform visual presentation

4. **Flexible Patterns**
   - Supports both callback and event-based updates
   - Works with single or multiple collections
   - Generic type parameters for any item type
   - Easy to extend for new use cases

### Benefits Realized

**Code Quality**:

- ✅ 35% reduction in container component code
- ✅ Zero duplication in collection patterns
- ✅ Single source of truth for add/edit/delete operations
- ✅ Consistent behavior across all collections

**Developer Experience**:

- ✅ Easy to add new collection types
- ✅ Clear, predictable patterns
- ✅ Generic helpers reduce boilerplate
- ✅ Type-safe operations throughout

**Maintainability**:

- ✅ Fix bugs once, not 8 times
- ✅ Centralized testing of collection logic
- ✅ Well-documented helper functions
- ✅ Easy to understand and modify

### Conclusion

Centralized collection patterns provide:

- ✅ Significant code reduction with maintained functionality
- ✅ Consistent user experience across all collections
- ✅ Type-safe generic helpers
- ✅ Easy extensibility for new collection types
- ✅ Single source of truth for collection operations

---

## Summary

These five architectural decisions work together to create a maintainable, testable, and scalable architecture:

1. **Co-located templates** = Modern best practice, excellent tooling
2. **Class-based components** = Simple, flexible, testable
3. **Hierarchical organization** = Clear structure, high reusability
4. **Modal system** = Centralized behavior, consistent UX, zero duplication
5. **Collection patterns** = Generic helpers, DRY principle, type safety

The result: Clean, maintainable code that follows industry standards while remaining pragmatic and fit-for-purpose.
