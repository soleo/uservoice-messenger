'use strict';

const functions = require('firebase-functions');
const rp = require('request-promise');

/**
 * Webhook that will be called each time there is a new ticket from User Voice and will post a message to
 * Slack.
 */
exports.userVoiceWebhook = functions.https.onRequest((req, res) => {
  functions.logger.log(req.body);
  const uservoice = JSON.parse(req.body);

  let message = '';

  if(uservoice?.ticket?.created_by?.name) {
    message = uservoice.ticket.created_by.name + ' said: '+ uservoice.ticket?.messages[0]?.body;
  }
  postToSlack(message,
    uservoice?.ticket?.created_by?.name,
    uservoice?.ticket?.created_by?.avatar_url,
    uservoice?.ticket?.created_by?.traits?.type,
    uservoice?.ticket?.messages[0]?.referrer,
    uservoice?.ticket?.custom_fields).then(() => {
    res.end();
  }).catch(error => {
    functions.logger.error(error);
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
  var isBusinessUser = false
  if(otherFields && otherFields.length > 0) {
        otherFields.forEach(function(customField) {
            fields.push({
                'title': customField.key,
                'value': customField.value,
                'short': false
            });
            if (customField.key === 'customerType' && customField.value === 'M') {
                isBusinessUser = true;
            }
        });
  }
  if (isBusinessUser) {
      rp({
        method: 'POST',
        uri: functions.config().slack.webhook_b2b_url,
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
