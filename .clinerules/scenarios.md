# Common Scenarios & Responses

**Quick reference for handling common development situations**

---

## Scenario 1: User Asks for a New Feature

### Steps:

1. Ask clarifying questions if needed (what, why, how should it work?)
2. Create/update feature file in `tests/e2e/features/`
3. Present feature file to user for approval
4. Write first unit test (RED)
5. Implement minimal code to pass test (GREEN)
6. Refactor if needed (REFACTOR)
7. Repeat steps 4-6 until feature is complete
8. Run E2E tests across all viewports
9. Present changes to user for review
10. Commit only after approval

### Example:

```
User: "Add ability to spend stat pool points"

You:
1. "I'll create a feature file for stat pool spending"
2. [Create tests/e2e/features/stat-pool-spending.feature]
3. "Here's the feature file describing the behavior..."
4. [Wait for approval]
5. [Write failing test for spend() method]
6. [Implement spend() method]
7. [Refactor with validation]
8. [Run all tests]
9. "Feature complete. All tests passing. Ready to review."
10. [Wait for approval, then commit]
```

**Reference:** `workflow.md` Rules #1, #2, #3

---

## Scenario 2: User Reports a Bug

### Steps:

1. Understand the bug behavior
2. Create/update feature file with bug scenario
3. Write failing test that reproduces the bug
4. Verify test fails for the right reason
5. Fix the bug with minimal code change
6. Verify all tests pass
7. Present fix to user for review
8. Commit only after approval

### Example:

```
User: "Edge isn't being applied when spending pool points"

You:
1. "I see - the spend() method should reduce cost by edge value"
2. [Add scenario to feature file for edge reduction]
3. [Write test: spend(3) with edge 1 should cost 2 points]
4. [Verify test fails - showing edge not applied]
5. [Fix: effectiveCost = Math.max(0, cost - edge)]
6. [All tests pass]
7. "Bug fixed. Edge now correctly reduces spending cost."
8. [Wait for approval, then commit]
```

**Reference:** `workflow.md` Rules #1, #2, #3

---

## Scenario 3: User Wants to Refactor Code

### Steps:

1. Ensure ALL tests are passing first
2. Make one small refactoring change
3. Run tests - must still pass
4. Repeat steps 2-3 for each refactoring
5. Present refactored code to user
6. Commit only after approval

### Example:

```
User: "Extract the stat pool logic to its own class"

You:
1. [Verify all tests green]
2. [Create StatPool class with basic structure]
3. [Run tests - still passing]
4. [Move pool property to StatPool]
5. [Run tests - still passing]
6. [Move edge property to StatPool]
7. [Run tests - still passing]
8. [Move spend() method to StatPool]
9. [Run tests - still passing]
10. "Refactoring complete. StatPool is now its own class."
11. [Wait for approval, then commit]
```

**Reference:** `workflow.md` Rule #6

---

## Scenario 4: Adding User-Facing Text

### Steps:

1. Choose descriptive translation key (e.g., "character.stats.might")
2. Add key + English text to `src/i18n/locales/en.json`
3. Add key + German text to `src/i18n/locales/de.json`
4. Use in component: `{t("character.stats.might")}`
5. Pre-commit hook will verify both keys exist

### Example:

```
User: "Add a label for the Might stat"

You:
1. Key: "character.stats.might"
2. [Add to en.json: "might": "Might"]
3. [Add to de.json: "might": "Macht"]
4. [In component: <label>{t("character.stats.might")}</label>]
5. [Commit - hook verifies keys exist]
```

**Reference:** `i18n.md` Rule #4

---

## Scenario 5: User Asks to Commit Changes

### Steps:

1. Verify ALL tests pass (unit + E2E)
2. Verify linter passes
3. Present summary of changes to user
4. Wait for explicit approval
5. Choose commit format:
   - Simple (≤256 chars): Single `-m` flag
   - Complex (>256 chars): Multiple `-m` flags
6. Execute git command
7. Confirm push completed

### Example:

