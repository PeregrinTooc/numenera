Feature: Card Creation: Abilities
    As a user
    I want to add new ability and special ability cards to my character sheet
    So that I can build out my character's combat options and abilities

    Background:
        Given I am on the character sheet page

    # ============================================================================
    # ITERATION 6: ABILITIES
    # ============================================================================


    Scenario: Add button is visible for Abilities
        Then I should see an add ability button


    Scenario: Add Ability button opens modal with empty fields
        When I click the add ability button
        Then the card edit modal should be open
        And the modal should show ability fields
        And all ability fields should be empty


    Scenario: Canceling ability creation does not add a card
        Given the character has 2 ability cards
        When I click the add ability button
        And I fill in the ability name with "Test Ability"
        And I fill in the ability description with "Test description"
        And I cancel the card edit modal
        Then I should see 2 ability cards


    Scenario: Confirming ability creation adds a new card
        Given the character has 2 ability cards
        When I click the add ability button
        And I fill in the ability name with "Flame Strike"
        And I fill in the ability cost with "3"
        And I fill in the ability pool with "Intellect"
        And I fill in the ability description with "Deal fire damage to enemies"
        And I confirm the card edit modal
        Then I should see 3 ability cards
        And I should see an ability card with name "Flame Strike"


    Scenario: New ability persists after page reload
        Given the character has 2 ability cards
        When I click the add ability button
        And I fill in the ability name with "Ice Shield"
        And I fill in the ability cost with "2"
        And I fill in the ability pool with "Speed"
        And I fill in the ability description with "Create a protective ice barrier"
        And I confirm the card edit modal
        Then I should see 3 ability cards
        When I reload the page
        Then I should see 3 ability cards
        And I should see an ability card with name "Ice Shield"


    Scenario: Multiple abilities can be added
        Given the character has 2 ability cards
        When I click the add ability button
        And I fill in the ability name with "First Ability"
        And I fill in the ability description with "First description"
        And I confirm the card edit modal
        Then I should see 3 ability cards
        When I click the add ability button
        And I fill in the ability name with "Second Ability"
        And I fill in the ability description with "Second description"
        And I confirm the card edit modal
        Then I should see 4 ability cards


    Scenario: Create ability, then edit it, verify persistence
        Given the character has 2 ability cards
        When I click the add ability button
        And I fill in the ability name with "Basic Heal"
        And I fill in the ability cost with "2"
        And I fill in the ability pool with "Intellect"
        And I fill in the ability description with "Heal minor wounds"
        And I confirm the card edit modal
        Then I should see 3 ability cards
        And I should see an ability card with name "Basic Heal"
        When I click the edit button on ability "Basic Heal"
        And I fill in the ability name with "Greater Heal"
        And I fill in the ability cost with "5"
        And I fill in the ability pool with "Intellect"
        And I fill in the ability description with "Heal major wounds and restore vitality"
        And I confirm the card edit modal
        Then I should see an ability card with name "Greater Heal"
        When I reload the page
        Then I should see 3 ability cards
        And I should see an ability card with name "Greater Heal"
        And the ability "Greater Heal" should have cost "5"
        And the ability "Greater Heal" should have pool "Intellect"

    # ============================================================================
    # ITERATION 7: SPECIAL ABILITIES
    # ============================================================================


    Scenario: Add button is visible for Special Abilities
        Then I should see an add special ability button


    Scenario: Add Special Ability button opens modal with empty fields
        When I click the add special ability button
        Then the card edit modal should be open
        And the modal should show special ability fields
        And all special ability fields should be empty


    Scenario: Canceling special ability creation does not add a card
        Given the character has 2 special ability cards
        When I click the add special ability button
        And I fill in the special ability name with "Test Special"
        And I fill in the special ability source with "Test Type"
        And I fill in the special ability description with "Test description"
        And I cancel the card edit modal
        Then I should see 2 special ability cards


    Scenario: Confirming special ability creation adds a new card
        Given the character has 2 special ability cards
        When I click the add special ability button
        And I fill in the special ability name with "Energy Mastery"
        And I fill in the special ability source with "Focus"
        And I fill in the special ability description with "Control energy fields at will"
        And I confirm the card edit modal
        Then I should see 3 special ability cards
        And I should see a special ability card with name "Energy Mastery"


    Scenario: New special ability persists after page reload
        Given the character has 2 special ability cards
        When I click the add special ability button
        And I fill in the special ability name with "Time Manipulation"
        And I fill in the special ability source with "Descriptor"
        And I fill in the special ability description with "Slow or speed up time in small area"
        And I confirm the card edit modal
        Then I should see 3 special ability cards
        When I reload the page
        Then I should see 3 special ability cards
        And I should see a special ability card with name "Time Manipulation"


    Scenario: Multiple special abilities can be added
        Given the character has 2 special ability cards
        When I click the add special ability button
        And I fill in the special ability name with "First Special"
        And I fill in the special ability source with "Type"
        And I fill in the special ability description with "First description"
        And I confirm the card edit modal
        Then I should see 3 special ability cards
        When I click the add special ability button
        And I fill in the special ability name with "Second Special"
        And I fill in the special ability source with "Focus"
        And I fill in the special ability description with "Second description"
        And I confirm the card edit modal
        Then I should see 4 special ability cards


    Scenario: Create special ability, then edit it, verify persistence
        Given the character has 2 special ability cards
        When I click the add special ability button
        And I fill in the special ability name with "Basic Shield"
        And I fill in the special ability source with "Type"
        And I fill in the special ability description with "Provides basic protection"
        And I confirm the card edit modal
        Then I should see 3 special ability cards
        And I should see a special ability card with name "Basic Shield"
        When I click the edit button on special ability "Basic Shield"
        And I fill in the special ability name with "Advanced Shield"
        And I fill in the special ability source with "Focus"
        And I fill in the special ability description with "Provides enhanced protection and reflects damage"
        And I confirm the card edit modal
        Then I should see a special ability card with name "Advanced Shield"
        When I reload the page
        Then I should see 3 special ability cards
        And I should see a special ability card with name "Advanced Shield"
        And the special ability "Advanced Shield" should have source "Focus"
