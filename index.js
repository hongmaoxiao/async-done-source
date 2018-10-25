'use strict';

var domain = require('domain');
var EE = require('events').EventEmitter;

function asyncDone(fn, done) {
  function onSuccess() {
    return done(undefined, result);
  }

  function onError(err) {
    return done(err);
  }

  var d = domain.create();
  d.on('error', onError);
  var domainBoundFn = d.bind(fn);

  function asyncRunner() {
    var result = domainBoundFn(onError);

    if (result && result instanceof EE) {
      d.add(result);
      result.once('end', onSuccess).once('close', onSuccess);
      return;
    }

    if (result && typeof result.then === 'function') {
      result.then(onSuccess, onError);
      return;
    }

    if (fn.length === 0) {
      done(undefined, result);
    }
  }

  process.nextTick(asyncRunner);
}

module.exports = asyncDone;
