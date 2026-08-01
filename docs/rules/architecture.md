# Architecture Rules

**Context:** Design patterns, system architecture, and technical guidelines

---

## Rule #11: 📚 Storage Through Adapters Only

**NEVER access localStorage directly. Always use storage adapters.**

### Requirements:

- Go through `src/storage/storageFactory.ts` — never `localStorage` directly
- The factory picks the backend at runtime and caches it as a singleton
- Enables future cloud storage migration
- Maintains a consistent async API
- Exception: **None.** Architecture requirement.

### The Layers:

```
component / service
        │
        ▼
storageFactory.ts          saveCharacterState / loadCharacterState / clearCharacterState
        │
        ▼
ICharacterStorage          the adapter interface
        │
        ├── IndexedDBStorageImpl    (preferred; db "numenera-character-db")
        └── LocalStorageImpl        (fallback when IndexedDB is unavailable)
```

`src/storage/ICharacterStorage.ts` defines the contract:

```typescript
interface ICharacterStorage {
  init(): Promise<void>;
  save(character: Character): Promise<void>;
  load(): Promise<Character | null>;
  clear(): Promise<void>;
  isAvailable(): Promise<boolean>;
}
```

### Implementation:

```typescript
// ✅ GOOD - Through the factory
import { saveCharacterState } from "../storage/storageFactory.js";

async function persist(character: Character): Promise<void> {
  await saveCharacterState(character);
}

// ❌ BAD - Bypassing the factory, straight to the localStorage module
import { saveCharacterState } from "../storage/localStorage.js";

// ❌ WORSE - Direct localStorage access
localStorage.setItem("character", JSON.stringify(character));
```

### Why This Matters:

- One source of truth for where the character lives
- IndexedDB today, cloud adapters later, without touching components
- Easy to swap implementations and to fake in tests

### ⚠️ Known Violation

`src/components/helpers/CollectionBehavior.ts`, `src/components/BasicInfo.ts` and
`src/components/RecoveryDamageSection.ts` import `saveCharacterState` directly
from `src/storage/localStorage.js`. That writes a second copy of the character to
localStorage which `IndexedDBStorageImpl.migrateFromLocalStorage()` later replays
over the IndexedDB record on the next page load, silently reverting any edit made
after the last card operation.

Do not follow this pattern in new code. The fix is tracked in
`docs/IMPLEMENTATION_PLAN.md`.

### Future Storage Options:

- Cloud sync (Firebase, Supabase)
- IndexedDB for large data
- Session storage for temporary data
- Memory storage for testing

---

## Mobile-First Design (Best Practice)

**Note:** Not an absolute rule, but highly recommended approach.

### Approach:

1. Design for mobile viewport first (320px+)
2. Add complexity for larger screens
3. Test on actual devices when possible

### Touch Targets:

- Minimum 44x44px for all interactive elements
- Adequate spacing between tap targets
- No hover-only interactions

### Responsive Breakpoints:

```css
/* Tailwind breakpoints */
xs: 480px   /* small phones */
sm: 640px   /* phones */
md: 768px   /* tablets */
lg: 1024px  /* desktops */
xl: 1280px  /* large desktops */
```

> Declared in the `@theme` block of `src/styles/main.css` as `--breakpoint-*`
> custom properties, in `rem` so they scale with the browser font size. That
> block is the single source of truth for the theme — Tailwind v4 reads it
> directly, and the project has no `tailwind.config.js`.

### Example:

```typescript
// ✅ GOOD - Mobile-first
<div class="
  text-sm          // Mobile default
  md:text-base     // Tablet and up
  lg:text-lg       // Desktop and up
">

// ❌ BAD - Desktop-first (harder to maintain)
<div class="
  text-lg          // Desktop default
  md:text-base     // Tablet down
  sm:text-sm       // Mobile down
">
```

---

## Styling with Tailwind CSS

### Theme Colors:

- `numenera-primary`: #1a5490 (main brand color)
- `numenera-secondary`: #8b4513 (accent)
- `numenera-accent`: #d4af37 (highlights)

