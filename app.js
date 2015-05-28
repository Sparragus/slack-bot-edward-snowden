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

var onUserTyping = (function() {
  var userPreviousWarning = {};
  return function onUserTyping (user, channel) {
    // If the user is writing me, it's okay.
    if (channel.is_im) {
      return;
    }

    // If the user is typing on channel #anonymous, warn him/her
    if (channel.is_channel) {
      // do not warn user if less than N seconds have passed since last warning
      var secondsThreshold = 10;
      var timeElapsedInSeconds = 0;

      // check if the user is in our records. if so, how much time has passed since the last warning?
      if (userPreviousWarning[user.id]) {
        timeElapsedInSeconds = (Date.now() - userPreviousWarning[user.id]) / 1000;
      }
      // if user is not on our records, add him/her
      else {
        userPreviousWarning[user.id] = Date.now();
        timeElapsedInSeconds = secondsThreshold + 1;
      }

      // if not enough time has passed, return.
      if ( timeElapsedInSeconds < secondsThreshold ) {
        return;
      }

      // open a DM channel and send user a message
      slack.openDM(user.id, function(dmChannel) {
        var dm = slack.getDMByID(dmChannel.channel.id);
        var message = "You're directly writing on the #anonymous channel. This will expose you. If you want to send an anonymous message, send it to me and I'll forward it to #anonymous.";

        dm.send(message);
        dm.close();

        userPreviousWarning[user.id] = Date.now();
      });
    }
  };
})();

slack.on('userTyping', onUserTyping);

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