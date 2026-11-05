Feature: Section Re-arrangement
  As a user
  I want to rearrange the sections of my character sheet
  So that I can customize the layout to match my play style

  Background:
    Given I am on the character sheet page

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

  Scenario: Reorder sections by dragging
    Given layout edit mode is active
    When I drag the "Cyphers" section above the "Abilities" section
    Then the "Cyphers" section should appear before the "Abilities" section

  Scenario: Drop a section below another by its bottom edge
    Given layout edit mode is active
    When I drag the "Abilities" section onto the bottom edge of the "Items" section
    Then the "Items" section should appear before the "Abilities" section

  Scenario: Move a section to the end of the sheet
    Given layout edit mode is active
    When I drag the "Abilities" section onto the bottom edge of the "Notes" section
    Then the "Abilities" section should be the last section

  Scenario: Layout persists after page reload
    Given layout edit mode is active
    And I have moved the "Cyphers" section to the top
    And I exit layout edit mode
    When I reload the page
    Then the "Cyphers" section should still be at the top

  Scenario Outline: Pair two sections by dropping on the middle of one
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the middle <side> of the "Items" section
    Then the grid should show "<left>" on the left and "<right>" on the right

    Examples:
      | side  | left    | right   |
      | right | Items   | Cyphers |
      | left  | Cyphers | Items   |

  Scenario Outline: Sections that cannot be paired are not paired
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "<source>" section onto the middle left of the "<target>" section
    Then the layout should still be the default layout

    Examples:
      | source | target |
      | Stats  | Items  |
      | Items  | Stats  |

  Scenario: Pairing with a paired section pushes it out below when coming from above
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the middle left of the "Notes" section
    Then the grid should show "Background" on the left and "Cyphers" on the right
    And "Notes" should be in its own row
    And the "Notes" section should be the last section

  Scenario: Pairing with a paired section pushes it out above when coming from below
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Items" section onto the middle right of the "Attacks" section
    Then the grid should show "Special Abilities" on the left and "Items" on the right
    And "Attacks" should be in its own row
    And the "Attacks" section should appear before the "Special Abilities" section

  Scenario: Swap the two sections of a pair
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I drag the "Attacks" section onto the middle left of the "Special Abilities" section
    Then the grid should show "Attacks" on the left and "Special Abilities" on the right

  Scenario: Split sections from grid by dragging out
    Given layout edit mode is active
    And "Background" and "Notes" are in a grid
    When I drag the "Background" section onto the top edge of the "Cyphers" section
    Then "Background" should be in its own row
    And "Notes" should be in its own row

  Scenario: Hovering the middle of a single section previews the pair
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle right of the "Items" section
    Then the "Items" section should preview "Cyphers" on its right

  Scenario: Hovering the middle of a paired section previews the push
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle left of the "Notes" section
    Then the "Notes" section should preview "Cyphers" in its place
    And the row of "Notes" should preview "Notes" below it

  Scenario: Hovering the middle of a section that cannot be paired previews nothing
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle left of the "Stats" section
    Then no drop preview should be shown

  Scenario: Holding still over a section shows the resulting layout before the drop
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    Then the grid should show "Items" on the left and "Cyphers" on the right
    And the layout should still be the default layout

  Scenario: The section under the pointer stays where it is when the live preview appears
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And the "Cyphers" section is at the top of the window
    When I hold the "Cyphers" section over the middle right of the "Items" section as the window shows it
    And I keep still for a moment
    Then the "Items" section should not have moved up or down on screen

  Scenario: Releasing outside the sheet after a live preview restores the layout
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    And I release the section outside the sheet
    Then the "Cyphers" section should appear before the "Items" section
    And the layout should still be the default layout

  Scenario: Sections slide into the layout shown after holding still
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    Then the "Items" section should slide into its new place
    And the "Cyphers" section should slide into its new place
    And the grid should show "Items" on the left and "Cyphers" on the right

  Scenario: Releasing after the live preview has appeared saves the pair
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    And I release the section where it is
    Then the saved layout should pair "Items" on the left and "Cyphers" on the right

  Scenario: Sections slide back when a live preview is cancelled
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    And the "Items" section should slide into its new place
    And I release the section outside the sheet
    Then the "Items" section should slide back to where it was
    And the "Cyphers" section should appear before the "Items" section

  Scenario: The drag carries on after the sections have slid
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    And the "Cyphers" section should slide into its new place
    And I drop the held section onto the top edge of the "Abilities" section
    Then "Cyphers" should be in its own row
    And the "Cyphers" section should appear before the "Abilities" section

  Scenario: The dragged section slides above the sections it passes
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I hold the "Items" section over the middle left of the "Cyphers" section
    And I keep still for a moment
    Then the "Items" section should be drawn above the "Cyphers" section while they slide

  Scenario: Nothing slides when reduced motion is preferred
    Given the viewport is 1280 pixels wide
    And I prefer reduced motion
    And layout edit mode is active
    And section slides are recorded
    When I hold the "Cyphers" section over the middle right of the "Items" section
    And I keep still for a moment
    Then the grid should show "Items" on the left and "Cyphers" on the right
    And no section should have slid

  Scenario: On a narrow screen dropping on the middle of a section reorders
    Given the viewport is 768 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the middle left of the "Abilities" section
    Then "Cyphers" should be in its own row
    And the "Abilities" section should appear before the "Cyphers" section

  Scenario: On a narrow screen dropping between the halves of a pair breaks the pair
    Given the viewport is 768 pixels wide
    And layout edit mode is active
    When I drag the "Cyphers" section onto the top edge of the "Notes" section
    Then "Background" should be in its own row
    And "Cyphers" should be in its own row
    And "Notes" should be in its own row
    And the "Background" section should appear before the "Cyphers" section
    And the "Cyphers" section should appear before the "Notes" section

  Scenario: Reset layout to default
    Given I have customized the layout
    And I open the settings panel
    When I click the Reset Layout button
    Then the layout should return to the default arrangement

  Scenario: Reset layout option is enabled
    When I open the settings panel
    Then the "Reset Layout" option should be enabled

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

  Scenario: Edit layout button is accessible on mobile
    Given the viewport is 768 pixels wide
    Then I should see the "Edit Layout" button
    And it should be touch-friendly

  # The gesture helper uses CDP touch input, which Playwright offers only on Chromium; covered on Pixel 5.
  @chromium-only
  Scenario: Long-press puts a section into drag mode
    Given the viewport is 768 pixels wide
    And layout edit mode is active
    When I long-press the "Cyphers" section
    Then the "Cyphers" section should be in drag mode

  # The gesture helper uses CDP touch input, which Playwright offers only on Chromium; covered on Pixel 5.
  @chromium-only
  Scenario: Reorder sections by long-press dragging on a touch device
    Given the viewport is 768 pixels wide
    And layout edit mode is active
    When I long-press the "Cyphers" section and drag it above the "Abilities" section
    Then the "Cyphers" section should appear before the "Abilities" section

  # The gesture helper uses CDP touch input, which Playwright offers only on Chromium.
  @chromium-only
  Scenario: Pair two sections by long-press dragging on a wide touch screen
    Given the viewport is 1280 pixels wide
    And layout edit mode is active
    When I long-press the "Cyphers" section and drag it onto the middle right of the "Items" section
    Then the grid should show "Items" on the left and "Cyphers" on the right

  # The gesture helper uses CDP touch input, which Playwright offers only on Chromium; covered on Pixel 5.
  @chromium-only
  Scenario: A quick swipe does not start a section drag
    Given the viewport is 768 pixels wide
    And layout edit mode is active
    When I swipe from the "Cyphers" section towards the "Abilities" section
    Then the "Abilities" section should appear before the "Cyphers" section
    And the page should have scrolled