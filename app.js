require('dotenv').config()

let context = {
  available: false,
  plusOne: false,
};

const express = require('express');
const { MessagingResponse } = require('twilio').twiml;
const app = express();
const port = 3000;
const axios = require('axios');

const goodBoyUrl =
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?' +
  'ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80';

const luisApiUrl =
  'https://westus.api.cognitive.microsoft.com/luis/prediction/v3.0/apps/ae4d8a53-2410-455e-a9cd-4f035973102e/slots/staging/predict?subscription-key=f7194f9b116d4b5b96a2148f1969366b&verbose=true&show-all-intents=true&log=true&query=';
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(express.json());

app.post('/', async (req, res) => {
  const { body } = req;

  let message;

  if (body.NumMedia > 0) {
    message = new MessagingResponse().message(
      "Thanks for the image! Here's one for you!"
    );
    message.media(goodBoyUrl);
  } else {
    message = new MessagingResponse().message('Send us an image!');
  }

  res.set('Content-Type', 'text/xml');
  res.send(message.toString()).status(200);
});

app.post('/receive', async (req, res) => {
  const { body } = req;

  let message = "Idk what u talking about man.";

  const userMessage = body.Body;
  if (userMessage.length > 0) {
    axios
      .get(luisApiUrl + encodeURIComponent(userMessage))
      .then((response) => {
        const topIntent = response.data.prediction.topIntent;
        console.log('topIntent', topIntent);
        if (topIntent === 'CanGoWedding') {
          if (context.available === false) {
            message =
              'Okay, great! Do you wanna bring your +1? Please response Yes or No';
            context = {
              available: true,
              plusOne: false,
            };
          }
        } else if (topIntent === 'CannotGoWedding') {
          if (context.available === false) {
            message =
              'Aww man, sorry that you cannot make it! We will send you some pictures from our wedding!';
            context = {
              available: false,
              plusOne: false,
            };
          }
        } else if (topIntent === 'GotBringPlusOne') {
          if (context.available && context.plusOne === false) {
            message = 'Okay thanks for the info! See you there!';
            context = {
              available: true,
              plusOne: true,
            };
          }
        } else if (topIntent === 'NeverBringPlusOne') {
          if (context.available && context.plusOne === false) {
            message = 'Okay noted. See you there!';
            context = {
              available: true,
              plusOne: false,
            };
          }
        } else if (topIntent === 'WeddingInfo') {
          message =
            'Here are the details.\nDate: 09/02/2025\nTime: 13:00\nVenue: Park Royal Hotel';
        }
      })
      .catch((error) => {
        console.log(error);
        message = error.message;
      })
      .then(() => {
        // always executed
        message = new MessagingResponse().message(message);
        res.set('Content-Type', 'text/xml');
        res.send(message.toString()).status(200);
      });
  }
});

app.get('/', async (req, res) => {
  res.send('Hello');
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
