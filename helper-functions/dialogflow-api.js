// Import the packages we need
const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();

// Your credentials
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

// Your google dialogflow project-id
const PROJECID = CREDENTIALS.project_id;

// Configuration for the client
const CONFIGURATION = {
    credentials: {
        private_key: CREDENTIALS['private_key'],
        client_email: CREDENTIALS['client_email']
    }
}

// Create a new session
const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

// Detect intent method
const detectIntent = async (languageCode, queryText, sessionId) => {

    let sessionPath = sessionClient.projectAgentSessionPath(PROJECID, sessionId);

    // The text query request.
    let request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: languageCode,
            },
        },
    };

    try {
        // Send request and log result
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        return {
            status: 1,
            text: result.fulfillmentText
        };
    } catch (error) {
        console.log(`Error at dialogflow-ai.js detectIntent --> ${error}`);
        return {
            status: 0
        };
    }
};

module.exports = {
    detectIntent
};