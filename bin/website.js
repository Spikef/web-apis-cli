/**
 * Usage: 初始化网站等
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

require('../libs/enhance.js');
require('colors');

var fs = require('fs');
var fm = require('../libs/fs-more');
var path = require('path');
var program = require('commander');

program
    .command('init <name> [title] [port]')
    .action(function(name, title, port) {
        title = title || name;
        port = Number(port) || 8831;

        if (!/^[A-Z0-9_\-]+$/i.test(name) ) {
            console.log('名字只能包含字母、数字或者下划线。');
            process.exit(1)
        }

        var source = path.resolve(__dirname, '../server');
        var target = path.resolve(process.cwd(), name);
        var config = path.resolve(target, 'config.json');

        if (fs.existsSync(target)) {
            console.log('目标文件夹已存在，不允许直接覆盖!'.yellow);
            process.exit(1);
        }

        try{
            fm.copyFolderSync(source, target);
            fs.mkdirSync(path.resolve(target, 'APIs'));

            var cfg = require(config);
            cfg.app = {
                name: name,
                port: port,
                title: title,
                engine: 'WebAPIs',
                version: require('../package.json').version
            };

            fs.writeFileSync(config, JSON.format(cfg), 'utf8');

            console.log('成功创建网站接口服务,请使用 wa start 命令开启访问。'.green);
        } catch(e) {
            fm.removeFolderSync(target);
            console.log('创建网站出错,系统将自动回滚删除文件.'.red);
        }
    });

program
    .command('update')
    .action(function() {
        var source = path.resolve(__dirname, '../server');
        var target = process.cwd();
        var config = path.resolve(target, 'config.json');

        try{
            var cfg = require(config);
            cfg.app.version = require('../package.json').version;

            fm.copyFolderSync(source, target);

            fs.writeFileSync(config, JSON.format(cfg), 'utf8');

            console.log('成功升级网站接口服务,请使用 wa start 命令开启访问。'.green);
        } catch(e) {
            console.log('升级出错: ' + e.message + '.');
        }
    });

program
    .command('local')
    .action(function() {
        var site = process.site();
        console.log('网站位置：' + site.magenta);
    });