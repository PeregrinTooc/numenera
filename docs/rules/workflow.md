# Workflow Rules

**Context:** Development process detail supporting Rules #1, #2, #3, #6, #10 in
`CLAUDE.md`. Each rule's requirement, rationale, and exception are stated there
— this file adds only what that summary doesn't: templates, the canonical
example, and process detail.

---

## Rule #1 — User Review Before Commit

### In Practice:

```
After implementing a feature:
1. Run all tests
2. Present a summary of changes to the user
3. Wait for "approved" or similar confirmation
4. Only then execute git commands
```

---

## Rule #2 — BDD First

### Feature File Format:

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

- Write from the user's perspective, not the implementation's
- Use present tense
- Be specific but not implementation-focused
- One feature per file; multiple scenarios per feature when appropriate
- Reuse existing step phrases: look them up in `tests/e2e/STEP_CATALOG.md`
  (generated — `npm run docs:steps`) before inventing a new one

**Reference:** See `testing.md` for a full worked feature file.

---

## Rule #3 — TDD Always

The canonical Red-Green-Refactor cycle, referenced by other rule files instead
of repeating it:

```typescript
// 1. RED - Write failing test
describe("StatPool", () => {
  it("should reduce current when spending points", () => {
    const pool = new StatPool(10, 0);
    pool.spend(3);
    expect(pool.current).toBe(7); // FAILS - spend() not implemented
  });
});

// 2. GREEN - Minimal implementation
class StatPool {
  constructor(
    public pool: number,
    public edge: number
  ) {
    this.current = pool;
  }
  current: number;

  spend(points: number): void {
    this.current -= points; // Simplest code to pass
  }
}

// 3. REFACTOR - Improve while keeping green
class StatPool {
  // ... (add validation, error handling, etc.)
  spend(points: number): void {
    if (points < 0) throw new Error("Cannot spend negative");
    if (points > this.current) throw new Error("Insufficient points");
    this.current -= points;
  }
}
```

---

## Rule #6 — Make the Change Easy, Then Make the Easy Change

### Example:

```
Task: Add validation to character creation

Hard way: Add validation in multiple places, duplicate logic

Easy way:
1. First: Extract character creation to single function (refactor)
2. Ensure tests still pass
3. Then: Add validation to that one function (feature)
4. Much simpler, less error-prone
```

---

## Rule #10 — One Test at a Time

### In Practice:

```
❌ BAD:
- Write 5 tests
- Try to make them all pass
- Get confused about which to fix first
- Lose track of what's working

✅ GOOD:
- Write 1 test
- Make it pass
- Commit (if appropriate)
- Write next test
- Clear progress, always working code
```

---

## When to Ask vs. Decide

Reserve `AskUserQuestion` for decisions you genuinely cannot resolve from the
request, the code, or a sensible default. If one reading is obviously right,
take it, say so, and keep going.

```
User: "Make it better"

You: [AskUserQuestion]
  question: "What would you like improved?"
  options:
    - "UI/styling"           — visual polish and layout
    - "Performance"          — rendering and save throughput
    - "Code structure"       — refactoring for maintainability
    - "New features"         — pick the next item from TODO.md
```

---

## Commit Frequency

- Commit after each working feature (all tests green)
- Never commit broken code
- Push regularly to trigger CI/CD

**Reference:** See `git.md` for commit format and standards.

---

## Related Rules

- **Testing:** See `testing.md` for test structure and requirements
- **Git:** See `git.md` for commit and push standards
- **Code Quality:** See `code-quality.md` for code standards
