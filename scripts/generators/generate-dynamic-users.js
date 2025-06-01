const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../../../tests/data/generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dynamic-users.json');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Creates a random user object with dynamic data
 * @returns {object} User object with dynamic data
 */
function createRandomUser() {
    return {
        name: `${faker.person.firstName()} ${faker.person.lastName()}`,
        email: `user_${Date.now()}@example.com`, // Unique email for each test
        password: 'password123',
        registrationDate: faker.date.past({ years: 1 }).toISOString(),
        status: faker.helpers.arrayElement(['active', 'inactive', 'pending'])
    };
}

/**
 * Generates an array of random users
 * @param {number} count Number of users to generate
 * @returns {Array<object>} Array of user objects
 */
function generateUsers(count = 5) {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push(createRandomUser());
    }
    return users;
}

// Generate the data
const users = generateUsers(5);

// Write to file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(users, null, 2));

console.log(`Generated ${users.length} dynamic users and saved to ${OUTPUT_FILE}`);