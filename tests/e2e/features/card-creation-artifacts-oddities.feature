Feature: Card Creation: Artifacts and Oddities
    As a user
    I want to add new artifact and oddity cards to my character sheet
    So that I can build out my character's inventory

    Scenario: Add artifact button has its themed background color
        Given my character has 2 artifacts
        Then the add artifact button has a themed background colour

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
