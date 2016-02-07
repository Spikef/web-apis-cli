/**
 * Usage: 管理员添加,删除等操作
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

require('../libs/enhance');
require('colors');

var program = require('commander');

program
    .command('admin <action> [username] [password] [level]')
    .action(function(action, username, password, level) {
        var result = {
            success: false,
            message: '方法不正确!'
        };

        var admin = require('../libs/admin');

        switch (action) {
            case 'add':
                result = admin.add(username, password, level);

                break;
            case 'modify':
                result = admin.modify(username, password, level);

                break;
            case 'remove':
                result = admin.remove(username);

                break;
            case 'login':
                result = admin.login(username, password);

                break;
            case 'check':
                result = admin.checkAdmin(username, password);

                break;
        }

        if ( result.success ) {
            console.log( result.message.green );
        } else {
            console.log( result.message.red );
        }
    });