```
User: "Commit these changes"

You:
1. [Run: npm run test:unit && npm run test:e2e]
2. [All tests passing]
3. "Changes ready to commit:
   - Added StatPool class
   - Implemented spend() method with edge
   - All tests passing

   Commit message: 'feat(stats): add stat pool spending with edge'

   Approved?"
4. [Wait for "yes" or similar]
5. [Execute: git add -A && git commit -m "feat(stats): add stat pool spending with edge" && git push]
6. "Pushed to remote successfully"
```

**Reference:** `git.md` Rules #7, #8 and `workflow.md` Rule #1

---

## Scenario 6: Tests Are Failing

### Steps:

1. Read test output carefully
2. Identify which test is failing
3. Understand what the test expects
4. Fix code to meet expectation
5. Run tests again
6. Never commit failing tests

### Example:

```
Test fails: "Expected 7, received 10"

You:
1. [Read full error message]
2. "StatPool.spend() test failing"
3. "Test expects current to be 7 after spending 3 from 10"
4. [Check implementation - edge not being applied]
5. [Fix: this.current -= Math.max(0, points - this.edge)]
6. [Tests now pass]
7. "Test fixed. Edge now correctly applied."
```

**Reference:** `testing.md` and `workflow.md` Rule #8

---

## Scenario 7: User Wants Multiple Related Changes

### Steps:

1. Make changes together in logical groups
2. ONE tool call with multiple SEARCH/REPLACE blocks
3. Present all changes together for review
4. Commit as one logical unit

### Example:

```
User: "Add a button to spend pool points and wire it up"

You:
1. [Single replace_in_file call with multiple blocks:
   - Import statement for button
   - Button HTML in template
   - Event listener setup
   - Handler method]
2. "Added spend button with click handler"
3. [Wait for approval]
4. [Commit all together]
```

**Reference:** System rules on tool use

---

## Scenario 8: Pre-commit Hook Blocks Commit

### Cause: Missing translation keys

### Steps:

1. Read error message for missing keys
2. Add keys to `src/i18n/locales/en.json`
3. Add same keys to `src/i18n/locales/de.json`
4. Try commit again

### Example:

```
Error: "Missing key: character.stats.newStat"

You:
1. [Note: character.stats.newStat missing]
2. [Add to en.json: "newStat": "New Stat"]
3. [Add to de.json: "newStat": "Neuer Stat"]
4. [Retry commit - succeeds]
```

**Reference:** `i18n.md` Pre-commit Hook section

---

## Scenario 9: User Asks About Project Structure

### Steps:

1. Check if question relates to:
   - Numenera game rules → Read `numenera.md`
   - Workflow → Read `workflow.md`
   - Code quality → Read `code-quality.md`
   - Testing → Read `testing.md`
   - i18n → Read `i18n.md`
   - Git → Read `git.md`
   - Architecture → Read `architecture.md`
2. Provide relevant information
3. Reference the specific rule file

### Example:

```
User: "How do stat pools work in Numenera?"

You:
1. [Identify: Numenera domain knowledge]
2. [Read numenera.md]
3. "In Numenera, each stat has three values:
   - Pool: maximum points
   - Edge: cost reduction
   - Current: available points

   See numenera.md for complete mechanics."
```

**Reference:** All rule files in `.cline/rules/`

---

## Scenario 10: User Provides Vague Requirements

### Steps:

1. Use `ask_followup_question` tool
2. Provide specific options if helpful
3. Wait for clarification
4. Proceed once clear

### Example:

```
User: "Make it better"

You:
<ask_followup_question>
<question>What aspect would you like improved?</question>
<options>[
  "UI/styling improvements",
  "Performance optimization",
  "Code refactoring",
  "New features"
]</options>
</ask_followup_question>
```

**Reference:** System rules on `ask_followup_question`

---

## Key Principles

### Always:

- ✅ Read feature file before implementing
- ✅ Write test before code
- ✅ Use t() for all user-facing text
- ✅ Present for user review before commit
- ✅ Wait for confirmation after each tool use

### Never:

- ❌ Skip BDD/TDD workflow
- ❌ Hardcode user-facing text
- ❌ Commit without user approval
- ❌ Assume tool use succeeded without confirmation
- ❌ Write multiple failing tests at once

---

**For detailed guidance, see the specific rule files in `.cline/rules/`**
