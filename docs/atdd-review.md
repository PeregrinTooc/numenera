# ATDD Review: `tests/e2e`

Reviewed 2026-11-13 against Dave Farley's ATDD principles.

> **Source note:** this review used the free-tier summaries of Dave Farley's
> ATDD lessons, not the full lessons. The criteria quoted come from those
> summaries. The rewrites and judgments are the reviewer's own.

## Context: the UI is the domain

This app has almost no business logic below the UI. It is an editor over a
character JSON. What users get from it is the interaction itself: editing values
in place, dragging sections into a layout, moving between versions. That changes
how Dave's "what, not how" principle applies. Where an interaction is the
feature, describing that interaction in a spec is describing behaviour, not
implementation. This review is written with that in mind.

## Overall assessment

The suite has the outer layers of a four-layer suite but not the middle one.
Each scenario gets a fresh browser context, there is a domain DSL for setup
(`SetupDsl.character()`, `replaceCharacter()`), and time in the app is controlled
deterministically. That is more than most suites have.

The main gap is the layering. Step definitions call the browser directly about
640 times (`page.locator`, `data-testid`), so the DSL is used in only some
places. Because the UI is the product, it is also the part that changes most,
and every UI change currently ripples through step files. The specs themselves
are mostly at the right level for a UI-centred app. The problems there are
narrower: implementation details leaking in, and gestures written out in
scenarios that are about something else. None of this needs a rewrite. Grow the
DSL that's already there and move everything onto it.

## Strengths

- **Functional isolation is good.** `support/hooks.ts` creates a new
  `browser.newContext()` for every scenario and clears storage through the app's
  own adapters. Because this is a client-side app with no shared server,
  scenarios can't affect each other, and parallel runs are safe. Dave's "each
  test owns its own data" rule is met.
- **There is already a DSL to build on.** `SetupDsl.character(overrides)`
  merges `FULL_CHARACTER` with only the fields a test cares about. That is
  Dave's point that a DSL should provide defaults so tests specify only what
  matters.
- **Time is controlled.** The injected `TestTimer` and the held-save gate in
  `version-history-squash-race.steps.ts` make a real race reproducible, which is
  the right way to handle concurrency.
- **The suite reports its state honestly.** No feature file carries `@skip`,
  `@wip` or `@deprecated`, CI has no `continue-on-error`, and the device
  exclusions in `cucumber.cjs` are listed openly in one place.
- **It runs on several devices.** One set of specs runs against four device
  profiles. Issue 1 shows how to build on this.

## Priority issues

### 1. Step definitions talk to the browser instead of going through a DSL

_Lesson 308: treat step definitions as thin parsing, with no logic, calling
straight through to a DSL. Lesson 305: protocol drivers are the only layer that
knows how the system actually works. Lesson 303: because a DSL call goes through
a protocol driver, one spec can run through several drivers._

Step definitions use `page.locator` or `data-testid` about 640 times and
`page.evaluate` 67 times. The heaviest files are
`card-creation-modal-fields.steps.ts` (59) and `combat.steps.ts` (37).
`card-deletion.steps.ts` shows two layers mixed together:

```ts
When("I look at an artifact card", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="items-section"]')).toBeVisible();
});
```

`CardsDsl` mixes the DSL and protocol-driver layers too.
`clickDeleteButton(cardType)` builds selectors itself. A split along Dave's
lines:

```ts
// Step definition: thin parsing only
When("I discard {string}", async function (this: CustomWorld, name: string) {
  await this.character.discard(name);
});

// DSL: domain vocabulary, stable as the UI changes
class CharacterDsl {
  constructor(private driver: SheetDriver) {}
  discard(name: string): Promise<void> {
    return this.driver.removeItem(name);
  }
  carries(names: string[]): Promise<void> {
    return this.driver.expectItems(names);
  }
}

// Protocol driver: the only place that knows about test ids and clicks
class PlaywrightSheetDriver implements SheetDriver {
  async removeItem(name: string): Promise<void> {
    const card = this.page.getByTestId(/-card-/).filter({ hasText: name });
    await card.getByRole("button", { name: t("card.delete") }).click();
    await expect(card).toHaveCount(0); // confirms the action completed
  }
}
```

**When the UI is the business logic, this layering matters more, not less.**
UI changes are this app's most common kind of change. With the split, a
redesign of the delete control means one change in `PlaywrightSheetDriver`, not
changes across many step files. One DSL call such as `discard` also serves every
card type, which removes the seven near-identical step registrations. That fixes
lesson 203's mistake #3, no reuse in the DSL.

