Feature: defeat player

  Scenario: player defeated
    Given a defeated player unit
    And the player does not have more units alive
    When defeating the player
    Then the player is removed from the battle turn queue
    And the player was defeated
