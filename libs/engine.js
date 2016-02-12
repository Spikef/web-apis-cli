/**
 * Usage: 数据管理类，返回相应数据
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

var fs = require('fs');
var path = require('path');

var site = process.site();

exports.methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLINK', 'PURGE'];

exports.app = function() {
    var configs = require(path.resolve(site, 'config.json'));
    return configs.app || {};
};

exports.api = function(alias) {
    var file = path.resolve(site, 'APIs/' + alias + '.json');

    if ( !fs.existsSync(file) ) {
        return false;
    }

    return require(file);
};

exports.list = function() {
    return require(path.resolve(site, 'config.json')).api;
};