Feature: Recovery Rolls and Damage Tracking
  As a Numenera player
  I want to track my recovery rolls and damage status
  So I can manage my character's health and recovery options

  Background:
    Given I am on the character sheet page

  Scenario: Display recovery rolls section
    Then I should see a section titled "Recovery Rolls"
    And I should see the recovery modifier display "1d6 + 2"
    And I should see 4 recovery roll checkboxes

  Scenario: Display recovery roll labels with time durations
    Then I should see recovery roll "Action" with time "1 action"
    And I should see recovery roll "Ten Minutes" with time "10 min"
    And I should see recovery roll "One Hour" with time "1 hour"
    And I should see recovery roll "Ten Hours" with time "10 hours"

  Scenario: Track used recovery rolls
    Given the character has "Ten Minutes" recovery used
    Then the "Ten Minutes" recovery checkbox should be checked
    And the "Action" recovery checkbox should be unchecked
    And the "One Hour" recovery checkbox should be unchecked
    And the "Ten Hours" recovery checkbox should be unchecked

  Scenario: Display damage track section
    Then I should see a section titled "Damage Track"
    And I should see 3 damage status options

  Scenario: Display damage track options with descriptions
    Then I should see damage status "Healthy"
    And I should see damage status "Impaired" with description "tasks +1 difficulty"
    And I should see damage status "Debilitated" with description "move only"

  Scenario: Show healthy status by default
    Given the character is "healthy"
    Then the "Healthy" radio button should be selected
    And the "Impaired" radio button should not be selected
    And the "Debilitated" radio button should not be selected

  Scenario: Show impaired status
    Given the character is "impaired"
    Then the "Impaired" radio button should be selected
    And the "Healthy" radio button should not be selected
    And the "Debilitated" radio button should not be selected

  Scenario: Show debilitated status
    Given the character is "debilitated"
    Then the "Debilitated" radio button should be selected
    And the "Healthy" radio button should not be selected
    And the "Impaired" radio button should not be selected

  Scenario: Recovery rolls section has green healing theme
    Then the recovery rolls section should have green styling

  Scenario: Damage track section has red warning theme
    Then the damage track section should have red styling

  Scenario: Recovery modifier is displayed correctly
    Given the character has recovery modifier 2
    Then I should see "1d6 + 2" in the recovery section

  Scenario: Recovery modifier shows zero correctly
    Given the character has recovery modifier 0
    Then I should see "1d6 + 0" in the recovery section

  Scenario: All recovery rolls available for new character
    Given the character is new
    Then all recovery checkboxes should be unchecked

  Scenario: Edit recovery modifier
    Given I am on the character sheet page
    When I click on the recovery modifier display
    Then I should see an edit modal
    When I enter "5" in the modifier field
    And I confirm the edit
    Then I should see "1d6 + 5" in the recovery section
