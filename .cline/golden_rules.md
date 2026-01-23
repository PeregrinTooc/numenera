# Golden Rules for AI Development

**Purpose:** These are ABSOLUTE rules that must be followed for this project. This file should be read at the start of every development session.

**For detailed documentation:** See `.cline/rules/` directory for context-specific rules.  
**For quick lookup:** See `.cline/quick/` directory for scenarios and cheatsheets.

---

## The 11 Commandments

### 1. 🔒 User Review Before Commit (CRITICAL)

**ALWAYS present changes to the user for review before committing.**

- Exception: Only when user explicitly says "commit without review"
- Show what changed, why, and what tests pass
- Wait for explicit approval

**Details:** See `rules/git.md` and `rules/workflow.md`

---

### 2. 📝 BDD First - No Code Without Feature File

**Every feature MUST start with a BDD `.feature` file before ANY implementation.**

- Write feature file in `tests/e2e/features/`
- Use Gherkin syntax (Given/When/Then)
- Get user approval on feature file
- ONLY THEN write code

**Exception:** None. Even bug fixes should have a test scenario.

**Details:** See `rules/workflow.md` → Rule #2

---

### 3. 🧪 TDD Always - Test Before Code

**Follow strict Red-Green-Refactor cycle. NO production code without a failing test first.**

- Write ONE failing test
- Write minimal code to pass it
- Refactor while keeping tests green
- Repeat

**Exception:** None. This is non-negotiable.

**Details:** See `rules/workflow.md` → Rule #3

---

### 4. 🌍 i18n Everything - No Hardcoded Text

**ALL user-facing text MUST use the `t()` function with translation keys.**

- Import: `import { t } from "../i18n/index.js";`
- Use: `{t("your.translation.key")}`
- Keys must exist in BOTH `en.json` AND `de.json`
- Pre-commit hook will BLOCK commits if keys are missing

**What needs translation:**

- All visible text in UI
- Button labels, headings, messages
- Error messages, tooltips, placeholders

**What doesn't need translation:**

- HTML attributes (`class`, `type`, `role`, `data-testid`)
- CSS class names
- Code identifiers

**Exception:** None. Pre-commit hook enforces this automatically.

**Details:** See `rules/i18n.md`

---

### 5. 💪 TypeScript Strict Mode - No Shortcuts

**Strict TypeScript mode is MANDATORY. NO `any` types allowed.**

- Explicit return types for exported functions
- Use `unknown` if you truly don't know the type
- Interface over type for object shapes
- Use path aliases: `@/` prefix for src imports

**Exception:** None. Linter enforces this.

**Details:** See `rules/code-quality.md` → Rule #5

---

### 6. 🔄 Make the Change Easy, Then Make the Easy Change

**Before implementing a feature, refactor to make the implementation trivial.**

- Analyze existing code structure
- Identify what makes the change hard
- Refactor to make it easy (with tests passing)
- THEN implement the feature

**Exception:** None. This prevents technical debt accumulation.

**Details:** See `rules/workflow.md` → Rule #6

---

### 7. 📤 Git Workflow - Smart Commit Messages

**Use appropriate git commit format based on message length.**

**For simple commits (≤ 256 chars):**

```bash
git add -A && git commit -m "type(scope): description" && git push
```

**For complex commits (> 256 chars):**

```bash
git add -A && \
git commit \
  -m "type(scope): subject line" \
  -m "Detailed explanation paragraph." \
  -m "Bullet list of changes:
- Change 1
- Change 2
- Change 3" \
  -m "Closes #123" && \
git push
```

**Key rules:**

- NEVER embed newlines in single `-m` flag
- Chain commands with `&&` (not semicolons)
- Wait for command completion before proceeding

**Exception:** None. This ensures non-interactive automation.

**Details:** See `rules/git.md` → Rule #7

---

### 8. ✅ Commit Only Working Code

**All tests must pass before committing. No exceptions.**

- Unit tests pass: `npm run test:unit`
- E2E tests pass: `npm run test:e2e`
- Linter passes: ESLint + Prettier
- Pre-commit hooks verify automatically

**Exception:** None. Hooks will block bad commits anyway.

**Details:** See `rules/git.md` → Rule #8

---

### 9. 📱 Responsive Design Required

**Test features across all required viewports.**

**Required viewports:**

- Desktop (Chromium)
- Mobile (Pixel 5 - Mobile Chrome)
- Mobile Safari (iPhone 12)
- Tablet (iPad Pro)

**All features must work on ALL viewports.**

**Exception:** None. E2E tests verify this automatically.

**Details:** See `rules/testing.md` → Rule #9

---

### 10. 🎯 One Test at a Time

**Write ONE test, make it pass, then move to the next.**

- Never write multiple failing tests
- Never skip a test to work on another
- Each test informs the next design decision
- Keeps cognitive load manageable

**Exception:** None. This is core to TDD discipline.

**Details:** See `rules/workflow.md` → Rule #10

---

### 11. 📚 Storage Through Adapters Only

**NEVER access localStorage directly. Always use storage adapters.**

- Use the StorageAdapter interface
- Implementation in `src/storage/localStorage.ts`
- Enables future cloud storage migration
- Maintains consistent API

**Exception:** None. Architecture requirement.

**Details:** See `rules/architecture.md` → Rule #11

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
├─ Does code need user-facing text?
│  ├─ Yes → USE t() FUNCTION (Rule #4)
│  └─ No → Continue
├─ All tests passing?
│  ├─ No → FIX THEM FIRST (Rule #8)
│  └─ Yes → Continue
└─ Ready to commit?
   └─ PRESENT TO USER FOR REVIEW (Rule #1)
```

---

## When to Read Detailed Rules

**Read context-specific rule files when:**

- **Workflow process:** `rules/workflow.md` (BDD/TDD, refactoring, process)
- **Code standards:** `rules/code-quality.md` (TypeScript, linting, organization)
- **Translations:** `rules/i18n.md` (translation keys, pre-commit hook)
- **Git workflow:** `rules/git.md` (commits, branches, hooks)
- **Testing:** `rules/testing.md` (test structure, mocking, coverage)
- **Architecture:** `rules/architecture.md` (storage, styling, performance)
- **Game mechanics:** `rules/numenera.md` (character structure, stats, items)

**Read quick references when:**

- **Common scenarios:** `quick/scenarios.md` (10 common situations)
- **Quick lookup:** `quick/reference.md` (pitfalls, syntax, troubleshooting)

---

## Rule Priority

All 11 rules are **ABSOLUTE** and **NON-NEGOTIABLE**.

However, if you must choose in edge cases:

1. **Safety First**: User review, tests passing
2. **Quality Second**: BDD/TDD, i18n, TypeScript
3. **Process Third**: Git workflow, refactoring approach

---

## Final Reminder

These rules exist to:

- ✅ Maintain code quality
- ✅ Enable effective AI collaboration
- ✅ Prevent technical debt
- ✅ Ensure user satisfaction
- ✅ Make the codebase maintainable

**When in doubt, refer back to these rules. They guide every decision.**
