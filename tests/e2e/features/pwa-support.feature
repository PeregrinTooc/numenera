# Service workers only run in the production build, hence @prod-only.
@prod-only
Feature: Installable, offline character sheet
    As a Numenera player
    I want to install the character sheet and open it without a connection
    So that I can play at a table with poor or no internet

    Scenario: The character sheet can be installed as an app
        Given I am on the character sheet page
        Then the character sheet should be installable as an app

    Scenario: The character sheet opens without a connection
        Given I have opened the character sheet before
        When I lose my connection
        And I reload the page
        Then the character sheet should be displayed
        And the "Cinzel" and "Caveat" fonts should be loaded

    @wip
    Scenario: Changes made without a connection are kept
        Given I have opened the character sheet before
        And I lose my connection
        When I change my Shins to 42
        And I reload the page
        Then my character sheet shows my Shins as 42

    @wip
    Scenario: I am offered a newer version of the character sheet
        Given I have opened the character sheet before
        When a newer version of the character sheet is published
        And I reload the page
        Then I should be told that a newer version is available
        When I accept the newer version
        Then the newer version of the character sheet should be running
