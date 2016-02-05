/**
 * Usage: 启动一个网站服务
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

require('../libs/enhance.js');
require('colors');

var path = require('path');
var program = require('commander');
var express = require('express');

var clip = require('../libs/clipboard');
var render = require('../libs/render');
var service = require('../libs/service');

program
    .command('start')
    .action(function() {
        var site = process.site();

        var app = express();

        var bodyParser = require('body-parser');

        app.use(bodyParser.json());                         // for parsing application/json
        app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

        app.use('/resource/', express.static(site + '/template/resource'));

        app.get(/^\/(index|index\.html)?$/i, function(req, res) {
            var html = render({
                router: render.routers.index
            });
            sendHtml(res, html);
        });

        app.get(/^\/(api_add|api_add\.html)?$/i, function(req, res) {
            var html = render({
                router: render.routers.api_add
            });
            sendHtml(res, html);
        });

        app.get(/^\/api(\/([\w\-\.\(\)]+))?(\.html)?$/i, function(req, res) {
            var html = render({
                second: true,
                router: render.routers.api,
                alias: req.params[1]
            });
            sendHtml(res, html);
        });

        app.use(/^\/service\/([\w\-\.\(\)]+)\/?$/i, function(req, res) {
            res.header({
                'Allow': 'POST',
                'Content-Type': 'application/json; charset=utf-8'
            });

            var wait = false;
            var result = {
                success: false
            };

            if ( req.method === 'POST' ) {
                var action = req.params[0];
                var fn = service[action];

                if ( fn ) {
                    result = fn.call(service, req);

                    if ( result.success ) {
                        if ( action === 'sendRequest' ) {
                            wait = true;

                            result.promise.then(function(response) {
                                response.text().then(function(body) {
                                    var type = 'text';

                                    try {
                                        body = JSON.parse(body);
                                        type = 'json';
                                    }catch (e) {}

                                    res.status(response.status);
                                    res.send({
                                        success: true,
                                        message: response.statusText,
                                        headers: response.headers.raw(),
                                        type: type,
                                        body: body
                                    });
                                });
                            }).catch(function(e) {
                                res.status(500);
                                res.send({
                                    success: false,
                                    message: e.message,
                                    headers: [],
                                    type: 'text',
                                    body: ''
                                });
                            });
                        } else {
                            res.status(200);
                        }
                    } else {
                        res.status(500);
                    }
                } else {
                    result.message = '未找到请求接口.';
                    res.status(404);
                }
            } else {
                result.message = '只允许使用POST提交.';
                res.status(405);
            }

            if ( !wait ) {
                res.send(result);
            }
        });

        app.get('*', function(req, res) {
            var html = render('404');
            res.status(404).send(html);
        });

        var cfg = require(path.resolve(site, 'config.json'));
        var port = cfg.app && cfg.app.port ? Number(cfg.app.port) : 8831;

        app.listen(port, function () {
            clip('http://localhost:' + port);
            console.log('打开浏览器访问 http://localhost:%s'.green, port);
        });

        function sendHtml(res, html) {
            if ( html.length === 0 ) {
                html = render('404');
                res.status(404).send(html);
            } else {
                res.send(html);
            }
        }
    });