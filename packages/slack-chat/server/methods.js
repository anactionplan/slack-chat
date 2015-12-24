var slackSettings = Meteor.settings.slack,
  token = slackSettings && slackSettings.token,
  methodsNamespace = SlackChat.Methods;

if (!token) {
  console.error("Slack Token Missing")
}
Meteor.methods({
  'POST/Channels/Create': function(customerId, customerName) {
    check([customerId, customerName], [String]);
    var channelName = 'support -' + customerName;
    return insertChannel = SlackAPI.channels.create(token, channelName);
  },
  'POST/Channels/NameTaken': function(customerId, customerName) {
    check([customerId, customerName], [String]);
    var channelName = 'support -' + customerId;
    return insertChannel = SlackAPI.channels.create(token, channelName);
  },
  'GET/Channels/History': function(channelId) {
    check([channelId], [String]);
    var channelHistory = SlackAPI.channels.history(token, channelId);
    return channelHistory;
  },
  'POST/Chat/Message': function(messageData) {
    check([messageData], [Object]);
    var channel = messageData.channel,
      text = messageData.text,
      username = messageData.username,
      as_user = true;
    return postMessage = SlackAPI.chat.postMessage(token, channel, text, {
      as_user: true,
      username: username,
      icon_url: 'http://lorempixel.com/48/48'
    });
  },
  'POST/Users/GetPresence': function() {
    var userPresence = SlackAPI.users.getPresence(token);
    return userPresence;
  },
  'POST/Channels/AlertMessage': function(channel, newChannel) {
    check([channel, newChannel], [String]);
    text = 'New Channel Support Created on Channel : ' + newChannel;
    return postMessage = SlackAPI.chat.postMessage(token, channel, text, {
      username: 'BOT',
      as_user: true
    });
  },
  'POST/Channels/Archive': function(channelId) {
    check([channelId], [String]);
    return SlackAPI.channels.archive(token, channelId);
  }
});
