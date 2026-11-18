Feature: Character File Import
    As a Numenera player
    I want to import character data from a .numenera file
    So that I can backup and restore my characters across devices

    Background:
        Given I am on the character sheet page

    Scenario: Import a character from a file
        Given the character sheet is empty
        When I import a valid character file "test-hero.numenera"
        Then the character "Test Hero" should be displayed
        And all of the character's entries and notes are shown

    Scenario: An imported character is still there next time
        Given the character sheet is empty
        When I import a valid character file "test-hero.numenera"
        And I reload the page
        Then the character "Test Hero" should still be displayed
        And all of the character's entries and notes are shown

    Scenario: Import replaces current character
        Given I have loaded the sample character
        When I import a valid character file "another-hero.numenera"
        Then the character "Another Hero" should be displayed
        And all of the character's entries and notes are shown
        And none of the sample character's entries are left
