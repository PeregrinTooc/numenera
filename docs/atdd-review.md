# ATDD Review: `tests/e2e`

Reviewed 2026-11-16 against Dave Farley's ATDD principles. This replaces the
2026-11-13 review, whose first four recommendations have since been carried out.

> **Status, 2026-11-18:** issues 1 and 2 are resolved, and so are the
> `CustomWorld` and hook-wiring items under "Further improvements". The work
> that resolved issue 1 landed the same day as this review. Issue 3 and the
> `@not-phone` audit are open. The text below keeps the findings as they were
> made; each section says what has changed since.

> **Source note:** this review used the free-tier summaries of Dave Farley's
> ATDD lessons (103b, 203, 301, 302, 303, 305, 306, 308), not the full lessons.
> The criteria quoted come from those summaries. The judgments, rewrites and
> anything marked _reviewer's suggestion_ are the reviewer's own.

## Context: the UI is the domain

This app has almost no business logic below the UI. It is an editor over a
character JSON, and the interaction itself (editing in place, dragging sections,
stepping through versions) is what users get. So where a feature _is_ an
interaction, specifying the gesture describes behaviour, not implementation.
Dave's "what, not how" principle is applied with that in mind.

## Overall assessment

This is now a recognisable four-layer suite, and a good one. Feature files speak
mostly in the user's terms. Step definitions in the migrated areas are thin
parsing over DSL classes (`CharacterDsl`, `CardEditorDsl`, `LayoutDsl`,
`VersionHistoryDsl`, …). Those sit on driver interfaces with one Playwright
implementation each, and the section-drag DSL has two drivers (mouse and touch)
chosen by device profile. Isolation, time control and release honesty are all
in good shape. At review time the migration was unfinished: about 25 of 42 step
files still called the page directly, and a handful of scenarios described
mechanism rather than behaviour. Both are done now (see issues 1 and 2). What
remains is deciding which layer proves each UI rule (issue 3) and auditing the
phone exclusions.

## Strengths

- **Functional isolation.** `hooks.ts` creates a fresh `browser.newContext()` per
  scenario and clears storage through the app's own adapters. Tests own their
  data, parallel runs are safe, and nothing depends on teardown order
  (lesson 302: each test creates and owns its data).
- **Real protocol drivers.** `SheetDriver`, `CardEditorDriver`,
  `ValueEditorDriver`, `ViewportDriver`, `VersionHistoryDriver`,
  `ComparisonDriver` and others are interfaces with Playwright implementations.
  Selectors live in one place per concern (lesson 305: drivers are the only
  layer that knows how the system works).
- **Mouse and touch behind one DSL call.** `LayoutDsl.moveSection` takes a
  `SectionInput` (`MouseInput` or `TouchInput`) selected by device profile. This
  is exactly lesson 303's "one test, several drivers".
- **No sleeps.** There are zero `waitForTimeout` calls, an ESLint rule forbids
  new ones, and the app runs on an injectable `ManualClock` the tests advance
  (lesson 306: no sleeps papering over races; confirm the outcome instead).
  The same rule now also forbids `setTimeout` and `setInterval`. The last two
  uses are gone: a zero-delay flush in the settings driver that waited for a
  listener the app already attaches synchronously, and a half-second sleep in a
  slide-failure diagnostic that became obsolete once the driver plays slides to
  their end.
- **Races are reproduced, not hoped away.** The held-save gate in
  `VersionSaveDriver` makes the squash race deterministic.
- **The suite reports its state honestly.** No feature uses `@skip`, `@wip` or
  `@deprecated` (the exclusion list in `cucumber.cjs` is empty in practice), CI
  has no `continue-on-error` or `if: false` on the e2e job, and the device
  exclusions (`@not-phone`, `@phone-only`, `@touch`, `@desktop-only`) are listed
  openly in one place. `@not-phone` on 23 scenarios is worth a periodic look,
  but each is a visible, greppable decision.
- **Specs state requirements in intent language** where migrated:
  "I change my Might pool to 12", "I start a new attack", "I save the card".

