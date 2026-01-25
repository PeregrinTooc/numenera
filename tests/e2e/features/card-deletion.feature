Feature: Card Deletion
    As a user
    I want to delete cards from various sections
    So that I can remove unwanted items from my character sheet

    Background:
        Given I am on the character sheet page
        When I click the "Load" button

    Scenario: Delete button is visible on cypher cards
        When I look at a cypher card
        Then I should see a delete button on the cypher card

    Scenario: Delete button is visible on equipment cards
        When I look at an equipment card
        Then I should see a delete button on the equipment card

    Scenario: Delete button is visible on artifact cards
        When I look at an artifact card
        Then I should see a delete button on the artifact card

    Scenario: Delete button is visible on oddity cards
        When I look at an oddity card
        Then I should see a delete button on the oddity card

    Scenario: Delete button is visible on attack cards
        When I look at an attack card
        Then I should see a delete button on the attack card

    Scenario: Delete button is visible on ability cards
        When I look at an ability card
        Then I should see a delete button on the ability card

    Scenario: Delete button is visible on special ability cards
        When I look at a special ability card
        Then I should see a delete button on the special ability card

    Scenario: Delete a cypher card
        Given I have 2 cyphers
        When I click the delete button on the first cypher
        Then the cypher should be removed from the DOM
        And I should have 1 cypher remaining
        When I reload the page
        Then I should have 1 cypher remaining

    Scenario: Delete an equipment card
        Given I have 4 equipment items
        When I click the delete button on the first equipment item
        Then the equipment item should be removed from the DOM
        And I should have 3 equipment items remaining
        When I reload the page
        Then I should have 3 equipment items remaining

    Scenario: Delete an artifact card
        Given I have 1 artifact
        When I click the delete button on the first artifact
        Then the artifact should be removed from the DOM
        And I should have 0 artifacts remaining
        When I reload the page
        Then I should have 0 artifacts remaining

    Scenario: Delete an oddity card
        Given I have 2 oddities
        When I click the delete button on the first oddity
        Then the oddity should be removed from the DOM
        And I should have 1 oddity remaining
        When I reload the page
        Then I should have 1 oddity remaining

    Scenario: Delete an attack card
        Given I have 2 attacks
        When I click the delete button on the first attack
        Then the attack should be removed from the DOM
        And I should have 1 attack remaining
        When I reload the page
        Then I should have 1 attack remaining

    Scenario: Delete an ability card
        Given I have 7 abilities
        When I click the delete button on the first ability
        Then the ability should be removed from the DOM
        And I should have 6 abilities remaining
        When I reload the page
        Then I should have 6 abilities remaining

    Scenario: Delete a special ability card
        Given I have 2 special abilities
        When I click the delete button on the first special ability
        Then the special ability should be removed from the DOM
        And I should have 1 special ability remaining
        When I reload the page
        Then I should have 1 special ability remaining

    Scenario: Delete multiple cards in sequence
        Given I have 2 cyphers
        When I click the delete button on the first cypher
        And I click the delete button on the first cypher again
        Then I should have 0 cyphers remaining

    Scenario: Deletion persists in localStorage
        Given I have 2 cyphers
        When I click the delete button on the first cypher
        And I reload the page
        Then I should have 1 cypher remaining

    Scenario: Delete button is positioned in top-left corner
        When I look at a cypher card
        Then the delete button should be in the top-left corner of the card

    Scenario: Delete without confirmation dialog
        Given I have 2 cyphers
        When I click the delete button on the first cypher
        Then the cypher should be removed immediately
        And I should not see a confirmation dialog