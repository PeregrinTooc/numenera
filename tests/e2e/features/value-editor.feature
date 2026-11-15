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

    Scenario: Clicking outside the editor dismisses it without changing the value
        When I click my Might pool
        And I enter 99 in the value editor
        And I click outside the value editor
        Then the value editor is closed
        And my character sheet shows my Might pool as 10

    Scenario: Tabbing never leaves the editor
        When I click my Might pool
        Then the value editor keeps the keyboard focus inside itself

    Scenario: A number is edited with a numeric keypad
        When I click my Might pool
        Then the value editor shows a numeric keypad

    Scenario: The editor is announced as a dialog
        When I click my Might pool
        Then the value editor is a dialog

    Scenario: The editor dims the sheet behind it
        When I click my Might pool
        Then the value editor dims the sheet behind it

    Scenario: The editor's buttons carry icons
        When I click my Might pool
        Then the value editor has an icon on its confirm and cancel buttons

    Scenario: A value that can be edited looks clickable
        Then my Might pool looks clickable

    # The editor's phone layout exists only on a phone.
    @phone-only
    Scenario: On a phone the editor fits the screen with controls big enough to tap
        When I click my Might pool
        Then the value editor fits the screen
        And the value editor's controls are big enough to tap

    @phone-only
    Scenario: On a phone a value is big enough to tap
        Then my Might pool is big enough to tap
