Feature: Single Character Display
    As a Numenera player
    I want to view my character's complete information
    So that I can reference it during gameplay

    Background:
        Given a character exists with the following data:
            | Property   | Value                  |
            | Name       | Ilsa of the Ninth Gate |
            | Tier       | 2                      |
            | Type       | Nano                   |
            | Descriptor | Clever                 |
            | Focus      | Talks to Machines      |

    Scenario: View character basic information
        Given I am on the character sheet page
        Then I should see the character name "Ilsa of the Ninth Gate"
        And I should see tier "2" displayed
        And I should see type "Nano" displayed
        And I should see descriptor "Clever" displayed
        And I should see focus "Talks to Machines" displayed
        And all labels should use translation keys

    Scenario: View character stat pools
        Given I am on the character sheet page
        And the character has the following stats:
            | Stat      | Pool | Edge | Current |
            | Might     | 18   | 3    | 14      |
            | Speed     | 9    | 0    | 7       |
            | Intellect | 11   | 1    | 11      |
        Then I should see the "Might" stat with pool "18", edge "3", and current "14"
        And I should see the "Speed" stat with pool "9", edge "0", and current "7"
        And I should see the "Intellect" stat with pool "11", edge "1", and current "11"
        And all stat labels should use translation keys

    Scenario: View character items - Cyphers
        Given I am on the character sheet page
        And the character has the following cyphers:
            | Name                 | Level | Effect                            |
            | Rejuvenator (Pill)   | 1d6+1 | Restores 2 points to one Pool     |
            | Phase Changer (Belt) | 1d6+3 | Become out of phase for one round |
        Then I should see 2 cyphers displayed
        And I should see cypher "Rejuvenator (Pill)" with level "1d6+1"
        And I should see cypher "Phase Changer (Belt)" with level "1d6+3"
        And the cyphers section label should use translation keys

    Scenario: View character items - Artifacts and Oddities
        Given I am on the character sheet page
        And the character has the following artifacts:
            | Name       | Level | Effect                   |
            | Storm Lens | 5     | Calls a localized squall |
        And the character has the following oddities:
            | Description                 |
            | A feather that falls upward |
            | A coin that is always warm  |
        Then I should see 1 artifact displayed
        And I should see artifact "Storm Lens" with level "5"
        And I should see 2 oddities displayed
        And I should see oddity "A feather that falls upward"
        And I should see oddity "A coin that is always warm"
        And the items section labels should use translation keys

    Scenario: View character text fields
        Given I am on the character sheet page
        And the character has the following text:
            | Field      | Content                                        |
            | Background | Raised by a seskii pack beyond the Black Riage |
            | Notes      | Owes the Aeon Priests of Qi a favour           |
        Then the character text should read exactly:
            | Field      | Content                                        |
            | Background | Raised by a seskii pack beyond the Black Riage |
            | Notes      | Owes the Aeon Priests of Qi a favour           |
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

    @validation
    Scenario: Text with quotes, ampersands and angle brackets is shown verbatim
        Given I am on the character sheet page
        And the character has the following text:
            | Field      | Content                                   |
            | Name       | Kael <The Swift> & "Red" O'Connor         |
            | Background | Born in <Unknown Location> & raised alone |
        Then the character text should read exactly:
            | Field      | Content                                   |
            | Name       | Kael <The Swift> & "Red" O'Connor         |
            | Background | Born in <Unknown Location> & raised alone |
        And no markup from the text should be rendered as HTML

    # Widths below every device profile's (320) and at each profile's own width,
    # so the check holds even when the suite runs only the desktop profile.
    @validation
    Scenario Outline: Long unbroken text does not make the sheet scroll sideways at <width>px
        Given the viewport is <width> pixels wide
        And I am on the character sheet page
        And the character has a 50-character name without spaces
        Then the page should not scroll horizontally

        Examples:
            | width |
            | 320   |
            | 390   |
            | 393   |
            | 1024  |
            | 1280  |

    @validation
    Scenario: Sections appear in the default layout order
        Given I am on the character sheet page
        And I have the default layout
        Then I should see sections in this order:
            | Basic Info        |
            | Stats             |
            | Recovery & Damage |
            | Abilities         |
            | Special Abilities |
            | Attacks           |
            | Cyphers           |
            | Items             |
            | Background        |
            | Notes             |
