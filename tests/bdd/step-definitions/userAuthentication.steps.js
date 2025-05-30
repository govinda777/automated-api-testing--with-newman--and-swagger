const { Given, When, Then, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const assert = require('assert');
// const axios = require('axios'); // Would need: npm install axios --save
// const { loadTestData } = require('../../utils/data-loader'); // Path for utils from step-definitions

// const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api'; // Example base URL
let requestPayload;
let response;
let sharedData = {}; // To share data between steps

// Dummy HTTP client for now
const mockApiClient = {
    post: async (endpoint, data) => {
        console.log(`Mock POST to ${endpoint} with data:`, data);
        if (endpoint === '/users/register' && data.email && data.email.includes('@')) {
            return { status: 201, data: { userId: 'mockUserId123', message: 'User registered successfully' } };
        } else if (endpoint === '/users/login' && data.email === 'registered@example.com' && data.password === 'password123') {
            return { status: 200, data: { token: 'mockAuthTokenAbc123' } };
        } else if (endpoint === '/users/login') {
            return { status: 401, data: { message: 'Invalid credentials' } };
        }
        return { status: 404, data: { message: 'Not Found' } };
    }
};

Given('I am a new user with valid registration details', function () {
  // const userData = loadTestData('userAuthentication.data.json'); // Example data loading from /tests/data/
  // requestPayload = userData.registration.valid;
  requestPayload = { name: 'Test User', email: 'testuser@example.com', password: 'password123' };
});

Given('I am a registered user with valid credentials', function () {
  // const userData = loadTestData('userAuthentication.data.json');
  // requestPayload = userData.login.valid;
  requestPayload = { email: 'registered@example.com', password: 'password123' };
  sharedData.registeredEmail = requestPayload.email; // Save for later use if needed
});

When(/^I send a POST request to "([^"]*)" with my details$/, async function (endpoint) {
  // response = await axios.post(`${BASE_URL}${endpoint}`, requestPayload);
  response = await mockApiClient.post(endpoint.replace('/api',''), requestPayload); // Adjust endpoint for mock client
});

When(/^I send a POST request to "([^"]*)" with my credentials$/, async function (endpoint) {
  // response = await axios.post(`${BASE_URL}${endpoint}`, requestPayload);
  response = await mockApiClient.post(endpoint.replace('/api',''), requestPayload); // Adjust endpoint for mock client
});

Then('the response status code should be {int}', function (expectedStatusCode) {
  assert.strictEqual(response.status, expectedStatusCode, `Expected status ${expectedStatusCode} but got ${response.status}`);
});

Then('the response should contain a user ID and a success message', function () {
  assert.ok(response.data.userId, 'Response should contain a user ID');
  assert.ok(response.data.message, 'Response should contain a success message');
});

Then('the response should contain an authentication token', function () {
  assert.ok(response.data.token, 'Response should contain an authentication token');
});
