Feature: Card Creation: Abilities
    As a user
    I want to add new ability and special ability cards to my character sheet
    So that I can build out my character's combat options and abilities

    Scenario: Add ability button has its themed background color
        Given my character has 2 abilities
        Then the add ability button has a themed background colour

    Scenario: Create ability, then edit it, verify persistence
        Given my character has 2 abilities
        When I start a new ability
        And I set its name to "Basic Heal"
        And I set its cost to "2"
        And I set its pool to "Intellect"
        And I set its description to "Heal minor wounds"
        And I save the card
        And I start editing the ability "Basic Heal"
        And I set its name to "Greater Heal"
        And I set its cost to "5"
        And I set its pool to "Intellect"
        And I set its description to "Heal major wounds and restore vitality"
        And I save the card
        And I open my character again
        Then my character carries 3 abilities
        And my character carries the ability "Greater Heal"
        And the ability "Greater Heal" shows "5"
        And the ability "Greater Heal" shows "Intellect"

    Scenario: Add special ability button has its themed background color
        Given my character has 2 special abilities
        Then the add special ability button has a themed background colour

    Scenario: Create special ability, then edit it, verify persistence
        Given my character has 2 special abilities
        When I start a new special ability
        And I set its name to "Basic Shield"
        And I set its source to "Type"
        And I set its description to "Provides basic protection"
        And I save the card
        And I start editing the special ability "Basic Shield"
        And I set its name to "Advanced Shield"
        And I set its source to "Focus"
        And I set its description to "Provides enhanced protection and reflects damage"
        And I save the card
        And I open my character again
        Then my character carries 3 special abilities
        And my character carries the special ability "Advanced Shield"
        And the special ability "Advanced Shield" shows "Focus"
