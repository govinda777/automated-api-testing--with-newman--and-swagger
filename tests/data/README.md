# Test Data

This directory stores static data used for running automated tests.

## Format

Test data files should be in **JSON** format.

## Naming Convention

- For general test suites: `[testSuiteName].data.json` (e.g., `userAuth.data.json`)
- For specific endpoints: `[endpointName].data.json` (e.g., `createUser.data.json`)

## Structure

Organize data within each file logically, for example, by use case or by valid/invalid scenarios.

Example (`sampleUser.data.json`):
```json
{
  "createUser": {
    "valid": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "securePassword123"
    },
    "invalid": {
      "name": "Jane Doe",
      "email": "jane.doe.invalid",
      "password": "short"
    }
  },
  "getUser": {
    "byId": "user123"
  }
}
```

## Loading Data in Tests

Use the utility function `loadTestData(fileName)` from `/tests/utils/data-loader.js`.

```javascript
// Example in a Jest test
const { loadTestData } = require('../utils/data-loader'); // Adjust path as needed

const userData = loadTestData('sampleUser.data.json');
const validUserPayload = userData.createUser.valid;
```

## Dynamic Data Generation

For dynamically generated data, refer to scripts that may be developed in the `/scripts/generators/` directory.
