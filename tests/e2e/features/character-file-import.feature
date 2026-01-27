Feature: Character File Import
    As a Numenera player
    I want to import character data from a .numenera file
    So that I can backup and restore my characters across devices

    Background:
        Given I am on the character sheet page

    Scenario: Import valid character from file shows import success
        Given the character sheet is empty
        When I import a valid character file "test-hero.numenera"
        Then the character "Test Hero" should be displayed
        And all character sections should show data

    Scenario: Imported character persists in localStorage
        Given the character sheet is empty
        When I import a valid character file "test-hero.numenera"
        And I reload the page
        Then the character "Test Hero" should still be displayed
        And all character data should be preserved

    Scenario: Import replaces current character
        Given a character is currently displayed
        When I import a valid character file "another-hero.numenera"
        Then the character "Another Hero" should be displayed
        And the previous character should be replaced
