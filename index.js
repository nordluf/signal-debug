'use strict';
const debug = require('debug');
const prefixes = [];
const enabledPrefixes = [];
const errorFuncs = [];
let enabled = false;

module.exports = (argsPrefix, argsOptions) => {
  const prefix = argsPrefix || 'default';
  argsOptions = argsOptions || {};
  const options = {
    startWithDebug: !!argsOptions.startWithDebug || false,
    errorsEnabled: !!argsOptions.errorsEnabled || false
  };

  const logFnLog = debug(prefix);
  const logFnInfo = debug(prefix);
  const logFnWarn = debug(prefix);
  const logFnDebug = debug(prefix);
  const logFnError = debug(prefix);

  logFnLog.color = 2;
  logFnInfo.color = 3;
  logFnWarn.color = 4;
  logFnDebug.color = 0;
  logFnError.color = 1;

  logFnDebug.log =
    logFnWarn.log =
      logFnInfo.log =
        logFnLog.log = console.log.bind(console);

  if (options.errorsEnabled) {
    logFnError.enabled = true;
    errorFuncs.push(logFnError);
  }

  ~prefixes.indexOf(prefix) || prefixes.push(prefix);

  if (options.startWithDebug) {
    ~enabledPrefixes.indexOf(prefix) || enabledPrefixes.push(prefix);
    if (!enabled) {
      debug.enable(enabledPrefixes.join(','));
    }
  }
  if (enabled) {
    debug.enable(prefixes.join(','));
  }

  const obj = {
    log: logFnLog,
    info: logFnInfo,
    warn: logFnWarn,
    debug: logFnDebug,
    error: logFnError
  };

  obj.func = (clb) => {
    return logFnLog.enabled && clb(obj);
  };

  return obj;
};

function listener () {
  enabled = !enabled;

  console.error(`DEBUG MODE ${enabled ? 'ENABLED' : 'DISABLED'}`);
  if (enabled) {
    debug.enable(prefixes.join(','));
  } else {
    debug.enable(enabledPrefixes.join(','));
    errorFuncs.forEach((logErrFn) => {
      logErrFn.enabled = true;
    });
  }
}

process.on('SIGUSR2', listener);

module.exports.cleanup = () => {
  process.removeListener('SIGUSR2', listener);
};
