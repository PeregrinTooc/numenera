Feature: Version History Undo and Redo
    As a user editing my character
    I want to undo and redo changes with keyboard shortcuts
    So that I can step back and forward through my edits, including ones not yet saved as a version

    Background:
        Given my character has no history yet

    Scenario: Undo unsquashed changes
        Given my character has a history of 3 versions
        When I change my name to "First Edit"
        And I change my name to "Second Edit"
        And I undo with Ctrl+Z
        Then my character sheet shows my name as "First Edit"
        And the navigator shows version 3 of 3
        When I undo with Ctrl+Z
        Then my character sheet shows my original name
        And the navigator shows version 3 of 3

    Scenario: Redo unsquashed changes
        Given my character has a history of 3 versions
        When I change my name to "First Edit"
        And I change my name to "Second Edit"
        And I undo with Ctrl+Z
        And I undo with Ctrl+Z
        And I redo with Ctrl+Y
        Then my character sheet shows my name as "First Edit"

    Scenario: Redo with Ctrl+Shift+Z
        Given my character has a history of 3 versions
        When I change my name to "First Edit"
        And I change my name to "Second Edit"
        And I undo with Ctrl+Z
        And I undo with Ctrl+Z
        And I redo with Ctrl+Shift+Z
        Then my character sheet shows my name as "First Edit"

    Scenario: Adding a card after prior edits undoes one change at a time
        Given my character has a history of 3 versions
        When I change my name to "Edit 1"
        And I change my name to "Edit 2"
        And I start a new cypher
        And I set its name to "Test Cypher"
        And I set its level to "1d6"
        And I set its effect to "Test effect"
        And I save the card
        And I undo with Ctrl+Z
        Then my character carries 0 cyphers
        And my character sheet shows my name as "Edit 2"
        When I undo with Ctrl+Z
        Then my character sheet shows my name as "Edit 1"
        When I undo with Ctrl+Z
        Then my character sheet shows my original name
        And the navigator shows version 3 of 3

    Scenario: Undo steps back through settled versions
        Given my character has a history of 5 versions
        When I undo with Ctrl+Z
        Then the navigator shows version 4 of 5
        And I see my character as it was in version 4
        And I am warned that I am viewing an old version
        When I undo with Ctrl+Z
        Then the navigator shows version 3 of 5
        And I see my character as it was in version 3

    Scenario: Mixed undo/redo with buffer and versions
        Given my character has a history of 3 versions
        When I change my name to "Rapid Edit 1"
        And I change my name to "Rapid Edit 2"
        And I undo with Ctrl+Z
        And my edits have settled into a version
        And I undo with Ctrl+Z
        Then the navigator shows version 3 of 4
        And I see my character as it was in version 3
        And I am warned that I am viewing an old version
        When I redo with Ctrl+Y
        Then the navigator shows version 4 of 4
        And my character sheet shows my name as "Rapid Edit 1"
        And I am not warned about an old version

    Scenario: Card operations work with buffer undo/redo
        Given my character has 2 abilities
        When I start a new ability
        And I set its name to "Test Ability"
        And I set its cost to "3"
        And I set its pool to "Might"
        And I set its description to "A test ability"
        And I save the card
        Then my character carries 3 abilities
        When I undo with Ctrl+Z
        Then my character carries 2 abilities
        When I redo with Ctrl+Y
        Then my character carries 3 abilities
        And my character carries the ability "Test Ability"
        When I undo with Ctrl+Z
        Then my character carries 2 abilities
        When I redo with Ctrl+Y
        Then my character carries 3 abilities
        And my character carries the ability "Test Ability"

    Scenario: Deleting a card creates a version
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        When I discard "Detonation (Cell)"
        Then my character's cyphers are only "Stim (Injector)"
        When I undo with Ctrl+Z
        Then my character carries 2 cyphers
        When I redo with Ctrl+Y
        Then my character's cyphers are only "Stim (Injector)"
        When my edits have settled into a version
        Then the navigator shows version 2 of 2
        When I step back to the previous version
        Then the navigator shows version 1 of 2
        And I am warned that I am viewing an old version
        And my character carries 2 cyphers
        When I restore this version
        Then my character carries 2 cyphers
        And the navigator shows version 3 of 3
        And I am not warned about an old version

    Scenario: Importing a character creates a version
        When I import a valid character file "test-hero.numenera"
        And my edits have settled into a version
        Then the navigator shows version 2 of 2

    Scenario: Importing is not possible while viewing an old version
        Given my character has a history of 3 versions
        Then I can import a character
        When I step back to the previous version
        Then I cannot import a character
        When I step forward to the next version
        Then I can import a character

    Scenario: Redo changes persist correctly after reload
        Given my character has a history of 3 versions
        When I change my name to "First Edit"
        And I change my name to "Second Edit"
        And I undo with Ctrl+Z
        Then my character sheet shows my name as "First Edit"
        When I redo with Ctrl+Y
        Then my character sheet shows my name as "Second Edit"
        When I reopen my character
        Then my character sheet shows my name as "Second Edit"
        And the navigator shows version 4 of 4

    Scenario: Buffered edit survives a reload before the squash timer expires
        Given my character has a history of 3 versions
        When I change my name to "Unsquashed Hero"
        And I reopen my character
        Then my character sheet shows my name as "Unsquashed Hero"
        And the navigator shows version 4 of 4
        When I change my name to "Later Hero"
        And my edits have settled into a version
        And I step back to the previous version
        Then my character sheet shows my name as "Unsquashed Hero"
        And the navigator describes this version as "Changed name"

    Scenario: Buffer undo/redo maintains state consistency
        Given my character has a history of 3 versions
        When I change my name to "Buffer Edit 1"
        And I change my name to "Buffer Edit 2"
        And I undo with Ctrl+Z
        And I undo with Ctrl+Z
        Then my character sheet shows my original name
        When I redo with Ctrl+Y
        Then my character sheet shows my name as "Buffer Edit 1"
        When I redo with Ctrl+Y
        Then my character sheet shows my name as "Buffer Edit 2"
        When I reopen my character
        Then my character sheet shows my name as "Buffer Edit 2"
