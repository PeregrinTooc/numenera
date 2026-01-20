Feature: Single Character Display
    As a Numenera player
    I want to view my character's complete information
    So that I can reference it during gameplay

    Background:
        Given a character exists with the following data:
            | Property   | Value                |
            | Name       | Kael the Wanderer    |
            | Tier       | 3                    |
            | Type       | Glaive               |
            | Descriptor | Strong               |
            | Focus      | Bears a Halo of Fire |

    Scenario: View character basic information
        Given I am on the character sheet page
        Then I should see the character name "Kael the Wanderer"
        And I should see tier "3" displayed
        And I should see type "Glaive" displayed
        And I should see descriptor "Strong" displayed
        And I should see focus "Bears a Halo of Fire" displayed
        And all labels should use translation keys

    Scenario: View character stat pools
        Given I am on the character sheet page
        And the character has the following stats:
            | Stat      | Pool | Edge | Current |
            | Might     | 15   | 2    | 12      |
            | Speed     | 12   | 1    | 12      |
            | Intellect | 10   | 0    | 8       |
        Then I should see the "Might" stat with pool "15", edge "2", and current "12"
        And I should see the "Speed" stat with pool "12", edge "1", and current "12"
        And I should see the "Intellect" stat with pool "10", edge "0", and current "8"
        And all stat labels should use translation keys

    Scenario: View character items - Cyphers
        Given I am on the character sheet page
        And the character has the following cyphers:
            | Name              | Level | Effect                              |
            | Detonation (Cell) | 1d6+2 | Explodes in an immediate radius     |
            | Stim (Injector)   | 1d6   | Restores 1d6 + 2 points to one Pool |
        Then I should see 2 cyphers displayed
        And I should see cypher "Detonation (Cell)" with level "1d6+2"
        And I should see cypher "Stim (Injector)" with level "1d6"
        And the cyphers section label should use translation keys

    Scenario: View character items - Artifacts and Oddities
        Given I am on the character sheet page
        And the character has the following artifacts:
            | Name          | Level | Effect                                   |
            | Lightning Rod | 6     | Projects lightning bolt up to long range |
        And the character has the following oddities:
            | Description                                     |
            | A glowing cube that hums when near water        |
            | A piece of transparent metal that's always cold |
        Then I should see 1 artifact displayed
        And I should see artifact "Lightning Rod" with level "6"
        And I should see 2 oddities displayed
        And I should see oddity "A glowing cube that hums when near water"
        And I should see oddity "A piece of transparent metal that's always cold"
        And the items section labels should use translation keys

    Scenario: View character text fields
        Given I am on the character sheet page
        And the character has the following text fields:
            | Field      | Content                                                                    |
            | Background | Born in a remote village, discovered ancient ruins that changed everything |
            | Notes      | Currently investigating the mysterious disappearances in the nearby forest |
            | Equipment  | Medium armor, Broadsword, Explorer's pack, 50 feet of rope                 |
            | Abilities  | Trained in intimidation, Specialized in heavy weapons                      |
        Then I should see the background text
        And I should see the notes text
        And I should see the equipment text
        And I should see the abilities text
        And all text field labels should use translation keys

    Scenario: View empty character items sections
        Given I am on the character sheet page
        And the character has no cyphers
        And the character has no artifacts
        And the character has no oddities
        Then I should see an empty cyphers section
        And I should see an empty artifacts section
        And I should see an empty oddities section
        And empty states should use translation keys

    Scenario: View empty character text fields
        Given I am on the character sheet page
        And the character has empty text fields
        Then I should see empty state for background
        And I should see empty state for notes
        And I should see empty state for equipment
        And I should see empty state for abilities
