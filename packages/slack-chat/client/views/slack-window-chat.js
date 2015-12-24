Template.slackChatWindow.events({
  "click .slack-chat-header": function(event, template) {
    var supportHistory = SlackChat.Utils.supportHistory(),
      instance = Template.instance(),
      slackChatSettings = instance.data.slackChatSettings,
      customerServiceName = slackChatSettings.customerServiceName,
      customerId = slackChatSettings.customerId,
      customerName = slackChatSettings.customerName,
      alertTeam = slackChatSettings.alertTeam,
      channelToAlert = slackChatSettings.channelToAlert,
      customerServiceStatus = instance.slackChatWindowVars.get('customerServiceStatus'),
      channelId = supportHistory && supportHistory.channelId;
    if (customerServiceStatus && !_.isEqual(customerServiceStatus, 'away')) {
      if (supportHistory) {
        SlackChat.Utils.getSlackChanelHistory(instance, channelId);
      } else {
        SlackChat.Utils.createNewSlackChannel(instance);
      };
    } else {
      instance.slackChatWindowVars.set('customerServiceStatus', customerServiceStatus);
      instance.slackChatWindowVars.set('showLoadingIcon', false);
    }

    SlackChat.Utils.toggleSlackChat(instance);
  },
  'click #slack-post-submit': function(event, template) {
    var instance = Template.instance(),
      slackDataSettings = instance.data.slackChatSettings,
      supportHistory = SlackChat.Utils.supportHistory(),
      textAreaElement = instance.$('#slack-post-text')
    messageData = {
        text: textAreaElement.val(),
        channel: supportHistory.channelId,
        username: slackDataSettings.customerName,
        icon_url: 'http://lorempixel.com/48/48'
      },
      sendSlackMessage = SlackChat.Utils.postSlackChatMessage(messageData);
    textAreaElement.val('');
  }
});

Template.slackChatWindow.helpers({
  slackData: function() {
    return Template.instance().data.slackChatSettings;
  },
  slackConnectionError: function() {
    return Template.instance().slackChatWindowVars.equals('slackConnectionError', true);
  },
  showLoadingIcon: function() {
    return Template.instance().slackChatWindowVars.equals('showLoadingIcon', true);
  },
  channelMessages: function() {
    return SlackChat.Collections.ChatHistory.find({}, {
      sort: {
        ts: 1
      }
    });
  },
  isJoinMessage: function(type) {
    return _.isEqual(this.subtype, 'channel_join');
  },
  isArchivedMessage: function() {
    return _.isEqual(this.subtype, 'channel_archive');
  },
  isLeaveMessage: function() {
    return _.isEqual(this.subtype, 'channel_leave');
  },
  isNormalMessage: function() {
    return _.isEqual(this.subtype, 'bot_message') || _.isEqual(this.subtype, 'message');
  },
  chatOpen: function() {
    return Template.instance().slackChatWindowVars.equals('chatOpen', true);
  },
  isSupportUserIsAvaible: function(status) {
    console.log(status);
    return _.isEqual(status, 'active');
  },
  isSupportUserIsAway: function() {
    return _.isEqual(status, 'away');
  },
  customerServiceStatus: function() {
    return Template.instance().slackChatWindowVars.get('customerServiceStatus');
  },
  customerServiceName: function() {
    return Template.instance().data.slackChatSettings.customerServiceName;
  },
  joinChatMessage: function() {
    return Template.instance().data.slackChatSettings.joinChatMessage;
  },
  leaveChatMessage: function() {
    return Template.instance().data.slackChatSettings.leaveChatMessage;
  },
  archivedChatMessage: function() {
    return Template.instance().data.slackChatSettings.archivedChatMessage;
  },
  customerServiceName: function() {
    return Template.instance().data.slackChatSettings.customerServiceName;
  },
  someErrorOcurr: function() {
    return '';
  }
});

Template.slackChatWindow.onRendered(function() {
  var _this = this,
    supportHistory,
    slackChatSettings = _this.data.slackChatSettings,
    customerServiceName = slackChatSettings.customerServiceName,
    customerName = slackChatSettings.customerName,
    channelId;
  var queryHistoryInterval = Meteor.setInterval(function() {
    supportHistory = SlackChat.Utils.supportHistory();
    if (supportHistory) {
      channelId = supportHistory.channelId;
      SlackChat.Utils.getSlackChanelHistory(_this, channelId);
      //SlackChat.Utils.archiveChannel(_this); By now is commented
    }
  }, _this.data.slackChatSettings.queryMessages);
  SlackChat.Utils.getUserPresence(_this);
});

Template.slackChatWindow.onCreated(function() {
  var _this = this,
    customerId;
  SlackChat.Utils.setSlackSettings(_this);
  _this.slackChatWindowVars = new ReactiveDict();
  _this.slackChatWindowVars.setDefault('slackConnectionError', false);
  _this.slackChatWindowVars.setDefault('showLoadingIcon', true);
  _this.slackChatWindowVars.setDefault('channelMessages', null);
  _this.slackChatWindowVars.setDefault('latest', null);
  _this.slackChatWindowVars.setDefault('chatOpen', false);
  _this.slackChatWindowVars.setDefault('customerServiceStatus', null);
  _this.slackChatWindowVars.setDefault('someErrorOcurr', false);

  _this.autorun(function() {
    var customerId = _this.data.slackChatSettings.customerId;
    Meteor.subscribe("SlackChat.Publications", customerId);
  });
});
