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

- Step definitions: **418** in 41 files
- Feature step lines: **1517**
- Definitions with no feature usage: **0**
- Feature lines matching no definition: **1**

| Step file | Definitions | Unused |
| --- | ---: | ---: |
| [ability-enhancements.steps.ts](#abilityenhancementsstepsts) | 11 | 0 |
| [additional-fields-editing.steps.ts](#additionalfieldseditingstepsts) | 5 | 0 |
| [additional-fields-textarea.steps.ts](#additionalfieldstextareastepsts) | 13 | 0 |
| [auto-save-indicator.steps.ts](#autosaveindicatorstepsts) | 13 | 0 |
| [basic-info-editing.steps.ts](#basicinfoeditingstepsts) | 12 | 0 |
| [card-deletion.steps.ts](#carddeletionstepsts) | 6 | 0 |
| [card-editing.steps.ts](#cardeditingstepsts) | 11 | 0 |
| [card-modal-focus-trap.steps.ts](#cardmodalfocustrapstepsts) | 9 | 0 |
| [card-reordering-abilities.steps.ts](#cardreorderingabilitiesstepsts) | 5 | 0 |
| [card-reordering.steps.ts](#cardreorderingstepsts) | 8 | 0 |
| [character-display.steps.ts](#characterdisplaystepsts) | 10 | 0 |
| [character-file-export.steps.ts](#characterfileexportstepsts) | 7 | 0 |
| [character-file-import.steps.ts](#characterfileimportstepsts) | 5 | 0 |
| [character-storage.steps.ts](#characterstoragestepsts) | 10 | 0 |
| [clock.steps.ts](#clockstepsts) | 1 | 0 |
| [collection-reordering.steps.ts](#collectionreorderingstepsts) | 4 | 0 |
| [combat.steps.ts](#combatstepsts) | 13 | 0 |
| [common-steps.ts](#commonstepsts) | 3 | 0 |
| [export-enhancement.steps.ts](#exportenhancementstepsts) | 16 | 0 |
| [grid-merge-split.steps.ts](#gridmergesplitstepsts) | 7 | 0 |
| [i18n.steps.ts](#i18nstepsts) | 7 | 0 |
| [import-error-messages.steps.ts](#importerrormessagesstepsts) | 2 | 0 |
| [layout-edit-mode.steps.ts](#layouteditmodestepsts) | 15 | 0 |
| [layout-import-export.steps.ts](#layoutimportexportstepsts) | 18 | 0 |
| [recovery-damage-track.steps.ts](#recoverydamagetrackstepsts) | 22 | 0 |
| [resource-tracker-editing.steps.ts](#resourcetrackereditingstepsts) | 7 | 0 |
| [section-columns.steps.ts](#sectioncolumnsstepsts) | 10 | 0 |
| [section-drop-preview.steps.ts](#sectiondroppreviewstepsts) | 11 | 0 |
| [section-reordering.steps.ts](#sectionreorderingstepsts) | 4 | 0 |
| [section-slide.steps.ts](#sectionslidestepsts) | 7 | 0 |
| [section-touch-drag.steps.ts](#sectiontouchdragstepsts) | 7 | 0 |
| [settings-gear.steps.ts](#settingsgearstepsts) | 17 | 0 |
| [sheet-toolbar.steps.ts](#sheettoolbarstepsts) | 5 | 0 |
| [stat-pool-editing.steps.ts](#statpooleditingstepsts) | 3 | 0 |
| [storage-failure.steps.ts](#storagefailurestepsts) | 8 | 0 |
| [third-party-requests.steps.ts](#thirdpartyrequestsstepsts) | 3 | 0 |
| [unreadable-character.steps.ts](#unreadablecharacterstepsts) | 10 | 0 |
| [value-editor.steps.ts](#valueeditorstepsts) | 18 | 0 |
| [version-comparison.steps.ts](#versioncomparisonstepsts) | 21 | 0 |
| [version-history.steps.ts](#versionhistorystepsts) | 52 | 0 |
| [viewport.steps.ts](#viewportstepsts) | 2 | 0 |

## ⚠️ Feature lines with no matching step definition

These would be reported as *undefined* by Cucumber (or are matched by a
pattern this script does not understand):

- `section-rearrangement.feature:52` — I drag the "Cyphers" section onto the middle <side> of the "Items" section

## ability-enhancements.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see the ability {string}` | 4 | 19 |
| Then | `the ability {string} should have {pool} pool styling` | 3 | 65 |
| Then | `the ability {string} should not show action indicator` | 1 | 58 |
| Then | `the ability {string} should not show cost badge` | 1 | 44 |
| Then | `the ability {string} should not show pool indicator` | 1 | 51 |
| Then | `the ability {string} should show action {string}` | 2 | 37 |
| Then | `the ability {string} should show cost {string}` | 2 | 23 |
| Then | `the ability {string} should show pool {string}` | 2 | 30 |
| Given | `the character has abilities with different pools:` | 1 | 10 |
| Given | `the character has an ability {string} with:` | 4 | 3 |
| Then | `the empty state should use translation keys` | 1 | 72 |

## additional-fields-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I choose {string} as my character type` | 2 | 10 |
| Then | `my character type shows as {string}` | 5 | 14 |
| Given | `my character's {textarea} reads {string}` | 12 | 3 |
| Then | `the character type is labelled {string}` | 1 | 25 |
| Then | `the character types to choose from are {string}, {string}, {string}` | 1 | 18 |

## additional-fields-textarea.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I can edit my {textarea}` | 2 | 64 |
| Then | `I can still edit my {textarea}` | 1 | 68 |
| When | `I click away from my {textarea}` | 1 | 53 |
| When | `I click my {textarea}` | 5 | 38 |
| When | `I tap my {textarea}` | 1 | 42 |
| When | `I type {string} in my {textarea}` | 3 | 46 |
| When | `I write {int} characters as my {textarea}` | 1 | 10 |
| When | `I write {string} as my {textarea}` | 3 | 3 |
| Then | `my {textarea} cannot be edited yet and looks clickable` | 3 | 57 |
| Then | `my {textarea} holds all {int} characters` | 2 | 24 |
| Then | `my {textarea} reads {string}` | 14 | 17 |
| Then | `my empty {textarea} invites me to write with {string}` | 3 | 31 |
| Then | `the on-screen keyboard comes up` | 1 | 72 |

## auto-save-indicator.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I note the current save timestamp` | 1 | 7 |
| When | `I rapidly edit the character name multiple times` | 1 | 15 |
| When | `I wait for {int} second(s)` | 1 | 11 |
| Given | `the character sheet is displayed` | 6 | 3 |
| Then | `the character should be saved exactly once after changes stop` | 1 | 38 |
| Then | `the save indicator should be in the lower-right corner` | 1 | 50 |
| Then | `the save indicator should be visible` | 2 | 19 |
| Then | `the save indicator should contain {string}` | 3 | 27 |
| Then | `the save indicator should have subtle styling` | 1 | 54 |
| Then | `the save indicator should show a single timestamp` | 1 | 42 |
| Then | `the save indicator should show a timestamp` | 1 | 23 |
| Then | `the save indicator should still be visible` | 1 | 46 |
| Then | `the save timestamp should be updated` | 2 | 34 |

## basic-info-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I change my {word} to {string}` | 46 | 14 |
| When | `I change my {word} to {string} without waiting for the auto-save` | 1 | 40 |
| When | `I change my tier to {int}` | 4 | 21 |
| When | `I try to change my {word} to nothing` | 1 | 25 |
| Then | `my {word} looks clickable` | 1 | 62 |
| Given | `my character has no {word}` | 2 | 51 |
| Then | `my character sheet shows my {word} as {string}` | 32 | 33 |
| Then | `my character sheet shows my tier as {int}` | 4 | 47 |
| Then | `my character sheet shows the placeholder for my {word}` | 1 | 55 |
| Given | `my character's {word} is {string}` | 11 | 3 |
| Given | `my character's tier is {int}` | 2 | 10 |
| Then | `the change is refused` | 2 | 29 |

## card-deletion.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `{string} is still gone the next time I open my character` | 1 | 21 |
| When | `I discard {string}` | 3 | 10 |
| Then | `it was discarded without my being asked to confirm` | 1 | 28 |
| Given | `my character has the {cardKind} {string} and {string}` | 6 | 3 |
| Then | `my character's {cardKind} are only {string}` | 3 | 14 |
| Then | `the discard control of {string} is in the top-left corner of its entry` | 1 | 32 |

## card-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I cancel the card` | 1 | 32 |
| When | `I open my character again` | 16 | 36 |
| When | `I save the card` | 23 | 28 |
| When | `I set its {word} to {string}` | 68 | 21 |
| When | `I start a new {cardType}` | 23 | 10 |
| When | `I start editing the {cardType} {string}` | 7 | 14 |
| Then | `my character carries {int} {cardKind}` | 19 | 47 |
| Then | `my character carries the {cardType} {string}` | 15 | 54 |
| Given | `my character has {int} {cardKind}` | 21 | 3 |
| Then | `the {cardType} {string} shows {string}` | 10 | 61 |
| Then | `the add {cardType} button has a themed background colour` | 7 | 40 |

## card-modal-focus-trap.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I press Escape in the card editor` | 1 | 22 |
| When | `I press Shift+Tab {int} time(s)` | 1 | 18 |
| When | `I press the Tab key {int} time(s)` | 2 | 3 |
| When | `I tab backwards through every control of the card editor twice` | 1 | 11 |
| When | `I tab through every control of the card editor twice` | 1 | 7 |
| Then | `the {word} field has focus` | 1 | 38 |
| Then | `the card editor closes` | 1 | 26 |
| Then | `the first field of the card editor has focus` | 4 | 30 |
| Then | `the last control of the card editor has focus` | 1 | 34 |

## card-reordering-abilities.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag ability {string} before ability {string}` | 2 | 10 |
| When | `I drag ability {string} onto cypher {string}` | 1 | 34 |
| When | `I drag cypher {string} into the abilities section` | 1 | 27 |
| Then | `the abilities should be in order {string}` | 5 | 20 |
| Given | `the character has {int} abilities named {string}` | 5 | 3 |

## card-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag cypher {string} after cypher {string}` | 1 | 25 |
| When | `I drag cypher {string} before cypher {string}` | 3 | 18 |
| When | `I hover over cypher {string}` | 1 | 36 |
| When | `I start dragging cypher {string}` | 2 | 32 |
| Given | `the character has {int} cyphers named {string}` | 9 | 11 |
| Then | `the cypher {string} should have a dragging visual state` | 1 | 47 |
| Then | `the cyphers should be in order {string}` | 7 | 40 |
| Then | `the cyphers should be visually in order {string}, {string}, {string}` | 1 | 54 |

## character-display.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am on the character sheet page` | 23 | 14 |
| Given | `my character has every kind of entry` | 1 | 29 |
| Given | `my character has these stats:` | 1 | 25 |
| Given | `my character has this basic information:` | 1 | 18 |
| Then | `my character sheet lists its sections in this order:` | 1 | 62 |
| Then | `my character sheet shows these stats:` | 1 | 40 |
| Then | `my character sheet's editable values and add controls have translated accessible labels` | 1 | 48 |
| Given | `my character's name is {int} characters long without spaces` | 1 | 33 |
| Then | `my character's name is shown as plain text, not as markup` | 1 | 55 |
| Then | `nothing on my character sheet is left untranslated` | 1 | 44 |

## character-file-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I export my character` | 10 | 7 |
| Given | `the character has name {string}` | 3 | 3 |
| Then | `the exported file should contain all character properties` | 1 | 18 |
| Then | `the exported file should have an exportDate` | 1 | 39 |
| Then | `the exported file should have schemaVersion {string}` | 1 | 32 |
| Then | `the exported file should have version {string}` | 1 | 25 |
| Then | `the exported filename should be {string}` | 2 | 11 |

## character-file-import.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I import a character file with tier {int}` | 1 | 21 |
| When | `I import a valid character file {string}` | 4 | 3 |
| Then | `none of the sample character's entries are left` | 1 | 17 |
| Then | `the character {string} should still be displayed` | 1 | 10 |
| Then | `the tier should have been adjusted to {string}` | 1 | 25 |

## character-storage.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character is currently displayed` | 1 | 3 |
| Then | `all of the character's entries and notes are shown` | 5 | 35 |
| Then | `all sections should display empty state messages` | 2 | 11 |
| When | `I click the "Load" button` | 2 | 24 |
| Given | `I have loaded the sample character` | 1 | 19 |
| Then | `the character {string} should be displayed` | 3 | 28 |
| Given | `the character sheet is empty` | 5 | 15 |
| Then | `the character sheet should show empty states` | 2 | 7 |
| Then | `the character should be displayed` | 1 | 39 |
| Then | `the same character should still be displayed` | 1 | 43 |

## clock.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `{int} minute(s) pass` | 2 | 5 |

## collection-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag {string} after {string} in the {string} collection` | 1 | 17 |
| When | `I drag {string} before {string} in the {string} collection` | 1 | 10 |
| Given | `the {string} collection holds {string}` | 2 | 3 |
| Then | `the {string} collection should be in order {string}` | 2 | 24 |

## combat.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I view my character on a phone` | 1 | 30 |
| Given | `I view my character on a wide screen` | 1 | 26 |
| Given | `my character has an attack whose name is {int} characters long without spaces` | 1 | 19 |
| Given | `my character has the {cardType} {string}` | 3 | 12 |
| Given | `my character has the {cardType} {string} with:` | 3 | 5 |
| Then | `my character's {cardKind} section says it is empty` | 8 | 55 |
| Then | `my character's attack keeps its badges at the right edge of its card` | 1 | 83 |
| Then | `the {cardKind} section sits above the {cardKind} section` | 1 | 76 |
| Then | `the {cardKind} section sits left of the {cardKind} section` | 1 | 69 |
| Then | `the {cardType} {string} is themed {word}` | 2 | 48 |
| Then | `the {cardType} {string} shows {word} {string}` | 12 | 34 |
| Then | `the {cardType} {string} shows no {word}` | 1 | 41 |
| Then | `the attacks section shows my character's armor of {int}` | 1 | 62 |

## common-steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the "New" button` | 2 | 3 |
| When | `I reload the page` | 21 | 7 |
| When | `I reload the page immediately` | 1 | 11 |

## export-enhancement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file named like {string} should be downloaded` | 1 | 46 |
| When | `I cancel the file save dialog` | 1 | 15 |
| When | `I click the Quick Export button` | 1 | 19 |
| When | `I click the Save As button` | 1 | 23 |
| Then | `I should be asked where to save a file named like {string}` | 1 | 39 |
| Then | `I should not see an {string} button` | 1 | 35 |
| Then | `I should see a {string} button` | 2 | 31 |
| Then | `I should see an {string} button` | 2 | 27 |
| When | `I view the export buttons` | 1 | 11 |
| Given | `my browser does not support File System Access API` | 1 | 7 |
| Given | `my browser supports File System Access API` | 5 | 3 |
| Then | `no file should be saved` | 1 | 57 |
| Then | `the Export button should still be visible` | 1 | 61 |
| Then | `the export dialog should be triggered` | 1 | 69 |
| Then | `the file should be saved without prompting` | 1 | 65 |
| Then | `the saved file should be a well-formed character file` | 2 | 53 |

## grid-merge-split.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `{string} and {string} are in a grid` | 4 | 36 |
| Then | `{string} should be in its own row` | 9 | 43 |
| When | `I drag the {string} section onto the {zone} of the {string} section` | 11 | 4 |
| Then | `the {string} section should be the last section` | 2 | 29 |
| Then | `the grid should show {string} on the left and {string} on the right` | 7 | 11 |
| Then | `the layout should still be the default layout` | 3 | 18 |
| Then | `the saved layout should pair {string} on the left and {string} on the right` | 1 | 22 |

## i18n.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am on the character sheet page with {string}` | 8 | 7 |
| When | `I navigate to the page with {string}` | 1 | 14 |
| Given | `the language is set to {string}` | 5 | 3 |
| Then | `the language should remain German` | 1 | 25 |
| Then | `the page should declare its language as {string}` | 2 | 33 |
| Then | `the page title should be in English` | 2 | 21 |
| Then | `the sheet shows these texts:` | 4 | 29 |

## import-error-messages.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I import a file without character data` | 2 | 3 |
| Then | `the alert should read {string}` | 2 | 7 |

## layout-edit-mode.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the Edit Layout button` | 1 | 3 |
| When | `I click the Exit Edit Layout button` | 2 | 7 |
| When | `I click the Reset Layout button` | 1 | 11 |
| Given | `I have customized the layout` | 8 | 46 |
| Given | `I have the default layout` | 5 | 71 |
| Given | `I open the settings panel` | 2 | 59 |
| Then | `I should see layout edit mode is active` | 1 | 15 |
| Then | `I should see the {string} button` | 1 | 38 |
| Then | `I should see visual indicators on rearrangeable sections` | 1 | 19 |
| Then | `it should be touch-friendly` | 1 | 42 |
| Given | `layout edit mode is active` | 34 | 26 |
| Then | `layout edit mode should be inactive` | 1 | 30 |
| Then | `the {string} option should be enabled` | 1 | 67 |
| Then | `the layout should return to the default arrangement` | 1 | 63 |
| Then | `the visual indicators should be removed` | 1 | 34 |

## layout-import-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I choose to {string}` | 5 | 85 |
| When | `I dismiss the layout choice prompt with the Escape key` | 1 | 66 |
| Given | `I have a character file with a different layout` | 5 | 10 |
| Given | `I have a character file with the default layout` | 1 | 14 |
| Given | `I have a character file with the default layout that sets the {string} section to {int} column(s)` | 1 | 22 |
| Given | `I have a character file with the default layout that sets the {string} section to {int} column(s) and an unknown section to {int} column(s)` | 2 | 29 |
| Given | `I have a character file without a layout` | 1 | 18 |
| Given | `I have saved the {string} section as {int} column(s) and an unknown section as {int} column(s)` | 1 | 47 |
| Given | `I have set the {string} section to {int} column(s)` | 2 | 40 |
| When | `I import the character file` | 10 | 54 |
| Then | `I should not see a layout choice prompt` | 5 | 70 |
| Then | `I should see a layout choice prompt` | 1 | 62 |
| Then | `I should see options to {string} or {string}` | 1 | 74 |
| Then | `the {string} option should have focus` | 1 | 81 |
| Then | `the {string} section should be set to {int} column(s)` | 3 | 93 |
| Then | `the exported file should contain the layout configuration` | 1 | 3 |
| Then | `the import note should read {string}` | 1 | 58 |
| Then | `the imported character should be shown` | 5 | 89 |

## recovery-damage-track.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all recovery checkboxes should be unchecked` | 1 | 108 |
| When | `I change my recovery modifier to {int}` | 1 | 112 |
| When | `I click the {string} recovery checkbox` | 1 | 116 |
| When | `I select the {string} damage status` | 1 | 123 |
| Then | `I should see {int} damage status options` | 1 | 49 |
| Then | `I should see {int} recovery roll checkboxes` | 1 | 14 |
| Then | `I should see {string} in the recovery section` | 3 | 97 |
| Then | `I should see a section titled {string}` | 2 | 3 |
| Then | `I should see damage status {string}` | 1 | 53 |
| Then | `I should see damage status {string} with description {string}` | 2 | 57 |
| Then | `I should see recovery roll {string} with time {string}` | 4 | 21 |
| Then | `I should see the recovery modifier display {string}` | 1 | 7 |
| Then | `the {string} radio button should be selected` | 4 | 68 |
| Then | `the {string} radio button should not be selected` | 6 | 75 |
| Then | `the {string} recovery checkbox should be checked` | 2 | 35 |
| Then | `the {string} recovery checkbox should be unchecked` | 3 | 42 |
| Given | `the character has {string} recovery used` | 1 | 28 |
| Given | `the character has recovery modifier {int}` | 2 | 90 |
| Given | `the character is {string}` | 3 | 64 |
| Given | `the character is new` | 1 | 104 |
| Then | `the damage track section should have red styling` | 1 | 86 |
| Then | `the recovery rolls section should have green styling` | 1 | 82 |

## resource-tracker-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I am told why` | 1 | 45 |
| When | `I change my {resourceName} to {int}` | 7 | 24 |
| When | `I try to change my {resourceName} to {string}` | 1 | 31 |
| Given | `my character has {int} current XP and {int} total XP` | 3 | 3 |
| Then | `my character sheet shows my {resourceName} as {int}` | 12 | 38 |
| Given | `my character was saved with a single legacy XP value of {int}` | 1 | 10 |
| Given | `my character's {resourceName} is {int}` | 7 | 17 |

## section-columns.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `every ability card's badges should stay inside the card` | 1 | 63 |
| When | `I switch the {string} section to {int} column\(s)` | 1 | 17 |
| Then | `the {string} heading row should stay inside its frame` | 1 | 56 |
| Then | `the {string} section should offer a column switch` | 1 | 24 |
| Then | `the {string} section should offer no column switch` | 3 | 31 |
| Then | `the {string} section should show its cards in {int} column\(s)` | 8 | 3 |
| Then | `the {word} pane should show its cyphers in {int} column\(s)` | 1 | 10 |
| Then | `the armor badge should not cover the add attack button` | 1 | 52 |
| Then | `the max cyphers badge should be left of the {string} heading` | 1 | 38 |
| Then | `the shins badge should be left of the {string} heading` | 1 | 45 |

## section-drop-preview.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I hold the {string} section over the {zone} of the {string} section` | 11 | 4 |
| When | `I hold the {string} section over the {zone} of the {string} section as the window shows it` | 1 | 11 |
| When | `I keep still for a moment` | 9 | 32 |
| When | `I release the section outside the sheet` | 2 | 36 |
| When | `I release the section where it is` | 1 | 40 |
| Then | `no drop preview should be shown` | 1 | 65 |
| Given | `the {string} section is at the top of the window` | 1 | 18 |
| Then | `the {string} section should not have moved up or down on screen` | 1 | 25 |
| Then | `the {string} section should preview {string} in its place` | 1 | 51 |
| Then | `the {string} section should preview {string} on its right` | 1 | 44 |
| Then | `the row of {string} should preview {string} below it` | 1 | 58 |

## section-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I exit layout edit mode` | 2 | 17 |
| Given | `I have moved the {string} section to the top` | 1 | 10 |
| Then | `the {string} section should appear before the {string} section` | 20 | 3 |
| Then | `the {string} section should still be at the top` | 1 | 21 |

## section-slide.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drop the held section onto the {zone} of the {string} section` | 1 | 12 |
| Given | `I prefer reduced motion` | 1 | 8 |
| Then | `no section should have slid` | 1 | 40 |
| Given | `section slides are recorded` | 4 | 4 |
| Then | `the {string} section should be drawn above the {string} section while they slide` | 1 | 33 |
| Then | `the {string} section should slide back to where it was` | 1 | 26 |
| Then | `the {string} section should slide into its new place` | 4 | 19 |

## section-touch-drag.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag it above the {string} section and release it` | 2 | 29 |
| When | `I long-press the {string} section` | 1 | 4 |
| When | `I long-press the {string} section and hold it at the top edge until the {string} section is on screen` | 1 | 15 |
| When | `I long-press the {string} section and hold it over the {zone} of the {string} section until the sheet shows the result` | 1 | 22 |
| When | `I swipe from the {string} section towards the {string} section` | 1 | 36 |
| Then | `the {string} section should be in drag mode` | 1 | 8 |
| Then | `the page should have scrolled` | 1 | 43 |

## settings-gear.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am viewing the character sheet` | 1 | 3 |
| When | `I click outside the settings panel` | 1 | 31 |
| When | `I click the British flag icon` | 1 | 43 |
| When | `I click the German flag icon` | 1 | 39 |
| When | `I click the settings gear icon` | 3 | 15 |
| Given | `I have opened the settings panel` | 5 | 27 |
| When | `I press the Escape key` | 2 | 35 |
| Then | `I should see a {string} option` | 1 | 63 |
| Then | `I should see a settings gear icon in the header` | 1 | 11 |
| Then | `I should see the settings panel` | 3 | 19 |
| When | `I switch to German` | 4 | 55 |
| Then | `the {string} option should be disabled` | 1 | 67 |
| Given | `the browser offers no secure-origin cryptography` | 1 | 7 |
| Given | `the interface is in German` | 1 | 59 |
| Then | `the interface should display in English` | 1 | 51 |
| Then | `the interface should display in German` | 1 | 47 |
| Then | `the settings panel should close` | 4 | 23 |

## sheet-toolbar.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I scroll to the bottom of the page` | 1 | 3 |
| Then | `the Edit Layout button should be in view` | 1 | 25 |
| Then | `the Edit Layout button should not overlap the character sheet` | 1 | 14 |
| Then | `the version navigator should be in view` | 1 | 21 |
| Then | `the version navigator should not overlap the character sheet` | 1 | 7 |

## stat-pool-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I change my {stat} {word} to {int}` | 4 | 10 |
| Then | `my character sheet shows my {stat} {word} as {int}` | 7 | 17 |
| Given | `my character's {stat} {word} is {int}` | 4 | 3 |

## storage-failure.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `the browser storage is full` | 5 | 3 |
| When | `the browser storage works again` | 1 | 11 |
| Then | `the save indicator should be inside the viewport` | 1 | 37 |
| Then | `the save indicator should not contain {string}` | 1 | 30 |
| Then | `the save indicator should not report a storage problem` | 1 | 26 |
| Then | `the save indicator should report that changes could not be saved` | 1 | 19 |
| Then | `the save indicator should report that storage is full` | 5 | 15 |
| Given | `writing to the browser storage fails` | 1 | 7 |

## third-party-requests.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I open the character sheet and watch its requests` | 2 | 3 |
| Then | `nothing should have been requested from another site` | 1 | 7 |
| Then | `the {string} and {string} fonts should be loaded` | 1 | 11 |

## unreadable-character.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I choose {string} for the unreadable character` | 2 | 28 |
| When | `I download the unreadable character` | 1 | 35 |
| Then | `I should be asked what to do with the unreadable character` | 4 | 17 |
| Then | `I should not be asked about an unreadable character` | 4 | 24 |
| Then | `no unreadable data should be kept` | 2 | 60 |
| Given | `the browser holds the unparseable character text {string}` | 1 | 10 |
| Then | `the downloaded file should be named like {string}` | 1 | 39 |
| Then | `the downloaded file should contain exactly {string}` | 1 | 46 |
| Then | `the kept unreadable data should be {string}` | 4 | 53 |
| Given | `the stored character data is the unreadable text {string}` | 4 | 3 |

## value-editor.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I cancel the value editor` | 1 | 19 |
| When | `I click my {word} {word}` | 11 | 3 |
| When | `I click outside the value editor` | 1 | 35 |
| When | `I enter {int} in the value editor` | 4 | 7 |
| When | `I press Enter in the value editor` | 1 | 11 |
| When | `I press Escape in the value editor` | 1 | 15 |
| Then | `my {word} {word} is big enough to tap` | 1 | 77 |
| Then | `my {word} {word} looks clickable` | 1 | 70 |
| Then | `the value editor dims the sheet behind it` | 1 | 54 |
| Then | `the value editor fits the screen` | 1 | 62 |
| Then | `the value editor has an icon on its confirm and cancel buttons` | 1 | 47 |
| Then | `the value editor has the keyboard focus` | 1 | 27 |
| Then | `the value editor is a dialog` | 1 | 58 |
| Then | `the value editor is closed` | 4 | 31 |
| Then | `the value editor is open showing {int}` | 1 | 23 |
| Then | `the value editor keeps the keyboard focus inside itself` | 1 | 43 |
| Then | `the value editor shows a numeric keypad` | 1 | 39 |
| Then | `the value editor's controls are big enough to tap` | 1 | 66 |

## version-comparison.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `comparison view is still switched on in settings` | 1 | 45 |
| Given | `comparison view is switched on in settings` | 18 | 4 |
| Given | `I am viewing the comparison view` | 14 | 12 |
| When | `I move the {pane} pane to version {int}` | 4 | 30 |
| When | `I restore the version in the {pane} pane` | 2 | 37 |
| When | `I return to editing` | 2 | 41 |
| When | `I step the {pane} pane back to the previous version` | 3 | 16 |
| When | `I step the {pane} pane forward to the next version` | 1 | 23 |
| When | `I switch on comparison view in settings` | 2 | 8 |
| Then | `my history gains a version restored from version {int}` | 2 | 64 |
| Then | `the {pane} pane does not show the cypher {string}` | 2 | 103 |
| Then | `the {pane} pane shows the background {string}` | 1 | 110 |
| Then | `the {pane} pane shows the notes {string}` | 1 | 117 |
| Then | `the {pane} pane shows version {int}` | 8 | 57 |
| Then | `the {word} is highlighted yellow in both panes` | 1 | 82 |
| Then | `the comparison header lists exactly these changes` | 3 | 71 |
| Then | `the comparison header says there are no differences` | 1 | 78 |
| Then | `the comparison view is not shown` | 3 | 53 |
| Then | `the comparison view is shown` | 3 | 49 |
| Then | `the cypher {string} is highlighted {colour} in both panes` | 1 | 96 |
| Then | `the cypher {string} is highlighted {colour} in the {pane} pane` | 2 | 89 |

## version-history.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I am not warned about an old version` | 5 | 166 |
| Then | `I am on the latest version` | 3 | 174 |
| Then | `I am warned that I am viewing an old version` | 7 | 162 |
| Then | `I can edit my character` | 2 | 135 |
| Then | `I can import a character` | 2 | 120 |
| Then | `I can restore this version` | 1 | 170 |
| Then | `I cannot import a character` | 1 | 124 |
| When | `I export what I am viewing` | 1 | 112 |
| When | `I go to the oldest version` | 1 | 57 |
| When | `I go to version {int}` | 15 | 53 |
| When | `I redo with Ctrl+Shift+Z` | 1 | 104 |
| When | `I redo with Ctrl+Y` | 8 | 100 |
| When | `I reopen my character` | 10 | 108 |
| When | `I restore this version` | 3 | 76 |
| When | `I return to the latest version` | 1 | 80 |
| Then | `I see my character as it was in version {int}` | 12 | 200 |
| When | `I step back {int} times in quick succession` | 1 | 69 |
| When | `I step back to the previous version` | 23 | 61 |
| When | `I step forward to the next version` | 4 | 65 |
| When | `I undo with Ctrl+Z` | 19 | 96 |
| Given | `my character has a history of {int} versions` | 43 | 10 |
| Given | `my character has a history of {int} versions with different data` | 1 | 17 |
| Given | `my character has a portrait` | 3 | 49 |
| Given | `my character has no history yet` | 5 | 3 |
| Then | `my character sheet shows the name it had before my edits` | 3 | 128 |
| When | `my edits have settled into a version` | 20 | 84 |
| When | `my edits start to be saved as a version` | 1 | 88 |
| Given | `my history has a version in which I added the cypher {string}` | 2 | 244 |
| Given | `my history has a version in which I changed my name to {string}, followed by one in which I changed my tier to {int}` | 1 | 230 |
| Given | `my history has a version in which I changed the effect of the cypher {string}` | 1 | 258 |
| Given | `my history has a version in which I cleared my background and notes` | 1 | 237 |
| Given | `my history has a version in which I removed the cypher {string}` | 1 | 251 |
| Given | `my history holds an old version recorded as {string} for a name change and an added ability` | 1 | 38 |
| Given | `my history holds an old version recorded as {string} for an added cypher` | 2 | 31 |
| Given | `my Might pool went from {int} to {int} to {int}` | 1 | 24 |
| Then | `my portrait is unchanged` | 3 | 211 |
| Given | `saving a version is held up` | 1 | 45 |
| Then | `the back control is available` | 4 | 146 |
| Then | `the back control is unavailable` | 1 | 150 |
| Then | `the export carries no version history` | 1 | 222 |
| Then | `the export holds version {int} of my character` | 1 | 215 |
| Then | `the export keeps my current portrait` | 1 | 226 |
| Then | `the forward control is available` | 3 | 154 |
| Then | `the forward control is unavailable` | 3 | 158 |
| When | `the held-up save goes through` | 1 | 92 |
| Then | `the navigator dates this version` | 1 | 189 |
| Then | `the navigator describes this version` | 1 | 178 |
| Then | `the navigator describes this version as {string}` | 12 | 182 |
| Then | `the navigator gives the age of this version as {string}` | 2 | 193 |
| Then | `the navigator is hidden` | 2 | 116 |
| Then | `the navigator shows version {int} of {int}` | 29 | 139 |
| Then | `the original version has been dropped` | 1 | 207 |

## viewport.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `the page should not scroll horizontally` | 2 | 12 |
| Given | `the viewport is {int} pixels wide` | 41 | 9 |

