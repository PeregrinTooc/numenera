Feature: Stat Pool Value Editing
    As a Numenera player
    I want to edit stat pool values (Pool, Edge, Current) for Might, Speed, and Intellect
    So that I can track my character's stats during gameplay

    Scenario: The sheet shows my character's stat values
        Given my character's Might pool is 15
        Then my character sheet shows my Might pool as 15

    Scenario Outline: Changing a stat value shows the new value
        Given my character's <stat> <field> is 6
        When I change my <stat> <field> to <new_value>
        Then my character sheet shows my <stat> <field> as <new_value>

        Examples:
            | stat      | field   | new_value |
            | Might     | Pool    | 25        |
            | Might     | Edge    | 3         |
            | Might     | Current | 12        |
            | Speed     | Pool    | 18        |
            | Speed     | Edge    | 2         |
            | Speed     | Current | 15        |
            | Intellect | Pool    | 16        |
            | Intellect | Edge    | 3         |
            | Intellect | Current | 14        |

    Scenario: A changed stat value is still there the next time I open my character
        Given my character's Speed edge is 1
        When I change my Speed edge to 4
        And I open my character again
        Then my character sheet shows my Speed edge as 4

    Scenario: A stat value can be zero
        Given my character's Intellect pool is 10
        When I change my Intellect pool to 0
        Then my character sheet shows my Intellect pool as 0

    Scenario: A stat value can be as large as 9999
        Given my character's Might pool is 10
        When I change my Might pool to 9999
        Then my character sheet shows my Might pool as 9999
