# Architecture Rules

**Context:** Design patterns and system architecture detail supporting Rule
#11 in `CLAUDE.md` (storage through adapters only), plus the component and
styling patterns the rest of the codebase follows.

---

## Rule #11 — Storage Through Adapters Only

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
import { saveCharacterState } from "@/storage/storageFactory";

async function persist(character: Character): Promise<void> {
  await saveCharacterState(character);
}

// ❌ BAD - Direct localStorage access
localStorage.setItem("character", JSON.stringify(character));
```

### Why This Matters:

- One source of truth for where the character lives
- IndexedDB today, cloud adapters later, without touching components
- Easy to swap implementations and to fake in tests

---

## Mobile-First Design & Tailwind CSS

### Approach:

1. Design for mobile viewport first (320px+)
2. Add complexity for larger screens with `md:`/`lg:`/`xl:` utilities
3. Test on actual devices when possible

### Touch Targets:

- Minimum 44x44px for all interactive elements
- Adequate spacing between tap targets
- No hover-only interactions

### Theme Values:

Breakpoints and colors are declared in the `@theme` block of
`src/styles/main.css` as `--breakpoint-*` and `--color-*` custom properties.
That block is the **single source of truth** for the theme — Tailwind v4 reads
it directly, and the project has no `tailwind.config.js`. Don't restate theme
values as prose elsewhere; read the block itself, since a second copy drifts
out of sync with the code (this has happened twice — see
`docs/RULE_VIOLATIONS.md`'s "Fixed" table).

### Example:

```typescript
// ✅ GOOD - Mobile-first, theme colors via utility classes
html`<div class="text-sm md:text-base lg:text-lg">
  <button class="bg-numenera-primary text-white">...</button>
</div>`;

// ❌ BAD - Desktop-first, hardcoded colors
html`<div class="text-lg md:text-base sm:text-sm">
  <button class="bg-blue-600 text-white">...</button>
</div>`;
```

### Custom Styles Organization:

```
src/styles/
├── main.css              # Global styles, @theme block, imports
├── components/           # Component-specific styles
│   ├── stat-pool.css
│   ├── damage-track.css
│   └── ...
└── utilities/            # Custom utility classes
    └── animations.css
```

Use Tailwind utilities where possible; custom CSS only when necessary, kept in
component-specific files.

---

## State Management

- Simple class-based approach
- IndexedDB (localStorage fallback) for persistence, behind the storage adapter
- No global state library; direct component state

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

---

## Component Architecture

Each component is a plain class that manages its own state, renders via a
`render()` method returning a lit-html `TemplateResult`, handles its own
events, and coordinates with storage. It does **not** own a container element
and does **not** write `innerHTML`; the parent composes child templates and a
single `render()` call patches the DOM.

```typescript
import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";

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

- Single Responsibility: each component does one thing
- Encapsulation: internal state is private
- Clear API: public methods are well-defined
- Self-contained: component manages its own DOM

---

## Performance Considerations

The canonical copy of this guidance — `code-quality.md` points here instead
of repeating it.

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
  <source srcset="portrait.webp" type="image/webp" />
  <img
    src="portrait.jpg"
    alt="${t('character.portrait')}"
    loading="lazy"
    width="200"
    height="200"
  />
</picture>

<!-- ❌ BAD - Large unoptimized image -->
<img src="portrait.png" alt="Portrait" />
```

---

## Directory Structure

The canonical layout — see `CLAUDE.md`'s top-level Layout section for the
full tree. Within a feature, prefer:

```
# Good structure for new feature
src/
├── components/
│   ├── Inventory/           # Feature folder
│   │   ├── Inventory.ts     # Main component
│   │   ├── InventoryItem.ts
│   │   └── types.ts         # Feature-specific types
├── styles/
│   └── components/
│       ├── inventory.css
│       └── inventory-item.css
```

Group by feature/domain, not by technical layer. Keep files small and focused
(< 300 lines). One component/class per file. Co-locate related files.

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

**Reference:** See `numenera.md` for game mechanics.

---

## Dependency Management

- Keep dependencies minimal; audit regularly
- Prefer smaller, focused libraries
- Consider bundle size impact

### Current Tech Stack:

- **Build**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit), Playwright (E2E)
- **i18n**: i18next + i18next-browser-languagedetector
- **Linting**: ESLint + Prettier

---

## Related Rules

- **Storage:** This file (Rule #11)
- **Code Quality:** See `code-quality.md` for code organization
- **Testing:** See `testing.md` for architecture testing
- **i18n:** See `i18n.md` for translation architecture
