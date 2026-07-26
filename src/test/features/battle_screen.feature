Feature: Battle screen

  As a player
  I want to see the battlefield and control my battle units
  So that I can fight through a round of battle

  Scenario: The battle screen shows the deployed battle units
    Given the battle screen is displayed
    Then the header shows "Player one turn - Round 1"
    And the ally battle unit is visible on the battlefield
    And the enemy battle unit is visible on the battlefield

  Scenario: Selecting a battle unit shows its movement range and abilities
    Given the battle screen is displayed
    When I select the ally battle unit
    Then its movement range tiles are highlighted
    And its ability icons are shown

  Scenario: Selecting an ability shows its target range and details
    Given the battle screen is displayed
    And I select the ally battle unit
    When I select the "Fire bolt" ability
    Then the ability details panel shows "Fire bolt"
    And the enemy tile is highlighted as a valid target

  Scenario: Casting an ability on a valid target damages it
    Given the battle screen is displayed
    And I select the ally battle unit
    And I select the "Fire bolt" ability
    When I target the enemy battle unit
    Then the enemy battle unit health is reduced

  Scenario: Moving a battle unit to a valid tile
    Given the battle screen is displayed
    And I select the ally battle unit
    When I move the battle unit to an empty highlighted tile
    Then the ally battle unit is displayed on the new tile

  Scenario: Finishing a turn asks for confirmation before advancing
    Given the battle screen is displayed
    When I click "Finish my turn"
    Then I see "I am not done yet"
    And I see "Confirm I finished"

  Scenario: Confirming the finished turn advances to the next player
    Given the battle screen is displayed
    And I click "Finish my turn"
    When I click "Confirm I finished"
    Then the header shows "Player two turn - Round 1"
