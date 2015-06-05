var Slack = require('slack-client');

var token = process.env.SLACK_API_TOKEN;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
  console.log('Welcome to Slack. You are @' + slack.self.name + ' of ' + slack.team.name);
});

function onMessageToEdwardSnowden (message) {
  // do not listen to bots
  if (message.subtype === 'bot_message') {
    return;
  }

  function randomUsername () {
    return Math.random().toString(36).substring(2);
  }

  function randomHexColor() {
    return Math.random().toString(16).substring(2, 2+6);
  }

  var text = message.text;
  var anonymousUser = randomUsername();
  var someColor = randomHexColor();
  var anonymousIcon = 'http://placehold.it/80/' + someColor + '/'+ someColor;

  var response = {
    text: text,
    username: anonymousUser,
    icon_url: anonymousIcon
  };

  // post message to #random
  var anonymousChannel = slack.getChannelByName('random');
  anonymousChannel.postMessage(response);
}

slack.on('message', function (message) {
  var channelGroupOrDM = slack.getChannelGroupOrDMByID(message.channel);
  if (channelGroupOrDM.is_im) {
    onMessageToEdwardSnowden(message);
  }
});

slack.on('error', function (error) {
  console.error('Error:', error);
});

slack.login();
