Feature: Start first round

  Scenario: start first round
    Given player one
    And player two
    When starting first round
    Then the battle turn queue was set
    And the player one turn started
    And the battle started

  Scenario: player does not exists
    Given a none existing player
    When starting first round
    Then the battle start will fail

  Scenario: number of player exceeded
    Given more than 2 players
    When starting first round
    Then the battle start will fail
