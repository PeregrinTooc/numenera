Feature: Text Fields Visual Styling
    Background and Notes fields should have parchment-themed styling

    Scenario: Background field has parchment theme
        Given a character exists with background text "Born in a remote village"
        And I am on the character sheet page
        Then the background container should have parchment styling
        And the background text should be displayed with serif font

    Scenario: Notes field has parchment theme
        Given a character exists with notes text "Investigating disappearances"
        And I am on the character sheet page
        Then the notes container should have parchment styling
        And the notes text should be displayed with serif font

    Scenario: Empty background has parchment theme
        Given I have a character with empty background in localStorage
        When I am on the character sheet page
        Then the empty background message should be displayed
        And the empty background container should have parchment styling

    Scenario: Empty notes has parchment theme
        Given I have a character with empty notes in localStorage
        When I am on the character sheet page
        Then the empty notes message should be displayed
        And the empty notes container should have parchment styling

    Scenario: Text fields are side by side on desktop
        Given a character exists with background and notes
        And I am on the character sheet page
        Then the background and notes containers should be in a two-column layout
