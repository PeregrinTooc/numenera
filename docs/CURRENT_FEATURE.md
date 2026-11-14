# CURRENT FEATURE: One Injectable Clock for All App Time

**Overview**
The app reads real time in many scattered places: about ten source files call
`setTimeout` directly (long-press, modal container, downloads, settings,
conflict modal, IndexedDB, live preview), about eleven sites call `Date.now()`
or `new Date()`, and only two services (`AutoSaveService`,
`VersionHistoryService`) take an injectable `ITimer`. Time is an architectural
boundary like persistence: it belongs behind one interface, even with a single
production implementation (`docs/rules/design.md`, smell 3), so tests control
it through the app's own seam instead of patching the browser.

**Goals**

- One `Clock` interface (timers and the current time) with a production
  implementation, created once at boot and passed to whatever needs it. No
  direct `setTimeout`, `setInterval`, `Date.now()` or `new Date()` outside it.
- A controllable implementation for tests, installed before boot, that unit and
  E2E tests share instead of each keeping their own.
- Retire the parallel E2E time seams once the clock exists:
  `window.__testTimer`, `window.__SQUASH_DELAY_MS__`, the hand-copied
  `TestTimer` clone in `tests/e2e/support/hooks.ts`, and Playwright's
  `page.clock` in the `@fake-clock` scenarios. Drivers advance the injected
  clock where the app waits on a timer (the auto-save flush, edits settling into
  a version, the long-press hold, modal transitions).
- Behaviour unchanged for users.

**E2E Tests**

- No new user-visible behaviour, so no new feature file: the existing suite
  stays green on all four profiles with the injected clock, and the
  `@fake-clock` tag goes away.
- `version-history-navigation.feature`: the timestamp scenario asserts a
  concrete relative age ("5 minutes ago") instead of `/ago|just now/`.
- Unit tests: a lint rule or test that fails on direct timer and date access
  outside the clock module.

**Design**

- `Clock` (`src/services/clock.ts`): `now()`, `setTimeout`, `clearTimeout`, with
  one production implementation, `SystemClock`. No `setInterval`: no caller
  needs it. It replaces `ITimer`/`RealTimer`.
- `ManualClock` (`src/services/manualClock.ts`) is the one controllable clock,
  shared by unit and E2E tests. It starts at a fixed, realistic time; timers
  fire only when a test advances it, in due-time order. It replaces
  `TestTimer` and the copy of it in `tests/e2e/support/hooks.ts`.
- `createAppContext` creates the clock once and injects it. In E2E a flag set
  by `page.addInitScript` before boot makes it create a `ManualClock` and expose
  it to the drivers, so tests use the real class (also in the production build
  that CI tests) instead of a serialised clone.
- Storage records the time it is given: version timestamps come from the
  caller's clock. The IndexedDB availability watchdog gets a `SystemClock` from
  `storageFactory`; it guards a hanging browser API that no test waits on.
- A lint rule bans `setTimeout`, `setInterval`, `Date.now()` and `new Date()`
  in `src/` outside `clock.ts`.

**Steps**

1. `Clock`, `SystemClock`, `ManualClock`; `AutoSaveService` and
   `VersionHistoryService` move off `ITimer`.
2. Direct timers through the clock, one area per commit.
3. Direct dates through the clock.
4. The lint rule.
5. E2E: the manual clock in every scenario; drivers advance it; retire
   `__testTimer`, `__SQUASH_DELAY_MS__`, `@fake-clock` and `page.clock`.
