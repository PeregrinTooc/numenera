Feature: Import Error Messages
    As a German-speaking player
    I want import problems explained in my own language
    So that I understand why a character file could not be loaded

    Scenario: A file without character data is rejected in German
        Given I am on the character sheet page with "?lang=de"
        When I import a file without character data
        Then the alert should read "Charakter konnte nicht importiert werden: Die Datei enthält keine Charakterdaten"

    Scenario: A file without character data is rejected in English
        Given I am on the character sheet page with "?lang=en"
        When I import a file without character data
        Then the alert should read "Failed to import character: File does not contain character data"
