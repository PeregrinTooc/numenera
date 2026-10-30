Feature: Version History Squash Race
    As a user editing my character
    I want edits made while a version is being saved to get their own version
    So that no change silently drops out of my history

    Background:
        Given I am on the character sheet page
        And the character has no version history yet

    Scenario: Edit made while a squash is saving gets its own version
        Given version saves are held
        When I edit the "character name" field to "Squashing Hero"
        And the squash starts while version saves are held
        And I edit the "character name" field to "Late Hero"
        And the held version save is released
        And I wait for squash timer to complete
        Then I should see 3 versions in history
