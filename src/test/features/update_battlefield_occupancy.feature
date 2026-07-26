Feature: update battlefield occupancy

  Scenario: a deployed battle unit
    Given an initialized battlefield
    And a battle unit was deployed
    When updating the battlefield occupancy
    Then the tile in the deployed position will be occupied

  Scenario: a moved battle unit
    Given a battle unit
    And a the battle unit is occupying a tile
    And the battle unit was moved
    When updating the battlefield occupancy
    Then the tile in the former position will be vacant
    And the tile in the new position will be occupied
