'use strict';
const debug = require('debug');

module.exports = (argsPrefix, argsOptions) => {
  const prefix = argsPrefix || 'default';
  argsOptions = argsOptions || {};
  const options = {
    startWithDebug: !!argsOptions.startWithDebug || false,
    coloredOutput: !!argsOptions.coloredOutput || false
  };

  const logFn = debug(prefix);
  const logErrFn = debug(prefix);
  logFn.log = console.log.bind(console); // don't forget to bind to console!

  if (options.startWithDebug) {
    debug.enable(prefix);
  }
  const obj = {
    log: logFn,
    info: logFn,
    local: logFn,
    debug: logFn,
    error: logErrFn
  };

  obj.func = (clb) => {
    return logFn.enabled && clb(obj);
  };

  return obj;
};
