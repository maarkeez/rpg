Feature: receive ability effects

  Scenario: receive heal ability effect
    Given an ability casted by a battle unit
    And the casted ability heals
    When a target battle unit receives the ability effects
    Then the target battle unit health will be increased based on the ability effect power

  Scenario: receive deal damage ability effect
    Given an ability casted by a battle unit
    And the casted ability deals damage
    When a target battle unit receives the ability effects
    Then the target battle unit health will be decreased based on the ability effect power
    And the target battle unit will be defeated if the health reached zero
