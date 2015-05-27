var Slack = require('slack-client');

var token = process.env.SLACK_API_TOKEN;
var autoReconnect = true;
var autoMark = true;

slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
  console.log('Welcome to Slack. You are @' + slack.self.name + ' of ' + slack.team.name);
});