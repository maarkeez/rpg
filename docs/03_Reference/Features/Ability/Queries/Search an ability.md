Feature: Search an ability

  Scenario: Search an existing ability
    Given an existing ability
    And the ability id is "test-id"
    When searching the ability by id "test-id"
    Then the ability will be found

  Scenario: Search a non existing ability
    Given an existing ability
    And the ability id is "test-id"
    When searching the ability by id "another-id"
    Then the ability will not be found