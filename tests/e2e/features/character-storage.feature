Feature: Character Storage and State Management
    As a Numenera player
    I want my character data to persist
    So that I don't lose my work between sessions

    @wip
    Scenario: Load hard-coded character via load button
        Given I am on the character sheet page
        And the character sheet is empty
        When I click the "Load" button
        Then the character "Kael the Wanderer" should be displayed
        And all character sections should show data

    Scenario: Clear character data via clear button
        Given I am on the character sheet page
        And a character is currently displayed
        When I click the "Clear" button
        Then the character sheet should show empty states
        And all sections should display empty state messages

    @wip
    Scenario: Character state persists across page reloads
        Given I am on the character sheet page
        When I click the "Load" button
        Then the character should be displayed
        When I reload the page
        Then the same character should still be displayed
        And all character data should be preserved
