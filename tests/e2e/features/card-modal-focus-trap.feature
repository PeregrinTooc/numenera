Feature: Card Modal Focus Trap
    As a user editing cards
    I want keyboard focus to stay trapped within card edit modals
    So that I can navigate efficiently with Tab/Shift+Tab without focus escaping

    Background:
        Given I am on the character sheet page

    Scenario: Ability card modal auto-focuses first input field
        When I click the add ability button
        Then the card edit modal should be open
        And the first input field in the modal should be automatically focused

    Scenario: Tab key traps focus within ability card modal - forward navigation
        When I click the add ability button
        Then the card edit modal should be open
        When I press the Tab key
        Then focus should move to the next focusable element in the modal
        When I press the Tab key repeatedly
        Then focus should eventually wrap back to the first input field
        And focus should never escape to the page body or address bar

    Scenario: Shift+Tab key traps focus within ability card modal - backward navigation
        When I click the add ability button
        Then the card edit modal should be open
        When I press Shift+Tab
        Then focus should move to the last focusable element in the modal
        When I press Shift+Tab repeatedly
        Then focus should eventually wrap back to the last focusable element
        And focus should never escape to the page body or address bar

    Scenario: Focus cannot escape ability card modal after many Tab presses
        When I click the add ability button
        Then the card edit modal should be open
        When I press the Tab key 20 times
        Then focus should still be within the card modal
        And the active element should not be the document body
        And the active element should not be the browser chrome

    Scenario: Escape key closes ability card modal
        When I click the add ability button
        Then the card edit modal should be open
        When I press the Escape key
        Then the card edit modal should be closed

    Scenario: Cypher card modal has working focus trap
        When I click the add cypher button
        Then the card edit modal should be open
        When I press the Tab key 15 times
        Then focus should still be within the card modal
        And focus should never escape to the page body or address bar

    Scenario: Equipment card modal has working focus trap
        When I click the add equipment button
        Then the card edit modal should be open
        When I press the Tab key 15 times
        Then focus should still be within the card modal
        And focus should never escape to the page body or address bar