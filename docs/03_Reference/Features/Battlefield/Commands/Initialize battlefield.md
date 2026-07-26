Feature: initialize battlefield

  Scenario: initialize battlefield size
    Given a number of rows
    And a number of columns
    When initializing the battlefield
    Then the battlefield will be initialized with the given rows
    And the battlefield will be initialized with the given columns 

Scenario: initialize battlefield tiles 
    Given a list of tiles
    When initializing the battlefield
    Then the battlefield tiles will be initialized in each position
    And all of them will be vacant
    And the terrain will be initialized with the given tile terrain