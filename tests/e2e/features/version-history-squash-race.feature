Feature: Version History Squash Race
    As a user editing my character
    I want an edit made while a version is being saved to be kept
    So that no change silently drops out of my history

    Background:
        Given my character has no history yet

    Scenario: An edit made while a version is being saved is not lost
        Given saving a version is held up
        When I change my name to "Squashing Hero"
        And my edits start to be saved as a version
        And I change my name to "Late Hero"
        And the held-up save goes through
        And my edits have settled into a version
        Then the navigator shows version 3 of 3
        And my character sheet shows my name as "Late Hero"
        When I step back to the previous version
        Then my character sheet shows my name as "Squashing Hero"
