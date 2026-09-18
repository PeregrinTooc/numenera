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

- Step definitions: **737** in 25 files
- Feature step lines: **2047**
- Definitions with no feature usage: **4**
- Feature lines matching no definition: **24**

| Step file | Definitions | Unused |
| --- | ---: | ---: |
| [ability-enhancements.steps.ts](#abilityenhancementsstepsts) | 15 | 0 |
| [additional-fields-editing.steps.ts](#additionalfieldseditingstepsts) | 54 | 0 |
| [auto-save-indicator.steps.ts](#autosaveindicatorstepsts) | 13 | 0 |
| [basic-info-editing.steps.ts](#basicinfoeditingstepsts) | 38 | 0 |
| [card-creation.steps.ts](#cardcreationstepsts) | 90 | 0 |
| [card-deletion.steps.ts](#carddeletionstepsts) | 49 | 1 |
| [card-modal-focus-trap.steps.ts](#cardmodalfocustrapstepsts) | 16 | 0 |
| [card-reordering.steps.ts](#cardreorderingstepsts) | 17 | 1 |
| [character-display.steps.ts](#characterdisplaystepsts) | 40 | 0 |
| [character-file-export.steps.ts](#characterfileexportstepsts) | 8 | 0 |
| [character-file-import.steps.ts](#characterfileimportstepsts) | 3 | 0 |
| [character-storage.steps.ts](#characterstoragestepsts) | 11 | 0 |
| [combat.steps.ts](#combatstepsts) | 28 | 0 |
| [common-steps.ts](#commonstepsts) | 45 | 0 |
| [data-validation.steps.ts](#datavalidationstepsts) | 5 | 0 |
| [empty-fields-visibility.steps.ts](#emptyfieldsvisibilitystepsts) | 15 | 0 |
| [export-enhancement.steps.ts](#exportenhancementstepsts) | 22 | 1 |
| [i18n.steps.ts](#i18nstepsts) | 29 | 0 |
| [recovery-damage-track.steps.ts](#recoverydamagetrackstepsts) | 25 | 0 |
| [resource-tracker-editing.steps.ts](#resourcetrackereditingstepsts) | 20 | 0 |
| [section-rearrangement.steps.ts](#sectionrearrangementstepsts) | 49 | 0 |
| [settings-gear.steps.ts](#settingsgearstepsts) | 17 | 0 |
| [stat-pool-editing.steps.ts](#statpooleditingstepsts) | 1 | 0 |
| [version-comparison.steps.ts](#versioncomparisonstepsts) | 44 | 1 |
| [version-history.steps.ts](#versionhistorystepsts) | 83 | 0 |

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
| Then | `I should see an empty abilities section` | 1 | 129 |
| Then | `I should see the ability {string}` | 4 | 39 |
| Then | `the ability {string} should have intellect pool styling` | 1 | 117 |
| Then | `the ability {string} should have might pool styling` | 1 | 99 |
| Then | `the ability {string} should have speed pool styling` | 1 | 108 |
| Then | `the ability {string} should not show action indicator` | 1 | 92 |
| Then | `the ability {string} should not show cost badge` | 1 | 78 |
| Then | `the ability {string} should not show pool indicator` | 1 | 85 |
| Then | `the ability {string} should show action {string}` | 2 | 67 |
| Then | `the ability {string} should show cost {string}` | 2 | 45 |
| Then | `the ability {string} should show pool {string}` | 2 | 56 |
| Given | `the character has abilities with different pools:` | 1 | 24 |
| Given | `the character has an ability {string} with:` | 4 | 8 |
| Given | `the character has no abilities` | 1 | 33 |
| Then | `the empty state should use translation keys` | 1 | 134 |

## additional-fields-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am using a mobile device` | 7 | 435 |
| When | `I clear the background textarea` | 2 | 180 |
| When | `I clear the notes textarea` | 2 | 311 |
| When | `I click outside the background textarea` | 6 | 193 |
| When | `I click outside the notes textarea` | 5 | 321 |
| When | `I click the background textarea` | 11 | 175 |
| When | `I click the notes textarea` | 9 | 287 |
| When | `I select {string} from the mobile picker` | 1 | 466 |
| When | `I select {string} from the type dropdown` | 4 | 82 |
| When | `I tap outside the background textarea` | 1 | 502 |
| When | `I tap outside the notes textarea` | 1 | 510 |
| When | `I tap the background textarea` | 1 | 471 |
| When | `I tap the notes textarea` | 1 | 491 |
| When | `I tap the type dropdown` | 1 | 454 |
| When | `I type {string} in the background textarea` | 7 | 185 |
| When | `I type {string} in the notes textarea` | 5 | 316 |
| When | `I type a {int} character string in the background textarea` | 1 | 365 |
| When | `I type a {int} character string in the notes textarea` | 1 | 374 |
| Then | `the background placeholder should be {string}` | 1 | 242 |
| When | `the background textarea is empty` | 1 | 237 |
| Then | `the background textarea should be empty` | 1 | 226 |
| Then | `the background textarea should be focused` | 2 | 210 |
| Then | `the background textarea should be readonly` | 4 | 154 |
| Then | `the background textarea should become editable` | 1 | 476 |
| Then | `the background textarea should contain the full {int} character text` | 1 | 383 |
| Then | `the background textarea should have a pointer cursor` | 1 | 169 |
| Then | `the background textarea should have an edit state visual indicator` | 1 | 215 |
| Then | `the background textarea should not be readonly` | 2 | 204 |
| Then | `the background textarea should show {string}` | 8 | 159 |
| Then | `the background textarea should still be editable` | 1 | 231 |
| Then | `the character data should have background {string}` | 3 | 251 |
| Then | `the character data should have notes {string}` | 2 | 346 |
| Then | `the character data should have the full background text` | 1 | 403 |
| Then | `the character data should have the full notes text` | 1 | 417 |
| Then | `the character data should have type {string}` | 1 | 116 |
| Given | `the character has the following data:` | 1 | 10 |
| Then | `the mobile OS picker should open` | 1 | 459 |
| Then | `the notes placeholder should be {string}` | 1 | 340 |
| When | `the notes textarea is empty` | 1 | 335 |
| Then | `the notes textarea should be empty` | 1 | 330 |
| Then | `the notes textarea should be focused` | 2 | 297 |
| Then | `the notes textarea should be readonly` | 4 | 270 |
| Then | `the notes textarea should become editable` | 1 | 496 |
| Then | `the notes textarea should contain the full {int} character text` | 1 | 393 |
| Then | `the notes textarea should have a pointer cursor` | 1 | 281 |
| Then | `the notes textarea should have an edit state visual indicator` | 1 | 302 |
| Then | `the notes textarea should not be readonly` | 2 | 292 |
| Then | `the notes textarea should show {string}` | 6 | 275 |
| Then | `the type dropdown label should be {string}` | 1 | 131 |
| Then | `the type dropdown option for {string} should display as {string}` | 3 | 140 |
| Then | `the type dropdown options should be {string}, {string}, {string}` | 1 | 104 |
| Then | `the type dropdown should have {int} options` | 1 | 95 |
| Then | `the type dropdown should show {string} as selected` | 6 | 87 |
| Then | `the virtual keyboard should appear` | 2 | 482 |

## auto-save-indicator.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I note the current save timestamp` | 1 | 29 |
| When | `I rapidly edit the character name multiple times` | 1 | 42 |
| When | `I wait for {int} second(s)` | 1 | 35 |
| Given | `the character sheet is displayed` | 5 | 20 |
| Then | `the character should be saved only once after changes stop` | 1 | 135 |
| Then | `the save indicator should be in the lower-right corner` | 1 | 162 |
| Then | `the save indicator should be visible` | 2 | 104 |
| Then | `the save indicator should contain {string}` | 1 | 118 |
| Then | `the save indicator should have subtle styling` | 1 | 183 |
| Then | `the save indicator should show a single timestamp` | 1 | 148 |
| Then | `the save indicator should show a timestamp` | 1 | 109 |
| Then | `the save indicator should still be visible` | 1 | 157 |
| Then | `the save timestamp should be updated` | 2 | 126 |

## basic-info-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an error or validation message may appear` | 1 | 140 |
| Then | `focus should cycle between input field, confirm button, and cancel button` | 1 | 214 |
| Then | `focus should not leave the modal` | 1 | 248 |
| Given | `I am viewing on a mobile device with width {string}` | 7 | 303 |
| Then | `I can cancel with Escape key` | 1 | 273 |
| Then | `I can confirm with Enter key` | 1 | 266 |
| Then | `I can navigate with Tab key` | 1 | 258 |
| When | `I press Tab repeatedly` | 1 | 30 |
| Then | `the backdrop should have aria-hidden={string}` | 1 | 290 |
| Then | `the buttons should be touch-friendly size \(min 44x44px)` | 1 | 355 |
| Then | `the cancel button should have an X icon` | 1 | 164 |
| Then | `the character name should be large enough for touch \(min 44x44px)` | 1 | 383 |
| Then | `the character name should display {string}` | 6 | 82 |
| Then | `the character name should still display {string}` | 6 | 90 |
| Then | `the confirm button should be disabled` | 1 | 129 |
| Then | `the confirm button should have a checkmark icon` | 1 | 158 |
| Then | `the descriptor should be large enough for touch \(min 44x44px)` | 1 | 403 |
| Then | `the descriptor should display {string}` | 2 | 104 |
| Then | `the focus should be large enough for touch \(min 44x44px)` | 1 | 413 |
| Then | `the focus should display {string}` | 2 | 112 |
| Then | `the input field should be large enough for touch input` | 1 | 375 |
| Then | `the input field should be of type {string}` | 1 | 69 |
| Then | `the input field should have inputmode={string} for mobile` | 1 | 326 |
| Then | `the mobile keyboard should appear` | 1 | 320 |
| Then | `the modal backdrop should be semi-transparent` | 1 | 170 |
| Then | `the modal should be sized appropriately for mobile` | 1 | 311 |
| Then | `the modal should fill most of the screen width` | 1 | 335 |
| Then | `the modal should have a cancel button with icon` | 1 | 62 |
| Then | `the modal should have a confirm button with icon` | 1 | 55 |
| Then | `the modal should have Numenera-themed styling` | 1 | 149 |
| Then | `the modal should have role={string}` | 1 | 284 |
| Then | `the modal should not close` | 1 | 135 |
| Then | `the modal should not overflow the viewport` | 1 | 345 |
| Then | `the name should show a hover state indicating it's editable` | 1 | 188 |
| Then | `the tier should be constrained to {string}` | 2 | 121 |
| Then | `the tier should be large enough for touch \(min 44x44px)` | 1 | 393 |
| Then | `the tier should display {string}` | 6 | 98 |
| Then | `the tier should show a hover state indicating it's editable` | 1 | 199 |

## card-creation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all ability fields should be empty` | 1 | 280 |
| Then | `all artifact fields should be empty` | 1 | 239 |
| Then | `all attack fields should be empty` | 1 | 264 |
| Then | `all cypher fields should be empty` | 1 | 213 |
| Then | `all equipment fields should be empty` | 1 | 226 |
| Then | `all oddity fields should be empty` | 1 | 251 |
| Then | `all special ability fields should be empty` | 1 | 295 |
| When | `I cancel the card edit modal` | 7 | 644 |
| When | `I click the add ability button` | 15 | 194 |
| When | `I click the add artifact button` | 7 | 182 |
| When | `I click the add attack button` | 7 | 190 |
| When | `I click the add cypher button` | 12 | 174 |
| When | `I click the add equipment button` | 9 | 178 |
| When | `I click the add oddity button` | 7 | 186 |
| When | `I click the add special ability button` | 7 | 198 |
| When | `I click the edit button on ability {string}` | 1 | 720 |
| When | `I click the edit button on artifact {string}` | 1 | 699 |
| When | `I click the edit button on attack {string}` | 1 | 713 |
| When | `I click the edit button on cypher {string}` | 2 | 685 |
| When | `I click the edit button on equipment {string}` | 1 | 692 |
| When | `I click the edit button on oddity {string}` | 1 | 706 |
| When | `I click the edit button on special ability {string}` | 1 | 727 |
| When | `I confirm the card edit modal` | 50 | 635 |
| When | `I fill in the ability cost with {string}` | 6 | 388 |
| When | `I fill in the ability description with {string}` | 9 | 398 |
| When | `I fill in the ability name with {string}` | 9 | 385 |
| When | `I fill in the ability pool with {string}` | 6 | 392 |
| When | `I fill in the artifact effect with {string}` | 7 | 352 |
| When | `I fill in the artifact level with {string}` | 7 | 345 |
| When | `I fill in the artifact name with {string}` | 7 | 339 |
| When | `I fill in the attack damage with {string}` | 7 | 369 |
| When | `I fill in the attack modifier with {string}` | 7 | 376 |
| When | `I fill in the attack name with {string}` | 7 | 366 |
| When | `I fill in the cypher effect with {string}` | 11 | 315 |
| When | `I fill in the cypher level with {string}` | 11 | 311 |
| When | `I fill in the cypher name with {string}` | 11 | 308 |
| When | `I fill in the equipment description with {string}` | 7 | 330 |
| When | `I fill in the equipment name with {string}` | 8 | 324 |
| When | `I fill in the oddity text with {string}` | 7 | 361 |
| When | `I fill in the special ability description with {string}` | 7 | 420 |
| When | `I fill in the special ability name with {string}` | 7 | 407 |
| When | `I fill in the special ability source with {string}` | 7 | 413 |
| Then | `I should see {int} ability cards` | 14 | 472 |
| Then | `I should see {int} artifact cards` | 8 | 457 |
| Then | `I should see {int} attack cards` | 8 | 467 |
| Then | `I should see {int} cypher card` | 2 | 444 |
| Then | `I should see {int} cypher cards` | 13 | 447 |
| Then | `I should see {int} equipment cards` | 8 | 452 |
| Then | `I should see {int} oddity cards` | 8 | 462 |
| Then | `I should see {int} special ability cards` | 8 | 477 |
| Then | `I should see a cypher card with name {string}` | 5 | 484 |
| Then | `I should see a special ability card with name {string}` | 5 | 610 |
| Then | `I should see an ability card with name {string}` | 7 | 585 |
| Then | `I should see an add ability button` | 1 | 156 |
| Then | `I should see an add artifact button` | 1 | 127 |
| Then | `I should see an add attack button` | 1 | 135 |
| Then | `I should see an add cypher button` | 1 | 119 |
| Then | `I should see an add equipment button` | 1 | 123 |
| Then | `I should see an add oddity button` | 1 | 131 |
| Then | `I should see an add special ability button` | 1 | 160 |
| Then | `I should see an artifact card with name {string}` | 5 | 526 |
| Then | `I should see an attack card with name {string}` | 5 | 560 |
| Then | `I should see an equipment card with name {string}` | 5 | 509 |
| Then | `I should see an oddity card with text {string}` | 5 | 551 |
| Then | `the ability {string} should have cost {string}` | 1 | 594 |
| Then | `the ability {string} should have pool {string}` | 1 | 602 |
| Then | `the add attack button should have a non-transparent background` | 1 | 139 |
| Then | `the artifact {string} should have effect {string}` | 1 | 543 |
| Then | `the artifact {string} should have level {string}` | 1 | 535 |
| Then | `the attack {string} should have damage {string}` | 1 | 577 |
| Then | `the attack {string} should have modifier {string}` | 1 | 569 |
| Then | `the card edit modal should be open` | 15 | 652 |
| Given | `the character has {int} ability cards` | 5 | 104 |
| Given | `the character has {int} artifact cards` | 5 | 89 |
| Given | `the character has {int} attack cards` | 5 | 99 |
| Given | `the character has {int} cypher cards` | 5 | 79 |
| Given | `the character has {int} equipment cards` | 5 | 84 |
| Given | `the character has {int} oddity cards` | 5 | 94 |
| Given | `the character has {int} special ability cards` | 5 | 109 |
| Then | `the cypher {string} should have effect {string}` | 1 | 501 |
| Then | `the cypher {string} should have level {string}` | 1 | 493 |
| Then | `the equipment {string} should have description {string}` | 1 | 518 |
| Then | `the modal should show ability fields` | 1 | 272 |
| Then | `the modal should show artifact fields` | 1 | 232 |
| Then | `the modal should show attack fields` | 1 | 256 |
| Then | `the modal should show cypher fields` | 1 | 206 |
| Then | `the modal should show equipment fields` | 1 | 220 |
| Then | `the modal should show oddity fields` | 1 | 246 |
| Then | `the modal should show special ability fields` | 1 | 288 |
| Then | `the special ability {string} should have source {string}` | 1 | 621 |

## card-deletion.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the delete button on the first ability` | 1 | 200 |
| When | `I click the delete button on the first artifact` | 1 | 182 |
| When | `I click the delete button on the first attack` | 1 | 194 |
| When | `I click the delete button on the first cypher` | 4 | 157 |
| When | `I click the delete button on the first cypher again` | 1 | 170 |
| When | `I click the delete button on the first cypher card` | 2 | 163 |
| When | `I click the delete button on the first equipment item` | 1 | 176 |
| When | `I click the delete button on the first oddity` | 1 | 188 |
| When | `I click the delete button on the first special ability` | 1 | 206 |
| Given | `I have {int} abilities` | 1 | 141 |
| Given | `I have {int} artifact` | 1 | 120 |
| Given | `I have {int} attacks` | 1 | 134 |
| Given | `I have {int} cyphers` | 4 | 105 |
| Given | `I have {int} equipment items` | 1 | 113 |
| Given | `I have {int} oddities` | 1 | 127 |
| Given | `I have {int} special abilities` | 1 | 148 |
| When | `I look at a cypher card` | 2 | 37 |
| When | `I look at a special ability card` | 1 | 61 |
| When | `I look at an ability card` | 1 | 57 |
| When | `I look at an artifact card` | 1 | 45 |
| When | `I look at an attack card` | 1 | 53 |
| When | `I look at an equipment card` | 1 | 41 |
| When | `I look at an oddity card` | 1 | 49 |
| Then | `I should have {int} abilities remaining` | 2 | 285 |
| Then | `I should have {int} artifacts remaining` | 2 | 280 |
| Then | `I should have {int} attack remaining` | 2 | 253 |
| Then | `I should have {int} cypher remaining` | 3 | 244 |
| Then | `I should have {int} cyphers remaining` | 1 | 268 |
| Then | `I should have {int} equipment items remaining` | 2 | 272 |
| Then | `I should have {int} oddity remaining` | 2 | 248 |
| Then | `I should have {int} special abilities remaining` | **0** | 290 |
| Then | `I should have {int} special ability remaining` | 2 | 258 |
| Then | `I should not see a confirmation dialog` | 1 | 319 |
| Then | `I should see a delete button on the ability card` | 1 | 90 |
| Then | `I should see a delete button on the artifact card` | 1 | 75 |
| Then | `I should see a delete button on the attack card` | 1 | 85 |
| Then | `I should see a delete button on the cypher card` | 1 | 65 |
| Then | `I should see a delete button on the equipment card` | 1 | 70 |
| Then | `I should see a delete button on the oddity card` | 1 | 80 |
| Then | `I should see a delete button on the special ability card` | 1 | 95 |
| Then | `the ability should be removed from the DOM` | 1 | 234 |
| Then | `the artifact should be removed from the DOM` | 1 | 222 |
| Then | `the attack should be removed from the DOM` | 1 | 230 |
| Then | `the cypher should be removed from the DOM` | 1 | 214 |
| Then | `the cypher should be removed immediately` | 1 | 315 |
| Then | `the delete button should be in the top-left corner of the card` | 1 | 300 |
| Then | `the equipment item should be removed from the DOM` | 1 | 218 |
| Then | `the oddity should be removed from the DOM` | 1 | 226 |
| Then | `the special ability should be removed from the DOM` | 1 | 238 |

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
| When | `I drag ability {string} before ability {string}` | 2 | 294 |
| When | `I drag cypher {string} after cypher {string}` | 1 | 69 |
| When | `I drag cypher {string} before cypher {string}` | 3 | 49 |
| When | `I drag cypher {string} into the abilities section` | 1 | 345 |
| When | `I hover over cypher {string}` | 1 | 125 |
| Then | `I should see drop zone indicators` | **0** | 208 |
| When | `I start dragging cypher {string}` | 2 | 95 |
| Then | `the abilities should be in order {string}, {string}` | 1 | 320 |
| Then | `the abilities should be in order {string}, {string}, {string}` | 3 | 312 |
| Given | `the character has {int} abilities named {string}, {string}` | 1 | 266 |
| Given | `the character has {int} abilities named {string}, {string}, {string}` | 3 | 258 |
| Given | `the character has {int} cyphers named {string}, {string}` | 2 | 15 |
| Given | `the character has {int} cyphers named {string}, {string}, {string}` | 6 | 7 |
| Then | `the cypher {string} should have a dragging visual state` | 1 | 188 |
| Then | `the cyphers should be in order {string}, {string}` | 1 | 161 |
| Then | `the cyphers should be in order {string}, {string}, {string}` | 5 | 153 |
| Then | `the cyphers should be visually in order {string}, {string}, {string}` | 1 | 214 |

## character-display.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character exists with the following data:` | 2 | 4 |
| Then | `all labels should use translation keys` | 1 | 41 |
| Then | `all stat labels should use translation keys` | 1 | 63 |
| Then | `all text field labels should use translation keys` | 1 | 169 |
| Then | `empty states should use translation keys` | 1 | 203 |
| Given | `I am on the character sheet page` | 50 | 10 |
| Then | `I should see {int} artifact displayed` | 1 | 101 |
| Then | `I should see {int} cyphers displayed` | 1 | 73 |
| Then | `I should see {int} oddities displayed` | 1 | 116 |
| Then | `I should see an empty artifacts section` | 1 | 193 |
| Then | `I should see an empty cyphers section` | 1 | 188 |
| Then | `I should see an empty oddities section` | 1 | 198 |
| Then | `I should see artifact {string} with level {string}` | 1 | 107 |
| Then | `I should see cypher {string} with level {string}` | 2 | 79 |
| Then | `I should see descriptor {string} displayed` | 1 | 31 |
| Then | `I should see empty state for abilities` | 1 | 235 |
| Then | `I should see empty state for background` | 1 | 214 |
| Then | `I should see empty state for equipment` | 1 | 230 |
| Then | `I should see empty state for notes` | 1 | 222 |
| Then | `I should see focus {string} displayed` | 1 | 36 |
| Then | `I should see oddity {string}` | 2 | 122 |
| Then | `I should see the {string} stat with pool {string}, edge {string}, and current {string}` | 3 | 51 |
| Then | `I should see the abilities text` | 1 | 161 |
| Then | `I should see the background text` | 1 | 136 |
| Then | `I should see the character name {string}` | 1 | 15 |
| Then | `I should see the equipment text` | 1 | 152 |
| Then | `I should see the notes text` | 1 | 144 |
| Then | `I should see tier {string} displayed` | 1 | 20 |
| Then | `I should see type {string} displayed` | 1 | 25 |
| Given | `the character has empty text fields` | 1 | 209 |
| Given | `the character has no artifacts` | 1 | 180 |
| Given | `the character has no cyphers` | 1 | 175 |
| Given | `the character has no oddities` | 1 | 184 |
| Given | `the character has the following artifacts:` | 1 | 94 |
| Given | `the character has the following cyphers:` | 1 | 70 |
| Given | `the character has the following oddities:` | 1 | 97 |
| Given | `the character has the following stats:` | 1 | 48 |
| Given | `the character has the following text fields:` | 1 | 133 |
| Then | `the cyphers section label should use translation keys` | 1 | 88 |
| Then | `the items section labels should use translation keys` | 1 | 127 |

## character-file-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file export should be triggered` | 1 | 113 |
| When | `I click the export button` | 5 | 36 |
| Given | `the character has name {string}` | 3 | 8 |
| Then | `the exported file should contain all character properties` | 2 | 124 |
| Then | `the exported file should have an exportDate` | 2 | 167 |
| Then | `the exported file should have schemaVersion {string}` | 2 | 159 |
| Then | `the exported file should have version {string}` | 2 | 154 |
| Then | `the exported filename should be {string}` | 2 | 118 |

## character-file-import.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I import a valid character file {string}` | 4 | 102 |
| Then | `the character {string} should still be displayed` | 1 | 141 |
| Then | `the previous character should be replaced` | 1 | 148 |

## character-storage.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character is currently displayed` | 2 | 4 |
| Then | `all character data should be preserved` | 2 | 89 |
| Then | `all character sections should show data` | 2 | 53 |
| Then | `all sections should display empty state messages` | 2 | 24 |
| When | `I click the "Load" button` | 3 | 43 |
| When | `I click the "New" button` | 2 | 9 |
| Then | `the character {string} should be displayed` | 3 | 48 |
| Given | `the character sheet is empty` | 3 | 38 |
| Then | `the character sheet should show empty states` | 2 | 17 |
| Then | `the character should be displayed` | 1 | 77 |
| Then | `the same character should still be displayed` | 1 | 83 |

## combat.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see an empty attacks section` | 1 | 113 |
| Then | `I should see an empty special abilities section` | 1 | 197 |
| Then | `I should see the armor badge in the attacks section` | 1 | 215 |
| Then | `I should see the attack {string}` | 2 | 25 |
| Then | `I should see the special ability {string}` | 1 | 149 |
| Then | `the armor badge should show value {string}` | 1 | 220 |
| Then | `the attack {string} should have red combat theme styling` | 1 | 100 |
| Then | `the attack {string} should not show notes` | 1 | 90 |
| Then | `the attack {string} should show damage {string}` | 2 | 34 |
| Then | `the attack {string} should show modifier {string}` | 2 | 48 |
| Then | `the attack {string} should show notes {string}` | 1 | 76 |
| Then | `the attack {string} should show range {string}` | 2 | 62 |
| Then | `the attacks section should be in the right column` | 1 | 240 |
| Given | `the character has a special ability {string}` | 1 | 140 |
| Given | `the character has a special ability {string} with:` | 1 | 126 |
| Given | `the character has an attack {string}` | 1 | 16 |
| Given | `the character has an attack {string} with:` | 1 | 5 |
| Given | `the character has armor value {int}` | 1 | 210 |
| Given | `the character has no attacks` | 1 | 20 |
| Given | `the character has no special abilities` | 1 | 144 |
| Given | `the character has special abilities and attacks` | 1 | 229 |
| Then | `the empty attacks state should use translation keys` | 1 | 118 |
| Then | `the empty special abilities state should use translation keys` | 1 | 202 |
| Then | `the sections should stack vertically on mobile` | 1 | 246 |
| Then | `the special abilities section should be in the left column` | 1 | 234 |
| Then | `the special ability {string} should have teal theme styling` | 1 | 184 |
| Then | `the special ability {string} should show description {string}` | 1 | 158 |
| Then | `the special ability {string} should show source {string}` | 1 | 170 |

## common-steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear` | 10 | 385 |
| When | `I clear the input field` | 18 | 216 |
| When | `I click on the {string} value` | 9 | 62 |
| When | `I click on the character name {string}` | 12 | 145 |
| When | `I click on the descriptor {string}` | 2 | 154 |
| When | `I click on the focus {string}` | 2 | 159 |
| When | `I click on the tier {string}` | 5 | 149 |
| When | `I click outside the modal on the backdrop` | 1 | 277 |
| When | `I click the Armor badge` | 4 | 118 |
| When | `I click the Cancel button` | 1 | 92 |
| When | `I click the Confirm button` | 5 | 80 |
| When | `I click the Current XP badge` | 5 | 104 |
| When | `I click the Effort badge` | 3 | 128 |
| When | `I click the Max Cyphers badge` | 3 | 123 |
| When | `I click the modal cancel button` | 2 | 194 |
| When | `I click the modal confirm button` | 22 | 182 |
| When | `I click the new button` | 1 | 303 |
| When | `I click the Shins badge` | 5 | 113 |
| When | `I click the Total XP badge` | 2 | 108 |
| When | `I edit the {string} field to {string}` | 23 | 248 |
| When | `I hover over the character name {string}` | 1 | 174 |
| When | `I hover over the tier {string}` | 1 | 178 |
| When | `I press the Enter key` | 2 | 299 |
| When | `I press the Escape key` | 4 | 295 |
| When | `I reload the page` | 48 | 310 |
| Then | `I should see the {string} value displayed` | 1 | 335 |
| When | `I tap on the {string} value` | 1 | 71 |
| When | `I tap on the character name {string}` | 4 | 164 |
| When | `I tap on the tier {string}` | 1 | 169 |
| When | `I tap outside the modal on the backdrop` | 1 | 286 |
| When | `I tap the Current XP badge` | 1 | 133 |
| When | `I tap the modal confirm button` | 3 | 204 |
| When | `I tap the Shins badge` | 1 | 138 |
| When | `I type {string} in the input field` | 15 | 239 |
| When | `I type {string} in the modal input` | 17 | 226 |
| When | `I type {string} into the input field` | 8 | 221 |
| Then | `the {string} value should display {string}` | 6 | 344 |
| Then | `the {string} value should not have changed` | 2 | 353 |
| Then | `the edit modal should open` | 8 | 390 |
| Then | `the input field should be focused` | 1 | 418 |
| Then | `the input field should contain {string}` | 4 | 408 |
| Then | `the input field should contain the current {string} value` | 1 | 423 |
| Then | `the input field should receive focus automatically` | 1 | 413 |
| Then | `the modal input should contain {string}` | 6 | 395 |
| Then | `the modal should close` | 21 | 403 |

## data-validation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all character data should be correctly displayed` | 1 | 80 |
| When | `I import a valid character file with matching schema version` | 2 | 49 |
| Then | `the character name should still be {string}` | 1 | 92 |
| Then | `the character should be imported successfully` | 1 | 72 |
| Then | `the tier should still be {string}` | 1 | 100 |

## empty-fields-visibility.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear with value {string}` | 1 | 127 |
| When | `I click on the descriptor field` | 2 | 74 |
| When | `I click on the focus field` | 1 | 81 |
| When | `I click the New button` | 4 | 5 |
| When | `I enter {string} in the edit field` | 2 | 88 |
| Then | `the descriptor field should be clickable` | 1 | 40 |
| Then | `the descriptor field should be visible` | 1 | 28 |
| Then | `the descriptor field should display {string}` | 2 | 93 |
| Then | `the descriptor field should display placeholder text` | 1 | 10 |
| Then | `the descriptor field should not show placeholder text` | 1 | 107 |
| Then | `the focus field should be clickable` | 1 | 57 |
| Then | `the focus field should be visible` | 1 | 34 |
| Then | `the focus field should display {string}` | 2 | 100 |
| Then | `the focus field should display placeholder text` | 1 | 19 |
| Then | `the focus field should not show placeholder text` | 1 | 117 |

## export-enhancement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file download should be triggered` | 1 | 180 |
| When | `I cancel the file save dialog` | 1 | 111 |
| When | `I click the Export button` | 7 | 104 |
| When | `I click the Quick Export button` | 1 | 118 |
| When | `I click the Save As button` | 1 | 124 |
| Then | `I should not see a {string} button` | **0** | 144 |
| Then | `I should not see an {string} button` | 1 | 149 |
| Then | `I should see a {string} button` | 2 | 139 |
| Then | `I should see an {string} button` | 2 | 134 |
| When | `I view the export buttons` | 1 | 99 |
| Given | `my browser does not support File System Access API` | 1 | 36 |
| Given | `my browser supports File System Access API` | 7 | 6 |
| Then | `no file should be saved` | 1 | 222 |
| Given | `the character name is {string}` | 1 | 66 |
| Then | `the download filename should contain {string}` | 1 | 190 |
| Then | `the download should have correct file structure` | 1 | 198 |
| Then | `the Export button should still be visible` | 1 | 229 |
| Then | `the export dialog should be triggered` | 1 | 249 |
| Then | `the export dialog should be triggered with filename containing {string}` | 1 | 155 |
| Then | `the exported data should have correct structure` | 1 | 167 |
| Then | `the file should be saved without prompting` | 1 | 234 |
| Then | `the suggested filename should be {string}` | 1 | 215 |

## i18n.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `artifact level labels should display {string}` | 1 | 113 |
| Then | `cypher level labels should display {string}` | 1 | 101 |
| Given | `I am on the character sheet page with {string}` | 9 | 11 |
| When | `I navigate to the page with {string}` | 1 | 17 |
| Then | `the artifacts heading should be {string}` | 1 | 107 |
| Then | `the background field label should be {string}` | 2 | 128 |
| Then | `the cyphers heading should be {string}` | 1 | 95 |
| Then | `the empty abilities message should be {string}` | 1 | 186 |
| Then | `the empty artifacts message should be {string}` | 1 | 146 |
| Then | `the empty background message should be {string}` | 1 | 158 |
| Then | `the empty cyphers message should be {string}` | 1 | 140 |
| Then | `the empty equipment message should be {string}` | 1 | 180 |
| Then | `the empty notes message should be {string}` | 1 | 169 |
| Then | `the empty oddities message should be {string}` | 1 | 152 |
| Then | `the intellect stat should display {string}` | 1 | 65 |
| Given | `the language is set to {string}` | 3 | 4 |
| Then | `the language should remain German` | 1 | 192 |
| Then | `the load button should display {string}` | 3 | 35 |
| Then | `the might stat should display {string}` | 1 | 53 |
| Then | `the new button should display {string}` | 3 | 41 |
| Then | `the notes field label should be {string}` | 2 | 134 |
| Then | `the oddities heading should be {string}` | 1 | 122 |
| Then | `the page title should be {string}` | 2 | 29 |
| Then | `the page title should be in English` | 2 | 23 |
| Then | `the speed stat should display {string}` | 1 | 59 |
| Then | `the stat current label should be {string}` | 1 | 87 |
| Then | `the stat edge label should be {string}` | 1 | 79 |
| Then | `the stat pool label should be {string}` | 1 | 71 |
| Then | `the stats heading should be {string}` | 1 | 47 |

## recovery-damage-track.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all recovery checkboxes should be unchecked` | 1 | 189 |
| When | `I click on the recovery modifier display` | 1 | 202 |
| When | `I click the {string} recovery checkbox` | 1 | 227 |
| When | `I confirm the edit` | 3 | 219 |
| When | `I enter {string} in the modifier field` | 1 | 209 |
| When | `I select the {string} damage status` | 1 | 235 |
| Then | `I should see {int} damage status options` | 1 | 54 |
| Then | `I should see {int} recovery roll checkboxes` | 1 | 19 |
| Then | `I should see {string} in the recovery section` | 3 | 172 |
| Then | `I should see a section titled {string}` | 2 | 7 |
| Then | `I should see an edit modal` | 1 | 214 |
| Then | `I should see damage status {string}` | 1 | 59 |
| Then | `I should see damage status {string} with description {string}` | 2 | 64 |
| Then | `I should see recovery roll {string} with time {string}` | 4 | 24 |
| Then | `I should see the recovery modifier display {string}` | 1 | 12 |
| Then | `the {string} radio button should be selected` | 4 | 103 |
| Then | `the {string} radio button should not be selected` | 6 | 110 |
| Then | `the {string} recovery checkbox should be checked` | 2 | 38 |
| Then | `the {string} recovery checkbox should be unchecked` | 3 | 45 |
| Given | `the character has {string} recovery used` | 1 | 33 |
| Given | `the character has recovery modifier {int}` | 2 | 141 |
| Given | `the character is {string}` | 3 | 73 |
| Given | `the character is new` | 1 | 180 |
| Then | `the damage track section should have red styling` | 1 | 129 |
| Then | `the recovery rolls section should have green styling` | 1 | 119 |

## resource-tracker-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `the Armor badge should show {string}` | 4 | 280 |
| Then | `the character data should have armor {int}` | 1 | 341 |
| Then | `the character data should have currentXp {int}` | 1 | 308 |
| Then | `the character data should have effort {int}` | 1 | 363 |
| Then | `the character data should have maxCyphers {int}` | 1 | 352 |
| Then | `the character data should have shins {int}` | 1 | 330 |
| Then | `the character data should have totalXp {int}` | 1 | 319 |
| Given | `the character has {int} armor` | 5 | 162 |
| Given | `the character has {int} current XP and {int} total XP` | 9 | 57 |
| Given | `the character has {int} shins` | 7 | 134 |
| Given | `the character has effort {int}` | 4 | 221 |
| Given | `the character has max cyphers {int}` | 4 | 190 |
| Given | `the character was saved with a single legacy XP value of {int}` | 1 | 96 |
| Then | `the Current XP badge should show {string}` | 7 | 256 |
| Then | `the Effort badge should show {string}` | 3 | 296 |
| Then | `the Max Cyphers portion of the badge should show {string}` | 3 | 288 |
| Then | `the modal confirm button should be disabled` | 1 | 374 |
| Then | `the modal should show a real validation error, not a raw translation key` | 1 | 379 |
| Then | `the Shins badge should show {string}` | 5 | 272 |
| Then | `the Total XP badge should show {string}` | 5 | 264 |

## section-rearrangement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `{string} and {string} are in a grid` | 1 | 560 |
| Then | `{string} and {string} should be displayed side by side in a grid` | 1 | 461 |
| Then | `{string} should be in its own row` | 2 | 630 |
| When | `I attempt to drag {string} onto {string}` | 1 | 500 |
| When | `I choose to {string}` | 2 | 819 |
| When | `I click the Edit Layout button` | 1 | 11 |
| When | `I click the Exit Edit Layout button` | 2 | 16 |
| When | `I click the Reset Layout button` | 1 | 21 |
| When | `I confirm the reset` | 1 | 191 |
| When | `I drag {string} out of the grid` | 1 | 601 |
| When | `I drag the {string} section above the {string} section` | 1 | 237 |
| When | `I drag the {string} section onto the {string} section` | 1 | 419 |
| When | `I exit layout edit mode` | 1 | 372 |
| When | `I export the character` | 1 | 654 |
| Given | `I have a character file with a different layout` | 3 | 733 |
| Given | `I have a character file with the default layout` | 1 | 750 |
| Given | `I have customized the layout` | 5 | 162 |
| Given | `I have moved the {string} section to the top` | 1 | 314 |
| Given | `I have reordered sections` | 1 | 86 |
| Given | `I have the default layout` | 1 | 220 |
| When | `I import the character file` | 4 | 755 |
| When | `I long-tap on a section for 250ms` | 1 | 899 |
| Given | `I open the settings panel` | 2 | 185 |
| Then | `I should be able to drag it to a new position` | 1 | 925 |
| Then | `I should not see a layout choice prompt` | 1 | 796 |
| Then | `I should see a layout choice prompt` | 1 | 788 |
| Then | `I should see layout edit mode is active` | 1 | 26 |
| Then | `I should see options to {string} or {string}` | 1 | 806 |
| Then | `I should see the {string} button` | 1 | 133 |
| Then | `I should see visual indicators on rearrangeable sections` | 1 | 38 |
| Then | `it should be touch-friendly` | 1 | 144 |
| Given | `layout edit mode is active` | 8 | 50 |
| Then | `layout edit mode should be inactive` | 1 | 61 |
| Then | `my current layout should be preserved` | 1 | 831 |
| Then | `no grid should be created` | 1 | 535 |
| Then | `only the character data should be imported` | 1 | 853 |
| Then | `the {string} option should be enabled` | 1 | 208 |
| Then | `the {string} section should appear before the {string} section` | 1 | 273 |
| Then | `the {string} section should still be at the top` | 1 | 383 |
| Then | `the character data should be imported` | 1 | 881 |
| Then | `the character should be imported normally` | 1 | 888 |
| Then | `the exported file should contain the layout configuration` | 1 | 720 |
| Then | `the layout from the imported file should be applied` | 1 | 861 |
| Then | `the layout should be saved` | 1 | 108 |
| Then | `the layout should return to the default arrangement` | 1 | 196 |
| Then | `the section should enter drag mode` | 1 | 917 |
| Then | `the sections should remain in single-column layout` | 1 | 555 |
| Then | `the sections should remain in the new order` | 1 | 119 |
| Then | `the visual indicators should be removed` | 1 | 73 |

## settings-gear.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am viewing an old version with the version navigator visible` | 1 | 116 |
| Given | `I am viewing the character sheet` | 1 | 10 |
| When | `I click outside the settings panel` | 1 | 65 |
| When | `I click the British flag icon` | 1 | 81 |
| When | `I click the German flag icon` | 2 | 76 |
| When | `I click the settings gear icon` | 1 | 42 |
| Given | `I have opened the settings panel` | 9 | 57 |
| Then | `I should be able to click the settings gear icon` | 1 | 29 |
| Then | `I should see a {string} option` | 1 | 132 |
| Then | `I should see a settings gear icon in the header` | 1 | 19 |
| Then | `I should see the settings panel` | 1 | 47 |
| Then | `the {string} option should be disabled` | 1 | 139 |
| Given | `the interface is in German` | 1 | 98 |
| Then | `the interface should display in English` | 1 | 92 |
| Then | `the interface should display in German` | 1 | 86 |
| Then | `the settings gear icon should still be visible` | 1 | 24 |
| Then | `the settings panel should close` | 4 | 52 |

## stat-pool-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `the character data is loaded` | 2 | 6 |

## version-comparison.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `comparison view is enabled in settings` | 23 | 43 |
| Then | `comparison view should show as enabled in settings` | 1 | 61 |
| Given | `I am using a phone-width viewport` | 1 | 432 |
| Given | `I am using a tablet-width viewport` | 1 | 436 |
| Given | `I am viewing the comparison view` | 19 | 70 |
| When | `I click the left pane's backward arrow` | 3 | 167 |
| When | `I click the left pane's backward arrow {int} time(s)` | 2 | 183 |
| When | `I click the left pane's forward arrow` | 1 | 171 |
| When | `I click the left pane's restore button` | 2 | 361 |
| When | `I click the return to editing button` | 2 | 405 |
| When | `I click the right pane's backward arrow` | 1 | 175 |
| When | `I click the right pane's backward arrow {int} time(s)` | 1 | 194 |
| When | `I click the right pane's forward arrow` | **0** | 179 |
| When | `I click the right pane's restore button` | 1 | 366 |
| When | `I close the settings panel` | 2 | 55 |
| When | `I enable comparison view in settings` | 2 | 47 |
| Then | `no add or delete button should be present in the comparison view` | 1 | 420 |
| Then | `no field in the comparison view should be editable` | 1 | 413 |
| Then | `the {string} field should be highlighted as changed in the {word} pane` | 2 | 277 |
| Then | `the {string} field should not be highlighted in the {word} pane` | 2 | 286 |
| Then | `the {word} pane should show the newly restored version` | 1 | 376 |
| Then | `the added cypher card should be highlighted as added in the right pane` | 1 | 295 |
| Given | `the character has a version where a cypher was renamed` | 1 | 147 |
| Given | `the character has a version with a modified cypher effect` | 1 | 128 |
| Given | `the character has a version with a name change` | 2 | 93 |
| Given | `the character has a version with a removed cypher` | 1 | 117 |
| Given | `the character has a version with an added cypher` | 1 | 103 |
| Then | `the comparison header should indicate there are no differences` | 1 | 266 |
| Then | `the comparison header should list every changed field, not just the top 3` | 1 | 241 |
| Then | `the comparison header should reflect the new left pane version` | 1 | 256 |
| Then | `the comparison view should be visible` | 3 | 75 |
| Then | `the comparison view should not be visible` | 3 | 79 |
| Then | `the left pane should not show the added cypher card` | 1 | 305 |
| Then | `the left pane should show version {int}` | 5 | 226 |
| Given | `the left pane shows version {int}` | 2 | 218 |
| Then | `the modified cypher card should be highlighted as changed in the {word} pane` | 2 | 327 |
| Then | `the new cypher name should be highlighted as added in the right pane` | 1 | 347 |
| Then | `the old cypher name should be highlighted as removed in the left pane` | 1 | 337 |
| Then | `the removed cypher card should be highlighted as removed in the left pane` | 1 | 310 |
| Then | `the right pane should not show the removed cypher card` | 1 | 320 |
| Then | `the right pane should show version {int}` | 4 | 230 |
| Then | `the right pane should still show the same character name as before the restore` | 1 | 386 |
| Given | `the right pane shows version {int}` | 1 | 222 |
| Then | `the right pane's restore button should be disabled` | 1 | 371 |

## version-history.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a new version should be created` | 1 | 881 |
| Then | `a new version should be created with description {string}` | 3 | 934 |
| Then | `all edit controls should be enabled` | 2 | 527 |
| Then | `both navigation arrows should be enabled` | 2 | 597 |
| Given | `I am viewing that version` | 3 | 302 |
| Given | `I am viewing the latest version` | 6 | 50 |
| Given | `I am viewing version {int}` | 8 | 55 |
| When | `I click the backward navigation arrow` | 17 | 383 |
| Then | `I click the backward navigation arrow {int} times` | 1 | 978 |
| When | `I click the backward navigation arrow again` | 1 | 390 |
| When | `I click the forward navigation arrow` | 3 | 402 |
| When | `I click the forward navigation arrow again` | 1 | 408 |
| When | `I click the restore button in the warning banner` | 3 | 414 |
| When | `I click the return to latest button` | 1 | 396 |
| When | `I create a new version by editing the name` | 1 | 496 |
| Given | `I have made buffered edits that were undone` | 2 | 311 |
| When | `I make {int} rapid edits that are buffered` | 1 | 1154 |
| When | `I navigate backward` | 1 | 460 |
| When | `I navigate forward twice` | 1 | 466 |
| When | `I navigate to version {int}` | 8 | 420 |
| When | `I press {string}` | 5 | 675 |
| When | `I press {string} again` | 2 | 1032 |
| When | `I press {string} again before the squash timer expires` | 2 | 1067 |
| When | `I press {string} before the squash timer expires` | 11 | 993 |
| When | `I press {string} to navigate to previous version` | 1 | 1225 |
| When | `I press {string} to undo buffered changes` | 1 | 1179 |
| When | `I rapidly click the backward arrow {int} times` | 1 | 474 |
| When | `I refresh the browser` | 6 | 488 |
| Then | `I should be viewing the latest version` | 3 | 887 |
| Then | `I should be viewing version {int}` | 1 | 1265 |
| Then | `I should navigate to version {int}` | 2 | 900 |
| Then | `I should see {int} versions in history` | 2 | 1134 |
| When | `I view the character sheet` | 2 | 376 |
| When | `I wait for {int} milliseconds` | 4 | 660 |
| When | `I wait for squash timer to complete` | 15 | 1220 |
| Then | `no new version should be created yet` | 2 | 1115 |
| Then | `no warning banner should be visible` | 6 | 546 |
| Then | `the backward arrow should be disabled` | 1 | 609 |
| Then | `the backward arrow should be enabled` | 3 | 551 |
| Then | `the change description should be displayed` | 1 | 579 |
| Then | `the changes should be reapplied` | 2 | 1142 |
| Then | `the character data should be correct for version {int}` | 1 | 910 |
| Then | `the character data should match version {int}` | 4 | 561 |
| Then | `the character data should match version {int} data` | 1 | 944 |
| Then | `the character equipment should match version {int} equipment` | 2 | 789 |
| Given | `the character has {int} versions in history` | 41 | 12 |
| Given | `the character has {int} versions with different data` | 3 | 199 |
| Given | `the character has {int} versions with different names` | 2 | 234 |
| Given | `the character has a legacy version with a {string} description for a name change and an added ability` | 1 | 169 |
| Given | `the character has a legacy version with an {string} description for an added cypher` | 1 | 137 |
| Given | `the character has a portrait image` | 2 | 263 |
| Given | `the character has a version from {int} minutes ago` | 1 | 276 |
| Given | `the character has a version with multiple basic info changes` | 2 | 102 |
| Given | `the character has a version with name change` | 1 | 69 |
| Given | `the character has no version history yet` | 4 | 7 |
| Then | `the character name should be {string}` | 8 | 1106 |
| Then | `the character name should match version {int} name` | 4 | 764 |
| Then | `the character name should revert to the original value` | 2 | 1124 |
| Then | `the character stats should match version {int} stats` | 2 | 776 |
| Then | `the exported file should contain version {int} data` | 1 | 825 |
| Then | `the exported file should not contain version history` | 1 | 848 |
| Then | `the exported file should use the current portrait` | 1 | 863 |
| Then | `the forward arrow should be disabled` | 4 | 556 |
| Then | `the forward arrow should be enabled` | 1 | 614 |
| Then | `the import button should be disabled` | 1 | 1288 |
| Then | `the import button should be enabled` | 2 | 1283 |
| Then | `the oldest version should have been removed` | 2 | 972 |
| Then | `the portrait should remain unchanged` | 3 | 813 |
| When | `the squash timer has completed` | 2 | 670 |
| Then | `the timestamp should be displayed` | 1 | 588 |
| Then | `the timestamp should be in human-readable format` | 1 | 744 |
| Then | `the timestamp should show a relative time like {string}` | 1 | 753 |
| Then | `the UI should remain responsive` | 2 | 924 |
| Then | `the undo buffer should contain exactly {int} changes` | 1 | 649 |
| Then | `the version counter should show {string}` | 25 | 538 |
| Then | `the version description should contain {string}` | 11 | 736 |
| Then | `the version description should contain the tier change` | 1 | 962 |
| Then | `the version navigator should be visible` | 4 | 533 |
| Then | `the version navigator should not be visible` | 2 | 521 |
| Then | `the warning banner should be visible` | 7 | 604 |
| Then | `the warning banner should contain text {string}` | 1 | 619 |
| Then | `the warning banner should have a restore button` | 1 | 627 |
| Then | `the warning banner should not be visible` | 2 | 957 |

