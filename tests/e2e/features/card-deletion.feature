Feature: Discarding items
    As a player
    I want to discard items, abilities and attacks my character no longer has
    So that my character sheet shows only what my character really has

    Scenario Outline: A discarded <kind> entry is gone for good
        Given my character has the <kind> "<first>" and "<second>"
        When I discard "<first>"
        Then my character's <kind> are only "<second>"
        And "<first>" is still gone the next time I open my character

        Examples:
            | kind              | first                                    | second                                          |
            | cyphers           | Detonation (Cell)                        | Stim (Injector)                                 |
            | equipment         | Medium armor                             | Broadsword                                      |
            | artifacts         | Lightning Rod                            | Healing Crystal                                 |
            | oddities          | A glowing cube that hums when near water | A piece of transparent metal that's always cold |
            | attacks           | Broadsword                               | Crossbow                                        |
            | abilities         | Bash                                     | Fleet of Foot                                   |
            | special abilities | Practiced in Armor                       | Fire Affinity                                   |

    Scenario: Discarding takes effect without asking for confirmation
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        When I discard "Detonation (Cell)"
        Then it was discarded without my being asked to confirm

    Scenario: The discard control sits in the top-left corner of each entry
        Given my character has the cyphers "Detonation (Cell)" and "Stim (Injector)"
        Then the discard control of "Detonation (Cell)" is in the top-left corner of its entry
