/**
 * Usage: 修改网站配置
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

require('../libs/enhance');
require('colors');

var fs = require('fs');
var path = require('path');
var program = require('commander');

program
    .command('port [port]')
    .action(function(port) {
        if ( !/^\d{4,}$/.test(port) ) {
            console.log('端口号只能为4位以上的数字!'.red);
            return;
        }

        var site = process.site();
        var config = path.resolve(site, 'config.json');
        var cfg = require(config);

        cfg.app.port = Number(port);

        fs.writeFileSync(config, JSON.format(cfg), 'utf8');

        console.log('成功设置端口为: %s.'.green, port);
    });

program
    .command('title [title]')
    .action(function(title) {
        if ( !/^\w+$/.test(title) ) {
            console.log('标题不能为空!'.red);
            return;
        }

        var site = process.site();
        var config = path.resolve(site, 'config.json');
        var cfg = require(config);

        cfg.app.title = String(title);

        fs.writeFileSync(config, JSON.format(cfg), 'utf8');

        console.log('成功设置标题为: %s.'.green, title);
    });