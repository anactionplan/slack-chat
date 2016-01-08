Package.describe({
  name: 'anactionplan:slack-chat',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('random@1.0.5');
  api.use([
    'deps',
    'ecmascript',
    'templating',
    'mongo',
    'underscore',
    'check',
    'reactive-dict'
  ]);

  api.use([
    'khamoud:slack-api@0.0.1'
  ], 'server');

  api.addFiles([
    'both/namespace.js',

    'both/collections/history.js'
  ]);

  api.addFiles([
    //Utils.
    'client/utils/utils.js',

    'client/views/slack-window-chat.html',
    'client/views/slack-window-chat.js',
    'client/views/slack-window-chat.css'
  ], 'client');

  api.addFiles([
    'server/publications/history.js',
    'server/allows/history.js',
    'server/methods.js'
  ], 'server');

  api.export([
    'SlackAPI',
    'Slack'
  ],'server');

  api.export([
    'SlackChat'
  ]); //both
});
