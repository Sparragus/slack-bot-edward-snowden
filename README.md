#slack-bot-edward-snowden

Let the Edward Snowden keep you anonymous on Slack. [slack-bot-edward-snowden](http://ledhack.org/slack-bot-edward-snowden/) will anonymize all your messages before sending them to #random.

## Installation
Before we deploy this app to [Heroku](https://heroku.com) we need to create and configure the bot on Slack.

### Create a bot
Go to your team's Slack settings, and add a [new bot integration](https://my.slack.com/services/new/bot). Name him edward_snowden.

![Create a bot](http://ledhack.org/content/images/2015/06/newbot.png)

After creating it, take note of the API Token. You'll need it later. All other settings are for you to set as you wish.

![API Token](http://ledhack.org/content/images/2015/06/Screen-Shot-2015-06-05-at-12-53-48-PM.png)

### Deploy this app to Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/sparragus/slack-bot-edward-snowden/tree/master)

Use that button to deploy this app to Heroku. Before you deploy the app, add the API Token for the config variable. Also, give your app a name.

![API Token Config Var](http://ledhack.org/content/images/2015/06/Screen-Shot-2015-06-05-at-2-12-01-PM.png)

### Chat anonymously!
When Heroku finishes installing the app, head over to your team's Slack chat. You'll notice Edward Snowden as a user on the sidebar. Send him a direct message, and see it on #random.
