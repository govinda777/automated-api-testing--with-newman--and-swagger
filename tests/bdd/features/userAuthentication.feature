Feature: User Authentication
  As a user
  I want to be able to register and login
  So that I can access protected resources

  Scenario: Successful User Registration
    Given I am a new user with valid registration details
    When I send a POST request to "/api/users/register" with my details
    Then the response status code should be 201
    And the response should contain a user ID and a success message

  Scenario: Successful User Login
    Given I am a registered user with valid credentials
    When I send a POST request to "/api/users/login" with my credentials
    Then the response status code should be 200
    And the response should contain an authentication token
