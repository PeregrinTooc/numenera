Feature: Version History Navigation
    As a user editing my character
    I want to navigate through previous versions of my character
    So that I can review changes and restore old versions if needed

    Background:
        Given my character has no history yet

    Scenario: Version navigator is hidden when no versions exist
        Then the navigator is hidden
        And I can edit my character

    Scenario: Creating first version shows navigator
        When I change my name to "Aria"
        And my edits have settled into a version
        Then the navigator shows version 2 of 2
        And the back control is available
        And the forward control is unavailable
        And I am not warned about an old version

    Scenario: Navigate backward to previous version
        Given my character has a history of 3 versions
        When I step back to the previous version
        Then the navigator shows version 2 of 3
        And I see my character as it was in version 2
        And the navigator describes this version
        And the navigator dates this version
        And the back control is available
        And the forward control is available
        And I am warned that I am viewing an old version

    Scenario: Navigate to oldest version
        Given my character has a history of 3 versions
        When I go to the oldest version
        Then the navigator shows version 1 of 3
        And I see my character as it was in version 1
        And the back control is unavailable
        And the forward control is available
        And I am warned that I am viewing an old version

    Scenario: Navigate forward to newer version
        Given my character has a history of 3 versions
        And I go to version 1
        When I step forward to the next version
        Then the navigator shows version 2 of 3
        And I see my character as it was in version 2
        And the back control is available
        And the forward control is available
        And I am warned that I am viewing an old version

    Scenario: Navigate forward to latest version
        Given my character has a history of 3 versions
        And I go to version 1
        When I step forward to the next version
        And I step forward to the next version
        Then the navigator shows version 3 of 3
        And I see my character as it was in version 3
        And the back control is available
        And the forward control is unavailable
        And I am not warned about an old version

    Scenario: Restore button saves old version as new latest
        Given my character has a history of 5 versions
        And I go to version 2
        When I restore this version
        Then the navigator shows version 6 of 6
        And I see my character as it was in version 2
        And I am not warned about an old version
        And the forward control is unavailable
        When I change my name to "After Restore"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Restored: Changed name"

    Scenario: Warning banner displays when viewing old version
        Given my character has a history of 3 versions
        When I go to version 1
        Then I am warned that I am viewing an old version
        And I can restore this version

    Scenario: Editing while viewing old version creates new version
        Given my character has a history of 3 versions
        And I go to version 1
        When I change my name to "Time Traveler"
        And my edits have settled into a version
        Then the navigator shows version 4 of 4
        And I am on the latest version

    Scenario: Editing a stat while viewing an old version does not corrupt other versions' cached stats
        Given my Might pool went from 10 to 11 to 12
        When I go to version 2
        And I change my Might pool to 77
        And I go to version 3
        And I go to version 2
        Then I see my character as it was in version 2

    Scenario: Return to latest shows edits made before navigating back
        Given my character has a history of 3 versions
        When I change my name to "Edited Before Navigating"
        And my edits have settled into a version
        And I step back to the previous version
        And I return to the latest version
        Then my character sheet shows my name as "Edited Before Navigating"

    Scenario: Version description shows what changed
        When I change my name to "Aria"
        And my edits have settled into a version
        And I change my name to "Brin"
        And my edits have settled into a version
        And I step back to the previous version
        Then the navigator describes this version as "Changed name"

    Scenario: Multiple changes show combined description
        Given my character has a combined basic info change in its history
        When I step back to the previous version
        Then the navigator describes this version as "Edited basic info"

    Scenario: Timestamp displays in readable format
        Given my character has a history of 2 versions
        When I step back to the previous version
        Then the navigator gives the age of this version in relative terms

    Scenario: Navigation preserves character integrity
        Given my character has a history of 5 versions with different data
        When I go to version 2
        Then I see my character as it was in version 2
        When I go to version 4
        Then I see my character as it was in version 4

    Scenario: Portrait is not affected by version navigation
        Given my character has a history of 3 versions
        And my character has a portrait
        When I go to version 1
        Then my portrait is unchanged
        When I go to version 2
        Then my portrait is unchanged

    Scenario: Restoring an old version keeps the current portrait
        Given my character has a history of 3 versions
        And my character has a portrait
        And I go to version 1
        When I restore this version
        Then my portrait is unchanged

    Scenario: Export works from old version
        Given my character has a history of 3 versions
        And my character has a portrait
        And I go to version 1
        When I export what I am viewing
        Then the export holds version 1 of my character
        And the export carries no version history
        And the export keeps my current portrait

    Scenario: Rapid navigation through many versions
        Given my character has a history of 20 versions
        When I step back 10 times in quick succession
        Then the navigator shows version 10 of 20
        And I see my character as it was in version 10

    Scenario: Reopening the sheet returns to the latest version
        Given my character has a history of 5 versions
        And I go to version 3
        When I reopen my character
        Then the navigator shows version 5 of 5
        And I am on the latest version

    Scenario: Maximum versions (FIFO) updates navigator
        Given my character has a history of 99 versions
        When I change my name to "New Version Name"
        And my edits have settled into a version
        Then the navigator shows version 99 of 99
        And the original version has been dropped