**Mouse and touch are a direct case for multiple drivers.** Dragging sections
with a mouse and with touch are the same user behaviour, but they're specified in
separate step files (`section-reordering.steps.ts`,
`section-touch-drag.steps.ts`). With one DSL call and two drivers, one spec
covers both:

```ts
// DSL
moveSection(name: string, onto: { target: string; edge: Edge }): Promise<void> {
  return this.input.dragSection(name, onto);
}

// Drivers, chosen by device profile
class MouseInput implements SectionInput { /* page.mouse down/move/up */ }
class TouchInput implements SectionInput { /* long-press, then touch move/end */ }
```

The device profile in `support/device.ts` would choose the driver, so the Pixel 5
and iPhone 12 runs exercise touch and the desktop run exercises the mouse. The
device matrix then becomes part of the test architecture rather than only a tag
filter in `cucumber.cjs`.

### 2. Sleeps used to cover races

_Lesson 306: using sleeps and waits to hide race conditions doesn't fix the race.
It only makes the test slower to fail. The fix is atomic steps that confirm the
action completed, using poll-with-timeout in the protocol driver._

There are 111 `waitForTimeout` calls in step definitions and support code.
Examples:

- `support/cards.ts`: `clickDeleteButton` and `expectVisibleCount` each use
  `waitForTimeout(100)` as a "settle wait".
- `card-creation-verification.steps.ts`: seven separate `waitForTimeout(100)`
  calls.
- `card-modal-focus-trap.steps.ts`: sleeps of 30 to 100 ms around focus
  changes.
- `auto-save-indicator.steps.ts:17`: `waitForTimeout(seconds * 1000)` waits in
  real time. The injected `TestTimer` cannot help here: `AutoSaveService`
  deliberately always uses a `RealTimer`, and `TestTimer` only drives the
  version-history squash. `page.clock`, installed before the app boots, is what
  advances time there now.

Before and after, using `CardsDsl` as the example:

```ts
// Before
await this.page.locator(this.deleteButtonSelector(cardType, index)).click();
await this.page.waitForTimeout(100);

// After: the driver confirms the result, so no sleep is needed
const before = await items.count();
await deleteButton.click();
await expect(items).toHaveCount(before - 1); // Playwright retries until timeout
```

Playwright's web-first `expect` already does poll-with-timeout, so most of these
are mechanical swaps. The current branch, `fix/touch-drag-e2e-flake`, suggests
flakiness is already costing time. These sleeps are the first place to look.

### 3. Specs mix intent, interaction design and implementation detail

_Lesson 103b: specs should use the language of the problem domain, not of the
implementation. Lesson 203, BDD mistake #1: confusing UI interactions with
behaviour. Dave's check: imagine a different system meeting the spec. If it
couldn't, the spec is tied to the implementation._

In this app the problem domain includes the interaction design. So a better
test than "does the step mention the UI?" is to sort each step into one of three
levels:

| Level                                                                              | Example from the suite                                                           | Belongs in a spec?               |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------- |
| **Intent**: what the user is trying to do                                          | "I save the card", "I change my Might pool to 12"                                | Yes                              |
| **Interaction design**: how the product lets them do it, where that is the feature | "I drag Cyphers onto the middle right of Items", "focus stays inside the dialog" | Yes, in the feature it describes |
| **Mechanism**: how it's built                                                      | "removed from the DOM", "persists in localStorage", `data-testid`                | Never                            |

**Rule of thumb:** a scenario uses gesture-level language only for the feature
it is about, and intent-level language for everything else.

By that measure, `section-rearrangement.feature` is mostly fine as it stands.
Dragging a section onto another's edge is the feature. Three kinds of problem
remain.

**Mechanism leaking into specs.** `card-deletion.feature`:

```gherkin
Scenario: Delete a cypher card
    Given I have 2 cyphers
    When I click the delete button on the first cypher
    Then the cypher should be removed from the DOM
    And I should have 1 cypher remaining
    When I reload the page
    Then I should have 1 cypher remaining
```

"Removed from the DOM" and "Deletion persists in localStorage" (the scenario
title) are implementation, and IndexedDB is the primary store anyway. Deleting
cards is not the interaction under scrutiny here either, so intent is the right
level:

```gherkin
Scenario Outline: A discarded item is gone for good
    Given my character has the <kind> "<first>" and "<second>"
    When I discard "<first>"
    Then my character's <kind> are only "<second>"
    And "<first>" is still gone the next time I open my character

    Examples:
      | kind      | first      | second      |
      | cyphers   | Detonation | Rejuvenator |
      | abilities | Ward       | Onslaught   |
      | attacks   | Broadsword | Crossbow    |
```

