Feature: Items Visual Styling
    As a Numenera player
    I want items to have visually distinct and thematic styling
    So that I can easily distinguish between cyphers, artifacts, and oddities

    Background:
        Given I am on the character sheet page

    Scenario: Cyphers have blue-themed styling
        Given the character has the following cyphers:
            | Name              | Level | Effect                          |
            | Detonation (Cell) | 1d6+2 | Explodes in an immediate radius |
        Then the cypher card should have blue-themed styling
        And the cypher card should have a "ONE-USE" warning badge
        And the cypher level badge should have blue background

    Scenario: Artifacts have gold-themed styling
        Given the character has the following artifacts:
            | Name          | Level | Effect                                   |
            | Lightning Rod | 6     | Projects lightning bolt up to long range |
        Then the artifact card should have gold-themed styling
        And the artifact name should use serif font
        And the artifact level badge should have gold background

    Scenario: Oddities have brown-themed styling
        Given the character has the following oddities:
            | Description                              |
            | A glowing cube that hums when near water |
        Then the oddity card should have brown-themed styling
        And the oddity text should be subtle and understated

    Scenario: Empty cyphers section has blue-themed styling
        Given the character has no cyphers
        Then the empty cyphers message should have blue-themed styling
        And the empty cyphers section should match cypher card style

    Scenario: Empty artifacts section has gold-themed styling
        Given the character has no cyphers
        Then the empty artifacts message should have gold-themed styling
        And the empty artifacts section should match artifact card style

    Scenario: Empty oddities section has brown-themed styling
        Given the character has no cyphers
        Then the empty oddities message should have brown-themed styling
        And the empty oddities section should match oddity card style

    Scenario: Cypher cards have hover effects
        Given the character has cyphers
        When I hover over a cypher card
        Then the cypher card should have a dramatic visual effect
        And the cypher card should elevate slightly

    Scenario: Artifact cards have hover effects
        Given the character has artifacts
        When I hover over an artifact card
        Then the artifact card should have a shimmer effect
        And the artifact card should show enhanced depth

    Scenario: Cypher cards use parchment background with blue tint
        Given the character has cyphers
        Then cypher cards should have parchment background
        And cypher cards should have subtle blue tint

    Scenario: Artifact cards use rich parchment background
        Given the character has artifacts
        Then artifact cards should have rich parchment background
        And artifact cards should have decorative elements

    Scenario: Oddity cards use light parchment background
        Given the character has oddities
        Then oddity cards should have light parchment background
        And oddity cards should be visually less prominent than cyphers and artifacts
