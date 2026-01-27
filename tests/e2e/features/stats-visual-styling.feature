Feature: Stats Section Visual Styling
    As a Numenera player
    I want the stats section to be visually condensed
    So that it takes up less space while remaining readable and functional

    Background:
        Given I am on the character sheet page
        And the character data is loaded

    Scenario: Stats section uses condensed layout
        Then the stats section should be visible
        And the stats section should use condensed styling
        And all three stat pools should be displayed side-by-side on desktop
        And each stat pool card should use compact dimensions

    Scenario: Stat pool cards use smaller fonts
        Then the might pool number should use a smaller font size
        And the speed pool number should use a smaller font size
        And the intellect pool number should use a smaller font size
        And the stat labels should remain readable

    Scenario: Stat pool cards maintain editability with condensed design
        When I click on the "Might Pool" value
        Then an edit modal should appear
        When I click the Cancel button
        And I click on the "Speed Edge" value
        Then an edit modal should appear
        When I click the Cancel button
        And I click on the "Intellect Current" value
        Then an edit modal should appear

    Scenario: Effort badge remains visible with condensed stats
        Then the effort badge should be visible in the stats section
        And the effort badge should be positioned in the top-right corner

    Scenario: Condensed stats work on mobile viewport
        Given I am viewing on a mobile device with width "375px"
        Then the stats section should stack vertically on mobile
        And each stat pool should remain readable
        And all stat values should remain clickable