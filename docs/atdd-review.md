# ATDD Review: `tests/e2e`

Reviewed 2026-11-16 against Dave Farley's ATDD principles. This replaces the
2026-11-13 review, whose first four recommendations have since been carried out.

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
in good shape. What remains is an unfinished migration: about 25 of 42 step
files still call the page directly, so the suite has two architectures side by
side, and a handful of scenarios still describe mechanism rather than behaviour.
None of this needs a redesign. Finish moving files onto the pattern you already
have.

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
  The one remaining `setTimeout` (`section-slide.steps.ts:99`) is in a
  failure-diagnostics path, not a synchronisation point.
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

### 1. Half the step files still bypass the DSL

_Lesson 308: step definitions are thin parsing, no logic, calling straight
through to a DSL. Lesson 305: the driver layer is the only one that knows how the
system works._

The migrated and unmigrated styles now coexist. Step files that still reach into
the page, by number of direct page calls:

| File                                                            | Direct page calls |
| --------------------------------------------------------------- | ----------------- |
| `export-enhancement.steps.ts`                                   | 37                |
| `layout-edit-mode.steps.ts`                                     | 27                |
| `character-storage.steps.ts`                                    | 25                |
| `i18n.steps.ts`                                                 | 21                |
| `auto-save-indicator.steps.ts`                                  | 18                |
| `section-drop-preview.steps.ts`                                 | 17                |
| `recovery-damage-track.steps.ts`, `section-reordering.steps.ts` | 16 each           |
| `section-slide`, `layout-import-export`, `section-columns`      | 11 to 12 each     |

In total there are about 240 `page.locator` / `getByTestId` references and 41
`page.evaluate` calls left in step definitions. `character-storage.steps.ts` is
representative:

```ts
Then("all character sections should show data", async function () {
  await expect(this.page.locator('[data-testid^="cypher-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="artifact-item"]').first()).toBeVisible();
  const background = this.page.locator('[data-testid="character-background"]');
  const backgroundValue = await background.inputValue();
  expect(backgroundValue.length).toBeGreaterThan(0);
  // ...
});
```

This is the old shape: test ids, `inputValue`, and a vague "has some data"
assertion in the step. The migrated version already exists in spirit. Ask the
DSL for the fact and let the driver find it:

```ts
// Step definition: thin parsing only
Then("my whole character is shown", async function (this: CustomWorld) {
  await this.character.showsCharacter(this.setup.fullCharacter());
});

// Driver: the only place that knows ids and inputs
async showsCharacter(expected: Character): Promise<void> {
  await expect(this.page.getByTestId("character-name")).toHaveText(expected.name);
  await expect(this.page.getByTestId("character-background")).toHaveValue(expected.background);
  // one assertion per section, comparing against the data the test supplied
}
```

Asserting against the data the test supplied, rather than `length > 0`, also
fixes a weak oracle: today "all sections should show data" would pass for the
wrong data.

Two areas deserve more than a mechanical move:

- **Window globals as a test API.** `export-enhancement.steps.ts` installs a
  `showSaveFilePicker` mock that writes to `window._lastWrittenData`,
  `_exportedData`, `_writeCount`, `_saveDialogShown` and others (33 `window._…`
  references in step files). That is a stub, which is fine, but lesson 303 says
  stubs are _translators, not simulations_: a simple programmable response
  holder. Move it into a `FilePickerDriver` (`exportCapture.ts` is the natural
  home) exposing `lastSavedFile()`, `cancelNextSave()` and `saveDialogCount()`,
  so steps never name a window global.
- **Layout and section-drag steps.** These are the largest block of direct page
  work and the area where mouse/touch driver reuse already paid off. Moving
  `layout-edit-mode`, `section-drop-preview`, `section-reordering` and
  `section-slide` behind `LayoutDsl` would finish what the pilot started.

Migrate one feature file at a time whenever it is touched for other work, as
planned; don't do it as one rewrite.

### 2. A few specs still describe mechanism, not behaviour

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

- **`CustomWorld` still carries per-feature state**: `draggedCypherName`,
  `heldDropTarget`, `savedTimestamp`, `saveCount`, `exportedFileData`,
  `exportedFilename`, `importedFile`, `importNote`, `requestedUrls`. These are
  state that belongs inside the DSL or driver for that area (each DSL object can
  hold its own). It also marks which features are still unmigrated.
- **Hook wiring is growing.** `hooks.ts` constructs about fifteen DSL/driver
  objects by hand in `Before`. A small `createDsls(page, device)` factory in
  `support/` would keep the hook readable and give a single place to swap
  drivers (lesson 305: the DSL is the stable interface; drivers are swappable).
- **`@not-phone` (23 scenarios) hides a coverage gap on two device profiles.**
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
   `LayoutDsl`, then `character-storage` and `auto-save-indicator`.
2. **Do the small spec fixes now.** They are cheap and independent: retitle the
   localStorage scenario, replace the vague "preserved/replaced" outcomes, and
   collapse the Tab-count scenarios.
3. **Move the remaining `CustomWorld` state into DSL objects** as part of each
   migration, and delete each field once its last user is gone.
4. **Audit scenarios that a unit test could prove** (issue 3) before adding any
   more per-field e2e scenarios.

---

Dave Farley's full lessons include worked before-and-after examples and more
detail on each point. They're part of the paid ATDD course:
<https://courses.cd.training/collections>
