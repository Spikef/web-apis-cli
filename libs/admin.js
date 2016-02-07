var fs = require('fs');
var path = require('path');
var encrypt = require('./encrypt');

var site = process.site();
var file = path.resolve(site, 'config.json');

exports.add = function(username, password, userRank) {
    var config = require(file);
    var admins = config.admin;
    var result = { success: false, message: '添加失败!' };

    if ( !username || !password || !userRank ) {
        result.message = '缺少必要的参数!';
        return result;
    }

    userRank = Number(userRank);
    if ( ![1, 2, 3].includes(userRank) ) {
        result.message = '管理员级别不正确!';
        return result;
    }

    if ( admins[username] ) {
        result.message = '管理员已存在!';
        return result;
    }

    var mixed = confuse(password);
    var admin = {
        username: username,
        password: mixed.mixChar,
        randSeed: mixed.hashKey,
        userRank: userRank
    };

    return saveAdmin(admin);
};

exports.modify = function(username, password, userRank) {
    var config = require(file);
    var admins = config.admin;
    var result = { success: false, message: '修改失败!' };

    if ( !username || !userRank ) {
        result.message = '缺少必要的参数!';
        return result;
    }

    userRank = Number(userRank);
    if ( ![1, 2, 3].includes(userRank) ) {
        result.message = '管理员级别不正确!';
        return result;
    }

    if ( !admins[username] ) {
        result.message = '管理员不存在!';
        return result;
    }

    var admin = admins[username];
    admin.userRank= userRank;

    if ( password ) {
        var mixed = confuse(password);
        admin.password = mixed.mixChar;
        admin.randSeed = mixed.hashKey;
    }

    return saveAdmin(admin);
};

exports.remove = function(username) {
    var config = JSON.parse(fs.readFileSync(file, 'utf8'));
    var admins = config.admin;
    var result = { success: false, message: '登录失败!' };

    if ( !username ) {
        result.message = '缺少必要的参数!';
        return result;
    }

    if ( !admins[username] ) {
        result.message = '用户不存在!';
        return result;
    }

    delete admins[username];

    fs.writeFileSync(file, JSON.format(config), 'utf8');

    return {
        success: true,
        message: '成功删除管理员 [' + username + '].'
    }
};

exports.login = function(username, password) {
    var config = require(file);
    var admins = config.admin;
    var result = { success: false, message: '登录失败!' };

    if ( !username || !password ) {
        result.message = '缺少必要的参数!';
        return result;
    }

    if ( !admins[username] ) {
        result.message = '用户不存在!';
        return result;
    }

    var admin = admins[username];

    if ( encrypt.mix(password, admin.randSeed) === admin.password ) {
        var mixed = confuse(password);
        admin.password = mixed.mixChar;
        admin.randSeed = mixed.hashKey;

        saveAdmin(admin);

        return {
            success: true,
            message: '登录成功!',
            admin: {
                name: admin.username,
                rank: admin.userRank,
                userKey: encrypt.sha1(admin.randSeed + config.app.seed),
                userToken: encrypt.sha1(admin.password + config.app.seed)
            }
        }
    } else {
        result.message = '登录失败, 密码错误!';
        return result;
    }
};

exports.checkAdmin = function(key, token) {
    var config = require(file);
    var admins = config.admin;
    var result = { success: false, message: '授权失败!' };

    if ( !key || !token ) {
        result.message = '缺少必要的参数!';
        return result;
    }

    for (var i in admins) {
        var admin = admins[i];
        var userKey = encrypt.sha1(admin.randSeed + config.app.seed);
        var userToken = encrypt.sha1(admin.password + config.app.seed);

        if ( userKey === key && userToken === token ) {
            return {
                success: true,
                message: '授权成功!'
            }
        }
    }

    return result;
};

function saveAdmin(admin) {
    try{
        var config = JSON.parse(fs.readFileSync(file, 'utf8'));
        var admins = config.admin;

        admins[admin.username] = admin;

        fs.writeFileSync(file, JSON.format(config), 'utf8');

        return {
            success: true,
            message: '成功保存管理员 [' + admin.username + '].'
        }
    } catch(e) {
        return {
            success: false,
            message: e.message
        }
    }
}

function confuse(password) {
    var hashKey = encrypt.hashKey();
    var mixChar = encrypt.mix(password, hashKey);

    return { hashKey: hashKey, mixChar: mixChar };
}