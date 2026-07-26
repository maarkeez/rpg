Feature: Search a unit

  Scenario: Search an existing unit
    Given an existing unit
    And the unit id is "test-id"
    When searching the unit by id "test-id"
    Then the unit will be found

  Scenario: Search a non existing unit
    Given an existing unit
    And the unit id is "test-id"
    When searching the unit by id "another-id"
    Then the unit will not be found
