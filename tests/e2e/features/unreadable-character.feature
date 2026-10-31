Feature: An unreadable saved character is kept, not destroyed
    As a Numenera player
    I want a saved character the app cannot read to be kept for me
    So that I can recover it instead of losing my only copy

    Background:
        Given I am on the character sheet page

    Scenario: Download the unreadable data
        Given the stored character data is the unreadable text "garbled save"
        When I reload the page
        Then I should see the character name "Kael the Wanderer"
        And I should be asked what to do with the unreadable character
        And the kept unreadable data should be "garbled save"
        When I download the unreadable character
        Then the downloaded file should be named like "numenera-unreadable-character-DATE.json"
        And the downloaded file should contain exactly "garbled save"
        And no unreadable data should be kept
        When I reload the page
        Then I should not be asked about an unreadable character

    Scenario: Discard the unreadable data
        Given the stored character data is the unreadable text "garbled save"
        When I reload the page
        And I choose "Discard" for the unreadable character
        Then no unreadable data should be kept
        When I reload the page
        Then I should not be asked about an unreadable character

    Scenario: Ask me later keeps the data and asks again on the next load
        Given the stored character data is the unreadable text "garbled save"
        When I reload the page
        And I choose "Ask me later" for the unreadable character
        Then I should not be asked about an unreadable character
        And the kept unreadable data should be "garbled save"
        When I reload the page
        Then I should be asked what to do with the unreadable character

    Scenario: Escape behaves like ask me later
        Given the stored character data is the unreadable text "garbled save"
        When I reload the page
        And I press the Escape key
        Then I should not be asked about an unreadable character
        And the kept unreadable data should be "garbled save"
        When I reload the page
        Then I should be asked what to do with the unreadable character

    Scenario: Browser text that is not valid JSON is kept as it was written
        Given the browser holds the unparseable character text "{not valid json"
        When I reload the page
        Then I should see the character name "Kael the Wanderer"
        And I should be asked what to do with the unreadable character
        And the kept unreadable data should be "{not valid json"
