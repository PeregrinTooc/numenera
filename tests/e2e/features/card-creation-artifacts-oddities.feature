Feature: Card Creation: Artifacts and Oddities
    As a user
    I want to add new artifact and oddity cards to my character sheet
    So that I can build out my character's inventory

    Scenario: Add artifact button has its themed background color
        Given my character has 2 artifacts
        Then the add artifact button has a themed background colour

    Scenario: Starting a new artifact opens the editor with empty fields
        Given my character has 2 artifacts
        When I start a new artifact
        Then the card editor opens with empty artifact fields

    Scenario: Canceling artifact creation does not add a card
        Given my character has 2 artifacts
        When I start a new artifact
        And I set its name to "Test Artifact"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I cancel the card
        Then my character carries 2 artifacts

    Scenario: Saving a new artifact adds a card
        Given my character has 2 artifacts
        When I start a new artifact
        And I set its name to "Crystal Blade"
        And I set its level to "1d6+2"
        And I set its effect to "A sword that never dulls"
        And I save the card
        Then my character carries 3 artifacts
        And my character carries the artifact "Crystal Blade"

    Scenario: New artifact persists after reopening the character
        Given my character has 2 artifacts
        When I start a new artifact
        And I set its name to "Shield of Force"
        And I set its level to "1d6+4"
        And I set its effect to "Creates an energy barrier"
        And I save the card
        And I open my character again
        Then my character carries 3 artifacts
        And my character carries the artifact "Shield of Force"

    Scenario: Create artifact, then edit it, verify persistence
        Given my character has 2 artifacts
        When I start a new artifact
        And I set its name to "Power Gauntlet"
        And I set its level to "1d6"
        And I set its effect to "Enhances strength"
        And I save the card
        And I start editing the artifact "Power Gauntlet"
        And I set its name to "Power Gauntlet Mk II"
        And I set its level to "1d6+2"
        And I set its effect to "Greatly enhances strength and speed"
        And I save the card
        And I open my character again
        Then my character carries 3 artifacts
        And my character carries the artifact "Power Gauntlet Mk II"
        And the artifact "Power Gauntlet Mk II" shows "1d6+2"
        And the artifact "Power Gauntlet Mk II" shows "Greatly enhances strength and speed"

    Scenario: Add oddity button has its themed background color
        Given my character has 2 oddities
        Then the add oddity button has a themed background colour

    Scenario: Starting a new oddity opens the editor with empty fields
        Given my character has 2 oddities
        When I start a new oddity
        Then the card editor opens with empty oddity fields

    Scenario: Canceling oddity creation does not add a card
        Given my character has 2 oddities
        When I start a new oddity
        And I set its text to "Test Oddity"
        And I cancel the card
        Then my character carries 2 oddities

    Scenario: Saving a new oddity adds a card
        Given my character has 2 oddities
        When I start a new oddity
        And I set its text to "A metal sphere that whispers in the dark"
        And I save the card
        Then my character carries 3 oddities
        And my character carries the oddity "A metal sphere that whispers in the dark"

    Scenario: New oddity persists after reopening the character
        Given my character has 2 oddities
        When I start a new oddity
        And I set its text to "A translucent stone that floats in water"
        And I save the card
        And I open my character again
        Then my character carries 3 oddities
        And my character carries the oddity "A translucent stone that floats in water"

    Scenario: Create oddity, then edit it, verify persistence
        Given my character has 2 oddities
        When I start a new oddity
        And I set its text to "A small crystal that changes color"
        And I save the card
        And I start editing the oddity "A small crystal that changes color"
        And I set its text to "A large crystal that changes color based on temperature"
        And I save the card
        And I open my character again
        Then my character carries 3 oddities
        And my character carries the oddity "A large crystal that changes color based on temperature"
