import { debug } from 'debug'

const prefixes: string[] = []
const enabledPrefixes: string[] = []
const errorFuncs: debug.Debugger[] = []
let enabled = false

interface Options {
  startWithDebug: boolean;
  errorsEnabled: boolean;
}

type clbFunc = <T>(clb: (obj: logObj) => T) => T

interface logObj {
  log: debug.Debugger;
  info: debug.Debugger;
  warn: debug.Debugger;
  debug: debug.Debugger;
  error: debug.Debugger;
  func: clbFunc;
}

export = logger

function logger (argsPrefix: string, argsOptions: Options) {
  if (typeof argsPrefix === 'object' && argsPrefix !== null) {
    argsOptions = argsPrefix
    argsPrefix = 'default'
  }
  let prefix = (argsPrefix && argsPrefix.toString()) || 'default'
  if (/[^\w\d_:-]/ig.test(prefix)) {
    console.error('WARNING: prefix contains unsupported symbols. They are stripped. Only /[^\\w\\d_:-]/ allowed')
    prefix = prefix.replace(/[^\w\d_:-]/ig, '')
  }

  argsOptions = argsOptions || {}
  const options = {
    startWithDebug: !!argsOptions.startWithDebug || false,
    errorsEnabled: !!argsOptions.errorsEnabled || false
  }

  const logFnLog = debug(prefix)
  const logFnError = debug(prefix)

  logFnLog.log = console.log

  if (options.errorsEnabled) {
    logFnError.enabled = true
    errorFuncs.push(logFnError)
  }

  if (!prefixes.includes(prefix)) {
    prefixes.push(prefix)
  }

  if (options.startWithDebug) {
    if (!enabledPrefixes.includes(prefix)) {
      enabledPrefixes.push(prefix)
    }
    if (!enabled) {
      debug.enable(enabledPrefixes.join(','))
    }
  }
  if (enabled) {
    debug.enable(prefixes.join(','))
  }

  const obj: logObj = {
    log: logFnLog,
    info: logFnLog,
    warn: logFnLog,
    debug: logFnLog,
    error: logFnError,
    func: (() => {}) as clbFunc
  }

  obj.func = (clb: Function) => {
    return logFnLog.enabled && clb(obj)
  }

  return obj
}

logger.debug = logger

function listener (signal: NodeJS.Signals) {
  const { forceEnable = false, forceDisable = false } = typeof signal === 'object' ? signal : {}
  if (forceEnable && forceDisable) {
    throw new Error('Illegal mix of forceEnable && forceDisable')
  }
  enabled = forceEnable ? true : forceDisable ? false : !enabled

  console.error(`DEBUG MODE ${enabled ? 'ENABLED' : 'DISABLED'}`)
  if (enabled) {
    debug.enable(prefixes.join(','))
  } else {
    debug.enable(enabledPrefixes.join(','))
    errorFuncs.forEach((logErrFn) => {
      logErrFn.enabled = true
    })
  }
}

process.on('SIGUSR2', listener)

logger.cleanup = () => {
  process.removeListener('SIGUSR2', listener)
}
