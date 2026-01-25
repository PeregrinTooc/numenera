# Testing Rules

**Context:** Test requirements, structure, and standards

---

## Rule #9: 📱 Responsive Design Required

**Test features across all required viewports.**

### Required Viewports:

- Desktop (Chromium)
- Mobile (Pixel 5 - Mobile Chrome)
- Mobile Safari (iPhone 12)
- Tablet (iPad Pro)

### Requirement:

**All features must work on ALL viewports.**

Exception: **None.** E2E tests verify this automatically.

---

## Test Structure

### Directory Organization:

```
tests/
├── e2e/
│   ├── features/           # BDD feature files (.feature)
│   ├── step-definitions/   # Step implementations
│   └── support/            # Test helpers
└── unit/
    └── *.test.ts          # Unit tests
```

---

## BDD Feature Files (Acceptance Tests)

### Format:

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

### Guidelines:

- Write from user perspective, not technical perspective
- Use present tense
- Be specific but not implementation-focused
- One feature per file
- Multiple scenarios per feature when appropriate

### Full Example:

```gherkin
Feature: Character stat pool management
    As a player
    I want to manage my character's stat pools
    So that I can track my character's capabilities

    Background:
        Given I have a character with:
            | stat      | pool | edge | current |
            | Might     | 12   | 1    | 12      |
            | Speed     | 10   | 0    | 10      |
            | Intellect | 14   | 2    | 14      |

    Scenario: Spending pool points
        When I spend 3 points from Might
        Then Might current should be 9
        And Might pool should still be 12

    Scenario: Edge reduces cost
        When I spend 3 points from Intellect with edge applied
        Then Intellect current should be 13
        And the effective cost was 1 point

    Scenario: Cannot spend more than available
        When I attempt to spend 15 points from Speed
        Then I should see an error "Insufficient points"
        And Speed current should remain 10
```

**Reference:** See `workflow.md` for BDD-First Approach (Rule #2)

---

## Unit Tests

### Structure (Arrange-Act-Assert):

```typescript
describe("ComponentOrModule", () => {
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

### Rules:

- Test behavior, not implementation
- One assertion concept per test
- Use descriptive test names
- Mock external dependencies
- Keep tests isolated and independent

### Full Example:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { StatPool } from "@/components/StatPool";

describe("StatPool", () => {
  let pool: StatPool;

  beforeEach(() => {
    pool = new StatPool(10, 1); // pool: 10, edge: 1
  });

  describe("spend", () => {
    it("should reduce current by specified amount", () => {
      // Arrange
      const initialCurrent = pool.current;

      // Act
      pool.spend(3);

      // Assert
      expect(pool.current).toBe(initialCurrent - 3);
    });

    it("should apply edge to reduce cost", () => {
      // Arrange
      const edge = pool.edge; // 1

      // Act
      pool.spend(3);

      // Assert
      // Effective cost: 3 - 1 = 2
      expect(pool.current).toBe(10 - 2);
    });

    it("should throw error when spending negative points", () => {
      // Arrange & Act & Assert
      expect(() => pool.spend(-1)).toThrow("Cannot spend negative");
    });

    it("should throw error when insufficient points", () => {
      // Arrange
      pool.current = 2;

      // Act & Assert
      expect(() => pool.spend(5)).toThrow("Insufficient points");
    });
  });

  describe("recover", () => {
    it("should restore points up to pool maximum", () => {
      // Arrange
      pool.spend(5);

      // Act
      pool.recover(3);

      // Assert
      expect(pool.current).toBe(8); // 5 - 5 + 3 = 3, wait... 10 - 3 + 3 = 10, but spent 5 so 5 + 3 = 8
    });

    it("should not exceed pool maximum", () => {
      // Arrange
      pool.spend(2);

      // Act
      pool.recover(100);

      // Assert
      expect(pool.current).toBe(10); // Cannot exceed max
    });
  });
});
```

**Reference:** See `workflow.md` for TDD Always (Rule #3)

---

## E2E Tests (Playwright)

### Test Across All Viewports:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Character Sheet", () => {
  test("should display character name on all viewports", async ({ page }) => {
    await page.goto("/");

    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('[data-testid="character-name"]')).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="character-name"]')).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="character-name"]')).toBeVisible();
  });
});
```

### Viewport Configuration:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "tablet",
      use: { ...devices["iPad Pro"] },
    },
  ],
});
```

---

## Test Coverage Requirements

### What Must Be Covered:

**Unit Tests:**

