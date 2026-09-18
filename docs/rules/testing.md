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
Feature: Resource Tracker Fields Editing
    As a user
    I want to edit XP, Shins, Armor, Max Cyphers, and Effort values
    So that I can manage character resources effectively

    Background:
        Given I am on the character sheet page

    Scenario: Editing current XP saves the change and leaves total XP untouched
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "10" in the modal input
        And I click the modal confirm button
        Then the Current XP badge should show "10"
        And the Total XP badge should show "45"
        And the character data should have currentXp 10
```

Copied from `tests/e2e/features/resource-tracker-editing.feature` so the
example and the real vocabulary never drift apart — every phrase here is a
live entry in the catalog below, not an invented one.

**Reference:** See `workflow.md` for the Feature File Format template (Rule #2).

**Vocabulary:** every step phrase the suite already understands is listed in
`tests/e2e/STEP_CATALOG.md`, with usage counts and the file that implements it.
Search it before writing a step; reuse an existing phrase exactly rather than
inventing a near-synonym. Regenerate with `npm run docs:steps`; `npm run
check:steps` fails on unused step definitions or a stale catalog.

### Phrasing Conventions

Where a family of near-synonyms exists, use the canonical form below rather
than adding another variant. This table is the tie-breaker; for anything not
listed, **the phrasing with the most uses wins**, unless a generic
parameterised pattern already exists (`{badge}`, `{cardType}`, `{textarea}`,
`{resource}` — see E2E World DSL below), in which case the generic one wins.

| Pattern                         | Canonical form                                                                                                                 | Not                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Click a labelled button         | `I click the "Confirm" button` (quoted, visible label)                                                                         | `I click the Confirm button`, `I click the modal confirm button`, `I click the new button` |
| Type into the open modal        | `I type "x" in the modal input`                                                                                                | `… in the input field`, `… into the input field`                                           |
| Assert modal input              | `the modal input should contain "x"`                                                                                           | `the input field should contain "x"`                                                       |
| Modal button state              | `the modal confirm button should be disabled`                                                                                  | `the confirm button should be disabled`                                                    |
| Counts of cards                 | `I should see 3 cypher cards` — `card(s)` optional in the definition                                                           | `I should see 1 cypher card` as a **separate** definition                                  |
| Set a resource on the character | `the character has 47 shins` / `the character has max cyphers 2` (one word order per resource, as the parameter type dictates) | `the character has armor value 2`                                                          |
| Badge assertions                | `the Armor badge should show "2"`                                                                                              | `the armor badge should show value "2"`                                                    |
| Basic-info fields               | `the descriptor should display "x"`                                                                                            | `the descriptor field should display "x"`                                                  |
| Given-state, no article noise   | `the character has a version with a name change`                                                                               | `… with name change`                                                                       |
| Capitalisation                  | Match the UI label inside quotes; lowercase elsewhere                                                                          | `I click the Export button` vs `I click the export button`                                 |

---

## E2E World DSL

Look here before writing a raw locator or a `new SomeHelper(this.page)` call.
`hooks.ts` builds each of these onto `CustomWorld` (`tests/e2e/support/world.ts`)
in `Before`, so every step definition has them from the first line:

| On `this`       | Class (file)                                         | For                                                                                                |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `dom`           | `DOMHelpers` (`support/dom-helpers.ts`)              | Generic `data-testid` locators and waits.                                                          |
| `storageHelper` | `TestStorageHelper` (`support/testStorageHelper.ts`) | Seed or clear character/version storage.                                                           |
| `modal`         | `ModalDsl` (`support/modal.ts`)                      | Confirm/cancel/type/clear/expectOpen/expectClosed on the edit modal.                               |
| `fields`        | `FieldsDsl` (`support/fields.ts`)                    | Click/tap/hover a named field or resource badge.                                                   |
| `cards`         | `CardsDsl` (`support/cards.ts`)                      | Set up, add, edit, delete and count cards by type.                                                 |
| `setup`         | `SetupDsl` (`support/setup.ts`)                      | `this.setup.character(overrides)` — seed `FULL_CHARACTER` + overrides, reload, wait for the sheet. |

Gherkin vocabulary comes in through parameter types
(`support/parameterTypes.ts`): `{cardType}`, `{badge}`, `{textarea}`,
`{resource}`. An unrecognised word is a compile-time undefined step, not a
runtime lookup failure inside the step body.

ESLint enforces the DSL rather than leaving it as convention: instantiating
`DOMHelpers`/`TestStorageHelper` directly, or one step-definitions file
importing from another, are both lint errors (`eslint.config.js`).

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
