Feature: Card Modal Focus Trap
    As a user editing cards
    I want keyboard focus to stay trapped within card edit modals
    So that I can navigate efficiently with Tab/Shift+Tab without focus escaping

    Background:
        Given I am on the character sheet page

    Scenario: Ability card modal auto-focuses first input field
        When I start a new ability
        Then the first field of the card editor has focus

    Scenario: Tab key traps focus within ability card modal - forward navigation
        When I start a new ability
        And I press the Tab key 1 time
        Then focus stays within the card editor
        When I press the Tab key 10 times
        Then focus stays within the card editor

    Scenario: Shift+Tab key traps focus within ability card modal - backward navigation
        When I start a new ability
        And I press Shift+Tab 1 time
        Then focus stays within the card editor
        When I press Shift+Tab 10 times
        Then focus stays within the card editor

    Scenario: Focus cannot escape ability card modal after many Tab presses
        When I start a new ability
        And I press the Tab key 20 times
        Then focus stays within the card editor

    Scenario: Escape key closes ability card modal
        When I start a new ability
        And I press Escape in the card editor
        Then the card editor closes

    Scenario: Cypher card modal has working focus trap
        When I start a new cypher
        And I press the Tab key 15 times
        Then focus stays within the card editor

    Scenario: Equipment card modal has working focus trap
        When I start a new equipment
        And I press the Tab key 15 times
        Then focus stays within the card editor

    Scenario: Tab key reaches the description textarea in the ability card modal
        When I start a new ability
        And I press the Tab key 4 times
        Then the description field has focus
