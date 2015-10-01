var Slack = require('slack-client');
var http = require('http');

var token = process.env.xoxb-11677818262-aKjJhqE7k3drnIcIcySBbqnd;
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

// I don't want this app to crash in case someone sends an HTTP request, so lets implement a simple server
//Lets define a port we want to listen to
const PORT = process.env.PORT || 3000;

//We need a function which handles requests and send response
function handleRequest(request, response){
    var quote = "The NSA has built an infrastructure that allows it to intercept almost everything. With this capability, the vast majority of human communications are automatically ingested without targeting. If I wanted to see your emails or your wife's phone, all I have to do is use intercepts. I can get your emails, passwords, phone records, credit cards. I don't want to live in a society that does these sort of things... I do not want to live in a world where everything I do and say is recorded. That is not something I am willing to support or live under.\n\n-Edward Snowden, NSA files source: 'If they want to get you, in time they will', The Guardian, 10 June 2013.";
    response.end(quote);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log('Server listening on: http://localhost:%s', PORT);
});
