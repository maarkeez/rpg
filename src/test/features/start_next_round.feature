Feature: start next round

  Scenario: start next round on round finished
    Given a previous round
    When starting the next round
    Then the player turn started for the first player in the turn queue
