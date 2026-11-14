Feature: Single Character Display
    As a Numenera player
    I want to view my character's complete information
    So that I can reference it during gameplay

    Scenario: View character basic information
        Given my character has this basic information:
            | Property   | Value                  |
            | Name       | Ilsa of the Ninth Gate |
            | Tier       | 2                      |
            | Type       | Nano                   |
            | Descriptor | Clever                 |
            | Focus      | Talks to Machines      |
        Then my character sheet shows my name as "Ilsa of the Ninth Gate"
        And my character sheet shows my tier as 2
        And my character type shows as "Nano"
        And my character sheet shows my descriptor as "Clever"
        And my character sheet shows my focus as "Talks to Machines"
        And my character sheet shows no untranslated text

    Scenario: View character stat pools
        Given my character has these stats:
            | Stat      | Pool | Edge | Current |
            | Might     | 18   | 3    | 14      |
            | Speed     | 9    | 0    | 7       |
            | Intellect | 11   | 1    | 11      |
        Then my character sheet shows these stats:
            | Stat      | Pool | Edge | Current |
            | Might     | 18   | 3    | 14      |
            | Speed     | 9    | 0    | 7       |
            | Intellect | 11   | 1    | 11      |
        And my character sheet shows no untranslated text

    Scenario: Editable and add controls carry translated accessible labels
        Given I am on the character sheet page
        Then my character sheet's editable values and add controls have translated accessible labels

    Scenario: View character items - Cyphers
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        Then my character carries 2 cyphers
        And the cypher "Detonation (Cell)" shows level "1d6+2"
        And the cypher "Stim (Injector)" shows level "1d6"
        And my character sheet shows no untranslated text

    Scenario: View character items - Artifacts
        Given my character has the artifact "Lightning Rod"
        Then my character carries the artifact "Lightning Rod"
        And the artifact "Lightning Rod" shows level "6"
        And my character sheet shows no untranslated text

    Scenario: View character items - Oddities
        Given my character has the oddities "A glowing cube that hums when near water" and "A piece of transparent metal that's always cold"
        Then my character carries 2 oddities
        And my character carries the oddity "A glowing cube that hums when near water"
        And my character carries the oddity "A piece of transparent metal that's always cold"
        And my character sheet shows no untranslated text

    Scenario Outline: View character text fields - <field>
        Given my character's <field> reads "<text>"
        Then my <field> reads "<text>"
        And my character sheet shows no untranslated text

        Examples:
            | field      | text                                           |
            | background | Raised by a seskii pack beyond the Black Riage |
            | notes      | Owes the Aeon Priests of Qi a favour           |

    Scenario: A new character shows every section as empty
        Given the character sheet is empty
        Then my character's cyphers section says it is empty
        And my character's artifacts section says it is empty
        And my character's oddities section says it is empty
        And my character's equipment section says it is empty
        And my character's abilities section says it is empty
        And my background reads ""
        And my notes reads ""
        And my character sheet shows no untranslated text

    @validation
    Scenario: Text with quotes, ampersands and angle brackets is shown verbatim in the name
        Given my character's name is "Kael <The Swift> & \"Red\" O'Connor"
        Then my character sheet shows my name as "Kael <The Swift> & \"Red\" O'Connor"
        And my character's name is shown as plain text, not as markup

    @validation
    Scenario: Text with quotes, ampersands and angle brackets is shown verbatim in the background
        Given my character's background reads "Born in <Unknown Location> & raised alone"
        Then my background reads "Born in <Unknown Location> & raised alone"

    # Widths below every device profile's (320) and at each profile's own width,
    # so the check holds even when the suite runs only the desktop profile.
    @validation
    Scenario Outline: Long unbroken text does not make the sheet scroll sideways at <width>px
        Given the viewport is <width> pixels wide
        And my character's name is 50 characters long without spaces
        Then the page should not scroll horizontally

        Examples:
            | width |
            | 320   |
            | 390   |
            | 393   |
            | 834   |
            | 1280  |

    @validation
    Scenario: Sections appear in the default layout order
        Given I have the default layout
        Then my character sheet lists its sections in this order:
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