- Core business logic (MUST be covered)
- Data transformations
- Validation logic
- Calculations and algorithms
- Error handling paths

**Integration Tests:**

- Data flow between modules
- Storage operations
- Component interactions
- State management

**E2E Tests:**

- Complete user workflows
- Critical user paths
- Cross-viewport compatibility
- Form submissions
- Navigation flows

### What NOT to Test:

- Framework code (React, Vue internals)
- Third-party libraries
- Simple getters/setters
- Trivial code

---

## Test Quality Checklist

Before considering tests complete:

```
✅ Test describes behavior, not implementation
✅ Test is isolated (no dependencies on other tests)
✅ Test uses meaningful, descriptive names
✅ Test has single responsibility
✅ Test uses Arrange-Act-Assert pattern
✅ Test mocks external dependencies
✅ Test handles edge cases
✅ Test handles error cases
✅ Tests can run in any order
✅ Tests are fast (unit tests < 100ms each)
```

---

## Rule #11: 🚨 ALWAYS Use NPM Scripts for E2E Tests

**NEVER call cucumber-js directly. ALWAYS use npm scripts.**

### CRITICAL REQUIREMENT:

E2E tests MUST be executed using npm scripts, NOT by calling `cucumber-js` directly.

### ✅ CORRECT:

```bash
# Run all E2E tests
npm run test:e2e

# Run tests tagged @current
npm run test:e2e:current

# Run production build tests
npm run test:e2e:prod

# Run specific feature file
npm run test:e2e:cucumber -- tests/e2e/features/basic-info-editing.feature
```

### ❌ INCORRECT:

```bash
# NEVER do this - bypasses cleanup hooks
cucumber-js tests/e2e/features/**/*.feature

# NEVER do this - no cleanup pre-hook
npx cucumber-js --tags "@current"
```

### Why This Rule Exists:

The npm scripts include **critical cleanup pre-hooks** that:

1. Remove stale coordination files (`.test-server-port`, `.test-worker-count`)
2. Ensure clean test state before execution
3. Prevent `ERR_CONNECTION_REFUSED` errors from previous failed runs
4. Enable proper parallel test execution with 6 workers

**Calling cucumber-js directly bypasses these hooks and WILL cause test failures.**

### Implementation Details:

```json
// package.json
{
  "scripts": {
    "test:e2e:clean": "rm -f .test-server-port .test-worker-count",
    "test:e2e": "npm run test:e2e:clean && npm run test:e2e:cucumber",
    "test:e2e:current": "npm run test:e2e:clean && cucumber-js tests/e2e/features/**/*.feature --tags \"@current\"",
    "test:e2e:prod": "npm run test:e2e:clean && npm run build && TEST_PROD=true npm run test:e2e:cucumber",
    "posttest:e2e": "npm run test:e2e:clean",
    "posttest:e2e:current": "npm run test:e2e:clean",
    "posttest:e2e:prod": "npm run test:e2e:clean"
  }
}
```

**This rule is ABSOLUTE and NON-NEGOTIABLE.**

---

## Running Tests

### Commands:

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit -- --watch

# Run all E2E tests (see Rule #11 above)
npm run test:e2e

# Run E2E tests tagged @current
npm run test:e2e:current

# Run production build E2E tests
npm run test:e2e:prod

# Run specific E2E feature file
npm run test:e2e:cucumber -- tests/e2e/features/basic-info-editing.feature

# Run specific unit test file
npm run test:unit src/components/StatPool.test.ts

# Run with coverage
npm run test:unit -- --coverage
```

### Test Execution Order:

1. Unit tests (fast, run during development)
2. Integration tests (medium, run before commit)
3. E2E tests (slow, run before push)

---

## Rule #10: 🧪 Test New Features in Isolation First

**Run new scenario tests independently before running the full test suite.**

### Requirement:

When implementing a new feature with BDD scenarios:

1. **First:** Run ONLY the new feature's scenarios
2. **Verify:** All new scenarios pass (100%)
3. **Then:** Run the complete test suite
4. **Ensure:** All tests still pass (no regressions)

### Commands:

```bash
# Run only new feature scenarios
npm run test:e2e:cucumber -- tests/e2e/features/new-feature.feature

# After new tests pass, run full suite
npm run test:e2e

