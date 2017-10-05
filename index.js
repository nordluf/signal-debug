'use strict';
const debug = require('debug');
const prefixes = [];
const enabledPrefixes = [];
let enabled = false;

module.exports = (argsPrefix, argsOptions) => {
  const prefix = argsPrefix || 'default';
  argsOptions = argsOptions || {};
  const options = {
    startWithDebug: !!argsOptions.startWithDebug || false,
    errorsEnabled: !!argsOptions.errorsEnabled || false
  };

  const logFn = debug(prefix);
  const logErrFn = debug(prefix);
  logFn.log = console.log.bind(console);
  if (options.errorsEnabled){
    logErrFn.enabled=true;
  }

  ~prefixes.indexOf(prefix) || prefixes.push(prefix);

  if (options.startWithDebug) {
    ~enabledPrefixes.indexOf(prefix) || enabledPrefixes.push(prefix);
    if (enabled) {
      debug.enable(prefixes.join(','));
    } else {
      debug.enable(enabledPrefixes.join(','));
    }
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

process.on('SIGUSR2', () => {
  enabled = !enabled;

  console.error(`DEBUG MODE ${enabled ? 'ENABLED' : 'DISABLED'}`);
});