### Usage:

```typescript
// ✅ GOOD - Using theme colors
<button class="bg-numenera-primary text-white">

// ❌ BAD - Hardcoded colors
<button class="bg-blue-600 text-white">
```

### Approach:

- Use Tailwind utilities where possible
- Custom CSS only when necessary
- Keep custom styles in component-specific files
- Mobile-first responsive utilities

### Custom Styles Organization:

```
src/styles/
├── main.css              # Global styles, imports
├── components/           # Component-specific styles
│   ├── stat-pool.css
│   ├── damage-track.css
│   └── ...
└── utilities/            # Custom utility classes
    └── animations.css
```

---

## State Management

### Current Approach:

- Simple class-based approach
- IndexedDB (localStorage fallback) for persistence, behind the storage adapter
- No global state library yet
- Direct component state

### Example:

```typescript
export class CharacterSheet {
  private character: Character;

  constructor() {
    this.character = this.loadCharacter();
  }

  updateStat(stat: string, value: number): void {
    this.character[stat] = value;
    this.save();
    this.render();
  }
}
```

### Future Considerations:

- May add state library for complex features
- Consider Zustand for lightweight solution
- Keep it simple until complexity demands more

---

## Component Architecture

### Current Pattern:

Each component is a class that:

1. Manages its own state
2. Handles its own rendering
3. Responds to user events
4. Coordinates with storage

### Example Structure:

Components are plain classes with a `render()` method returning a lit-html
`TemplateResult`. They do **not** own a container element and do **not** write
`innerHTML`; the parent composes their templates and a single `render()` call
patches the DOM.

```typescript
import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class StatPool {
  constructor(
    private name: string,
    private stats: StatPoolData,
    private onFieldUpdate: (field: string, value: number) => void
  ) {}

  render(): TemplateResult {
    return html`
      <div class="stat-pool" data-testid="stat-pool-${this.name}">
        <h3>${t(`stats.${this.name}`)}</h3>
        <div class="pool">${this.stats.pool}</div>
        <div class="edge">${this.stats.edge}</div>
        <div
          class="current editable-field"
          @click=${() => this.openEditModal()}
          role="button"
          tabindex="0"
        >
          ${this.stats.current}
        </div>
      </div>
    `;
  }
}
```

Event handlers are bound declaratively in the template (`@click=${...}`), not
attached imperatively after render. See `docs/ARCHITECTURE.md` for why
LitElement and shadow DOM were tried and reverted.

### Principles:

- Single Responsibility: Each component does one thing
- Encapsulation: Internal state is private
- Clear API: Public methods are well-defined
- Self-contained: Component manages own DOM

---

## Performance Considerations

### Rules:

- Lazy load heavy components
- Debounce user input handlers
- Optimize images (WebP, compression)
- Code split routes (when routing added)
- Monitor bundle size

### Debouncing Example:

```typescript
// ✅ GOOD - Debounced auto-save
class CharacterSheet {
  private autoSave = debounce(() => {
    this.saveCharacter();
  }, 1000);

  onFieldChange(): void {
    this.autoSave();
  }
}

// ❌ BAD - Save on every keystroke
class CharacterSheet {
  onFieldChange(): void {
    this.saveCharacter(); // Too frequent!
  }
}
```

### Image Optimization:

```html
<!-- ✅ GOOD - Optimized images -->
<picture>
  <source srcset="portrait.webp" type="image/webp">
  <img src="portrait.jpg" alt={t("character.portrait")}
       loading="lazy" width="200" height="200">
</picture>

<!-- ❌ BAD - Large unoptimized image -->
<img src="portrait.png" alt="Portrait">
```

---

## Directory Structure

### Current Organization:

```
src/
├── types/          # TypeScript interfaces & types
├── storage/        # Data persistence layer
├── i18n/           # Internationalization
├── components/     # UI components
├── utils/          # Utility functions
└── styles/         # Global styles
```

### Principles:

- Group by feature/domain, not by technical layer
- Keep files small and focused (< 300 lines)
- One component/class per file
- Co-locate related files

