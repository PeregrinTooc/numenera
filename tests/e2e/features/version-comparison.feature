Feature: Version Comparison View
    As a user reviewing my character's history
    I want to see two versions side by side with differences highlighted
    So that I can understand exactly what changed between them

    # Comparison view is unavailable below 768px by design, so every scenario that
    # opens it is tagged @not-phone; the phone-width scenario covers that behaviour.
    # Highlight colours are part of the requirement: yellow for changed, green for
    # added, red for removed.

    Background:
        Given my character has no history yet

    Scenario: Comparison view is off by default
        Given my character has a history of 3 versions
        When I step back to the previous version
        Then the navigator shows version 2 of 3
        And the comparison view is not shown

    @not-phone
    Scenario: Enabling comparison view in settings
        Given my character has a history of 3 versions
        When I switch on comparison view in settings
        And I step back to the previous version
        Then the comparison view is shown

    Scenario: Comparison view preference persists across reload
        When I switch on comparison view in settings
        And I reopen my character
        Then comparison view is still switched on in settings

    @not-phone
    Scenario: Opening comparison view defaults to the last two versions
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        When I step back to the previous version
        Then the comparison view is shown
        And the right pane shows version 5
        And the left pane shows version 4

    Scenario: Comparison view is unavailable with fewer than two versions
        Given comparison view is switched on in settings
        Then the navigator is hidden

    @not-phone
    Scenario: Navigating the left pane does not move the right pane
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        And I am viewing the comparison view
        When I step the left pane back to the previous version
        Then the left pane shows version 3
        And the right pane shows version 5

    @not-phone
    Scenario: Navigating the right pane does not move the left pane
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        And I am viewing the comparison view
        When I step the right pane back to the previous version
        Then the right pane shows version 4
        And the left pane shows version 4

    @not-phone
    Scenario: Either pane can be moved to an arbitrary version
        Given comparison view is switched on in settings
        And my character has a history of 10 versions
        And I am viewing the comparison view
        When I move the left pane to version 1
        And I move the right pane to version 9
        Then the left pane shows version 1
        And the right pane shows version 9

    @not-phone
    Scenario: Header lists every changed field between the two panes
        Given comparison view is switched on in settings
        And my history has a version in which I changed
            | Field      | Value              |
            | name       | Changed Name       |
            | descriptor | Changed Descriptor |
            | type       | Changed Type       |
            | focus      | Changed Focus      |
        And I am viewing the comparison view
        Then the comparison header lists exactly these changes
            | Changed name       |
            | Changed type       |
            | Changed descriptor |
            | Changed focus      |

    @not-phone
    Scenario: Header updates when either pane moves
        Given comparison view is switched on in settings
        And my history has a version in which I changed my name to "Renamed", followed by one in which I changed my tier to 4
        And I am viewing the comparison view
        Then the comparison header lists exactly these changes
            | Changed tier |
        When I step the left pane back to the previous version
        Then the comparison header lists exactly these changes
            | Changed name |
            | Changed tier |
        When I step the right pane back to the previous version
        Then the comparison header lists exactly these changes
            | Changed name |

    @not-phone
    Scenario: Header shows no differences when both panes show the same version
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        And I am viewing the comparison view
        When I step the left pane forward to the next version
        Then the left pane shows version 5
        And the comparison header says there are no differences

    @not-phone
    Scenario: A changed scalar field is highlighted yellow in both panes
        Given comparison view is switched on in settings
        And my character has a history of 2 versions
        And I am viewing the comparison view
        Then the name is highlighted yellow in both panes

    @not-phone
    Scenario: An added cypher is highlighted green in the right pane only
        Given comparison view is switched on in settings
        And my history has a version in which I added the cypher "Stim (Injector)"
        And I am viewing the comparison view
        Then the cypher "Stim (Injector)" is highlighted green in the right pane
        And the left pane does not show the cypher "Stim (Injector)"

    @not-phone
    Scenario: A removed cypher is highlighted red in the left pane only
        Given comparison view is switched on in settings
        And my history has a version in which I removed the cypher "Stim (Injector)"
        And I am viewing the comparison view
        Then the cypher "Stim (Injector)" is highlighted red in the left pane
        And the right pane does not show the cypher "Stim (Injector)"

    @not-phone
    Scenario: A modified cypher is highlighted yellow in both panes
        Given comparison view is switched on in settings
        And my history has a version in which I changed the effect of the cypher "Detonation (Cell)"
        And I am viewing the comparison view
        Then the cypher "Detonation (Cell)" is highlighted yellow in both panes

    @not-phone
    Scenario: Renaming a card shows as removed and added, not modified
        Given comparison view is switched on in settings
        And my history has a version in which I renamed the cypher "Detonation (Cell)" to "Renamed Cypher"
        And I am viewing the comparison view
        Then the cypher "Detonation (Cell)" is highlighted red in the left pane
        And the right pane does not show the cypher "Detonation (Cell)"
        And the cypher "Renamed Cypher" is highlighted green in the right pane
        And the left pane does not show the cypher "Renamed Cypher"

    @not-phone
    Scenario: Unchanged fields and cards show no highlight
        Given comparison view is switched on in settings
        And my character has a history of 2 versions
        And I am viewing the comparison view
        Then the tier is not highlighted in either pane

    @not-phone
    Scenario: Restoring the left pane saves it as the new latest version
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        And I am viewing the comparison view
        When I restore the version in the left pane
        Then my history gains a version restored from version 4
        And the left pane shows version 6

    @not-phone
    Scenario: Restoring the right pane saves it as the new latest version
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        And I am viewing the comparison view
        And I move the right pane to version 3
        When I restore the version in the right pane
        Then my history gains a version restored from version 3

    @not-phone
    Scenario: A pane's restore button is disabled when it already shows the latest version
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        And I am viewing the comparison view
        Then the right pane cannot restore its version
        And the left pane can restore its version

    @not-phone
    Scenario: The other pane keeps pointing at the same version after a FIFO eviction
        Given comparison view is switched on in settings
        And my character has a history of 99 versions
        And I am viewing the comparison view
        When I restore the version in the left pane
        Then the original version has been dropped
        And the right pane shows my character as it was in version 99

    @not-phone
    Scenario: Return to editing closes comparison view
        Given comparison view is switched on in settings
        And my character has a history of 3 versions
        And I am viewing the comparison view
        When I return to editing
        Then the comparison view is not shown
        And I am on the latest version
        And I can edit my character

    @not-phone
    Scenario: Comparison view does not affect single-pane version position
        Given comparison view is switched on in settings
        And my character has a history of 5 versions
        And I am viewing the comparison view
        When I move the left pane to version 2
        And I return to editing
        Then the navigator shows version 5 of 5

    @not-phone
    Scenario: Fields in comparison view are read-only
        Given comparison view is switched on in settings
        And my character has a history of 3 versions
        And I am viewing the comparison view
        Then nothing in the comparison view can be edited

    Scenario: Comparison view is unavailable on phone-width viewports
        Given the viewport is 390 pixels wide
        And comparison view is switched on in settings
        And my character has a history of 3 versions
        When I step back to the previous version
        Then the comparison view is not shown
        And the navigator shows version 2 of 3

    Scenario: Comparison view is available on tablet-width viewports
        Given the viewport is 1024 pixels wide
        And comparison view is switched on in settings
        And my character has a history of 3 versions
        When I step back to the previous version
        Then the comparison view is shown
