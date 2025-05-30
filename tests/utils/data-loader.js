const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function loadTestData(fileName) {
  const filePath = path.join(dataDir, fileName);
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading test data from ${fileName}:`, error);
    throw error; // Re-throw to fail tests if data is crucial
  }
}

module.exports = { loadTestData };
