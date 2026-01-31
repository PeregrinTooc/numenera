Feature: Auto-Save Indicator
    As a Numenera player
    I want to see when my character was last saved
    So that I can have confidence my changes are persisted

    Background:
        Given I am on the character sheet page

    Scenario: Save indicator appears after first edit
        Given the character sheet is displayed
        When I edit the character name to "Test Hero"
        Then the save indicator should be visible
        And the save indicator should show a timestamp
        And the save indicator should contain "Last saved:"

    Scenario: Save indicator updates timestamp on subsequent edits
        Given the character sheet is displayed
        And I edit the character name to "Test Hero"
        And I note the current save timestamp
        When I wait for 1 second
        And I edit the tier to "2"
        Then the save timestamp should be updated

    Scenario: Save indicator is debounced
        Given the character sheet is displayed
        When I rapidly edit the character name multiple times
        Then the character should be saved only once after changes stop
        And the save indicator should show a single timestamp

    Scenario: Save indicator persists across sections
        Given the character sheet is displayed
        When I edit the character name to "Test Hero"
        And the save indicator should be visible
        When I edit the might pool to "15"
        Then the save indicator should still be visible
        And the save timestamp should be updated

    Scenario: Save indicator is positioned in lower-right corner
        Given the character sheet is displayed
        When I edit the character name to "Test Hero"
        Then the save indicator should be in the lower-right corner
        And the save indicator should have subtle styling