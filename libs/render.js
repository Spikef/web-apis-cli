/**
 * Usage: 渲染模板
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var templates = {
    index: 'index.html',
    api: 'api.html',
    api_add: 'api_add.html',
    api_modify: 'api_add.html',
    api_list: 'api_list.html',
    admin_list: 'admin_list.html',
    404: '404.html'
};
var routers = {
    index: 'index',
    api: 'api',
    api_add: 'api_add',
    api_modify: 'api_modify',
    api_list: 'api_list',
    admin_list: 'admin_list',
    404: '404'
};

var render = function(params, options) {
    var site = process.site();

    if (typeof params === 'string') params = {router: params};
    params.template = params.template || templates[params.router];
    if ( !params.template ) return '';
    var template = fs.readFileSync(site + '/template/' + params.template, 'utf8');
    var engine = require('./engine');
    var data = {
        routers: routers,
        methods: engine.methods,
        nav: params.router,
        api: false,
        app: engine.app(),
        list: engine.list()
    };

    var admin = require('./admin');
    var check = admin.checkAdmin(params.userKey, params.userToken);
    data.admin = check.success ? check.admin : false;

    var permission = [
        routers.api_list,
        routers.api_add,
        routers.api_modify,
        routers.admin_list
    ];
    if ( permission.contains(params.router) && !admin ) {
        return '';
    }

    switch (params.router) {
        case routers.api:
        case routers.api_modify:
            data.api = engine.api(params.alias);
            if ( !data.api ) return '';
            break;
    }

    options = options || {};
    options.filename = path.resolve(site, 'template/index.html');

    var html = ejs.render(template, data, options);

    if ( params && params.second ) {
        html = ResolveRelative(html);
    }

    return html;
};

render.compile = ejs.compile;

render.routers = routers;

render.templates = templates;

module.exports = render;

function ResolveRelative(tp) {
    tp = tp.replace(/(\s(href|src)\s*=\s*['"]?)(\.\/)([^\s'"]*)(?=['"]?)/gi, function($0, $1, $2, $3, $4) {
        if ( /^($|(resource)\b)/i.test($4) ) {
            $0 = $1 + '../.' + $3 + $4;
        }

        return $0;
    });

    return tp;
}