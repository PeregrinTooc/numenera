Feature: Version History Descriptions
    As a user editing my character
    I want each version to describe what changed
    So that I can tell versions apart when reviewing or restoring them

    Background:
        Given my character has no history yet

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
        And my edits have settled into a version
        And I change my name to "Another Change"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Added cypher"

    Scenario: Removing a card shows a specific description
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        When I discard "Detonation (Cell)"
        And my edits have settled into a version
        And I change my name to "Another Change"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Removed cypher"

    Scenario: Modifying a card shows a specific description
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        When I start editing the cypher "Detonation (Cell)"
        And I set its effect to "Updated effect text"
        And I save the card
        And my edits have settled into a version
        And I change my name to "Another Change"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Modified cypher"

    Scenario: Changing the tier shows a specific description
        When I change my tier to 2
        And my edits have settled into a version
        And I change my name to "Another Change"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Changed tier"

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
        And my edits have settled into a version
        And I change my name to "Another Change"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Added cypher"
        And the navigator describes this version as "Added ability"

    Scenario: Version descriptions render in German
        Given the language is set to "de"
        When I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
        And my edits have settled into a version
        And I change my name to "Another Change"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Cypher hinzugefügt"

    Scenario: Version descriptions follow a language switch
        When I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
        And my edits have settled into a version
        And I change my name to "Another Change"
        And my edits have settled into a version
        And I have opened the settings panel
        And I click the German flag icon
        And I step back to the previous version
        Then the navigator describes this version as "Cypher hinzugefügt"

    Scenario: Reloading the app translates an old English description
        Given my history holds an old version recorded as "Added cypher" for an added cypher
        And I have opened the settings panel
        And I click the German flag icon
        When I reopen my character
        And I step back to the previous version
        Then the navigator describes this version as "Cypher hinzugefügt"

    Scenario: Reloading the app upgrades an old "Updated character" description
        Given my history holds an old version recorded as "Updated character" for an added cypher
        When I reopen my character
        And I step back to the previous version
        Then the navigator describes this version as "Added cypher"

    Scenario: Reloading the app upgrades a squashed description containing "Updated character"
        Given my history holds an old version recorded as "Changed name, Updated character" for a name change and an added ability
        When I reopen my character
        And I step back to the previous version
        Then the navigator describes this version as "Changed name"
        And the navigator describes this version as "Added ability"
