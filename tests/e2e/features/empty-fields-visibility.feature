Feature: Empty Fields Visibility
    As a Numenera player
    I want to see and click on empty descriptor and focus fields
    So that I can easily edit them on new characters

    Scenario Outline: An empty <field> shows a placeholder and invites a click
        Given my character has no <field>
        Then my character sheet shows the placeholder for my <field>
        And my <field> looks clickable

        Examples:
            | field      |
            | descriptor |
            | focus      |

    Scenario Outline: An empty <field> can be filled in
        Given my character has no <field>
        When I change my <field> to "<value>"
        Then my character sheet shows my <field> as "<value>"

        Examples:
            | field      | value                |
            | descriptor | Strong               |
            | focus      | Bears a Halo of Fire |
