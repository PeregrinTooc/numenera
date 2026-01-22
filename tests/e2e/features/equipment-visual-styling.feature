Feature: Equipment Items Visual Styling
    Equipment items should have light green themed card design with proper styling

    Background:
        Given a character exists with the following equipment:
            | Name            | Description                                    |
            | Medium armor    | Provides protection without hindering movement |
            | Broadsword      | Heavy melee weapon                             |
            | Explorer's pack |                                                |
        And I am on the character sheet page

    Scenario: Equipment items have green theme styling
        Then each equipment item should have a light green background
        And each equipment item should have a green border
        And each equipment item should have rounded corners
        And each equipment item should have shadow

    Scenario: Equipment items show name and description
        Then the equipment item "Medium armor" should display its name
        And the equipment item "Medium armor" should display its description "Provides protection without hindering movement"
        And the equipment item "Broadsword" should display its name
        And the equipment item "Broadsword" should display its description "Heavy melee weapon"
        And the equipment item "Explorer's pack" should display its name
        And the equipment item "Explorer's pack" should not display a description

    Scenario: Equipment items have hover effects
        When I hover over an equipment item
        Then the equipment item shadow should increase

    Scenario: Empty equipment state has green theme
        Given a character exists with no equipment
        When I am on the character sheet page
        Then the empty equipment message should be displayed
        And the empty equipment container should have green theme styling
