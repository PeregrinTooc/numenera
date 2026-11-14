Feature: Version History Descriptions
    As a user editing my character
    I want each version to describe what changed
    So that I can tell versions apart when reviewing or restoring them

    Background:
        Given I am on the character sheet page
        And the character has no version history yet

    # These scenarios each create one extra trailing version (a name edit)
    # after the change under test, so the change under test is no longer the
    # latest version — its description only renders in the (non-latest)
    # warning banner, per "Version description shows what changed" above.

    Scenario: Adding a card shows a specific description
        When I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Added cypher"

    Scenario: Removing a card shows a specific description
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        When I discard "Detonation (Cell)"
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Removed cypher"

    Scenario: Modifying a card shows a specific description
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        When I start editing the cypher "Detonation (Cell)"
        And I set its effect to "Updated effect text"
        And I save the card
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Modified cypher"

    Scenario: Different collection changes in one squash window list individually
        When I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
        And I start a new ability
        And I set its name to "Test Ability"
        And I set its cost to "3"
        And I set its pool to "Might"
        And I set its description to "A test ability"
        And I save the card
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Added cypher"
        And the version description should contain "Added ability"

    Scenario: Version descriptions render in German
        Given I have opened the settings panel
        And I click the German flag icon
        When I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Cypher hinzugefügt"

    Scenario: Version descriptions follow a language switch
        When I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I have opened the settings panel
        And I click the German flag icon
        And I click the backward navigation arrow
        Then the version description should contain "Cypher hinzugefügt"

    Scenario: Reloading the app translates an old English description
        Given the character has a legacy version with an "Added cypher" description for an added cypher
        And I have opened the settings panel
        And I click the German flag icon
        When I refresh the browser
        And I click the backward navigation arrow
        Then the version description should contain "Cypher hinzugefügt"

    Scenario: Reloading the app upgrades an old "Updated character" description
        Given the character has a legacy version with an "Updated character" description for an added cypher
        When I refresh the browser
        And I click the backward navigation arrow
        Then the version description should contain "Added cypher"

    Scenario: Reloading the app upgrades a squashed description containing "Updated character"
        Given the character has a legacy version with a "Changed name, Updated character" description for a name change and an added ability
        When I refresh the browser
        And I click the backward navigation arrow
        Then the version description should contain "Changed name"
        And the version description should contain "Added ability"
