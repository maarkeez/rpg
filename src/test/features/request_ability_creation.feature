Feature: Request ability creation

  Scenario: Request new ability creation
    Given a new ability
    And the ability effects exist
    When the ability creation is requested
    Then the ability will be created

  Scenario: Request existing ability creation
    Given an existing ability
    When the ability creation is requested
    Then the ability will not be created

  Scenario: Request ability creation with empty id
    Given a new ability
    And the ability id is empty
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with empty name
    Given a new ability
    And the ability name is empty
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with a long name
    Given a new ability
    And the ability name is longer than 50 characters
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with negative cost
    Given a new ability
    And the ability cost is negative
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with cost above the limit
    Given a new ability
    And the ability cost is greater than 999
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with negative cooldown
    Given a new ability
    And the ability cooldown is negative
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with cooldown above the limit
    Given a new ability
    And the ability cooldown is greater than 99
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with empty effects
    Given a new ability
    And the ability effects are empty
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with more effects than allowed
    Given a new ability
    And the ability has more than 3 effects
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with non existing effect
    Given a new ability
    And the ability effect does not exist
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with invalid target pattern
    Given a new ability
    And the target pattern is invalid
    When the ability creation is requested
    Then the ability creation will fail

  Scenario: Request ability creation with self target pattern
    Given a new ability
    And the target pattern is self
    When the ability creation is requested
    Then the ability will be created

  Scenario: Request ability creation with adjacent enemy target pattern
    Given a new ability
    And the target pattern is adjacent enemy
    When the ability creation is requested
    Then the ability will be created
