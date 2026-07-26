Feature: Search a player

  Scenario: Search an existing player
    Given an existing player
    And the player id is "test-id"
    When searching the player by id "test-id"
    Then the player will be found

  Scenario: Search a non existing player
    Given an existing player
    And the player id is "test-id"
    When searching the player by id "another-id"
    Then the player will not be found
