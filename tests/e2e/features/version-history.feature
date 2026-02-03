Feature: Version History (Character Time Travel)
    As a user editing my character
    I want to navigate through previous versions of my character
    So that I can review changes and restore old versions if needed

    Background:
        Given I am on the character sheet page
        And the character has no version history yet

    # Version Navigator UI

    Scenario: Version navigator is hidden when no versions exist
        When I view the character sheet
        Then the version navigator should not be visible
        And all edit controls should be enabled

    Scenario: Creating first version shows navigator
        When I edit the "character name" field to "Aria"
        Then the version navigator should be visible
        And the version counter should show "Version 2 of 2"
        And the backward arrow should be enabled
        And the forward arrow should be disabled
        And no warning banner should be visible

    Scenario: Creating multiple versions enables navigation
        Given the character has 3 versions in history
        When I view the character sheet
        Then the version navigator should be visible
        And the version counter should show "Version 3 of 3"
        And the backward arrow should be enabled
        And the forward arrow should be disabled
        And no warning banner should be visible

    Scenario: Navigate backward to previous version
        Given the character has 3 versions in history
        And I am viewing the latest version
        When I click the backward navigation arrow
        Then the version counter should show "Version 2 of 3"
        And the character data should match version 2
        And the change description should be displayed
        And the timestamp should be displayed
        And both navigation arrows should be enabled
        And the warning banner should be visible


    Scenario: Navigate to oldest version
        Given the character has 3 versions in history
        And I am viewing the latest version
        When I click the backward navigation arrow
        And I click the backward navigation arrow again
        Then the version counter should show "Version 1 of 3"
        And the character data should match version 1
        And the backward arrow should be disabled
        And the forward arrow should be enabled
        And the warning banner should be visible


    Scenario: Navigate forward to newer version
        Given the character has 3 versions in history
        And I am viewing version 1
        When I click the forward navigation arrow
        Then the version counter should show "Version 2 of 3"
        And the character data should match version 2
        And both navigation arrows should be enabled
        And the warning banner should be visible


    Scenario: Navigate forward to latest version
        Given the character has 3 versions in history
        And I am viewing version 1
        When I click the forward navigation arrow
        And I click the forward navigation arrow again
        Then the version counter should show "Version 3 of 3"
        And the character data should match version 3
        And the backward arrow should be enabled
        And the forward arrow should be disabled
        And no warning banner should be visible


    Scenario: Restore button saves old version as new latest
        Given the character has 5 versions in history
        And I am viewing version 2
        When I click the restore button in the warning banner
        Then a new version should be created with description "Restored: <version 2 description>"
        And the version counter should show "Version 6 of 6"
        And the character data should match version 2 data
        And no warning banner should be visible
        And the forward arrow should be disabled


    Scenario: Warning banner displays when viewing old version
        Given the character has 3 versions in history
        And I am viewing version 1
        Then the warning banner should be visible
        And the warning banner should contain text "You are viewing an old version"
        And the warning banner should have a restore button


    Scenario: Editing while viewing old version creates new version
        Given the character has 3 versions in history
        And I am viewing version 1
        When I edit the "character name" field to "Time Traveler"
        Then a new version should be created
        And the version counter should show "Version 4 of 4"
        And I should be viewing the latest version
        And no warning banner should be visible


    Scenario: Version description shows what changed
        Given the character has a version with name change
        And I am viewing that version
        Then the version description should contain "Changed name"
        And the timestamp should be in human-readable format

    @wip
    Scenario: Multiple changes show combined description
        Given the character has a version with multiple basic info changes
        And I am viewing that version
        Then the version description should contain "Edited basic info"


    Scenario: Version counter updates correctly
        Given the character has 10 versions in history
        When I navigate to version 5
        Then the version counter should show "Version 5 of 10"
        When I navigate backward
        Then the version counter should show "Version 4 of 10"
        When I navigate forward twice
        Then the version counter should show "Version 6 of 10"


    Scenario: Timestamp displays in readable format
        Given the character has a version from 5 minutes ago
        And I am viewing that version
        Then the timestamp should show a relative time like "5 minutes ago"


    Scenario: Navigation preserves character integrity
        Given the character has 5 versions with different data
        When I navigate to version 2
        Then the character name should match version 2 name
        And the character stats should match version 2 stats
        And the character equipment should match version 2 equipment
        When I navigate to version 4
        Then the character name should match version 4 name
        And the character stats should match version 4 stats
        And the character equipment should match version 4 equipment


    Scenario: Portrait is not affected by version navigation
        Given the character has 3 versions with different names
        And the character has a portrait image
        When I navigate to version 1
        Then the portrait should remain unchanged
        When I navigate to version 2
        Then the portrait should remain unchanged


    Scenario: Export works from old version
        Given the character has 3 versions in history
        And I am viewing version 1
        When I click the export button
        Then the exported file should contain version 1 data
        And the exported file should not contain version history
        And the exported file should use the current portrait

    @wip
    Scenario: Keyboard navigation support
        Given the character has 5 versions in history
        And I am viewing the latest version
        When I focus the backward arrow and press Enter
        Then I should navigate to version 4
        When I focus the forward arrow and press Space
        Then I should navigate to version 5

    # Edge Cases

    Scenario: Rapid navigation through many versions
        Given the character has 20 versions in history
        When I rapidly click the backward arrow 10 times
        Then the version counter should show "Version 10 of 20"
        And the character data should be correct for version 10
        And the UI should remain responsive

    Scenario: Browser refresh preserves current position
        Given the character has 5 versions in history
        And I am viewing version 3
        When I refresh the browser
        Then the version counter should show "Version 5 of 5"
        And I should be viewing the latest version
        And the warning banner should not be visible


    Scenario: Version navigator updates after new edit
        Given the character has 3 versions in history
        And I am viewing the latest version
        When I edit the "tier" field to "2"
        Then the version counter should show "Version 4 of 4"
        And the version description should contain the tier change


    Scenario: Maximum versions (FIFO) updates navigator
        Given the character has 99 versions in history
        When I create a new version by editing the name
        Then the version counter should show "Version 99 of 99"
        And the oldest version should have been removed
        And I can still navigate to version 1 (which was previously version 2)

    Scenario: Squashing after inactivity period
        Given I have a character loaded
        When I edit the "character name" field to "Aria"
        And I wait for 3000 milliseconds
        Then I should see 2 versions in version history
        And the latest version should be marked as squashed
        And the latest version should have squashedCount of 1

    Scenario: Timer resets on subsequent edits
        Given I have a character loaded
        When I edit the "character name" field to "TIMER_TEST_NAME"
        And I wait for 500 milliseconds
        And I edit the "tier" field to "2"
        And I wait for 500 milliseconds
        And I edit the "descriptor" field to "TIMER_TEST_DESC"
        And I wait for 3000 milliseconds
        Then I should see 2 versions in version history
        And the latest version should be marked as squashed
        And the latest version should have squashedCount of 3
        And the latest version description should contain all changes
