var fs = require('fs');
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

    var file = path.resolve(site, 'config.json');
    var save = path.resolve(site, 'APIs/' + alias + '.json');
    var list = require(file);

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

    var file = path.resolve(site, 'config.json');
    var save = path.resolve(site, 'APIs/' + alias + '.json');
    var list = require(file);

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

function isURL(url){
    var re = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
    return re.test(url);
}