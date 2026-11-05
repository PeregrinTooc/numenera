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

- Step definitions: **727** in 54 files
- Feature step lines: **2325**
- Definitions with no feature usage: **0**
- Feature lines matching no definition: **1**

| Step file | Definitions | Unused |
| --- | ---: | ---: |
| [ability-enhancements.steps.ts](#abilityenhancementsstepsts) | 13 | 0 |
| [additional-fields-editing.steps.ts](#additionalfieldseditingstepsts) | 8 | 0 |
| [additional-fields-textarea.steps.ts](#additionalfieldstextareastepsts) | 28 | 0 |
| [auto-save-indicator.steps.ts](#autosaveindicatorstepsts) | 13 | 0 |
| [basic-info-editing-accessibility.steps.ts](#basicinfoeditingaccessibilitystepsts) | 18 | 0 |
| [basic-info-editing.steps.ts](#basicinfoeditingstepsts) | 16 | 0 |
| [card-creation-modal-actions.steps.ts](#cardcreationmodalactionsstepsts) | 10 | 0 |
| [card-creation-modal-fields.steps.ts](#cardcreationmodalfieldsstepsts) | 33 | 0 |
| [card-creation-setup.steps.ts](#cardcreationsetupstepsts) | 22 | 0 |
| [card-creation-verification.steps.ts](#cardcreationverificationstepsts) | 24 | 0 |
| [card-deletion.steps.ts](#carddeletionstepsts) | 40 | 0 |
| [card-modal-focus-trap.steps.ts](#cardmodalfocustrapstepsts) | 16 | 0 |
| [card-reordering-abilities.steps.ts](#cardreorderingabilitiesstepsts) | 5 | 0 |
| [card-reordering.steps.ts](#cardreorderingstepsts) | 8 | 0 |
| [character-display.steps.ts](#characterdisplaystepsts) | 33 | 0 |
| [character-file-export.steps.ts](#characterfileexportstepsts) | 8 | 0 |
| [character-file-import.steps.ts](#characterfileimportstepsts) | 3 | 0 |
| [character-storage.steps.ts](#characterstoragestepsts) | 10 | 0 |
| [collection-reordering.steps.ts](#collectionreorderingstepsts) | 4 | 0 |
| [combat.steps.ts](#combatstepsts) | 24 | 0 |
| [common-steps.ts](#commonstepsts) | 36 | 0 |
| [data-validation.steps.ts](#datavalidationstepsts) | 7 | 0 |
| [empty-fields-visibility.steps.ts](#emptyfieldsvisibilitystepsts) | 12 | 0 |
| [export-enhancement.steps.ts](#exportenhancementstepsts) | 21 | 0 |
| [grid-merge-split.steps.ts](#gridmergesplitstepsts) | 7 | 0 |
| [i18n.steps.ts](#i18nstepsts) | 29 | 0 |
| [import-error-messages.steps.ts](#importerrormessagesstepsts) | 2 | 0 |
| [layout-edit-mode.steps.ts](#layouteditmodestepsts) | 15 | 0 |
| [layout-import-export.steps.ts](#layoutimportexportstepsts) | 13 | 0 |
| [recovery-damage-track.steps.ts](#recoverydamagetrackstepsts) | 25 | 0 |
| [resource-tracker-editing.steps.ts](#resourcetrackereditingstepsts) | 18 | 0 |
| [section-columns.steps.ts](#sectioncolumnsstepsts) | 8 | 0 |
| [section-drop-preview.steps.ts](#sectiondroppreviewstepsts) | 8 | 0 |
| [section-reordering.steps.ts](#sectionreorderingstepsts) | 8 | 0 |
| [section-slide.steps.ts](#sectionslidestepsts) | 7 | 0 |
| [section-touch-drag.steps.ts](#sectiontouchdragstepsts) | 6 | 0 |
| [settings-gear.steps.ts](#settingsgearstepsts) | 18 | 0 |
| [sheet-toolbar.steps.ts](#sheettoolbarstepsts) | 5 | 0 |
| [stat-pool-editing.steps.ts](#statpooleditingstepsts) | 1 | 0 |
| [storage-failure.steps.ts](#storagefailurestepsts) | 8 | 0 |
| [unreadable-character.steps.ts](#unreadablecharacterstepsts) | 10 | 0 |
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
| When | `I select {string} from the type dropdown` | 4 | 28 |
| Then | `the character data should have type {string}` | 1 | 62 |
| Given | `the character has the following data:` | 1 | 5 |
| Then | `the type dropdown label should be {string}` | 1 | 74 |
| Then | `the type dropdown option for {string} should display as {string}` | 3 | 83 |
| Then | `the type dropdown options should be {string}, {string}, {string}` | 1 | 50 |
| Then | `the type dropdown should have {int} options` | 1 | 41 |
| Then | `the type dropdown should show {string} as selected` | 6 | 33 |

## additional-fields-textarea.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I clear the {textarea} textarea` | 4 | 45 |
| When | `I click outside the {textarea} textarea` | 11 | 56 |
| When | `I click the {textarea} textarea` | 20 | 41 |
| When | `I select {string} from the mobile picker` | 1 | 192 |
| When | `I tap outside the {textarea} textarea` | 2 | 241 |
| When | `I tap the {textarea} textarea` | 3 | 205 |
| When | `I tap the type dropdown` | 1 | 182 |
| When | `I type {string} in the {textarea} textarea` | 12 | 49 |
| When | `I type a {int} character string in the background textarea` | 1 | 122 |
| When | `I type a {int} character string in the notes textarea` | 1 | 131 |
| Then | `the {textarea} placeholder should be {string}` | 2 | 102 |
| When | `the {textarea} textarea is empty` | 2 | 98 |
| Then | `the {textarea} textarea should be empty` | 2 | 88 |
| Then | `the {textarea} textarea should be focused` | 4 | 72 |
| Then | `the {textarea} textarea should be readonly` | 8 | 15 |
| Then | `the {textarea} textarea should become editable` | 2 | 220 |
| Then | `the {textarea} textarea should have a pointer cursor` | 2 | 31 |
| Then | `the {textarea} textarea should have an edit state visual indicator` | 2 | 79 |
| Then | `the {textarea} textarea should not be readonly` | 4 | 63 |
| Then | `the {textarea} textarea should show {string}` | 14 | 22 |
| Then | `the background textarea should contain the full {int} character text` | 1 | 140 |
| Then | `the background textarea should still be editable` | 1 | 92 |
| Then | `the character data should have {textarea} {string}` | 5 | 110 |
| Then | `the character data should have the full background text` | 1 | 160 |
| Then | `the character data should have the full notes text` | 1 | 171 |
| Then | `the mobile OS picker should open` | 1 | 187 |
| Then | `the notes textarea should contain the full {int} character text` | 1 | 150 |
| Then | `the virtual keyboard should appear` | 3 | 229 |

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

## basic-info-editing-accessibility.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `focus should cycle between input field, confirm button, and cancel button` | 1 | 5 |
| Then | `focus should not leave the modal` | 1 | 18 |
| Then | `I can cancel with Escape key` | 1 | 42 |
| Then | `I can confirm with Enter key` | 1 | 35 |
| Then | `I can navigate with Tab key` | 1 | 27 |
| Then | `the backdrop should have aria-hidden={string}` | 1 | 55 |
| Then | `the buttons should be touch-friendly size \(min 44x44px)` | 1 | 106 |
| Then | `the character name should be large enough for touch \(min 44x44px)` | 1 | 132 |
| Then | `the descriptor should be large enough for touch \(min 44x44px)` | 1 | 152 |
| Then | `the focus should be large enough for touch \(min 44x44px)` | 1 | 162 |
| Then | `the input field should be large enough for touch input` | 1 | 125 |
| Then | `the input field should have inputmode={string} for mobile` | 1 | 78 |
| Then | `the mobile keyboard should appear` | 1 | 72 |
| Then | `the modal should be sized appropriately for mobile` | 1 | 64 |
| Then | `the modal should fill most of the screen width` | 1 | 87 |
| Then | `the modal should have role={string}` | 1 | 49 |
| Then | `the modal should not overflow the viewport` | 1 | 96 |
| Then | `the tier should be large enough for touch \(min 44x44px)` | 1 | 142 |

## basic-info-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I press Tab repeatedly` | 1 | 5 |
| Then | `the cancel button should have an X icon` | 1 | 98 |
| Then | `the character name should display {string}` | 7 | 44 |
| Then | `the character name should still display {string}` | 6 | 52 |
| Then | `the confirm button should have a checkmark icon` | 1 | 92 |
| Then | `the descriptor should display {string}` | 4 | 66 |
| Then | `the focus should display {string}` | 4 | 74 |
| Then | `the input field should be of type {string}` | 1 | 35 |
| Then | `the modal backdrop should be semi-transparent` | 1 | 104 |
| Then | `the modal should have a cancel button with icon` | 1 | 28 |
| Then | `the modal should have a confirm button with icon` | 1 | 21 |
| Then | `the modal should have Numenera-themed styling` | 1 | 84 |
| Then | `the modal should not close` | 1 | 79 |
| Then | `the name should show a hover state indicating it's editable` | 1 | 122 |
| Then | `the tier should display {string}` | 6 | 60 |
| Then | `the tier should show a hover state indicating it's editable` | 1 | 133 |

## card-creation-modal-actions.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I cancel the card edit modal` | 7 | 15 |
| When | `I click the edit button on ability {string}` | 1 | 77 |
| When | `I click the edit button on artifact {string}` | 1 | 56 |
| When | `I click the edit button on attack {string}` | 1 | 70 |
| When | `I click the edit button on cypher {string}` | 2 | 42 |
| When | `I click the edit button on equipment {string}` | 1 | 49 |
| When | `I click the edit button on oddity {string}` | 1 | 63 |
| When | `I click the edit button on special ability {string}` | 1 | 84 |
| When | `I confirm the card edit modal` | 51 | 4 |
| Then | `the card edit modal should be open` | 15 | 25 |

## card-creation-modal-fields.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all ability fields should be empty` | 1 | 79 |
| Then | `all artifact fields should be empty` | 1 | 38 |
| Then | `all attack fields should be empty` | 1 | 63 |
| Then | `all cypher fields should be empty` | 1 | 12 |
| Then | `all equipment fields should be empty` | 1 | 25 |
| Then | `all oddity fields should be empty` | 1 | 50 |
| Then | `all special ability fields should be empty` | 1 | 94 |
| When | `I fill in the ability cost with {string}` | 6 | 177 |
| When | `I fill in the ability description with {string}` | 9 | 185 |
| When | `I fill in the ability name with {string}` | 9 | 173 |
| When | `I fill in the ability pool with {string}` | 6 | 181 |
| When | `I fill in the artifact effect with {string}` | 7 | 144 |
| When | `I fill in the artifact level with {string}` | 7 | 137 |
| When | `I fill in the artifact name with {string}` | 7 | 130 |
| When | `I fill in the attack damage with {string}` | 7 | 159 |
| When | `I fill in the attack modifier with {string}` | 7 | 166 |
| When | `I fill in the attack name with {string}` | 7 | 155 |
| When | `I fill in the cypher effect with {string}` | 12 | 109 |
| When | `I fill in the cypher level with {string}` | 12 | 105 |
| When | `I fill in the cypher name with {string}` | 12 | 101 |
| When | `I fill in the equipment description with {string}` | 7 | 123 |
| When | `I fill in the equipment name with {string}` | 8 | 116 |
| When | `I fill in the oddity text with {string}` | 7 | 151 |
| When | `I fill in the special ability description with {string}` | 7 | 206 |
| When | `I fill in the special ability name with {string}` | 7 | 192 |
| When | `I fill in the special ability source with {string}` | 7 | 199 |
| Then | `the modal should show ability fields` | 1 | 71 |
| Then | `the modal should show artifact fields` | 1 | 31 |
| Then | `the modal should show attack fields` | 1 | 55 |
| Then | `the modal should show cypher fields` | 1 | 5 |
| Then | `the modal should show equipment fields` | 1 | 19 |
| Then | `the modal should show oddity fields` | 1 | 45 |
| Then | `the modal should show special ability fields` | 1 | 87 |

## card-creation-setup.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the add ability button` | 15 | 110 |
| When | `I click the add artifact button` | 7 | 98 |
| When | `I click the add attack button` | 7 | 106 |
| When | `I click the add cypher button` | 13 | 90 |
| When | `I click the add equipment button` | 9 | 94 |
| When | `I click the add oddity button` | 7 | 102 |
| When | `I click the add special ability button` | 7 | 114 |
| Then | `I should see an add ability button` | 1 | 82 |
| Then | `I should see an add artifact button` | 1 | 53 |
| Then | `I should see an add attack button` | 1 | 61 |
| Then | `I should see an add cypher button` | 1 | 45 |
| Then | `I should see an add equipment button` | 1 | 49 |
| Then | `I should see an add oddity button` | 1 | 57 |
| Then | `I should see an add special ability button` | 1 | 86 |
| Then | `the add attack button should have a non-transparent background` | 1 | 65 |
| Given | `the character has {int} ability cards` | 5 | 34 |
| Given | `the character has {int} artifact cards` | 5 | 22 |
| Given | `the character has {int} attack cards` | 5 | 30 |
| Given | `the character has {int} cypher cards` | 5 | 14 |
| Given | `the character has {int} equipment cards` | 5 | 18 |
| Given | `the character has {int} oddity cards` | 5 | 26 |
| Given | `the character has {int} special ability cards` | 5 | 38 |

## card-creation-verification.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see {int} ability cards` | 14 | 25 |
| Then | `I should see {int} artifact cards` | 8 | 13 |
| Then | `I should see {int} attack cards` | 8 | 21 |
| Then | `I should see {int} cypher card(s)` | 15 | 5 |
| Then | `I should see {int} equipment cards` | 8 | 9 |
| Then | `I should see {int} oddity cards` | 8 | 17 |
| Then | `I should see {int} special ability cards` | 8 | 29 |
| Then | `I should see a cypher card with name {string}` | 5 | 33 |
| Then | `I should see a special ability card with name {string}` | 5 | 159 |
| Then | `I should see an ability card with name {string}` | 7 | 134 |
| Then | `I should see an artifact card with name {string}` | 5 | 75 |
| Then | `I should see an attack card with name {string}` | 5 | 109 |
| Then | `I should see an equipment card with name {string}` | 5 | 58 |
| Then | `I should see an oddity card with text {string}` | 6 | 100 |
| Then | `the ability {string} should have cost {string}` | 1 | 143 |
| Then | `the ability {string} should have pool {string}` | 1 | 151 |
| Then | `the artifact {string} should have effect {string}` | 1 | 92 |
| Then | `the artifact {string} should have level {string}` | 1 | 84 |
| Then | `the attack {string} should have damage {string}` | 1 | 126 |
| Then | `the attack {string} should have modifier {string}` | 1 | 118 |
| Then | `the cypher {string} should have effect {string}` | 1 | 50 |
| Then | `the cypher {string} should have level {string}` | 1 | 42 |
| Then | `the equipment {string} should have description {string}` | 1 | 67 |
| Then | `the special ability {string} should have source {string}` | 1 | 170 |

## card-deletion.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the delete button on the first ability` | 1 | 116 |
| When | `I click the delete button on the first artifact` | 1 | 104 |
| When | `I click the delete button on the first attack` | 1 | 112 |
| When | `I click the delete button on the first cypher` | 6 | 98 |
| When | `I click the delete button on the first cypher again` | 1 | 99 |
| When | `I click the delete button on the first equipment item` | 1 | 100 |
| When | `I click the delete button on the first oddity` | 1 | 108 |
| When | `I click the delete button on the first special ability` | 1 | 120 |
| Given | `I have {int} abilities` | 1 | 80 |
| Given | `I have {int} artifact` | 1 | 59 |
| Given | `I have {int} attacks` | 1 | 73 |
| Given | `I have {int} cyphers` | 4 | 46 |
| Given | `I have {int} equipment items` | 1 | 52 |
| Given | `I have {int} oddities` | 1 | 66 |
| Given | `I have {int} special abilities` | 1 | 87 |
| When | `I look at a cypher card` | 2 | 4 |
| When | `I look at a special ability card` | 1 | 28 |
| When | `I look at an ability card` | 1 | 24 |
| When | `I look at an artifact card` | 1 | 12 |
| When | `I look at an attack card` | 1 | 20 |
| When | `I look at an equipment card` | 1 | 8 |
| When | `I look at an oddity card` | 1 | 16 |
| Then | `I should have {int} abilities remaining` | 2 | 193 |
| Then | `I should have {int} artifacts remaining` | 2 | 188 |
| Then | `I should have {int} attack remaining` | 2 | 167 |
| Then | `I should have {int} cypher(s) remaining` | 4 | 158 |
| Then | `I should have {int} equipment items remaining` | 2 | 180 |
| Then | `I should have {int} oddity remaining` | 2 | 162 |
| Then | `I should have {int} special ability remaining` | 2 | 172 |
| Then | `I should not see a confirmation dialog` | 1 | 216 |
| Then | `I should see a delete button on the {cardType} card` | 7 | 36 |
| Then | `the ability should be removed from the DOM` | 1 | 146 |
| Then | `the artifact should be removed from the DOM` | 1 | 134 |
| Then | `the attack should be removed from the DOM` | 1 | 142 |
| Then | `the cypher should be removed from the DOM` | 1 | 127 |
| Then | `the cypher should be removed immediately` | 1 | 211 |
| Then | `the delete button should be in the top-left corner of the card` | 1 | 198 |
| Then | `the equipment item should be removed from the DOM` | 1 | 130 |
| Then | `the oddity should be removed from the DOM` | 1 | 138 |
| Then | `the special ability should be removed from the DOM` | 1 | 150 |

## card-modal-focus-trap.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `focus should be on the description textarea` | 1 | 136 |
| Then | `focus should eventually wrap back to the first input field` | 1 | 74 |
| Then | `focus should eventually wrap back to the last focusable element` | 1 | 92 |
| Then | `focus should move to the last focusable element in the modal` | 1 | 65 |
| Then | `focus should move to the next focusable element in the modal` | 1 | 56 |
| Then | `focus should never escape to the page body or address bar` | 4 | 101 |
| Then | `focus should still be within the card modal` | 3 | 120 |
| When | `I press Shift+Tab` | 1 | 13 |
| When | `I press Shift+Tab repeatedly` | 1 | 42 |
| When | `I press the Tab key` | 1 | 8 |
| When | `I press the Tab key {int} times` | 4 | 49 |
| When | `I press the Tab key repeatedly` | 1 | 35 |
| Then | `the active element should not be the browser chrome` | 1 | 149 |
| Then | `the active element should not be the document body` | 1 | 129 |
| Then | `the card edit modal should be closed` | 1 | 3 |
| Then | `the first input field in the modal should be automatically focused` | 1 | 18 |

## card-reordering-abilities.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag ability {string} before ability {string}` | 2 | 28 |
| When | `I drag ability {string} onto cypher {string}` | 1 | 86 |
| When | `I drag cypher {string} into the abilities section` | 1 | 70 |
| Then | `the abilities should be in order {string}` | 5 | 49 |
| Given | `the character has {int} abilities named {string}` | 5 | 5 |

## card-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag cypher {string} after cypher {string}` | 1 | 42 |
| When | `I drag cypher {string} before cypher {string}` | 3 | 21 |
| When | `I hover over cypher {string}` | 1 | 95 |
| When | `I start dragging cypher {string}` | 2 | 68 |
| Given | `the character has {int} cyphers named {string}` | 9 | 5 |
| Then | `the cypher {string} should have a dragging visual state` | 1 | 138 |
| Then | `the cyphers should be in order {string}` | 7 | 116 |
| Then | `the cyphers should be visually in order {string}, {string}, {string}` | 1 | 157 |

## character-display.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `a character exists with the following data:` | 2 | 9 |
| Given | `I am on the character sheet page` | 59 | 27 |
| Then | `I should see {int} artifact displayed` | 1 | 147 |
| Then | `I should see {int} cyphers displayed` | 1 | 110 |
| Then | `I should see {int} oddities displayed` | 1 | 160 |
| Then | `I should see an empty {cardTypes} section` | 6 | 173 |
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
| Given | `the character has no {cardTypes}` | 6 | 169 |
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
| Then | `a file export should be triggered` | 1 | 36 |
| When | `I export the character` | 6 | 28 |
| Given | `the character has name {string}` | 3 | 5 |
| Then | `the exported file should contain all character properties` | 2 | 48 |
| Then | `the exported file should have an exportDate` | 2 | 97 |
| Then | `the exported file should have schemaVersion {string}` | 2 | 89 |
| Then | `the exported file should have version {string}` | 2 | 81 |
| Then | `the exported filename should be {string}` | 2 | 41 |

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
| When | `I click the "Load" button` | 3 | 28 |
| Then | `the character {string} should be displayed` | 3 | 33 |
| Given | `the character sheet is empty` | 3 | 24 |
| Then | `the character sheet should show empty states` | 2 | 8 |
| Then | `the character should be displayed` | 1 | 57 |
| Then | `the same character should still be displayed` | 1 | 63 |

## collection-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag {string} after {string} in the {string} collection` | 1 | 79 |
| When | `I drag {string} before {string} in the {string} collection` | 1 | 66 |
| Given | `the {string} collection holds {string}` | 2 | 54 |
| Then | `the {string} collection should be in order {string}` | 2 | 96 |

## combat.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `I should see the armor badge in the attacks section` | 1 | 188 |
| Then | `I should see the attack {string}` | 2 | 33 |
| Then | `I should see the special ability {string}` | 1 | 138 |
| Then | `the attack {string} should have red combat theme styling` | 1 | 96 |
| Then | `the attack {string} should not show notes` | 1 | 88 |
| Then | `the attack {string} should show damage {string}` | 2 | 40 |
| Then | `the attack {string} should show modifier {string}` | 2 | 52 |
| Then | `the attack {string} should show notes {string}` | 1 | 76 |
| Then | `the attack {string} should show range {string}` | 2 | 64 |
| Then | `the attack badges should sit at the right edge of their card` | 1 | 223 |
| Then | `the attacks section should be in the right column` | 1 | 204 |
| Given | `the character has a special ability {string}` | 1 | 127 |
| Given | `the character has a special ability {string} with:` | 1 | 113 |
| Given | `the character has an attack {string}` | 1 | 25 |
| Given | `the character has an attack {string} with:` | 1 | 8 |
| Given | `the character has an attack with a {int}-character name without spaces` | 1 | 214 |
| Given | `the character has special abilities and attacks` | 1 | 192 |
| Then | `the empty attacks state should use translation keys` | 1 | 107 |
| Then | `the empty special abilities state should use translation keys` | 1 | 182 |
| Then | `the sections should stack vertically on mobile` | 1 | 209 |
| Then | `the special abilities section should be in the left column` | 1 | 199 |
| Then | `the special ability {string} should have teal theme styling` | 1 | 171 |
| Then | `the special ability {string} should show description {string}` | 1 | 145 |
| Then | `the special ability {string} should show source {string}` | 1 | 159 |

## common-steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `an edit modal should appear` | 10 | 237 |
| When | `I clear the input field` | 18 | 105 |
| When | `I click on the {string} value` | 9 | 22 |
| When | `I click on the character name {string}` | 12 | 63 |
| When | `I click on the descriptor {string}` | 2 | 73 |
| When | `I click on the focus {string}` | 2 | 78 |
| When | `I click on the tier {string}` | 5 | 68 |
| When | `I click outside the modal on the backdrop` | 1 | 151 |
| When | `I click the "Cancel" button` | 3 | 45 |
| When | `I click the "Confirm" button` | 27 | 40 |
| When | `I click the "New" button` | 7 | 46 |
| When | `I click the {badge} badge` | 23 | 54 |
| When | `I edit the {string} field to {string}` | 34 | 135 |
| When | `I edit the {string} field to {string} without waiting for the auto-save` | 1 | 144 |
| When | `I hover over the character name {string}` | 1 | 93 |
| When | `I hover over the tier {string}` | 1 | 97 |
| When | `I press the Enter key` | 2 | 173 |
| When | `I press the Escape key` | 5 | 169 |
| When | `I reload the page` | 59 | 177 |
| When | `I reload the page immediately` | 1 | 191 |
| Then | `I should see the {string} value displayed` | 1 | 198 |
| When | `I tap on the {string} value` | 1 | 29 |
| When | `I tap on the character name {string}` | 4 | 83 |
| When | `I tap on the tier {string}` | 1 | 88 |
| When | `I tap outside the modal on the backdrop` | 1 | 160 |
| When | `I tap the {badge} badge` | 2 | 58 |
| When | `I tap the modal confirm button` | 3 | 101 |
| When | `I type {string} in the modal input` | 40 | 109 |
| Then | `the {string} value should display {string}` | 6 | 207 |
| Then | `the {string} value should not have changed` | 2 | 216 |
| Then | `the edit modal should open` | 9 | 238 |
| Then | `the input field should be focused` | 1 | 254 |
| Then | `the input field should contain the current {string} value` | 1 | 256 |
| Then | `the input field should receive focus automatically` | 1 | 253 |
| Then | `the modal input should contain {string}` | 11 | 244 |
| Then | `the modal should close` | 21 | 245 |

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
| Then | `an edit modal should appear with value {string}` | 1 | 89 |
| When | `I click on the descriptor field` | 2 | 56 |
| When | `I click on the focus field` | 1 | 62 |
| When | `I enter {string} in the edit field` | 2 | 68 |
| Then | `the descriptor field should be clickable` | 1 | 28 |
| Then | `the descriptor field should be visible` | 1 | 18 |
| Then | `the descriptor field should display placeholder text` | 1 | 4 |
| Then | `the descriptor field should not show placeholder text` | 1 | 73 |
| Then | `the focus field should be clickable` | 1 | 42 |
| Then | `the focus field should be visible` | 1 | 23 |
| Then | `the focus field should display placeholder text` | 1 | 11 |
| Then | `the focus field should not show placeholder text` | 1 | 81 |

## export-enhancement.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a file download should be triggered` | 1 | 161 |
| When | `I cancel the file save dialog` | 1 | 102 |
| When | `I click the Export button` | 7 | 96 |
| When | `I click the Quick Export button` | 1 | 108 |
| When | `I click the Save As button` | 1 | 114 |
| Then | `I should not see an {string} button` | 1 | 130 |
| Then | `I should see a {string} button` | 2 | 125 |
| Then | `I should see an {string} button` | 2 | 120 |
| When | `I view the export buttons` | 1 | 92 |
| Given | `my browser does not support File System Access API` | 1 | 41 |
| Given | `my browser supports File System Access API` | 7 | 5 |
| Then | `no file should be saved` | 1 | 201 |
| Given | `the character name is {string}` | 1 | 69 |
| Then | `the download filename should contain {string}` | 1 | 170 |
| Then | `the download should have correct file structure` | 1 | 178 |
| Then | `the Export button should still be visible` | 1 | 208 |
| Then | `the export dialog should be triggered` | 1 | 226 |
| Then | `the export dialog should be triggered with filename containing {string}` | 1 | 136 |
| Then | `the exported data should have correct structure` | 1 | 148 |
| Then | `the file should be saved without prompting` | 1 | 213 |
| Then | `the suggested filename should be {string}` | 1 | 194 |

## grid-merge-split.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `{string} and {string} are in a grid` | 4 | 58 |
| Then | `{string} should be in its own row` | 9 | 77 |
| When | `I drag the {string} section onto the {zone} of the {string} section` | 9 | 7 |
| Then | `the {string} section should be the last section` | 2 | 48 |
| Then | `the grid should show {string} on the left and {string} on the right` | 8 | 14 |
| Then | `the layout should still be the default layout` | 3 | 32 |
| Then | `the saved layout should pair {string} on the left and {string} on the right` | 1 | 40 |

## i18n.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `artifact level labels should display {string}` | 1 | 95 |
| Then | `cypher level labels should display {string}` | 1 | 85 |
| Given | `I am on the character sheet page with {string}` | 11 | 8 |
| When | `I navigate to the page with {string}` | 1 | 13 |
| Then | `the artifacts heading should be {string}` | 1 | 90 |
| Then | `the background field label should be {string}` | 2 | 108 |
| Then | `the cyphers heading should be {string}` | 1 | 80 |
| Then | `the empty abilities message should be {string}` | 1 | 156 |
| Then | `the empty artifacts message should be {string}` | 1 | 125 |
| Then | `the empty background message should be {string}` | 1 | 135 |
| Then | `the empty cyphers message should be {string}` | 1 | 120 |
| Then | `the empty equipment message should be {string}` | 1 | 151 |
| Then | `the empty notes message should be {string}` | 1 | 143 |
| Then | `the empty oddities message should be {string}` | 1 | 130 |
| Then | `the intellect stat should display {string}` | 1 | 54 |
| Given | `the language is set to {string}` | 4 | 3 |
| Then | `the language should remain German` | 1 | 161 |
| Then | `the load button should display {string}` | 3 | 28 |
| Then | `the might stat should display {string}` | 1 | 43 |
| Then | `the new button should display {string}` | 3 | 33 |
| Then | `the notes field label should be {string}` | 2 | 114 |
| Then | `the oddities heading should be {string}` | 1 | 103 |
| Then | `the page title should be {string}` | 2 | 23 |
| Then | `the page title should be in English` | 2 | 18 |
| Then | `the speed stat should display {string}` | 1 | 49 |
| Then | `the stat current label should be {string}` | 1 | 73 |
| Then | `the stat edge label should be {string}` | 1 | 66 |
| Then | `the stat pool label should be {string}` | 1 | 59 |
| Then | `the stats heading should be {string}` | 1 | 38 |

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
| Given | `I have customized the layout` | 5 | 91 |
| Given | `I have the default layout` | 2 | 127 |
| Given | `I open the settings panel` | 2 | 104 |
| Then | `I should see layout edit mode is active` | 1 | 20 |
| Then | `I should see the {string} button` | 1 | 67 |
| Then | `I should see visual indicators on rearrangeable sections` | 1 | 30 |
| Then | `it should be touch-friendly` | 1 | 78 |
| Given | `layout edit mode is active` | 33 | 41 |
| Then | `layout edit mode should be inactive` | 1 | 50 |
| Then | `the {string} option should be enabled` | 1 | 118 |
| Then | `the layout should return to the default arrangement` | 1 | 108 |
| Then | `the visual indicators should be removed` | 1 | 60 |

## layout-import-export.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I choose to {string}` | 2 | 97 |
| Given | `I have a character file with a different layout` | 3 | 17 |
| Given | `I have a character file with the default layout` | 1 | 32 |
| When | `I import the character file` | 4 | 36 |
| Then | `I should not see a layout choice prompt` | 1 | 74 |
| Then | `I should see a layout choice prompt` | 1 | 67 |
| Then | `I should see options to {string} or {string}` | 1 | 84 |
| Then | `my current layout should be preserved` | 1 | 109 |
| Then | `only the character data should be imported` | 1 | 127 |
| Then | `the character data should be imported` | 1 | 150 |
| Then | `the character should be imported normally` | 1 | 157 |
| Then | `the exported file should contain the layout configuration` | 1 | 4 |
| Then | `the layout from the imported file should be applied` | 1 | 134 |

## recovery-damage-track.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `all recovery checkboxes should be unchecked` | 1 | 144 |
| When | `I click on the recovery modifier display` | 1 | 154 |
| When | `I click the {string} recovery checkbox` | 1 | 176 |
| When | `I confirm the edit` | 3 | 170 |
| When | `I enter {string} in the modifier field` | 1 | 160 |
| When | `I select the {string} damage status` | 1 | 183 |
| Then | `I should see {int} damage status options` | 1 | 47 |
| Then | `I should see {int} recovery roll checkboxes` | 1 | 17 |
| Then | `I should see {string} in the recovery section` | 3 | 132 |
| Then | `I should see a section titled {string}` | 2 | 6 |
| Then | `I should see an edit modal` | 1 | 165 |
| Then | `I should see damage status {string}` | 1 | 52 |
| Then | `I should see damage status {string} with description {string}` | 2 | 57 |
| Then | `I should see recovery roll {string} with time {string}` | 4 | 22 |
| Then | `I should see the recovery modifier display {string}` | 1 | 11 |
| Then | `the {string} radio button should be selected` | 4 | 83 |
| Then | `the {string} radio button should not be selected` | 6 | 89 |
| Then | `the {string} recovery checkbox should be checked` | 2 | 35 |
| Then | `the {string} recovery checkbox should be unchecked` | 3 | 41 |
| Given | `the character has {string} recovery used` | 1 | 31 |
| Given | `the character has recovery modifier {int}` | 2 | 111 |
| Given | `the character is {string}` | 3 | 66 |
| Given | `the character is new` | 1 | 137 |
| Then | `the damage track section should have red styling` | 1 | 103 |
| Then | `the recovery rolls section should have green styling` | 1 | 95 |

## resource-tracker-editing.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `the Armor badge should show {string}` | 5 | 126 |
| Then | `the character data should have armor {int}` | 1 | 180 |
| Then | `the character data should have currentXp {int}` | 1 | 150 |
| Then | `the character data should have effort {int}` | 1 | 200 |
| Then | `the character data should have maxCyphers {int}` | 1 | 190 |
| Then | `the character data should have shins {int}` | 1 | 170 |
| Then | `the character data should have totalXp {int}` | 1 | 160 |
| Given | `the character has {int} {resource}` | 13 | 87 |
| Given | `the character has {int} current XP and {int} total XP` | 9 | 5 |
| Given | `the character has {resource} {int}` | 9 | 94 |
| Given | `the character was saved with a single legacy XP value of {int}` | 1 | 29 |
| Then | `the Current XP badge should show {string}` | 7 | 102 |
| Then | `the Effort badge should show {string}` | 3 | 142 |
| Then | `the Max Cyphers portion of the badge should show {string}` | 3 | 134 |
| Then | `the modal confirm button should be disabled` | 2 | 210 |
| Then | `the modal should show a real validation error, not a raw translation key` | 1 | 215 |
| Then | `the Shins badge should show {string}` | 5 | 118 |
| Then | `the Total XP badge should show {string}` | 5 | 110 |

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
| When | `I hold the {string} section over the {zone} of the {string} section` | 11 | 28 |
| When | `I keep still for a moment` | 8 | 46 |
| When | `I release the section outside the sheet` | 2 | 51 |
| When | `I release the section where it is` | 1 | 64 |
| Then | `no drop preview should be shown` | 1 | 101 |
| Then | `the {string} section should preview {string} in its place` | 1 | 80 |
| Then | `the {string} section should preview {string} on its right` | 1 | 70 |
| Then | `the row of {string} should preview {string} below it` | 1 | 90 |

## section-reordering.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drag the {string} section above the {string} section` | 1 | 44 |
| When | `I exit layout edit mode` | 2 | 108 |
| Given | `I have moved the {string} section to the top` | 1 | 81 |
| Given | `I have reordered sections` | 1 | 6 |
| Then | `the {string} section should appear before the {string} section` | 11 | 51 |
| Then | `the {string} section should still be at the top` | 1 | 116 |
| Then | `the layout should be saved` | 1 | 26 |
| Then | `the sections should remain in the new order` | 1 | 36 |

## section-slide.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I drop the held section onto the {zone} of the {string} section` | 1 | 52 |
| Given | `I prefer reduced motion` | 1 | 48 |
| Then | `no section should have slid` | 1 | 195 |
| Given | `section slides are recorded` | 4 | 22 |
| Then | `the {string} section should be drawn above the {string} section while they slide` | 1 | 155 |
| Then | `the {string} section should slide back to where it was` | 1 | 134 |
| Then | `the {string} section should slide into its new place` | 4 | 117 |

## section-touch-drag.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I long-press the {string} section` | 1 | 15 |
| When | `I long-press the {string} section and drag it above the {string} section` | 1 | 30 |
| When | `I long-press the {string} section and drag it onto the {zone} of the {string} section` | 1 | 60 |
| When | `I swipe from the {string} section towards the {string} section` | 1 | 79 |
| Then | `the {string} section should be in drag mode` | 1 | 23 |
| Then | `the page should have scrolled` | 1 | 103 |

## settings-gear.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am viewing an old version with the version navigator visible` | 1 | 102 |
| Given | `I am viewing the character sheet` | 1 | 5 |
| When | `I click outside the settings panel` | 1 | 53 |
| When | `I click the British flag icon` | 1 | 78 |
| When | `I click the German flag icon` | 2 | 74 |
| When | `I click the settings gear icon` | 2 | 37 |
| Given | `I have opened the settings panel` | 9 | 49 |
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
| Given | `the character data is loaded` | 2 | 3 |

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

## version-comparison-highlighting.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the left pane's restore button` | 2 | 81 |
| When | `I click the return to editing button` | 2 | 121 |
| When | `I click the right pane's restore button` | 1 | 86 |
| Then | `no add or delete button should be present in the comparison view` | 1 | 132 |
| Then | `no field in the comparison view should be editable` | 1 | 125 |
| Then | `the {string} field should be highlighted as changed in the {word} pane` | 2 | 9 |
| Then | `the {string} field should not be highlighted in the {word} pane` | 2 | 18 |
| Then | `the {word} pane should show the newly restored version` | 1 | 96 |
| Then | `the added cypher card should be highlighted as added in the right pane` | 1 | 27 |
| Then | `the left pane should not show the added cypher card` | 1 | 35 |
| Then | `the modified cypher card should be highlighted as changed in the {word} pane` | 2 | 55 |
| Then | `the new cypher name should be highlighted as added in the right pane` | 1 | 73 |
| Then | `the old cypher name should be highlighted as removed in the left pane` | 1 | 63 |
| Then | `the removed cypher card should be highlighted as removed in the left pane` | 1 | 40 |
| Then | `the right pane should not show the removed cypher card` | 1 | 50 |
| Then | `the right pane should still show the same character name as before the restore` | 1 | 106 |
| Then | `the right pane's restore button should be disabled` | 1 | 91 |

## version-comparison-navigation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the left pane's backward arrow` | 3 | 5 |
| When | `I click the left pane's backward arrow {int} time(s)` | 2 | 17 |
| When | `I click the left pane's forward arrow` | 1 | 9 |
| When | `I click the right pane's backward arrow` | 1 | 13 |
| When | `I click the right pane's backward arrow {int} time(s)` | 1 | 28 |
| Then | `the comparison header should indicate there are no differences` | 1 | 96 |
| Then | `the comparison header should list every changed field, not just the top 3` | 1 | 71 |
| Then | `the comparison header should reflect the new left pane version` | 1 | 86 |
| Then | `the left pane should show version {int}` | 5 | 60 |
| Given | `the left pane shows version {int}` | 2 | 52 |
| Then | `the right pane should show version {int}` | 4 | 64 |
| Given | `the right pane shows version {int}` | 1 | 56 |

## version-comparison-setup.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `comparison view is enabled in settings` | 23 | 19 |
| Then | `comparison view should show as enabled in settings` | 1 | 35 |
| Given | `I am viewing the comparison view` | 19 | 39 |
| When | `I close the settings panel` | 2 | 30 |
| When | `I enable comparison view in settings` | 2 | 23 |
| Given | `the character has a version where a cypher was renamed` | 1 | 112 |
| Given | `the character has a version with a modified cypher effect` | 1 | 93 |
| Given | `the character has a version with a name change` | 3 | 58 |
| Given | `the character has a version with a removed cypher` | 1 | 82 |
| Given | `the character has a version with an added cypher` | 1 | 68 |
| Then | `the comparison view should be visible` | 3 | 44 |
| Then | `the comparison view should not be visible` | 3 | 48 |

## version-history-assertions.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Then | `a new version should be created` | 1 | 109 |
| Then | `a new version should be created with description {string}` | 3 | 152 |
| Then | `I click the backward navigation arrow {int} times` | 1 | 178 |
| Then | `I should be viewing the latest version` | 3 | 114 |
| Then | `I should navigate to version {int}` | 2 | 123 |
| Then | `the character data should be correct for version {int}` | 1 | 132 |
| Then | `the character equipment should match version {int} equipment` | 2 | 54 |
| Then | `the character name should match version {int} name` | 4 | 30 |
| Then | `the character stats should match version {int} stats` | 2 | 42 |
| Then | `the exported file should contain version {int} data` | 1 | 86 |
| Then | `the exported file should not contain version history` | 1 | 96 |
| Then | `the exported file should use the current portrait` | 1 | 102 |
| Then | `the import button should be disabled` | 1 | 195 |
| Then | `the import button should be enabled` | 2 | 190 |
| Then | `the oldest version should have been removed` | 2 | 173 |
| Then | `the portrait should remain unchanged` | 3 | 74 |
| Then | `the timestamp should be in human-readable format` | 1 | 12 |
| Then | `the timestamp should show a relative time like {string}` | 1 | 20 |
| Then | `the UI should remain responsive` | 2 | 144 |
| Then | `the version description should contain {string}` | 12 | 4 |
| Then | `the version description should contain the tier change` | 1 | 165 |
| Then | `the warning banner should not be visible` | 2 | 160 |

## version-history-buffer-undo-redo.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I press {string} again` | 2 | 41 |
| When | `I press {string} again before the squash timer expires` | 2 | 75 |
| When | `I press {string} before the squash timer expires` | 11 | 4 |
| Then | `I should see {int} versions in history` | 4 | 136 |
| Then | `no new version should be created yet` | 2 | 121 |
| Then | `the changes should be reapplied` | 2 | 144 |
| Then | `the character name should be {string}` | 10 | 112 |
| Then | `the character name should revert to the original value` | 2 | 127 |

## version-history-given-basic.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I am viewing that version` | 3 | 135 |
| Given | `I am viewing the latest version` | 6 | 45 |
| Given | `I am viewing version {int}` | 8 | 49 |
| Given | `the character has {int} versions in history` | 45 | 16 |
| Given | `the character has a later version` | 1 | 62 |
| Given | `the character has a portrait image` | 2 | 104 |
| Given | `the character has a version from {int} minutes ago` | 1 | 113 |
| Given | `the character has a version with multiple basic info changes` | 2 | 73 |
| Given | `the character has no version history yet` | 7 | 4 |

## version-history-given-data.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| Given | `I have made buffered edits that were undone` | 2 | 122 |
| Given | `the character has {int} versions with different data` | 3 | 64 |
| Given | `the character has {int} versions with different names` | 2 | 97 |
| Given | `the character has a legacy version with a {string} description for a name change and an added ability` | 1 | 34 |
| Given | `the character has a legacy version with an {string} description for an added cypher` | 1 | 4 |

## version-history-mixed-undo-redo.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I make {int} rapid edits that are buffered` | 1 | 5 |
| When | `I press {string} to navigate to previous version` | 1 | 64 |
| When | `I press {string} to undo buffered changes` | 1 | 25 |
| Then | `I should be viewing version {int}` | 1 | 101 |
| When | `I wait for squash timer to complete` | 17 | 60 |

## version-history-navigation.steps.ts

| Keyword | Phrase | Uses | Line |
| --- | --- | ---: | ---: |
| When | `I click the backward navigation arrow` | 18 | 10 |
| When | `I click the backward navigation arrow again` | 1 | 16 |
| When | `I click the forward navigation arrow` | 3 | 28 |
| When | `I click the forward navigation arrow again` | 1 | 34 |
| When | `I click the restore button in the warning banner` | 3 | 40 |
| When | `I click the return to latest button` | 1 | 22 |
| When | `I create a new version by editing the name` | 1 | 112 |
| When | `I navigate backward` | 1 | 81 |
| When | `I navigate forward twice` | 1 | 87 |
| When | `I navigate to version {int}` | 8 | 46 |
| When | `I rapidly click the backward arrow {int} times` | 1 | 95 |
| When | `I refresh the browser` | 7 | 107 |
| When | `I view the character sheet` | 4 | 5 |

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
| When | `I press {string}` | 5 | 28 |
| When | `I wait for {int} milliseconds` | 4 | 16 |
| When | `the squash timer has completed` | 2 | 24 |
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
| Given | `the viewport is {int} pixels wide` | 48 | 9 |

