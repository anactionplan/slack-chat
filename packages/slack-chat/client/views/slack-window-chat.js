Tracker.autorun(function() {
  var archivedMessage = SlackChat.Collections.ChatHistory.findOne({
      subtype: 'channel_archive'
    }),
    owner = archivedMessage && archivedMessage.owner;
  if (archivedMessage) {
    SlackChat.Collections.ChatHistory.remove({}, function(error, result) {
      SlackChat.Collections.ChatHistory.insert({
        text: 'Ask for support again',
        owner: owner,
        ts: new Date().getTime(),
        subtype: 'reopen'
      })
    });
  }
});

Template.slackChatWindow.events({
  "click .slack-chat-header, click #asksupport-again": function(event, template) {
    var supportHistory = SlackChat.Utils.supportHistory(),
      instance = Template.instance(),
      isReopenEvent = _.isEqual($(event.target).attr('id'), 'asksupport-again'),
      slackChatSettings = instance.data.slackChatSettings,
      customerServiceName = slackChatSettings.customerServiceName,
      customerId = slackChatSettings.customerId,
      customerName = slackChatSettings.customerName,
      alertTeam = slackChatSettings.alertTeam,
      channelToAlert = slackChatSettings.channelToAlert,
      customerServiceStatus = instance.slackChatWindowVars.get('customerServiceStatus'),
      channelId = supportHistory && supportHistory.channelId,
      dataToUnachive = {
        channelId: channelId
      };
    if (customerServiceStatus && !_.isEqual(customerServiceStatus, 'away')) {
      if (supportHistory) {
        if (isReopenEvent) {
          SlackChat.Utils.unachiveChannel(instance, dataToUnachive, function(error, response) {
            if (error) {
              console.log(error);
            } else {
              if (response.ok) {
                SlackChat.Utils.deleteArchivedChannelMessage(instance);
                SlackChat.Utils.getSlackChanelHistory(instance, channelId);
              }
            }
          });
        } else {
          SlackChat.Utils.getSlackChanelHistory(instance, channelId);
        }
      } else {
        SlackChat.Utils.createNewSlackChannel(instance);
      };
    } else {
      instance.slackChatWindowVars.set('customerServiceStatus', customerServiceStatus);
      instance.slackChatWindowVars.set('showLoadingIcon', false);
    }

    SlackChat.Utils.toggleSlackChat(instance);
  },
  'click #ping-customer-support': function(event, template) {
    var instance = Template.instance(),
      slackChatSettings = instance.data.slackChatSettings,
      dataToNotify = {
        text: instance.$('#text-to-ping').val() || '!Hey ' + slackChatSettings.customerName + ' Needs some support',
        channelToAlert: '#general'
      };
    SlackChat.Utils.notifyTeam(slackChatSettings, dataToNotify);
  },
  'keyup': function(event, template) {
    event.preventDefault();
    if (event.keyCode == 13) {
      var instance = Template.instance(),
        slackDataSettings = instance.data.slackChatSettings,
        supportHistory = SlackChat.Utils.supportHistory(),
        textAreaElement = instance.$('#slack-post-text')
      messageData = {
          text: textAreaElement.val(),
          channel: supportHistory.channelId,
          username: slackDataSettings.customerName,
          icon_url: slackDataSettings.customerImage
        },
        sendSlackMessage = SlackChat.Utils.postSlackChatMessage(messageData);
      textAreaElement.val('');
    }
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
  isReopenMessage: function() {
    return _.isEqual(this.subtype, 'reopen');
  },
  isNormalMessage: function() {
    return _.isEqual(this.subtype, 'bot_message') || _.isEqual(this.subtype, 'message');
  },
  chatOpen: function() {
    return Template.instance().slackChatWindowVars.equals('chatOpen', true);
  },
  isSupportUserIsAvaible: function(status) {
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
  allowPingToGeneral: function() {
    return Template.instance().data.slackChatSettings.allowPingToGeneral;
  },
  customerSupportEmail: function() {
    return Template.instance().data.slackChatSettings.customerSupportEmail;
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
