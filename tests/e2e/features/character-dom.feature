Feature: Character Sheet DOM Structure
    As a developer
    I want to verify the DOM structure of the character sheet
    So that styling and responsive behavior work correctly

    Background:
        Given I am on the character sheet page

    Scenario: Verify essential data-testid attributes exist
        Then the following elements should exist in the DOM:
            | Element             | data-testid         |
            | Character Header    | character-header    |
            | Page Title          | page-title          |
            | Character Name      | character-name      |
            | Load Button         | load-button         |
            | New Button          | new-button          |
            | Basic Info Section  | basic-info          |
            | Stats Section       | stats-section       |
            | Cyphers Section     | cyphers-section     |
            | Artifacts Section   | artifacts-section   |
            | Oddities Section    | oddities-section    |
            | Text Fields Section | text-fields-section |

    Scenario: Verify basic info field structure (sentence format)
        Then the following elements should exist in the DOM:
            | Element              | data-testid           |
            | Character Name       | character-name        |
            | Character Tier       | character-tier        |
            | Character Type       | character-type-select |
            | Character Descriptor | character-descriptor  |
            | Character Focus      | character-focus       |

    Scenario: Verify stat pool DOM structure
        Then each stat pool should have the following elements:
            | Stat      | Container testid | Label testid         | Pool testid         | Edge testid         | Current testid         |
            | Might     | stat-might       | stat-might-label     | stat-might-pool     | stat-might-edge     | stat-might-current     |
            | Speed     | stat-speed       | stat-speed-label     | stat-speed-pool     | stat-speed-edge     | stat-speed-current     |
            | Intellect | stat-intellect   | stat-intellect-label | stat-intellect-pool | stat-intellect-edge | stat-intellect-current |

    Scenario: Verify items section DOM structure
        Then the cyphers section should have a heading with testid "cyphers-heading"
        And the cyphers section should have a list with testid "cyphers-list"
        And the artifacts section should have a heading with testid "artifacts-heading"
        And the artifacts section should have a list with testid "artifacts-list"
        And the oddities section should have a heading with testid "oddities-heading"
        And the oddities section should have a list with testid "oddities-list"

    Scenario: Verify text fields container structure
        Then the following elements should exist in the DOM:
            | Element             | data-testid          |
            | Background Textarea | character-background |
            | Notes Textarea      | character-notes      |

    Scenario: Verify empty state DOM markers
        When I click the new button
        Then the element with testid "empty-cyphers" should be visible
        And the element with testid "empty-artifacts" should be visible
        And the element with testid "empty-oddities" should be visible
        And the element with testid "empty-equipment" should be visible
        And the element with testid "empty-abilities" should be visible

    Scenario: Verify item collections have correct testids
        Then I should see 2 elements with testid starting with "cypher-item"
        And I should see 1 element with testid starting with "artifact-item"
        And I should see 2 elements with testid starting with "oddity-item"

    Scenario: Count button elements in header
        Then I should see exactly 4 buttons in the character header
        And the load button should have testid "load-button"
        And the import button should have testid "import-button"
        And the export button should have testid "export-button"
        And the new button should have testid "new-button"

    @responsive @skip
    Scenario: Verify responsive layout classes at mobile (320px)
        Given I am viewing on a mobile device with width "320px"
        Then the stats section should use responsive mobile classes
        And the character sheet should be mobile-optimized

    @responsive @skip
    Scenario: Verify responsive layout classes at desktop (1280px)
        Given I am viewing on a desktop device with width "1280px"
        Then the stats section should use responsive desktop classes
        And the character sheet should use multi-column layout
