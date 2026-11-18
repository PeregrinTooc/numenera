Feature: Character File Export
    As a Numenera player
    I want to export my character to a .numenera file
    So that I can backup and share my character data

    Background:
        Given I am on the character sheet page

    Scenario: Export saves a file named after the character
        Given the character has name "Kael"
        When I export my character
        Then the exported filename should be "kael.numenera"

    Scenario: Exported file contains complete character data
        Given the character has name "Test Hero"
        When I export my character
        Then the exported file should contain all character properties
        And the exported file should have version "1.0"
        And the exported file should have schemaVersion "1.0.0"
        And the exported file should have an exportDate

    Scenario: Export handles special characters in character name
        Given the character has name "Test @#$ Character!"
        When I export my character
        Then the exported filename should be "test-character.numenera"