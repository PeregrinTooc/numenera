Feature: Edit Basic Character Information
    As a Numenera player
    I want to edit my character's basic information (name, tier, descriptor, focus)
    So that I can update my character as they progress through the game

    Scenario Outline: Changing a piece of basic information shows the new value
        Given my character's <field> is "<old>"
        When I change my <field> to "<new>"
        Then my character sheet shows my <field> as "<new>"

        Examples:
            | field      | old                  | new                    |
            | name       | Kael the Wanderer    | Kael the Wise          |
            | descriptor | Strong               | Swift                  |
            | focus      | Bears a Halo of Fire | Commands Mental Powers |

    Scenario: A changed tier is shown
        Given my character's tier is 3
        When I change my tier to 5
        Then my character sheet shows my tier as 5

    Scenario: A changed name is still there the next time I open my character
        Given my character's name is "Kael the Wanderer"
        When I change my name to "Kael the Wise"
        And I open my character again
        Then my character sheet shows my name as "Kael the Wise"

    Scenario: Several pieces of basic information can be changed one after another
        Given my character's name is "Kael the Wanderer"
        When I change my name to "Kael the Wise"
        And I change my tier to 4
        Then my character sheet shows my name as "Kael the Wise"
        And my character sheet shows my tier as 4

    Scenario Outline: A tier outside the Numenera range is limited to it
        Given my character's tier is 3
        When I change my tier to <entered>
        Then my character sheet shows my tier as <shown>

        Examples:
            | entered | shown |
            | 7       | 6     |
            | 0       | 1     |

    Scenario: A character must have a name
        Given my character's name is "Kael the Wanderer"
        When I try to change my name to nothing
        Then the change is refused
        And my character sheet shows my name as "Kael the Wanderer"
