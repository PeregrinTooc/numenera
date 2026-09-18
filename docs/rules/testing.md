# Testing Rules

**Context:** Test requirements, structure, and standards supporting Rule #9 in
`CLAUDE.md` (responsive viewports) plus the BDD/TDD workflow in `workflow.md`.

---

## Rule #9 — Responsive Design Required

### Required Viewports:

- Desktop (Chromium)
- Mobile (Pixel 5 - Mobile Chrome)
- Mobile Safari (iPhone 12)
- Tablet (iPad Pro)

E2E tests verify all four automatically via `playwright.config.ts`.

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

**Reference:** See `workflow.md` for the Feature File Format template (Rule #2).

**Vocabulary:** every step phrase the suite already understands is listed in
`tests/e2e/STEP_CATALOG.md`, with usage counts and the file that implements it.
Search it before writing a step; reuse an existing phrase exactly rather than
inventing a near-synonym. Regenerate with `npm run docs:steps`; `npm run
check:steps` fails on unused step definitions or a stale catalog.

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
      const initialCurrent = pool.current;
      pool.spend(3);
      expect(pool.current).toBe(initialCurrent - 3);
    });

    it("should apply edge to reduce cost", () => {
      // Effective cost: 3 - 1 = 2
      pool.spend(3);
      expect(pool.current).toBe(10 - 2);
    });

    it("should throw error when spending negative points", () => {
      expect(() => pool.spend(-1)).toThrow("Cannot spend negative");
    });

    it("should throw error when insufficient points", () => {
      pool.current = 2;
      expect(() => pool.spend(5)).toThrow("Insufficient points");
    });
  });

  describe("recover", () => {
    it("should restore points up to pool maximum", () => {
      pool.spend(5);
      pool.recover(3);
      expect(pool.current).toBe(8); // 10 - 5 = 5, then 5 + 3 = 8
    });

    it("should not exceed pool maximum", () => {
      pool.spend(2);
      pool.recover(100);
      expect(pool.current).toBe(10); // Cannot exceed max
    });
  });
});
```

**Reference:** See `workflow.md` for the canonical Red-Green-Refactor example (Rule #3).

---

## E2E Tests (Playwright)

### Test Across All Viewports:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Character Sheet", () => {
  test("should display character name on all viewports", async ({ page }) => {
    await page.goto("/");

    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await expect(page.locator('[data-testid="character-name"]')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('[data-testid="character-name"]')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await expect(page.locator('[data-testid="character-name"]')).toBeVisible();
  });
});
```

---

## Test Coverage Requirements

**Unit Tests:** core business logic, data transformations, validation logic,
calculations, error handling paths.

**Integration Tests:** data flow between modules, storage operations,
component interactions, state management.

**E2E Tests:** complete user workflows, critical user paths, cross-viewport
compatibility, form submissions, navigation flows.

**Not tested:** framework internals, third-party libraries, trivial
getters/setters.

---

## Test Quality Checklist

The canonical checklist — `code-quality.md` points here instead of repeating it.

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

## Using NPM Scripts for E2E Tests

**Never call `cucumber-js` directly** (see `CLAUDE.md`'s gotchas). The npm
scripts start the dev server via `concurrently`, wait for it with `wait-on`,
run cucumber-js with the correct configuration, and tear the server down
afterward. Calling `cucumber-js` directly bypasses server management and every
scenario fails.

```bash
# ✅ CORRECT
npm run test:e2e -- tests/e2e/features/basic-info-editing.feature
npm run test:e2e:current
npm run test:e2e:prod

# ❌ INCORRECT — no server running
cucumber-js tests/e2e/features/**/*.feature
npx cucumber-js --tags "@current"
```

---

## Test New Features in Isolation First

When implementing a new feature with BDD scenarios, run only the new feature's
scenarios first, verify 100% pass, then run the complete suite to check for
regressions:

```bash
# 1. Run only new scenarios
npm run test:e2e -- tests/e2e/features/basic-info-editing.feature

# 2. Fix until all pass, then run the full suite
npm run test:e2e:all
```

Faster feedback, isolated debugging, and confidence before paying for the full
suite's runtime.

---

## Mocking Best Practices

### When to Mock:

External API calls, database operations, file system operations,
time-dependent code, random number generation.

### Example:

```typescript
import { vi } from "vitest";
import { loadCharacter } from "@/storage/storageFactory";

vi.mock("@/storage/storageFactory", () => ({
  loadCharacter: vi.fn(),
}));

describe("CharacterSheet", () => {
  it("should load character on mount", async () => {
    const mockCharacter = { name: "Test", tier: 1 };
    vi.mocked(loadCharacter).mockResolvedValue(mockCharacter);

    const sheet = new CharacterSheet();
    await sheet.init();

    expect(loadCharacter).toHaveBeenCalledWith("default");
    expect(sheet.character).toEqual(mockCharacter);
  });
});
```

---

## Testing i18n

```typescript
import { t } from "@/i18n/index";

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

---

## Test Data Management

### Use Factories:

```typescript
// tests/factories/character.ts
export function createTestCharacter(overrides = {}) {
  return {
    name: "Test Character",
    tier: 1,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Controls Beasts",
    stats: {
      might: { pool: 12, edge: 1, current: 12 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 8, edge: 0, current: 8 },
    },
    ...overrides,
  };
}

// Use in tests
const character = createTestCharacter({ name: "Custom Name" });
```

---

## Debugging Tests

### Common Issues:

**Tests pass individually but fail together:** tests are not isolated —
shared state between tests. Use `beforeEach` to reset state.

**Flaky tests:**

- Race conditions (use proper async/await)
- Time-dependent code (mock time)
- Random data (use fixed seeds)
- **`page.evaluate: Execution context was destroyed, most likely because of a
navigation`, seen only under `npm run test:e2e`/`test:e2e:all` (the dev
  server), never under `npm run test:e2e:prod`:** this is Vite's dev-server
  client (`/@vite/client`, injected into every dev-served page) reloading the
  page on its own connection/ping handshake, independent of any source edit —
  not present at all in a production build (`vite preview` injects nothing).
  Re-run the specific scenario against `npm run test:e2e:prod` before treating
  it as a regression; CI runs that path exclusively, so this class of flake
  never reaches it.
- **A step that navigates (`page.goto`, `page.reload`) or calls a test API
  right after navigation, then immediately reads DOM/storage state:** the app's
  render pipeline (loading character/version data, i18n, etc.) runs
  asynchronously after `domcontentloaded`/`load` fires, so a step with no wait
  in between can race it. Check whether a near-identical sibling step already
  waits (`waitForLoadState("networkidle")` + a short `waitForTimeout`, or
  `waitForSelector` on a baseline element like `[data-testid="character-name"]`)
  and bring the flaky one in line rather than inventing a new pattern.

**Slow tests:** too many E2E tests (move logic to unit tests), missing mocks
for external dependencies, unnecessary waits.

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
- **Code Quality:** See `code-quality.md` for code quality standards
- **Git:** See `git.md` for pre-commit/pre-push test requirements
