var Slack = require('slack-client');

var token = process.env.SLACK_API_TOKEN;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
  console.log('Welcome to Slack. You are @' + slack.self.name + ' of ' + slack.team.name);

  // Join the new /b/
  slack.joinChannel('random');
});

// TODO: This obviously violates anonimity. Fix later.
var userActivityOnChannel = {}; // {user:time, user:time, ...}
var userSecretUsername = {}; // {user:secretUser}

function onMessageFromChannel (message) {
  var notifyUsers = [];

  var users = Object.keys(userActivityOnChannel);
  users.forEach(function(user) {
    var lastSeen = userActivityOnChannel[user];

    // After N minutes of inactivity, do not notify user and remove him from this list
    var timeElapsed = (Date.now() - lastSeen);
    var timeThreshold = 1.5 * 60 * 1000; // ten minutes
    if (timeElapsed > timeThreshold) {
      delete userActivityOnChannel[user];
      return;
    }

    // Do not notify sender of the message. Also, remove him from the list.
    if (message.username && message.username === userSecretUsername[user]) {
      delete userSecretUsername[user];
      return;
    }

    notifyUsers.push(user);
  });

  notifyUsers.forEach(function(user) {
    var userName, userIcon;
    // if user sent message directly to channel, too bad. get his info
    if (message.user) {
      var userProfile = slack.getUserByID(message.user);
      userName = userProfile.name;
      userIcon = userProfile.profile.image_48;
    }
    // get bot info
    else if (message.username) {
      userName = message.username;
      userIcon = message.icons.image_48;
    }

    // open a DM channel and send user a message
    console.log(message);
    slack.openDM(user, function(dmChannel) {
      // console.log(dmChannel);
      var dm = slack.getDMByID(dmChannel.channel.id);
      dm.postMessage({
        text: message.text,
        username: userName,
        icon_url: userIcon
      });
      dm.close();
    });
  });
}

function onMessageFromDM (message) {
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

  // annotate who sent the message so the message isn't sent when broadcasting to users.
  userSecretUsername[message.user] = anonymousUser;
  userActivityOnChannel[message.user] = Date.now();

  // post message to #anonymous
  var anonymousChannel = slack.getChannelByName('random');
  anonymousChannel.postMessage(response);
}

slack.on('message', function (message) {
  // console.log('message', message);
  // TODO: if message is from myself, ignore

  var channelGroupOrDM = slack.getChannelGroupOrDMByID(message.channel);
  if( channelGroupOrDM.is_channel ) {
    onMessageFromChannel(message);
  } else if ( channelGroupOrDM.is_im ) {
    onMessageFromDM(message);
  }
});

var onUserTyping = (function() {
  var userPreviousWarning = {};
  return function onUserTyping (user, channel) {
    // If the user is writing me, it's okay.
    if (channel.is_im) {
      return;
    }

    //if the user is writing on a channel
    if (channel.name === 'general') {
      return;
    }

    // If the user is typing on channel #anonymous, warn him/her
    if (channel.is_channel) {
      // warn users once a day
      var secondsThreshold = 60 * 60 * 24;
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
        var message = "You're directly writing on the #random channel. This will expose you. If you want to send an anonymous message, send it to me and I'll forward it to #random.";

        dm.send(message);
        dm.close();

        userPreviousWarning[user.id] = Date.now();
      });
    }
  };
})();

// slack.on('userTyping', onUserTyping);

slack.on('error', function (error) {
  console.error('Error:', error);
});

slack.login();
