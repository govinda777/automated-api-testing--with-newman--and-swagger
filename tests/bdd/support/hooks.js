const { BeforeAll, AfterAll, Before, After } = require('@cucumber/cucumber');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

BeforeAll(function () {
  // Runs before all scenarios
  console.log("Starting BDD tests...");

  const env = process.env.TEST_ENV || 'development';
  const envFilePath = path.resolve(__dirname, `../../../config/environments/${env}.yaml`);

  try {
    console.log(`Attempting to load configuration from: ${envFilePath}`);
    if (!fs.existsSync(envFilePath)) {
      console.error(`Error: Configuration file not found at ${envFilePath}`);
      // If the default 'development.yaml' is also not found, this is a critical issue.
      if (env === 'development') {
        throw new Error(`Critical: Default configuration file not found at ${envFilePath}`);
      }
      // Optionally, try to fallback to a default/example if TEST_ENV is set but its file is missing
      // For now, we'll treat a missing file for a specified TEST_ENV as an error.
      throw new Error(`Configuration file not found for TEST_ENV=${env} at ${envFilePath}`);
    }

    const configFile = fs.readFileSync(envFilePath, 'utf8');
    const config = yaml.load(configFile);

    if (config && config.baseUrl) {
      process.env.BASE_URL = config.baseUrl;
      console.log(`Loaded configuration from ${envFilePath}`);
      console.log(`BASE_URL set to: ${process.env.BASE_URL}`);
    } else {
      console.error(`Error: baseUrl not found in ${envFilePath}. BASE_URL not set.`);
      throw new Error(`baseUrl not found in ${envFilePath}.`);
    }

    if (config && config.apiKey) {
      process.env.API_KEY = config.apiKey;
      console.log(`API_KEY set from ${envFilePath}.`);
    } else if (config && config.apiKey === undefined) {
      // It's okay if apiKey is not defined in the config file
      console.log(`API_KEY not found in ${envFilePath}. It will remain unset.`);
    }


    // Note on 'this.config = config;':
    // BeforeAll hooks run outside the Cucumber World context, so 'this' does not refer to the World.
    // If you need to share the config object with steps, it must be passed differently.
    // For this subtask, setting process.env.BASE_URL and process.env.API_KEY is the primary goal.

  } catch (error) {
    console.error(`Failed to load or process environment configuration:`, error);
    // Critical failure, re-throw to stop test execution if config is essential.
    throw error;
  }
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
