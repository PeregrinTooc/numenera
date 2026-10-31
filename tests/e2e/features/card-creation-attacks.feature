Feature: Card Creation: Attacks
    As a user
    I want to add new attack cards to my character sheet
    So that I can build out my character's combat options and abilities

    Background:
        Given I am on the character sheet page

    # ============================================================================
    # ITERATION 5: ATTACKS
    # ============================================================================


    Scenario: Add button is visible for Attacks
        Then I should see an add attack button

    Scenario: Add attack button has its themed background color
        Then the add attack button should have a non-transparent background


    Scenario: Add Attack button opens modal with empty fields
        When I click the add attack button
        Then the card edit modal should be open
        And the modal should show attack fields
        And all attack fields should be empty


    Scenario: Canceling attack creation does not add a card
        Given the character has 2 attack cards
        When I click the add attack button
        And I fill in the attack name with "Test Attack"
        And I fill in the attack modifier with "+2"
        And I fill in the attack damage with "4"
        And I cancel the card edit modal
        Then I should see 2 attack cards


    Scenario: Confirming attack creation adds a new card
        Given the character has 2 attack cards
        When I click the add attack button
        And I fill in the attack name with "Fire Bolt"
        And I fill in the attack modifier with "+3"
        And I fill in the attack damage with "6"
        And I confirm the card edit modal
        Then I should see 3 attack cards
        And I should see an attack card with name "Fire Bolt"


    Scenario: New attack persists after page reload
        Given the character has 2 attack cards
        When I click the add attack button
        And I fill in the attack name with "Ice Spear"
        And I fill in the attack modifier with "+4"
        And I fill in the attack damage with "8"
        And I confirm the card edit modal
        Then I should see 3 attack cards
        When I reload the page
        Then I should see 3 attack cards
        And I should see an attack card with name "Ice Spear"


    Scenario: Multiple attacks can be added
        Given the character has 2 attack cards
        When I click the add attack button
        And I fill in the attack name with "First Attack"
        And I fill in the attack modifier with "+1"
        And I fill in the attack damage with "3"
        And I confirm the card edit modal
        Then I should see 3 attack cards
        When I click the add attack button
        And I fill in the attack name with "Second Attack"
        And I fill in the attack modifier with "+2"
        And I fill in the attack damage with "5"
        And I confirm the card edit modal
        Then I should see 4 attack cards


    Scenario: Create attack, then edit it, verify persistence
        Given the character has 2 attack cards
        When I click the add attack button
        And I fill in the attack name with "Basic Strike"
        And I fill in the attack modifier with "+1"
        And I fill in the attack damage with "4"
        And I confirm the card edit modal
        Then I should see 3 attack cards
        And I should see an attack card with name "Basic Strike"
        When I click the edit button on attack "Basic Strike"
        And I fill in the attack name with "Power Strike"
        And I fill in the attack modifier with "+3"
        And I fill in the attack damage with "8"
        And I confirm the card edit modal
        Then I should see an attack card with name "Power Strike"
        When I reload the page
        Then I should see 3 attack cards
        And I should see an attack card with name "Power Strike"
        And the attack "Power Strike" should have modifier "+3"
        And the attack "Power Strike" should have damage "8"
