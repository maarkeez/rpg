Feature: move battle unit

  Scenario: move battle unit
    Given a battle unit
    And the battle unit has movements left
    And the destination position can be occupied 
    When moving the battle unit
    Then battle unit will be moved

Scenario: move battle unit
    Given a battle unit
    And the battle unit exhausted their movements
    When moving the battle unit
    Then battle unit will movement will fail

Scenario: move battle unit
    Given a battle unit
    And the destination position can not be occupied 
    When moving the battle unit
    Then battle unit will movement will fail

