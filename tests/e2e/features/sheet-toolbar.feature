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
        Given the character has 2 versions in history
        And the character has effort 1
        When I click the Effort badge
        Then the edit modal should open
        And the modal input should contain "1"

    Scenario: Toolbar stays in view while scrolling
        Given the character has 2 versions in history
        When I view the character sheet
        And I scroll to the bottom of the page
        Then the version navigator should be in view
        And the Edit Layout button should be in view
