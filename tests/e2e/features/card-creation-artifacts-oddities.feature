Feature: Card Creation: Artifacts and Oddities
    As a user
    I want to add new artifact and oddity cards to my character sheet
    So that I can build out my character's inventory

    Background:
        Given I am on the character sheet page

    # ============================================================================
    # ITERATION 3: ARTIFACTS
    # ============================================================================

    Scenario: Add button is visible for Artifacts
        Then I should see an add artifact button

    Scenario: Add Artifact button opens modal with empty fields
        When I click the add artifact button
        Then the card edit modal should be open
        And the modal should show artifact fields
        And all artifact fields should be empty

    Scenario: Canceling artifact creation does not add a card
        Given the character has 2 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "Test Artifact"
        And I fill in the artifact level with "1d6"
        And I fill in the artifact effect with "Test effect"
        And I cancel the card edit modal
        Then I should see 2 artifact cards

    Scenario: Confirming artifact creation adds a new card
        Given the character has 2 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "Crystal Blade"
        And I fill in the artifact level with "1d6+2"
        And I fill in the artifact effect with "A sword that never dulls"
        And I confirm the card edit modal
        Then I should see 3 artifact cards
        And I should see an artifact card with name "Crystal Blade"

    Scenario: New artifact persists after page reload
        Given the character has 2 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "Shield of Force"
        And I fill in the artifact level with "1d6+4"
        And I fill in the artifact effect with "Creates an energy barrier"
        And I confirm the card edit modal
        Then I should see 3 artifact cards
        When I reload the page
        Then I should see 3 artifact cards
        And I should see an artifact card with name "Shield of Force"

    Scenario: Multiple artifacts can be added
        Given the character has 2 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "First Artifact"
        And I fill in the artifact level with "1d6"
        And I fill in the artifact effect with "First effect"
        And I confirm the card edit modal
        Then I should see 3 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "Second Artifact"
        And I fill in the artifact level with "1d6+2"
        And I fill in the artifact effect with "Second effect"
        And I confirm the card edit modal
        Then I should see 4 artifact cards

    Scenario: Create artifact, then edit it, verify persistence
        Given the character has 2 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "Power Gauntlet"
        And I fill in the artifact level with "1d6"
        And I fill in the artifact effect with "Enhances strength"
        And I confirm the card edit modal
        Then I should see 3 artifact cards
        And I should see an artifact card with name "Power Gauntlet"
        When I click the edit button on artifact "Power Gauntlet"
        And I fill in the artifact name with "Power Gauntlet Mk II"
        And I fill in the artifact level with "1d6+2"
        And I fill in the artifact effect with "Greatly enhances strength and speed"
        And I confirm the card edit modal
        Then I should see an artifact card with name "Power Gauntlet Mk II"
        When I reload the page
        Then I should see 3 artifact cards
        And I should see an artifact card with name "Power Gauntlet Mk II"
        And the artifact "Power Gauntlet Mk II" should have level "1d6+2"
        And the artifact "Power Gauntlet Mk II" should have effect "Greatly enhances strength and speed"

    # ============================================================================
    # ITERATION 4: ODDITIES
    # ============================================================================


    Scenario: Add button is visible for Oddities
        Then I should see an add oddity button


    Scenario: Add Oddity button opens modal with empty fields
        When I click the add oddity button
        Then the card edit modal should be open
        And the modal should show oddity fields
        And all oddity fields should be empty


    Scenario: Canceling oddity creation does not add a card
        Given the character has 2 oddity cards
        When I click the add oddity button
        And I fill in the oddity text with "Test Oddity"
        And I cancel the card edit modal
        Then I should see 2 oddity cards


    Scenario: Confirming oddity creation adds a new card
        Given the character has 2 oddity cards
        When I click the add oddity button
        And I fill in the oddity text with "A metal sphere that whispers in the dark"
        And I confirm the card edit modal
        Then I should see 3 oddity cards
        And I should see an oddity card with text "A metal sphere that whispers in the dark"


    Scenario: New oddity persists after page reload
        Given the character has 2 oddity cards
        When I click the add oddity button
        And I fill in the oddity text with "A translucent stone that floats in water"
        And I confirm the card edit modal
        Then I should see 3 oddity cards
        When I reload the page
        Then I should see 3 oddity cards
        And I should see an oddity card with text "A translucent stone that floats in water"


    Scenario: Multiple oddities can be added
        Given the character has 2 oddity cards
        When I click the add oddity button
        And I fill in the oddity text with "First Oddity Description"
        And I confirm the card edit modal
        Then I should see 3 oddity cards
        When I click the add oddity button
        And I fill in the oddity text with "Second Oddity Description"
        And I confirm the card edit modal
        Then I should see 4 oddity cards


    Scenario: Create oddity, then edit it, verify persistence
        Given the character has 2 oddity cards
        When I click the add oddity button
        And I fill in the oddity text with "A small crystal that changes color"
        And I confirm the card edit modal
        Then I should see 3 oddity cards
        And I should see an oddity card with text "A small crystal that changes color"
        When I click the edit button on oddity "A small crystal that changes color"
        And I fill in the oddity text with "A large crystal that changes color based on temperature"
        And I confirm the card edit modal
        Then I should see an oddity card with text "A large crystal that changes color based on temperature"
        When I reload the page
        Then I should see 3 oddity cards
        And I should see an oddity card with text "A large crystal that changes color based on temperature"
