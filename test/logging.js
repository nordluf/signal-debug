'use strict';
const logger = require('../');
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
  it('Default prefix no output', (done) => {
    const log = logger();
    stderr = stdout = '';
    log.debug('12');
    log.error('err message');
    assert.equal(stdout, '');
    assert.equal(stderr, '');
    done();
  });

  it('Default prefix .func no output', (done) => {
    const log = logger();
    stderr = stdout = '';
    log.func((logobj) => {
      logobj.log(12);
    });
    // log.error('err message');
    assert.equal(stdout, '');
    assert.equal(stderr, '');
    done();
  });

  it('Default prefix with default debug output', (done) => {
    const log = logger(null, {startWithDebug: true});
    stderr = stdout = '';
    log.debug('12');
    log.error('err message');
    const stdoutEnding = stdout.substr(-11);
    const stderrEnding = stderr.substr(-20);
    assert.equal(stdoutEnding, 'default 12\n');
    assert.equal(stderrEnding, 'default err message\n');
    done();
  });

  it('Default prefix .func with default debug output', (done) => {
    const log = logger(null, {startWithDebug: true});
    stderr = stdout = '';
    log.func((logobj) => {
      logobj.log(12);
    });
    const stdoutEnding = stdout.substr(-11);
    assert.equal(stdoutEnding, 'default 12\n');
    done();
  });
});
