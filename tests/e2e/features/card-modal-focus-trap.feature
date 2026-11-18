Feature: Card Modal Focus Trap
    As a user editing cards
    I want keyboard focus to stay trapped within card edit modals
    So that I can navigate efficiently with Tab/Shift+Tab without focus escaping

    Background:
        Given I am on the character sheet page

    Scenario: Ability card modal auto-focuses first input field
        When I start a new ability
        Then the first field of the card editor has focus

    Scenario: Tab and Shift+Tab wrap around the ends of the ability card modal
        When I start a new ability
        And I press Shift+Tab 1 time
        Then the last control of the card editor has focus
        When I press the Tab key 1 time
        Then the first field of the card editor has focus

    Scenario Outline: Tabbing never leaves the <kind> card modal
        When I start a new <kind>
        And I tab through every control of the card editor twice
        Then the first field of the card editor has focus

        Examples:
            | kind      |
            | ability   |
            | cypher    |
            | equipment |

    Scenario: Tabbing backwards never leaves the ability card modal
        When I start a new ability
        And I tab backwards through every control of the card editor twice
        Then the first field of the card editor has focus

    Scenario: Escape key closes ability card modal
        When I start a new ability
        And I press Escape in the card editor
        Then the card editor closes

    Scenario: Tab key reaches the description textarea in the ability card modal
        When I start a new ability
        And I press the Tab key 4 times
        Then the description field has focus
