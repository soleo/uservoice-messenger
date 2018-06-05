'use strict';

const functions = require('firebase-functions');
const rp = require('request-promise');

/**
 * Webhook that will be called each time there is a new ticket from User Voice and will post a message to
 * Slack.
 */
exports.userVoiceWebhook = functions.https.onRequest((req, res) => {
  const data = req.body.data;
  console.log('{ data: '+ data +' }');
  const userVoiceObject = JSON.parse(data);
  let message = '';
  if(!!userVoiceObject.message) {
    message = userVoiceObject.message;
  }

  if(!!userVoiceObject.ticket && !!userVoiceObject.ticket.created_by && !!userVoiceObject.ticket.created_by.name) {
    message = userVoiceObject.ticket.created_by.name + ' said: '+ userVoiceObject.ticket.messages[0].body;
  }

  postToSlack(message).then(() => {
    res.end();
  }).catch(error => {
    console.error(error);
    res.status(500).send('Something went wrong while posting the message to Slack.');
  });

});

/**
 * Post a message to Slack about the new GitHub commit.
 */
function postToSlack(message) {
  return rp({
    method: 'POST',
    uri: functions.config().slack.webhook_url,
    body: {
      text: `${message}`
    },
    json: true
  });
}
