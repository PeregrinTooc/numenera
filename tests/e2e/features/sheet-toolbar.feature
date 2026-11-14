Feature: Sheet Toolbar
    As a user editing my character on any device
    I want the version navigator and the Edit Layout button kept in a toolbar
    So that they never cover the character sheet I am trying to edit

    Background:
        Given I am on the character sheet page

    Scenario: Toolbar controls do not cover the character sheet
        Given the character has 2 versions in history
        When I view the character sheet
        Then the version navigator should be visible
        And the version navigator should not overlap the character sheet
        And the Edit Layout button should not overlap the character sheet

    Scenario: Effort badge stays editable when version history exists
        Given my character's Effort is 1
        And the character has 2 versions in history
        When I change my Effort to 3
        Then my character sheet shows my Effort as 3

    Scenario: Toolbar stays in view while scrolling
        Given the character has 2 versions in history
        When I view the character sheet
        And I scroll to the bottom of the page
        Then the version navigator should be in view
        And the Edit Layout button should be in view
