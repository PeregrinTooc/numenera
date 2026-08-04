Feature: Resource Tracker Fields Editing
    As a user
    I want to edit XP, Shins, Armor, Max Cyphers, and Effort values
    So that I can manage character resources effectively

    Background:
        Given I am on the character sheet page

    # ============================================================================
    # XP EDITING SCENARIOS
    # ============================================================================

    Scenario: XP badge displays current and total values independently
        Given the character has 5 current XP and 45 total XP
        Then the Current XP badge should show "5"
        And the Total XP badge should show "45"

    Scenario: Clicking the Current XP badge opens edit modal with the current value
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        Then the edit modal should open
        And the modal input should contain "5"

    Scenario: Clicking the Total XP badge opens edit modal with the total value
        Given the character has 5 current XP and 45 total XP
        When I click the Total XP badge
        Then the edit modal should open
        And the modal input should contain "45"

    Scenario: Editing current XP saves the change and leaves total XP untouched
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "10" in the modal input
        And I click the modal confirm button
        Then the Current XP badge should show "10"
        And the Total XP badge should show "45"
        And the character data should have currentXp 10

    Scenario: Editing total XP saves the change and leaves current XP untouched
        Given the character has 5 current XP and 45 total XP
        When I click the Total XP badge
        And I type "60" in the modal input
        And I click the modal confirm button
        Then the Total XP badge should show "60"
        And the Current XP badge should show "5"
        And the character data should have totalXp 60

    Scenario: XP changes persist after page reload
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "15" in the modal input
        And I click the modal confirm button
        And I reload the page
        Then the Current XP badge should show "15"
        And the Total XP badge should show "45"

    Scenario: Canceling a Current XP edit discards changes
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "20" in the modal input
        And I click the modal cancel button
        Then the Current XP badge should show "5"

    Scenario: Current XP validates numeric input
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "abc" in the modal input
        Then the modal confirm button should be disabled
        And the modal should show a real validation error, not a raw translation key

    Scenario: XP badges on mobile devices
        Given I am using a mobile device
        And the character has 5 current XP and 45 total XP
        When I tap the Current XP badge
        Then the edit modal should open
        When I type "12" in the modal input
        And I tap the modal confirm button
        Then the Current XP badge should show "12"

    Scenario: A character saved before the current/total split shows the same value in both cells
        Given the character was saved with a single legacy XP value of 12
        Then the Current XP badge should show "12"
        And the Total XP badge should show "12"

    # ============================================================================
    # SHINS EDITING SCENARIOS
    # ============================================================================

    Scenario: Shins badge displays current value
        Given the character has 100 shins
        Then the Shins badge should show "100"

    Scenario: Clicking Shins badge opens edit modal
        Given the character has 100 shins
        When I click the Shins badge
        Then the edit modal should open
        And the modal input should contain "100"

    Scenario: Editing Shins and confirming saves changes
        Given the character has 100 shins
        When I click the Shins badge
        And I type "250" in the modal input
        And I click the modal confirm button
        Then the Shins badge should show "250"
        And the character data should have shins 250

    Scenario: Shins changes persist after page reload
        Given the character has 100 shins
        When I click the Shins badge
        And I type "500" in the modal input
        And I click the modal confirm button
        And I reload the page
        Then the Shins badge should show "500"

    Scenario: Shins accepts zero value
        Given the character has 100 shins
        When I click the Shins badge
        And I type "0" in the modal input
        And I click the modal confirm button
        Then the Shins badge should show "0"

    Scenario: Shins on mobile devices
        Given I am using a mobile device
        And the character has 100 shins
        When I tap the Shins badge
        Then the edit modal should open

    Scenario: Editing Shins still updates the badge after an item card was added
        Given the character has 100 shins
        When I click the add equipment button
        And I fill in the equipment name with "Sword"
        And I confirm the card edit modal
        And I click the Shins badge
        And I type "250" in the modal input
        And I click the modal confirm button
        Then the Shins badge should show "250"

    # ============================================================================
    # ARMOR EDITING SCENARIOS
    # ============================================================================

    Scenario: Armor badge displays current value
        Given the character has 2 armor
        Then the Armor badge should show "2"

    Scenario: Clicking Armor badge opens edit modal
        Given the character has 2 armor
        When I click the Armor badge
        Then the edit modal should open
        And the modal input should contain "2"

    Scenario: Editing Armor and confirming saves changes
        Given the character has 2 armor
        When I click the Armor badge
        And I type "3" in the modal input
        And I click the modal confirm button
        Then the Armor badge should show "3"
        And the character data should have armor 3

    Scenario: Armor changes persist after page reload
        Given the character has 2 armor
        When I click the Armor badge
        And I type "5" in the modal input
        And I click the modal confirm button
        And I reload the page
        Then the Armor badge should show "5"

    Scenario: Armor accepts zero value
        Given the character has 2 armor
        When I click the Armor badge
        And I type "0" in the modal input
        And I click the modal confirm button
        Then the Armor badge should show "0"

    # ============================================================================
    # MAX CYPHERS EDITING SCENARIOS
    # ============================================================================

    Scenario: Max Cyphers badge displays current value
        Given the character has max cyphers 2
        Then the Max Cyphers portion of the badge should show "2"

    Scenario: Clicking Max Cyphers opens edit modal
        Given the character has max cyphers 2
        When I click the Max Cyphers badge
        Then the edit modal should open
        And the modal input should contain "2"

    Scenario: Editing Max Cyphers and confirming saves changes
        Given the character has max cyphers 2
        When I click the Max Cyphers badge
        And I type "4" in the modal input
        And I click the modal confirm button
        Then the Max Cyphers portion of the badge should show "4"
        And the character data should have maxCyphers 4

    Scenario: Max Cyphers changes persist after page reload
        Given the character has max cyphers 2
        When I click the Max Cyphers badge
        And I type "3" in the modal input
        And I click the modal confirm button
        And I reload the page
        Then the Max Cyphers portion of the badge should show "3"

    # ============================================================================
    # EFFORT EDITING SCENARIOS
    # ============================================================================

    Scenario: Effort badge displays current value
        Given the character has effort 1
        Then the Effort badge should show "1"

    Scenario: Clicking Effort badge opens edit modal
        Given the character has effort 1
        When I click the Effort badge
        Then the edit modal should open
        And the modal input should contain "1"

    Scenario: Editing Effort and confirming saves changes
        Given the character has effort 1
        When I click the Effort badge
        And I type "3" in the modal input
        And I click the modal confirm button
        Then the Effort badge should show "3"
        And the character data should have effort 3

    Scenario: Effort changes persist after page reload
        Given the character has effort 1
        When I click the Effort badge
        And I type "4" in the modal input
        And I click the modal confirm button
        And I reload the page
        Then the Effort badge should show "4"
