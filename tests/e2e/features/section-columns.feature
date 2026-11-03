Feature: Card columns follow the section's width
  As a player arranging my character sheet
  I want card sections to show two columns only where they have room
  So that cards are never squeezed into a narrow section

  Background:
    Given I am on the character sheet page

  Scenario Outline: A section on its own row shows today's columns on a wide screen
    Given the viewport is 1280 pixels wide
    Then the "<section>" section should show its cards in <columns> column(s)

    Examples:
      | section           | columns |
      | Abilities         | 2       |
      | Cyphers           | 2       |
      | Items             | 2       |
      | Special Abilities | 1       |
      | Attacks           | 1       |

  Scenario: A section paired side by side shows one column
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And "Cyphers" and "Items" are in a grid
    Then the "Cyphers" section should show its cards in 1 column(s)

  Scenario: A stacked pair follows its sections' columns
    Given the viewport is 834 pixels wide
    And layout edit mode is active
    And "Cyphers" and "Items" are in a grid
    Then the "Cyphers" section should show its cards in 2 column(s)

  Scenario: On a phone every section shows one column
    Given the viewport is 390 pixels wide
    Then the "Abilities" section should show its cards in 1 column(s)
    And the "Cyphers" section should show its cards in 1 column(s)
