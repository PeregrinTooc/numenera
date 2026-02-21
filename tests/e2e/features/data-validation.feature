Feature: Data Validation Enhancement
    As a player
    I want robust validation for imported characters
    So that corrupted or manually edited files don't break my character sheet

    Background:
        Given I am on the character sheet page

    # The core validation logic (sanitizeCharacter) is extensively tested
    # by 43 unit tests in characterValidation.test.ts.
    # 
    # These E2E tests verify the end-to-end import flow works correctly.

    Scenario: Import valid character file displays correctly
        When I import a valid character file with matching schema version
        Then the character should be imported successfully
        And all character data should be correctly displayed

    Scenario: Character data persists after import and page reload
        When I import a valid character file with matching schema version
        And I reload the page
        Then the character name should still be "Imported Hero"
        And the tier should still be "2"