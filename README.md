# Slack-chat

Reactive Slack-Chat designed for Meteor

## About.

This is a package that generates an support-type chat on your Meteor APP, that generates a new slack channel or reuse an existing one if the current user already ask for support in the past.

Each channel will be created with the name of <code>support-{customerName}</code> and if that channel already exists will be <code>support-{customerId}</code>

## Usage

First you need to install the package.

    meteor add anactionplan:slack-chat

Second put neccesary data on <code>Meteor.settings</code>.

The token is the only thing this package needs to work basic.

```javascript
  "slack":{
    "token":"xxx-yourotken-xxxx-morethings"
  }
```

Third Call it as a Spacebars Template.

<template name="Slack-Chat">
    {{> slackChatWindow slackChatSettings=dataToSlack}}
</template>

Four, create a helper for the first <code>slackChatSettings</code> argument.

```javascript
Template.Slack-Chat.helpers({
  dataToSlack: function() {
    var mongoId = new Mongo.ObjectID(),
      slackChatSettings = new function() {
        this.chatHeader = 'Support Chat';
        this.userMeteorAccounts = false;
        this.customerId = (this.userMeteorAccounts ? Meteor.userId : mongoId._str);
        this.customerName = (this.userMeteorAccounts ? Meteor.user().username : 'You')
        this.queryMessages = 3000;
        this.customerServiceName = 'Ethaan';
        this.joinChatMessage = 'Join The Chat';
        this.leaveChatMessage = 'Leave The Chat';
        this.archivedChatMessage = 'Thanks For All, i had to leave';
        this.companyName = 'AnactionPlan';
        this.alertTeam = true;
        this.channelToAlert = '#supporttickets';
      };
    return slackChatSettings;
  }
});
```

## Options:

All this options are optionals, the only thing that is mandatory in this package is the <code>settings</code> options.
<ul>
<li>
  <code>chatHeader</code> : (optional) Header for the chat when its closed, default is <code>'Chat'</code>
</li>
<li>
  <code>userMeteorAccounts</code> (optional) This will Take <code>Meteor.userId</code> and <code>Meteor.user().username</code> for storing user info, default <code>false</code>
</li>
<li>
  <code>customerId</code> : (optional) if <code>userMeteorAccounts</code> is <code>true</code> it will take <code>Meteor.userId();</code> as reference, if
  this the option is empty a random Mongo _id will be generate
</li>
<li>
  <code>customerName</code> : (optional) if <code>userMeteorAccounts</code> is <code>true</code> it will take <code>Meteor.user().username;</code> as reference             if the option is empty the default value is 'You'
</li>
<li>
  <code>queryMessages</code> : (optional) how offten check for new messages into the chat, default is <code>3000</code>
</li>
<li>
 <code>customerServiceName</code> : (optional) Custommer service name to show in the chat, default is <code>Support</code>
</li>
<li>
  <code>joinChatMessage</code> : (optional) Message to show in the chat when other person join the current Chat, default is <code>Join The Chat</code>
</li>
<li>
  <code>leaveChatMessage</code> : (optional) Message to show in the chat when other person leave the current Chat, default is <code>Leave The Chat </code>
</li>
<li>
  <code>archivedChatMessage</code> : (optional) Message to show in the chat when the current chat is achived, default is <code>This Channels Has Been Archived By the support team</code>
</li>
<li>
  <code>companyName</code> : (optional) Name of your company, default is <code>null</code>
</li>
<li>
  <code>alertTeam</code> : (optional) if <code>true</code> a message alert will send to the <code> channelToAlert </code> specified, with the following message <code>New Channel Support Created on Channel : {newChannelName}</code>
</li>
<li>
  <code>channelToAlert</code> : (optional) channel to alert, if <code>alertTeam</code> is <code>true</code>, and you forgot to add a name here, default will be <code>#general</code>
</li>
</ul>


### SlackChat(Client API)

#### SlackChat.Collections

Here we had 2 collection
<ul>
<li>
<code>SlackChat.Collections.ChatHistory</code> this is a null collection, this servers for store the chat messages.
</li>
<li>
<code>SlackChat.Collections.HistoryCollection</code> this is a server side collection, that stores old-users chat reference, everytime a new chat is created, a new entry is stored on the server side with the <code>customerId</code> and <code>channelId</code>
</li>
</ul>


## TODO.

<ul>
 <li>
  Make archiveChannel option works, so each time the client leaves the app the current chat will be archived, and if he came back we just un-archive the channel
 </li>
</ul>

## Main Contributors

<ul>
 <li>
  Ethan Escareño ([Ethaan](https://github.com/Ethaan))
 </li>
</ul>
