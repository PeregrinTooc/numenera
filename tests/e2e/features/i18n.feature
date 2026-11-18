Feature: Internationalization (i18n)
    As a user
    I want to view the character sheet in different languages
    So that I can use the application in my preferred language

    Scenario: Default language detection
        Given I am on the character sheet page
        Then the page title should be in English
        And the sheet shows these texts:
            | part        | text         |
            | load button | Load Example |
            | new button  | New          |

    Scenario: The sheet is shown in German via URL parameter
        Given I am on the character sheet page with "?lang=de"
        Then the sheet shows these texts:
            | part              | text                    |
            | page title        | Numenera Charakterbogen |
            | load button       | Beispiel laden          |
            | new button        | Neu                     |
            | stats heading     | Attribute               |
            | might stat        | Kraft                   |
            | speed stat        | Geschwindigkeit         |
            | intellect stat    | Intellekt               |
            | pool label        | Pool                    |
            | edge label        | Edge:                   |
            | current label     | Aktuell:                |
            | cyphers heading   | Cypher                  |
            | cypher level      | Stufe                   |
            | artifacts heading | Artefakte               |
            | artifact level    | Stufe                   |
            | oddities heading  | Kuriositäten            |
            | background label  | Hintergrund             |
            | notes label       | Notizen                 |

    Scenario: The empty sheet is shown in German
        Given I am on the character sheet page with "?lang=de"
        And the character sheet is empty
        Then the sheet shows these texts:
            | part                    | text                                                                                                                          |
            | empty cyphers message   | Keine Cypher                                                                                                                  |
            | empty artifacts message | Keine Artefakte                                                                                                               |
            | empty oddities message  | Keine Kuriositäten                                                                                                            |
            | empty equipment message | Keine Ausrüstung                                                                                                              |
            | empty abilities message | Keine Fähigkeiten vorhanden. Fügen Sie hier besondere Fähigkeiten, trainierte Fertigkeiten und andere Charaktereigenschaften hinzu. |
        And my empty background invites me to write with "Zum Bearbeiten klicken..."
        And my empty notes invites me to write with "Zum Bearbeiten klicken..."

    Scenario: Language persists across page reloads
        Given I am on the character sheet page with "?lang=de"
        When I reload the page
        Then the language should remain German

    Scenario: Switch from German to English via URL parameter
        Given I am on the character sheet page with "?lang=de"
        When I navigate to the page with "?lang=en"
        Then the page title should be in English
        And the sheet shows these texts:
            | part        | text         |
            | load button | Load Example |
            | new button  | New          |

    Scenario: The page declares the language it is shown in
        Given I am on the character sheet page with "?lang=de"
        Then the page should declare its language as "de"

    Scenario: The declared page language follows a language switch
        Given I am on the character sheet page with "?lang=en"
        When I switch to German
        Then the page should declare its language as "de"

    Scenario: The age of an old version is given in German
        Given I am on the character sheet page
        And my character has a history of 2 versions
        And 5 minutes pass
        And I switch to German
        When I step back to the previous version
        Then the navigator gives the age of this version as "vor 5 Minuten"
