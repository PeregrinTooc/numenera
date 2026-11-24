Feature: Card Creation: Cyphers and Equipment
    As a user
    I want to add new cypher and equipment cards to my character sheet
    So that I can build out my character's inventory

    Scenario: Add cypher button has its themed background color
        Given my character has 2 cyphers
        Then the add cypher button has a themed background colour

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
