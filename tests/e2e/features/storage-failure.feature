Feature: Storage failure is reported
    As a Numenera player
    I want to be told when my changes cannot be saved
    So that I do not believe an edit is safe when it will be lost on reload

    Background:
        Given I am on the character sheet page

    Scenario: A full storage is reported after an edit
        Given the browser storage is full
        When I edit the "character name" field to "Test Hero"
        Then the save indicator should report that storage is full

    Scenario: Any other write failure is reported as a failed save
        Given writing to the browser storage fails
        When I edit the "character name" field to "Test Hero"
        Then the save indicator should report that changes could not be saved

    Scenario: The last successful save time is not shown while saving fails
        Given I edit the "character name" field to "First Hero"
        And the save indicator should contain "Last saved:"
        And the browser storage is full
        When I edit the "character name" field to "Second Hero"
        Then the save indicator should report that storage is full
        And the save indicator should not contain "Last saved:"

    Scenario: The report disappears once saving works again
        Given the browser storage is full
        And I edit the "character name" field to "Test Hero"
        And the save indicator should report that storage is full
        When the browser storage works again
        And I edit the "character name" field to "Recovered Hero"
        Then the save indicator should contain "Last saved:"
        And the save indicator should not report a storage problem

    Scenario: Adding a card on a full storage is reported
        Given the browser storage is full
        When I click the add cypher button
        And I fill in the cypher name with "Fire Bomb"
        And I fill in the cypher level with "1d6+2"
        And I fill in the cypher effect with "Explodes in a short range"
        And I confirm the card edit modal
        Then the save indicator should report that storage is full

    Scenario: The report does not cover the card controls
        Given the browser storage is full
        When I edit the "character name" field to "Test Hero"
        Then the save indicator should report that storage is full
        And the save indicator should be inside the viewport
