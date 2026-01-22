# Numenera Character Sheet - Project Rules

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Testing Requirements](#testing-requirements)
3. [Code Quality Standards](#code-quality-standards)
4. [Architecture Guidelines](#architecture-guidelines)
5. [Git & Commit Standards](#git--commit-standards)
6. [Project-Specific Context](#project-specific-context)

---

## Development Workflow

### BDD-First Approach (MANDATORY)

Every feature MUST start with a BDD feature file before any implementation.

**Process:**

1. **Write Feature File First**
   - Create `.feature` file in `tests/e2e/features/`
   - Use Gherkin syntax (Given/When/Then)
   - Describe user behavior, not implementation
   - Example filename: `character-creation.feature`

2. **Review & Refine**
   - Ensure feature describes actual user value
   - Break down complex features into multiple scenarios
   - Get stakeholder approval if needed

3. **Only Then: Implement**
   - Never write code before the feature file exists
   - Feature file serves as acceptance criteria

### TDD Implementation (MANDATORY)

After feature file is written, follow strict TDD:

**Red-Green-Refactor Cycle:**

1. **RED**: Write ONE failing unit test
2. **GREEN**: Write minimal code to make it pass
3. **REFACTOR**: Clean up code while keeping tests green
4. **REPEAT**: Next test, one at a time

**Rules:**

- Write only one test at a time
- Never write production code without a failing test first
- Tests must fail for the right reason before implementation
- All previous tests must still pass

### Commit Frequency

- Commit after each working feature (all tests green)
- Commit message follows conventional commits format
- Never commit broken code
- Push regularly to trigger CI/CD

---

## Testing Requirements

### Test Structure

```
tests/
├── e2e/
│   ├── features/           # BDD feature files (.feature)
│   ├── step-definitions/   # Step implementations
│   └── support/            # Test helpers
└── unit/
    └── *.test.ts          # Unit tests
```

### BDD Feature Files (Acceptance Tests)

**Format:**

```gherkin
Feature: Brief feature description
    As a [user type]
    I want to [action]
    So that [benefit]

    Scenario: Specific scenario name
        Given [initial state]
        When [action occurs]
        And [another action]
        Then [expected outcome]
        And [another outcome]
```

**Guidelines:**

- Write from user perspective, not technical perspective
- Use present tense
- Be specific but not implementation-focused
- One feature per file
- Multiple scenarios per feature when appropriate

### Unit Tests

**Structure:**

```typescript
describe("ClassName or ModuleName", () => {
  describe("methodName", () => {
    it("should do specific thing", () => {
      // Arrange: Set up test data
      const input = createTestData();

      // Act: Execute the code under test
      const result = functionUnderTest(input);

      // Assert: Verify expected outcome
      expect(result).toBe(expectedValue);
    });
  });
});
```

**Rules:**

- Test behavior, not implementation
- One assertion concept per test
- Use descriptive test names
- Mock external dependencies
- Keep tests isolated and independent

### E2E Tests (Playwright)

**Viewports REQUIRED:**

- Desktop (Chromium)
- Mobile (Pixel 5 - Mobile Chrome)
- Mobile Safari (iPhone 12)
- Tablet (iPad Pro)

**All features must work on ALL viewports**

### Test Coverage Requirements

- Unit tests: Core business logic MUST be covered
- Integration tests: Data flow between modules
- E2E tests: Complete user workflows

---

## Code Quality Standards

### TypeScript

**MANDATORY Rules:**

- Strict mode ALWAYS enabled
- NO `any` types (use `unknown` if truly needed)
- Explicit return types for exported functions
- Interface over type for object shapes
- Use path aliases: `@/` prefix for src imports

**Example:**

```typescript
// ✅ GOOD
import { Character } from "@/types/character";

export function createCharacter(name: string): Character {
    return { name, tier: 1, ... };
}

// ❌ BAD
import { Character } from "../../types/character";

export function createCharacter(name: any) {
    return { name, tier: 1, ... };
}
```

### Code Organization

**Directory Structure:**

```
src/
├── types/          # TypeScript interfaces & types
├── storage/        # Data persistence layer
├── i18n/           # Internationalization
├── components/     # UI components
├── utils/          # Utility functions
└── styles/         # Global styles
```

**Rules:**

- Group by feature/domain, not by technical layer
- Keep files small and focused (< 300 lines)
- One component/class per file
- Co-locate related files

### Linting & Formatting

**Enforcement:**

- ESLint configured with TypeScript rules
- Prettier for consistent formatting
- Husky pre-commit hook enforces both

**Configuration:**

- 2 spaces indentation
- No semicolons (Prettier default)
- Double quotes
- 100 character line length

### Error Handling

**Rules:**

- Never swallow errors silently
- Use specific error types
- Log errors with context
- User-facing error messages in translation files

---

## Architecture Guidelines

### Mobile-First Design (MANDATORY)

**Approach:**

1. Design for mobile viewport first (320px+)
2. Add complexity for larger screens
3. Test on actual devices when possible

**Touch Targets:**

- Minimum 44x44px for all interactive elements
- Adequate spacing between tap targets
- No hover-only interactions

**Responsive Breakpoints:**

```
xs: 480px   (small phones)
sm: 640px   (phones)
md: 768px   (tablets)
lg: 1024px  (desktops)
xl: 1280px  (large desktops)
```

### Internationalization (i18n) - CRITICAL REQUIREMENT

**MANDATORY Rules:**

- ALL user-facing text MUST use translation keys via `t()` function
- English (`en`) for development and testing
- German (`de`) for production
- Translation coverage verified by pre-commit hook

**⚠️ PRE-COMMIT CHECK ENFORCED:**

A pre-commit hook automatically runs `npm run check:i18n` which:

- Scans all components for `t()` function calls
- Verifies every translation key exists in BOTH `en.json` AND `de.json`
- **BLOCKS the commit if any keys are missing**
- Reports exactly which keys need to be added

**Translation Files:**

Located in `src/i18n/locales/`:

- `en.json` - English translations (default)
- `de.json` - German translations

**Translation File Structure:**

```json
{
  "app": {
    "title": "Application Title"
  },
  "character": {
    "name": "Name",
    "tier": "Tier",
    "sentence": {
      "prefix": "A tier",
      "connector": "who"
    }
  }
}
```

**Usage in Components:**

```typescript
import { t } from "../i18n/index.js";

// ❌ BAD - Hardcoded text
<h1>Character Sheet</h1>
<div>A tier {tier}</div>

// ✅ GOOD - Using translation keys
<h1>{t("app.characterSheet")}</h1>
<div>{t("character.sentence.prefix")} {tier}</div>
```

**Adding New Translations:**

1. Add key to `src/i18n/locales/en.json`
2. Add corresponding German translation to `src/i18n/locales/de.json`
3. Use key in component with `t("your.key")`
4. Pre-commit hook will verify both keys exist

**What Doesn't Need Translation:**

- Technical identifiers: `data-testid`, CSS classes, code strings
- HTML attributes: `class`, `type`, `role`, etc.
- Variable/function names in code

**Documentation:**

See `docs/I18N.md` for complete i18n guide including:

- Detailed usage examples
- Troubleshooting guide
- Best practices
- Common translation keys reference

### Styling with Tailwind CSS

**Theme Colors:**

- `numenera-primary`: #1a5490 (main brand color)
- `numenera-secondary`: #8b4513 (accent)
- `numenera-accent`: #d4af37 (highlights)

**Approach:**

- Use Tailwind utilities where possible
- Custom CSS only when necessary
- Keep custom styles in components
- Mobile-first responsive utilities

### State Management

**Current:**

- Simple class-based approach
- localStorage for persistence
- No global state library yet

**Future:**

- May add state library for complex features
- Consider Zustand for lightweight solution

### Storage Architecture

**Adapter Pattern (MANDATORY):**

```typescript
interface StorageAdapter {
  save(data: T): Promise<void>;
  load(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}
```

**Implementation:**

- Phase 1: localStorage only
- Phase 2+: Cloud storage adapters
- All storage through adapter interface
- Never access localStorage directly in components

### Performance Considerations

**Rules:**

- Lazy load heavy components
- Debounce user input handlers
- Optimize images (WebP, compression)
- Code split routes (when routing added)
- Monitor bundle size

---

## Git & Commit Standards

### Conventional Commits (MANDATORY)

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(character): add stat pool management

Implement Might, Speed, and Intellect pools with
edge and current value tracking.

Closes #23
```

```
fix(storage): correct character save timestamp

The lastModified timestamp was not updating on save.
Now properly sets timestamp before serialization.
```

### Branch Strategy

**Branch Naming:**

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code improvements

**Workflow:**

1. Create branch from `main`
2. Implement feature with BDD/TDD
3. All tests passing
4. Create PR
5. Review and merge to `main`

### Husky Hooks

**Pre-commit (Automatically runs):**

- Lint-staged (format and lint changed files)
- Run unit tests
- Block commit if any fail

**Pre-push (Automatically runs):**

- Run E2E tests
- Block push if tests fail

**You cannot bypass these** (nor should you want to)

### When to Commit

**Commit when:**

- ✅ Feature is complete (all tests pass)
- ✅ Refactoring is done (all tests still pass)
- ✅ Bug is fixed (all tests pass)
- ✅ Documentation is updated

**Don't commit when:**

- ❌ Tests are failing
- ❌ Code is half-written
- ❌ Linter errors exist
- ❌ Temporary debug code is present

### AI-Assisted Git Workflow (CRITICAL FOR AUTOMATION)

**Problem:** Combining `git add`, `git commit`, and `git push` with long commit messages causes interactive shell prompts that break automation.

**Solution:** Use multiple `-m` flags for structured commit messages instead of embedding newlines in a single `-m` flag.

**MANDATORY Format for AI Tools:**

```bash
git add -A && \
git commit \
  -m "type(scope): subject line (max 72 chars)" \
  -m "Detailed explanation paragraph." \
  -m "Additional context or changes:
- First change
- Second change
- Third change" \
  -m "Closes #123" && \
git push
```

**Rules:**

1. **NEVER embed newlines within a single `-m` flag**
   - ❌ BAD: `-m "feat: add feature\n\nThis breaks the shell"`
   - ✅ GOOD: Multiple `-m` flags (see below)

2. **Use multiple `-m` flags for structure:**
   - **First `-m`**: Subject line only (conventional commit format)
     - Format: `type(scope): description`
     - Max 72 characters
     - Present tense, no period
   - **Second `-m`**: Detailed explanation (optional)
     - Why the change was made
     - What problem it solves
     - 1-2 sentences
   - **Third `-m`**: Bullet list of changes (optional)
     - Specific files or components changed
     - Key implementation details
     - Can include newlines within this single `-m`
   - **Fourth `-m`**: Footer (optional)
     - Issue references: `Closes #123`
     - Breaking changes: `BREAKING CHANGE: description`
     - Co-authors

3. **Chain commands with `&&`**
   - Ensures each step succeeds before proceeding
   - Stops on error (won't push if commit fails)
   - Use backslash `\` for line continuation

4. **Each `-m` creates a paragraph**
   - Paragraphs are separated by blank lines
   - First `-m` is the subject
   - Subsequent `-m` flags form the body

**Examples:**

**Simple commit:**

```bash
git add -A && git commit -m "fix(stats): correct pool calculation" && git push
```

**Commit with explanation:**

```bash
git add -A && \
git commit \
  -m "feat(i18n): add translation coverage check" \
  -m "Implement automated verification to ensure all user-facing text uses translation keys." && \
git push
```

**Full structured commit:**

```bash
git add -A && \
git commit \
  -m "feat(storage): add auto-save functionality" \
  -m "Implements automatic saving every 30 seconds to prevent data loss during long editing sessions." \
  -m "Changes:
- Add AutoSaveService class
- Update CharacterSheet to use auto-save
- Add visual indicator for save status
- Include debounce to avoid excessive saves" \
  -m "Closes #42" && \
git push
```

**Why This Works:**

- No interactive shell prompts
- No quote escaping issues
- Works in automated contexts (CI/CD, AI tools)
- Maintains professional commit structure
- Follows conventional commits format
- Each `-m` is self-contained

**What NOT to Do:**

```bash
# ❌ WRONG - Newlines in single -m flag (breaks shell)
git commit -m "feat: add feature

This explanation breaks
because of newlines"

# ❌ WRONG - Unclosed quotes
git commit -m "feat: add feature
> (shell waits for closing quote)

# ❌ WRONG - Using semicolons instead of &&
git add -A; git commit -m "feat: add"; git push
# (continues even if commit fails)
```

**For AI Development:**

When Cline or other AI tools need to commit code:

1. Use `git add -A` to stage all changes
2. Build commit message with multiple `-m` flags
3. Chain with `&&` for safety
4. Use backslashes for readability
5. Always include `git push` at the end
6. Wait for command completion before proceeding

This ensures git operations are fully automated, non-interactive, and professional.

---

## Project-Specific Context

### Numenera Game Rules

**Character Structure:**

**Tier:** Character level (1-6)

- Represents overall power and advancement
- Starts at 1, progresses to 6
- Major milestone in character progression

**Type:** Character class

- **Glaive**: Warrior/Fighter (combat specialist)
- **Nano**: Mage/Esoteric (uses "numenera" powers)
- **Jack**: Rogue/Versatile (jack of all trades)

**Descriptor:** Adjective describing character

- Examples: Strong, Graceful, Intelligent, Tough
- Provides stat bonuses and special abilities
- Defines character personality/background

**Focus:** Special ability

- Examples: "Bears a Halo of Fire", "Controls Beasts"
- Unique character power/theme
- Provides signature abilities

**Stats (Pools):**
Three main stats, each with three values:

1. **Might** (physical power)
   - Pool: Maximum points
   - Edge: Cost reduction for effort
   - Current: Available points right now

2. **Speed** (agility/reflexes)
   - Pool: Maximum points
   - Edge: Cost reduction for effort
   - Current: Available points right now

3. **Intellect** (mental power)
   - Pool: Maximum points
   - Edge: Cost reduction for effort
   - Current: Available points right now

**Important Mechanics:**

- Pools can be spent to enhance actions
- Edge reduces costs
- Current is depleted and recovers
- Damage reduces pools

**Items:**

**Cyphers:**

- One-use powerful items
- Limit: 2-3 per character (enforced by game rules)
- Represent found/scavenged technology
- Should be used, not hoarded

**Artifacts:**

- Permanent items with depletion
- Depletion: Roll to see if item breaks after use
- More powerful than regular equipment
- Represents ancient technology

**Oddities:**

- Curiosities with no game mechanical effect
- Flavor items for roleplay
- Can be collected without limit
- Represent weird technology

### Data Model Considerations

**Character Properties:**

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
```

### Feature Roadmap Reference

See `docs/FEATURES.md` for complete roadmap.

**Current Phase:** MVP (Phase 1)

- Single character display/edit
- Local storage only
- Basic responsive UI
- i18n infrastructure

**Next Phases:**

- Phase 2: Multiple characters
- Phase 3: Reference data & modals
- Phase 4: Cloud sync
- Phase 5: Advanced features

### Resources

- [Numenera Discovery RPG](https://www.montecookgames.com/store/product/numenera-discovery/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest Testing](https://vitest.dev/)
- [Playwright E2E](https://playwright.dev/)
- [i18next](https://www.i18next.com/)

---

## Summary: The Golden Rules

1. ✅ **BDD First**: Feature file before any code
2. ✅ **TDD Always**: Test before implementation
3. ✅ **One Test at a Time**: Red → Green → Refactor
4. ✅ **Mobile First**: Design for smallest screen first
5. ✅ **i18n Everything**: No hardcoded text
6. ✅ **TypeScript Strict**: No `any`, explicit types
7. ✅ **User Review Before Commit**: ALWAYS present changes for user review before committing (unless explicitly instructed otherwise)
8. ✅ **Make the Change Easy**: Before implementing a feature, refactor the code to make the feature implementation trivial. Follow the principle "make the change easy, then make the easy change."
9. ✅ **Commit Working Code**: All tests must pass
10. ✅ **Let Hooks Work**: Pre-commit and pre-push protect quality
11. ✅ **Document As You Go**: Update FEATURES.md
12. ✅ **AI Collaboration**: These rules guide AI development

When in doubt, refer back to these rules. They exist to maintain quality, consistency, and enable effective AI-augmented development.
