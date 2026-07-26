Feature: Initialize battle

  As a player
  I want a new battle to be initialized
  So that the game is ready to start

  Background:
    Given the default battle setup
      | Battlefield rows    | 8      |
      | Battlefield columns | 8      |
      | Default terrain     | Grass  |
      | Human units         | 1 Knight, 3 Goblins |
      | CPU units           | 1 Knight, 3 Goblins |

  Scenario: Initialize a new battle
    Given a new battle
    When the battle is initialized
    Then the battlefield should contain 8 rows and 8 columns
    And every tile should have Grass terrain
    And the Human player should have 4 battle units
    And the CPU player should have 4 battle units
    And the Human battle units should be deployed in the bottom-right corner
    And the CPU battle units should be deployed in the top-left corner
    And no two battle units should occupy the same tile
    And the first battle turn should be for the Human player 