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
  postToSlack(message,
    userVoiceObject.ticket.created_by.name,
    userVoiceObject.ticket.created_by.avatar_url,
    userVoiceObject.ticket.created_by.traits.type,
    userVoiceObject.ticket.messages[0].referrer,
    userVoiceObject.ticket.custom_fields).then(() => {
    res.end();
  }).catch(error => {
    console.error(error);
    res.status(500).send('Something went wrong while posting the message to Slack.');
  });

});

/**
 * Post a message to Slack about the new UserVoice ticket.
 */
function postToSlack(message, authorName, authorIconURL, userAgent, referrer, otherFields) {
  var fields = [{
                    "title": "User Agent",
                    "value": userAgent,
                    "short": false
                },
                {
                    "title": "Referrer",
                    "value": referrer,
                    "short": false
                }];

  if(otherFields.length > 0) {
        otherFields.forEach(function(customFeild) {
            fields.push({
                'title': customFeild.key,
                'value': customField.value,
                'short': false
            });
        });
  }
  return rp({
    method: 'POST',
    uri: functions.config().slack.webhook_url,
    body: {
        attachments: [
        {
            "color": "#577926",
            "pretext": message,
            "author_name": authorName,
            "author_link": authorIconURL,
            "author_icon": authorIconURL,
            "fields": fields
        }
       ]
    },
    json: true
  });
}
