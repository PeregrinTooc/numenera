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

- Step definitions: **688** in 25 files
- Feature step lines: **2047**
- Definitions with no feature usage: **0**
- Feature lines matching no definition: **24**

| Step file | Definitions | Unused |
| --- | ---: | ---: |
| [ability-enhancements.steps.ts](#abilityenhancementsstepsts) | 15 | 0 |
| [additional-fields-editing.steps.ts](#additionalfieldseditingstepsts) | 37 | 0 |
| [auto-save-indicator.steps.ts](#autosaveindicatorstepsts) | 13 | 0 |
| [basic-info-editing.steps.ts](#basicinfoeditingstepsts) | 37 | 0 |
| [card-creation.steps.ts](#cardcreationstepsts) | 89 | 0 |
| [card-deletion.steps.ts](#carddeletionstepsts) | 40 | 0 |
| [card-modal-focus-trap.steps.ts](#cardmodalfocustrapstepsts) | 16 | 0 |
| [card-reordering.steps.ts](#cardreorderingstepsts) | 16 | 0 |
| [character-display.steps.ts](#characterdisplaystepsts) | 40 | 0 |
| [character-file-export.steps.ts](#characterfileexportstepsts) | 8 | 0 |
| [character-file-import.steps.ts](#characterfileimportstepsts) | 3 | 0 |
| [character-storage.steps.ts](#characterstoragestepsts) | 10 | 0 |
| [combat.steps.ts](#combatstepsts) | 26 | 0 |
| [common-steps.ts](#commonstepsts) | 34 | 0 |
| [data-validation.steps.ts](#datavalidationstepsts) | 5 | 0 |
| [empty-fields-visibility.steps.ts](#emptyfieldsvisibilitystepsts) | 14 | 0 |
| [export-enhancement.steps.ts](#exportenhancementstepsts) | 21 | 0 |
| [i18n.steps.ts](#i18nstepsts) | 29 | 0 |
| [recovery-damage-track.steps.ts](#recoverydamagetrackstepsts) | 25 | 0 |
| [resource-tracker-editing.steps.ts](#resourcetrackereditingstepsts) | 18 | 0 |
| [section-rearrangement.steps.ts](#sectionrearrangementstepsts) | 49 | 0 |
| [settings-gear.steps.ts](#settingsgearstepsts) | 17 | 0 |
| [stat-pool-editing.steps.ts](#statpooleditingstepsts) | 1 | 0 |
| [version-comparison.steps.ts](#versioncomparisonstepsts) | 43 | 0 |
| [version-history.steps.ts](#versionhistorystepsts) | 82 | 0 |

## ⚠️ Feature lines with no matching step definition

These would be reported as *undefined* by Cucumber (or are matched by a
pattern this script does not understand):

- `character-display.feature:99` — the character sheet should be displayed in a single column layout
- `character-display.feature:100` — all content should be readable without horizontal scrolling
- `character-display.feature:101` — stat pools should be stacked vertically
- `character-display.feature:102` — items should be displayed in a mobile-friendly format
- `character-display.feature:106` — I am viewing on a tablet device with width "768px"
- `character-display.feature:108` — the character sheet should be displayed in a responsive layout
- `character-display.feature:109` — stat pools should be displayed in an optimized arrangement
- `character-display.feature:110` — items should be organized efficiently for the viewport
- `character-display.feature:114` — I am viewing on a desktop device with width "1280px"
- `character-display.feature:116` — the character sheet should be displayed in a multi-column layout
- `character-display.feature:117` — stat pools should be displayed side by side
- `character-display.feature:118` — items should be organized in columns for optimal readability
- `character-display.feature:123` — the character is tier "3"
- `character-display.feature:124` — the character has 3 cyphers
- `character-display.feature:125` — I should see all 3 cyphers displayed
- `character-display.feature:126` — the cypher limit indicator should show "3/3" or equivalent
- `character-display.feature:131` — the character has text fields containing special characters:
- `character-display.feature:135` — the special characters should be properly displayed
- `character-display.feature:136` — the text should not be corrupted or escaped incorrectly
- `character-display.feature:141` — the character has a background with 500+ characters
- `character-display.feature:142` — the long text should be displayed without layout issues
- `character-display.feature:143` — the text should wrap properly within its container
- `character-display.feature:144` — the page should remain readable
- `character-display.feature:149` — I should see sections in this order:

## ability-enhancements.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see an empty abilities section` | 1 | 119 |
| Then | `I should see the ability {string}` | 4 | 39 |
| Then | `the ability {string} should have intellect pool styling` | 1 | 108 |
| Then | `the ability {string} should have might pool styling` | 1 | 92 |
| Then | `the ability {string} should have speed pool styling` | 1 | 100 |
| Then | `the ability {string} should not show action indicator` | 1 | 86 |
| Then | `the ability {string} should not show cost badge` | 1 | 74 |
| Then | `the ability {string} should not show pool indicator` | 1 | 80 |
| Then | `the ability {string} should show action {string}` | 2 | 64 |
| Then | `the ability {string} should show cost {string}` | 2 | 44 |
| Then | `the ability {string} should show pool {string}` | 2 | 54 |
| Given | `the character has abilities with different pools:` | 1 | 24 |
| Given | `the character has an ability {string} with:` | 4 | 8 |
| Given | `the character has no abilities` | 1 | 33 |
| Then | `the empty state should use translation keys` | 1 | 123 |

## additional-fields-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am using a mobile device` | 7 | 307 |
| When | `I clear the {textarea} textarea` | 4 | 150 |
| When | `I click outside the {textarea} textarea` | 11 | 161 |
| When | `I click the {textarea} textarea` | 20 | 146 |
| When | `I select {string} from the mobile picker` | 1 | 338 |
| When | `I select {string} from the type dropdown` | 4 | 38 |
| When | `I tap outside the {textarea} textarea` | 2 | 365 |
| When | `I tap the {textarea} textarea` | 2 | 343 |
| When | `I tap the type dropdown` | 1 | 326 |
| When | `I type {string} in the {textarea} textarea` | 12 | 154 |
| When | `I type a {int} character string in the background textarea` | 1 | 239 |
| When | `I type a {int} character string in the notes textarea` | 1 | 248 |
| Then | `the {textarea} placeholder should be {string}` | 2 | 213 |
| When | `the {textarea} textarea is empty` | 2 | 209 |
| Then | `the {textarea} textarea should be empty` | 2 | 199 |
| Then | `the {textarea} textarea should be focused` | 4 | 181 |
| Then | `the {textarea} textarea should be readonly` | 8 | 119 |
| Then | `the {textarea} textarea should become editable` | 2 | 347 |
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
| Then | `the mobile OS picker should open` | 1 | 331 |
| Then | `the notes textarea should contain the full {int} character text` | 1 | 267 |
| Then | `the type dropdown label should be {string}` | 1 | 86 |
| Then | `the type dropdown option for {string} should display as {string}` | 3 | 95 |
| Then | `the type dropdown options should be {string}, {string}, {string}` | 1 | 60 |
| Then | `the type dropdown should have {int} options` | 1 | 51 |
| Then | `the type dropdown should show {string} as selected` | 6 | 43 |
| Then | `the virtual keyboard should appear` | 2 | 356 |

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
| Then | `an error or validation message may appear` | 1 | 134 |
| Then | `focus should cycle between input field, confirm button, and cancel button` | 1 | 208 |
| Then | `focus should not leave the modal` | 1 | 242 |
| Given | `I am viewing on a mobile device with width {string}` | 7 | 297 |
| Then | `I can cancel with Escape key` | 1 | 267 |
| Then | `I can confirm with Enter key` | 1 | 260 |
| Then | `I can navigate with Tab key` | 1 | 252 |
| When | `I press Tab repeatedly` | 1 | 30 |
| Then | `the backdrop should have aria-hidden={string}` | 1 | 284 |
| Then | `the buttons should be touch-friendly size \(min 44x44px)` | 1 | 349 |
| Then | `the cancel button should have an X icon` | 1 | 158 |
| Then | `the character name should be large enough for touch \(min 44x44px)` | 1 | 377 |
| Then | `the character name should display {string}` | 6 | 82 |
| Then | `the character name should still display {string}` | 6 | 90 |
| Then | `the confirm button should have a checkmark icon` | 1 | 152 |
| Then | `the descriptor should be large enough for touch \(min 44x44px)` | 1 | 397 |
| Then | `the descriptor should display {string}` | 2 | 104 |
| Then | `the focus should be large enough for touch \(min 44x44px)` | 1 | 407 |
| Then | `the focus should display {string}` | 2 | 112 |
| Then | `the input field should be large enough for touch input` | 1 | 369 |
| Then | `the input field should be of type {string}` | 1 | 69 |
| Then | `the input field should have inputmode={string} for mobile` | 1 | 320 |
| Then | `the mobile keyboard should appear` | 1 | 314 |
| Then | `the modal backdrop should be semi-transparent` | 1 | 164 |
| Then | `the modal should be sized appropriately for mobile` | 1 | 305 |
| Then | `the modal should fill most of the screen width` | 1 | 329 |
| Then | `the modal should have a cancel button with icon` | 1 | 62 |
| Then | `the modal should have a confirm button with icon` | 1 | 55 |
| Then | `the modal should have Numenera-themed styling` | 1 | 143 |
| Then | `the modal should have role={string}` | 1 | 278 |
| Then | `the modal should not close` | 1 | 129 |
| Then | `the modal should not overflow the viewport` | 1 | 339 |
| Then | `the name should show a hover state indicating it's editable` | 1 | 182 |
| Then | `the tier should be constrained to {string}` | 2 | 121 |
| Then | `the tier should be large enough for touch \(min 44x44px)` | 1 | 387 |
| Then | `the tier should display {string}` | 6 | 98 |
| Then | `the tier should show a hover state indicating it's editable` | 1 | 193 |

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
| Then | `focus should be on the description textarea` | 1 | 146 |
| Then | `focus should eventually wrap back to the first input field` | 1 | 82 |
| Then | `focus should eventually wrap back to the last focusable element` | 1 | 100 |
| Then | `focus should move to the last focusable element in the modal` | 1 | 73 |
| Then | `focus should move to the next focusable element in the modal` | 1 | 65 |
| Then | `focus should never escape to the page body or address bar` | 4 | 111 |
| Then | `focus should still be within the card modal` | 3 | 130 |
| When | `I press Shift+Tab` | 1 | 15 |
| When | `I press Shift+Tab repeatedly` | 1 | 48 |
| When | `I press the Tab key` | 1 | 11 |
| When | `I press the Tab key {int} times` | 4 | 56 |
| When | `I press the Tab key repeatedly` | 1 | 41 |
| Then | `the active element should not be the browser chrome` | 1 | 161 |
| Then | `the active element should not be the document body` | 1 | 139 |
| Then | `the card edit modal should be closed` | 1 | 4 |
| Then | `the first input field in the modal should be automatically focused` | 1 | 22 |

## card-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag ability {string} before ability {string}` | 2 | 287 |
| When | `I drag cypher {string} after cypher {string}` | 1 | 70 |
| When | `I drag cypher {string} before cypher {string}` | 3 | 50 |
| When | `I drag cypher {string} into the abilities section` | 1 | 338 |
| When | `I hover over cypher {string}` | 1 | 125 |
| When | `I start dragging cypher {string}` | 2 | 96 |
| Then | `the abilities should be in order {string}, {string}` | 1 | 313 |
| Then | `the abilities should be in order {string}, {string}, {string}` | 3 | 305 |
| Given | `the character has {int} abilities named {string}, {string}` | 1 | 259 |
| Given | `the character has {int} abilities named {string}, {string}, {string}` | 3 | 251 |
| Given | `the character has {int} cyphers named {string}, {string}` | 2 | 16 |
| Given | `the character has {int} cyphers named {string}, {string}, {string}` | 6 | 8 |
| Then | `the cypher {string} should have a dragging visual state` | 1 | 187 |
| Then | `the cyphers should be in order {string}, {string}` | 1 | 160 |
| Then | `the cyphers should be in order {string}, {string}, {string}` | 5 | 152 |
| Then | `the cyphers should be visually in order {string}, {string}, {string}` | 1 | 207 |

## character-display.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character exists with the following data:` | 2 | 4 |
| Then | `all labels should use translation keys` | 1 | 37 |
| Then | `all stat labels should use translation keys` | 1 | 58 |
| Then | `all text field labels should use translation keys` | 1 | 156 |
| Then | `empty states should use translation keys` | 1 | 187 |
| Given | `I am on the character sheet page` | 50 | 10 |
| Then | `I should see {int} artifact displayed` | 1 | 94 |
| Then | `I should see {int} cyphers displayed` | 1 | 68 |
| Then | `I should see {int} oddities displayed` | 1 | 107 |
| Then | `I should see an empty artifacts section` | 1 | 179 |
| Then | `I should see an empty cyphers section` | 1 | 175 |
| Then | `I should see an empty oddities section` | 1 | 183 |
| Then | `I should see artifact {string} with level {string}` | 1 | 99 |
| Then | `I should see cypher {string} with level {string}` | 2 | 73 |
| Then | `I should see descriptor {string} displayed` | 1 | 29 |
| Then | `I should see empty state for abilities` | 1 | 218 |
| Then | `I should see empty state for background` | 1 | 198 |
| Then | `I should see empty state for equipment` | 1 | 214 |
| Then | `I should see empty state for notes` | 1 | 206 |
| Then | `I should see focus {string} displayed` | 1 | 33 |
| Then | `I should see oddity {string}` | 2 | 112 |
| Then | `I should see the {string} stat with pool {string}, edge {string}, and current {string}` | 3 | 47 |
| Then | `I should see the abilities text` | 1 | 149 |
| Then | `I should see the background text` | 1 | 125 |
| Then | `I should see the character name {string}` | 1 | 15 |
| Then | `I should see the equipment text` | 1 | 141 |
| Then | `I should see the notes text` | 1 | 133 |
| Then | `I should see tier {string} displayed` | 1 | 19 |
| Then | `I should see type {string} displayed` | 1 | 23 |
| Given | `the character has empty text fields` | 1 | 193 |
| Given | `the character has no artifacts` | 1 | 167 |
| Given | `the character has no cyphers` | 1 | 162 |
| Given | `the character has no oddities` | 1 | 171 |
| Given | `the character has the following artifacts:` | 1 | 87 |
| Given | `the character has the following cyphers:` | 1 | 65 |
| Given | `the character has the following oddities:` | 1 | 90 |
| Given | `the character has the following stats:` | 1 | 44 |
| Given | `the character has the following text fields:` | 1 | 122 |
| Then | `the cyphers section label should use translation keys` | 1 | 81 |
| Then | `the items section labels should use translation keys` | 1 | 116 |

## character-file-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file export should be triggered` | 1 | 111 |
| When | `I click the export button` | 5 | 34 |
| Given | `the character has name {string}` | 3 | 6 |
| Then | `the exported file should contain all character properties` | 2 | 125 |
| Then | `the exported file should have an exportDate` | 2 | 174 |
| Then | `the exported file should have schemaVersion {string}` | 2 | 166 |
| Then | `the exported file should have version {string}` | 2 | 158 |
| Then | `the exported filename should be {string}` | 2 | 116 |

## character-file-import.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I import a valid character file {string}` | 4 | 86 |
| Then | `the character {string} should still be displayed` | 1 | 124 |
| Then | `the previous character should be replaced` | 1 | 131 |

## character-storage.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character is currently displayed` | 2 | 5 |
| Then | `all character data should be preserved` | 2 | 82 |
| Then | `all character sections should show data` | 2 | 46 |
| Then | `all sections should display empty state messages` | 2 | 17 |
| When | `I click the "Load" button` | 3 | 36 |
| Then | `the character {string} should be displayed` | 3 | 41 |
| Given | `the character sheet is empty` | 3 | 31 |
| Then | `the character sheet should show empty states` | 2 | 10 |
| Then | `the character should be displayed` | 1 | 70 |
| Then | `the same character should still be displayed` | 1 | 76 |

## combat.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see an empty attacks section` | 1 | 105 |
| Then | `I should see an empty special abilities section` | 1 | 187 |
| Then | `I should see the armor badge in the attacks section` | 1 | 198 |
| Then | `I should see the attack {string}` | 2 | 17 |
| Then | `I should see the special ability {string}` | 1 | 139 |
| Then | `the attack {string} should have red combat theme styling` | 1 | 92 |
| Then | `the attack {string} should not show notes` | 1 | 82 |
| Then | `the attack {string} should show damage {string}` | 2 | 26 |
| Then | `the attack {string} should show modifier {string}` | 2 | 40 |
| Then | `the attack {string} should show notes {string}` | 1 | 68 |
| Then | `the attack {string} should show range {string}` | 2 | 54 |
| Then | `the attacks section should be in the right column` | 1 | 214 |
| Given | `the character has a special ability {string}` | 1 | 130 |
| Given | `the character has a special ability {string} with:` | 1 | 116 |
| Given | `the character has an attack {string}` | 1 | 10 |
| Given | `the character has an attack {string} with:` | 1 | 5 |
| Given | `the character has no attacks` | 1 | 12 |
| Given | `the character has no special abilities` | 1 | 134 |
| Given | `the character has special abilities and attacks` | 1 | 204 |
| Then | `the empty attacks state should use translation keys` | 1 | 109 |
| Then | `the empty special abilities state should use translation keys` | 1 | 191 |
| Then | `the sections should stack vertically on mobile` | 1 | 219 |
| Then | `the special abilities section should be in the left column` | 1 | 209 |
| Then | `the special ability {string} should have teal theme styling` | 1 | 174 |
| Then | `the special ability {string} should show description {string}` | 1 | 148 |
| Then | `the special ability {string} should show source {string}` | 1 | 160 |

## common-steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear` | 10 | 246 |
| When | `I clear the input field` | 18 | 113 |
| When | `I click on the {string} value` | 9 | 25 |
| When | `I click on the character name {string}` | 12 | 72 |
| When | `I click on the descriptor {string}` | 2 | 81 |
| When | `I click on the focus {string}` | 2 | 86 |
| When | `I click on the tier {string}` | 5 | 76 |
| When | `I click outside the modal on the backdrop` | 1 | 154 |
| When | `I click the "Cancel" button` | 3 | 50 |
| When | `I click the "Confirm" button` | 27 | 45 |
| When | `I click the "New" button` | 7 | 51 |
| When | `I click the {badge} badge` | 22 | 61 |
| When | `I edit the {string} field to {string}` | 23 | 125 |
| When | `I hover over the character name {string}` | 1 | 101 |
| When | `I hover over the tier {string}` | 1 | 105 |
| When | `I press the Enter key` | 2 | 176 |
| When | `I press the Escape key` | 4 | 172 |
| When | `I reload the page` | 48 | 180 |
| Then | `I should see the {string} value displayed` | 1 | 205 |
| When | `I tap on the {string} value` | 1 | 33 |
| When | `I tap on the character name {string}` | 4 | 91 |
| When | `I tap on the tier {string}` | 1 | 96 |
| When | `I tap outside the modal on the backdrop` | 1 | 163 |
| When | `I tap the {badge} badge` | 2 | 65 |
| When | `I tap the modal confirm button` | 3 | 109 |
| When | `I type {string} in the modal input` | 40 | 117 |
| Then | `the {string} value should display {string}` | 6 | 214 |
| Then | `the {string} value should not have changed` | 2 | 223 |
| Then | `the edit modal should open` | 8 | 247 |
| Then | `the input field should be focused` | 1 | 263 |
| Then | `the input field should contain the current {string} value` | 1 | 265 |
| Then | `the input field should receive focus automatically` | 1 | 262 |
| Then | `the modal input should contain {string}` | 10 | 253 |
| Then | `the modal should close` | 21 | 254 |

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
| Then | `an edit modal should appear with value {string}` | 1 | 115 |
| When | `I click on the descriptor field` | 2 | 62 |
| When | `I click on the focus field` | 1 | 68 |
| When | `I enter {string} in the edit field` | 2 | 74 |
| Then | `the descriptor field should be clickable` | 1 | 30 |
| Then | `the descriptor field should be visible` | 1 | 20 |
| Then | `the descriptor field should display {string}` | 2 | 79 |
| Then | `the descriptor field should display placeholder text` | 1 | 4 |
| Then | `the descriptor field should not show placeholder text` | 1 | 97 |
| Then | `the focus field should be clickable` | 1 | 46 |
| Then | `the focus field should be visible` | 1 | 25 |
| Then | `the focus field should display {string}` | 2 | 88 |
| Then | `the focus field should display placeholder text` | 1 | 12 |
| Then | `the focus field should not show placeholder text` | 1 | 106 |

## export-enhancement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file download should be triggered` | 1 | 176 |
| When | `I cancel the file save dialog` | 1 | 112 |
| When | `I click the Export button` | 7 | 105 |
| When | `I click the Quick Export button` | 1 | 119 |
| When | `I click the Save As button` | 1 | 125 |
| Then | `I should not see an {string} button` | 1 | 145 |
| Then | `I should see a {string} button` | 2 | 140 |
| Then | `I should see an {string} button` | 2 | 135 |
| When | `I view the export buttons` | 1 | 100 |
| Given | `my browser does not support File System Access API` | 1 | 37 |
| Given | `my browser supports File System Access API` | 7 | 7 |
| Then | `no file should be saved` | 1 | 218 |
| Given | `the character name is {string}` | 1 | 67 |
| Then | `the download filename should contain {string}` | 1 | 186 |
| Then | `the download should have correct file structure` | 1 | 194 |
| Then | `the Export button should still be visible` | 1 | 225 |
| Then | `the export dialog should be triggered` | 1 | 245 |
| Then | `the export dialog should be triggered with filename containing {string}` | 1 | 151 |
| Then | `the exported data should have correct structure` | 1 | 163 |
| Then | `the file should be saved without prompting` | 1 | 230 |
| Then | `the suggested filename should be {string}` | 1 | 211 |

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
| Then | `all recovery checkboxes should be unchecked` | 1 | 178 |
| When | `I click on the recovery modifier display` | 1 | 191 |
| When | `I click the {string} recovery checkbox` | 1 | 215 |
| When | `I confirm the edit` | 3 | 207 |
| When | `I enter {string} in the modifier field` | 1 | 197 |
| When | `I select the {string} damage status` | 1 | 222 |
| Then | `I should see {int} damage status options` | 1 | 50 |
| Then | `I should see {int} recovery roll checkboxes` | 1 | 17 |
| Then | `I should see {string} in the recovery section` | 3 | 162 |
| Then | `I should see a section titled {string}` | 2 | 6 |
| Then | `I should see an edit modal` | 1 | 202 |
| Then | `I should see damage status {string}` | 1 | 55 |
| Then | `I should see damage status {string} with description {string}` | 2 | 60 |
| Then | `I should see recovery roll {string} with time {string}` | 4 | 22 |
| Then | `I should see the recovery modifier display {string}` | 1 | 11 |
| Then | `the {string} radio button should be selected` | 4 | 98 |
| Then | `the {string} radio button should not be selected` | 6 | 104 |
| Then | `the {string} recovery checkbox should be checked` | 2 | 36 |
| Then | `the {string} recovery checkbox should be unchecked` | 3 | 42 |
| Given | `the character has {string} recovery used` | 1 | 31 |
| Given | `the character has recovery modifier {int}` | 2 | 132 |
| Given | `the character is {string}` | 3 | 69 |
| Given | `the character is new` | 1 | 169 |
| Then | `the damage track section should have red styling` | 1 | 121 |
| Then | `the recovery rolls section should have green styling` | 1 | 112 |

## resource-tracker-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `the Armor badge should show {string}` | 5 | 155 |
| Then | `the character data should have armor {int}` | 1 | 213 |
| Then | `the character data should have currentXp {int}` | 1 | 183 |
| Then | `the character data should have effort {int}` | 1 | 233 |
| Then | `the character data should have maxCyphers {int}` | 1 | 223 |
| Then | `the character data should have shins {int}` | 1 | 203 |
| Then | `the character data should have totalXp {int}` | 1 | 193 |
| Given | `the character has {int} {resource}` | 13 | 112 |
| Given | `the character has {int} current XP and {int} total XP` | 9 | 24 |
| Given | `the character has {resource} {int}` | 8 | 119 |
| Given | `the character was saved with a single legacy XP value of {int}` | 1 | 49 |
| Then | `the Current XP badge should show {string}` | 7 | 131 |
| Then | `the Effort badge should show {string}` | 3 | 171 |
| Then | `the Max Cyphers portion of the badge should show {string}` | 3 | 163 |
| Then | `the modal confirm button should be disabled` | 2 | 243 |
| Then | `the modal should show a real validation error, not a raw translation key` | 1 | 248 |
| Then | `the Shins badge should show {string}` | 5 | 147 |
| Then | `the Total XP badge should show {string}` | 5 | 139 |

## section-rearrangement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `{string} and {string} are in a grid` | 1 | 560 |
| Then | `{string} and {string} should be displayed side by side in a grid` | 1 | 461 |
| Then | `{string} should be in its own row` | 2 | 630 |
| When | `I attempt to drag {string} onto {string}` | 1 | 500 |
| When | `I choose to {string}` | 2 | 815 |
| When | `I click the Edit Layout button` | 1 | 13 |
| When | `I click the Exit Edit Layout button` | 2 | 18 |
| When | `I click the Reset Layout button` | 1 | 23 |
| When | `I confirm the reset` | 1 | 191 |
| When | `I drag {string} out of the grid` | 1 | 601 |
| When | `I drag the {string} section above the {string} section` | 1 | 237 |
| When | `I drag the {string} section onto the {string} section` | 1 | 419 |
| When | `I exit layout edit mode` | 1 | 372 |
| When | `I export the character` | 1 | 654 |
| Given | `I have a character file with a different layout` | 3 | 732 |
| Given | `I have a character file with the default layout` | 1 | 747 |
| Given | `I have customized the layout` | 5 | 164 |
| Given | `I have moved the {string} section to the top` | 1 | 314 |
| Given | `I have reordered sections` | 1 | 88 |
| Given | `I have the default layout` | 1 | 220 |
| When | `I import the character file` | 4 | 751 |
| When | `I long-tap on a section for 250ms` | 1 | 895 |
| Given | `I open the settings panel` | 2 | 187 |
| Then | `I should be able to drag it to a new position` | 1 | 921 |
| Then | `I should not see a layout choice prompt` | 1 | 792 |
| Then | `I should see a layout choice prompt` | 1 | 784 |
| Then | `I should see layout edit mode is active` | 1 | 28 |
| Then | `I should see options to {string} or {string}` | 1 | 802 |
| Then | `I should see the {string} button` | 1 | 135 |
| Then | `I should see visual indicators on rearrangeable sections` | 1 | 40 |
| Then | `it should be touch-friendly` | 1 | 146 |
| Given | `layout edit mode is active` | 8 | 52 |
| Then | `layout edit mode should be inactive` | 1 | 63 |
| Then | `my current layout should be preserved` | 1 | 827 |
| Then | `no grid should be created` | 1 | 535 |
| Then | `only the character data should be imported` | 1 | 849 |
| Then | `the {string} option should be enabled` | 1 | 208 |
| Then | `the {string} section should appear before the {string} section` | 1 | 273 |
| Then | `the {string} section should still be at the top` | 1 | 383 |
| Then | `the character data should be imported` | 1 | 877 |
| Then | `the character should be imported normally` | 1 | 884 |
| Then | `the exported file should contain the layout configuration` | 1 | 719 |
| Then | `the layout from the imported file should be applied` | 1 | 857 |
| Then | `the layout should be saved` | 1 | 110 |
| Then | `the layout should return to the default arrangement` | 1 | 196 |
| Then | `the section should enter drag mode` | 1 | 913 |
| Then | `the sections should remain in single-column layout` | 1 | 555 |
| Then | `the sections should remain in the new order` | 1 | 121 |
| Then | `the visual indicators should be removed` | 1 | 75 |

## settings-gear.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am viewing an old version with the version navigator visible` | 1 | 104 |
| Given | `I am viewing the character sheet` | 1 | 11 |
| When | `I click outside the settings panel` | 1 | 56 |
| When | `I click the British flag icon` | 1 | 71 |
| When | `I click the German flag icon` | 2 | 67 |
| When | `I click the settings gear icon` | 1 | 40 |
| Given | `I have opened the settings panel` | 9 | 52 |
| Then | `I should be able to click the settings gear icon` | 1 | 28 |
| Then | `I should see a {string} option` | 1 | 119 |
| Then | `I should see a settings gear icon in the header` | 1 | 20 |
| Then | `I should see the settings panel` | 1 | 44 |
| Then | `the {string} option should be disabled` | 1 | 125 |
| Given | `the interface is in German` | 1 | 87 |
| Then | `the interface should display in English` | 1 | 81 |
| Then | `the interface should display in German` | 1 | 75 |
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
| Given | `I am using a phone-width viewport` | 1 | 416 |
| Given | `I am using a tablet-width viewport` | 1 | 420 |
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
| Given | `the character has a version with a name change` | 2 | 89 |
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
| Then | `a new version should be created` | 1 | 871 |
| Then | `a new version should be created with description {string}` | 3 | 924 |
| Then | `all edit controls should be enabled` | 2 | 517 |
| Then | `both navigation arrows should be enabled` | 2 | 587 |
| Given | `I am viewing that version` | 3 | 296 |
| Given | `I am viewing the latest version` | 6 | 49 |
| Given | `I am viewing version {int}` | 8 | 54 |
| When | `I click the backward navigation arrow` | 17 | 373 |
| Then | `I click the backward navigation arrow {int} times` | 1 | 955 |
| When | `I click the backward navigation arrow again` | 1 | 380 |
| When | `I click the forward navigation arrow` | 3 | 392 |
| When | `I click the forward navigation arrow again` | 1 | 398 |
| When | `I click the restore button in the warning banner` | 3 | 404 |
| When | `I click the return to latest button` | 1 | 386 |
| When | `I create a new version by editing the name` | 1 | 486 |
| Given | `I have made buffered edits that were undone` | 2 | 305 |
| When | `I make {int} rapid edits that are buffered` | 1 | 1131 |
| When | `I navigate backward` | 1 | 450 |
| When | `I navigate forward twice` | 1 | 456 |
| When | `I navigate to version {int}` | 8 | 410 |
| When | `I press {string}` | 5 | 665 |
| When | `I press {string} again` | 2 | 1009 |
| When | `I press {string} again before the squash timer expires` | 2 | 1044 |
| When | `I press {string} before the squash timer expires` | 11 | 970 |
| When | `I press {string} to navigate to previous version` | 1 | 1198 |
| When | `I press {string} to undo buffered changes` | 1 | 1152 |
| When | `I rapidly click the backward arrow {int} times` | 1 | 464 |
| When | `I refresh the browser` | 6 | 478 |
| Then | `I should be viewing the latest version` | 3 | 877 |
| Then | `I should be viewing version {int}` | 1 | 1238 |
| Then | `I should navigate to version {int}` | 2 | 890 |
| Then | `I should see {int} versions in history` | 2 | 1111 |
| When | `I view the character sheet` | 2 | 366 |
| When | `I wait for {int} milliseconds` | 4 | 650 |
| When | `I wait for squash timer to complete` | 15 | 1193 |
| Then | `no new version should be created yet` | 2 | 1092 |
| Then | `no warning banner should be visible` | 6 | 536 |
| Then | `the backward arrow should be disabled` | 1 | 599 |
| Then | `the backward arrow should be enabled` | 3 | 541 |
| Then | `the change description should be displayed` | 1 | 569 |
| Then | `the changes should be reapplied` | 2 | 1119 |
| Then | `the character data should be correct for version {int}` | 1 | 900 |
| Then | `the character data should match version {int}` | 5 | 551 |
| Then | `the character equipment should match version {int} equipment` | 2 | 779 |
| Given | `the character has {int} versions in history` | 41 | 12 |
| Given | `the character has {int} versions with different data` | 3 | 194 |
| Given | `the character has {int} versions with different names` | 2 | 229 |
| Given | `the character has a legacy version with a {string} description for a name change and an added ability` | 1 | 164 |
| Given | `the character has a legacy version with an {string} description for an added cypher` | 1 | 132 |
| Given | `the character has a portrait image` | 2 | 258 |
| Given | `the character has a version from {int} minutes ago` | 1 | 270 |
| Given | `the character has a version with multiple basic info changes` | 2 | 97 |
| Given | `the character has a version with name change` | 1 | 68 |
| Given | `the character has no version history yet` | 4 | 7 |
| Then | `the character name should be {string}` | 8 | 1083 |
| Then | `the character name should match version {int} name` | 4 | 754 |
| Then | `the character name should revert to the original value` | 2 | 1101 |
| Then | `the character stats should match version {int} stats` | 2 | 766 |
| Then | `the exported file should contain version {int} data` | 1 | 815 |
| Then | `the exported file should not contain version history` | 1 | 838 |
| Then | `the exported file should use the current portrait` | 1 | 853 |
| Then | `the forward arrow should be disabled` | 4 | 546 |
| Then | `the forward arrow should be enabled` | 1 | 604 |
| Then | `the import button should be disabled` | 1 | 1261 |
| Then | `the import button should be enabled` | 2 | 1256 |
| Then | `the oldest version should have been removed` | 2 | 949 |
| Then | `the portrait should remain unchanged` | 3 | 803 |
| When | `the squash timer has completed` | 2 | 660 |
| Then | `the timestamp should be displayed` | 1 | 578 |
| Then | `the timestamp should be in human-readable format` | 1 | 734 |
| Then | `the timestamp should show a relative time like {string}` | 1 | 743 |
| Then | `the UI should remain responsive` | 2 | 914 |
| Then | `the undo buffer should contain exactly {int} changes` | 1 | 639 |
| Then | `the version counter should show {string}` | 25 | 528 |
| Then | `the version description should contain {string}` | 11 | 726 |
| Then | `the version description should contain the tier change` | 1 | 939 |
| Then | `the version navigator should be visible` | 4 | 523 |
| Then | `the version navigator should not be visible` | 2 | 511 |
| Then | `the warning banner should be visible` | 7 | 594 |
| Then | `the warning banner should contain text {string}` | 1 | 609 |
| Then | `the warning banner should have a restore button` | 1 | 617 |
| Then | `the warning banner should not be visible` | 2 | 934 |

