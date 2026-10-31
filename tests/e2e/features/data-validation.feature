Feature: Data Validation Enhancement
    As a player
    I want robust validation for imported characters
    So that corrupted or manually edited files don't break my character sheet

    Background:
        Given I am on the character sheet page

    # Files go through the real import flow (file chooser, parser, sanitizer).

    Scenario: Import valid character file displays correctly
        When I import a valid character file with matching schema version
        Then the character should be imported successfully
        And all character data should be correctly displayed

    Scenario: Character data persists after import and page reload
        When I import a valid character file with matching schema version
        And I reload the page
        Then the character name should still be "Imported Hero"
        And the tier should still be "2"

    Scenario: Imported oddities are kept
        When I import a valid character file with matching schema version
        Then I should see an oddity card with text "Glowing orb"

    Scenario: Out-of-range values in an imported file are adjusted
        When I import a character file with tier 9
        Then the tier should have been adjusted to "6"
