#!/usr/bin/env node

require('../libs/enhance');
require('colors');

var program = require('commander');

program
    .version(require('../package.json').version, '-v, --version')
    .parse(process.argv);

require('./admin');
require('./option');
require('./server');
require('./website');

program.parse(process.argv);