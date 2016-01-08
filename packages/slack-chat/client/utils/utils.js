var slackMethods = {
    'setSlackSettings': function(instance) {
      var currentSlackSettings = instance.data && instance.data.slackChatSettings || {},
        mongoId = new Mongo.ObjectID();
      if (!instance.data) {
        console.error("Missing slackChatSettings Data");
        return;
      };
      slackSettings = {
        alertTeam: currentSlackSettings.alertTeam || false,
        channelToAlert: currentSlackSettings.channelToAlert || '#general',
        chatHeader: currentSlackSettings.chatHeader || 'Chat',
        companyName: currentSlackSettings.companyName || null,
        customerId: currentSlackSettings.customerId || mongoId._str,
        customerName: currentSlackSettings.customerName || 'You',
        customerImage: currentSlackSettings.customerImage || null,
        customerServiceName: currentSlackSettings.customerServiceName || 'Support',
        joinChatMessage: currentSlackSettings.joinChatMessage || 'Join The Chat',
        leaveChatMessage: currentSlackSettings.leaveChatMessage || 'Leave The Chat',
        archivedChatMessage: currentSlackSettings.archivedChatMessage || 'This Channels Has Been Archived By the support team',
        queryMessages: currentSlackSettings.queryMessages || 3000,
        userMeteorAccounts: currentSlackSettings.userMeteorAccounts || false,
        achiveChannels: currentSlackSettings.achiveChannels || false,
        allowPingToGeneral: currentSlackSettings.allowPingToGeneral || false,
        customerSupportEmail: currentSlackSettings.customerSupportEmail || null
      };
      instance.data.slackChatSettings = slackSettings
    },
    'toggleSlackChat': function(instance) {
      var slackChatContainer = $('#slack-chat');
      slackChatContainer.toggleClass('open');
      if (slackChatContainer.hasClass('open')) {
        instance.slackChatWindowVars.set('chatOpen', true);
      } else {
        instance.slackChatWindowVars.set('chatOpen', false);
      };
    },
    'setErrorState': function(instance, error) {
      instance.slackChatWindowVars.set('newChannelResponse', error);
      instance.slackChatWindowVars.set('showLoadingIcon', false);
      instance.slackChatWindowVars.set('someErrorOcurr', true);
    },
    'supportHistory': function() {
      return SlackChat.Collections.HistoryCollection.findOne();
    },
    'createNewSlackChannel': function(instance) {
      var queryHistory = SlackChat.Collections.HistoryCollection.findOne(),
        slackChatSettings = instance.data.slackChatSettings,
        dataToNotify = {
          text: null,
          channelToAlert: slackChatSettings.channelToAlert
        },
        dataToChannel = {
          customerId:slackChatSettings.customerId,
          customerName: slackChatSettings.customerName
        };
      Meteor.call('POST/Channels/Create', dataToChannel, function(error, result) {
        if (error) {
          SlackChat.Utils.setErrorState(instance, error);
        } else {
          instance.slackChatWindowVars.set('newChannelResponse', result.ok);
          if (result.ok) {
            SlackChat.Utils.insertHistoryRecord(slackChatSettings.customerId, result.channel.id);
            instance.slackChatWindowVars.set('showLoadingIcon', false);
            dataToNotify.text = 'New Channel Support Created on Channel : ' + result.channel.name;
            SlackChat.Utils.notifyTeam(slackChatSettings, dataToNotify);
          } else if (!result.ok && _.isEqual(result.error, 'name_taken') && !queryHistory) {
            SlackChat.Utils.createNameTakenSlackChannel(instance, true);
          } else if (queryHistory) {
            SlackChat.Utils.getSlackChanelHistory(instance, queryHistory.channelId, slackChatSettings.customerServiceName, slackChatSettings.customerName);
            instance.slackChatWindowVars.set('showLoadingIcon', false);
          };
        }
      });
    },
    'createNameTakenSlackChannel': function(instance) {
      var queryHistory = SlackChat.Collections.HistoryCollection.findOne(),
        slackChatSettings = instance.data.slackChatSettings,
        dataToNotify = {
          text: null,
          channelToAlert: slackChatSettings.channelToAlert
        },
        dataToChannel = {
          customerId:slackChatSettings.customerId,
          customerName: slackChatSettings.customerName
        };
      Meteor.call('POST/Channels/NameTaken', dataToChannel, function(error, result) {
        if (error) {
          console.log(error);
          SlackChat.Utils.setErrorState(instance, error);
        } else {
          if (result.ok) {
            SlackChat.Utils.insertHistoryRecord(slackChatSettings.customerId, result.channel.id);
            dataToNotify.text = 'New Channel Support Created on Channel : ' + result.channel.name;
            SlackChat.Utils.notifyTeam(slackChatSettings, dataToNotify);
            instance.slackChatWindowVars.set('newChannelResponse', result.ok);
            instance.slackChatWindowVars.set('showLoadingIcon', false);
          } else if (!result.ok) {
            SlackChat.Utils.setErrorState(instance, result.error);
          }
        };
      });
    },
    'getSlackChanelHistory': function(instance, channelId) {
      var latestHistoryUpdate = instance.slackChatWindowVars.get('latest'),
        slackChatSettings = instance.data.slackChatSettings,
        owner = slackChatSettings.customerServiceName,
        dataToHistory = {
          channelId: channelId
        };
      Meteor.call('GET/Channels/History', dataToHistory, function(error, result) {
        if (error) {
          SlackChat.Utils.setErrorState(instance, error);
        } else {
          _.each(result.messages, function(message) {
            if (_.isEqual(message.subtype, 'bot_message')) {
              owner = slackChatSettings.customerName;
            }
            if (message.ts > latestHistoryUpdate) {
              SlackChat.Collections.ChatHistory.insert({
                text: message.text,
                owner: owner,
                ts: message.ts,
                subtype: message.subtype || 'message'
              });
            };
          });
        };
        instance.slackChatWindowVars.set('latest', result.messages[0].ts);
        instance.slackChatWindowVars.set('showLoadingIcon', false);
      });
    },
    'unachiveChannel': function(instance, options, callback) {
      return Meteor.call('POST/Chat/UnachiveChannel', options, function(error, result) {
        if (error) {
          callback(error.message);
        } else {
          callback(null, result);
        }
      });
    },
    'deleteArchivedChannelMessage': function(instance) {
      SlackChat.Collections.ChatHistory.remove({});
      SlackChat.Utils.toggleSlackChat(instance);
    },
    'postSlackChatMessage': function(messageData) {
      Meteor.call('POST/Chat/Message', messageData);
    },
    'getUserPresence': function(instance) {
      Meteor.call('POST/Users/GetPresence', function(error, result) {
        if (!error) {
          instance.slackChatWindowVars.set('customerServiceStatus', result.presence);
        }
      });
    },
    'notifyTeam': function(slackChatSettings, options) {
      if (slackChatSettings.alertTeam || slackChatSettings.allowPingToGeneral) {
        Meteor.call('POST/Channels/AlertMessage', options);
      }
    },
    'insertHistoryRecord': function(customerId, channelId) {
      SlackChat.Collections.HistoryCollection.insert({
        customerId: customerId,
        channelId: channelId
      })
    },
    'archiveChannel': function(instance) {
      var slackChatSettings = instance.data.slackChatSettings,
        HistoryCollection = SlackChat.Collections.HistoryCollection.findOne();
      if (slackChatSettings.achiveChannels && HistoryCollection) {
        Meteor.call('POST/Channels/Archive', HistoryCollection.channelId);
      };
    }
  },
  namespace = SlackChat.Utils;


_.each(slackMethods, function(methodName, key) {
  namespace[key] = methodName;
});
