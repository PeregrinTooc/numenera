Feature: Card Creation
    As a user
    I want to add new cards to my character sheet
    So that I can build out my character's inventory and abilities

    Background:
        Given I am on the character sheet page

    # ============================================================================
    # ITERATION 1: CYPHERS
    # ============================================================================

    Scenario: Add button is visible for Cyphers
        Then I should see an add cypher button

    Scenario: Add Cypher button opens modal with empty fields
        When I click the add cypher button
        Then the card edit modal should be open
        And the modal should show cypher fields
        And all cypher fields should be empty

    Scenario: Canceling cypher creation does not add a card
        Given the character has 2 cypher cards
        When I click the add cypher button
        And I fill in the cypher name with "Test Cypher"
        And I fill in the cypher level with "1d6"
        And I cancel the card edit modal
        Then I should see 2 cypher cards

    Scenario: Confirming cypher creation adds a new card
        Given the character has 2 cypher cards
        When I click the add cypher button
        And I fill in the cypher name with "Fire Bomb"
        And I fill in the cypher level with "1d6+2"
        And I fill in the cypher effect with "Explodes in a short range"
        And I confirm the card edit modal
        Then I should see 3 cypher cards
        And I should see a cypher card with name "Fire Bomb"

    Scenario: New cypher persists after page reload
        Given the character has 2 cypher cards
        When I click the add cypher button
        And I fill in the cypher name with "Phase Changer"
        And I fill in the cypher level with "1d6+4"
        And I fill in the cypher effect with "Allows passage through solid matter"
        And I confirm the card edit modal
        Then I should see 3 cypher cards
        When I reload the page
        Then I should see 3 cypher cards
        And I should see a cypher card with name "Phase Changer"

    Scenario: Multiple cyphers can be added
        Given the character has 2 cypher cards
        When I click the add cypher button
        And I fill in the cypher name with "First Cypher"
        And I fill in the cypher level with "1d6"
        And I fill in the cypher effect with "First effect"
        And I confirm the card edit modal
        Then I should see 3 cypher cards
        When I click the add cypher button
        And I fill in the cypher name with "Second Cypher"
        And I fill in the cypher level with "1d6+2"
        And I fill in the cypher effect with "Second effect"
        And I confirm the card edit modal
        Then I should see 4 cypher cards

    Scenario: Create cypher, then edit it, verify persistence
        Given the character has 2 cypher cards
        When I click the add cypher button
        And I fill in the cypher name with "Energy Shield"
        And I fill in the cypher level with "1d6"
        And I fill in the cypher effect with "Provides protection"
        And I confirm the card edit modal
        Then I should see 3 cypher cards
        And I should see a cypher card with name "Energy Shield"
        When I click the edit button on cypher "Energy Shield"
        And I fill in the cypher name with "Energy Shield Mk II"
        And I fill in the cypher level with "1d6+2"
        And I fill in the cypher effect with "Provides enhanced protection"
        And I confirm the card edit modal
        Then I should see a cypher card with name "Energy Shield Mk II"
        When I reload the page
        Then I should see 3 cypher cards
        And I should see a cypher card with name "Energy Shield Mk II"
        And the cypher "Energy Shield Mk II" should have level "1d6+2"
        And the cypher "Energy Shield Mk II" should have effect "Provides enhanced protection"

    # ============================================================================
    # ITERATION 2: EQUIPMENT
    # ============================================================================

    
    Scenario: Add button is visible for Equipment
        Then I should see an add equipment button

    
    Scenario: Add Equipment button opens modal with empty fields
        When I click the add equipment button
        Then the card edit modal should be open
        And the modal should show equipment fields
        And all equipment fields should be empty

    
    Scenario: Canceling equipment creation does not add a card
        Given the character has 4 equipment cards
        When I click the add equipment button
        And I fill in the equipment name with "Test Equipment"
        And I fill in the equipment description with "Test description"
        And I cancel the card edit modal
        Then I should see 4 equipment cards

    
    Scenario: Confirming equipment creation adds a new card
        Given the character has 4 equipment cards
        When I click the add equipment button
        And I fill in the equipment name with "Climbing Gear"
        And I fill in the equipment description with "Rope, hooks, and harness"
        And I confirm the card edit modal
        Then I should see 5 equipment cards
        And I should see an equipment card with name "Climbing Gear"

    
    Scenario: New equipment persists after page reload
        Given the character has 4 equipment cards
        When I click the add equipment button
        And I fill in the equipment name with "Medical Kit"
        And I fill in the equipment description with "Contains bandages and medicine"
        And I confirm the card edit modal
        Then I should see 5 equipment cards
        When I reload the page
        Then I should see 5 equipment cards
        And I should see an equipment card with name "Medical Kit"

    
    Scenario: Multiple equipment items can be added
        Given the character has 4 equipment cards
        When I click the add equipment button
        And I fill in the equipment name with "First Item"
        And I fill in the equipment description with "First description"
        And I confirm the card edit modal
        Then I should see 5 equipment cards
        When I click the add equipment button
        And I fill in the equipment name with "Second Item"
        And I fill in the equipment description with "Second description"
        And I confirm the card edit modal
        Then I should see 6 equipment cards

    
    Scenario: Create equipment, then edit it, verify persistence
        Given the character has 4 equipment cards
        When I click the add equipment button
        And I fill in the equipment name with "Basic Sword"
        And I fill in the equipment description with "Standard weapon"
        And I confirm the card edit modal
        Then I should see 5 equipment cards
        And I should see an equipment card with name "Basic Sword"
        When I click the edit button on equipment "Basic Sword"
        And I fill in the equipment name with "Enchanted Sword"
        And I fill in the equipment description with "Magical weapon with fire damage"
        And I confirm the card edit modal
        Then I should see an equipment card with name "Enchanted Sword"
        When I reload the page
        Then I should see 5 equipment cards
        And I should see an equipment card with name "Enchanted Sword"
        And the equipment "Enchanted Sword" should have description "Magical weapon with fire damage"

    # ============================================================================
    # ITERATION 3: ARTIFACTS
    # ============================================================================

    @current
    Scenario: Add button is visible for Artifacts
        Then I should see an add artifact button

    @current
    Scenario: Add Artifact button opens modal with empty fields
        When I click the add artifact button
        Then the card edit modal should be open
        And the modal should show artifact fields
        And all artifact fields should be empty

    @current
    Scenario: Canceling artifact creation does not add a card
        Given the character has 2 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "Test Artifact"
        And I fill in the artifact level with "1d6"
        And I fill in the artifact effect with "Test effect"
        And I cancel the card edit modal
        Then I should see 2 artifact cards

    @current
    Scenario: Confirming artifact creation adds a new card
        Given the character has 2 artifact cards
        When I click the add artifact button
        And I fill in the artifact name with "Crystal Blade"
        And I fill in the artifact level with "1d6+2"
        And I fill in the artifact effect with "A sword that never dulls"
        And I confirm the card edit modal
        Then I should see 3 artifact cards
        And I should see an artifact card with name "Crystal Blade"

    @current
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

    @current
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

    @current
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
