Feature: Stat Pool Value Editing
    As a Numenera player
    I want to edit stat pool values (Pool, Edge, Current) for Might, Speed, and Intellect
    So that I can track my character's stats during gameplay

    Background:
        Given I am on the character sheet page
        And the character data is loaded

    # ============================================================================
    # MIGHT POOL TESTS
    # ============================================================================

    Scenario: Display Might Pool value
        Then I should see the Might Pool value displayed

    Scenario: Open modal by clicking Might Pool value
        When I click on the Might Pool value
        Then an edit modal should appear
        And the input field should contain the current Might Pool value
        And the input field should be focused

    Scenario: Edit and save Might Pool value
        When I click on the Might Pool value
        And I clear the input field
        And I type "25" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Might Pool value should display "25"

    Scenario: Might Pool value persists after page reload
        When I click on the Might Pool value
        And I clear the input field
        And I type "30" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Might Pool value should display "30"

    Scenario: Cancel Might Pool edit
        When I click on the Might Pool value
        And I clear the input field
        And I type "99" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Might Pool value should not have changed

    Scenario: Close Might Pool modal with Escape key
        When I click on the Might Pool value
        And I clear the input field
        And I type "99" into the input field
        And I press the Escape key
        Then the modal should close
        And the Might Pool value should not have changed

    Scenario: Close Might Pool modal with backdrop click
        When I click on the Might Pool value
        And I clear the input field
        And I type "99" into the input field
        And I click the modal backdrop
        Then the modal should close
        And the Might Pool value should not have changed

    Scenario: Confirm Might Pool edit with Enter key
        When I click on the Might Pool value
        And I clear the input field
        And I type "22" into the input field
        And I press the Enter key
        Then the modal should close
        And the Might Pool value should display "22"

    Scenario: Validate Might Pool accepts zero
        When I click on the Might Pool value
        And I clear the input field
        And I type "0" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Might Pool value should display "0"

    Scenario: Validate Might Pool accepts maximum value
        When I click on the Might Pool value
        And I clear the input field
        And I type "9999" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Might Pool value should display "9999"

    Scenario: Mobile: Tap to edit Might Pool
        When I tap on the Might Pool value
        Then an edit modal should appear

    # ============================================================================
    # MIGHT EDGE TESTS
    # ============================================================================

    Scenario: Display Might Edge value
        Then I should see the Might Edge value displayed

    Scenario: Open modal by clicking Might Edge value
        When I click on the Might Edge value
        Then an edit modal should appear
        And the input field should contain the current Might Edge value
        And the input field should be focused

    Scenario: Edit and save Might Edge value
        When I click on the Might Edge value
        And I clear the input field
        And I type "3" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Might Edge value should display "3"

    Scenario: Might Edge value persists after page reload
        When I click on the Might Edge value
        And I clear the input field
        And I type "5" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Might Edge value should display "5"

    Scenario: Cancel Might Edge edit
        When I click on the Might Edge value
        And I clear the input field
        And I type "9" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Might Edge value should not have changed

    Scenario: Mobile: Tap to edit Might Edge
        When I tap on the Might Edge value
        Then an edit modal should appear

    # ============================================================================
    # MIGHT CURRENT TESTS
    # ============================================================================

    Scenario: Display Might Current value
        Then I should see the Might Current value displayed

    Scenario: Open modal by clicking Might Current value
        When I click on the Might Current value
        Then an edit modal should appear
        And the input field should contain the current Might Current value
        And the input field should be focused

    Scenario: Edit and save Might Current value
        When I click on the Might Current value
        And I clear the input field
        And I type "12" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Might Current value should display "12"

    Scenario: Might Current value persists after page reload
        When I click on the Might Current value
        And I clear the input field
        And I type "8" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Might Current value should display "8"

    Scenario: Cancel Might Current edit
        When I click on the Might Current value
        And I clear the input field
        And I type "99" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Might Current value should not have changed

    Scenario: Mobile: Tap to edit Might Current
        When I tap on the Might Current value
        Then an edit modal should appear

    # ============================================================================
    # SPEED POOL TESTS
    # ============================================================================

    Scenario: Display Speed Pool value
        Then I should see the Speed Pool value displayed

    Scenario: Open modal by clicking Speed Pool value
        When I click on the Speed Pool value
        Then an edit modal should appear
        And the input field should contain the current Speed Pool value
        And the input field should be focused

    Scenario: Edit and save Speed Pool value
        When I click on the Speed Pool value
        And I clear the input field
        And I type "18" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Speed Pool value should display "18"

    Scenario: Speed Pool value persists after page reload
        When I click on the Speed Pool value
        And I clear the input field
        And I type "20" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Speed Pool value should display "20"

    Scenario: Cancel Speed Pool edit
        When I click on the Speed Pool value
        And I clear the input field
        And I type "99" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Speed Pool value should not have changed

    Scenario: Mobile: Tap to edit Speed Pool
        When I tap on the Speed Pool value
        Then an edit modal should appear

    # ============================================================================
    # SPEED EDGE TESTS
    # ============================================================================

    Scenario: Display Speed Edge value
        Then I should see the Speed Edge value displayed

    Scenario: Open modal by clicking Speed Edge value
        When I click on the Speed Edge value
        Then an edit modal should appear
        And the input field should contain the current Speed Edge value
        And the input field should be focused

    Scenario: Edit and save Speed Edge value
        When I click on the Speed Edge value
        And I clear the input field
        And I type "2" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Speed Edge value should display "2"

    Scenario: Speed Edge value persists after page reload
        When I click on the Speed Edge value
        And I clear the input field
        And I type "4" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Speed Edge value should display "4"

    Scenario: Cancel Speed Edge edit
        When I click on the Speed Edge value
        And I clear the input field
        And I type "9" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Speed Edge value should not have changed

    Scenario: Mobile: Tap to edit Speed Edge
        When I tap on the Speed Edge value
        Then an edit modal should appear

    # ============================================================================
    # SPEED CURRENT TESTS
    # ============================================================================

    Scenario: Display Speed Current value
        Then I should see the Speed Current value displayed

    Scenario: Open modal by clicking Speed Current value
        When I click on the Speed Current value
        Then an edit modal should appear
        And the input field should contain the current Speed Current value
        And the input field should be focused

    Scenario: Edit and save Speed Current value
        When I click on the Speed Current value
        And I clear the input field
        And I type "15" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Speed Current value should display "15"

    Scenario: Speed Current value persists after page reload
        When I click on the Speed Current value
        And I clear the input field
        And I type "10" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Speed Current value should display "10"

    Scenario: Cancel Speed Current edit
        When I click on the Speed Current value
        And I clear the input field
        And I type "99" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Speed Current value should not have changed

    Scenario: Mobile: Tap to edit Speed Current
        When I tap on the Speed Current value
        Then an edit modal should appear

    # ============================================================================
    # INTELLECT POOL TESTS
    # ============================================================================

    Scenario: Display Intellect Pool value
        Then I should see the Intellect Pool value displayed

    Scenario: Open modal by clicking Intellect Pool value
        When I click on the Intellect Pool value
        Then an edit modal should appear
        And the input field should contain the current Intellect Pool value
        And the input field should be focused

    Scenario: Edit and save Intellect Pool value
        When I click on the Intellect Pool value
        And I clear the input field
        And I type "16" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Intellect Pool value should display "16"

    Scenario: Intellect Pool value persists after page reload
        When I click on the Intellect Pool value
        And I clear the input field
        And I type "22" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Intellect Pool value should display "22"

    Scenario: Cancel Intellect Pool edit
        When I click on the Intellect Pool value
        And I clear the input field
        And I type "99" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Intellect Pool value should not have changed

    Scenario: Mobile: Tap to edit Intellect Pool
        When I tap on the Intellect Pool value
        Then an edit modal should appear

    # ============================================================================
    # INTELLECT EDGE TESTS
    # ============================================================================

    Scenario: Display Intellect Edge value
        Then I should see the Intellect Edge value displayed

    Scenario: Open modal by clicking Intellect Edge value
        When I click on the Intellect Edge value
        Then an edit modal should appear
        And the input field should contain the current Intellect Edge value
        And the input field should be focused

    Scenario: Edit and save Intellect Edge value
        When I click on the Intellect Edge value
        And I clear the input field
        And I type "3" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Intellect Edge value should display "3"

    Scenario: Intellect Edge value persists after page reload
        When I click on the Intellect Edge value
        And I clear the input field
        And I type "6" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Intellect Edge value should display "6"

    Scenario: Cancel Intellect Edge edit
        When I click on the Intellect Edge value
        And I clear the input field
        And I type "9" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Intellect Edge value should not have changed

    Scenario: Mobile: Tap to edit Intellect Edge
        When I tap on the Intellect Edge value
        Then an edit modal should appear

    # ============================================================================
    # INTELLECT CURRENT TESTS
    # ============================================================================

    Scenario: Display Intellect Current value
        Then I should see the Intellect Current value displayed

    Scenario: Open modal by clicking Intellect Current value
        When I click on the Intellect Current value
        Then an edit modal should appear
        And the input field should contain the current Intellect Current value
        And the input field should be focused

    Scenario: Edit and save Intellect Current value
        When I click on the Intellect Current value
        And I clear the input field
        And I type "14" into the input field
        And I click the Confirm button
        Then the modal should close
        And the Intellect Current value should display "14"

    Scenario: Intellect Current value persists after page reload
        When I click on the Intellect Current value
        And I clear the input field
        And I type "9" into the input field
        And I click the Confirm button
        And I reload the page
        Then the Intellect Current value should display "9"

    Scenario: Cancel Intellect Current edit
        When I click on the Intellect Current value
        And I clear the input field
        And I type "99" into the input field
        And I click the Cancel button
        Then the modal should close
        And the Intellect Current value should not have changed

    Scenario: Mobile: Tap to edit Intellect Current
        When I tap on the Intellect Current value
        Then an edit modal should appear
