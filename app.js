var Slack = require('slack-client');

var token = process.env.SLACK_API_TOKEN;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
  console.log('Welcome to Slack. You are @' + slack.self.name + ' of ' + slack.team.name);
});

slack.on('message', function (message) {
  // if message is from myself, ignore

  var channelGroupOrDM = slack.getChannelGroupOrDMByID(message.channel);
  var text = message.text;

  // if message is a DM from a user...
  if (channelGroupOrDM.is_im) {
    var anonymousChannel = slack.getChannelByName('anonymous');
    var anonymousUser = randomUsername();
    var someColor = randomHexColor();
    var anonymousIcon = 'http://placehold.it/80/' + someColor + '/'+ someColor;

    var response = {
      text: text,
      username: anonymousUser,
      icon_url: anonymousIcon
    };

    // post message to #anonymous
    anonymousChannel.postMessage(response);
  }
});

// Warn a user if he/she is typing on channel #anonymous
slack.on('userTyping', function(user, channel) {
  // If the user is writing me, it's okay.
  if (channel.is_im) {
    return;
  }

  // If the user is typing on channel #anonymous, warn him/her
  if (channel.is_channel) {
    // open a DM channel and send user a message
    slack.openDM(user.id, function(dmChannel) {
      var dm = slack.getDMByID(dmChannel.channel.id);
      var message = "You're directly writing on the #anonymous channel. This will expose you. If you want to send an anonymous message, send it to me and I'll forward it to #anonymous.";

      dm.send(message);
      dm.close();
    });
  }
});

slack.on('error', function (error) {
  console.error('Error:', error);
});

slack.login();

function randomUsername () {
  return Math.random().toString(36).substring(2);
}

function randomHexColor() {
  return Math.random().toString(16).substring(2, 2+6);
}