'use strict';

var
  tt = require('tape'),
  metalsmith = require('metalsmith'),
  server = require('../lib/server');

tt('server instantiation', function startupTest(t) {
  t.plan(2);

  t.doesNotThrow(server);

  var _server = server();
  t.ok(_server);

});

