Feature: Version History Undo and Redo
    As a user editing my character
    I want to undo and redo changes with keyboard shortcuts
    So that I can step back and forward through my edits, including ones not yet saved as a version

    Background:
        Given I am on the character sheet page
        And the character has no version history yet

    # Keyboard Shortcuts (Ctrl+Z/Y with Buffer Support)

    Scenario: Undo unsquashed changes in buffer
        Given the character has 3 versions in history
        When I edit the "character name" field to "First Edit"
        And I edit the "character name" field to "Second Edit"
        And I press "Control+Z" before the squash timer expires
        Then the character name should be "First Edit"
        And no new version should be created yet
        When I press "Control+Z" again
        Then the character name should revert to the original value
        And I should see 3 versions in history

    Scenario: Redo unsquashed changes in buffer
        Given the character has 3 versions in history
        And I have made buffered edits that were undone
        When I press "Control+Y"
        Then the changes should be reapplied

    Scenario: Redo with Ctrl+Shift+Z
        Given the character has 3 versions in history
        And I have made buffered edits that were undone
        When I press "Control+Shift+Z"
        Then the changes should be reapplied

    Scenario: Adding a card after prior edits does not duplicate buffer entries
        Given the character has 3 versions in history
        When I edit the "character name" field to "Edit 1"
        And I edit the "character name" field to "Edit 2"
        And I click the add cypher button
        And I fill in the cypher name with "Test Cypher"
        And I fill in the cypher level with "1d6"
        And I fill in the cypher effect with "Test effect"
        And I confirm the card edit modal
        Then the undo buffer should contain exactly 3 changes
        And no new version should be created yet

    Scenario: Undo navigates through squashed versions
        Given the character has 5 versions in history
        And I am viewing the latest version
        And the squash timer has completed
        When I press "Control+Z"
        Then I should navigate to version 4
        And the warning banner should be visible

    Scenario: Mixed undo/redo with buffer and versions
        Given the character has 3 versions in history
        When I make 2 rapid edits that are buffered
        And I press "Control+Z" to undo buffered changes
        And I wait for squash timer to complete
        And I press "Control+Z" to navigate to previous version
        Then I should be viewing version 3
        And the warning banner should be visible
        When I press "Control+Y"
        Then I should navigate to version 4
        And the warning banner should not be visible

    Scenario: Card operations work with buffer undo/redo
        Given I am on the character sheet page
        And I should see 7 ability cards
        When I click the add ability button
        And I fill in the ability name with "Test Ability"
        And I fill in the ability cost with "3"
        And I fill in the ability pool with "Might"
        And I fill in the ability description with "A test ability"
        And I confirm the card edit modal
        Then I should see 8 ability cards
        When I press "Control+Z" before the squash timer expires
        Then I should see 7 ability cards
        When I press "Control+Y" before the squash timer expires
        Then I should see 8 ability cards
        And I should see an ability card with name "Test Ability"
        When I press "Control+Z" before the squash timer expires
        Then I should see 7 ability cards
        When I press "Control+Y" before the squash timer expires
        Then I should see 8 ability cards
        And I should see an ability card with name "Test Ability"

    Scenario: Deleting a card creates a version
        Given I am on the character sheet page
        And I should see 2 cypher cards
        When I click the delete button on the first cypher
        Then I should see 1 cypher card
        When I press "Control+Z" before the squash timer expires
        Then I should see 2 cypher cards
        When I press "Control+Y" before the squash timer expires
        Then I should see 1 cypher card
        When I wait for squash timer to complete
        Then the version navigator should be visible
        And the version counter should show "Version 2 of 2"
        When I click the backward navigation arrow
        Then the version counter should show "Version 1 of 2"
        And the warning banner should be visible
        And I should see 2 cypher cards
        When I click the restore button in the warning banner
        Then I should see 2 cypher cards
        And the version counter should show "Version 3 of 3"
        And no warning banner should be visible

    Scenario: Importing a character creates a version
        Given I am on the character sheet page
        And the character has no version history yet
        When I import a valid character file "test-hero.numenera"
        And I wait for squash timer to complete
        Then the version navigator should be visible
        And the version counter should show "Version 2 of 2"

    Scenario: Import button is disabled when viewing old version
        Given the character has 3 versions in history
        And I am viewing the latest version
        Then the import button should be enabled
        When I click the backward navigation arrow
        Then the import button should be disabled
        When I click the forward navigation arrow
        Then the import button should be enabled

    Scenario: Redo changes persist correctly after reload
        Given the character has 3 versions in history
        When I edit the "character name" field to "First Edit"
        And I edit the "character name" field to "Second Edit"
        And I press "Control+Z" before the squash timer expires
        Then the character name should be "First Edit"
        When I press "Control+Y" before the squash timer expires
        Then the character name should be "Second Edit"
        When I refresh the browser
        Then the character name should be "Second Edit"
        And I should see 4 versions in history

    Scenario: Buffered edit survives a reload before the squash timer expires
        Given the character has 3 versions in history
        When I edit the "character name" field to "Unsquashed Hero"
        And I refresh the browser
        Then the character name should be "Unsquashed Hero"
        And I should see 4 versions in history
        When I edit the "character name" field to "Later Hero"
        And I wait for squash timer to complete
        And I click the backward navigation arrow
        Then the character name should be "Unsquashed Hero"
        And the version description should contain "Changed name"

    Scenario: Version navigation updates UI immediately
        Given the character has 5 versions in history
        And I am viewing the latest version
        And the squash timer has completed
        When I press "Control+Z"
        Then the character name should match version 4 name
        And the version counter should show "Version 4 of 5"
        When I press "Control+Z" again
        Then the character name should match version 3 name
        And the version counter should show "Version 3 of 5"

    Scenario: Buffer undo/redo maintains state consistency
        Given the character has 3 versions in history
        When I edit the "character name" field to "Buffer Edit 1"
        And I edit the "character name" field to "Buffer Edit 2"
        And I press "Control+Z" before the squash timer expires
        And I press "Control+Z" again before the squash timer expires
        Then the character name should revert to the original value
        When I press "Control+Y" before the squash timer expires
        Then the character name should be "Buffer Edit 1"
        When I press "Control+Y" again before the squash timer expires
        Then the character name should be "Buffer Edit 2"
        When I refresh the browser
        Then the character name should be "Buffer Edit 2"
