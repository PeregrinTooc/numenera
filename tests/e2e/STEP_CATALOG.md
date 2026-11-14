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

- Step definitions: **554** in 52 files
- Feature step lines: **1863**
- Definitions with no feature usage: **0**
- Feature lines matching no definition: **1**

| Step file | Definitions | Unused |
| --- | ---: | ---: |
| [ability-enhancements.steps.ts](#abilityenhancementsstepsts) | 13 | 0 |
| [additional-fields-editing.steps.ts](#additionalfieldseditingstepsts) | 5 | 0 |
| [additional-fields-textarea.steps.ts](#additionalfieldstextareastepsts) | 13 | 0 |
| [auto-save-indicator.steps.ts](#autosaveindicatorstepsts) | 13 | 0 |
| [basic-info-editing.steps.ts](#basicinfoeditingstepsts) | 11 | 0 |
| [card-deletion.steps.ts](#carddeletionstepsts) | 6 | 0 |
| [card-editing.steps.ts](#cardeditingstepsts) | 12 | 0 |
| [card-modal-focus-trap.steps.ts](#cardmodalfocustrapstepsts) | 8 | 0 |
| [card-reordering-abilities.steps.ts](#cardreorderingabilitiesstepsts) | 5 | 0 |
| [card-reordering.steps.ts](#cardreorderingstepsts) | 8 | 0 |
| [character-display.steps.ts](#characterdisplaystepsts) | 33 | 0 |
| [character-file-export.steps.ts](#characterfileexportstepsts) | 8 | 0 |
| [character-file-import.steps.ts](#characterfileimportstepsts) | 3 | 0 |
| [character-storage.steps.ts](#characterstoragestepsts) | 10 | 0 |
| [collection-reordering.steps.ts](#collectionreorderingstepsts) | 4 | 0 |
| [combat.steps.ts](#combatstepsts) | 13 | 0 |
| [common-steps.ts](#commonstepsts) | 15 | 0 |
| [data-validation.steps.ts](#datavalidationstepsts) | 7 | 0 |
| [empty-fields-visibility.steps.ts](#emptyfieldsvisibilitystepsts) | 13 | 0 |
| [export-enhancement.steps.ts](#exportenhancementstepsts) | 21 | 0 |
| [grid-merge-split.steps.ts](#gridmergesplitstepsts) | 7 | 0 |
| [i18n.steps.ts](#i18nstepsts) | 30 | 0 |
| [import-error-messages.steps.ts](#importerrormessagesstepsts) | 2 | 0 |
| [layout-edit-mode.steps.ts](#layouteditmodestepsts) | 15 | 0 |
| [layout-import-export.steps.ts](#layoutimportexportstepsts) | 15 | 0 |
| [recovery-damage-track.steps.ts](#recoverydamagetrackstepsts) | 25 | 0 |
| [resource-tracker-editing.steps.ts](#resourcetrackereditingstepsts) | 7 | 0 |
| [section-columns.steps.ts](#sectioncolumnsstepsts) | 8 | 0 |
| [section-drop-preview.steps.ts](#sectiondroppreviewstepsts) | 11 | 0 |
| [section-reordering.steps.ts](#sectionreorderingstepsts) | 7 | 0 |
| [section-slide.steps.ts](#sectionslidestepsts) | 7 | 0 |
| [section-touch-drag.steps.ts](#sectiontouchdragstepsts) | 7 | 0 |
| [settings-gear.steps.ts](#settingsgearstepsts) | 18 | 0 |
| [sheet-toolbar.steps.ts](#sheettoolbarstepsts) | 5 | 0 |
| [stat-pool-editing.steps.ts](#statpooleditingstepsts) | 3 | 0 |
| [storage-failure.steps.ts](#storagefailurestepsts) | 8 | 0 |
| [third-party-requests.steps.ts](#thirdpartyrequestsstepsts) | 3 | 0 |
| [unreadable-character.steps.ts](#unreadablecharacterstepsts) | 10 | 0 |
| [value-editor.steps.ts](#valueeditorstepsts) | 18 | 0 |
| [version-comparison-highlighting.steps.ts](#versioncomparisonhighlightingstepsts) | 17 | 0 |
| [version-comparison-navigation.steps.ts](#versioncomparisonnavigationstepsts) | 12 | 0 |
| [version-comparison-setup.steps.ts](#versioncomparisonsetupstepsts) | 12 | 0 |
| [version-history-assertions.steps.ts](#versionhistoryassertionsstepsts) | 22 | 0 |
| [version-history-buffer-undo-redo.steps.ts](#versionhistorybufferundoredostepsts) | 8 | 0 |
| [version-history-given-basic.steps.ts](#versionhistorygivenbasicstepsts) | 9 | 0 |
| [version-history-given-data.steps.ts](#versionhistorygivendatastepsts) | 5 | 0 |
| [version-history-mixed-undo-redo.steps.ts](#versionhistorymixedundoredostepsts) | 5 | 0 |
| [version-history-navigation.steps.ts](#versionhistorynavigationstepsts) | 13 | 0 |
| [version-history-navigator-state.steps.ts](#versionhistorynavigatorstatestepsts) | 16 | 0 |
| [version-history-shortcuts.steps.ts](#versionhistoryshortcutsstepsts) | 4 | 0 |
| [version-history-squash-race.steps.ts](#versionhistorysquashracestepsts) | 3 | 0 |
| [viewport.steps.ts](#viewportstepsts) | 1 | 0 |

## ⚠️ Feature lines with no matching step definition

These would be reported as *undefined* by Cucumber (or are matched by a
pattern this script does not understand):

- `section-rearrangement.feature:52` — I drag the "Cyphers" section onto the middle <side> of the "Items" section

## ability-enhancements.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see the ability {string}` | 4 | 31 |
| Then | `the ability {string} should have intellect pool styling` | 1 | 98 |
| Then | `the ability {string} should have might pool styling` | 1 | 84 |
| Then | `the ability {string} should have speed pool styling` | 1 | 91 |
| Then | `the ability {string} should not show action indicator` | 1 | 78 |
| Then | `the ability {string} should not show cost badge` | 1 | 66 |
| Then | `the ability {string} should not show pool indicator` | 1 | 72 |
| Then | `the ability {string} should show action {string}` | 2 | 56 |
| Then | `the ability {string} should show cost {string}` | 2 | 36 |
| Then | `the ability {string} should show pool {string}` | 2 | 46 |
| Given | `the character has abilities with different pools:` | 1 | 22 |
| Given | `the character has an ability {string} with:` | 4 | 8 |
| Then | `the empty state should use translation keys` | 1 | 108 |

## additional-fields-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I choose {string} as my character type` | 2 | 10 |
| Then | `my character type shows as {string}` | 4 | 14 |
| Given | `my character's {textarea} reads {string}` | 10 | 3 |
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
| Then | `my {textarea} reads {string}` | 10 | 17 |
| Then | `my empty {textarea} invites me to write with {string}` | 1 | 31 |
| Then | `the on-screen keyboard comes up` | 1 | 72 |

## auto-save-indicator.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I note the current save timestamp` | 1 | 9 |
| When | `I rapidly edit the character name multiple times` | 1 | 19 |
| When | `I wait for {int} second(s)` | 1 | 15 |
| Given | `the character sheet is displayed` | 6 | 4 |
| Then | `the character should be saved only once after changes stop` | 1 | 96 |
| Then | `the save indicator should be in the lower-right corner` | 1 | 119 |
| Then | `the save indicator should be visible` | 2 | 66 |
| Then | `the save indicator should contain {string}` | 3 | 79 |
| Then | `the save indicator should have subtle styling` | 1 | 138 |
| Then | `the save indicator should show a single timestamp` | 1 | 106 |
| Then | `the save indicator should show a timestamp` | 1 | 71 |
| Then | `the save indicator should still be visible` | 1 | 114 |
| Then | `the save timestamp should be updated` | 2 | 87 |

## basic-info-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I change my {word} to {string}` | 5 | 14 |
| When | `I change my tier to {int}` | 3 | 21 |
| When | `I try to change my {word} to nothing` | 1 | 25 |
| Then | `my character sheet shows my {word} as {string}` | 7 | 33 |
| Then | `my character sheet shows my tier as {int}` | 3 | 40 |
| Given | `my character's {word} is {string}` | 10 | 3 |
| Given | `my character's tier is {int}` | 2 | 10 |
| Then | `the change is refused` | 2 | 29 |
| Then | `the character name should display {string}` | 1 | 44 |
| Then | `the descriptor should display {string}` | 2 | 51 |
| Then | `the focus should display {string}` | 2 | 58 |

## card-deletion.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `{string} is still gone the next time I open my character` | 1 | 21 |
| When | `I discard {string}` | 4 | 10 |
| Then | `it was discarded without my being asked to confirm` | 1 | 28 |
| Given | `my character has the {cardKind} {string} and {string}` | 6 | 3 |
| Then | `my character's {cardKind} are only {string}` | 3 | 14 |
| Then | `the discard control of {string} is in the top-left corner of its entry` | 1 | 32 |

## card-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I cancel the card` | 7 | 32 |
| When | `I open my character again` | 23 | 36 |
| When | `I save the card` | 38 | 28 |
| When | `I set its {word} to {string}` | 120 | 21 |
| When | `I start a new {cardType}` | 52 | 10 |
| When | `I start editing the {cardType} {string}` | 8 | 14 |
| Then | `my character carries {int} {cardKind}` | 36 | 54 |
| Then | `my character carries the {cardType} {string}` | 27 | 61 |
| Given | `my character has {int} {cardKind}` | 47 | 3 |
| Then | `the {cardType} {string} shows {string}` | 10 | 68 |
| Then | `the add {cardType} button has a themed background colour` | 7 | 47 |
| Then | `the card editor opens with empty {cardType} fields` | 7 | 40 |

## card-modal-focus-trap.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `focus stays within the card editor` | 5 | 19 |
| When | `I press Escape in the card editor` | 1 | 11 |
| When | `I press Shift+Tab {int} time(s)` | 3 | 7 |
| When | `I press the Tab key {int} time(s)` | 6 | 3 |
| Then | `the {word} field has focus` | 1 | 31 |
| Then | `the card editor closes` | 1 | 15 |
| Then | `the first field of the card editor has focus` | 2 | 23 |
| Then | `the last control of the card editor has focus` | 2 | 27 |

## card-reordering-abilities.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag ability {string} before ability {string}` | 2 | 28 |
| When | `I drag ability {string} onto cypher {string}` | 1 | 80 |
| When | `I drag cypher {string} into the abilities section` | 1 | 64 |
| Then | `the abilities should be in order {string}` | 5 | 49 |
| Given | `the character has {int} abilities named {string}` | 5 | 5 |

## card-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag cypher {string} after cypher {string}` | 1 | 41 |
| When | `I drag cypher {string} before cypher {string}` | 3 | 21 |
| When | `I hover over cypher {string}` | 1 | 91 |
| When | `I start dragging cypher {string}` | 2 | 66 |
| Given | `the character has {int} cyphers named {string}` | 9 | 5 |
| Then | `the cypher {string} should have a dragging visual state` | 1 | 127 |
| Then | `the cyphers should be in order {string}` | 7 | 110 |
| Then | `the cyphers should be visually in order {string}, {string}, {string}` | 1 | 138 |

## character-display.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character exists with the following data:` | 1 | 9 |
| Given | `I am on the character sheet page` | 40 | 27 |
| Then | `I should see {int} artifact displayed` | 1 | 147 |
| Then | `I should see {int} cyphers displayed` | 1 | 110 |
| Then | `I should see {int} oddities displayed` | 1 | 160 |
| Then | `I should see an empty {cardTypes} section` | 4 | 173 |
| Then | `I should see artifact {string} with level {string}` | 1 | 152 |
| Then | `I should see cypher {string} with level {string}` | 2 | 115 |
| Then | `I should see descriptor {string} displayed` | 1 | 45 |
| Then | `I should see empty state for abilities` | 1 | 202 |
| Then | `I should see empty state for background` | 1 | 184 |
| Then | `I should see empty state for equipment` | 1 | 198 |
| Then | `I should see empty state for notes` | 1 | 191 |
| Then | `I should see focus {string} displayed` | 1 | 49 |
| Then | `I should see oddity {string}` | 2 | 165 |
| Then | `I should see sections in this order:` | 1 | 274 |
| Then | `I should see the {string} stat with pool {string}, edge {string}, and current {string}` | 3 | 85 |
| Then | `I should see the character name {string}` | 3 | 32 |
| Then | `I should see tier {string} displayed` | 1 | 36 |
| Then | `I should see type {string} displayed` | 1 | 40 |
| Then | `no markup from the text should be rendered as HTML` | 1 | 252 |
| Then | `no untranslated text keys should be visible` | 6 | 53 |
| Given | `the character has a {int}-character name without spaces` | 1 | 257 |
| Given | `the character has empty text fields` | 1 | 180 |
| Given | `the character has no {cardTypes}` | 4 | 169 |
| Given | `the character has the following artifacts:` | 1 | 123 |
| Given | `the character has the following cyphers:` | 1 | 96 |
| Given | `the character has the following oddities:` | 1 | 137 |
| Given | `the character has the following stats:` | 1 | 67 |
| Given | `the character has the following text:` | 2 | 220 |
| Then | `the character text should read exactly:` | 2 | 234 |
| Then | `the page should not scroll horizontally` | 2 | 266 |
| Then | `these controls should have their translated accessible label:` | 1 | 57 |

## character-file-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file export should be triggered` | 1 | 27 |
| When | `I export the character` | 6 | 19 |
| Given | `the character has name {string}` | 3 | 5 |
| Then | `the exported file should contain all character properties` | 2 | 39 |
| Then | `the exported file should have an exportDate` | 2 | 88 |
| Then | `the exported file should have schemaVersion {string}` | 2 | 80 |
| Then | `the exported file should have version {string}` | 2 | 72 |
| Then | `the exported filename should be {string}` | 2 | 32 |

## character-file-import.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I import a valid character file {string}` | 4 | 85 |
| Then | `the character {string} should still be displayed` | 1 | 93 |
| Then | `the previous character should be replaced` | 1 | 99 |

## character-storage.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character is currently displayed` | 2 | 4 |
| Then | `all character data should be preserved` | 2 | 68 |
| Then | `all character sections should show data` | 2 | 38 |
| Then | `all sections should display empty state messages` | 2 | 14 |
| When | `I click the "Load" button` | 2 | 28 |
| Then | `the character {string} should be displayed` | 3 | 33 |
| Given | `the character sheet is empty` | 3 | 24 |
| Then | `the character sheet should show empty states` | 2 | 8 |
| Then | `the character should be displayed` | 1 | 57 |
| Then | `the same character should still be displayed` | 1 | 63 |

## collection-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag {string} after {string} in the {string} collection` | 1 | 78 |
| When | `I drag {string} before {string} in the {string} collection` | 1 | 66 |
| Given | `the {string} collection holds {string}` | 2 | 54 |
| Then | `the {string} collection should be in order {string}` | 2 | 94 |

## combat.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I view my character on a phone` | 1 | 30 |
| Given | `I view my character on a wide screen` | 1 | 26 |
| Given | `my character has an attack whose name is {int} characters long without spaces` | 1 | 19 |
| Given | `my character has the {cardType} {string}` | 2 | 12 |
| Given | `my character has the {cardType} {string} with:` | 3 | 5 |
| Then | `my character's {cardKind} section says it is empty` | 2 | 55 |
| Then | `my character's attack keeps its badges at the right edge of its card` | 1 | 83 |
| Then | `the {cardKind} section sits above the {cardKind} section` | 1 | 76 |
| Then | `the {cardKind} section sits left of the {cardKind} section` | 1 | 69 |
| Then | `the {cardType} {string} is themed {word}` | 2 | 48 |
| Then | `the {cardType} {string} shows {word} {string}` | 9 | 34 |
| Then | `the {cardType} {string} shows no {word}` | 1 | 41 |
| Then | `the attacks section shows my character's armor of {int}` | 1 | 62 |

## common-steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear` | 2 | 114 |
| When | `I clear the input field` | 1 | 31 |
| When | `I click on the {string} value` | 1 | 7 |
| When | `I click the "Confirm" button` | 1 | 18 |
| When | `I click the "New" button` | 7 | 19 |
| When | `I click the {badge} badge` | 1 | 27 |
| When | `I edit the {string} field to {string}` | 35 | 61 |
| When | `I edit the {string} field to {string} without waiting for the auto-save` | 1 | 70 |
| When | `I press the Escape key` | 2 | 77 |
| When | `I reload the page` | 21 | 81 |
| When | `I reload the page immediately` | 1 | 94 |
| When | `I type {string} in the modal input` | 1 | 35 |
| Then | `the {string} value should display {string}` | 1 | 101 |
| Then | `the edit modal should open` | 1 | 115 |
| Then | `the modal input should contain {string}` | 1 | 121 |

## data-validation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all character data should be correctly displayed` | 1 | 66 |
| When | `I import a character file with tier {int}` | 1 | 48 |
| When | `I import a valid character file with matching schema version` | 3 | 40 |
| Then | `the character name should still be {string}` | 1 | 77 |
| Then | `the character should be imported successfully` | 1 | 60 |
| Then | `the tier should have been adjusted to {string}` | 1 | 53 |
| Then | `the tier should still be {string}` | 1 | 85 |

## empty-fields-visibility.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear with value {string}` | 1 | 93 |
| When | `I click on the descriptor field` | 2 | 60 |
| When | `I click on the focus field` | 1 | 66 |
| When | `I enter {string} in the edit field` | 2 | 72 |
| Given | `the character data is loaded` | 1 | 4 |
| Then | `the descriptor field should be clickable` | 1 | 32 |
| Then | `the descriptor field should be visible` | 1 | 22 |
| Then | `the descriptor field should display placeholder text` | 1 | 8 |
| Then | `the descriptor field should not show placeholder text` | 1 | 77 |
| Then | `the focus field should be clickable` | 1 | 46 |
| Then | `the focus field should be visible` | 1 | 27 |
| Then | `the focus field should display placeholder text` | 1 | 15 |
| Then | `the focus field should not show placeholder text` | 1 | 85 |

## export-enhancement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file download should be triggered` | 1 | 165 |
| When | `I cancel the file save dialog` | 1 | 94 |
| When | `I click the Export button` | 7 | 89 |
| When | `I click the Quick Export button` | 1 | 100 |
| When | `I click the Save As button` | 1 | 111 |
| Then | `I should not see an {string} button` | 1 | 132 |
| Then | `I should see a {string} button` | 2 | 127 |
| Then | `I should see an {string} button` | 2 | 122 |
| When | `I view the export buttons` | 1 | 85 |
| Given | `my browser does not support File System Access API` | 1 | 43 |
| Given | `my browser supports File System Access API` | 7 | 5 |
| Then | `no file should be saved` | 1 | 204 |
| Given | `the character name is {string}` | 1 | 71 |
| Then | `the download filename should contain {string}` | 1 | 174 |
| Then | `the download should have correct file structure` | 1 | 182 |
| Then | `the Export button should still be visible` | 1 | 212 |
| Then | `the export dialog should be triggered` | 1 | 230 |
| Then | `the export dialog should be triggered with filename containing {string}` | 1 | 138 |
| Then | `the exported data should have correct structure` | 1 | 151 |
| Then | `the file should be saved without prompting` | 1 | 217 |
| Then | `the suggested filename should be {string}` | 1 | 196 |

## grid-merge-split.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `{string} and {string} are in a grid` | 4 | 58 |
| Then | `{string} should be in its own row` | 9 | 77 |
| When | `I drag the {string} section onto the {zone} of the {string} section` | 10 | 7 |
| Then | `the {string} section should be the last section` | 2 | 48 |
| Then | `the grid should show {string} on the left and {string} on the right` | 7 | 14 |
| Then | `the layout should still be the default layout` | 3 | 32 |
| Then | `the saved layout should pair {string} on the left and {string} on the right` | 1 | 40 |

## i18n.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `artifact level labels should display {string}` | 1 | 96 |
| Then | `cypher level labels should display {string}` | 1 | 86 |
| Given | `I am on the character sheet page with {string}` | 13 | 9 |
| When | `I navigate to the page with {string}` | 1 | 14 |
| Then | `the artifacts heading should be {string}` | 1 | 91 |
| Then | `the background field label should be {string}` | 1 | 109 |
| Then | `the cyphers heading should be {string}` | 1 | 81 |
| Then | `the empty abilities message should be {string}` | 1 | 157 |
| Then | `the empty artifacts message should be {string}` | 1 | 126 |
| Then | `the empty background message should be {string}` | 1 | 136 |
| Then | `the empty cyphers message should be {string}` | 1 | 121 |
| Then | `the empty equipment message should be {string}` | 1 | 152 |
| Then | `the empty notes message should be {string}` | 1 | 144 |
| Then | `the empty oddities message should be {string}` | 1 | 131 |
| Then | `the intellect stat should display {string}` | 1 | 55 |
| Given | `the language is set to {string}` | 2 | 4 |
| Then | `the language should remain German` | 1 | 162 |
| Then | `the load button should display {string}` | 3 | 29 |
| Then | `the might stat should display {string}` | 1 | 44 |
| Then | `the new button should display {string}` | 3 | 34 |
| Then | `the notes field label should be {string}` | 1 | 115 |
| Then | `the oddities heading should be {string}` | 1 | 104 |
| Then | `the page should declare its language as {string}` | 2 | 167 |
| Then | `the page title should be {string}` | 2 | 24 |
| Then | `the page title should be in English` | 2 | 19 |
| Then | `the speed stat should display {string}` | 1 | 50 |
| Then | `the stat current label should be {string}` | 1 | 74 |
| Then | `the stat edge label should be {string}` | 1 | 67 |
| Then | `the stat pool label should be {string}` | 1 | 60 |
| Then | `the stats heading should be {string}` | 1 | 39 |

## import-error-messages.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I import a file without character data` | 2 | 6 |
| Then | `the alert should read {string}` | 2 | 14 |

## layout-edit-mode.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the Edit Layout button` | 1 | 5 |
| When | `I click the Exit Edit Layout button` | 2 | 10 |
| When | `I click the Reset Layout button` | 1 | 15 |
| Given | `I have customized the layout` | 8 | 91 |
| Given | `I have the default layout` | 3 | 127 |
| Given | `I open the settings panel` | 2 | 104 |
| Then | `I should see layout edit mode is active` | 1 | 20 |
| Then | `I should see the {string} button` | 1 | 67 |
| Then | `I should see visual indicators on rearrangeable sections` | 1 | 30 |
| Then | `it should be touch-friendly` | 1 | 78 |
| Given | `layout edit mode is active` | 34 | 41 |
| Then | `layout edit mode should be inactive` | 1 | 50 |
| Then | `the {string} option should be enabled` | 1 | 118 |
| Then | `the layout should return to the default arrangement` | 1 | 108 |
| Then | `the visual indicators should be removed` | 1 | 60 |

## layout-import-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I choose to {string}` | 4 | 103 |
| When | `I dismiss the layout choice prompt with the Escape key` | 1 | 81 |
| Given | `I have a character file with a different layout` | 5 | 38 |
| Given | `I have a character file with the default layout` | 1 | 42 |
| Given | `I have a character file with the default layout that sets the {string} section to {int} column(s)` | 1 | 50 |
| Given | `I have a character file without a layout` | 1 | 46 |
| Given | `I have set the {string} section to {int} column(s)` | 1 | 60 |
| When | `I import the character file` | 8 | 69 |
| Then | `I should not see a layout choice prompt` | 5 | 87 |
| Then | `I should see a layout choice prompt` | 1 | 77 |
| Then | `I should see options to {string} or {string}` | 1 | 91 |
| Then | `the {string} option should have focus` | 1 | 99 |
| Then | `the {string} section should be set to {int} column(s)` | 2 | 111 |
| Then | `the exported file should contain the layout configuration` | 1 | 25 |
| Then | `the imported character should be shown` | 5 | 107 |

## recovery-damage-track.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all recovery checkboxes should be unchecked` | 1 | 145 |
| When | `I click on the recovery modifier display` | 1 | 155 |
| When | `I click the {string} recovery checkbox` | 1 | 177 |
| When | `I confirm the edit` | 3 | 171 |
| When | `I enter {string} in the modifier field` | 1 | 161 |
| When | `I select the {string} damage status` | 1 | 184 |
| Then | `I should see {int} damage status options` | 1 | 48 |
| Then | `I should see {int} recovery roll checkboxes` | 1 | 18 |
| Then | `I should see {string} in the recovery section` | 3 | 133 |
| Then | `I should see a section titled {string}` | 2 | 7 |
| Then | `I should see an edit modal` | 1 | 166 |
| Then | `I should see damage status {string}` | 1 | 53 |
| Then | `I should see damage status {string} with description {string}` | 2 | 58 |
| Then | `I should see recovery roll {string} with time {string}` | 4 | 23 |
| Then | `I should see the recovery modifier display {string}` | 1 | 12 |
| Then | `the {string} radio button should be selected` | 4 | 84 |
| Then | `the {string} radio button should not be selected` | 6 | 90 |
| Then | `the {string} recovery checkbox should be checked` | 2 | 36 |
| Then | `the {string} recovery checkbox should be unchecked` | 3 | 42 |
| Given | `the character has {string} recovery used` | 1 | 32 |
| Given | `the character has recovery modifier {int}` | 2 | 112 |
| Given | `the character is {string}` | 3 | 67 |
| Given | `the character is new` | 1 | 138 |
| Then | `the damage track section should have red styling` | 1 | 104 |
| Then | `the recovery rolls section should have green styling` | 1 | 96 |

## resource-tracker-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I am told why` | 1 | 45 |
| When | `I change my {resourceName} to {int}` | 6 | 24 |
| When | `I try to change my {resourceName} to {string}` | 1 | 31 |
| Given | `my character has {int} current XP and {int} total XP` | 3 | 3 |
| Then | `my character sheet shows my {resourceName} as {int}` | 11 | 38 |
| Given | `my character was saved with a single legacy XP value of {int}` | 1 | 10 |
| Given | `my character's {resourceName} is {int}` | 7 | 17 |

## section-columns.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I switch the {string} section to {int} column\(s)` | 1 | 22 |
| Then | `the {string} heading row should stay inside its frame` | 1 | 95 |
| Then | `the {string} section should offer a column switch` | 1 | 36 |
| Then | `the {string} section should offer no column switch` | 3 | 44 |
| Then | `the {string} section should show its cards in {int} column\(s)` | 7 | 9 |
| Then | `the armor badge should not cover the add attack button` | 1 | 81 |
| Then | `the max cyphers badge should be left of the {string} heading` | 1 | 67 |
| Then | `the shins badge should be left of the {string} heading` | 1 | 74 |

## section-drop-preview.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I hold the {string} section over the {zone} of the {string} section` | 11 | 50 |
| When | `I hold the {string} section over the {zone} of the {string} section as the window shows it` | 1 | 59 |
| When | `I keep still for a moment` | 9 | 88 |
| When | `I release the section outside the sheet` | 2 | 93 |
| When | `I release the section where it is` | 1 | 106 |
| Then | `no drop preview should be shown` | 1 | 143 |
| Given | `the {string} section is at the top of the window` | 1 | 66 |
| Then | `the {string} section should not have moved up or down on screen` | 1 | 75 |
| Then | `the {string} section should preview {string} in its place` | 1 | 122 |
| Then | `the {string} section should preview {string} on its right` | 1 | 112 |
| Then | `the row of {string} should preview {string} below it` | 1 | 132 |

## section-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I exit layout edit mode` | 2 | 101 |
| Given | `I have moved the {string} section to the top` | 1 | 74 |
| Given | `I have reordered sections` | 1 | 6 |
| Then | `the {string} section should appear before the {string} section` | 19 | 44 |
| Then | `the {string} section should still be at the top` | 1 | 109 |
| Then | `the layout should be saved` | 1 | 26 |
| Then | `the sections should remain in the new order` | 1 | 36 |

## section-slide.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drop the held section onto the {zone} of the {string} section` | 1 | 58 |
| Given | `I prefer reduced motion` | 1 | 54 |
| Then | `no section should have slid` | 1 | 197 |
| Given | `section slides are recorded` | 4 | 28 |
| Then | `the {string} section should be drawn above the {string} section while they slide` | 1 | 157 |
| Then | `the {string} section should slide back to where it was` | 1 | 139 |
| Then | `the {string} section should slide into its new place` | 4 | 125 |

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
| Given | `I am viewing an old version with the version navigator visible` | 1 | 102 |
| Given | `I am viewing the character sheet` | 1 | 5 |
| When | `I click outside the settings panel` | 1 | 53 |
| When | `I click the British flag icon` | 1 | 78 |
| When | `I click the German flag icon` | 5 | 74 |
| When | `I click the settings gear icon` | 2 | 37 |
| Given | `I have opened the settings panel` | 12 | 49 |
| Then | `I should be able to click the settings gear icon` | 1 | 30 |
| Then | `I should see a {string} option` | 1 | 109 |
| Then | `I should see a settings gear icon in the header` | 1 | 22 |
| Then | `I should see the settings panel` | 2 | 41 |
| Then | `the {string} option should be disabled` | 1 | 115 |
| Given | `the browser offers no secure-origin cryptography` | 1 | 10 |
| Given | `the interface is in German` | 1 | 92 |
| Then | `the interface should display in English` | 1 | 87 |
| Then | `the interface should display in German` | 1 | 82 |
| Then | `the settings gear icon should still be visible` | 1 | 26 |
| Then | `the settings panel should close` | 4 | 45 |

## sheet-toolbar.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I scroll to the bottom of the page` | 1 | 33 |
| Then | `the Edit Layout button should be in view` | 1 | 62 |
| Then | `the Edit Layout button should not overlap the character sheet` | 1 | 51 |
| Then | `the version navigator should be in view` | 1 | 58 |
| Then | `the version navigator should not overlap the character sheet` | 1 | 44 |

## stat-pool-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I change my {stat} {word} to {int}` | 4 | 10 |
| Then | `my character sheet shows my {stat} {word} as {int}` | 9 | 17 |
| Given | `my character's {stat} {word} is {int}` | 6 | 3 |

## storage-failure.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `the browser storage is full` | 5 | 5 |
| When | `the browser storage works again` | 1 | 13 |
| Then | `the save indicator should be inside the viewport` | 1 | 43 |
| Then | `the save indicator should not contain {string}` | 1 | 36 |
| Then | `the save indicator should not report a storage problem` | 1 | 32 |
| Then | `the save indicator should report that changes could not be saved` | 1 | 23 |
| Then | `the save indicator should report that storage is full` | 5 | 17 |
| Given | `writing to the browser storage fails` | 1 | 9 |

## third-party-requests.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I open the character sheet and watch its requests` | 2 | 5 |
| Then | `nothing should have been requested from another site` | 1 | 15 |
| Then | `the {string} and {string} fonts should be loaded` | 1 | 23 |

## unreadable-character.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I choose {string} for the unreadable character` | 2 | 37 |
| When | `I download the unreadable character` | 1 | 44 |
| Then | `I should be asked what to do with the unreadable character` | 4 | 25 |
| Then | `I should not be asked about an unreadable character` | 4 | 33 |
| Then | `no unreadable data should be kept` | 2 | 79 |
| Given | `the browser holds the unparseable character text {string}` | 1 | 16 |
| Then | `the downloaded file should be named like {string}` | 1 | 50 |
| Then | `the downloaded file should contain exactly {string}` | 1 | 63 |
| Then | `the kept unreadable data should be {string}` | 4 | 72 |
| Given | `the stored character data is the unreadable text {string}` | 4 | 9 |

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

## version-comparison-highlighting.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the left pane's restore button` | 2 | 82 |
| When | `I click the return to editing button` | 2 | 120 |
| When | `I click the right pane's restore button` | 1 | 86 |
| Then | `no add or delete button should be present in the comparison view` | 1 | 131 |
| Then | `no field in the comparison view should be editable` | 1 | 124 |
| Then | `the {string} field should be highlighted as changed in the {word} pane` | 2 | 10 |
| Then | `the {string} field should not be highlighted in the {word} pane` | 2 | 19 |
| Then | `the {word} pane should show the newly restored version` | 1 | 95 |
| Then | `the added cypher card should be highlighted as added in the right pane` | 1 | 28 |
| Then | `the left pane should not show the added cypher card` | 1 | 36 |
| Then | `the modified cypher card should be highlighted as changed in the {word} pane` | 2 | 56 |
| Then | `the new cypher name should be highlighted as added in the right pane` | 1 | 74 |
| Then | `the old cypher name should be highlighted as removed in the left pane` | 1 | 64 |
| Then | `the removed cypher card should be highlighted as removed in the left pane` | 1 | 41 |
| Then | `the right pane should not show the removed cypher card` | 1 | 51 |
| Then | `the right pane should still show the same character name as before the restore` | 1 | 105 |
| Then | `the right pane's restore button should be disabled` | 1 | 90 |

## version-comparison-navigation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the left pane's backward arrow` | 3 | 5 |
| When | `I click the left pane's backward arrow {int} time(s)` | 2 | 17 |
| When | `I click the left pane's forward arrow` | 1 | 9 |
| When | `I click the right pane's backward arrow` | 1 | 13 |
| When | `I click the right pane's backward arrow {int} time(s)` | 1 | 26 |
| Then | `the comparison header should indicate there are no differences` | 1 | 90 |
| Then | `the comparison header should list every changed field, not just the top 3` | 1 | 65 |
| Then | `the comparison header should reflect the new left pane version` | 1 | 80 |
| Then | `the left pane should show version {int}` | 5 | 54 |
| Given | `the left pane shows version {int}` | 2 | 46 |
| Then | `the right pane should show version {int}` | 4 | 58 |
| Given | `the right pane shows version {int}` | 1 | 50 |

## version-comparison-setup.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `comparison view is enabled in settings` | 23 | 19 |
| Then | `comparison view should show as enabled in settings` | 1 | 35 |
| Given | `I am viewing the comparison view` | 19 | 39 |
| When | `I close the settings panel` | 2 | 30 |
| When | `I enable comparison view in settings` | 2 | 23 |
| Given | `the character has a version where a cypher was renamed` | 1 | 111 |
| Given | `the character has a version with a modified cypher effect` | 1 | 92 |
| Given | `the character has a version with a name change` | 3 | 57 |
| Given | `the character has a version with a removed cypher` | 1 | 81 |
| Given | `the character has a version with an added cypher` | 1 | 67 |
| Then | `the comparison view should be visible` | 3 | 44 |
| Then | `the comparison view should not be visible` | 3 | 48 |

## version-history-assertions.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a new version should be created` | 1 | 109 |
| Then | `a new version should be created with description {string}` | 3 | 150 |
| Then | `I click the backward navigation arrow {int} times` | 1 | 176 |
| Then | `I should be viewing the latest version` | 3 | 114 |
| Then | `I should navigate to version {int}` | 2 | 121 |
| Then | `the character data should be correct for version {int}` | 1 | 130 |
| Then | `the character equipment should match version {int} equipment` | 2 | 54 |
| Then | `the character name should match version {int} name` | 4 | 31 |
| Then | `the character stats should match version {int} stats` | 2 | 42 |
| Then | `the exported file should contain version {int} data` | 1 | 86 |
| Then | `the exported file should not contain version history` | 1 | 96 |
| Then | `the exported file should use the current portrait` | 1 | 102 |
| Then | `the import button should be disabled` | 1 | 190 |
| Then | `the import button should be enabled` | 2 | 185 |
| Then | `the oldest version should have been removed` | 2 | 171 |
| Then | `the portrait should remain unchanged` | 3 | 74 |
| Then | `the timestamp should be in human-readable format` | 1 | 13 |
| Then | `the timestamp should show a relative time like {string}` | 1 | 21 |
| Then | `the UI should remain responsive` | 2 | 142 |
| Then | `the version description should contain {string}` | 14 | 5 |
| Then | `the version description should contain the tier change` | 1 | 163 |
| Then | `the warning banner should not be visible` | 2 | 158 |

## version-history-buffer-undo-redo.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I press {string} again` | 2 | 39 |
| When | `I press {string} again before the squash timer expires` | 2 | 71 |
| When | `I press {string} before the squash timer expires` | 11 | 4 |
| Then | `I should see {int} versions in history` | 4 | 128 |
| Then | `no new version should be created yet` | 2 | 114 |
| Then | `the changes should be reapplied` | 2 | 136 |
| Then | `the character name should be {string}` | 10 | 106 |
| Then | `the character name should revert to the original value` | 2 | 120 |

## version-history-given-basic.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am viewing that version` | 3 | 133 |
| Given | `I am viewing the latest version` | 6 | 47 |
| Given | `I am viewing version {int}` | 8 | 51 |
| Given | `the character has {int} versions in history` | 45 | 18 |
| Given | `the character has a later version` | 1 | 62 |
| Given | `the character has a portrait image` | 2 | 103 |
| Given | `the character has a version from {int} minutes ago` | 1 | 112 |
| Given | `the character has a version with multiple basic info changes` | 2 | 73 |
| Given | `the character has no version history yet` | 7 | 6 |

## version-history-given-data.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I have made buffered edits that were undone` | 2 | 117 |
| Given | `the character has {int} versions with different data` | 3 | 63 |
| Given | `the character has {int} versions with different names` | 2 | 95 |
| Given | `the character has a legacy version with a {string} description for a name change and an added ability` | 1 | 34 |
| Given | `the character has a legacy version with an {string} description for an added cypher` | 2 | 5 |

## version-history-mixed-undo-redo.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I make {int} rapid edits that are buffered` | 1 | 5 |
| When | `I press {string} to navigate to previous version` | 1 | 62 |
| When | `I press {string} to undo buffered changes` | 1 | 25 |
| Then | `I should be viewing version {int}` | 1 | 97 |
| When | `I wait for squash timer to complete` | 19 | 58 |

## version-history-navigation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the backward navigation arrow` | 20 | 11 |
| When | `I click the backward navigation arrow again` | 1 | 15 |
| When | `I click the forward navigation arrow` | 3 | 23 |
| When | `I click the forward navigation arrow again` | 1 | 27 |
| When | `I click the restore button in the warning banner` | 3 | 31 |
| When | `I click the return to latest button` | 1 | 19 |
| When | `I create a new version by editing the name` | 1 | 74 |
| When | `I navigate backward` | 1 | 46 |
| When | `I navigate forward twice` | 1 | 50 |
| When | `I navigate to version {int}` | 8 | 35 |
| When | `I rapidly click the backward arrow {int} times` | 1 | 55 |
| When | `I refresh the browser` | 10 | 69 |
| When | `I view the character sheet` | 4 | 6 |

## version-history-navigator-state.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all edit controls should be enabled` | 2 | 9 |
| Then | `both navigation arrows should be enabled` | 2 | 71 |
| Then | `no warning banner should be visible` | 6 | 27 |
| Then | `the backward arrow should be disabled` | 1 | 83 |
| Then | `the backward arrow should be enabled` | 3 | 32 |
| Then | `the change description should be displayed` | 1 | 57 |
| Then | `the character data should match version {int}` | 5 | 42 |
| Then | `the forward arrow should be disabled` | 4 | 37 |
| Then | `the forward arrow should be enabled` | 1 | 88 |
| Then | `the timestamp should be displayed` | 1 | 64 |
| Then | `the version counter should show {string}` | 25 | 19 |
| Then | `the version navigator should be visible` | 5 | 14 |
| Then | `the version navigator should not be visible` | 2 | 4 |
| Then | `the warning banner should be visible` | 7 | 78 |
| Then | `the warning banner should contain text {string}` | 1 | 93 |
| Then | `the warning banner should have a restore button` | 1 | 101 |

## version-history-shortcuts.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I press {string}` | 5 | 24 |
| When | `I wait for {int} milliseconds` | 4 | 16 |
| When | `the squash timer has completed` | 2 | 20 |
| Then | `the undo buffer should contain exactly {int} changes` | 1 | 5 |

## version-history-squash-race.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `the held version save is released` | 1 | 42 |
| When | `the squash starts while version saves are held` | 1 | 31 |
| Given | `version saves are held` | 1 | 16 |

## viewport.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `the viewport is {int} pixels wide` | 38 | 9 |

