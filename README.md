# Logger, starts logging only after USR2 signal

![](https://github.com/nordluf/signal-debug/workflows/Node%20CI/badge.svg)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/semver-semantic%20release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![NPM](https://nodei.co/npm/signal-debug.png)](https://nodei.co/npm/signal-debug/)


Simply send USR2 singal to the node process to enable/disable logging output.

process.emit('SIGUSR2', { forceDisable: true }); to clearly disable logging (doesn't matter if it was enabled or not) 
 
process.emit('SIGUSR2', { forceEnable: true }); to apparently enable logging (doesn't matter if it was enabled or not)
