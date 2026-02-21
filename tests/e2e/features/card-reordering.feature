Feature: Card Reordering
  As a player
  I want to reorder cards within sections
  So that frequently-used items are at the top

  Background:
    Given I am on the character sheet page

  # ============================================================================
  # CYPHER REORDERING - Start with simplest test case
  # ============================================================================

  Scenario: Cyphers display in array order
    Given the character has 3 cyphers named "Alpha", "Beta", "Gamma"
    Then the cyphers should be in order "Alpha", "Beta", "Gamma"

  Scenario: Reorder cyphers by dragging on desktop
    Given the character has 3 cyphers named "First", "Second", "Third"
    When I drag cypher "Third" before cypher "First"
    Then the cyphers should be in order "Third", "First", "Second"

  Scenario: Cypher order persists after page reload
    Given the character has 3 cyphers named "Alpha", "Beta", "Gamma"
    When I drag cypher "Gamma" before cypher "Alpha"
    And I reload the page
    Then the cyphers should be in order "Gamma", "Alpha", "Beta"

  Scenario: Reorder cyphers by dragging to last position
    Given the character has 3 cyphers named "Alpha", "Beta", "Gamma"
    When I drag cypher "Alpha" after cypher "Gamma"
    Then the cyphers should be in order "Beta", "Gamma", "Alpha"

  Scenario: Drag cypher to middle position
    Given the character has 3 cyphers named "First", "Second", "Third"
    When I drag cypher "Third" before cypher "Second"
    Then the cyphers should be in order "First", "Third", "Second"

  # ============================================================================
  # VISUAL FEEDBACK - Live reorder preview during drag
  # ============================================================================

  Scenario: Items reorder in real-time while dragging
    Given the character has 3 cyphers named "Alpha", "Beta", "Gamma"
    When I start dragging cypher "Gamma"
    And I hover over cypher "Alpha"
    Then the cyphers should be visually in order "Gamma", "Alpha", "Beta"

  Scenario: Dragging card shows transparent ghost effect
    Given the character has 2 cyphers named "Card1", "Card2"
    When I start dragging cypher "Card1"
    Then the cypher "Card1" should have a dragging visual state

  # ============================================================================
  # CANCEL DRAG
  # ============================================================================

  # Scenario: Cancel drag by pressing Escape
  #   Given the character has 3 cyphers named "Alpha", "Beta", "Gamma"
  #   When I start dragging cypher "Alpha"
  #   And I press the Escape key
  #   Then the cyphers should be in order "Alpha", "Beta", "Gamma"

  # ============================================================================
  # ABILITY REORDERING
  # ============================================================================

  Scenario: Abilities display in array order
    Given the character has 3 abilities named "Bash", "Charge", "Defend"
    Then the abilities should be in order "Bash", "Charge", "Defend"

  Scenario: Reorder abilities by dragging on desktop
    Given the character has 3 abilities named "First", "Second", "Third"
    When I drag ability "Third" before ability "First"
    Then the abilities should be in order "Third", "First", "Second"

  Scenario: Ability order persists after page reload
    Given the character has 3 abilities named "Alpha", "Beta", "Gamma"
    When I drag ability "Gamma" before ability "Alpha"
    And I reload the page
    Then the abilities should be in order "Gamma", "Alpha", "Beta"

  # ============================================================================
  # CROSS-SECTION DRAG PREVENTION
  # ============================================================================

  Scenario: Cannot drag cypher into abilities section
    Given the character has 2 cyphers named "Cypher1", "Cypher2"
    And the character has 2 abilities named "Ability1", "Ability2"
    When I drag cypher "Cypher1" into the abilities section
    Then the cyphers should be in order "Cypher1", "Cypher2"
    And the abilities should be in order "Ability1", "Ability2"
