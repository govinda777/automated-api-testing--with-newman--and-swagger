const { BeforeAll, AfterAll, Before, After } = require('@cucumber/cucumber');

BeforeAll(function () {
  // Runs before all scenarios
  console.log("Starting BDD tests...");
  // Note: If using a real HTTP client, this could be a place to start a test server
  // or ensure external services are available.
});

AfterAll(function () {
  // Runs after all scenarios
  console.log("BDD tests completed.");
  // Note: Clean up resources, stop test servers, etc.
});

Before(function (scenario) {
  // Runs before each scenario
  // scenario.pickle.name contains the name of the scenario
  // scenario.pickle.tags contains tags associated with the scenario
  console.log(`\nStarting scenario: ${scenario.pickle.name}`);
});

After(function (scenario) {
  // Runs after each scenario
  // scenario.result.status contains the status (PASSED, FAILED, etc.)
  console.log(`Finished scenario: ${scenario.pickle.name} - Status: ${scenario.result.status}`);
  if (scenario.result.status === 'FAILED') {
    console.error('Error in scenario:', scenario.result.message);
  }
  console.log('--------------------------------------------------');
});
