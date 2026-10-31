Feature: Version History Descriptions
    As a user editing my character
    I want each version to describe what changed
    So that I can tell versions apart when reviewing or restoring them

    Background:
        Given I am on the character sheet page
        And the character has no version history yet

    # Meaningful Version Descriptions (detectChanges wiring)

    # These scenarios each create one extra trailing version (a name edit)
    # after the change under test, so the change under test is no longer the
    # latest version — its description only renders in the (non-latest)
    # warning banner, per "Version description shows what changed" above.

    Scenario: Adding a card shows a specific description
        Given I am on the character sheet page
        When I click the add cypher button
        And I fill in the cypher name with "Test Cypher"
        And I fill in the cypher level with "1d6"
        And I fill in the cypher effect with "Test effect"
        And I confirm the card edit modal
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Added cypher"

    Scenario: Removing a card shows a specific description
        Given I am on the character sheet page
        And I should see 2 cypher cards
        When I click the delete button on the first cypher
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Removed cypher"

    Scenario: Modifying a card shows a specific description
        Given I am on the character sheet page
        When I click the edit button on cypher "Detonation (Cell)"
        And I fill in the cypher effect with "Updated effect text"
        And I confirm the card edit modal
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Modified cypher"

    Scenario: Different collection changes in one squash window list individually
        Given I am on the character sheet page
        When I click the add cypher button
        And I fill in the cypher name with "Test Cypher"
        And I fill in the cypher level with "1d6"
        And I fill in the cypher effect with "Test effect"
        And I confirm the card edit modal
        And I click the add ability button
        And I fill in the ability name with "Test Ability"
        And I fill in the ability cost with "3"
        And I fill in the ability pool with "Might"
        And I fill in the ability description with "A test ability"
        And I confirm the card edit modal
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Added cypher"
        And the version description should contain "Added ability"

    Scenario: Version descriptions render in German
        Given I have opened the settings panel
        And I click the German flag icon
        When I click the add cypher button
        And I fill in the cypher name with "Test Cypher"
        And I fill in the cypher level with "1d6"
        And I fill in the cypher effect with "Test effect"
        And I confirm the card edit modal
        And I wait for squash timer to complete
        And I edit the "character name" field to "Another Change"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the version description should contain "Zypher hinzugefügt"

    # Legacy Description Migration

    Scenario: Reloading the app upgrades an old "Updated character" description
        Given I am on the character sheet page
        And the character has a legacy version with an "Updated character" description for an added cypher
        When I refresh the browser
        And I click the backward navigation arrow
        Then the version description should contain "Added cypher"

    Scenario: Reloading the app upgrades a squashed description containing "Updated character"
        Given I am on the character sheet page
        And the character has a legacy version with a "Changed name, Updated character" description for a name change and an added ability
        When I refresh the browser
        And I click the backward navigation arrow
        Then the version description should contain "Changed name"
        And the version description should contain "Added ability"
