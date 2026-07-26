Feature: begin battle unit turn

  Scenario: refresh cooldowns
    Given a battle unit
    And the player turn has started
    And the battle unit has an ability in cooldown
    When the battle unit turn begins
    Then the ability cooldown turns left will be reduced by one

Scenario: refresh turn actions
    Given a battle unit
    And the player turn has started
    When the battle unit turn begins
    Then the battle unit movement remaining steps will be reset to the unit movement range
    And the cast ability turn action will be available 

Scenario: increase mana
    Given a battle unit
    And the player turn has started
    When the battle unit turn begins
    Then the battle unit  remaining mana points will be increased a 10 percent of the unit maximum mana without exceed the unit maximum