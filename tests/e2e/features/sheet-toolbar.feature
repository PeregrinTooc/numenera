Feature: Sheet Toolbar
    As a user editing my character on any device
    I want the version navigator and the Edit Layout button kept in a toolbar
    So that they never cover the character sheet I am trying to edit

    Background:
        Given I am on the character sheet page

    Scenario: Toolbar controls do not cover the character sheet
        Given my character has a history of 2 versions
        Then the navigator shows version 2 of 2
        And the version navigator should not overlap the character sheet
        And the Edit Layout button should not overlap the character sheet

    Scenario: Effort badge stays editable when version history exists
        Given my character's Effort is 1
        And my character has a history of 2 versions
        When I change my Effort to 3
        Then my character sheet shows my Effort as 3

    Scenario: Toolbar stays in view while scrolling
        Given my character has a history of 2 versions
        When I scroll to the bottom of the page
        Then the version navigator should be in view
        And the Edit Layout button should be in view
