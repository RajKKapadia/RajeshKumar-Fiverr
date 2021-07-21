require('dotenv').config();

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const FROM = process.env.FROM;

const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN, { 
    lazyLoading: true 
});

const sendMessage = async (message, senderId) => {

    let id = `whatsapp:+${senderId}`;

    try {
        let response = await client.messages.create({
            from: FROM,
            body: message,
            to: id,
        });
        return response.sid;
    } catch (error) {
        console.log(`Error at sendMessage --> ${error}`);
        return null;
    }
};

module.exports = {
    sendMessage
};