Feature: Request effect creation

  Scenario: Request new effect creation
    Given a new effect
    When the effect creation is requested
    Then the effect will be created

  Scenario: Request existing effect creation
    Given an existing effect
    When the effect creation is requested
    Then the effect will not be created

  Scenario: Request effect creation with empty id
    Given a new effect
    And the effect id is empty
    When the effect creation is requested
    Then the effect creation will fail

  Scenario: Request effect creation with heal type
    Given a new effect
    And the effect type is heal
    When the effect creation is requested
    Then the effect creation will be created

  Scenario: Request effect creation with fire type
    Given a new effect
    And the effect type is fire
    When the effect creation is requested
    Then the effect creation will be created

  Scenario: Request effect creation with invalid type
    Given a new effect
    And the effect type is invalid
    When the effect creation is requested
    Then the effect creation will fail

  Scenario: Request effect creation with negative duration
    Given a new effect
    And the effect duration is negative
    When the effect creation is requested
    Then the effect creation will fail

  Scenario: Request effect creation with duration above the limit
    Given a new effect
    And the effect duration is greater than 99
    When the effect creation is requested
    Then the effect creation will fail

  Scenario: Request effect creation with power below the limit
    Given a new effect
    And the effect power is less than 0
    When the effect creation is requested
    Then the effect creation will fail

  Scenario: Request effect creation with power above the limit
    Given a new effect
    And the effect power is greater than 999
    When the effect creation is requested
    Then the effect creation will fail

  Scenario: Request effect creation with probability below 0
    Given a new effect
    And the effect probability is less than 0
    When the effect creation is requested
    Then the effect creation will fail

  Scenario: Request effect creation with probability above 100
    Given a new effect
    And the effect probability is greater than 100
    When the effect creation is requested
    Then the effect creation will fail
