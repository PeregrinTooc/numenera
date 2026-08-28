Feature: Version Comparison View
    As a user reviewing my character's history
    I want to see two versions side by side with differences highlighted
    So that I can understand exactly what changed between them

    Background:
        Given I am on the character sheet page
        And the character has no version history yet

    # Settings toggle (opt-in, off by default)

    Scenario: Comparison view is off by default
        Given the character has 3 versions in history
        When I click the backward navigation arrow
        Then the version counter should show "Version 2 of 3"
        And the comparison view should not be visible

    Scenario: Enabling comparison view in settings
        Given the character has 3 versions in history
        And I have opened the settings panel
        When I enable comparison view in settings
        And I close the settings panel
        And I click the backward navigation arrow
        Then the comparison view should be visible

    Scenario: Comparison view preference persists across reload
        Given I have opened the settings panel
        When I enable comparison view in settings
        And I close the settings panel
        And I refresh the browser
        And I have opened the settings panel
        Then comparison view should show as enabled in settings

    # Opening and default versions

    Scenario: Opening comparison view defaults to the last two versions
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        When I click the backward navigation arrow
        Then the comparison view should be visible
        And the right pane should show version 5
        And the left pane should show version 4

    Scenario: Comparison view is unavailable with fewer than two versions
        Given comparison view is enabled in settings
        And the character has no version history yet
        Then the version navigator should not be visible

    # Independent per-pane navigation

    Scenario: Navigating the left pane does not move the right pane
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        And I am viewing the comparison view
        When I click the left pane's backward arrow
        Then the left pane should show version 3
        And the right pane should show version 5

    Scenario: Navigating the right pane does not move the left pane
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        And I am viewing the comparison view
        When I click the right pane's backward arrow
        Then the right pane should show version 4
        And the left pane should show version 4

    Scenario: Either pane can be moved to an arbitrary version
        Given comparison view is enabled in settings
        And the character has 10 versions in history
        And I am viewing the comparison view
        When I click the left pane's backward arrow 8 times
        And I click the right pane's backward arrow 1 time
        Then the left pane should show version 1
        And the right pane should show version 9

    # Change header

    Scenario: Header lists every changed field between the two panes
        Given comparison view is enabled in settings
        And the character has a version with multiple basic info changes
        And I am viewing the comparison view
        When I click the left pane's backward arrow
        Then the comparison header should list every changed field, not just the top 3

    Scenario: Header updates when either pane moves
        Given comparison view is enabled in settings
        And the character has 5 versions with different data
        And I am viewing the comparison view
        When I click the left pane's backward arrow
        Then the comparison header should reflect the new left pane version

    Scenario: Header shows no differences when both panes show the same version
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        And I am viewing the comparison view
        When I click the left pane's forward arrow
        Then the left pane should show version 5
        And the comparison header should indicate there are no differences

    # Highlighting

    Scenario: A changed scalar field is highlighted yellow in both panes
        Given comparison view is enabled in settings
        And the character has a version with a name change
        And I am viewing the comparison view
        Then the "character name" field should be highlighted as changed in the left pane
        And the "character name" field should be highlighted as changed in the right pane

    Scenario: An added cypher is highlighted green in the right pane only
        Given comparison view is enabled in settings
        And the character has a version with an added cypher
        And I am viewing the comparison view
        Then the added cypher card should be highlighted as added in the right pane
        And the left pane should not show the added cypher card

    Scenario: A removed cypher is highlighted red in the left pane only
        Given comparison view is enabled in settings
        And the character has a version with a removed cypher
        And I am viewing the comparison view
        Then the removed cypher card should be highlighted as removed in the left pane
        And the right pane should not show the removed cypher card

    Scenario: A modified cypher is highlighted yellow in both panes
        Given comparison view is enabled in settings
        And the character has a version with a modified cypher effect
        And I am viewing the comparison view
        Then the modified cypher card should be highlighted as changed in the left pane
        And the modified cypher card should be highlighted as changed in the right pane

    Scenario: Renaming a card shows as removed and added, not modified
        Given comparison view is enabled in settings
        And the character has a version where a cypher was renamed
        And I am viewing the comparison view
        Then the old cypher name should be highlighted as removed in the left pane
        And the new cypher name should be highlighted as added in the right pane

    Scenario: Unchanged fields and cards show no highlight
        Given comparison view is enabled in settings
        And the character has a version with a name change
        And I am viewing the comparison view
        Then the "tier" field should not be highlighted in the left pane
        And the "tier" field should not be highlighted in the right pane

    # Restore per pane

    Scenario: Restoring the left pane saves it as the new latest version
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        And I am viewing the comparison view
        And the left pane shows version 4
        When I click the left pane's restore button
        Then a new version should be created with description "Restored: <version 4 description>"
        And the left pane should show the newly restored version

    Scenario: Restoring the right pane saves it as the new latest version
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        And I am viewing the comparison view
        And the right pane shows version 3
        When I click the right pane's restore button
        Then a new version should be created with description "Restored: <version 3 description>"

    Scenario: A pane's restore button is disabled when it already shows the latest version
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        And I am viewing the comparison view
        Then the right pane's restore button should be disabled

    Scenario: The other pane keeps pointing at the same version after a FIFO eviction
        Given comparison view is enabled in settings
        And the character has 99 versions in history
        And I am viewing the comparison view
        And the left pane shows version 50
        When I click the left pane's restore button
        Then the oldest version should have been removed
        And the right pane should still show the same character name as before the restore

    # Exiting

    Scenario: Return to editing closes comparison view
        Given comparison view is enabled in settings
        And the character has 3 versions in history
        And I am viewing the comparison view
        When I click the return to editing button
        Then the comparison view should not be visible
        And I should be viewing the latest version
        And all edit controls should be enabled

    Scenario: Comparison view does not affect single-pane version position
        Given comparison view is enabled in settings
        And the character has 5 versions in history
        And I am viewing the comparison view
        When I click the left pane's backward arrow 3 times
        And I click the return to editing button
        Then the version counter should show "Version 5 of 5"

    # Editability

    Scenario: Fields in comparison view are read-only
        Given comparison view is enabled in settings
        And the character has 3 versions in history
        And I am viewing the comparison view
        Then no field in the comparison view should be editable
        And no add or delete button should be present in the comparison view

    # Responsive fallback

    Scenario: Comparison view is unavailable on phone-width viewports
        Given I am using a phone-width viewport
        And comparison view is enabled in settings
        And the character has 3 versions in history
        When I click the backward navigation arrow
        Then the comparison view should not be visible
        And the version counter should show "Version 2 of 3"

    Scenario: Comparison view is available on tablet-width viewports
        Given I am using a tablet-width viewport
        And comparison view is enabled in settings
        And the character has 3 versions in history
        When I click the backward navigation arrow
        Then the comparison view should be visible
