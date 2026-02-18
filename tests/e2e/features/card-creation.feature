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

    # ============================================================================
    # ITERATION 5: ATTACKS
    # ============================================================================


    Scenario: Add button is visible for Attacks
        Then I should see an add attack button


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

