Template.body.helpers({
  dataToSlack: function() {
    var mongoId = new Mongo.ObjectID(),
      slackChatSettings = new function() {
        this.chatHeader = 'Support Chat';
        this.userMeteorAccounts = false;
        this.customerId = (this.userMeteorAccounts ? Meteor.userId : mongoId._str);
        this.customerName = (this.userMeteorAccounts ? Meteor.username() : '4')
        this.queryMessages = 3000;
        this.customerServiceName = 'Ethaan';
        this.joinChatMessage = 'Join The Chat';
        this.leaveChatMessage = 'Leave The Chat';
        this.archivedChatMessage = 'This Channels Has Been Archived By the support team';
        this.companyName = 'AnactionPlan';
        this.alertTeam = true;
        this.channelToAlert = '#supporttickets';
        this.achiveChannels = true;
      };
    return slackChatSettings;
  }
});
