Feature: Resource Tracker Fields Editing
    As a user
    I want to edit XP, Shins, Armor, Max Cyphers, and Effort values
    So that I can manage character resources effectively

    Scenario Outline: The sheet shows my character's resources
        Given my character's <resource> is <value>
        Then my character sheet shows my <resource> as <value>

        Examples:
            | resource    | value |
            | Current XP  | 5     |
            | Total XP    | 45    |
            | Shins       | 100   |
            | Armor       | 2     |
            | Max Cyphers | 2     |
            | Effort      | 1     |

    Scenario Outline: Changing a resource shows the new value
        Given my character's <resource> is <old>
        When I change my <resource> to <new>
        Then my character sheet shows my <resource> as <new>

        Examples:
            | resource    | old | new |
            | Current XP  | 5   | 10  |
            | Total XP    | 45  | 60  |
            | Shins       | 100 | 250 |
            | Armor       | 2   | 3   |
            | Max Cyphers | 2   | 4   |
            | Effort      | 1   | 3   |

    Scenario: A changed resource is still there the next time I open my character
        Given my character's Shins is 100
        When I change my Shins to 500
        And I open my character again
        Then my character sheet shows my Shins as 500

    Scenario: Changing current XP leaves total XP untouched
        Given my character has 5 current XP and 45 total XP
        When I change my Current XP to 10
        Then my character sheet shows my Current XP as 10
        And my character sheet shows my Total XP as 45

    Scenario: Changing total XP leaves current XP untouched
        Given my character has 5 current XP and 45 total XP
        When I change my Total XP to 60
        Then my character sheet shows my Total XP as 60
        And my character sheet shows my Current XP as 5

    Scenario: XP must be a number
        Given my character has 5 current XP and 45 total XP
        When I try to change my Current XP to "abc"
        Then the change is refused
        And I am told why

    Scenario: A character saved before the current/total split shows the same value in both cells
        Given my character was saved with a single legacy XP value of 12
        Then my character sheet shows my Current XP as 12
        And my character sheet shows my Total XP as 12

    Scenario Outline: A resource can be zero
        Given my character's <resource> is <old>
        When I change my <resource> to 0
        Then my character sheet shows my <resource> as 0

        Examples:
            | resource | old |
            | Shins    | 100 |
            | Armor    | 2   |

    Scenario: Editing Shins still updates the badge after an item card was added
        Given my character's Shins is 100
        When I start a new equipment
        And I set its name to "Sword"
        And I save the card
        And I change my Shins to 250
        Then my character sheet shows my Shins as 250
