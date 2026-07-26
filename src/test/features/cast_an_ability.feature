Feature: cast an ability

  Scenario: Cast an ability
    Given a caster battle unit id
    And an ability id
    And a list of targeted battle unit ids
    And all targeted battle units are deployed
    And the ability target pattern allows targeting all the targeted battle units
    And the caster battle unit has enough mana
    And the ability cooldown turns left is 0
    When casting an ability
    Then all the targeted battle units will be affected by each ability effects
    And the caster battle unit mana points are reduced based on the ability cost
    And the caster battle unit ability cooldown turns left is incremented based on the ability cooldown

  Scenario: Battle unit does not exist
    Given a caster battle unit id that is not deployed
    And an ability id
    And a list of targeted battle unit ids
    When casting an ability
    Then casting the ability fails

  Scenario: Battle unit does not know the ability
    Given a caster battle unit id
    And an ability id that the battle unit does not have
    And a list of targeted battle unit ids
    When casting an ability
    Then casting the ability fails

  Scenario: Target battle unit is not deployed
    Given a caster battle unit id
    And an ability id
    And a list of targeted battle unit ids
    And one targeted battle unit is not deployed
    When casting an ability
    Then casting the ability fails

  Scenario: Targets do not match the ability target pattern
    Given a caster battle unit id
    And an ability id
    And a list of targeted battle unit ids
    And all targeted battle units are deployed
    And the ability target pattern does not allow targeting all the targeted battle units
    When casting an ability
    Then casting the ability fails

  Scenario: Battle unit does not have enough mana
    Given a caster battle unit id
    And an ability id
    And the caster battle unit has less mana than the ability cost
    And a valid list of targeted battle unit ids
    When casting an ability
    Then casting the ability fails

  Scenario: Ability is on cooldown
    Given a caster battle unit id
    And an ability id that is on cooldown
    And a valid list of targeted battle unit ids
    When casting an ability
    Then casting the ability fails
