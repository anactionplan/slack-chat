var slackSettings = Meteor.settings.slack,
  token = slackSettings && slackSettings.token,
  methodsNamespace = SlackChat.Methods;

if (!token) {
  console.error("Slack Token Missing");
}
Meteor.methods({
  'POST/Channels/Create': function(options) {
    check([options], [Object]);
    var channelName = 'support -' + options.customerName;
    return insertChannel = SlackAPI.channels.create(token, options.channelName);
  },
  'POST/Channels/NameTaken': function(options) {
    check([options], [Object]);
    var channelName = 'support -' + options.customerId;
    return insertChannel = SlackAPI.channels.create(token, channelName);
  },
  'GET/Channels/History': function(options) {
    check([options], [Object]);
    return SlackAPI.channels.history(token, options.channelId);
  },
  'POST/Chat/Message': function(options) {
    check([options], [Object]);
    return SlackAPI.chat.postMessage(token, options.channel, options.text, {
      as_user: false,
      username: options.username,
      icon_url: options.customerImage
    });
  },
  'POST/Users/GetPresence': function() {
    return SlackAPI.users.getPresence(token);
  },
  'POST/Chat/UnachiveChannel':function(options){
    check([options], [Object]);
    return SlackAPI.channels.unarchive(token, options.channelId);
  },
  'POST/Channels/AlertMessage': function(options) {
    check([options], [Object]);
    return postMessage = SlackAPI.chat.postMessage(token, options.channelToAlert, options.text, {
      username: 'Slack-Chat-Bot',
      as_user: false,
      icon_url:'https://status.slack.com/img/allgood@2x.png'
    });
  },
  'POST/Channels/Archive': function(channelId) {
    check([channelId], [String]);
    return SlackAPI.channels.archive(token, channelId);
  }
});