## Priority issues

### 1. Half the step files still bypass the DSL — resolved

_Lesson 308: step definitions are thin parsing, no logic, calling straight
through to a DSL. Lesson 305: the driver layer is the only one that knows how the
system works._

At review time about 25 of 42 step files still reached into the page (about 240
locator references and 41 `page.evaluate` calls), led by
`export-enhancement`, `layout-edit-mode`, `character-storage`, `i18n` and the
section-drag steps. Assertions such as "all character sections should show
data" checked `length > 0` instead of the data the test supplied, and
`export-enhancement` used window globals as its test API.

**Now:** no step definition touches the page, its context or storage. An ESLint
rule on `tests/e2e/step-definitions/` forbids `this.page`, `this.context`,
`this.storageHelper` and importing Playwright there. Every area has a DSL over a
driver interface, wired in one `createDsls(page, device)` factory
(`support/dsls.ts`). The export steps go through `FileExportDriver`
(`support/exportCapture.ts`), whose single in-page recorder counts save dialogs,
downloads and writes. That lets "asked where to save" and "downloaded" check
the path the app actually took rather than only a filename, and one
"I export my character" step serves every export scenario. Assertions compare
against the character the test supplied.

### 2. A few specs still describe mechanism, not behaviour — resolved

See step 2 under "Suggested next steps" for what changed.

_Lesson 103b: use the language of the problem domain. Lesson 203, mistake #1:
confusing UI interactions with behaviour. Dave's check: could a completely
different system satisfy this spec?_

Most of the suite passes that check, and for interaction-centred features
gesture language is legitimate. The leftovers are small and specific:

- **Storage technology in a title.** `character-file-import.feature:15`:
  _"Imported character persists in localStorage"_. IndexedDB is the primary
  store, so the title is wrong as well as coupled. The behaviour is that an
  imported character is still there after reopening:

  ```gherkin
  Scenario: An imported character is still there next time
      Given the character sheet is empty
      When I import a valid character file "test-hero.numenera"
      And I reopen the app
      Then the character "Test Hero" is shown
  ```

