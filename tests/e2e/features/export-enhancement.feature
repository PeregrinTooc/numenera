Feature: Enhanced File Export
    As a user
    I want improved export functionality
    So that I can easily save my character to files

    Background:
        Given I am on the character sheet page

    Scenario: Export button is always visible
        When I view the export buttons
        Then I should see an "Export" button
        And I should see an "Import" button

    Scenario: Export asks where to save when the browser can
        Given my browser supports File System Access API
        When I export my character
        Then I should be asked where to save a file named like "kael-the-wanderer"
        And the saved file should be a well-formed character file

    Scenario: Export downloads the file when the browser cannot ask where to save
        Given my browser does not support File System Access API
        When I export my character
        Then a file named like "kael-the-wanderer" should be downloaded
        And the saved file should be a well-formed character file

    Scenario: Export button changes to Save As after first export
        Given my browser supports File System Access API
        When I export my character
        Then I should see a "Quick Export" button
        And I should see a "Save As" button
        And I should not see an "Export" button

    Scenario: Quick Export button saves without prompting
        Given my browser supports File System Access API
        When I export my character
        And I click the Quick Export button
        Then the file should be saved without prompting

    Scenario: Save As button prompts for new location
        Given my browser supports File System Access API
        When I export my character
        And I click the Save As button
        Then the export dialog should be triggered

    Scenario: Handle user cancellation during export
        Given my browser supports File System Access API
        And I cancel the file save dialog
        When I export my character
        Then no file should be saved
        And the Export button should still be visible
