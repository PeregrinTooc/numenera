Feature: Phase 3 - Combat & Special Abilities
    As a Numenera player
    I want to see my attacks and special abilities
    So that I can track my combat capabilities

    Background:
        Given I am on the character sheet page

    Scenario: Display attack with all properties
        Given the character has an attack "Broadsword" with:
            | Property | Value                     |
            | Damage   | 4                         |
            | Modifier | 1                         |
            | Range    | Immediate                 |
            | Notes    | Heavy weapon, two-handed  |
        Then I should see the attack "Broadsword"
        And the attack "Broadsword" should show damage "4"
        And the attack "Broadsword" should show modifier "+1"
        And the attack "Broadsword" should show range "Immediate"
        And the attack "Broadsword" should show notes "Heavy weapon, two-handed"

    Scenario: Display attack without optional notes
        Then I should see the attack "Crossbow"
        And the attack "Crossbow" should show damage "4"
        And the attack "Crossbow" should show modifier "0"
        And the attack "Crossbow" should show range "Long"
        And the attack "Crossbow" should not show notes

    Scenario: Display special ability
        Given the character has a special ability "Lightning Bolt" with:
            | Property    | Value                                                        |
            | Description | Projects a bolt of lightning up to long range                |
            | Source      | Lightning Rod artifact                                       |
        Then I should see the special ability "Lightning Bolt"
        And the special ability "Lightning Bolt" should show description "Projects a bolt of lightning up to long range"
        And the special ability "Lightning Bolt" should show source "Lightning Rod artifact"

    Scenario: Display armor badge in attacks section
        Given the character has armor value 2
        Then I should see the armor badge in the attacks section
        And the armor badge should show value "2"

    Scenario: Empty attacks section shows empty state
        Given the character has no attacks
        Then I should see an empty attacks section
        And the empty attacks state should use translation keys

    Scenario: Empty special abilities section shows empty state
        Given the character has no special abilities
        Then I should see an empty special abilities section
        And the empty special abilities state should use translation keys

    Scenario: Visual styling for attacks
        Given the character has an attack "Broadsword"
        Then the attack "Broadsword" should have red combat theme styling

    Scenario: Visual styling for special abilities
        Given the character has a special ability "Lightning Bolt"
        Then the special ability "Lightning Bolt" should have teal theme styling

    Scenario: Two-column layout for combat section
        Given the character has special abilities and attacks
        Then the special abilities section should be in the left column
        And the attacks section should be in the right column
        And the sections should stack vertically on mobile