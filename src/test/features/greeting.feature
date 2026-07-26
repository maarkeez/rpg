Feature: Greeting
  As a user of the application
  I want to receive a greeting message
  So that I know the application is working

  Scenario: Default greeting
    Given no name is provided
    When I request a greeting
    Then the greeting should be "Hello, World!"

  Scenario: Personalized greeting
    Given the name "Ada"
    When I request a greeting
    Then the greeting should be "Hello, Ada!"
