Feature: Search an effect

  Scenario: Search an existing effect
    Given an existing effect
    And the effect id is "test-id"
    When searching the effect by id "test-id"
    Then the effect will be found

  Scenario: Search a non existing effect
    Given an existing effect
    And the effect id is "test-id"
    When searching the effect by id "another-id"
    Then the effect will not be found