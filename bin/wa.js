#!/usr/bin/env node

require('../libs/enhance.js');
require('colors');

var program = require('commander');

program
    .version(require('../package.json').version, '-v, --version')
    .parse(process.argv);

require('./option');
require('./server');
require('./website');

program.parse(process.argv);