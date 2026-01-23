# Quick Reference - Pitfalls, Cheatsheets & Troubleshooting

**Fast lookup for common mistakes, syntax, and problem-solving**

---

## Common Pitfalls & Recovery

### ❌ Pitfall 1: Committing Without User Review

**Why:** Eager to complete task quickly  
**Recovery:** Present changes for review anyway, apologize

### ❌ Pitfall 2: Hardcoded Text Instead of t()

**Why:** Faster to type literal strings  
**Recovery:** Pre-commit hook catches this - add missing keys to both en.json and de.json

### ❌ Pitfall 3: Writing Code Before Tests

**Why:** Impatient to see working feature  
**Recovery:** Delete code, write test first, re-implement

### ❌ Pitfall 4: Multiple Failing Tests at Once

**Why:** Trying to be thorough  
**Recovery:** Comment out all but one test, solve that, then uncomment next

### ❌ Pitfall 5: Newlines in Single -m Flag

**Why:** Trying to format commit message nicely  
**Recovery:** Reconstruct with multiple -m flags

### ❌ Pitfall 6: Skipping Feature File

**Why:** "This is just a small change"  
**Recovery:** Write feature file now, then proceed

### ❌ Pitfall 7: Using `any` Type

**Why:** Don't know the exact type  
**Recovery:** Use `unknown` and narrow with type guards. Linter will catch this.

### ❌ Pitfall 8: Accessing localStorage Directly

**Why:** Seems simpler than using adapter  
**Recovery:** Refactor to use storage adapter interface from `src/storage/localStorage.ts`

---

## Syntax Cheatsheets

### Translation Usage

```typescript
// Import
import { t } from "../i18n/index.js";

// Basic usage
<h1>{t("app.title")}</h1>

// In attributes
<button aria-label={t("buttons.save")}>

// DON'T translate
<div class="stat-pool">     // CSS class
<div data-testid="stat">    // Test ID
```

### Test Structure

```typescript
describe("ComponentOrModule", () => {
  describe("methodName", () => {
    it("should do expected behavior", () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Git Commands

```bash
# Simple commit (≤256 chars)
git add -A && git commit -m "feat(scope): description" && git push

# Complex commit (>256 chars)
git add -A && \
git commit \
  -m "feat(scope): subject line" \
  -m "Detailed explanation." \
  -m "Changes:
- Item 1
- Item 2" && \
git push
```

### BDD Feature Template

```gherkin
Feature: [Feature Name]
  As a [user type]
  I want to [action]
  So that [benefit]

  Scenario: [Scenario name]
    Given [initial state]
    When [action]
    Then [expected outcome]
```

---

## Troubleshooting Guide

### "Pre-commit hook failed - missing translation keys"

**Cause:** Translation keys missing from en.json or de.json  
**Solution:**

1. Check error message for missing keys
2. Add to `src/i18n/locales/en.json`
3. Add to `src/i18n/locales/de.json`
4. Try commit again

### "Tests are failing"

**Cause:** Code doesn't meet test expectations  
**Solution:**

1. Read test output carefully
2. Identify which test is failing
3. Understand what test expects
4. Fix code to meet expectation
5. Run tests again
6. Never commit failing tests

### "Git commit stuck in interactive mode"

**Cause:** Newlines in single -m flag  
**Solution:** Use multiple -m flags

```bash
# ❌ BAD
git commit -m "feat: thing\n\nBody"

# ✅ GOOD
git commit -m "feat: thing" -m "Body"
```

### "TypeScript error: Type 'any' is not allowed"

**Cause:** Using `any` type  
**Solution:**

1. Find the `any` usage
2. Determine actual type needed
3. Replace with proper type or `unknown`
4. If unknown, add type guard:
   ```typescript
   if (typeof value === 'string') { ... }
   ```

### "Can't remember which tests to write"

**Solution:**

- User story → Feature file (BDD)
- Business logic → Unit test
- UI behavior → Component test
- Full workflow → E2E test

### "Feature file vs Test - which first?"

**Solution:** ALWAYS feature file first (Rule #2)

1. Write `.feature` file
2. Get user approval
3. Then write tests

### "How many tests to write at once?"

**Solution:** ONE at a time (Rule #10)

- Write one test
- Make it pass
- Move to next test

---

## Decision Trees

### Which Rule File to Read?

```
Question about...
├─ Workflow process → rules/workflow.md
├─ Code standards → rules/code-quality.md
├─ Translations → rules/i18n.md
├─ Git/commits → rules/git.md
├─ Testing → rules/testing.md
├─ Architecture → rules/architecture.md
└─ Game mechanics → rules/numenera.md
```

### Which Test to Write?

```
What are you implementing?
├─ User-facing behavior → E2E test (feature file)
├─ Business logic → Unit test
├─ Component rendering → Unit test with DOM
└─ Data persistence → Unit test for storage
```

### How to Commit?

```
Message length?
├─ ≤ 256 chars → Single -m flag
└─ > 256 chars → Multiple -m flags
```

---

## Tool Selection Guide

```
Need to...
├─ Understand structure → list_files (recursive: true)
├─ Find usage → search_files (regex)
├─ See code API → list_code_definition_names
├─ Read file → read_file
├─ Create/replace file → write_to_file
├─ Edit parts → replace_in_file (preferred)
├─ Run command → execute_command
├─ Test web UI → browser_action
├─ Ask user → ask_followup_question
└─ Complete task → attempt_completion (after user review!)
```

---

## File Reference Map

| Need              | File                    | Section              |
| ----------------- | ----------------------- | -------------------- |
| Core 11 rules     | `golden_rules.md`       | All rules            |
| BDD/TDD process   | `rules/workflow.md`     | Development Workflow |
| Code standards    | `rules/code-quality.md` | TypeScript, Linting  |
| Translation setup | `rules/i18n.md`         | i18n Requirements    |
| Git workflow      | `rules/git.md`          | Commit Standards     |
| Test structure    | `rules/testing.md`      | Test Requirements    |
| System design     | `rules/architecture.md` | Patterns             |
| Game mechanics    | `rules/numenera.md`     | Domain Knowledge     |
| Common scenarios  | `quick/scenarios.md`    | 10 scenarios         |
| This reference    | `quick/reference.md`    | Quick lookup         |

---

## Remember

**When in doubt:**

1. Check `golden_rules.md` for the 11 core rules
2. Read relevant rule file for details
3. Check this quick reference for syntax
4. Ask user if still unclear

**Golden rule priority:**

1. User review before commit
2. BDD/TDD workflow
3. i18n everything
4. TypeScript strict
5. Tests must pass

---

**Keep this file handy for quick lookups during development**
