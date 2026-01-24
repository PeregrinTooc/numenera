Feature: Stat Pool Value Editing
    As a Numenera player
    I want to edit stat pool values (Pool, Edge, Current) for Might, Speed, and Intellect
    So that I can track my character's stats during gameplay

    Background:
        Given I am on the character sheet page
        And the character data is loaded

    # ============================================================================
    # CORE EDITING SCENARIOS - Using Scenario Outlines
    # ============================================================================

    Scenario Outline: Display stat value
        Then I should see the "<stat> <field>" value displayed

        Examples:
            | stat      | field   |
            | Might     | Pool    |
            | Might     | Edge    |
            | Might     | Current |
            | Speed     | Pool    |
            | Speed     | Edge    |
            | Speed     | Current |
            | Intellect | Pool    |
            | Intellect | Edge    |
            | Intellect | Current |

    Scenario Outline: Open modal by clicking stat value
        When I click on the "<stat> <field>" value
        Then an edit modal should appear
        And the input field should contain the current "<stat> <field>" value
        And the input field should be focused

        Examples:
            | stat      | field   |
            | Might     | Pool    |
            | Might     | Edge    |
            | Might     | Current |
            | Speed     | Pool    |
            | Speed     | Edge    |
            | Speed     | Current |
            | Intellect | Pool    |
            | Intellect | Edge    |
            | Intellect | Current |

    Scenario Outline: Edit and save stat value
        When I click on the "<stat> <field>" value
        And I clear the input field
        And I type "<new_value>" into the input field
        And I click the Confirm button
        Then the modal should close
        And the "<stat> <field>" value should display "<new_value>"

        Examples:
            | stat      | field   | new_value |
            | Might     | Pool    | 25        |
            | Might     | Edge    | 3         |
            | Might     | Current | 12        |
            | Speed     | Pool    | 18        |
            | Speed     | Edge    | 2         |
            | Speed     | Current | 15        |
            | Intellect | Pool    | 16        |
            | Intellect | Edge    | 3         |
            | Intellect | Current | 14        |

    Scenario Outline: Stat value persists after page reload
        When I click on the "<stat> <field>" value
        And I clear the input field
        And I type "<persist_value>" into the input field
        And I click the Confirm button
        And I reload the page
        Then the "<stat> <field>" value should display "<persist_value>"

        Examples:
            | stat      | field   | persist_value |
            | Might     | Pool    | 30            |
            | Might     | Edge    | 5             |
            | Might     | Current | 8             |
            | Speed     | Pool    | 20            |
            | Speed     | Edge    | 4             |
            | Speed     | Current | 10            |
            | Intellect | Pool    | 22            |
            | Intellect | Edge    | 6             |
            | Intellect | Current | 9             |

    Scenario Outline: Cancel stat edit
        When I click on the "<stat> <field>" value
        And I clear the input field
        And I type "99" into the input field
        And I click the Cancel button
        Then the modal should close
        And the "<stat> <field>" value should not have changed

        Examples:
            | stat      | field   |
            | Might     | Pool    |
            | Might     | Edge    |
            | Might     | Current |
            | Speed     | Pool    |
            | Speed     | Edge    |
            | Speed     | Current |
            | Intellect | Pool    |
            | Intellect | Edge    |
            | Intellect | Current |

    # ============================================================================
    # KEYBOARD INTERACTION SCENARIOS
    # ============================================================================

    Scenario Outline: Close modal with Escape key
        When I click on the "<stat> <field>" value
        And I clear the input field
        And I type "99" into the input field
        And I press the Escape key
        Then the modal should close
        And the "<stat> <field>" value should not have changed

        Examples:
            | stat      | field   |
            | Might     | Pool    |
            | Speed     | Edge    |
            | Intellect | Current |

    Scenario Outline: Confirm edit with Enter key
        When I click on the "<stat> <field>" value
        And I clear the input field
        And I type "<enter_value>" into the input field
        And I press the Enter key
        Then the modal should close
        And the "<stat> <field>" value should display "<enter_value>"

        Examples:
            | stat      | field | enter_value |
            | Might     | Pool  | 22          |
            | Speed     | Edge  | 3           |
            | Intellect | Pool  | 18          |

    # ============================================================================
    # VALIDATION SCENARIOS
    # ============================================================================

    Scenario Outline: Validate stat accepts zero
        When I click on the "<stat> Pool" value
        And I clear the input field
        And I type "0" into the input field
        And I click the Confirm button
        Then the modal should close
        And the "<stat> Pool" value should display "0"

        Examples:
            | stat      |
            | Might     |
            | Speed     |
            | Intellect |

    Scenario Outline: Validate stat accepts maximum value
        When I click on the "<stat> Pool" value
        And I clear the input field
        And I type "9999" into the input field
        And I click the Confirm button
        Then the modal should close
        And the "<stat> Pool" value should display "9999"

        Examples:
            | stat      |
            | Might     |
            | Speed     |
            | Intellect |

    # ============================================================================
    # MOBILE INTERACTION SCENARIOS
    # ============================================================================

    Scenario Outline: Mobile - Tap to edit stat
        When I tap on the "<stat> <field>" value
        Then an edit modal should appear

        Examples:
            | stat      | field   |
            | Might     | Pool    |
            | Might     | Edge    |
            | Might     | Current |
            | Speed     | Pool    |
            | Speed     | Edge    |
            | Speed     | Current |
            | Intellect | Pool    |
            | Intellect | Edge    |
            | Intellect | Current |