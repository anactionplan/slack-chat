var slackSettings = Meteor.settings.slack,
  tokens = slackSettings && slackSettings.tokens,
  methodsNamespace = SlackChat.Methods;
if (tokens.length < 1) {
  console.error("Slack Token Missing");
}

function getUserPresence(token) {
  console.log("el token que voy a checar es " + token);
  userPresence = SlackAPI.users.getPresence(token);
  if (userPresence.ok && userPresence.online) {
    console.log("esta online");
    console.log("el token para usar es " + token);
    tokenToUse = token;
  } else {
    console.log("no esta online");
    tokens.shift();
    console.log(tokens[0]);
    getUserPresence(tokens[0])
  };
  return tokenToUse;
};

Meteor.methods({
  'POST/Channels/Create': function(options) {
    check([options], [Object]);
    var channelName = 'support -' + options.customerName;
    return insertChannel = SlackAPI.channels.create(getUserPresence(tokens[0]), options.channelName);
  },
  'POST/Channels/NameTaken': function(options) {
    check([options], [Object]);
    var channelName = 'support -' + options.customerId;
    return insertChannel = SlackAPI.channels.create(getUserPresence(tokens[0]), channelName);
  },
  'GET/Channels/History': function(options) {
    check([options], [Object]);
    return SlackAPI.channels.history(getUserPresence(tokens[0]), options.channelId);
  },
  'POST/Chat/Message': function(options) {
    check([options], [Object]);
    return SlackAPI.chat.postMessage(getUserPresence(tokens[0]), options.channel, options.text, {
      as_user: false,
      username: options.username,
      icon_url: options.customerImage
    });
  },
  'POST/Users/GetPresence': function() {
    return SlackAPI.users.getPresence(getUserPresence(tokens[0]));
  },
  'POST/Chat/UnachiveChannel': function(options) {
    check([options], [Object]);
    return SlackAPI.channels.unarchive(getUserPresence(tokens[0]), options.channelId);
  },
  'POST/Channels/AlertMessage': function(options) {
    check([options], [Object]);
    return postMessage = SlackAPI.chat.postMessage(getUserPresence(tokens[0]), options.channelToAlert, options.text, {
      username: 'Slack-Chat-Bot',
      as_user: false,
      icon_url: 'https://status.slack.com/img/allgood@2x.png'
    });
  },
  'POST/Channels/Archive': function(channelId) {
    check([channelId], [String]);
    return SlackAPI.channels.archive(getUserPresence(tokens[0]), channelId);
  }
});
