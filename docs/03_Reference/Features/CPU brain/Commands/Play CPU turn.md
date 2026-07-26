Feature: play cpu turn

  Scenario: on human player turn started will do nothing 
    Given a player turn started
    And a the player is human
    When playing the cpu turn
    Then will do nothing

Scenario: on cpu player turn started will play cpu turn
    Given a player turn started
    And a the player is cpu
    When playing the cpu turn
    Then each battle unit for the cpu player will be moved towards their closest enemy if the battle unit has remaining steps
    And each battle unit for the cpu player will cast the highest power ability that is not in cooldown if the target is in range
    And the cpu player will finish the turn
