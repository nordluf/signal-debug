'use strict';
let logger;
const debug = require('debug');
const assert = require('assert');

let stdout = '';
let stderr = '';

// Hack to actually sniff output
process.stdout.write = ((write) => {
  return function (string) {
    stdout += string;
    write.apply(process.stdout, arguments);
  };
})(process.stdout.write);
process.stderr.write = ((write) => {
  return function (string) {
    stderr += string;
    write.apply(process.stderr, arguments);
  };
})(process.stderr.write);

describe('Logging actually happens', () => {
  before(function () {
    logger = require('../index.js');
  });

  it('Default prefix no output', () => {
    const log = logger();
    stderr = stdout = '';
    log.debug('12');
    log.error('err message');
    assert.equal(stdout, '');
    assert.equal(stderr, '');
  });

  it('Default prefix .func no output', () => {
    const log = logger();
    stderr = stdout = '';
    log.func((logobj) => {
      logobj.log(12);
      throw new Error('This should never happens');
    });
    assert.equal(stdout, '');
    assert.equal(stderr, '');
  });

  it('Default prefix with default debug output', () => {
    const log = logger(null, {startWithDebug: true});
    stderr = stdout = '';
    log.debug('12');
    log.error('err message');
    const stdoutEnding = stdout.substr(25); // clenaup timestamp in the begining of the line
    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdoutEnding, 'default 12\n');
    assert.equal(stderrEnding, 'default err message\n');
  });

  it('Default prefix .func with default debug output', () => {
    const log = logger(null, {startWithDebug: true});
    stderr = stdout = '';
    log.func((logobj) => {
      logobj.log(12);
    });
    const stdoutEnding = stdout.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdoutEnding, 'default 12\n');
  });

  it('Multiple prefixes with output', () => {
    const log1 = logger('customprefix1');
    const log2 = logger('customprefix2', {startWithDebug: true});
    const log3 = logger('customprefix3', {startWithDebug: true});
    const log4 = logger('customprefix4');
    stdout = '';
    log1.debug('12');
    log2.debug('23');
    log3.debug('34');
    log4.debug('45');
    // clenaup timestamp in the begining of the line
    const stdoutEndings = stdout.trim().split('\n').map(i => i.substr(25));
    assert.deepEqual(stdoutEndings, ['customprefix2 23', 'customprefix3 34']);
  });

  it('Enabled by default errors outputs, actualy', () => {
    const log = logger('errprefix', {errorsEnabled: true});
    stderr = stdout = '';
    log.debug('12');
    log.error('actual error');
    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdout, '');
    assert.equal(stderrEnding, 'errprefix actual error\n');
  });

  after(() => {
    logger.cleanup();
    delete require.cache[require.resolve('../index.js')];
    debug.disable('*');
  });
});

describe('Signals processing', () => {
  let log1;
  let log2;
  let log3;

  before(function () {
    logger = require('../index.js');
    log1 = logger();
    log2 = logger('customprefix', {startWithDebug: true});
    log3 = logger('errprefix', {errorsEnabled: true});
  });

  it('No output before signal', () => {
    stderr = stdout = '';
    log1.debug('12');
    log1.error('23');
    assert.equal(stdout, '');
    assert.equal(stderr, '');
  });

  it('Allowed output happens before signal', () => {
    stderr = stdout = '';
    log2.debug('12');
    log2.error('23');
    const stdoutEnding = stdout.substr(25); // clenaup timestamp in the begining of the line
    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdoutEnding, 'customprefix 12\n');
    assert.equal(stderrEnding, 'customprefix 23\n');
  });

  it('Allowed errors shows before signal', () => {
    stderr = stdout = '';
    log3.debug('12');
    log3.error('23');

    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdout, '');
    assert.equal(stderrEnding, 'errprefix 23\n');
  });

  it('Signal enables debug', (done) => {
    stderr = stdout = '';
    process.kill(process.pid, 'SIGUSR2');

    // To give some CPU to signal handling
    setTimeout(function () {
      assert.equal(stdout, '');
      assert.equal(stderr, 'DEBUG MODE ENABLED\n');
      done();
    }, 100);
  });

  it('After signal logging works for disabled logger', () => {
    stderr = stdout = '';
    log1.debug('12');
    log1.error('err message');
    const stdoutEnding = stdout.substr(25); // clenaup timestamp in the begining of the line
    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdoutEnding, 'default 12\n');
    assert.equal(stderrEnding, 'default err message\n');
  });

  it('After signal logging works for enabled logger', () => {
    stderr = stdout = '';
    log2.debug('12');
    log2.error('err message');
    const stdoutEnding = stdout.substr(25); // clenaup timestamp in the begining of the line
    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdoutEnding, 'customprefix 12\n');
    assert.equal(stderrEnding, 'customprefix err message\n');
  });

  it('After signal logging works for errorsOnly logger', () => {
    stderr = stdout = '';
    log3.debug('12');
    log3.error('err message');
    const stdoutEnding = stdout.substr(25); // clenaup timestamp in the begining of the line
    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdoutEnding, 'errprefix 12\n');
    assert.equal(stderrEnding, 'errprefix err message\n');
  });

  it('Signal disables debug', (done) => {
    stderr = stdout = '';
    process.kill(process.pid, 'SIGUSR2');

    // To give some CPU to signal handling
    setTimeout(function () {
      assert.equal(stdout, '');
      assert.equal(stderr, 'DEBUG MODE DISABLED\n');
      done();
    }, 100);
  });

  it('No output after signal', () => {
    stderr = stdout = '';
    log1.debug('12');
    log1.error('23');
    assert.equal(stdout, '');
    assert.equal(stderr, '');
  });

  it('Allowed output happens after signal', () => {
    stderr = stdout = '';
    log2.debug('12');
    log2.error('23');
    const stdoutEnding = stdout.substr(25); // clenaup timestamp in the begining of the line
    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdoutEnding, 'customprefix 12\n');
    assert.equal(stderrEnding, 'customprefix 23\n');
  });

  it('Allowed errors shows after signal', () => {
    stderr = stdout = '';
    log3.debug('12');
    log3.error('23');

    const stderrEnding = stderr.substr(25); // clenaup timestamp in the begining of the line
    assert.equal(stdout, '');
    assert.equal(stderrEnding, 'errprefix 23\n');
  });
});
