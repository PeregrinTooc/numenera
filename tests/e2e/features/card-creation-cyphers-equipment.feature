Feature: Card Creation: Cyphers and Equipment
    As a user
    I want to add new cypher and equipment cards to my character sheet
    So that I can build out my character's inventory

    Scenario: Add cypher button has its themed background color
        Given my character has 2 cyphers
        Then the add cypher button has a themed background colour

    Scenario: Starting a new cypher opens the editor with empty fields
        Given my character has 2 cyphers
        When I start a new cypher
        Then the card editor opens with empty cypher fields

    Scenario: Canceling cypher creation does not add a card
        Given my character has 2 cyphers
        When I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I cancel the card
        Then my character carries 2 cyphers

    Scenario: Saving a new cypher adds a card
        Given my character has 2 cyphers
        When I start a new cypher
        And I set its name to "Fire Bomb"
        And I set its level to "1d6+2"
        And I set its effect to "Explodes in a short range"
        And I save the card
        Then my character carries 3 cyphers
        And my character carries the cypher "Fire Bomb"

    Scenario: New cypher persists after reopening the character
        Given my character has 2 cyphers
        When I start a new cypher
        And I set its name to "Phase Changer"
        And I set its level to "1d6+4"
        And I set its effect to "Allows passage through solid matter"
        And I save the card
        And I open my character again
        Then my character carries 3 cyphers
        And my character carries the cypher "Phase Changer"

    Scenario: Create cypher, then edit it, verify persistence
        Given my character has 2 cyphers
        When I start a new cypher
        And I set its name to "Energy Shield"
        And I set its level to "1d6"
        And I set its effect to "Provides protection"
        And I save the card
        And I start editing the cypher "Energy Shield"
        And I set its name to "Energy Shield Mk II"
        And I set its level to "1d6+2"
        And I set its effect to "Provides enhanced protection"
        And I save the card
        And I open my character again
        Then my character carries 3 cyphers
        And my character carries the cypher "Energy Shield Mk II"
        And the cypher "Energy Shield Mk II" shows "1d6+2"
        And the cypher "Energy Shield Mk II" shows "Provides enhanced protection"

    Scenario: Add equipment button has its themed background color
        Given my character has 2 equipment
        Then the add equipment button has a themed background colour

    Scenario: Starting new equipment opens the editor with empty fields
        Given my character has 2 equipment
        When I start a new equipment
        Then the card editor opens with empty equipment fields

    Scenario: Canceling equipment creation does not add a card
        Given my character has 2 equipment
        When I start a new equipment
        And I set its name to "Test Equipment"
        And I set its description to "Test description"
        And I cancel the card
        Then my character carries 2 equipment

    Scenario: Saving new equipment adds a card
        Given my character has 2 equipment
        When I start a new equipment
        And I set its name to "Climbing Gear"
        And I set its description to "Rope, hooks, and harness"
        And I save the card
        Then my character carries 3 equipment
        And my character carries the equipment "Climbing Gear"

    Scenario: New equipment persists after reopening the character
        Given my character has 2 equipment
        When I start a new equipment
        And I set its name to "Medical Kit"
        And I set its description to "Contains bandages and medicine"
        And I save the card
        And I open my character again
        Then my character carries 3 equipment
        And my character carries the equipment "Medical Kit"

    Scenario: Create equipment, then edit it, verify persistence
        Given my character has 2 equipment
        When I start a new equipment
        And I set its name to "Basic Sword"
        And I set its description to "Standard weapon"
        And I save the card
        And I start editing the equipment "Basic Sword"
        And I set its name to "Enchanted Sword"
        And I set its description to "Magical weapon with fire damage"
        And I save the card
        And I open my character again
        Then my character carries 3 equipment
        And my character carries the equipment "Enchanted Sword"
        And the equipment "Enchanted Sword" shows "Magical weapon with fire damage"
