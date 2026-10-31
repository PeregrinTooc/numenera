Feature: Collection Reordering
  As a player
  I want to reorder the cards in every collection
  So that the entries I use most are at the top

  Background:
    Given I am on the character sheet page

  Scenario Outline: Reorder <collection> by dragging
    Given the "<collection>" collection holds "Alpha, Beta, Gamma"
    When I drag "Gamma" before "Alpha" in the "<collection>" collection
    Then the "<collection>" collection should be in order "Gamma, Alpha, Beta"

    Examples:
      | collection       |
      | attacks          |
      | specialAbilities |
      | equipment        |
      | artifacts        |
      | oddities         |

  Scenario Outline: Reordered <collection> persist after reload
    Given the "<collection>" collection holds "Alpha, Beta, Gamma"
    When I drag "Alpha" after "Gamma" in the "<collection>" collection
    And I reload the page
    Then the "<collection>" collection should be in order "Beta, Gamma, Alpha"

    Examples:
      | collection       |
      | attacks          |
      | specialAbilities |
      | equipment        |
      | artifacts        |
      | oddities         |
