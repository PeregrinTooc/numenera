Feature: Value editor
    As a Numenera player
    I want a small editor to open when I click a value on my sheet
    So that I can change that value quickly, with the keyboard or the mouse

    Background:
        Given my character's Might pool is 10

    Scenario: Clicking a value opens the editor ready for typing
        When I click my Might pool
        Then the value editor is open showing 10
        And the value editor has the keyboard focus

    Scenario: Enter confirms the new value
        When I click my Might pool
        And I enter 14 in the value editor
        And I press Enter in the value editor
        Then the value editor is closed
        And my character sheet shows my Might pool as 14

    Scenario: Escape dismisses the editor without changing the value
        When I click my Might pool
        And I enter 99 in the value editor
        And I press Escape in the value editor
        Then the value editor is closed
        And my character sheet shows my Might pool as 10

    Scenario: Cancelling leaves the value unchanged
        When I click my Might pool
        And I enter 99 in the value editor
        And I cancel the value editor
        Then the value editor is closed
        And my character sheet shows my Might pool as 10
