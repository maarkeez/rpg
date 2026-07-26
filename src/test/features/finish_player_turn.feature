Feature: finish player turn

  Scenario: start next player turn
    Given a player
    And there are more players in the turn queue
    When finishing player turn
    Then the turn for the next player in the queue will be started

  Scenario: start next round
    Given a player
    And is the last player on the turn queue
    When finishing player turn
    Then the round finished

  Scenario: on player defeated start next player turn
    Given a player
    And there are more players in the turn queue
    When the current player is defeated
    Then the turn for the next player in the queue will be started

  Scenario: on player defeated start next round
    Given a player
    And is the last player on the turn queue
    When the current player is defeated
    Then the round finished
