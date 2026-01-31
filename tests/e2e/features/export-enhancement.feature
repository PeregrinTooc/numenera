Feature: Enhanced File Export
    As a user
    I want improved export functionality
    So that I can easily save my character to files

    Background:
        Given I am on the character sheet page

    # ========================================
    # Basic Export Button Visibility
    # ========================================

    Scenario: Export button is always visible
        When I view the export buttons
        Then I should see an "Export" button
        And I should see an "Import" button

    Scenario: Export button triggers save with correct filename
        Given my browser supports File System Access API
        When I click the Export button
        Then the export dialog should be triggered with filename containing "kael-the-wanderer"
        And the exported data should have correct structure

    Scenario: Export in non-Chromium browser downloads file
        Given my browser does not support File System Access API
        When I click the Export button
        Then a file download should be triggered
        And the download filename should contain "kael-the-wanderer"
        And the download should have correct file structure

    # ========================================
    # Export Data Validation
    # ========================================

    Scenario: Exported file contains complete character data
        Given my browser supports File System Access API
        When I click the export button
        Then the exported file should have version "1.0"
        And the exported file should have schemaVersion 4
        And the exported file should have an exportDate
        And the exported file should contain all character properties

    Scenario: Exported filename handles special characters
        Given the character name is "Test @#$ Character!"
        And my browser supports File System Access API
        When I click the Export button
        Then the suggested filename should be "test-character.numenera"

    # ========================================
    # Button State Changes After First Export
    # ========================================

    Scenario: Export button changes to Save As after first export
        Given my browser supports File System Access API
        When I click the Export button
        Then I should see a "Quick Export" button
        And I should see a "Save As" button
        And I should not see an "Export" button

    Scenario: Quick Export button saves without prompting
        Given my browser supports File System Access API
        When I click the Export button
        And I click the Quick Export button
        Then the file should be saved without prompting

    Scenario: Save As button prompts for new location
        Given my browser supports File System Access API
        When I click the Export button
        And I click the Save As button
        Then the export dialog should be triggered

    # ========================================
    # Error Handling
    # ========================================

    Scenario: Handle user cancellation during export
        Given my browser supports File System Access API
        And I cancel the file save dialog
        When I click the Export button
        Then no file should be saved
        And the Export button should still be visible
