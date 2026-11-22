Feature: Card Creation: Abilities
    As a user
    I want to add new ability and special ability cards to my character sheet
    So that I can build out my character's combat options and abilities

    Scenario: Add ability button has its themed background color
        Given my character has 2 abilities
        Then the add ability button has a themed background colour

    Scenario: Starting a new ability opens the editor with empty fields
        Given my character has 2 abilities
        When I start a new ability
        Then the card editor opens with empty ability fields

    Scenario: Canceling ability creation does not add a card
        Given my character has 2 abilities
        When I start a new ability
        And I set its name to "Test Ability"
        And I set its description to "Test description"
        And I cancel the card
        Then my character carries 2 abilities

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

    Scenario: Starting a new special ability opens the editor with empty fields
        Given my character has 2 special abilities
        When I start a new special ability
        Then the card editor opens with empty special ability fields

    Scenario: Canceling special ability creation does not add a card
        Given my character has 2 special abilities
        When I start a new special ability
        And I set its name to "Test Special"
        And I set its source to "Test Type"
        And I set its description to "Test description"
        And I cancel the card
        Then my character carries 2 special abilities

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
