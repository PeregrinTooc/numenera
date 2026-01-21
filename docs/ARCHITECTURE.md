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

## Summary

These three decisions work together to create a maintainable, testable, and scalable architecture:

1. **Co-located templates** = Modern best practice, excellent tooling
2. **Class-based components** = Simple, flexible, testable
3. **Hierarchical organization** = Clear structure, high reusability

The result: Clean, maintainable code that follows industry standards while remaining pragmatic and fit-for-purpose.
