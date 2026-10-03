# Step Catalog

<!-- GENERATED FILE — do not edit by hand. Regenerate with: npm run docs:steps -->

Every Cucumber step phrase the E2E suite understands, with how many feature
lines use it and where it is implemented. **Search here before writing a new
step in a `.feature` file** — if a phrase already exists, reuse it exactly.

## How to use this catalog

- `Ctrl+F` for the thing you want to do (`badge`, `modal`, `cypher card`, …).
- `{string}` takes a quoted value: `I click on the "Shins" value`.
- `{int}` takes a number: `the character has 47 shins`.
- `(s)` is optional text; `a/b` means either word.
- **Uses** is how many feature lines already use the phrase — prefer the
  higher-count phrasing when two look alike. `0` means nothing uses it yet;
  such steps are scheduled for deletion (see `tests/implementation-plan.md`
  Phase 1), so do not build on them.
- `Given`/`When`/`Then` in the table is where the step was registered;
  Cucumber matches `And`/`But` and any keyword interchangeably.
- Generic steps (modal buttons, typing, badges, page reload) live in
  `common-steps.ts`. Feature-specific steps live in the file named after
  the feature.
- If no phrase fits, add the step definition to the matching file and run
  `npm run docs:steps` so this catalog stays current.

## Summary

- Step definitions: **665** in 26 files
- Feature step lines: **2033**
- Definitions with no feature usage: **0**
- Feature lines matching no definition: **0**

