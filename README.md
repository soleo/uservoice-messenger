# User Voice Messenger
Deliver different kinds of messages to related slack channels

### Requirements

* Firebase Account
* NodeJS
* Slack Webhook
* UserVoice Account

### Development

```shell
$ npm install -g firebase-tools
$ cd functions; npm install; cd -
$ firebase functions:config:set slack.webhook_url="https://hooks.slack.com/services/..."
```

### Deployment

```shell
$ firebase deploy
```

### Reference 

- [User Voice New Ticket Json](https://github.com/uservoice/uservoice-service-hooks/blob/master/spec/fixtures/json/new_ticket.json)
- [Slack: An Introduction to Messages](https://api.slack.com/docs/messages)
