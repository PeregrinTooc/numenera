Feature: Settings Gear
  As a user
  I want to access application settings
  So that I can customize my experience

  Background:
    Given I am viewing the character sheet

  Scenario: Settings gear is visible in header
    Then I should see a settings gear icon in the header

  Scenario: Open settings panel
    When I click the settings gear icon
    Then I should see the settings panel

  Scenario: Settings open even when version history cannot start
    Given the browser offers no secure-origin cryptography
    When I click the settings gear icon
    Then I should see the settings panel

  Scenario: Close settings panel by clicking outside
    Given I have opened the settings panel
    When I click outside the settings panel
    Then the settings panel should close

  Scenario: Close settings panel with Escape key
    Given I have opened the settings panel
    When I press the Escape key
    Then the settings panel should close

  Scenario: Switch language to German
    Given I have opened the settings panel
    When I click the German flag icon
    Then the interface should display in German
    And the settings panel should close

  Scenario: Switch language to English
    Given I have opened the settings panel
    And the interface is in German
    When I click the British flag icon
    Then the interface should display in English
    And the settings panel should close

  Scenario: Settings gear is not obscured by version navigator
    Given my character has a history of 2 versions
    And I step back to the previous version
    And the navigator shows version 1 of 2
    When I click the settings gear icon
    Then I should see the settings panel

  Scenario: Reset Layout option is disabled
    Given I have opened the settings panel
    Then I should see a "Reset Layout" option
    And the "Reset Layout" option should be disabled