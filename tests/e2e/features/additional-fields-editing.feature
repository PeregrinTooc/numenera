Feature: Additional Character Fields Editing
    As a user
    I want to edit the character type, background, and notes fields
    So that I can manage all character information effectively

    Background:
        Given I am on the character sheet page
        And the character has the following data:
            | field      | value                    |
            | name       | Testchar                 |
            | type       | Nano                     |
            | background | A mysterious wanderer... |
            | notes      | Quest: Find the artifact |

    # ============================================================================
    # TYPE DROPDOWN SCENARIOS
    # ============================================================================

    Scenario: Type field displays as dropdown with current value selected
        Then the type dropdown should show "Nano" as selected
        And the type dropdown should have 3 options
        And the type dropdown options should be "Nano", "Glaive", "Jack"

    Scenario: User can change character type via dropdown
        When I select "Glaive" from the type dropdown
        Then the type dropdown should show "Glaive" as selected
        And the character data should have type "Glaive"

    Scenario: Type change persists after page reload
        When I select "Jack" from the type dropdown
        And I reload the page
        Then the type dropdown should show "Jack" as selected

    @wip
    Scenario: Type dropdown is keyboard navigable
        When I focus the type dropdown
        And I press the "ArrowDown" key
        And I press the "Enter" key
        Then the type should change to the next option

    @wip
    Scenario: Type dropdown works on mobile devices
        Given I am using a mobile device
        When I tap the type dropdown
        Then the mobile OS picker should open
        When I select "Glaive" from the mobile picker
        Then the type dropdown should show "Glaive" as selected

    Scenario: Type dropdown respects i18n (German)
        Given the language is set to "de"
        Then the type dropdown label should be "Typ"
        And the type dropdown option for "Nano" should display as "Nano"
        And the type dropdown option for "Glaive" should display as "Glaive"
        And the type dropdown option for "Jack" should display as "Jack"

    # ============================================================================
    # BACKGROUND INLINE EDITING SCENARIOS
    # ============================================================================

    Scenario: Background field displays in readonly state initially
        Then the background textarea should be readonly
        And the background textarea should show "A mysterious wanderer..."
        And the background textarea should have a pointer cursor

    Scenario: Clicking background field enables editing
        When I click the background textarea
        Then the background textarea should not be readonly
        And the background textarea should be focused
        And the background textarea should have an edit state visual indicator

    Scenario: Editing background and blurring saves changes
        When I click the background textarea
        And I clear the background textarea
        And I type "New background story here" in the background textarea
        And I click outside the background textarea
        Then the background textarea should be readonly
        And the background textarea should show "New background story here"
        And the character data should have background "New background story here"

    Scenario: Background changes persist after page reload
        When I click the background textarea
        And I type "Persistent background" in the background textarea
        And I click outside the background textarea
        And I reload the page
        Then the background textarea should show "Persistent background"

    Scenario: Empty background value is allowed
        When I click the background textarea
        And I clear the background textarea
        And I click outside the background textarea
        Then the background textarea should be readonly
        And the background textarea should be empty
        And the character data should have background ""

    Scenario: Long background text is handled properly
        When I click the background textarea
        And I type a 1000 character string in the background textarea
        And I click outside the background textarea
        Then the background textarea should contain the full 1000 character text
        And the character data should have the full background text

    @wip
    Scenario: Background textarea maintains size during editing
        When I measure the background textarea height
        And I click the background textarea
        Then the background textarea height should remain the same

    @wip
    Scenario: Background field works on mobile devices
        Given I am using a mobile device
        When I tap the background textarea
        Then the background textarea should become editable
        And the virtual keyboard should appear
        When I type "Mobile text" in the background textarea
        And I tap outside the background textarea
        Then the background textarea should show "Mobile text"

    @wip
    Scenario: Background field shows edit hint on hover
        When I hover over the background textarea
        Then the background textarea should show a visual hover state

    Scenario: Background respects i18n (German)
        Given the language is set to "de"
        Then the background field label should be "Hintergrund"
        When I click the background textarea
        And the background textarea is empty
        Then the background placeholder should be "Zum Bearbeiten klicken..."

    # ============================================================================
    # NOTES INLINE EDITING SCENARIOS
    # ============================================================================

    Scenario: Notes field displays in readonly state initially
        Then the notes textarea should be readonly
        And the notes textarea should show "Quest: Find the artifact"
        And the notes textarea should have a pointer cursor

    Scenario: Clicking notes field enables editing
        When I click the notes textarea
        Then the notes textarea should not be readonly
        And the notes textarea should be focused
        And the notes textarea should have an edit state visual indicator

    Scenario: Editing notes and blurring saves changes
        When I click the notes textarea
        And I clear the notes textarea
        And I type "New notes content" in the notes textarea
        And I click outside the notes textarea
        Then the notes textarea should be readonly
        And the notes textarea should show "New notes content"
        And the character data should have notes "New notes content"

    Scenario: Notes changes persist after page reload
        When I click the notes textarea
        And I type "Persistent notes" in the notes textarea
        And I click outside the notes textarea
        And I reload the page
        Then the notes textarea should show "Persistent notes"

    Scenario: Empty notes value is allowed
        When I click the notes textarea
        And I clear the notes textarea
        And I click outside the notes textarea
        Then the notes textarea should be readonly
        And the notes textarea should be empty
        And the character data should have notes ""

    Scenario: Long notes text is handled properly
        When I click the notes textarea
        And I type a 2000 character string in the notes textarea
        And I click outside the notes textarea
        Then the notes textarea should contain the full 2000 character text
        And the character data should have the full notes text

    @wip
    Scenario: Notes textarea maintains size during editing
        When I measure the notes textarea height
        And I click the notes textarea
        Then the notes textarea height should remain the same

    @wip
    Scenario: Notes field works on mobile devices
        Given I am using a mobile device
        When I tap the notes textarea
        Then the notes textarea should become editable
        And the virtual keyboard should appear
        When I type "Mobile notes" in the notes textarea
        And I tap outside the notes textarea
        Then the notes textarea should show "Mobile notes"

    @wip
    Scenario: Notes field shows edit hint on hover
        When I hover over the notes textarea
        Then the notes textarea should show a visual hover state

    Scenario: Notes respects i18n (German)
        Given the language is set to "de"
        Then the notes field label should be "Notizen"
        When I click the notes textarea
        And the notes textarea is empty
        Then the notes placeholder should be "Zum Bearbeiten klicken..."

    # ============================================================================
    # INTERACTION SCENARIOS
    # ============================================================================

    Scenario: Clicking notes while editing background saves background first
        When I click the background textarea
        And I type "Background edit" in the background textarea
        And I click the notes textarea
        Then the background textarea should be readonly
        And the background textarea should show "Background edit"
        And the notes textarea should not be readonly
        And the notes textarea should be focused

    Scenario: Clicking background while editing notes saves notes first
        When I click the notes textarea
        And I type "Notes edit" in the notes textarea
        And I click the background textarea
        Then the notes textarea should be readonly
        And the notes textarea should show "Notes edit"
        And the background textarea should not be readonly
        And the background textarea should be focused

    Scenario: Changing type while editing background does not interfere
        When I click the background textarea
        And I type "Background edit" in the background textarea
        When I select "Glaive" from the type dropdown
        Then the background textarea should still be editable
        And the background textarea should show "Background edit"
        And the type dropdown should show "Glaive" as selected

    Scenario: All fields can be edited in sequence
        When I select "Jack" from the type dropdown
        And I click the background textarea
        And I type "Sequential background" in the background textarea
        And I click outside the background textarea
        And I click the notes textarea
        And I type "Sequential notes" in the notes textarea
        And I click outside the notes textarea
        Then the type dropdown should show "Jack" as selected
        And the background textarea should show "Sequential background"
        And the notes textarea should show "Sequential notes"

    # ============================================================================
    # EDGE CASES
    # ============================================================================

    @wip
    Scenario: Multiple rapid clicks on background don't cause issues
        When I click the background textarea
        And I click the background textarea again
        And I click the background textarea again
        Then the background textarea should be editable
        And there should be no JavaScript errors

    Scenario: Background with special characters is handled correctly
        When I click the background textarea
        And I type "Special: <>&chars" in the background textarea
        And I click outside the background textarea
        Then the background textarea should show "Special: <>&chars"
        And the character data should have background "Special: <>&chars"

    @wip
    Scenario: Notes with newlines are preserved
        When I click the notes textarea
        And I clear the notes textarea
        And I type "Line 1\nLine 2" in the notes textarea
        And I click outside the notes textarea
        Then the notes textarea should contain a newline
        And the character data should preserve the newline
