Feature: No requests to other sites
    As a Numenera player
    I want the character sheet to load everything from its own site
    So that opening it shares nothing about me with anyone else

    Scenario: Opening the character sheet contacts no other site
        When I open the character sheet and watch its requests
        Then nothing should have been requested from another site

    Scenario: The character sheet shows its own fonts
        When I open the character sheet and watch its requests
        Then the "Cinzel" and "Caveat" fonts should be loaded