| Step file | Definitions | Unused |
| --- | ---: | ---: |
| [ability-enhancements.steps.ts](#abilityenhancementsstepsts) | 13 | 0 |
| [additional-fields-editing.steps.ts](#additionalfieldseditingstepsts) | 36 | 0 |
| [auto-save-indicator.steps.ts](#autosaveindicatorstepsts) | 13 | 0 |
| [basic-info-editing.steps.ts](#basicinfoeditingstepsts) | 34 | 0 |
| [card-creation.steps.ts](#cardcreationstepsts) | 89 | 0 |
| [card-deletion.steps.ts](#carddeletionstepsts) | 40 | 0 |
| [card-modal-focus-trap.steps.ts](#cardmodalfocustrapstepsts) | 16 | 0 |
| [card-reordering.steps.ts](#cardreorderingstepsts) | 12 | 0 |
| [character-display.steps.ts](#characterdisplaystepsts) | 32 | 0 |
| [character-file-export.steps.ts](#characterfileexportstepsts) | 8 | 0 |
| [character-file-import.steps.ts](#characterfileimportstepsts) | 3 | 0 |
| [character-storage.steps.ts](#characterstoragestepsts) | 10 | 0 |
| [combat.steps.ts](#combatstepsts) | 24 | 0 |
| [common-steps.ts](#commonstepsts) | 34 | 0 |
| [data-validation.steps.ts](#datavalidationstepsts) | 5 | 0 |
| [empty-fields-visibility.steps.ts](#emptyfieldsvisibilitystepsts) | 12 | 0 |
| [export-enhancement.steps.ts](#exportenhancementstepsts) | 21 | 0 |
| [i18n.steps.ts](#i18nstepsts) | 29 | 0 |
| [recovery-damage-track.steps.ts](#recoverydamagetrackstepsts) | 25 | 0 |
| [resource-tracker-editing.steps.ts](#resourcetrackereditingstepsts) | 18 | 0 |
| [section-rearrangement.steps.ts](#sectionrearrangementstepsts) | 49 | 0 |
| [settings-gear.steps.ts](#settingsgearstepsts) | 17 | 0 |
| [stat-pool-editing.steps.ts](#statpooleditingstepsts) | 1 | 0 |
| [version-comparison.steps.ts](#versioncomparisonstepsts) | 41 | 0 |
| [version-history.steps.ts](#versionhistorystepsts) | 82 | 0 |
| [viewport.steps.ts](#viewportstepsts) | 1 | 0 |

## ability-enhancements.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see the ability {string}` | 4 | 33 |
| Then | `the ability {string} should have intellect pool styling` | 1 | 102 |
| Then | `the ability {string} should have might pool styling` | 1 | 86 |
| Then | `the ability {string} should have speed pool styling` | 1 | 94 |
| Then | `the ability {string} should not show action indicator` | 1 | 80 |
| Then | `the ability {string} should not show cost badge` | 1 | 68 |
| Then | `the ability {string} should not show pool indicator` | 1 | 74 |
| Then | `the ability {string} should show action {string}` | 2 | 58 |
| Then | `the ability {string} should show cost {string}` | 2 | 38 |
| Then | `the ability {string} should show pool {string}` | 2 | 48 |
| Given | `the character has abilities with different pools:` | 1 | 24 |
| Given | `the character has an ability {string} with:` | 4 | 8 |
| Then | `the empty state should use translation keys` | 1 | 113 |

## additional-fields-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I clear the {textarea} textarea` | 4 | 150 |
| When | `I click outside the {textarea} textarea` | 11 | 161 |
| When | `I click the {textarea} textarea` | 20 | 146 |
| When | `I select {string} from the mobile picker` | 1 | 315 |
| When | `I select {string} from the type dropdown` | 4 | 38 |
| When | `I tap outside the {textarea} textarea` | 2 | 342 |
| When | `I tap the {textarea} textarea` | 2 | 320 |
| When | `I tap the type dropdown` | 1 | 303 |
| When | `I type {string} in the {textarea} textarea` | 12 | 154 |
| When | `I type a {int} character string in the background textarea` | 1 | 239 |
| When | `I type a {int} character string in the notes textarea` | 1 | 248 |
| Then | `the {textarea} placeholder should be {string}` | 2 | 213 |
| When | `the {textarea} textarea is empty` | 2 | 209 |
| Then | `the {textarea} textarea should be empty` | 2 | 199 |
| Then | `the {textarea} textarea should be focused` | 4 | 181 |
| Then | `the {textarea} textarea should be readonly` | 8 | 119 |
| Then | `the {textarea} textarea should become editable` | 2 | 324 |
| Then | `the {textarea} textarea should have a pointer cursor` | 2 | 136 |
| Then | `the {textarea} textarea should have an edit state visual indicator` | 2 | 188 |
| Then | `the {textarea} textarea should not be readonly` | 4 | 171 |
| Then | `the {textarea} textarea should show {string}` | 14 | 126 |
| Then | `the background textarea should contain the full {int} character text` | 1 | 257 |
| Then | `the background textarea should still be editable` | 1 | 203 |
| Then | `the character data should have {textarea} {string}` | 5 | 221 |
| Then | `the character data should have the full background text` | 1 | 277 |
| Then | `the character data should have the full notes text` | 1 | 290 |
| Then | `the character data should have type {string}` | 1 | 72 |
| Given | `the character has the following data:` | 1 | 9 |
| Then | `the mobile OS picker should open` | 1 | 308 |
| Then | `the notes textarea should contain the full {int} character text` | 1 | 267 |
| Then | `the type dropdown label should be {string}` | 1 | 86 |
| Then | `the type dropdown option for {string} should display as {string}` | 3 | 95 |
| Then | `the type dropdown options should be {string}, {string}, {string}` | 1 | 60 |
| Then | `the type dropdown should have {int} options` | 1 | 51 |
| Then | `the type dropdown should show {string} as selected` | 6 | 43 |
| Then | `the virtual keyboard should appear` | 2 | 333 |

## auto-save-indicator.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I note the current save timestamp` | 1 | 13 |
| When | `I rapidly edit the character name multiple times` | 1 | 26 |
| When | `I wait for {int} second(s)` | 1 | 19 |
| Given | `the character sheet is displayed` | 5 | 4 |
| Then | `the character should be saved only once after changes stop` | 1 | 119 |
| Then | `the save indicator should be in the lower-right corner` | 1 | 146 |
| Then | `the save indicator should be visible` | 2 | 88 |
| Then | `the save indicator should contain {string}` | 1 | 102 |
| Then | `the save indicator should have subtle styling` | 1 | 167 |
| Then | `the save indicator should show a single timestamp` | 1 | 132 |
| Then | `the save indicator should show a timestamp` | 1 | 93 |
| Then | `the save indicator should still be visible` | 1 | 141 |
| Then | `the save timestamp should be updated` | 2 | 110 |

## basic-info-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `focus should cycle between input field, confirm button, and cancel button` | 1 | 195 |
| Then | `focus should not leave the modal` | 1 | 229 |
| Then | `I can cancel with Escape key` | 1 | 254 |
| Then | `I can confirm with Enter key` | 1 | 247 |
| Then | `I can navigate with Tab key` | 1 | 239 |
| When | `I press Tab repeatedly` | 1 | 30 |
| Then | `the backdrop should have aria-hidden={string}` | 1 | 271 |
| Then | `the buttons should be touch-friendly size \(min 44x44px)` | 1 | 328 |
| Then | `the cancel button should have an X icon` | 1 | 145 |
| Then | `the character name should be large enough for touch \(min 44x44px)` | 1 | 356 |
| Then | `the character name should display {string}` | 6 | 82 |
| Then | `the character name should still display {string}` | 6 | 90 |
| Then | `the confirm button should have a checkmark icon` | 1 | 139 |
| Then | `the descriptor should be large enough for touch \(min 44x44px)` | 1 | 376 |
| Then | `the descriptor should display {string}` | 4 | 104 |
| Then | `the focus should be large enough for touch \(min 44x44px)` | 1 | 386 |
| Then | `the focus should display {string}` | 4 | 112 |
| Then | `the input field should be large enough for touch input` | 1 | 348 |
| Then | `the input field should be of type {string}` | 1 | 69 |
| Then | `the input field should have inputmode={string} for mobile` | 1 | 299 |
| Then | `the mobile keyboard should appear` | 1 | 293 |
| Then | `the modal backdrop should be semi-transparent` | 1 | 151 |
| Then | `the modal should be sized appropriately for mobile` | 1 | 284 |
| Then | `the modal should fill most of the screen width` | 1 | 308 |
| Then | `the modal should have a cancel button with icon` | 1 | 62 |
| Then | `the modal should have a confirm button with icon` | 1 | 55 |
| Then | `the modal should have Numenera-themed styling` | 1 | 130 |
| Then | `the modal should have role={string}` | 1 | 265 |
| Then | `the modal should not close` | 1 | 121 |
| Then | `the modal should not overflow the viewport` | 1 | 318 |
| Then | `the name should show a hover state indicating it's editable` | 1 | 169 |
| Then | `the tier should be large enough for touch \(min 44x44px)` | 1 | 366 |
| Then | `the tier should display {string}` | 6 | 98 |
| Then | `the tier should show a hover state indicating it's editable` | 1 | 180 |

## card-creation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all ability fields should be empty` | 1 | 216 |
| Then | `all artifact fields should be empty` | 1 | 175 |
| Then | `all attack fields should be empty` | 1 | 200 |
| Then | `all cypher fields should be empty` | 1 | 149 |
| Then | `all equipment fields should be empty` | 1 | 162 |
| Then | `all oddity fields should be empty` | 1 | 187 |
| Then | `all special ability fields should be empty` | 1 | 231 |
| When | `I cancel the card edit modal` | 7 | 566 |
| When | `I click the add ability button` | 15 | 130 |
| When | `I click the add artifact button` | 7 | 118 |
| When | `I click the add attack button` | 7 | 126 |
| When | `I click the add cypher button` | 12 | 110 |
| When | `I click the add equipment button` | 9 | 114 |
| When | `I click the add oddity button` | 7 | 122 |
| When | `I click the add special ability button` | 7 | 134 |
| When | `I click the edit button on ability {string}` | 1 | 632 |
| When | `I click the edit button on artifact {string}` | 1 | 611 |
| When | `I click the edit button on attack {string}` | 1 | 625 |
| When | `I click the edit button on cypher {string}` | 2 | 597 |
| When | `I click the edit button on equipment {string}` | 1 | 604 |
| When | `I click the edit button on oddity {string}` | 1 | 618 |
| When | `I click the edit button on special ability {string}` | 1 | 639 |
| When | `I confirm the card edit modal` | 50 | 555 |
| When | `I fill in the ability cost with {string}` | 6 | 324 |
| When | `I fill in the ability description with {string}` | 9 | 332 |
| When | `I fill in the ability name with {string}` | 9 | 321 |
| When | `I fill in the ability pool with {string}` | 6 | 328 |
| When | `I fill in the artifact effect with {string}` | 7 | 288 |
| When | `I fill in the artifact level with {string}` | 7 | 281 |
| When | `I fill in the artifact name with {string}` | 7 | 275 |
| When | `I fill in the attack damage with {string}` | 7 | 305 |
| When | `I fill in the attack modifier with {string}` | 7 | 312 |
| When | `I fill in the attack name with {string}` | 7 | 302 |
| When | `I fill in the cypher effect with {string}` | 11 | 251 |
| When | `I fill in the cypher level with {string}` | 11 | 247 |
| When | `I fill in the cypher name with {string}` | 11 | 244 |
| When | `I fill in the equipment description with {string}` | 7 | 266 |
| When | `I fill in the equipment name with {string}` | 8 | 260 |
| When | `I fill in the oddity text with {string}` | 7 | 297 |
| When | `I fill in the special ability description with {string}` | 7 | 354 |
| When | `I fill in the special ability name with {string}` | 7 | 341 |
| When | `I fill in the special ability source with {string}` | 7 | 347 |
| Then | `I should see {int} ability cards` | 14 | 392 |
| Then | `I should see {int} artifact cards` | 8 | 377 |
| Then | `I should see {int} attack cards` | 8 | 387 |
| Then | `I should see {int} cypher card(s)` | 15 | 367 |
| Then | `I should see {int} equipment cards` | 8 | 372 |
| Then | `I should see {int} oddity cards` | 8 | 382 |
| Then | `I should see {int} special ability cards` | 8 | 397 |
| Then | `I should see a cypher card with name {string}` | 5 | 404 |
| Then | `I should see a special ability card with name {string}` | 5 | 530 |
| Then | `I should see an ability card with name {string}` | 7 | 505 |
| Then | `I should see an add ability button` | 1 | 98 |
| Then | `I should see an add artifact button` | 1 | 69 |
| Then | `I should see an add attack button` | 1 | 77 |
| Then | `I should see an add cypher button` | 1 | 61 |
| Then | `I should see an add equipment button` | 1 | 65 |
| Then | `I should see an add oddity button` | 1 | 73 |
| Then | `I should see an add special ability button` | 1 | 102 |
| Then | `I should see an artifact card with name {string}` | 5 | 446 |
| Then | `I should see an attack card with name {string}` | 5 | 480 |
| Then | `I should see an equipment card with name {string}` | 5 | 429 |
| Then | `I should see an oddity card with text {string}` | 5 | 471 |
| Then | `the ability {string} should have cost {string}` | 1 | 514 |
| Then | `the ability {string} should have pool {string}` | 1 | 522 |
| Then | `the add attack button should have a non-transparent background` | 1 | 81 |
| Then | `the artifact {string} should have effect {string}` | 1 | 463 |
| Then | `the artifact {string} should have level {string}` | 1 | 455 |
| Then | `the attack {string} should have damage {string}` | 1 | 497 |
| Then | `the attack {string} should have modifier {string}` | 1 | 489 |
| Then | `the card edit modal should be open` | 15 | 576 |
| Given | `the character has {int} ability cards` | 5 | 46 |
| Given | `the character has {int} artifact cards` | 5 | 31 |
| Given | `the character has {int} attack cards` | 5 | 41 |
| Given | `the character has {int} cypher cards` | 5 | 21 |
| Given | `the character has {int} equipment cards` | 5 | 26 |
| Given | `the character has {int} oddity cards` | 5 | 36 |
| Given | `the character has {int} special ability cards` | 5 | 51 |
| Then | `the cypher {string} should have effect {string}` | 1 | 421 |
| Then | `the cypher {string} should have level {string}` | 1 | 413 |
| Then | `the equipment {string} should have description {string}` | 1 | 438 |
| Then | `the modal should show ability fields` | 1 | 208 |
| Then | `the modal should show artifact fields` | 1 | 168 |
| Then | `the modal should show attack fields` | 1 | 192 |
| Then | `the modal should show cypher fields` | 1 | 142 |
| Then | `the modal should show equipment fields` | 1 | 156 |
| Then | `the modal should show oddity fields` | 1 | 182 |
| Then | `the modal should show special ability fields` | 1 | 224 |
| Then | `the special ability {string} should have source {string}` | 1 | 541 |

## card-deletion.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the delete button on the first ability` | 1 | 123 |
| When | `I click the delete button on the first artifact` | 1 | 111 |
| When | `I click the delete button on the first attack` | 1 | 119 |
| When | `I click the delete button on the first cypher` | 6 | 105 |
| When | `I click the delete button on the first cypher again` | 1 | 106 |
| When | `I click the delete button on the first equipment item` | 1 | 107 |
| When | `I click the delete button on the first oddity` | 1 | 115 |
| When | `I click the delete button on the first special ability` | 1 | 127 |
| Given | `I have {int} abilities` | 1 | 86 |
| Given | `I have {int} artifact` | 1 | 65 |
| Given | `I have {int} attacks` | 1 | 79 |
| Given | `I have {int} cyphers` | 4 | 50 |
| Given | `I have {int} equipment items` | 1 | 58 |
| Given | `I have {int} oddities` | 1 | 72 |
| Given | `I have {int} special abilities` | 1 | 93 |
| When | `I look at a cypher card` | 2 | 7 |
| When | `I look at a special ability card` | 1 | 31 |
| When | `I look at an ability card` | 1 | 27 |
| When | `I look at an artifact card` | 1 | 15 |
| When | `I look at an attack card` | 1 | 23 |
| When | `I look at an equipment card` | 1 | 11 |
| When | `I look at an oddity card` | 1 | 19 |
| Then | `I should have {int} abilities remaining` | 2 | 203 |
| Then | `I should have {int} artifacts remaining` | 2 | 198 |
| Then | `I should have {int} attack remaining` | 2 | 176 |
| Then | `I should have {int} cypher(s) remaining` | 4 | 167 |
| Then | `I should have {int} equipment items remaining` | 2 | 191 |
| Then | `I should have {int} oddity remaining` | 2 | 171 |
| Then | `I should have {int} special ability remaining` | 2 | 181 |
| Then | `I should not see a confirmation dialog` | 1 | 229 |
| Then | `I should see a delete button on the {cardType} card` | 7 | 39 |
| Then | `the ability should be removed from the DOM` | 1 | 154 |
| Then | `the artifact should be removed from the DOM` | 1 | 142 |
| Then | `the attack should be removed from the DOM` | 1 | 150 |
| Then | `the cypher should be removed from the DOM` | 1 | 135 |
| Then | `the cypher should be removed immediately` | 1 | 225 |
| Then | `the delete button should be in the top-left corner of the card` | 1 | 210 |
| Then | `the equipment item should be removed from the DOM` | 1 | 138 |
| Then | `the oddity should be removed from the DOM` | 1 | 146 |
| Then | `the special ability should be removed from the DOM` | 1 | 158 |

## card-modal-focus-trap.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `focus should be on the description textarea` | 1 | 147 |
| Then | `focus should eventually wrap back to the first input field` | 1 | 83 |
| Then | `focus should eventually wrap back to the last focusable element` | 1 | 101 |
| Then | `focus should move to the last focusable element in the modal` | 1 | 74 |
| Then | `focus should move to the next focusable element in the modal` | 1 | 66 |
| Then | `focus should never escape to the page body or address bar` | 4 | 112 |
| Then | `focus should still be within the card modal` | 3 | 131 |
| When | `I press Shift+Tab` | 1 | 16 |
| When | `I press Shift+Tab repeatedly` | 1 | 49 |
| When | `I press the Tab key` | 1 | 12 |
| When | `I press the Tab key {int} times` | 4 | 57 |
| When | `I press the Tab key repeatedly` | 1 | 42 |
| Then | `the active element should not be the browser chrome` | 1 | 162 |
| Then | `the active element should not be the document body` | 1 | 140 |
| Then | `the card edit modal should be closed` | 1 | 5 |
| Then | `the first input field in the modal should be automatically focused` | 1 | 23 |

## card-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag ability {string} before ability {string}` | 2 | 251 |
| When | `I drag cypher {string} after cypher {string}` | 1 | 52 |
| When | `I drag cypher {string} before cypher {string}` | 3 | 29 |
| When | `I drag cypher {string} into the abilities section` | 1 | 297 |
| When | `I hover over cypher {string}` | 1 | 110 |
| When | `I start dragging cypher {string}` | 2 | 81 |
| Then | `the abilities should be in order {string}` | 4 | 272 |
| Given | `the character has {int} abilities named {string}` | 4 | 228 |
| Given | `the character has {int} cyphers named {string}` | 8 | 9 |
| Then | `the cypher {string} should have a dragging visual state` | 1 | 164 |
| Then | `the cyphers should be in order {string}` | 6 | 137 |
| Then | `the cyphers should be visually in order {string}, {string}, {string}` | 1 | 184 |

## character-display.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character exists with the following data:` | 2 | 9 |
| Given | `I am on the character sheet page` | 47 | 27 |
| Then | `I should see {int} artifact displayed` | 1 | 142 |
| Then | `I should see {int} cyphers displayed` | 1 | 104 |
| Then | `I should see {int} oddities displayed` | 1 | 155 |
| Then | `I should see an empty {cardTypes} section` | 6 | 168 |
| Then | `I should see artifact {string} with level {string}` | 1 | 147 |
| Then | `I should see cypher {string} with level {string}` | 2 | 109 |
| Then | `I should see descriptor {string} displayed` | 1 | 46 |
| Then | `I should see empty state for abilities` | 1 | 201 |
| Then | `I should see empty state for background` | 1 | 181 |
| Then | `I should see empty state for equipment` | 1 | 197 |
| Then | `I should see empty state for notes` | 1 | 189 |
| Then | `I should see focus {string} displayed` | 1 | 50 |
| Then | `I should see oddity {string}` | 2 | 160 |
| Then | `I should see sections in this order:` | 1 | 277 |
| Then | `I should see the {string} stat with pool {string}, edge {string}, and current {string}` | 3 | 78 |
| Then | `I should see the character name {string}` | 1 | 32 |
| Then | `I should see tier {string} displayed` | 1 | 36 |
| Then | `I should see type {string} displayed` | 1 | 40 |
| Then | `no markup from the text should be rendered as HTML` | 1 | 252 |
| Then | `no untranslated text keys should be visible` | 6 | 54 |
| Given | `the character has a {int}-character name without spaces` | 1 | 259 |
| Given | `the character has empty text fields` | 1 | 177 |
| Given | `the character has no {cardTypes}` | 6 | 164 |
| Given | `the character has the following artifacts:` | 1 | 119 |
| Given | `the character has the following cyphers:` | 1 | 91 |
| Given | `the character has the following oddities:` | 1 | 132 |
| Given | `the character has the following stats:` | 1 | 61 |
| Given | `the character has the following text:` | 2 | 220 |
| Then | `the character text should read exactly:` | 2 | 234 |
| Then | `the page should not scroll horizontally` | 2 | 267 |

## character-file-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file export should be triggered` | 1 | 43 |
| When | `I export the character` | 6 | 35 |
| Given | `the character has name {string}` | 3 | 7 |
| Then | `the exported file should contain all character properties` | 2 | 57 |
| Then | `the exported file should have an exportDate` | 2 | 106 |
| Then | `the exported file should have schemaVersion {string}` | 2 | 98 |
| Then | `the exported file should have version {string}` | 2 | 90 |
| Then | `the exported filename should be {string}` | 2 | 48 |

## character-file-import.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I import a valid character file {string}` | 4 | 86 |
| Then | `the character {string} should still be displayed` | 1 | 124 |
| Then | `the previous character should be replaced` | 1 | 131 |

## character-storage.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character is currently displayed` | 2 | 6 |
| Then | `all character data should be preserved` | 2 | 82 |
| Then | `all character sections should show data` | 2 | 46 |
| Then | `all sections should display empty state messages` | 2 | 18 |
| When | `I click the "Load" button` | 3 | 36 |
| Then | `the character {string} should be displayed` | 3 | 41 |
| Given | `the character sheet is empty` | 3 | 32 |
| Then | `the character sheet should show empty states` | 2 | 11 |
| Then | `the character should be displayed` | 1 | 70 |
| Then | `the same character should still be displayed` | 1 | 76 |

## combat.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see the armor badge in the attacks section` | 1 | 211 |
| Then | `I should see the attack {string}` | 2 | 34 |
| Then | `I should see the special ability {string}` | 1 | 154 |
| Then | `the attack {string} should have red combat theme styling` | 1 | 109 |
| Then | `the attack {string} should not show notes` | 1 | 99 |
| Then | `the attack {string} should show damage {string}` | 2 | 43 |
| Then | `the attack {string} should show modifier {string}` | 2 | 57 |
| Then | `the attack {string} should show notes {string}` | 1 | 85 |
| Then | `the attack {string} should show range {string}` | 2 | 71 |
| Then | `the attack badges should sit at the right edge of their card` | 1 | 251 |
| Then | `the attacks section should be in the right column` | 1 | 229 |
| Given | `the character has a special ability {string}` | 1 | 143 |
| Given | `the character has a special ability {string} with:` | 1 | 129 |
| Given | `the character has an attack {string}` | 1 | 26 |
| Given | `the character has an attack {string} with:` | 1 | 9 |
| Given | `the character has an attack with a {int}-character name without spaces` | 1 | 242 |
| Given | `the character has special abilities and attacks` | 1 | 217 |
| Then | `the empty attacks state should use translation keys` | 1 | 122 |
| Then | `the empty special abilities state should use translation keys` | 1 | 204 |
| Then | `the sections should stack vertically on mobile` | 1 | 234 |
| Then | `the special abilities section should be in the left column` | 1 | 224 |
| Then | `the special ability {string} should have teal theme styling` | 1 | 191 |
| Then | `the special ability {string} should show description {string}` | 1 | 163 |
| Then | `the special ability {string} should show source {string}` | 1 | 177 |

## common-steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear` | 10 | 240 |
| When | `I clear the input field` | 18 | 114 |
| When | `I click on the {string} value` | 9 | 26 |
| When | `I click on the character name {string}` | 12 | 73 |
| When | `I click on the descriptor {string}` | 2 | 82 |
| When | `I click on the focus {string}` | 2 | 87 |
| When | `I click on the tier {string}` | 5 | 77 |
| When | `I click outside the modal on the backdrop` | 1 | 155 |
| When | `I click the "Cancel" button` | 3 | 51 |
| When | `I click the "Confirm" button` | 27 | 46 |
| When | `I click the "New" button` | 7 | 52 |
| When | `I click the {badge} badge` | 22 | 62 |
| When | `I edit the {string} field to {string}` | 23 | 126 |
| When | `I hover over the character name {string}` | 1 | 102 |
| When | `I hover over the tier {string}` | 1 | 106 |
| When | `I press the Enter key` | 2 | 177 |
| When | `I press the Escape key` | 4 | 173 |
| When | `I reload the page` | 48 | 181 |
| Then | `I should see the {string} value displayed` | 1 | 199 |
| When | `I tap on the {string} value` | 1 | 34 |
| When | `I tap on the character name {string}` | 4 | 92 |
| When | `I tap on the tier {string}` | 1 | 97 |
| When | `I tap outside the modal on the backdrop` | 1 | 164 |
| When | `I tap the {badge} badge` | 2 | 66 |
| When | `I tap the modal confirm button` | 3 | 110 |
| When | `I type {string} in the modal input` | 40 | 118 |
| Then | `the {string} value should display {string}` | 6 | 208 |
| Then | `the {string} value should not have changed` | 2 | 217 |
| Then | `the edit modal should open` | 8 | 241 |
| Then | `the input field should be focused` | 1 | 257 |
| Then | `the input field should contain the current {string} value` | 1 | 259 |
| Then | `the input field should receive focus automatically` | 1 | 256 |
| Then | `the modal input should contain {string}` | 10 | 247 |
| Then | `the modal should close` | 21 | 248 |

## data-validation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all character data should be correctly displayed` | 1 | 74 |
| When | `I import a valid character file with matching schema version` | 2 | 43 |
| Then | `the character name should still be {string}` | 1 | 86 |
| Then | `the character should be imported successfully` | 1 | 66 |
| Then | `the tier should still be {string}` | 1 | 94 |

## empty-fields-visibility.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear with value {string}` | 1 | 97 |
| When | `I click on the descriptor field` | 2 | 62 |
| When | `I click on the focus field` | 1 | 68 |
| When | `I enter {string} in the edit field` | 2 | 74 |
| Then | `the descriptor field should be clickable` | 1 | 30 |
| Then | `the descriptor field should be visible` | 1 | 20 |
| Then | `the descriptor field should display placeholder text` | 1 | 4 |
| Then | `the descriptor field should not show placeholder text` | 1 | 79 |
| Then | `the focus field should be clickable` | 1 | 46 |
| Then | `the focus field should be visible` | 1 | 25 |
| Then | `the focus field should display placeholder text` | 1 | 12 |
| Then | `the focus field should not show placeholder text` | 1 | 88 |

## export-enhancement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file download should be triggered` | 1 | 195 |
| When | `I cancel the file save dialog` | 1 | 131 |
| When | `I click the Export button` | 7 | 124 |
| When | `I click the Quick Export button` | 1 | 138 |
| When | `I click the Save As button` | 1 | 144 |
| Then | `I should not see an {string} button` | 1 | 164 |
| Then | `I should see a {string} button` | 2 | 159 |
| Then | `I should see an {string} button` | 2 | 154 |
| When | `I view the export buttons` | 1 | 119 |
| Given | `my browser does not support File System Access API` | 1 | 56 |
| Given | `my browser supports File System Access API` | 7 | 19 |
| Then | `no file should be saved` | 1 | 237 |
| Given | `the character name is {string}` | 1 | 86 |
| Then | `the download filename should contain {string}` | 1 | 205 |
| Then | `the download should have correct file structure` | 1 | 213 |
| Then | `the Export button should still be visible` | 1 | 244 |
| Then | `the export dialog should be triggered` | 1 | 264 |
| Then | `the export dialog should be triggered with filename containing {string}` | 1 | 170 |
| Then | `the exported data should have correct structure` | 1 | 182 |
| Then | `the file should be saved without prompting` | 1 | 249 |
| Then | `the suggested filename should be {string}` | 1 | 230 |

## i18n.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `artifact level labels should display {string}` | 1 | 105 |
| Then | `cypher level labels should display {string}` | 1 | 94 |
| Given | `I am on the character sheet page with {string}` | 9 | 10 |
| When | `I navigate to the page with {string}` | 1 | 16 |
| Then | `the artifacts heading should be {string}` | 1 | 100 |
| Then | `the background field label should be {string}` | 2 | 119 |
| Then | `the cyphers heading should be {string}` | 1 | 89 |
| Then | `the empty abilities message should be {string}` | 1 | 173 |
| Then | `the empty artifacts message should be {string}` | 1 | 136 |
| Then | `the empty background message should be {string}` | 1 | 146 |
| Then | `the empty cyphers message should be {string}` | 1 | 131 |
| Then | `the empty equipment message should be {string}` | 1 | 168 |
| Then | `the empty notes message should be {string}` | 1 | 157 |
| Then | `the empty oddities message should be {string}` | 1 | 141 |
| Then | `the intellect stat should display {string}` | 1 | 59 |
| Given | `the language is set to {string}` | 3 | 3 |
| Then | `the language should remain German` | 1 | 178 |
| Then | `the load button should display {string}` | 3 | 32 |
| Then | `the might stat should display {string}` | 1 | 47 |
| Then | `the new button should display {string}` | 3 | 37 |
| Then | `the notes field label should be {string}` | 2 | 125 |
| Then | `the oddities heading should be {string}` | 1 | 114 |
| Then | `the page title should be {string}` | 2 | 27 |
| Then | `the page title should be in English` | 2 | 22 |
| Then | `the speed stat should display {string}` | 1 | 53 |
| Then | `the stat current label should be {string}` | 1 | 81 |
| Then | `the stat edge label should be {string}` | 1 | 73 |
| Then | `the stat pool label should be {string}` | 1 | 65 |
| Then | `the stats heading should be {string}` | 1 | 42 |

## recovery-damage-track.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all recovery checkboxes should be unchecked` | 1 | 161 |
| When | `I click on the recovery modifier display` | 1 | 174 |
| When | `I click the {string} recovery checkbox` | 1 | 198 |
| When | `I confirm the edit` | 3 | 190 |
| When | `I enter {string} in the modifier field` | 1 | 180 |
| When | `I select the {string} damage status` | 1 | 205 |
| Then | `I should see {int} damage status options` | 1 | 52 |
| Then | `I should see {int} recovery roll checkboxes` | 1 | 19 |
| Then | `I should see {string} in the recovery section` | 3 | 145 |
| Then | `I should see a section titled {string}` | 2 | 8 |
| Then | `I should see an edit modal` | 1 | 185 |
| Then | `I should see damage status {string}` | 1 | 57 |
| Then | `I should see damage status {string} with description {string}` | 2 | 62 |
| Then | `I should see recovery roll {string} with time {string}` | 4 | 24 |
| Then | `I should see the recovery modifier display {string}` | 1 | 13 |
| Then | `the {string} radio button should be selected` | 4 | 89 |
| Then | `the {string} radio button should not be selected` | 6 | 95 |
| Then | `the {string} recovery checkbox should be checked` | 2 | 38 |
| Then | `the {string} recovery checkbox should be unchecked` | 3 | 44 |
| Given | `the character has {string} recovery used` | 1 | 33 |
| Given | `the character has recovery modifier {int}` | 2 | 123 |
| Given | `the character is {string}` | 3 | 71 |
| Given | `the character is new` | 1 | 152 |
| Then | `the damage track section should have red styling` | 1 | 112 |
| Then | `the recovery rolls section should have green styling` | 1 | 103 |

## resource-tracker-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `the Armor badge should show {string}` | 5 | 135 |
| Then | `the character data should have armor {int}` | 1 | 193 |
| Then | `the character data should have currentXp {int}` | 1 | 163 |
| Then | `the character data should have effort {int}` | 1 | 213 |
| Then | `the character data should have maxCyphers {int}` | 1 | 203 |
| Then | `the character data should have shins {int}` | 1 | 183 |
| Then | `the character data should have totalXp {int}` | 1 | 173 |
| Given | `the character has {int} {resource}` | 13 | 92 |
| Given | `the character has {int} current XP and {int} total XP` | 9 | 9 |
| Given | `the character has {resource} {int}` | 8 | 99 |
| Given | `the character was saved with a single legacy XP value of {int}` | 1 | 34 |
| Then | `the Current XP badge should show {string}` | 7 | 111 |
| Then | `the Effort badge should show {string}` | 3 | 151 |
| Then | `the Max Cyphers portion of the badge should show {string}` | 3 | 143 |
| Then | `the modal confirm button should be disabled` | 2 | 223 |
| Then | `the modal should show a real validation error, not a raw translation key` | 1 | 228 |
| Then | `the Shins badge should show {string}` | 5 | 127 |
| Then | `the Total XP badge should show {string}` | 5 | 119 |

## section-rearrangement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `{string} and {string} are in a grid` | 1 | 427 |
| Then | `{string} and {string} should be displayed side by side in a grid` | 1 | 352 |
| Then | `{string} should be in its own row` | 2 | 471 |
| When | `I attempt to drag {string} onto {string}` | 1 | 381 |
| When | `I choose to {string}` | 2 | 586 |
| When | `I click the Edit Layout button` | 1 | 23 |
| When | `I click the Exit Edit Layout button` | 2 | 28 |
| When | `I click the Reset Layout button` | 1 | 33 |
| When | `I drag {string} out of the grid` | 1 | 452 |
| When | `I drag the {string} section above the {string} section` | 1 | 223 |
| When | `I drag the {string} section onto the {string} section` | 1 | 327 |
| When | `I exit layout edit mode` | 1 | 290 |
| Given | `I have a character file with a different layout` | 3 | 503 |
| Given | `I have a character file with the default layout` | 1 | 518 |
| Given | `I have customized the layout` | 5 | 174 |
| Given | `I have moved the {string} section to the top` | 1 | 261 |
| Given | `I have reordered sections` | 1 | 98 |
| Given | `I have the default layout` | 2 | 215 |
| When | `I import the character file` | 4 | 522 |
| When | `I long-press the {string} section` | 1 | 666 |
| When | `I long-press the {string} section and drag it above the {string} section` | 1 | 681 |
| Given | `I open the settings panel` | 2 | 187 |
| Then | `I should not see a layout choice prompt` | 1 | 563 |
| Then | `I should see a layout choice prompt` | 1 | 555 |
| Then | `I should see layout edit mode is active` | 1 | 38 |
| Then | `I should see options to {string} or {string}` | 1 | 573 |
| Then | `I should see the {string} button` | 1 | 145 |
| Then | `I should see visual indicators on rearrangeable sections` | 1 | 50 |
| When | `I swipe from the {string} section towards the {string} section` | 1 | 704 |
| Then | `it should be touch-friendly` | 1 | 156 |
| Given | `layout edit mode is active` | 10 | 62 |
| Then | `layout edit mode should be inactive` | 1 | 73 |
| Then | `my current layout should be preserved` | 1 | 598 |
| Then | `no grid should be created` | 1 | 402 |
| Then | `only the character data should be imported` | 1 | 620 |
| Then | `the {string} option should be enabled` | 1 | 203 |
| Then | `the {string} section should appear before the {string} section` | 3 | 230 |
| Then | `the {string} section should be in drag mode` | 1 | 674 |
| Then | `the {string} section should still be at the top` | 1 | 301 |
| Then | `the character data should be imported` | 1 | 648 |
| Then | `the character should be imported normally` | 1 | 655 |
| Then | `the exported file should contain the layout configuration` | 1 | 490 |
| Then | `the layout from the imported file should be applied` | 1 | 628 |
| Then | `the layout should be saved` | 1 | 120 |
| Then | `the layout should return to the default arrangement` | 1 | 191 |
| Then | `the page should have scrolled` | 1 | 728 |
| Then | `the sections should remain in single-column layout` | 1 | 422 |
| Then | `the sections should remain in the new order` | 1 | 131 |
| Then | `the visual indicators should be removed` | 1 | 85 |

## settings-gear.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am viewing an old version with the version navigator visible` | 1 | 120 |
| Given | `I am viewing the character sheet` | 1 | 11 |
| When | `I click outside the settings panel` | 1 | 56 |
| When | `I click the British flag icon` | 1 | 87 |
| When | `I click the German flag icon` | 2 | 83 |
| When | `I click the settings gear icon` | 1 | 40 |
| Given | `I have opened the settings panel` | 9 | 52 |
| Then | `I should be able to click the settings gear icon` | 1 | 28 |
| Then | `I should see a {string} option` | 1 | 135 |
| Then | `I should see a settings gear icon in the header` | 1 | 20 |
| Then | `I should see the settings panel` | 1 | 44 |
| Then | `the {string} option should be disabled` | 1 | 141 |
| Given | `the interface is in German` | 1 | 103 |
| Then | `the interface should display in English` | 1 | 97 |
| Then | `the interface should display in German` | 1 | 91 |
| Then | `the settings gear icon should still be visible` | 1 | 24 |
| Then | `the settings panel should close` | 4 | 48 |

## stat-pool-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `the character data is loaded` | 2 | 7 |

## version-comparison.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `comparison view is enabled in settings` | 23 | 42 |
| Then | `comparison view should show as enabled in settings` | 1 | 58 |
| Given | `I am viewing the comparison view` | 19 | 66 |
| When | `I click the left pane's backward arrow` | 3 | 163 |
| When | `I click the left pane's backward arrow {int} time(s)` | 2 | 175 |
| When | `I click the left pane's forward arrow` | 1 | 167 |
| When | `I click the left pane's restore button` | 2 | 345 |
| When | `I click the return to editing button` | 2 | 389 |
| When | `I click the right pane's backward arrow` | 1 | 171 |
| When | `I click the right pane's backward arrow {int} time(s)` | 1 | 186 |
| When | `I click the right pane's restore button` | 1 | 350 |
| When | `I close the settings panel` | 2 | 53 |
| When | `I enable comparison view in settings` | 2 | 46 |
| Then | `no add or delete button should be present in the comparison view` | 1 | 404 |
| Then | `no field in the comparison view should be editable` | 1 | 397 |
| Then | `the {string} field should be highlighted as changed in the {word} pane` | 2 | 269 |
| Then | `the {string} field should not be highlighted in the {word} pane` | 2 | 278 |
| Then | `the {word} pane should show the newly restored version` | 1 | 360 |
| Then | `the added cypher card should be highlighted as added in the right pane` | 1 | 287 |
| Given | `the character has a version where a cypher was renamed` | 1 | 143 |
| Given | `the character has a version with a modified cypher effect` | 1 | 124 |
| Given | `the character has a version with a name change` | 3 | 89 |
| Given | `the character has a version with a removed cypher` | 1 | 113 |
| Given | `the character has a version with an added cypher` | 1 | 99 |
| Then | `the comparison header should indicate there are no differences` | 1 | 258 |
| Then | `the comparison header should list every changed field, not just the top 3` | 1 | 233 |
| Then | `the comparison header should reflect the new left pane version` | 1 | 248 |
| Then | `the comparison view should be visible` | 3 | 71 |
| Then | `the comparison view should not be visible` | 3 | 75 |
| Then | `the left pane should not show the added cypher card` | 1 | 295 |
| Then | `the left pane should show version {int}` | 5 | 218 |
| Given | `the left pane shows version {int}` | 2 | 210 |
| Then | `the modified cypher card should be highlighted as changed in the {word} pane` | 2 | 315 |
| Then | `the new cypher name should be highlighted as added in the right pane` | 1 | 333 |
| Then | `the old cypher name should be highlighted as removed in the left pane` | 1 | 323 |
| Then | `the removed cypher card should be highlighted as removed in the left pane` | 1 | 300 |
| Then | `the right pane should not show the removed cypher card` | 1 | 310 |
| Then | `the right pane should show version {int}` | 4 | 222 |
| Then | `the right pane should still show the same character name as before the restore` | 1 | 370 |
| Given | `the right pane shows version {int}` | 1 | 214 |
| Then | `the right pane's restore button should be disabled` | 1 | 355 |

## version-history.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a new version should be created` | 1 | 826 |
| Then | `a new version should be created with description {string}` | 3 | 879 |
| Then | `all edit controls should be enabled` | 2 | 505 |
| Then | `both navigation arrows should be enabled` | 2 | 575 |
| Given | `I am viewing that version` | 3 | 283 |
| Given | `I am viewing the latest version` | 6 | 57 |
| Given | `I am viewing version {int}` | 8 | 61 |
| When | `I click the backward navigation arrow` | 17 | 361 |
| Then | `I click the backward navigation arrow {int} times` | 1 | 910 |
| When | `I click the backward navigation arrow again` | 1 | 368 |
| When | `I click the forward navigation arrow` | 3 | 380 |
| When | `I click the forward navigation arrow again` | 1 | 386 |
| When | `I click the restore button in the warning banner` | 3 | 392 |
| When | `I click the return to latest button` | 1 | 374 |
| When | `I create a new version by editing the name` | 1 | 474 |
| Given | `I have made buffered edits that were undone` | 2 | 292 |
| When | `I make {int} rapid edits that are buffered` | 1 | 1086 |
| When | `I navigate backward` | 1 | 438 |
| When | `I navigate forward twice` | 1 | 444 |
| When | `I navigate to version {int}` | 8 | 398 |
| When | `I press {string}` | 5 | 653 |
| When | `I press {string} again` | 2 | 964 |
| When | `I press {string} again before the squash timer expires` | 2 | 999 |
| When | `I press {string} before the squash timer expires` | 11 | 925 |
| When | `I press {string} to navigate to previous version` | 1 | 1153 |
| When | `I press {string} to undo buffered changes` | 1 | 1107 |
| When | `I rapidly click the backward arrow {int} times` | 1 | 452 |
| When | `I refresh the browser` | 6 | 466 |
| Then | `I should be viewing the latest version` | 3 | 832 |
| Then | `I should be viewing version {int}` | 1 | 1193 |
| Then | `I should navigate to version {int}` | 2 | 845 |
| Then | `I should see {int} versions in history` | 2 | 1066 |
| When | `I view the character sheet` | 2 | 353 |
| When | `I wait for {int} milliseconds` | 4 | 638 |
| When | `I wait for squash timer to complete` | 15 | 1148 |
| Then | `no new version should be created yet` | 2 | 1047 |
| Then | `no warning banner should be visible` | 6 | 524 |
| Then | `the backward arrow should be disabled` | 1 | 587 |
| Then | `the backward arrow should be enabled` | 3 | 529 |
| Then | `the change description should be displayed` | 1 | 557 |
| Then | `the changes should be reapplied` | 2 | 1074 |
| Then | `the character data should be correct for version {int}` | 1 | 855 |
| Then | `the character data should match version {int}` | 5 | 539 |
| Then | `the character equipment should match version {int} equipment` | 2 | 767 |
| Given | `the character has {int} versions in history` | 41 | 20 |
| Given | `the character has {int} versions with different data` | 3 | 183 |
| Given | `the character has {int} versions with different names` | 2 | 218 |
| Given | `the character has a later version` | 1 | 75 |
| Given | `the character has a legacy version with a {string} description for a name change and an added ability` | 1 | 153 |
| Given | `the character has a legacy version with an {string} description for an added cypher` | 1 | 121 |
| Given | `the character has a portrait image` | 2 | 247 |
| Given | `the character has a version from {int} minutes ago` | 1 | 257 |
| Given | `the character has a version with multiple basic info changes` | 2 | 86 |
| Given | `the character has no version history yet` | 4 | 8 |
| Then | `the character name should be {string}` | 8 | 1038 |
| Then | `the character name should match version {int} name` | 4 | 742 |
| Then | `the character name should revert to the original value` | 2 | 1056 |
| Then | `the character stats should match version {int} stats` | 2 | 754 |
| Then | `the exported file should contain version {int} data` | 1 | 803 |
| Then | `the exported file should not contain version history` | 1 | 813 |
| Then | `the exported file should use the current portrait` | 1 | 819 |
| Then | `the forward arrow should be disabled` | 4 | 534 |
| Then | `the forward arrow should be enabled` | 1 | 592 |
| Then | `the import button should be disabled` | 1 | 1216 |
| Then | `the import button should be enabled` | 2 | 1211 |
| Then | `the oldest version should have been removed` | 2 | 904 |
| Then | `the portrait should remain unchanged` | 3 | 791 |
| When | `the squash timer has completed` | 2 | 648 |
| Then | `the timestamp should be displayed` | 1 | 566 |
| Then | `the timestamp should be in human-readable format` | 1 | 722 |
| Then | `the timestamp should show a relative time like {string}` | 1 | 731 |
| Then | `the UI should remain responsive` | 2 | 869 |
| Then | `the undo buffer should contain exactly {int} changes` | 1 | 627 |
| Then | `the version counter should show {string}` | 25 | 516 |
| Then | `the version description should contain {string}` | 11 | 714 |
| Then | `the version description should contain the tier change` | 1 | 894 |
| Then | `the version navigator should be visible` | 4 | 511 |
| Then | `the version navigator should not be visible` | 2 | 499 |
| Then | `the warning banner should be visible` | 7 | 582 |
| Then | `the warning banner should contain text {string}` | 1 | 597 |
| Then | `the warning banner should have a restore button` | 1 | 605 |
| Then | `the warning banner should not be visible` | 2 | 889 |

## viewport.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `the viewport is {int} pixels wide` | 19 | 9 |

