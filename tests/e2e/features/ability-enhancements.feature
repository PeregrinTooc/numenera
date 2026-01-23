Feature: Ability Enhancements
    As a Numenera player
    I want to see ability cost, pool, and action information
    So that I can understand the requirements for using each ability

    Background:
        Given I am on the character sheet page

    Scenario: Display ability with cost and pool
        Given the character has an ability "Power Strike" with:
            | Property | Value |
            | Cost     | 3     |
            | Pool     | might |
        Then I should see the ability "Power Strike"
        And the ability "Power Strike" should show cost "3"
        And the ability "Power Strike" should show pool "Might"

    Scenario: Display ability with action type
        Given the character has an ability "Quick Strike" with:
            | Property | Value    |
            | Action   | 1 action |
        Then I should see the ability "Quick Strike"
        And the ability "Quick Strike" should show action "1 action"

    Scenario: Display ability with all properties
        Given the character has an ability "Bash" with:
            | Property    | Value                            |
            | Cost        | 1                                |
            | Pool        | might                            |
            | Action      | 1 action                         |
            | Description | Use weapon to make bash attack   |
        Then I should see the ability "Bash"
        And the ability "Bash" should show cost "1"
        And the ability "Bash" should show pool "Might"
        And the ability "Bash" should show action "1 action"

    Scenario: Display ability without optional properties
        Given the character has an ability "Trained in Intimidation" with:
            | Property    | Value                            |
            | Description | You are trained in intimidation  |
        Then I should see the ability "Trained in Intimidation"
        And the ability "Trained in Intimidation" should not show cost badge
        And the ability "Trained in Intimidation" should not show pool indicator
        And the ability "Trained in Intimidation" should not show action indicator

    Scenario: Visual styling for different pools
        Given the character has abilities with different pools:
            | Name         | Pool      |
            | Bash         | might     |
            | Fleet of Foot| speed     |
            | Scan         | intellect |
        Then the ability "Bash" should have might pool styling
        And the ability "Fleet of Foot" should have speed pool styling
        And the ability "Scan" should have intellect pool styling

    Scenario: Empty abilities section shows empty state
        Given the character has no abilities
        Then I should see an empty abilities section
        And the empty state should use translation keys