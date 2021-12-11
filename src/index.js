// external packages
const express = require('express');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());

// Server Port
const PORT = process.env.PORT || 5000;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const WEBHOOKTOKEN = process.env.WEBHOOKTOKEN;

const DIALOGFLOW_API = require('../helper-functions/dialogflow-api');
const FACEBOOK_API = require('../helper-functions/messenger-api');
const TWILIO_API = require('../helper-functions/twilio-api');

// This method is to verify the Facebook webhook
webApp.get('/facebook', (req, res) => {

    let mode = req['query']['hub.mode'];
    let token = req['query']['hub.verify_token'];
    let challenge = req['query']['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === WEBHOOKTOKEN) {
            console.log('Webhook verified by Facebook.')
            res.status(200).send(challenge);
        } else {
            res.status(403).send('Forbidden');
        }
    }
});

webApp.post('/facebook', async (req, res) => {

    if (req.body.object === 'page') {
        try {
            let incomingData = req.body.entry[0].messaging[0];

            let senderId = incomingData.sender.id;
            console.log(`Sender id --> ${senderId}`);

            let message = '';

            if (incomingData.hasOwnProperty('postback')) {
                message = incomingData.postback.title;
                console.log(`Message --> ${message}`);
            } else {
                message = incomingData.message.text;
                console.log(`Message --> ${message}`);
            }

            let intentData = await DIALOGFLOW_API.detectIntent('en', message, senderId);
            let data = JSON.parse(intentData.text);

            if (data.options.length > 0) {
                await FACEBOOK_API.sendMessageWithQuickReplies(data.options, data.text, senderId);
            } else {
                await FACEBOOK_API.sendMessage(data.text, senderId);
            }

            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.log(`Error at Facebook --> ${error}`);
            res.status(200).send('EVENT_RECEIVED');
        }
    } else {
        res.status(200).send('EVENT_RECEIVED');
    }
});

// WhatsApp route
webApp.post('/whatsapp', async (req, res) => {

    let message = req.body.Body;
    let senderId = req.body.From.split('+')[1];

    console.log(`Sender id --> ${senderId}`);
    console.log(`Message --> ${message}`);

    let intentData = {};

    try {
        intentData = await DIALOGFLOW_API.detectIntent('en', message, senderId);
        let data = JSON.parse(intentData.text);

        await TWILIO_API.sendMessage(data.text, senderId);

    } catch (error) {
        console.log(`Error at WhatsApp --> ${error}`);
    }
});

// Website widget route
webApp.get('/website', async (req, res) => {

    let text = req.query.text;
    let sessionId = req.query.mysession;

    console.log('A request came.');
    console.log(`Query text --> ${text}`);
    console.log(`Session id --> ${sessionId}`);

    let intentData = await DIALOGFLOW_API.detectIntent('en', text, sessionId);

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (intentData.status == 1) {
        res.send(intentData.text);
    } else {
        res.send('Chatbot is having problem. Try again after sometime.');
    }
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});