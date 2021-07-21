const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TOKEN;

// Generate Quick Replies
const getQuickReplies = (buttons) => {

    let quickReplies = [];

    buttons.forEach(button => {
        quickReplies.push({
            content_type: 'text',
            title: button,
            payload: button
        });
    });

    return quickReplies;
};

const sendMessage = async (message, senderId) => {

    let url = `https://graph.facebook.com/me/messages?access_token=${TOKEN}`;
    let headers = {
        'Content-Type': 'application/json'
    };

    let fields = {
        messaging_type: "RESPONSE",
        recipient: {
            id: senderId
        },
        message: {
            text: message
        }
    };

    try {
        let response = await axios.post(url, fields, { headers });

        if (response['status'] == 200 && response['statusText'] === 'OK') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error at messenger-api.js sendMessage --> ${error}`);
        return 0;
    }
};

const sendMessageWithQuickReplies = async (buttons, message, senderId) => {

    let url = `https://graph.facebook.com/me/messages?access_token=${TOKEN}`;
    let headers = {
        'Content-Type': 'application/json'
    };

    let quickReplies = getQuickReplies(buttons);

    let fields = {
        messaging_type: "RESPONSE",
        recipient: {
            id: senderId
        },
        message: {
            text: message,
            quick_replies: quickReplies
        }
    };

    try {
        let response = await axios.post(url, fields, { headers });

        if (response['status'] == 200 && response['statusText'] === 'OK') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error at messenger-api.js sendMessageWithQuickReplies --> ${error}`);
        return 0;
    }
};

module.exports = {
    sendMessage,
    sendMessageWithQuickReplies
};