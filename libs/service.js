var fs = require('fs');
var fm = require('../libs/fs-more');
var path = require('path');

exports.sendRequest = function(req) {
    var site = process.site();

    var result = {
        success: false
    };

    if ( !isURL(req.body.url) ) {
        result.message = '非法的请求地址.';
        return result;
    }

    req.body.header = req.body.header || [];
    req.body.bodies = req.body.bodies || [];

    var fetch = require('node-fetch');

    var promise = fetch(req.body.url, {
        timeout: 20000,
        method: req.body.method,
        body: req.body.bodies.join('&')
    });

    return {
        success: true,
        promise: promise
    }
};

exports.addApi = function(req) {
    var site = process.site();

    var result = {
        success: false
    };

    var name = req.body.name;
    var alias = req.body.alias;

    if ( !name || !alias ) {
        result.message = '未指定接口' + (!name ? '名称!' : '别名!');
        return result;
    }

    if ( !isURL(req.body.url) ) {
        result.message = '非法的请求地址.';
        return result;
    }

    var admin = require('./admin');
    var check = admin.checkAdmin(req.headers["user-key"], req.cookies.userToken);
    if ( !check.success ) {
        result.message = '没有完成操作所需要的权限!';
        return result;
    }

    var file = path.resolve(site, 'config.json');
    var save = path.resolve(site, 'APIs/' + alias + '.json');
    var list = JSON.parse(fs.readFileSync(file, 'utf8'));

    if ( list.api[alias] && fs.existsSync(save) ) {
        result.message = '别名已存在,请指定新的别名!';
        return result;
    }

    list.api[alias] = name;

    var data = {};
    data.alias = alias;
    data.url = req.body.url;
    data.method = req.body.method;
    data.header = req.body.header || [];
    data.bodies = req.body.bodies || [];

    fs.writeFileSync(file, JSON.format(list), 'utf8');
    fs.writeFileSync(save, JSON.format(data), 'utf8');

    return {
        success: true,
        message: '接口[' + name + ']已成功保存,请刷新页面查看.'
    }
};

exports.modifyApi = function(req) {
    var site = process.site();

    var result = {
        success: false
    };

    var name = req.body.name;
    var alias = req.body.alias;

    if ( !name || !alias ) {
        result.message = '未指定接口' + (!name ? '名称!' : '别名!');
        return result;
    }

    if ( !isURL(req.body.url) ) {
        result.message = '非法的请求地址.';
        return result;
    }

    var admin = require('./admin');
    var check = admin.checkAdmin(req.headers["user-key"], req.cookies.userToken);
    if ( !check.success ) {
        result.message = '没有完成操作所需要的权限!';
        return result;
    }

    var file = path.resolve(site, 'config.json');
    var save = path.resolve(site, 'APIs/' + alias + '.json');
    var list = JSON.parse(fs.readFileSync(file, 'utf8'));

    if ( !list.api[alias] && !fs.existsSync(save) ) {
        result.message = '别名不存在,无法修改!';
        return result;
    }

    list.api[alias] = name;

    var data = {};
    data.alias = alias;
    data.url = req.body.url;
    data.method = req.body.method;
    data.header = req.body.header || [];
    data.bodies = req.body.bodies || [];

    fs.writeFileSync(file, JSON.format(list), 'utf8');
    fs.writeFileSync(save, JSON.format(data), 'utf8');

    return {
        success: true,
        message: '接口[' + name + ']已成功保存,请刷新页面查看.'
    }
};

exports.saveApiList = function(req, res) {
    var site = process.site();

    var result = {
        success: false
    };

    var admin = require('./admin');
    var check = admin.checkAdmin(req.headers["user-key"], req.cookies.userToken);
    if ( !check.success && !check.admin.rank <=2 ) {
        result.message = '没有完成操作所需要的权限!';
        return result;
    }

    var file = path.resolve(site, 'config.json');
    var list = JSON.parse(fs.readFileSync(file, 'utf8'));
    var APIs = req.body.api_list;
    var arrs = [];

    Object.keys(list.api).forEach(function(alias) {
        if ( !/^\-{3,}$/.test(list.api[alias]) && !APIs[alias] ) {
            arrs.push(alias);
        }
    });

    arrs.forEach(function(alias) {
        var save = path.resolve(site, 'APIs/' + alias + '.json');
        if ( fs.existsSync(save) ) {
            fs.unlinkSync(save);
        }
    });

    list.api = APIs;

    fs.writeFileSync(file, JSON.format(list), 'utf8');

    return {
        success: true,
        message: '接口列表已成功保存,请刷新页面查看.'
    }
};

exports.login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    var admin = require('./admin');
    var result = admin.login(username, password);

    if ( result.success ) {
        var expire = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180);
        res.cookie('userKey', result.admin.userKey, { expires: expire, httpOnly: false });
        res.cookie('userToken', result.admin.userToken, { expires: expire, httpOnly: true });
    }

    return result;
};

function isURL(url){
    var re = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
    return re.test(url);
}