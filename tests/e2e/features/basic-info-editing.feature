Feature: Edit Basic Character Information
    As a Numenera player
    I want to edit my character's basic information (name, tier, descriptor, focus)
    So that I can update my character as they progress through the game

    Background:
        Given a character exists with the following data:
            | Property   | Value                |
            | Name       | Kael the Wanderer    |
            | Tier       | 3                    |
            | Type       | Glaive               |
            | Descriptor | Strong               |
            | Focus      | Bears a Halo of Fire |
        And I am on the character sheet page

    Scenario: Click on character name opens edit modal
        When I click on the character name "Kael the Wanderer"
        Then an edit modal should appear
        And the input field should contain "Kael the Wanderer"
        And the modal should have a confirm button with icon
        And the modal should have a cancel button with icon

    Scenario: Edit character name successfully
        When I click on the character name "Kael the Wanderer"
        And I clear the input field
        And I type "Kael the Wise" in the input field
        And I click the modal confirm button
        Then the modal should close
        And the character name should display "Kael the Wise"
        When I reload the page
        Then the character name should display "Kael the Wise"

    Scenario: Cancel character name edit
        When I click on the character name "Kael the Wanderer"
        And I type "New Name" in the input field
        And I click the modal cancel button
        Then the modal should close
        And the character name should still display "Kael the Wanderer"
        When I reload the page
        Then the character name should still display "Kael the Wanderer"

    Scenario: Edit character name with escape key
        When I click on the character name "Kael the Wanderer"
        And I type "Different Name" in the input field
        And I press the Escape key
        Then the modal should close
        And the character name should still display "Kael the Wanderer"

    Scenario: Edit character name with enter key
        When I click on the character name "Kael the Wanderer"
        And I clear the input field
        And I type "Kael the Swift" in the input field
        And I press the Enter key
        Then the modal should close
        And the character name should display "Kael the Swift"

    Scenario: Click on tier opens edit modal
        When I click on the tier "3"
        Then an edit modal should appear
        And the input field should contain "3"
        And the input field should be of type "number"

    Scenario: Edit character tier successfully
        When I click on the tier "3"
        And I clear the input field
        And I type "5" in the input field
        And I click the modal confirm button
        Then the modal should close
        And the tier should display "5"
        When I reload the page
        Then the tier should display "5"

    Scenario: Edit tier with invalid value (out of range)
        When I click on the tier "3"
        And I clear the input field
        And I type "7" in the input field
        And I click the modal confirm button
        Then the tier should be constrained to "6"
        And the modal should close
        And the tier should display "6"

    Scenario: Edit tier with invalid value (below minimum)
        When I click on the tier "3"
        And I clear the input field
        And I type "0" in the input field
        And I click the modal confirm button
        Then the tier should be constrained to "1"
        And the modal should close
        And the tier should display "1"

    Scenario: Click on descriptor opens edit modal
        When I click on the descriptor "Strong"
        Then an edit modal should appear
        And the input field should contain "Strong"

    Scenario: Edit character descriptor successfully
        When I click on the descriptor "Strong"
        And I clear the input field
        And I type "Swift" in the input field
        And I click the modal confirm button
        Then the modal should close
        And the descriptor should display "Swift"
        When I reload the page
        Then the descriptor should display "Swift"

    Scenario: Click on focus opens edit modal
        When I click on the focus "Bears a Halo of Fire"
        Then an edit modal should appear
        And the input field should contain "Bears a Halo of Fire"

    Scenario: Edit character focus successfully
        When I click on the focus "Bears a Halo of Fire"
        And I clear the input field
        And I type "Commands Mental Powers" in the input field
        And I click the modal confirm button
        Then the modal should close
        And the focus should display "Commands Mental Powers"
        When I reload the page
        Then the focus should display "Commands Mental Powers"

    Scenario: Modal has proper visual styling
        When I click on the character name "Kael the Wanderer"
        Then the modal should have Numenera-themed styling
        And the confirm button should have a checkmark icon
        And the cancel button should have an X icon
        And the modal backdrop should be semi-transparent

    Scenario: Modal click outside closes without saving
        When I click on the character name "Kael the Wanderer"
        And I type "New Name" in the input field
        And I click outside the modal on the backdrop
        Then the modal should close
        And the character name should still display "Kael the Wanderer"

    Scenario: Edit multiple fields in sequence
        When I click on the character name "Kael the Wanderer"
        And I type "Kael the Wise" in the input field
        And I click the modal confirm button
        Then the modal should close
        When I click on the tier "3"
        And I type "4" in the input field
        And I click the modal confirm button
        Then the modal should close
        And the character name should display "Kael the Wise"
        And the tier should display "4"

    Scenario: Editable fields have visual hover state
        When I hover over the character name "Kael the Wanderer"
        Then the name should show a hover state indicating it's editable
        When I hover over the tier "3"
        Then the tier should show a hover state indicating it's editable

    Scenario: Empty name is not allowed
        When I click on the character name "Kael the Wanderer"
        And I clear the input field
        Then the confirm button should be disabled
        And the modal should not close
        And an error or validation message may appear

    Scenario: Modal maintains focus trap
        When I click on the character name "Kael the Wanderer"
        And I press Tab repeatedly
        Then focus should cycle between input field, confirm button, and cancel button
        And focus should not leave the modal

    @accessibility
    Scenario: Modal is keyboard accessible
        When I click on the character name "Kael the Wanderer"
        Then the input field should receive focus automatically
        And I can navigate with Tab key
        And I can confirm with Enter key
        And I can cancel with Escape key

    @accessibility
    Scenario: Modal has proper ARIA attributes
        When I click on the character name "Kael the Wanderer"
        Then the modal should have role="dialog"
        And the backdrop should have aria-hidden="true"

    @mobile
    Scenario: Tap on character name opens edit modal on mobile
        Given I am viewing on a mobile device with width "375px"
        When I tap on the character name "Kael the Wanderer"
        Then an edit modal should appear
        And the modal should be sized appropriately for mobile
        And the mobile keyboard should appear

    @mobile
    Scenario: Edit character name on mobile device
        Given I am viewing on a mobile device with width "375px"
        When I tap on the character name "Kael the Wanderer"
        And I clear the input field
        And I type "Kael the Wise" in the input field
        And I tap the modal confirm button
        Then the modal should close
        And the character name should display "Kael the Wise"
        When I reload the page
        Then the character name should display "Kael the Wise"

    @mobile
    Scenario: Edit tier on mobile device with number keyboard
        Given I am viewing on a mobile device with width "375px"
        When I tap on the tier "3"
        Then an edit modal should appear
        And the input field should have inputmode="numeric" for mobile
        And I clear the input field
        And I type "5" in the input field
        And I tap the modal confirm button
        Then the modal should close
        And the tier should display "5"

    @mobile
    Scenario: Modal is properly sized on mobile viewport
        Given I am viewing on a mobile device with width "375px"
        When I tap on the character name "Kael the Wanderer"
        Then the modal should fill most of the screen width
        And the modal should not overflow the viewport
        And the buttons should be touch-friendly size (min 44x44px)
        And the input field should be large enough for touch input

    @mobile
    Scenario: Cancel edit by tapping outside modal on mobile
        Given I am viewing on a mobile device with width "375px"
        When I tap on the character name "Kael the Wanderer"
        And I type "New Name" in the input field
        And I tap outside the modal on the backdrop
        Then the modal should close
        And the character name should still display "Kael the Wanderer"
        When I reload the page
        Then the character name should still display "Kael the Wanderer"

    @mobile
    Scenario: Editable fields show touch-friendly tap targets on mobile
        Given I am viewing on a mobile device with width "375px"
        When I am on the character sheet page
        Then the character name should be large enough for touch (min 44x44px)
        And the tier should be large enough for touch (min 44x44px)
        And the descriptor should be large enough for touch (min 44x44px)
        And the focus should be large enough for touch (min 44x44px)
