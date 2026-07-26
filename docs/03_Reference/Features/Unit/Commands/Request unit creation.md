Feature: Request unit creation

  Scenario: Request new unit creation
    Given a new unit
    And the unit ability exists
    When the unit creation is requested
    Then the unit will be created

Scenario: Request existing unit creation
    Given an existing unit
    When the unit creation is requested
    Then the unit will not be created

Scenario: Request unit creation with empty id
    Given a new unit
    And the unit id is empty
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with empty name
    Given a new unit
    And the unit name is empty
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with a long name
    Given a new unit
    And the unit name is longer than 50 characters
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with negative maximum health
    Given a new unit
    And the unit maximum health is negative
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with maximum health above the limit
    Given a new unit
    And the unit maximum health is greater than 999
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with negative maximum mana
    Given a new unit
    And the unit maximum mana is negative
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with maximum mana above the limit
    Given a new unit
    And the unit maximum mana is greater than 999
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with empty abilities
    Given a new unit
    And the unit abilities are empty
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with more abilities than allowed
    Given a new unit
    And the unit has more than 6 abilities
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with non existing ability
    Given a new unit
    And the unit ability does not exist
    When the unit creation is requested
    Then the unit creation will fail

Scenario: Request unit creation with negative movement range
    Given a new unit
    And the movement range is negative
    Then the unit creation will fail

Scenario: Request unit creation with movement range above limit
    Given a new unit
    And the movement range is greater than 99
    Then the unit creation will fail