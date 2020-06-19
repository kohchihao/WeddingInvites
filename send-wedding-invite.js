const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const message = "Hi friend! You are invited to my wedding! Here are the details.\nDate: 09/02/2025\nTime: 13:00\nVenue: Park Royal Hotel\nPlease response I am available or I am not available"

client.messages
  .create({
    from: 'whatsapp:+14155238886',
    body: message,
    to: 'whatsapp:+6590611266',
  })
  .then((message) => console.log(message.sid));