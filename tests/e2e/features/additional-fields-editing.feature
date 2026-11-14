Feature: Additional Character Fields Editing
    As a user
    I want to edit the character type, background, and notes fields
    So that I can manage all character information effectively

    Scenario: A character type is chosen from Nano, Glaive and Jack
        Given my character's type is "Nano"
        Then my character type shows as "Nano"
        And the character types to choose from are "Nano", "Glaive", "Jack"

    Scenario: A changed character type is still there the next time I open my character
        Given my character's type is "Nano"
        When I choose "Glaive" as my character type
        Then my character type shows as "Glaive"
        When I open my character again
        Then my character type shows as "Glaive"

    Scenario: A text field can only be read until I click it
        Given my character's background reads "A mysterious wanderer..."
        Then my background reads "A mysterious wanderer..."
        And my background cannot be edited yet and looks clickable
        When I click my background
        Then I can edit my background

    Scenario: Clicking away from a text field saves what I wrote
        Given my character's background reads "A mysterious wanderer..."
        When I click my background
        And I type "New background story here" in my background
        And I click away from my background
        Then my background cannot be edited yet and looks clickable
        And my background reads "New background story here"
        When I open my character again
        Then my background reads "New background story here"

    Scenario Outline: What I write is still there the next time I open my character
        Given my character's <field> reads "Before"
        When I write "Persistent text" as my <field>
        And I open my character again
        Then my <field> reads "Persistent text"

        Examples:
            | field      |
            | background |
            | notes      |

    Scenario: A text field can be emptied
        Given my character's background reads "A mysterious wanderer..."
        When I write "" as my background
        Then my background reads ""
        When I open my character again
        Then my background reads ""

    Scenario: Long text is kept in full
        Given my character's background reads "Short"
        When I write 1000 characters as my background
        Then my background holds all 1000 characters
        When I open my character again
        Then my background holds all 1000 characters

    Scenario: Special characters are kept as written
        Given my character's background reads "Short"
        When I write "Special: <>&chars" as my background
        Then my background reads "Special: <>&chars"
        When I open my character again
        Then my background reads "Special: <>&chars"

    Scenario: Starting on the notes saves the background I was writing
        Given my character's background reads "A mysterious wanderer..."
        And my character's notes reads "Quest: Find the artifact"
        When I click my background
        And I type "Background edit" in my background
        And I click my notes
        Then my background cannot be edited yet and looks clickable
        And my background reads "Background edit"
        And I can edit my notes

    Scenario: Choosing a character type does not interrupt writing the background
        Given my character's type is "Nano"
        When I click my background
        And I type "Background edit" in my background
        And I choose "Glaive" as my character type
        Then I can still edit my background
        And my background reads "Background edit"
        And my character type shows as "Glaive"

    # Regression: on iPad the notes were made editable only after the tap had
    # focused them, so iPadOS never raised the on-screen keyboard.
    Scenario: Tapping the notes brings up the on-screen keyboard
        Given my character's notes reads "Quest: Find the artifact"
        When I tap my notes
        Then the on-screen keyboard comes up

    Scenario: In German the type is labelled and an empty background invites editing
        Given my character's background reads ""
        And the language is set to "de"
        Then the character type is labelled "Typ"
        And my empty background invites me to write with "Zum Bearbeiten klicken..."
