Feature: Choosing the layout when importing a character
    As a player importing a character file
    I want to choose whether to keep my layout or use the file's
    So that an import never rearranges my sheet without asking

    Background:
        Given I am on the character sheet page

    Scenario: Importing a file with a different layout asks which layout to use
        Given I have customized the layout
        And I have a character file with a different layout
        When I import the character file
        Then I should see a layout choice prompt
        And I should see options to "Keep current layout" or "Use imported layout"
        And the "Keep current layout" option should have focus
        And the imported character should be shown

    Scenario: Keeping the current layout
        Given I have customized the layout
        And I have a character file with a different layout
        When I import the character file
        And I choose to "Keep current layout"
        Then I should not see a layout choice prompt
        And the "Cyphers" section should appear before the "Abilities" section
        And the imported character should be shown
        When I refresh the browser
        Then the "Cyphers" section should appear before the "Abilities" section

    Scenario: Using the imported layout
        Given I have customized the layout
        And I have a character file with a different layout
        When I import the character file
        And I choose to "Use imported layout"
        Then I should not see a layout choice prompt
        And the "Items" section should appear before the "Cyphers" section
        And the imported character should be shown
        When I refresh the browser
        Then the "Items" section should appear before the "Cyphers" section

    Scenario: Escape keeps the current layout
        Given I have customized the layout
        And I have a character file with a different layout
        When I import the character file
        And I press the Escape key
        Then I should not see a layout choice prompt
        And the "Cyphers" section should appear before the "Abilities" section

    Scenario: A file with the same layout imports without asking
        Given I have the default layout
        And I have a character file with the default layout
        When I import the character file
        Then the imported character should be shown
        And I should not see a layout choice prompt

    Scenario: A file without a layout imports without asking
        Given I have customized the layout
        And I have a character file without a layout
        When I import the character file
        Then the imported character should be shown
        And I should not see a layout choice prompt
        And the "Cyphers" section should appear before the "Abilities" section

    Scenario: Different column choices alone ask too, and using them applies them
        Given I have the default layout
        And I have a character file with the default layout that sets the "Items" section to 1 column
        When I import the character file
        And I choose to "Use imported layout"
        Then the "Items" section should be set to 1 column

    Scenario: Using a layout from a file without column choices keeps mine
        Given I have customized the layout
        And I have set the "Items" section to 1 column
        And I have a character file with a different layout
        When I import the character file
        And I choose to "Use imported layout"
        Then the "Items" section should appear before the "Cyphers" section
        And the "Items" section should be set to 1 column
