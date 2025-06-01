// @ts-check
const axios = require('axios');
const { setTimeout } = require('timers/promises');

const PORT = process.env.PORT || 4010;
const MAX_RETRIES = 30;
const RETRY_DELAY = 1000; // 1 second

async function validateMockServer() {
    console.log(`\nValidating mock server on port ${PORT}...`);
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`\nAttempt ${attempt}/${MAX_RETRIES} - Checking if mock server is responding...`);
        
        try {
            // Try to make a request to the mock server
            const response = await axios.get(`http://localhost:${PORT}/health`);
            
            if (response.status === 200) {
                console.log(`\nMock server is ready and responding!`);
                process.exit(0);
            }
        } catch (error) {
            console.log(`Server not ready yet. Error: ${error.message}`);
        }
        
        if (attempt < MAX_RETRIES) {
            console.log(`Waiting ${RETRY_DELAY/1000} seconds before next attempt...`);
            await setTimeout(RETRY_DELAY);
        }
    }
    
    console.error(`\nError: Mock server did not respond after ${MAX_RETRIES} attempts`);
    process.exit(1);
}

validateMockServer();
