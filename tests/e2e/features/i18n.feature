Feature: Internationalization (i18n)
    As a user
    I want to view the character sheet in different languages
    So that I can use the application in my preferred language

    Scenario: Default language detection
        Given I am on the character sheet page
        Then the page title should be in English
        And the load button should display "Load"
        And the new button should display "New"

    Scenario: Switch to German language via URL parameter
        Given I am on the character sheet page with "?lang=de"
        Then the page title should be "Numenera Charakterbogen"
        And the load button should display "Laden"
        And the new button should display "Neu"

    # Note: Basic info now uses sentence format without individual labels
    # Character data (name, tier, type, descriptor, focus) is displayed inline

    Scenario: German translations for stats section
        Given I am on the character sheet page with "?lang=de"
        Then the stats heading should be "Attribute"
        And the might stat should display "Kraft"
        And the speed stat should display "Geschwindigkeit"
        And the intellect stat should display "Intellekt"
        And the stat pool label should be "Pool"
        And the stat edge label should be "Edge"
        And the stat current label should be "Aktuell"

    Scenario: German translations for cyphers section
        Given I am on the character sheet page with "?lang=de"
        Then the cyphers heading should be "Cypher"
        And cypher level labels should display "Stufe"

    Scenario: German translations for artifacts section
        Given I am on the character sheet page with "?lang=de"
        Then the artifacts heading should be "Artefakte"
        And artifact level labels should display "Stufe"

    Scenario: German translations for oddities section
        Given I am on the character sheet page with "?lang=de"
        Then the oddities heading should be "Kuriositäten"

    Scenario: German translations for text fields section
        Given I am on the character sheet page with "?lang=de"
        Then the background field label should be "Hintergrund"
        And the notes field label should be "Notizen"

    Scenario: German translations for empty states
        Given I am on the character sheet page with "?lang=de"
        When I click the new button
        Then the empty cyphers message should be "Keine Cypher"
        And the empty artifacts message should be "Keine Artefakte"
        And the empty oddities message should be "Keine Kuriositäten"
        And the empty background message should be "Kein Hintergrund"
        And the empty notes message should be "Keine Notizen"
        And the empty equipment message should be "Keine Ausrüstung"
        And the empty abilities message should be "Keine Fähigkeiten vorhanden. Fügen Sie hier besondere Fähigkeiten, trainierte Fertigkeiten und andere Charaktereigenschaften hinzu."

    Scenario: Language persists across page reloads
        Given I am on the character sheet page with "?lang=de"
        When I reload the page
        Then the page title should be "Numenera Charakterbogen"
        And the language should remain German

    Scenario: Switch from German to English via URL parameter
        Given I am on the character sheet page with "?lang=de"
        When I navigate to the page with "?lang=en"
        Then the page title should be in English
        And the load button should display "Load"
        And the new button should display "New"
