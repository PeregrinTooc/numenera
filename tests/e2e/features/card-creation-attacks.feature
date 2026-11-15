Feature: Card Creation: Attacks
    As a user
    I want to add new attack cards to my character sheet
    So that I can build out my character's combat options and abilities

    Scenario: Add attack button has its themed background color
        Given my character has 2 attacks
        Then the add attack button has a themed background colour

    Scenario: Starting a new attack opens the editor with empty fields
        Given my character has 2 attacks
        When I start a new attack
        Then the card editor opens with empty attack fields

    Scenario: Canceling attack creation does not add a card
        Given my character has 2 attacks
        When I start a new attack
        And I set its name to "Test Attack"
        And I set its modifier to "+2"
        And I set its damage to "4"
        And I cancel the card
        Then my character carries 2 attacks

    Scenario: Saving a new attack adds a card
        Given my character has 2 attacks
        When I start a new attack
        And I set its name to "Fire Bolt"
        And I set its modifier to "+3"
        And I set its damage to "6"
        And I save the card
        Then my character carries 3 attacks
        And my character carries the attack "Fire Bolt"

    Scenario: New attack persists after reopening the character
        Given my character has 2 attacks
        When I start a new attack
        And I set its name to "Ice Spear"
        And I set its modifier to "+4"
        And I set its damage to "8"
        And I save the card
        And I open my character again
        Then my character carries 3 attacks
        And my character carries the attack "Ice Spear"

    Scenario: Create attack, then edit it, verify persistence
        Given my character has 2 attacks
        When I start a new attack
        And I set its name to "Basic Strike"
        And I set its modifier to "+1"
        And I set its damage to "4"
        And I save the card
        And I start editing the attack "Basic Strike"
        And I set its name to "Power Strike"
        And I set its modifier to "+3"
        And I set its damage to "8"
        And I save the card
        And I open my character again
        Then my character carries 3 attacks
        And my character carries the attack "Power Strike"
        And the attack "Power Strike" shows "+3"
        And the attack "Power Strike" shows "8"
