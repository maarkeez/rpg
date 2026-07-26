Feature: remove battle unit from battlefield

  Scenario: a defeated battle unit
    Given a battle unit
    And the battle unit was defeated
    When removing the battle unit from the battlefield
    Then the tile in the former position will be vacant
