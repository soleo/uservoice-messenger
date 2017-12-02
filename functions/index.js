'use strict';

const functions = require('firebase-functions');
const rp = require('request-promise');
const crypto = require('crypto');
const secureCompare = require('secure-compare');

/**
 * Webhook that will be called each time there is a new ticket from User Voice and will post a message to
 * Slack.
 */
exports.userVoiceWebhook = functions.https.onRequest((req, res) => {
  console.log(req.body);
  const data = req.body.data;
  // const userName = 'soleo';
  // const feedback = 'This is a test for uservoice';
  const userVoiceObject = JSON.parse(data);
  let message = '';
  if(!!userVoiceObject.message) {
    message = userVoiceObject.message;
  }

  if(!!userVoiceObject.ticket && !!userVoiceObject.ticket.created_by && !!userVoiceObject.ticket.created_by.name) {
    message = userVoiceObject.ticket.created_by.name + ': '+ userVoiceObject.ticket.messages[0].body;
  }
  postToSlack(message).then(() => {
    res.end();
  }).catch(error => {
    console.error(error);
    res.status(500).send('Something went wrong while posting the message to Slack.');
  });
  // const cipher = 'sha1';
  // const signature = req.headers['x-hub-signature'];

  // // TODO: Configure the `github.secret` Google Cloud environment variables.
  // const hmac = crypto.createHmac(cipher, functions.config().github.secret)
  //     // The JSON body is automatically parsed by Cloud Functions so we re-stringify it.
  //     .update(JSON.stringify(req.body, null, 0))
  //     .digest('hex');
  // const expectedSignature = `${cipher}=${hmac}`;

  // // Check that the body of the request has been signed with the GitHub Secret.
  // if (secureCompare(signature, expectedSignature)) {
  //   postToSlack(req.body.compare, req.body.commits.length, req.body.repository).then(() => {
  //     res.end();
  //   }).catch(error => {
  //     console.error(error);
  //     res.status(500).send('Something went wrong while posting the message to Slack.');
  //   });
  // } else {
  //   console.error('x-hub-signature', signature, 'did not match', expectedSignature);
  //   res.status(403).send('Your x-hub-signature\'s bad and you should feel bad!');
  // }
});

/**
 * Post a message to Slack about the new GitHub commit.
 */
function postToSlack(message) {
  return rp({
    method: 'POST',
    // TODO: Configure the `slack.webhook_url` Google Cloud environment variables.
    uri: functions.config().slack.webhook_url,
    body: {
      text: `${message}`
    },
    json: true
  });
}
