Feature: Character File Export
    As a Numenera player
    I want to export my character to a .numenera file
    So that I can backup and share my character data

    Background:
        Given I am on the character sheet page

    Scenario: Export button creates downloadable file
        Given the character has name "Kael"
        When I click the export button
        Then a file export should be triggered
        And the exported filename should be "kael.numenera"

    Scenario: Exported file contains complete character data
        Given the character has name "Test Hero"
        When I click the export button
        Then the exported file should contain all character properties
        And the exported file should have version "1.0"
        And the exported file should have schemaVersion "1.0.0"
        And the exported file should have an exportDate

    Scenario: Export handles special characters in character name
        Given the character has name "Test @#$ Character!"
        When I click the export button
        Then the exported filename should be "test-character.numenera"