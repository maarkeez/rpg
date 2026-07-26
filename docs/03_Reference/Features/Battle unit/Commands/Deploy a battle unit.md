Feature: deploy a battle unit

  Scenario: Deploy a battle unit
    Given a battle unit id
    And a unit id
    And a player id
    And a battlefield position
    And the unit exists
    And the player exists
    And the battlefield position can be occupied
    When deploying the battle unit
    Then the remaining health points will be the maximum unit health points
    And the remaining mana points will be the maximum mana points
    And the remaining actions will contain move
    And the move action remaining steps will be the unit movement range
    And the remaining actions will contain cast ability
    And the abilities will contain all the unit abilities
    And the abilities cool down turns left will be 0

  Scenario: Deploy an existing battle unit
    Given an existing battle unit
    When deploying the battle unit
    Then the battle unit will not be deployed

  Scenario: Deploy a battle unit with an empty battle unit id
    Given a battle unit id
    And the battle unit id is empty
    When deploying the battle unit
    Then the battle unit deployment will fail

  Scenario: Deploy a battle unit with an empty unit id
    Given a battle unit id
    And a unit id
    And the unit id is empty
    When deploying the battle unit
    Then the battle unit deployment will fail

  Scenario: Deploy a battle unit with an empty player id
    Given a battle unit id
    And a unit id
    And a player id
    And the player id is empty
    When deploying the battle unit
    Then the battle unit deployment will fail

  Scenario: Deploy a battle unit with a non existing unit
    Given a battle unit id
    And a unit id
    And a player id
    And the unit does not exist
    When deploying the battle unit
    Then the battle unit deployment will fail

  Scenario: Deploy a battle unit with a non existing player
     Given a battle unit id
     And a unit id
     And a player id
     And the player does not exist
     When deploying the battle unit
     Then the battle unit deployment will fail

Scenario: Deploy a battle unit in an occupied position
    Given a battle unit id
    And a unit id
    And a player id
    And a battlefield position
    And the battlefield position can not be occupied
    When deploying the battle unit
    Then the battle unit deployment will fail