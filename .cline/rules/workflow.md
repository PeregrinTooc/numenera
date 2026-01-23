# Workflow Rules

**Context:** Development process and workflow requirements

---

## Rule #1: 🔒 User Review Before Commit (CRITICAL)

**ALWAYS present changes to the user for review before committing.**

### Requirements:

- Show what changed and why
- Confirm all tests pass
- Wait for explicit approval
- Exception: Only when user explicitly says "commit without review"

### Why This Rule Exists:

- Maintains quality control
- Prevents unwanted changes
- Ensures user understands what's being committed
- Enables course correction before code is committed

### In Practice:

```
After implementing feature:
1. Run all tests
2. Present summary of changes to user
3. Wait for "approved" or similar confirmation
4. Only then execute git commands
```

---

## Rule #2: 📝 BDD First - No Code Without Feature File

**Every feature MUST start with a BDD `.feature` file before ANY implementation.**

### Requirements:

- Write feature file in `tests/e2e/features/`
- Use Gherkin syntax (Given/When/Then)
- Get user approval on feature file
- ONLY THEN write code
- Exception: **None.** Even bug fixes need a scenario.

### Process:

1. **Write Feature File First**
   - Create `.feature` file in `tests/e2e/features/`
   - Use Gherkin syntax
   - Describe user behavior, not implementation
   - Example filename: `character-creation.feature`

2. **Review & Refine**
   - Ensure feature describes actual user value
   - Break down complex features into multiple scenarios
   - Get stakeholder approval if needed

3. **Only Then: Implement**
   - Never write code before the feature file exists
   - Feature file serves as acceptance criteria

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

- Write from user perspective, not technical perspective
- Use present tense
- Be specific but not implementation-focused
- One feature per file
- Multiple scenarios per feature when appropriate

**Reference:** See `testing.md` for detailed BDD examples

---

## Rule #3: 🧪 TDD Always - Test Before Code

**Follow strict Red-Green-Refactor cycle. NO production code without a failing test first.**

### Red-Green-Refactor Cycle:

1. **RED**: Write ONE failing unit test
2. **GREEN**: Write minimal code to make it pass
3. **REFACTOR**: Clean up code while keeping tests green
4. **REPEAT**: Next test, one at a time

### Rules:

- Write only one test at a time
- Never write production code without a failing test first
- Tests must fail for the right reason before implementation
- All previous tests must still pass
- Exception: **None.** This is non-negotiable.

### Example:

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

**Reference:** See `testing.md` for test structure details

---

## Rule #6: 🔄 Make the Change Easy, Then Make the Easy Change

**Before implementing a feature, refactor to make the implementation trivial.**

### Process:

1. Analyze existing code structure
2. Identify what makes the change hard
3. Refactor to make it easy (with tests passing)
4. THEN implement the feature

### Why This Matters:

- Prevents technical debt accumulation
- Makes features easier to implement correctly
- Improves code quality continuously
- Reduces bugs from rushed implementations

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

### Exception:

**None.** This prevents technical debt.

---

## Rule #10: 🎯 One Test at a Time

**Write ONE test, make it pass, then move to the next.**

### Requirements:

- Never write multiple failing tests
- Never skip a test to work on another
- Each test informs the next design decision
- Keeps cognitive load manageable

### Why:

- Maintains focus
- Each test is a small, achievable goal
- Prevents overwhelming complexity
- Enables incremental progress
- Makes debugging easier

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

### Exception:

**None.** This is core to TDD discipline.

---

## Quick Decision Tree

```
Starting a task?
├─ Does feature file exist?
│  ├─ No → CREATE IT FIRST (Rule #2)
│  └─ Yes → Continue
├─ Does test exist for this behavior?
│  ├─ No → WRITE TEST FIRST (Rule #3)
│  └─ Yes → Continue
├─ Does code need refactoring first?
│  ├─ Yes → REFACTOR FIRST (Rule #6)
│  └─ No → Continue
├─ Working on multiple tests?
│  ├─ Yes → FOCUS ON ONE (Rule #10)
│  └─ No → Continue
├─ All tests passing?
│  ├─ No → FIX THEM FIRST
│  └─ Yes → Continue
└─ Ready to commit?
   └─ PRESENT TO USER FOR REVIEW (Rule #1)
```

---

## Commit Frequency

- Commit after each working feature (all tests green)
- Commit message follows conventional commits format
- Never commit broken code
- Push regularly to trigger CI/CD

**Reference:** See `git.md` for commit standards

---

## Related Rules

- **Testing:** See `testing.md` for test structure and requirements
- **Git:** See `git.md` for commit and push standards
- **Code Quality:** See `code-quality.md` for code standards

---

**These workflow rules are ABSOLUTE and NON-NEGOTIABLE.**
