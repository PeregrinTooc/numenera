# Session Handoff — 1 August 2026

Written at the end of a Claude Code (web/CLI) session on branch
`claude/project-implementation-review-6y3t2j`, for a follow-up session to pick
up from a different machine. Read this first, then `docs/PROJECT_REVIEW.md`
and `docs/IMPLEMENTATION_PLAN.md` for the full detail this summarizes.

## State right now

- Branch `claude/project-implementation-review-6y3t2j` is pushed to `origin`
  and has an open PR: **#1**, `https://github.com/PeregrinTooc/numenera/pull/1`.
- Latest commit: `ead5efb` ("docs: record verified E2E race fixes and flag
  remaining flakes").
- `tsc --noEmit` clean, `npm run test:unit` 744/744 passing, `npm run lint`
  0 errors / 254 warnings (all `no-explicit-any`, tracked as a Phase 4
  cleanup item), `npm run format:check` clean, `npm run build` succeeds.
- `npm run test:e2e:prod` (the suite CI runs): **356 of 359 scenarios pass.**
  The 3 remaining failures are documented and understood — see below — not
  silently ignored.

## What this session did, in order

1. Converted `.clinerules/` into `CLAUDE.md` + `docs/rules/*.md` (the file
   you're reading this from a version of).
2. Fixed a CI bug: `.github/workflows/deploy.yml` deployed to GitHub Pages on
   `pull_request` events with no branch guard.
3. Wrote `docs/PROJECT_REVIEW.md` (a full defect review) and
   `docs/IMPLEMENTATION_PLAN.md` (the plan to address it), both on this
   branch.
4. Fixed several defects from that review: the Rule #11 storage-adapter
   bypass in three components, the Tailwind `@theme` breakpoint/font gaps,
   the oddities-array import bug (`sanitizeArrayField` was dropping every
   string oddity), and deleted two confirmed-dead files
   (`tailwind.config.js`, `src/storage/localStorage.ts`).
5. **Main task: fixed the 4 E2E failures from the original baseline run.**
   All 4 are now confirmed resolved:
   - `getVersionHistory()` singleton race (published the manager before
     `init()` resolved) — `docs/PROJECT_REVIEW.md` §2.8.
   - Layout-clobbering: `toggleLayoutEditMode()` re-saved a stale in-memory
     layout on every exit — §2.9.
   - `character-display` finding 0 artifacts — a test-isolation bug (E2E
     cleanup targeted a hardcoded wrong IndexedDB name) — §0.1.
   - `version-history`'s "Execution context was destroyed" during Ctrl+Z —
     proven **not an app bug**: it's Vite dev-server's injected client
     opening its own WebSocket and occasionally reloading the page
     mid-`page.evaluate()`. Doesn't occur under `vite preview`/production
     builds, and CI only ever runs `test:e2e:prod` — see §2.15.
6. While confirming those fixes with progressively larger E2E runs, found
   and fixed **two more races** the same investigation surfaced (not part of
   the original 4, but same root-cause family): three `version-history`
   `Given` steps and the shared `"I reload the page"` step were missing a
   wait for the app's async render pipeline that their sibling steps already
   had, letting the test's actions race the app's own bootstrap. Fixed in
   `tests/e2e/step-definitions/version-history.steps.ts` and
   `common-steps.ts`. Full detail and root-cause writeup: §2.16.
7. Running the **entire** 359-scenario suite once as a final check surfaced
   3 more pre-existing flakes (see next section) — investigated enough to
   characterize them, then deliberately left unfixed to keep this session's
   scope bounded to what was asked. Documented in §2.17.
8. Committed as 4 logical commits and pushed with `--no-verify` (the
   pre-push hook needs a real E2E run, which this container can't do
   natively — see Environment notes below). The user approved the push
   explicitly before it happened.

## Known open flakes — not fixed, look here first if E2E is red

`docs/PROJECT_REVIEW.md` §2.17 has the full writeup. Short version: running
`card-reordering.feature` and `recovery-damage-track.feature` (isolated or as
part of the full suite) intermittently fails:

- Two `card-reordering.feature` scenarios: `locator.dragTo()` timing out at
  30s waiting for a drag-target ancestor locator.
- Three `recovery-damage-track.feature` scenarios:
  `page.textContent("body")` immediately after `"I am on the character sheet
page"` (a bare `page.goto()` with no post-load wait) sometimes catches a
  loading placeholder instead of rendered text; one also hit a 2000ms
  `waitForFunction` timeout.

These reproduced in isolation, not just under full-suite load, so it's likely
the same missing-synchronization pattern just fixed elsewhere this session
(§2.16) rather than pure resource contention — but neither step file was
touched this session and confirming that hypothesis is real, separate work.
If picking this up: start by checking whether `card-reordering.steps.ts` and
`recovery-damage-track.steps.ts` have a sibling step with a stronger wait to
copy, the same way §2.16's fixes did.

## What's still open in the implementation plan

`docs/IMPLEMENTATION_PLAN.md` tracks everything from the original review.
Items marked `— DONE` are shipped; the following are not yet started:

- **Phase 1:** 1.3 (ETag ignores nested data — breaks multi-tab conflict
  detection), 1.4 (restoring a version drops the portrait).
- **Phase 2:** 2.1 (event listeners re-registered on every render — Ctrl+Z
  needs N presses after N edits), 2.3 (`VersionState.setLatestCharacter()`
  dead code — "return to latest" shows stale data), 2.4 (recovery
  checkboxes/damage radios have no `@change` handler — persist nothing),
  2.6 (Ctrl+Shift+Z redo never fires).
- **Phase 3:** unfinished-feature decisions (grid merge/split, import-layout
  prompt — both unreachable), Tailwind add-button colours purged from
  production CSS, modal focus trap skips textareas, general doc drift
  (`docs/CURRENT_FEATURE.md`, `docs/FEATURES.md`, dead `docs/DEPLOYMENT.md`
  links).
- **Phase 4:** a list of low-risk cleanups (duplicated re-render block in
  `main.ts`, a shallow-copy bug in `handleFieldUpdate`, a few listener/leak
  fixes, the 254 `no-explicit-any` lint warnings, `detectChanges` being
  fully unused despite being tested, etc.) — see the plan for the full list,
  they're independent and safe to pick off in any order.

None of this is blocking; it's the backlog the original review produced.

## Environment notes for the desktop session

- This session ran in a sandboxed container without network access to
  download Playwright's pinned Chromium build, so E2E runs used
  `PW_EXEC_PATH=/opt/pw-browsers/chromium` (an env var `tests/e2e/support/
hooks.ts` already supports, added this session — see 0.3 in the plan). On
  a normal desktop setup this almost certainly isn't needed; just run
  `npm run test:e2e:prod` normally and drop the env var.
- The pre-push Husky hook expects a working E2E run before allowing a push.
  This container had to use `git push --no-verify` for that reason, with the
  user's explicit approval each time. On a desktop machine where
  `npm run test:e2e:prod` runs cleanly, prefer letting the hook run normally
  rather than reaching for `--no-verify` out of habit.
- `npm run dev`'s Vite dev server (`test:e2e`/`test:e2e:all`, as opposed to
  `test:e2e:prod`) injects a client that can cause a spurious `page.evaluate:
Execution context was destroyed` failure unrelated to app code — see
  §2.15 and the note added to `docs/rules/testing.md`. If you see that
  specific error only under the dev-server path, re-verify against
  `test:e2e:prod` before treating it as a regression.

## Suggested next step

Pick whichever of the above matches what's actually being asked next. If the
ask is "keep fixing E2E flakes," start with §2.17 (card-reordering /
recovery-damage-track) since it's already scoped and characterized. If it's
"keep working the review," `docs/IMPLEMENTATION_PLAN.md`'s Phase 1/2 items
are the highest-severity remaining defects (data loss / silently-broken
features), in that order.
