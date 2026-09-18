# Git & Version Control Rules

**Context:** Git workflow, commit standards, and version control detail
supporting Rules #1, #7, #8 in `CLAUDE.md`.

---

## Rule #7 — Smart Commit Messages

### For Simple Commits (≤ 128 characters):

```bash
git add -A && git commit -m "type(scope): description" && git push
```

### For Complex Commits (> 128 characters):

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

See "Multiple `-m` Flags" below for why this shape is required.

---

## Rule #8 — Commit Only Working Code

### Pre-Commit Checklist:

```
□ All tests passing (unit + E2E)
□ Linter passes (no errors or warnings)
□ TypeScript strict mode compliance, no `any` types, explicit return types on exports
□ All text using i18n (t() function), no hardcoded user-facing strings
□ Proper error handling — no silently swallowed errors
□ No console.log statements (use proper logging)
□ Code is readable and maintainable
□ Code reviewed and approved by user (Rule #1)
□ Commit message follows conventional-commits format
```

Husky's pre-commit hook verifies the automatable parts of this (tests, lint,
i18n keys) and blocks the commit if any fail.

---

## Conventional Commits

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

---

## Multiple `-m` Flags

Combining `git add`, `git commit`, and `git push` with a commit message that
embeds newlines in a single `-m` flag causes interactive shell prompts that
break automation. Use one `-m` flag per paragraph instead.

1. **NEVER embed newlines within a single `-m` flag**

   ```bash
   # ❌ BAD - Breaks shell
   git commit -m "feat: add feature\n\nThis breaks"

   # ✅ GOOD - Multiple -m flags
   git commit -m "feat: add feature" -m "This works"
   ```

2. **Each `-m` flag is one paragraph**, in order: subject line (conventional
   commit format, ≤72 chars, present tense, no period), then an optional
   explanation (why the change was made, 1-2 sentences), then an optional
   bullet list of changes (this one may contain internal newlines), then an
   optional footer (issue references, breaking changes, co-authors).

3. **Chain commands with `&&`**, not `;`, so a failed commit stops the
   sequence:

   ```bash
   # ✅ GOOD - Stops on error
   git add -A && git commit -m "fix: bug" && git push

   # ❌ BAD - Continues even if commit fails
   git add -A; git commit -m "fix: bug"; git push
   ```

**Exception: None.** This ensures non-interactive automation.

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

```bash
# Start new feature
git checkout -b feature/new-feature

# Make changes, run tests
npm run test:unit
npm run test:e2e:all

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

# See what's changed
git status
git diff
git diff --staged

# Branch management
git branch
git checkout branch-name
git checkout -b new-branch-name
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

---

## Troubleshooting

### "Pre-commit hook failed"

**Causes:** tests failing, linter errors, missing i18n translation keys.

**Solution:** read the error message, fix the reported issue, try the commit
again.

### "Git commit stuck in interactive mode"

**Cause:** Newlines in a single `-m` flag.

**Solution:** Use multiple `-m` flags instead (see "Multiple `-m` Flags" above).

```bash
# Instead of this (breaks):
git commit -m "feat: thing\n\nBody"

# Do this:
git commit -m "feat: thing" -m "Body"
```

### "Push rejected"

**Causes:** E2E tests failing (pre-push hook), or the remote branch has
changes you don't have.

**Solution:**

```bash
# If tests are failing: fix them, then push again.
# If the remote has changes:
git pull --rebase
git push
```

---

## Related Rules

- **Workflow:** See `workflow.md` for Rule #1 (User Review Before Commit)
- **Testing:** See `testing.md` for test requirements before commit
- **i18n:** See `i18n.md` for translation checks in the pre-commit hook
