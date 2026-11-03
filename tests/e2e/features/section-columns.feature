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

  Scenario: Switching a section to one column in layout edit mode
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I switch the "Cyphers" section to 1 column(s)
    Then the "Cyphers" section should show its cards in 1 column(s)
    When I exit layout edit mode
    And I reload the page
    Then the "Cyphers" section should show its cards in 1 column(s)

  Scenario: The switch is only offered where it can do something
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And "Cyphers" and "Items" are in a grid
    Then the "Cyphers" section should offer no column switch
    And the "Stats" section should offer no column switch
    And the "Abilities" section should offer a column switch

  Scenario: No column switch outside layout edit mode
    Given the viewport is 1280 pixels wide
    Then the "Abilities" section should offer no column switch

  Scenario: Cypher and Items show their badge at the top left
    Given the viewport is 1280 pixels wide
    Then the max cyphers badge should be left of the "Cyphers" heading
    And the shins badge should be left of the "Items" heading

  Scenario: On a narrow phone the armor badge leaves the add attack button free
    Given the viewport is 360 pixels wide
    Then the armor badge should not cover the add attack button

  Scenario: On a narrow phone the German Items heading row stays inside its frame
    Given the language is set to "de"
    And the viewport is 360 pixels wide
    Then the "Items" heading row should stay inside its frame
