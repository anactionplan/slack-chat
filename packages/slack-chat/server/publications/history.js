Meteor.publish("SlackChat.Publications", function(customerId) {
  check([customerId], [String]);
  return SlackChat.Collections.HistoryCollection.find({
    customerId: customerId
  });
});
