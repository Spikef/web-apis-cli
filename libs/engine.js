/**
 * Usage: 数据管理类，返回相应数据
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

var fs = require('fs');
var path = require('path');

var site = process.site();
var cfg = path.resolve(site, 'config.json');

exports.methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLINK', 'PURGE'];

exports.app = function() {
    var config = require(path.resolve(site, 'config.json'));
    return config.app || {};
};

exports.api = function(alias) {
    var file = path.resolve(site, 'APIs/' + alias + '.json');

    if ( !fs.existsSync(file) ) {
        return false;
    }

    var list = exports.list();

    var data = JSON.parse(fs.readFileSync(file, 'utf8'));

    data.name = list[alias];

    return data;
};

exports.list = function() {
    var config = JSON.parse(fs.readFileSync(cfg, 'utf8'));
    return config.api;
};

exports.admins = function() {
    var NamedRanks = require('./admin').NamedRanks;

    var list = [];
    var config = JSON.parse(fs.readFileSync(cfg, 'utf8'));
    var admins = config.admin;
    for (var i in admins) {
        var rank = NamedRanks[admins[i].userRank];

        list.push({
            username: admins[i].username,
            userRank: admins[i].userRank,
            rankName: rank.name,
            rankNote: rank.note
        });
    }

    return list;
};