- **Vague outcome steps.** "And all character data should be preserved" and
  "And the previous character should be replaced" don't say what is checked.
  Name the observable fact ("the name is Another Hero and none of Test Hero's
  cyphers are listed").
- **Repeated key presses as a proxy for "can't escape".** The focus-trap feature
  uses "I press the Tab key 15 times" and "20 times" in several scenarios. The
  count is an arbitrary number standing in for the real rule (_focus never
  leaves the dialog_). Keep one scenario that tabs a full cycle (the number of
  controls plus one) and let the driver compute that count. Say "I tab through
  every control twice" and drop 10, 15 and 20.
- **Gesture words in non-gesture features.** "I click my Might pool" (11),
  "I click my background" (4), "I click the German flag icon" (5) and
  "I click the Export button" (7) sit in features about editing, language and
  export. Where the scenario is about the result, say "I change…",
  "I switch to German", "I export my character". Keep the click wording in
  `value-editor.feature` and the language-switch feature, where the control is
  the thing under test. _(Reviewer's suggestion: the language and export
  features should probably each keep one gesture-level scenario.)_
- **i18n scenarios repeat one shape.** `i18n.feature` has per-section scenarios
  (stats, cyphers, artifacts, oddities, …) that each assert a few German
  strings. That is lesson 203's mistake #4 (scenario overload) in a mild form.
  One outline, "the sheet is fully translated in German", over a list of
  section/label/value rows, reads better and is cheaper to extend.
  `check:i18n` and the unit tests already guard key coverage.

### 3. Decide which layer proves each UI rule

_Reviewer's suggestion, not from Dave's material, and carried over from the
previous review because it still applies._

With little logic below the UI, it is tempting to prove every rule end to end.
The e2e suite is the only layer that sees real layout, drag, focus and
persistence, and it is the most expensive. There are 114 unit test files, so a
lower layer is available. Candidates to check for duplication between the two
are validation rules (`data-validation.feature`), empty-field visibility, and
the per-section German translations. If a rule needs no real browser, prove it
in Vitest and keep one acceptance scenario for the journey.

## Further improvements

- **`CustomWorld` carried per-feature state** (`draggedCypherName`,
  `heldDropTarget`, `savedTimestamp`, …). Resolved: the world now holds only the
  page, the storage helper, the clock and the DSLs; each DSL keeps its own
  state.
- **Hook wiring was growing.** Resolved: `createDsls(page, device)` in
  `support/dsls.ts` builds every DSL and driver, and is the one place to swap
  drivers (lesson 305: the DSL is the stable interface; drivers are swappable).
- **`@not-phone` (24 scenarios as of 2026-11-18) hides a coverage gap on two device profiles.**
  Each exclusion is visible, which is honest. If any of them are "not yet made
  to work on phone" rather than "not applicable on phone", track those by name
  in `docs/TODO.md` so they don't become permanent.
- **Fixture-checking `Given` steps are gone.** The earlier review flagged
  `Given I have {int} cyphers` asserting `>=` against mock data. A grep of the
  step definitions finds no such comparison now. Keep the discipline: a
  `Given` should create the state, not observe it.
- **Hard-coded English in assertions** is fine while the locale is pinned to
  `en-US` in the hook, as it is. Where a driver can use the app's own
  translation keys (`support/i18nKeys.ts` exists), prefer that, so a copy change
  doesn't ripple through steps.

## Releasability truthfulness

Checked per the category list: no `@skip` / `@wip` / `@deprecated` tags in use,
no `.skip` / `.only` / `xit`, no `--ignore` or test filters in the CI e2e job,
no `continue-on-error`, no empty `catch` blocks in `tests/e2e`. The only
selection filters are the device tags above. This suite is truthful about its
state. Nothing to change.

## Suggested next steps

1. **Finish the migration, largest first**, as each file is next touched:
   `export-enhancement` (with a `FilePickerDriver` replacing the window
   globals), then `layout-edit-mode` and the section-drag step files behind
   `LayoutDsl`, then `character-storage` and `auto-save-indicator`. Done; see
   issue 1. The picker sits behind `FileExportDriver` rather than a separate
   `FilePickerDriver`.
2. **Do the small spec fixes now.** They are cheap and independent: retitle the
   localStorage scenario, replace the vague "preserved/replaced" outcomes, and
   collapse the Tab-count scenarios. Done. The import scenario is now "An
   imported character is still there next time". "All character sections should
   show data" and "all character data should be preserved" are one step, "all
   of the character's entries and notes are shown", which compares every
   section with the character the test supplied (the "preserved" variant only
   looked at three of them). Replacing a character starts from the loaded
   sample character and checks that none of its entries are left. The focus-trap
   scenarios tab "through every control twice", with the driver counting the
   controls and checking focus after every press, as one outline over ability,
   cypher and equipment. Gesture words: "I click my Might pool" turned out to
   live only in `value-editor.feature` and "I click my background" only in the
   inline-field feature, where the click is the thing under test, so both
   stay. Scenarios outside the settings feature say "I switch to German". Export
   scenarios say "I export my character"; only Quick Export and Save As, the
   controls under test, are clicked by name. `export-enhancement` no longer
   repeats the file-content and special-character scenarios of
   `character-file-export`. The i18n per-section scenarios are now one table of
   sheet parts and texts for the filled sheet and one for the empty sheet,
   checked with exact locators instead of "the stats section mentions".
3. **Move the remaining `CustomWorld` state into DSL objects** as part of each
   migration, and delete each field once its last user is gone. Done.
4. **Audit scenarios that a unit test could prove** (issue 3) before adding any
   more per-field e2e scenarios. Open, as is sorting the `@not-phone`
   scenarios into "not applicable" and "not yet working", and listing the second kind in `docs/TODO.md`.

---

Dave Farley's full lessons include worked before-and-after examples and more
detail on each point. They're part of the paid ATDD course:
<https://courses.cd.training/collections>
