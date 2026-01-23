# Architecture Rules

**Context:** Design patterns, system architecture, and technical guidelines

---

## Rule #11: 📚 Storage Through Adapters Only

**NEVER access localStorage directly. Always use storage adapters.**

### Requirements:

- Use the StorageAdapter interface
- Implementation in `src/storage/localStorage.ts`
- Enables future cloud storage migration
- Maintains consistent API
- Exception: **None.** Architecture requirement.

### Storage Adapter Pattern:

```typescript
interface StorageAdapter<T> {
  save(data: T): Promise<void>;
  load(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}
```

### Implementation:

```typescript
// ✅ GOOD - Using adapter
import { characterStorage } from "@/storage/localStorage";

async function saveCharacter(character: Character): Promise<void> {
  await characterStorage.save(character);
}

// ❌ BAD - Direct localStorage access
function saveCharacter(character: Character): void {
  localStorage.setItem("character", JSON.stringify(character));
}
```

### Why This Matters:

- **Phase 1**: localStorage only
- **Phase 2+**: Cloud storage adapters
- **All storage through adapter interface**
- **Easy to swap implementations**

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
- localStorage for persistence
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

```typescript
export class StatPool {
  private element: HTMLElement;
  private pool: number;
  private edge: number;
  private current: number;

  constructor(container: HTMLElement, stats: StatData) {
    this.element = container;
    this.pool = stats.pool;
    this.edge = stats.edge;
    this.current = stats.current;

    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    this.element.innerHTML = this.template();
  }

  private template(): string {
    return `
      <div class="stat-pool">
        <div class="pool">${this.pool}</div>
        <div class="edge">${this.edge}</div>
        <div class="current">${this.current}</div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Event handling
  }

  public spend(points: number): void {
    // Business logic
    this.render();
  }
}
```

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

```typescript
interface NumeneraCharacter {
  // Core Identity
  id: string;
  name: string;
  tier: number; // 1-6
  type: string; // Glaive, Nano, Jack
  descriptor: string;
  focus: string;

  // Stats
  might: StatPool;
  speed: StatPool;
  intellect: StatPool;

  // Items
  cyphers: CypherItem[]; // Max 2-3
  artifacts: ArtifactItem[];
  oddities: OddityItem[];

  // Images
  portrait: string | null;
  additionalImages: string[];

  // Text Fields
  background: string;
  notes: string;
  equipment: string;
  abilities: string;

  // Metadata
  lastModified: number;
}

interface StatPool {
  pool: number; // Maximum points
  edge: number; // Cost reduction
  current: number; // Available points
}
```

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
- **i18n**: Custom implementation
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
