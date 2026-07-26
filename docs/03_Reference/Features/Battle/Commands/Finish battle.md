Feature: finish battle

  Scenario: player victory
    Given a defeated player
    And the battle turn queue contains a single player 
    When finish the battle
    Then the remaining player in the turn queue won the battle
