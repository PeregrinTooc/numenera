# Code Quality Rules

**Context:** Code standards, linting, formatting, and error handling detail
supporting Rule #5 in `CLAUDE.md` (TypeScript strict, no `any`).

---

## Rule #5 — TypeScript Strict Mode

### Good vs Bad Examples:

```typescript
// ✅ GOOD
import { Character } from "@/types/character";

export function createCharacter(name: string): Character {
    return { name, tier: 1, ... };
}

// ❌ BAD
import { Character } from "../../types/character.js";

export function createCharacter(name: any) {
    return { name, tier: 1, ... };
}
```

### Import Paths:

Use the `@/` alias for anything under `src/`. Aliases are configured in three
places and must stay in sync:

| File               | Key                     |
| ------------------ | ----------------------- |
| `tsconfig.json`    | `compilerOptions.paths` |
| `vite.config.ts`   | `resolve.alias`         |
| `vitest.config.ts` | `resolve.alias`         |

```typescript
import { t } from "@/i18n/index";
import { Character } from "@/types/character";
```

Aliased specifiers take no file extension — the bundler resolves them. Relative
imports within the same directory are fine (`./helpers/CollectionBehavior`), but
anything that reaches across directories with `../` should use the alias.

### When Type is Unknown:

```typescript
// ✅ GOOD - Use unknown and narrow with type guards
function processData(data: unknown): string {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  if (typeof data === "number") {
    return data.toString();
  }
  throw new Error("Invalid data type");
}

// ❌ BAD - Using any
function processData(data: any): string {
  return data.toString(); // No type safety!
}
```

### Interface vs Type:

```typescript
// ✅ GOOD - Interface for object shapes
interface Character {
  name: string;
  tier: number;
  type: CharacterType;
}

// ✅ GOOD - Type for unions, intersections
type CharacterType = "Glaive" | "Nano" | "Jack";
type ExtendedCharacter = Character & { level: number };

// ❌ BAD - Type for simple object shape
type Character = {
  name: string;
  tier: number;
};
```

---

## Linting & Formatting

- ESLint configured with TypeScript rules; Prettier for consistent formatting
- Husky pre-commit hook runs lint-staged (format + lint changed files) and
  blocks the commit on failure
- **You cannot bypass these** (nor should you want to)

### Configuration Standards:

`.prettierrc` is authoritative — this table restates it for convenience only:

| Setting      | Value    | `.prettierrc` key                   |
| ------------ | -------- | ----------------------------------- |
| Indentation  | 2 spaces | `"tabWidth": 2`, `"useTabs": false` |
| Semicolons   | required | `"semi": true`                      |
| Quotes       | double   | `"singleQuote": false`              |
| Line length  | 100      | `"printWidth": 100`                 |
| Line endings | LF       | `"endOfLine": "lf"`                 |

Never hand-format to a different style — run `npm run format`. If this table and
`.prettierrc` ever disagree, `.prettierrc` wins and this table is the bug.

---

## Code Organization

### Organization Rules:

- Group by feature/domain, not by technical layer (see `architecture.md` for
  the current directory layout)
- Keep files small and focused (< 300 lines)
- One component/class per file
- Co-locate related files

### File Naming:

```
✅ GOOD:
- CharacterSheet.ts (component)
- character.ts (type definitions)
- stat-pool.css (styles)

❌ BAD:
- CharacterSheetComponent.ts (redundant suffix)
- char.ts (unclear abbreviation)
- utils.ts (too generic)
```

---

## Error Handling

### Rules:

- Never swallow errors silently
- Use specific error types
- Log errors with context
- User-facing error messages in translation files

### Examples:

```typescript
// ✅ GOOD
try {
  const character = await loadCharacter(id);
  return character;
} catch (error) {
  console.error("Failed to load character:", { id, error });
  throw new CharacterLoadError(t("errors.characterLoadFailed"), { cause: error });
}

// ❌ BAD - Silent failure, no logging, no re-throw
try {
  const character = await loadCharacter(id);
  return character;
} catch (error) {
  return null;
}

// ❌ BAD - No context, hardcoded message
try {
  const character = await loadCharacter(id);
  return character;
} catch (error) {
  throw new Error("Failed to load character");
}
```

### Custom Error Types:

```typescript
export class CharacterLoadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "CharacterLoadError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "ValidationError";
  }
}
```

---

## Documentation

### When to Document:

```typescript
// ✅ GOOD - Public API needs documentation
/**
 * Creates a new character with default values
 * @param name - Character's name
 * @param type - Character class (Glaive, Nano, Jack)
 * @returns Newly created character with tier 1
 */
export function createCharacter(name: string, type: CharacterType): Character {
  // ...
}

// ✅ GOOD - Complex logic needs explanation
// Calculate effective pool cost considering edge reduction
// Edge reduces cost by 1 per point, minimum cost is 0
const effectiveCost = Math.max(0, cost - edge);

// ❌ BAD - Obvious code doesn't need comments
// Set the name
character.name = name;
```

- Keep `docs/ARCHITECTURE.md` updated for significant decisions
- Explain the "why" not just the "what"

---

## Testing Quality

Core business logic must be covered by unit tests, focused on behavior rather
than implementation details.

**Reference:** See `testing.md` for the canonical Test Quality Checklist.

---

## Pre-Commit Checklist

**Reference:** See `git.md` for the canonical pre-commit checklist (part of
Rule #1 and Rule #8).

---

## Related Rules

- **i18n:** See `i18n.md` for translation requirements
- **Testing:** See `testing.md` for test quality standards
- **Architecture:** See `architecture.md` for directory structure and
  performance considerations
- **Workflow:** See `workflow.md` for development process
