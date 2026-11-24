Feature: Combat & Special Abilities
    As a Numenera player
    I want to see my attacks and special abilities
    So that I can track my combat capabilities

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