# Or for specific features
npm run test:e2e -- --grep="feature-name"
```

### Benefits:

- **Faster feedback** during development
- **Isolated debugging** of new features
- **Prevents test pollution** affecting other tests
- **Clear verification** that implementation is complete
- **Confidence** before running expensive full suite

### Example Workflow:

```bash
# 1. Implement new feature with BDD scenarios
# 2. Run only new scenarios
npm run test:e2e:cucumber -- tests/e2e/features/basic-info-editing.feature

# 3. Fix until all pass (100%)
# 4. Then run full suite to check for regressions
npm run test:e2e

# 5. Commit only when both pass
```

**This rule is MANDATORY for all new features.**

---

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle:

**1. RED - Write Failing Test:**

```typescript
it("should reduce current when spending points", () => {
  const pool = new StatPool(10, 0);
  pool.spend(3);
  expect(pool.current).toBe(7); // FAILS - not implemented
});
```

**2. GREEN - Minimal Implementation:**

```typescript
class StatPool {
  spend(points: number): void {
    this.current -= points; // Just enough to pass
  }
}
```

**3. REFACTOR - Improve Code:**

```typescript
class StatPool {
  spend(points: number): void {
    if (points < 0) throw new Error("Cannot spend negative");
    if (points > this.current) throw new Error("Insufficient");
    this.current -= points;
  }
}
```

**4. REPEAT:** Write next test

**Reference:** See `workflow.md` for detailed TDD workflow

---

## Mocking Best Practices

### When to Mock:

- External API calls
- Database operations
- File system operations
- Time-dependent code
- Random number generation

### Example:

```typescript
import { vi } from "vitest";
import { loadCharacter } from "@/storage/localStorage";

// Mock the storage module
vi.mock("@/storage/localStorage", () => ({
  loadCharacter: vi.fn(),
}));

describe("CharacterSheet", () => {
  it("should load character on mount", async () => {
    // Arrange
    const mockCharacter = { name: "Test", tier: 1 };
    vi.mocked(loadCharacter).mockResolvedValue(mockCharacter);

    // Act
    const sheet = new CharacterSheet();
    await sheet.init();

    // Assert
    expect(loadCharacter).toHaveBeenCalledWith("default");
    expect(sheet.character).toEqual(mockCharacter);
  });
});
```

---

## Testing i18n

### Test Translation Keys Exist:

```typescript
import { t } from "@/i18n";

describe("i18n", () => {
  it("should have translation for character name", () => {
    expect(t("character.name")).toBe("Name");
  });

  it("should handle missing keys gracefully", () => {
    const result = t("missing.key");
    expect(result).toContain("missing.key"); // Returns key if not found
  });
});
```

### Test Components Use i18n:

```typescript
import { render } from "@testing-library/dom";
import { CharacterSheet } from "@/components/CharacterSheet";

describe("CharacterSheet", () => {
  it("should use translation for title", () => {
    const { container } = render(CharacterSheet);
    const title = container.querySelector("h1");

    // Should not have hardcoded text
    expect(title?.textContent).not.toBe("Character Sheet");
    // Should use translation
    expect(title?.textContent).toBe(t("app.characterSheet"));
  });
});
```

---

## Test Data Management

### Use Factories:

```typescript
// test/factories/character.ts
export function createTestCharacter(overrides = {}) {
  return {
    id: "test-id",
    name: "Test Character",
    tier: 1,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Controls Beasts",
    might: { pool: 12, edge: 1, current: 12 },
    speed: { pool: 10, edge: 0, current: 10 },
    intellect: { pool: 8, edge: 0, current: 8 },
    ...overrides,
  };
}

// Use in tests
const character = createTestCharacter({ name: "Custom Name" });
```

---

## Debugging Tests

### Common Issues:

**Tests pass individually but fail together:**

- Tests are not isolated
- Shared state between tests
- Use `beforeEach` to reset state

**Flaky tests:**

- Race conditions (use proper async/await)
- Time-dependent code (mock time)
- Random data (use fixed seeds)

**Slow tests:**

- Too many E2E tests (move to unit tests)
- Not mocking external dependencies
- Unnecessary waits

### Debug Commands:

```bash
# Run single test with debug output
npm run test:unit -- --reporter=verbose StatPool.test.ts

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run E2E tests with debug mode
npm run test:e2e -- --debug
```

---

## Related Rules

- **Workflow:** See `workflow.md` for BDD/TDD workflow (Rules #2, #3, #10)
- **Code Quality:** See `code-quality.md` for test quality standards
- **Git:** See `git.md` for pre-commit/pre-push test requirements

---

**Testing rules are ABSOLUTE and enforced by pre-commit/pre-push hooks.**