### Adding New Features:

```
# Good structure for new feature
src/
├── components/
│   ├── Inventory/           # Feature folder
│   │   ├── Inventory.ts    # Main component
│   │   ├── InventoryItem.ts
│   │   └── types.ts        # Feature-specific types
├── styles/
│   └── components/
│       ├── inventory.css
│       └── inventory-item.css
```

---

## Data Model

### Character Properties:

The authoritative definition is `src/types/character.ts`. Read it before
touching character data — this is a summary, not a second source of truth.

```typescript
interface Character {
  // Core Identity
  name: string;
  tier: number; // 1-6
  type: string; // "Nano" | "Glaive" | "Jack"
  descriptor: string;
  focus: string;
  portrait?: string; // base64 data URL

  // Resources
  xp: number;
  shins: number;
  armor: number;
  effort: number;
  maxCyphers: number;

  // Stats
  stats: {
    might: StatPool;
    speed: StatPool;
    intellect: StatPool;
  };

  // Collections
  cyphers: Cypher[];
  artifacts: Artifact[];
  oddities: string[]; // plain strings, NOT objects
  abilities: Ability[];
  equipment: EquipmentItem[];
  attacks: Attack[];
  specialAbilities: SpecialAbility[];

  // Condition
  recoveryRolls: RecoveryRolls;
  damageTrack: DamageTrack; // { impairment: "healthy" | "impaired" | "debilitated" }

  // Text
  textFields: { background: string; notes: string };
}

interface StatPool {
  pool: number; // Maximum points
  edge: number; // Cost reduction
  current: number; // Available points
}
```

Things that trip people up:

- **`oddities` is `string[]`**, not an array of objects. Any code that treats
  collections uniformly must special-case it.
- **There is no `id` and no `lastModified`.** A single character is stored under
  a fixed key; version history provides the change record.
- **Stats are nested under `stats`**, not top-level.
- **`portrait` is excluded from version history** (`src/storage/versionHistory.ts`)
  and from ETag generation.

**Reference:** See `numenera.md` for game mechanics

---

## API Design Principles

### For Public APIs:

1. **Clear naming**: Function names describe what they do
2. **Consistent patterns**: Similar operations work similarly
3. **Type safety**: Use TypeScript types
4. **Documentation**: JSDoc for public APIs
5. **Error handling**: Clear, specific errors

### Example:

```typescript
/**
 * Creates a new character with default values
 * @param name - Character's name
 * @param type - Character class (Glaive, Nano, Jack)
 * @returns Newly created character with tier 1
 * @throws {ValidationError} If name is empty or type is invalid
 */
export function createCharacter(name: string, type: CharacterType): Character {
  if (!name.trim()) {
    throw new ValidationError(t("validation.nameRequired"), "name");
  }

  if (!["Glaive", "Nano", "Jack"].includes(type)) {
    throw new ValidationError(t("validation.invalidType"), "type");
  }

  return {
    id: generateId(),
    name,
    type,
    tier: 1,
    // ... defaults
  };
}
```

---

## Dependency Management

### Rules:

- Keep dependencies minimal
- Audit dependencies regularly
- Prefer smaller, focused libraries
- Consider bundle size impact

### Current Tech Stack:

- **Build**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit), Playwright (E2E)
- **i18n**: i18next + i18next-browser-languagedetector
- **Linting**: ESLint + Prettier

---

## Future Architecture Considerations

### Phase 2+:

- Multiple character management
- Cloud storage adapters
- Reference data system
- Modal system for detailed views

### Phase 3+:

- Advanced search/filter
- Import/export functionality
- Sharing/collaboration features

### Maintain Flexibility:

- Keep adapters abstract
- Avoid tight coupling
- Design for extension
- Document architectural decisions

---

## Related Rules

- **Storage:** This file (Rule #11)
- **Code Quality:** See `code-quality.md` for code organization
- **Testing:** See `testing.md` for architecture testing
- **i18n:** See `i18n.md` for translation architecture

---

**Architecture rules guide long-term maintainability and scalability.**
