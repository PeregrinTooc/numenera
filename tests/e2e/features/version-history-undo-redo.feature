Feature: Version History Undo and Redo
    As a user editing my character
    I want to undo and redo changes with keyboard shortcuts
    So that I can step back and forward through my edits, including ones not yet saved as a version

    Background:
        Given I am on the character sheet page
        And the character has no version history yet

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
        And I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
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
        Given my character has 2 abilities
        When I start a new ability
        And I set its name to "Test Ability"
        And I set its cost to "3"
        And I set its pool to "Might"
        And I set its description to "A test ability"
        And I save the card
        Then my character carries 3 abilities
        When I press "Control+Z" before the squash timer expires
        Then my character carries 2 abilities
        When I press "Control+Y" before the squash timer expires
        Then my character carries 3 abilities
        And my character carries the ability "Test Ability"
        When I press "Control+Z" before the squash timer expires
        Then my character carries 2 abilities
        When I press "Control+Y" before the squash timer expires
        Then my character carries 3 abilities
        And my character carries the ability "Test Ability"

    Scenario: Deleting a card creates a version
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        When I discard "Detonation (Cell)"
        Then my character's cyphers are only "Stim (Injector)"
        When I press "Control+Z" before the squash timer expires
        Then my character carries 2 cyphers
        When I press "Control+Y" before the squash timer expires
        Then my character's cyphers are only "Stim (Injector)"
        When I wait for squash timer to complete
        Then the version navigator should be visible
        And the version counter should show "Version 2 of 2"
        When I click the backward navigation arrow
        Then the version counter should show "Version 1 of 2"
        And the warning banner should be visible
        And my character carries 2 cyphers
        When I click the restore button in the warning banner
        Then my character carries 2 cyphers
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
