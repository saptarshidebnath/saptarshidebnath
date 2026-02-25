Feature: SPA Navigation
  As a user on a <Device>
  I want to use the navigation menu
  So that I can switch between the Home, Resume, and Contact pages

  Rule: The navigation method depends on viewport size

  Scenario Outline: Navigating to the Resume page
    Given I am on the homepage using a "<Device>"
    When I open the navigation menu if needed on "<Device>"
    And I click "Resume" in the navigation
    Then I should see the "Resume" section
    
    Examples:
      | Device  |
      | Desktop |
      | Tablet  |
      | Mobile  |

  Scenario Outline: Navigating to the Contact page
    Given I am on the homepage using a "<Device>"
    When I open the navigation menu if needed on "<Device>"
    And I click "Contact" in the navigation
    Then I should see the "Contact" section
    
    Examples:
      | Device  |
      | Desktop |
      | Tablet  |
      | Mobile  |