The seven "delete button is visible" scenarios add nothing to this, because an
item can't be discarded without some way to do it (lesson 203's mistake #4,
scenario overload). "Delete button in the top-left corner" and "no confirmation
dialog" may be genuine requirements in a UI-centred app. If so, keep them, but
consider whether a visual check is a cheaper way to test placement.

**Gestures written out in scenarios about something else.**
"And I confirm the card edit modal" appears 52 times and "And I click the
'Confirm' button" 27 times, mostly as setup or plumbing in scenarios about card
content or version history. Those scenarios should say "I save the card". The
card-modal feature itself can keep the gesture language.

**Interaction design that is likely to change, repeated everywhere.**
`stat-pool-editing.feature`:

```gherkin
When I click on the "Might Pool" value
Then an edit modal should appear
And the input field should be focused
```

This ties every stat-edit scenario to the modal pattern. If editing moved
inline, all of them would break although the requirement ("I can change my
Might pool") hasn't changed. Give the modal and focus behaviour one spec of
their own, and write the other stat-edit scenarios at the intent level.

## Further improvements

- **`Given` steps that check fixtures instead of creating them.**
  `Given I have {int} cyphers` only asserts `actualCount >= count` against the
  default character that the "Load" button loads. The scenario depends on
  whatever the mock data happens to contain ("7 abilities" appears because the
  mock has 7). Use the existing `cards.setupWithCount()` so each scenario states
  and creates its own data.
- **`CustomWorld` holds state for each feature** (`draggedCypherName`,
  `heldDropTarget`, `savedTimestamp`, …). That is a sign that state belonging in
  DSL objects has leaked into the world. Each DSL class can hold its own state.
- **`Given the character data is loaded`** only calls
  `waitForLoadState("domcontentloaded")`. It doesn't confirm what its name
  claims. Use `waitForCharacterSheetReady`, or remove the step.
- **About 43 steps set the viewport to an exact pixel width** (1280, 768 or
  375). Where a scenario tests behaviour at a breakpoint boundary, the exact
  width is the point and should stay. Elsewhere, "on a wide screen" or "on a
  phone" says what matters and leaves the pixels to the driver.
- **Decide which layer each UI rule is tested at.** _(Reviewer's suggestion, not
  from Dave's material.)_ With little logic below the UI, it's tempting to test
  every UI rule end to end. The E2E suite is the only layer that sees real
  layout, real drag and real focus, and it's the most expensive one. Rules that
  don't need a real browser could move down to Vitest/jsdom, for example a stat
  field rejecting a negative value or which fields an empty card shows. The
  acceptance suite then covers user journeys and the interactions only a browser
  can prove.

## Suggested next steps

1. **Remove the sleeps first.** Done. It's mechanical, low risk, and pays off directly
   on the flakiness being fixed now. Every `waitForTimeout` is gone except the
   long-press hold, which is the gesture itself. Flush-based save waits,
   bootstrap and initial-version readiness helpers, a navigation helper on the
   version counter, outcome assertions and `page.clock` replaced them, and a
   lint rule now forbids new ones. Removing them surfaced and fixed real races
   (the layout-choice Escape pressed before focus arrived, an auto-save reload
   racing a squash).
2. **Use `card-deletion.feature` as a pilot.** Done. The feature is now one
   intent-level outline ("a discarded entry is gone for good") per card kind,
   plus the two genuine requirements (no confirmation, control in the top-left
   corner, checked by geometry rather than CSS classes). Its steps call
   `CharacterDsl` (`support/character.ts`), which talks to a `SheetDriver`
   interface whose only implementation, `PlaywrightSheetDriver`, is the one
   place that knows selectors. Follow this template.
3. **Merge mouse and touch section dragging** behind one DSL call with two
   drivers. Done. `LayoutDsl.moveSection(name, { target, edge })` drives a
   `SectionInput` (`MouseInput` or `TouchInput`, `support/sectionInput.ts`)
   picked by `DeviceProfile.sectionInput`: only Pixel 5 uses touch, because
   Playwright offers real touch input only through Chromium's CDP. The
   duplicated touch scenarios are gone, and the touch-only ones are tagged
   `@touch`.
4. **Move the rest over one feature file at a time,** whenever a file is already
   being touched for other work. Don't do it as one big rewrite.
   `card-creation-*` and `combat` have the most direct browser calls and gain
   the most.

---

Dave Farley's full lessons include worked before-and-after examples and more
detail on each point. They're part of the paid ATDD course:
<https://courses.cd.training/collections>
