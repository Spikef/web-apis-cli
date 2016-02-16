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

    var bodies = [];
    req.body.bodies.forEach(function(body) {
        bodies.push(body.key + '=' + body.value);
    });

    var header = {};
    req.body.header.forEach(function(head) {
        if ( !header[head.key] ) {
            header[head.key] = head.value;
        } else if ( header[head.key] instanceof Array ) {
            header[head.key].push(head.value);
        } else {
            header[head.key] = [header[head.key]];
            header[head.key].push(head.value);
        }
    });

    header['Content-Type'] = 'application/x-www-form-urlencoded';

    var fetch = require('node-fetch');

    var promise = fetch(req.body.url, {
        timeout: 20000,
        method : req.body.method,
        headers: header,
        body   : bodies.join('&')
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
    data.querys = req.body.querys || [];
    data.header = req.body.header || [];
    data.bodies = req.body.bodies || [];

    data.querys.forEach(function(query) {
        query.hidden = query.hidden && query.hidden !== 'false' || false;
        query.readonly = query.readonly && query.readonly !== 'false' || false;
    });

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
    data.querys = req.body.querys || [];
    data.header = req.body.header || [];
    data.bodies = req.body.bodies || [];

    data.querys.forEach(function(query) {
        query.hidden = query.hidden && query.hidden !== 'false' || false;
        query.readonly = query.readonly && query.readonly !== 'false' || false;
    });

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
    var APIs = req.body.api_list || {};
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

exports.isNameAllow = function(req, res) {
    var result = { success: false };
    var username = req.body.username;

    var admin = require('./admin');
    var check = admin.checkAdmin(req.headers["user-key"], req.cookies.userToken);
    if ( !check.success ) {
        result.message = '没有完成操作所需要的权限!';
        return result;
    }

    if ( !username || !/^[A-Z0-9_\-]{2,40}$/i.test(username) ) {
        result.message = '不正确的用户名格式!';
        return result;
    }

    var list = admin.list();
    if ( list[username] ) {
        result.message = '用户已存在!';
        return result;
    }

    return {
        success: true,
        message: '可以使用的用户名.'
    }
};

exports.saveAdmin = function(req, res) {
    var result = { success: false }, GoToHome = false;

    var action = req.query.action;
    if ( !['add', 'modify'].contains(action) ) {
        result.message = '非法请求!';
        result.tipArea = 'result';
        return result;
    }

    var username = req.body.username;
    var password = req.body.password;
    var userRank = Number(req.body.userRank) || 1;
    var userPass = req.body.userPass;

    if ( !userPass ) {
        result.message = '请输入您的管理员密码!';
        result.tipArea = 'userPass';
        return result;
    }

    var admin = require('./admin');
    var allow = admin.checkAdmin(req.headers["user-key"], req.cookies.userToken);
    if ( !allow.success ) {
        result.message = '没有完成操作所需要的权限!';
        result.tipArea = 'result';
        return result;
    } else {
        if ( allow.admin.name === username ) {
            userRank = allow.admin.rank;

            if ( action === 'modify' && password ) GoToHome = true;
        } else if ( allow.admin.rank >= userRank ) {
            result.message = '没有足够的权限操作该级别管理员!';
            result.tipArea = 'result';
            return result;
        }

        allow = admin.checkPassword(allow.admin.name, userPass);
        if ( !allow.success ) {
            result.message = '错误的管理员密码!';
            result.tipArea = 'userPass';
            return result;
        }
    }

    if ( !username || !/^[A-Z0-9_\-]{2,40}$/i.test(username) ) {
        result.message = '不正确的用户名格式!';
        result.tipArea = 'username';
        return result;
    }

    var list = admin.list();
    if ( action === 'add' && list[username] ) {
        result.message = '用户已存在!';
        result.tipArea = 'username';
        return result;
    }
    if ( action === 'modify' && !list[username] ) {
        result.message = '用户不存在!';
        result.tipArea = 'username';
        return result;
    }

    if ( action === 'add' && !password ) {
        result.message = '未输入管理员密码!';
        result.tipArea = 'password';
        return result;
    }

    if ( password && !/^.{6,16}/.test(password) ) {
        result.message = '不正确的密码格式!';
        result.tipArea = 'password';
        return result;
    }

    if ( action === 'add' ) {
        result = admin.add(username, password, userRank);
    } else {
        result = admin.modify(username, password, userRank);
    }

    if ( !result.success ) {
        result.tipArea = 'result';
    } else {
        result.GoToHome = GoToHome;
    }

    return result;
};

exports.removeAdmin = function(req, res) {
    var result = { success: false };

    var username = req.body.username;
    var userPass = req.body.userPass;

    if ( !userPass ) {
        result.message = '请输入您的管理员密码!';
        result.tipArea = 'userPass';
        return result;
    }

    var admin = require('./admin');
    var allow = admin.checkAdmin(req.headers["user-key"], req.cookies.userToken);
    if ( !allow.success ) {
        result.message = '没有完成操作所需要的权限!';
        return result;
    } else {
        var list = admin.list();
        if ( list[username] && list[username].userRank <= allow.admin.rank ) {
            result.message = '没有完成操作所需要的权限!';
            return result;
        }

        allow = admin.checkPassword(allow.admin.name, userPass);
        if ( !allow.success ) {
            result.message = '错误的管理员密码!';
            return result;
        }
    }

    return admin.remove(username);
};

function isURL(url){
    var re = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
    return re.test(url);
}