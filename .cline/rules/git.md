# Git & Version Control Rules

**Context:** Git workflow, commit standards, and version control requirements

---

## Rule #7: 📤 Git Workflow - Smart Commit Messages

**Use appropriate git commit format based on message length.**

### For Simple Commits (≤ 256 characters):

```bash
git add -A && git commit -m "type(scope): description" && git push
```

### For Complex Commits (> 256 characters):

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

### Key Rules:

- NEVER embed newlines in single `-m` flag
- Chain commands with `&&` (not semicolons)
- Wait for command completion before proceeding
- Exception: **None.** This ensures non-interactive automation.

---

## Rule #8: ✅ Commit Only Working Code

**All tests must pass before committing. No exceptions.**

### Requirements:

- Unit tests pass: `npm run test:unit`
- E2E tests pass: `npm run test:e2e`
- Linter passes: ESLint + Prettier
- Pre-commit hooks verify automatically
- Exception: **None.** Hooks will block bad commits anyway.

### Checklist Before Commit:

```
□ All tests passing (unit + E2E)
□ Linter passes (no errors or warnings)
□ All text using i18n (t() function)
□ No console.log statements (use proper logging)
□ Code reviewed and approved by user
□ Commit message follows standards
```

---

## Conventional Commits (MANDATORY)

### Format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples:

**Simple commit:**

```bash
git add -A && git commit -m "feat(character): add stat pool management" && git push
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

---

## AI-Assisted Git Workflow

### Problem:

Combining `git add`, `git commit`, and `git push` with long commit messages causes interactive shell prompts that break automation.

### Solution:

Use multiple `-m` flags for structured commit messages instead of embedding newlines in a single `-m` flag.

### Rules for Multiple `-m` Flags:

1. **NEVER embed newlines within a single `-m` flag**

   ```bash
   # ❌ BAD - Breaks shell
   git commit -m "feat: add feature\n\nThis breaks"

   # ✅ GOOD - Multiple -m flags
   git commit -m "feat: add feature" -m "This works"
   ```

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

   ```bash
   # ✅ GOOD - Stops on error
   git add -A && git commit -m "fix: bug" && git push

   # ❌ BAD - Continues even if commit fails
   git add -A; git commit -m "fix: bug"; git push
   ```

4. **Each `-m` creates a paragraph**
   - Paragraphs are separated by blank lines
   - First `-m` is the subject
   - Subsequent `-m` flags form the body

### What NOT to Do:

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

### Why This Works:

- No interactive shell prompts
- No quote escaping issues
- Works in automated contexts (CI/CD, AI tools)
- Maintains professional commit structure
- Follows conventional commits format
- Each `-m` is self-contained

---

## Branch Strategy

### Branch Naming:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code improvements

### Workflow:

1. Create branch from `main`
2. Implement feature with BDD/TDD
3. All tests passing
4. Create PR
5. Review and merge to `main`

---

## When to Commit

### ✅ Commit when:

- Feature is complete (all tests pass)
- Refactoring is done (all tests still pass)
- Bug is fixed (all tests pass)
- Documentation is updated

### ❌ Don't commit when:

- Tests are failing
- Code is half-written
- Linter errors exist
- Temporary debug code is present

---

## Husky Hooks

### Pre-commit (Automatically runs):

- Lint-staged (format and lint changed files)
- Run unit tests
- Check i18n translation keys
- Block commit if any fail

### Pre-push (Automatically runs):

- Run E2E tests
- Block push if tests fail

### You Cannot Bypass These

(Nor should you want to - they protect code quality)

---

## Git Commands Reference

### Daily Workflow:

```bash
# Start new feature
git checkout -b feature/new-feature

# Make changes, run tests
npm run test:unit
npm run test:e2e

# Stage and commit (simple)
git add -A && git commit -m "feat(scope): description" && git push

# Stage and commit (complex)
git add -A && \
git commit \
  -m "feat(scope): subject" \
  -m "Detailed explanation." \
  -m "Changes:
- Item 1
- Item 2" && \
git push
```

### Check Status:

```bash
# See what's changed
git status

# See detailed diff
git diff

# See staged changes
git diff --staged
```

### Branch Management:

```bash
# List branches
git branch

# Switch branch
git checkout branch-name

# Create and switch
git checkout -b new-branch-name

# Delete branch (after merge)
git branch -d branch-name
```

---

## Commit Message Examples

### Feature:

```
feat(character): add stat pool management

Implement Might, Speed, and Intellect pools with
edge and current value tracking.

Closes #23
```

### Bug Fix:

```
fix(storage): correct character save timestamp

The lastModified timestamp was not updating on save.
Now properly sets timestamp before serialization.
```

### Refactor:

```
refactor(components): extract common item rendering logic

Move shared item rendering code to base ItemComponent class.
Reduces duplication across Cypher, Artifact, and Equipment items.
```

### Documentation:

```
docs(readme): update installation instructions

Add troubleshooting section for common npm install issues.
Include node version requirements.
```

### Test:

```
test(character): add validation tests for stat pools

Verify edge reduction, minimum values, and pool spending logic.
Covers edge cases from issue #45.
```

---

## Troubleshooting

### "Pre-commit hook failed"

**Causes:**

- Tests failing
- Linter errors
- Missing i18n translation keys

**Solution:**

1. Read the error message
2. Fix the reported issues
3. Try commit again

### "Git commit stuck in interactive mode"

**Cause:** Newlines in single `-m` flag

**Solution:** Use multiple `-m` flags instead

```bash
# Instead of this (breaks):
git commit -m "feat: thing\n\nBody"

# Do this:
git commit -m "feat: thing" -m "Body"
```

### "Push rejected"

**Causes:**

- E2E tests failing (pre-push hook)
- Remote branch has changes you don't have

**Solution:**

1. If tests failing: Fix tests, then push
2. If remote has changes: Pull first, then push

```bash
git pull --rebase
git push
```

---

## For AI Development

When AI tools (like Cline) need to commit code:

1. Use `git add -A` to stage all changes
2. Build commit message with multiple `-m` flags
3. Chain with `&&` for safety
4. Use backslashes for readability
5. Always include `git push` at the end
6. Wait for command completion before proceeding

This ensures git operations are fully automated, non-interactive, and professional.

---

## Related Rules

- **Workflow:** See `workflow.md` for Rule #1 (User Review Before Commit)
- **Testing:** See `testing.md` for test requirements before commit
- **i18n:** See `i18n.md` for translation checks in pre-commit hook

---

**Git workflow rules are ABSOLUTE and enforced by pre-commit/pre-push hooks.**
