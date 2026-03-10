Feature: Section Re-arrangement
  As a user
  I want to rearrange the sections of my character sheet
  So that I can customize the layout to match my play style

  Background:
    Given I am on the character sheet page

  # Edit Mode Entry
  Scenario: Enter layout edit mode via button
    When I click the Edit Layout button
    Then I should see layout edit mode is active
    And I should see visual indicators on rearrangeable sections

  Scenario: Exit layout edit mode via button
    Given layout edit mode is active
    When I click the Exit Edit Layout button
    Then layout edit mode should be inactive
    And the visual indicators should be removed

  Scenario: Exit layout edit mode saves layout automatically
    Given layout edit mode is active
    And I have reordered sections
    When I click the Exit Edit Layout button
    Then the layout should be saved
    And the sections should remain in the new order

  # Section Reordering - Drag/Drop tests skipped for now (manual testing required)
  @skip
  Scenario: Reorder sections by dragging
    Given layout edit mode is active
    When I drag the "Cyphers" section above the "Abilities" section
    Then the "Cyphers" section should appear before the "Abilities" section

  Scenario: Layout persists after page reload
    Given layout edit mode is active
    And I have moved the "Cyphers" section to the top
    And I exit layout edit mode
    When I reload the page
    Then the "Cyphers" section should still be at the top

  # Grid Merging - Drag/Drop tests skipped for now (manual testing required)
  @skip
  Scenario: Merge sections into grid by dragging onto another section
    Given layout edit mode is active
    When I drag the "Background" section onto the "Notes" section
    Then "Background" and "Notes" should be displayed side by side in a grid

  @skip
  Scenario: Cannot merge non-eligible sections into grid
    Given layout edit mode is active
    When I attempt to drag "Stats" onto "Basic Info"
    Then no grid should be created
    And the sections should remain in single-column layout

  # Grid Splitting - Drag/Drop tests skipped for now (manual testing required)
  @skip
  Scenario: Split sections from grid by dragging out
    Given layout edit mode is active
    And "Background" and "Notes" are in a grid
    When I drag "Background" out of the grid
    Then "Background" should be in its own row
    And "Notes" should be in its own row

  # Settings Integration
  Scenario: Reset layout to default
    Given I have customized the layout
    And I open the settings panel
    When I click the Reset Layout button
    And I confirm the reset
    Then the layout should return to the default arrangement

  Scenario: Reset layout option is enabled
    When I open the settings panel
    Then the "Reset Layout" option should be enabled

  # Export/Import Integration
  Scenario: Layout is included in character export
    Given I have customized the layout
    When I export the character
    Then the exported file should contain the layout configuration

  @skip
  Scenario: Import with different layout shows prompt
    Given I have customized the layout
    And I have a character file with a different layout
    When I import the character file
    Then I should see a layout choice prompt
    And I should see options to "Keep current layout" or "Use imported layout"

  @skip
  Scenario: Keep existing layout on import
    Given I have customized the layout
    And I have a character file with a different layout
    When I import the character file
    And I choose to "Keep current layout"
    Then my current layout should be preserved
    And only the character data should be imported

  @skip
  Scenario: Use imported layout on import
    Given I have customized the layout
    And I have a character file with a different layout
    When I import the character file
    And I choose to "Use imported layout"
    Then the layout from the imported file should be applied
    And the character data should be imported

  @skip
  Scenario: Import with same layout does not show prompt
    Given I have the default layout
    And I have a character file with the default layout
    When I import the character file
    Then I should not see a layout choice prompt
    And the character should be imported normally

  # Mobile Support
  Scenario: Edit layout button is accessible on mobile
    Given I am using a mobile device
    Then I should see the "Edit Layout" button
    And it should be touch-friendly

  @skip
  Scenario: Section dragging works on mobile with long-tap
    Given I am using a mobile device
    And layout edit mode is active
    When I long-tap on a section for 250ms
    Then the section should enter drag mode
    And I should be able to drag it to a new position