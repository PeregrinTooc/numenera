# Code Quality Rules

**Context:** Code standards, linting, formatting, and quality requirements

---

## Rule #5: 💪 TypeScript Strict Mode - No Shortcuts

**Strict TypeScript mode is MANDATORY. NO `any` types allowed.**

### Requirements:

- Strict mode ALWAYS enabled
- NO `any` types (use `unknown` if truly needed)
- Explicit return types for exported functions
- Interface over type for object shapes
- Import style: relative paths with an explicit `.js` extension (see note below)
- Exception: **None.** Linter enforces this.

### Good vs Bad Examples:

```typescript
// ✅ GOOD
import { Character } from "../types/character.js";

export function createCharacter(name: string): Character {
    return { name, tier: 1, ... };
}

// ❌ BAD
export function createCharacter(name: any) {
    return { name, tier: 1, ... };
}
```

### Import Paths:

The codebase uses **relative paths with an explicit `.js` extension**, even in
`.ts` files:

```typescript
import { t } from "../i18n/index.js";
import { Character } from "../types/character.js";
```

The `.js` extension is required: the project is native ESM
(`"type": "module"`), and the Cucumber suite loads step definitions through
`ts-node/esm`, which resolves specifiers literally.

`@/*` path aliases are configured in both `tsconfig.json` and `vite.config.ts`,
but **no source file currently uses them**. Match the surrounding code and use
relative imports. If the project ever migrates to aliases, do it as one
deliberate sweep rather than mixing both styles.

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

### Enforcement:

- ESLint configured with TypeScript rules
- Prettier for consistent formatting
- Husky pre-commit hook enforces both
- **You cannot bypass these** (nor should you want to)

### Configuration Standards:

- 2 spaces indentation
- Semicolons required (`"semi": true`)
- Double quotes
- 100 character line length

### Pre-commit Hook:

```bash
# Automatically runs on git commit
- Lint-staged (format and lint changed files)
- Run unit tests
- Block commit if any fail
```

---

## Code Organization

### Directory Structure:

```
src/
├── types/          # TypeScript interfaces & types
├── storage/        # Data persistence layer
├── i18n/           # Internationalization
├── components/     # UI components
├── utils/          # Utility functions
└── styles/         # Global styles
```

### Organization Rules:

- Group by feature/domain, not by technical layer
- Keep files small and focused (< 300 lines)
- One component/class per file
- Co-locate related files

### File Naming:

```
✅ GOOD:
- CharacterSheet.ts (component)
- character.ts (type definitions)
- localStorage.ts (storage implementation)
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

// ❌ BAD
try {
  const character = await loadCharacter(id);
  return character;
} catch (error) {
  // Silent failure - no logging, no re-throw
  return null;
}

// ❌ BAD
try {
  const character = await loadCharacter(id);
  return character;
} catch (error) {
  throw new Error("Failed to load character"); // No context, hardcoded message
}
```

### Custom Error Types:

```typescript
// ✅ GOOD - Specific error types
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

### README and Architecture Docs:

- Keep `docs/ARCHITECTURE.md` updated
- Document significant decisions
- Explain the "why" not just the "what"
- Include examples for complex patterns

---

## Performance Considerations

### Rules:

- Lazy load heavy components
- Debounce user input handlers
- Optimize images (WebP, compression)
- Code split routes (when routing added)
- Monitor bundle size

### Examples:

```typescript
// ✅ GOOD - Debounced input handler
const debouncedSave = debounce((character: Character) => {
  saveCharacter(character);
}, 500);

// ❌ BAD - Save on every keystroke
input.addEventListener("input", () => {
  saveCharacter(character); // Too frequent!
});
```

---

## Testing Quality

### Code Coverage:

- Unit tests: Core business logic MUST be covered
- Focus on behavior, not implementation details
- Don't test framework code, test your code

### Test Quality Checklist:

```
✅ Test describes behavior, not implementation
✅ Test is isolated (no dependencies on other tests)
✅ Test uses meaningful names
✅ Test has single responsibility
✅ Test uses Arrange-Act-Assert pattern
✅ Test mocks external dependencies
```

**Reference:** See `testing.md` for detailed test standards

---

## Code Review Checklist

Before committing (part of Rule #1):

```
□ TypeScript strict mode compliance
□ No `any` types
□ Explicit return types on exports
□ Proper error handling
□ No hardcoded text (use i18n)
□ Tests pass
□ Linter passes
□ Code is readable and maintainable
□ Performance considerations addressed
```

---

## Related Rules

- **i18n:** See `i18n.md` for translation requirements
- **Testing:** See `testing.md` for test quality standards
- **Workflow:** See `workflow.md` for development process

---

**These code quality rules are ABSOLUTE and NON-NEGOTIABLE.**
