Feature: Combat & Special Abilities
    As a Numenera player
    I want to see my attacks and special abilities
    So that I can track my combat capabilities

    Scenario: Display attack with all properties
        Given my character has the attack "Broadsword" with:
            | Property | Value                     |
            | Damage   | 6                         |
            | Modifier | 2                         |
            | Range    | Short                     |
            | Notes    | Notched blade, two-handed |
        Then my character carries the attack "Broadsword"
        And the attack "Broadsword" shows damage "6"
        And the attack "Broadsword" shows modifier "+2"
        And the attack "Broadsword" shows range "Short"
        And the attack "Broadsword" shows notes "Notched blade, two-handed"

    Scenario: Display attack without optional notes
        Given my character has the attack "Crossbow" with:
            | Property | Value |
            | Damage   | 4     |
            | Modifier | 0     |
            | Range    | Long  |
        Then my character carries the attack "Crossbow"
        And the attack "Crossbow" shows damage "4"
        And the attack "Crossbow" shows modifier "0"
        And the attack "Crossbow" shows range "Long"
        And the attack "Crossbow" shows no notes

    Scenario: Display special ability
        Given my character has the special ability "Lightning Bolt" with:
            | Property    | Value                                           |
            | Description | Arcs between up to three targets in short range |
            | Source      | Storm Lens artifact                             |
        Then my character carries the special ability "Lightning Bolt"
        And the special ability "Lightning Bolt" shows description "Arcs between up to three targets in short range"
        And the special ability "Lightning Bolt" shows source "Storm Lens artifact"

    Scenario: Display armor badge in attacks section
        Given my character's Armor is 2
        Then the attacks section shows my character's armor of 2

    Scenario: Empty attacks section shows empty state
        Given my character has 0 attacks
        Then my character's attacks section says it is empty

    Scenario: Empty special abilities section shows empty state
        Given my character has 0 special abilities
        Then my character's special abilities section says it is empty

    Scenario: Visual styling for attacks
        Given my character has the attack "Broadsword"
        Then the attack "Broadsword" is themed red

    Scenario: Visual styling for special abilities
        Given my character has the special ability "Fire Affinity"
        Then the special ability "Fire Affinity" is themed teal

    Scenario: On a wide screen special abilities sit beside attacks
        Given I view my character on a wide screen
        And my character has 2 attacks
        Then the special abilities section sits left of the attacks section

    Scenario: On a phone special abilities and attacks stack
        Given I view my character on a phone
        And my character has 2 attacks
        Then the special abilities section sits above the attacks section

    @validation
    Scenario Outline: A long unbroken attack name stays inside its card at <width>px
        Given the viewport is <width> pixels wide
        And my character has an attack whose name is 40 characters long without spaces
        Then the page should not scroll horizontally
        And my character's attack keeps its badges at the right edge of its card

        Examples:
            | width |
            | 320   |
            | 390   |
            | 1280  |
