Feature: Empty Fields Visibility
    As a Numenera player
    I want to see and click on empty descriptor and focus fields
    So that I can easily edit them on new characters

    Background:
        Given I am on the character sheet page
        And the character data is loaded

    Scenario: Empty descriptor field shows placeholder and is clickable after clicking New
        When I click the New button
        Then the descriptor field should display placeholder text
        And the descriptor field should be visible
        And the descriptor field should be clickable

    Scenario: Empty focus field shows placeholder and is clickable after clicking New
        When I click the New button
        Then the focus field should display placeholder text
        And the focus field should be visible
        And the focus field should be clickable

    Scenario: Edit empty descriptor field
        When I click the New button
        And I click on the descriptor field
        Then an edit modal should appear
        When I enter "Strong" in the edit field
        And I confirm the edit
        Then the descriptor field should display "Strong"
        And the descriptor field should not show placeholder text

    Scenario: Edit empty focus field
        When I click the New button
        And I click on the focus field
        Then an edit modal should appear
        When I enter "Bears a Halo of Fire" in the edit field
        And I confirm the edit
        Then the focus field should display "Bears a Halo of Fire"
        And the focus field should not show placeholder text

    Scenario: Non-empty descriptor and focus fields work normally
        Then the descriptor field should display "Strong"
        And the focus field should display "Bears a Halo of Fire"
        When I click on the descriptor field
        Then an edit modal should appear with value "Strong"
