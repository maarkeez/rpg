Feature: Request player creation

  Scenario: Request new human player creation
    Given a new player
    And the type is "human"
    When the player creation is requested
    Then the player will be created

  Scenario: Request new cpu player creation
    Given a new player
    And the type is "cpu"
    When the player creation is requested
    Then the player will be created

  Scenario: Request existing player creation
    Given an existing player
    When the player creation is requested
    Then the unit player not be created

  Scenario: Request player creation with empty id
    Given a new player
    And the player id is empty
    When the player creation is requested
    Then the player creation will fail

  Scenario: Request player creation with empty name
    Given a new player
    And the player name is empty
    When the player creation is requested
    Then the player creation will fail

  Scenario: Request player creation with a long name
    Given a new player
    And the player name is longer than 50 characters
    When the player creation is requested
    Then the player creation will fail
