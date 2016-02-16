(function(){
    var HTML = {
        stringify: function(input) {
            return String(input).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    };

    var app = {
        // 初始化状态
        initialStatus: function() {
            if ( $(window).width() < 768 ) {
                $('.post-result-note').empty();
            }
        },
        // 折叠或者展开
        onExpandCollapse: function() {
            var icons = {
                expand: '<i class="fa fa-angle-double-down"></i>',
                collapse: '<i class="fa fa-angle-double-up"></i>'
            };

            $('.expands-or-collapses').on('click', function() {
                var icon = $(this).html();

                if ( /\-up/.test(icon) ) {
                    $(this).html(icons.expand);

                    $(this).parents('.panel:first').find('table:first').hide();
                    $(this).parents('.panel:first').find('.panel-body:first').hide();
                    $(this).parents('.panel:first').find('.panel-footer:first').hide();
                } else {
                    $(this).html(icons.collapse);
                    $(this).parents('.panel:first').find('table:first').show();
                    $(this).parents('.panel:first').find('.panel-body:first').show();
                    $(this).parents('.panel:first').find('.panel-footer:first').show();
                }
            });
        },
        // 请求URL地址
        onUrlChanged: function() {
            var self = this;

            $('#post-url').on('blur', function(){
                if ( $(this).attr('readonly') ) return;

                var oldList = {};
                $('#get-query').find('.query-parametric').each(function(){
                    var key = $(this).find('.input-query-key:first').text();
                    var note = $(this).find('.input-query-note:first').val() || '';
                    var hidden = $(this).find('.input-query-hidden:first').is(':checked');
                    var readonly = $(this).find('.input-query-readonly:first').is(':checked');

                    if ( key ) {
                        oldList[key] = { note: note, hidden: hidden, readonly: readonly };
                    }
                });

                $('#get-query table tbody').empty();

                var arr, queryList = [];
                var url = $(this).val();
                //#符号之后的值称为hash，都不会加到request请求中去
                url = url.split('#')[0];
                //获取queryString 第一个？号后面的全是查询字符串
                arr = url.split('?');
                arr.shift();
                var qStr = arr.join('?');
                var list = self.parseQueryString(qStr);
                var keys = Object.keys(list);

                keys.forEach(function(key) {
                    var query = {};

                    query.key = key;
                    query.note = oldList[key] ? oldList[key].note : '';
                    query.hidden = oldList[key] ? oldList[key].hidden : false;
                    query.readonly = oldList[key] ? oldList[key].readonly : false;

                    queryList.push(query);
                });

                queryList.forEach(function(query) {
                    self.appendParams('query', query);
                });
            });

            $('.input-query-value').on('input propertyChange', function() {
                if ( !self.queryParams ) {
                    var arr, list, host, hash;
                    var url = $('#post-url').val();
                    //#符号之后的值称为hash，都不会加到request请求中去
                    hash = url.indexOf('#') > -1 ? url.substr(url.indexOf('#')) : '';
                    url = url.split('#')[0];
                    //获取queryString 第一个？号后面的全是查询字符串
                    host = url.indexOf('?') > -1 ? url.substr(0, url.indexOf('?')) : url;
                    arr = url.split('?');
                    arr.shift();
                    var qStr = arr.join('?');
                    list = self.parseQueryString(qStr);

                    self.queryParams = {
                        host: host,
                        hash: hash,
                        list: list
                    }
                }

                var key = $(this).attr('data-key');
                var value = $(this).val();

                if ( self.queryParams && typeof self.queryParams.list[key] !== 'undefined' ) {
                    self.queryParams.list[key] = value;

                    var postUrl = self.queryParams.host + '?' + self.joinQueryString(self.queryParams.list) + self.queryParams.hash;
                    $('#post-url').val(postUrl);
                }
            });
        },
        // 请求body和header
        onReqDataSwitch: function() {
            $('#check-bodies').on('click', function(){
                if ( this.checked ) {
                    $('#post-bodies').show();
                } else {
                    $('#post-bodies').hide();
                }
            });

            $('#check-header').on('click', function(){
                if ( this.checked ) {
                    $('#post-header').show();
                } else {
                    $('#post-header').hide();
                }
            });
        },
        // 添加和删除参数
        onChangeParams: function() {
            var self = this;

            $(document).on('click','.btn-remove-body',function(){
                $(this).parents('tr').remove();
            });

            $(document).on('click','.btn-remove-head',function(){
                $(this).parents('tr').remove();
            });

            $('.btn-append-body').on('click', function(){
                self.appendParams('body');
            });

            $('.btn-append-head').on('click', function(){
                self.appendParams('head');
            });

            $('.btn-append-body-add').on('click', function(){
                self.appendParams('body-add');
            });

            $('.btn-append-head-add').on('click', function(){
                self.appendParams('head-add');
            });

            $('.btn-append-batch-confirm').on('click', function() {
                var qStr = $('#raw-batch').val();
                var list = self.parseQueryString(qStr);
                var keys = Object.keys(list);

                keys.forEach(function(key) {
                    self.appendParams('body', { key: key, value: list[key] });
                })
            });

            $('.btn-append-batch-add-confirm').on('click', function() {
                var qStr = $('#raw-batch-add').val();
                var list = self.parseQueryString(qStr);
                var keys = Object.keys(list);

                keys.forEach(function(key) {
                    self.appendParams('body-add', { key: key, value: list[key], note: '' });
                })
            });
        },
        onSubmitRequest: function() {
            var self = this;

            $('#sendRequest').on('click', function(){
                if ( self.sendingPost ) return;

                self.switchRequestButton('close');

                var post = self.packPostData();

                $.ajax( {
                    url:'/service/sendRequest',
                    data:{
                        url: post.url,
                        method: post.method,
                        header: post.header,
                        bodies: post.bodies
                    },
                    type:'POST',
                    cache:false,
                    dataType:'json',
                    complete: function(xhr, statusText) {
                        if ( statusText === 'success' ) {
                            var data = xhr.responseJSON;

                            var header = '';

                            for (var i in data.headers) {
                                var part = data.headers[i];

                                part.forEach(function(item) {
                                    header += '<span class="title">' + i + ': </span>' + item + '<br />';
                                });
                            }

                            header = '<div class="response-result">' + header + '</div>';

                            var body = data.type === 'json' ? JSON.stringify(data.body) : HTML.stringify(data.body);

                            body = '<div class="response-result">' + body + '</div>';

                            var status =
                                '<span class="title">Status Code: </span>' + xhr.status + '<br />' +
                                '<span class="title">Status Text: </span>' + data.message;

                            status = '<div class="response-result">' + status + '</div>';

                            $('.response-status').html(status);
                            $('.response-header').html(header);
                            $('.response-body').html(body);
                        } else {
                            $('.response-status').html('');
                            $('.response-header').html('');
                            $('.response-body').html('');
                        }

                        self.switchRequestButton('open');
                    }
                });
            });
        },
        onAddNewApi: function() {
            var self = this;

            $('#addNewApi').on('click', function(){
                if ( self.addingApi ) return;

                self.switchAddApiButton('close');

                var post = self.packPostData();
                var name = $('#api-name').val();
                var alias = $('#api-alias').val();
                $.ajax( {
                    url:'/service/addApi',
                    data:{
                        name: name,
                        alias: alias,
                        url: post.url,
                        method: post.method,
                        querys: post.querys,
                        header: post.header,
                        bodies: post.bodies
                    },
                    type:'POST',
                    cache:false,
                    dataType:'json',
                    beforeSend: function(req) {
                        req.setRequestHeader('USER-KEY', Cookies.get('userKey'));
                    },
                    complete: function(xhr, statusText) {
                        var data = xhr.responseJSON;

                        if ( statusText === 'success' ) {
                            alert.success(data.message, '添加成功');
                        } else {
                            alert.error(data.message, '添加失败');
                        }

                        self.switchAddApiButton('open');
                    }
                });
            });
        },
        onModifyApi: function() {
            var self = this;

            $('#modifyApi').on('click', function(){
                if ( self.modifyingApi ) return;

                self.switchModifyButton('close');

                var post = self.packPostData();
                var name = $('#api-name').val();
                var alias = $('#api-alias').text();
                $.ajax( {
                    url:'/service/modifyApi',
                    data:{
                        name: name,
                        alias: alias,
                        url: post.url,
                        method: post.method,
                        querys: post.querys,
                        header: post.header,
                        bodies: post.bodies
                    },
                    type:'POST',
                    cache:false,
                    dataType:'json',
                    beforeSend: function(req) {
                        req.setRequestHeader('USER-KEY', Cookies.get('userKey'));
                    },
                    complete: function(xhr, statusText) {
                        var data = xhr.responseJSON;

                        if ( statusText === 'success' ) {
                            alert.success(data.message, '修改成功');
                        } else {
                            alert.error(data.message, '修改失败');
                        }

                        self.switchModifyButton('open');
                    }
                });
            });
        },
        onSaveList: function() {
            var self = this;

            $('.btn-save-list').on('click', function(){
                if ( self.savingApi ) return;

                self.switchSaveButton('close');

                var api_list = {};

                var count = 1;
                $('#api-list').find('li').each(function(){
                    var name = $(this).attr('api-name');
                    var alias = $(this).attr('api-alias');

                    if ( /^\-{3,}$/.test(name) ) {
                        api_list['seperator_' + count] = '---';
                        count++;
                    } else {
                        api_list[alias] = name;
                    }
                });

                $.ajax( {
                    url:'/service/saveApiList',
                    data:{
                        api_list:api_list
                    },
                    type:'POST',
                    cache:false,
                    dataType:'json',
                    beforeSend: function(req) {
                        req.setRequestHeader('USER-KEY', Cookies.get('userKey'));
                    },
                    complete: function(xhr, statusText) {
                        var data = xhr.responseJSON;

                        if ( statusText === 'success' ) {
                            alert.success(data.message, '修改成功');
                        } else {
                            alert.error(data.message, '修改失败');
                        }

                        self.switchSaveButton('open');
                    }
                });
            });
        },
        onLogin: function() {
            var self = this;

            $('#admin-login').on('click', function(){
                if ( self.logining ) return;

                self.switchLoginButton('close');

                var username = $('#login-username').val();
                var password = $('#login-password').val();
                $.ajax( {
                    url:'/service/login',
                    data:{
                        username: username,
                        password: password
                    },
                    type:'POST',
                    cache:false,
                    dataType:'json',
                    complete: function(xhr, statusText) {
                        var data = xhr.responseJSON;

                        if ( statusText === 'success' ) {
                            window.location.reload();

                            //$('#dialog-login').modal('hide');
                            //alert.success(data.message, '登录成功');
                        } else {
                            $('#dialog-login .alert').show();
                            $('#dialog-login .alert p').text('登录失败: ' + data.message);

                            setTimeout(function() {
                                $('#dialog-login .alert').hide();
                            }, 1000);
                        }

                        self.switchLoginButton('open');
                    }
                });
            });
        },
        onLoginShow: function() {
            $('#dialog-login').on('show.bs.modal', function (e) {
                $('#dialog-login .alert').hide();
            });
        },
        onLogout: function() {
            $('#logout').on('click', function() {
                Cookies.remove('userKey');
                Cookies.remove('userToken');

                window.location.href = '/';
            });
        },

        // 解析参数
        parseQueryString: function(queryString){
            var res = {};

            //查询字符串为空直接返回 避免出现这样的返回值{"":""}
            if (queryString.trim().length === 0){
                return res;
            }

            //获取参数
            var arr = queryString.split('&');
            for (var i = 0; i <  arr.length; i++) {
                var itemArr = arr[i].split('=');
                //第一个=号之前的是name 后面的全是值
                var name = itemArr.shift();
                var value = itemArr.join('=');
                res[name] = value;
            }

            return res;
        },
        // 合并参数
        joinQueryString: function(KVPairs) {
            var arr = [];
            for (var key in KVPairs) {
                var value = KVPairs[key];
                arr.push(key + '=' + value);
            }

            return arr.join('&');
        },
        // 增加参数
        appendParams: function(type, params) {
            params = params || { key: '', value: '', note: '' };

            var html = '';

            switch ( type ) {
                case 'query':
                    var hidden = params.hidden ? ' checked' : '';
                    var readonly = params.readonly ? ' checked' : '';
                    html = [
                        '                <tr class="query-parametric">',
                        '                    <td>',
                        '                        <span class="form-normal input-query-key">' + params.key + '</span>',
                        '                    </td>',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-query-note" value="' + params.note + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <label class="checkbox-inline">',
                        '                            <input type="checkbox" class="input-query-readonly"' + readonly + '> 只读',
                        '                        </label>',
                        '                        <label class="checkbox-inline">',
                        '                            <input type="checkbox" class="input-query-hidden"' + hidden + '> 隐藏',
                        '                        </label>',
                        '                    </td>',
                        '                </tr>'
                    ].join('');
                    break;
                case 'body':
                    html = [
                        '               <tr class="body-parametric">',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-body-key" value="' + params.key + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-body-value" value="' + params.value + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <span class="btn btn-xs btn-danger btn-remove-body">',
                        '                            <i class="fa fa-remove"></i> 删除参数',
                        '                        </span>',
                        '                    </td>',
                        '                </tr>'
                    ].join('');
                    break;
                case 'body-add':
                    html = [
                        '                <tr class="body-parametric">',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-body-key" value="' + params.key + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-body-value" value="' + params.value + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-body-note" value="' + params.note + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <span class="btn btn-xs btn-danger btn-remove-body">',
                        '                            <i class="fa fa-remove"></i> 删除参数',
                        '                        </span>',
                        '                    </td>',
                        '                </tr>'
                    ].join('');
                    break;
                case 'head':
                    html = [
                        '                <tr class="head-parametric">',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-head-key" value="' + params.key + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-head-value" value="' + params.value + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <span class="btn btn-xs btn-danger btn-remove-head">',
                        '                            <i class="fa fa-remove"></i> 删除参数',
                        '                        </span>',
                        '                    </td>',
                        '                </tr>'
                    ].join('');
                    break;
                case 'head-add':
                    html = [
                        '                <tr class="head-parametric">',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-head-key" value="' + params.key + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-head-value" value="' + params.value + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <input type="text" class="form-control input-head-note" value="' + params.note + '">',
                        '                    </td>',
                        '                    <td>',
                        '                        <span class="btn btn-xs btn-danger btn-remove-head">',
                        '                            <i class="fa fa-remove"></i> 删除参数',
                        '                        </span>',
                        '                    </td>',
                        '                </tr>'
                    ].join('');
                    break;
            }

            if ( /^body/.test(type) ) {
                $('#post-bodies table tbody').append(html);
            } else if( /^head/.test(type) ) {
                $('#post-header table tbody').append(html);
            } else {
                $('#get-query table tbody').append(html);
            }
        },
        // 提交数据
        packPostData: function() {
            var url = $('#post-url').val();
            var method = $('#post-method').val();
            var querys = [];
            var header = [];
            var bodies = [];

            $('#get-query').find('.query-parametric').each(function(){
                var key = $(this).find('.input-query-key:first').text();
                var note = $(this).find('.input-query-note:first').val() || '';
                var hidden = $(this).find('.input-query-hidden:first').is(':checked');
                var readonly = $(this).find('.input-query-readonly:first').is(':checked');

                if ( key ) {
                    querys.push({key: key, note: note, hidden: hidden, readonly: readonly});
                }
            });

            if ( $('#check-header' ).is(':checked') ) {
                $('#post-header').find('.head-parametric').each(function(){
                    var key = $(this).find('.input-head-key:first').val();
                    var value = $(this).find('.input-head-value:first').val();
                    var note = $(this).find('.input-head-note:first').val() || '';

                    if ( key ) {
                        header.push({key: key, value: value, note: note});
                    }
                });
            }

            if ( $('#check-bodies' ).is(':checked') ) {
                $('#post-bodies').find('.body-parametric').each(function(){
                    var key = $(this).find('.input-body-key:first').val();
                    var value = $(this).find('.input-body-value:first').val();
                    var note = $(this).find('.input-body-note:first').val() || '';

                    if ( key ) {
                        bodies.push({key: key, value: value, note: note});
                    }
                });
            }

            return { url: url, method: method, querys: querys, header: header, bodies: bodies };
        },
        // 启用禁用提交按钮
        switchRequestButton: function(close) {
            if ( close && close !== 'open' ) {
                var spinner = '<i class="fa fa-circle-o-notch fa-spin" style="margin-left: 2px"></i>';
                $('#sendRequest').append(spinner);

                this.sendingPost = true;

                $('.url fieldset').attr('disabled', true);
            } else {
                $('#sendRequest').find('i:first').remove();

                this.sendingPost = false;

                $('.url fieldset').removeAttr('disabled');
            }
        },
        switchAddApiButton: function(close) {
            if ( close && close !== 'open' ) {
                var spinner = '<i class="fa fa-circle-o-notch fa-spin" style="margin-left: 2px"></i>';
                $('#addNewApi').append(spinner);

                this.addingApi = true;

                $('.add fieldset').attr('disabled', true);
            } else {
                $('#addNewApi').find('i:first').remove();

                this.addingApi = false;

                $('.add fieldset').removeAttr('disabled');
            }
        },
        switchModifyButton: function(close) {
            if ( close && close !== 'open' ) {
                var spinner = '<i class="fa fa-circle-o-notch fa-spin" style="margin-left: 2px"></i>';
                $('#modifyApi').append(spinner);

                this.modifyingApi = true;

                $('.add fieldset').attr('disabled', true);
            } else {
                $('#modifyApi').find('i:first').remove();

                this.modifyingApi = false;

                $('.add fieldset').removeAttr('disabled');
            }
        },
        switchSaveButton: function(close) {
            if ( close && close !== 'open' ) {
                var spinner = '<i class="fa fa-circle-o-notch fa-spin" style="margin-left: 2px"></i>';
                $('.btn-save-list').append(spinner);

                this.savingApi = true;

                $('.btn-add-line').attr('disabled', true);
            } else {
                $('.btn-save-list').find('i:last').remove();

                this.savingApi = false;

                $('.btn-add-line').removeAttr('disabled');
            }
        },
        switchLoginButton: function(close) {
            if ( close && close !== 'open' ) {
                var spinner = '<i class="fa fa-circle-o-notch fa-spin" style="margin-left: 2px"></i>';
                $('#admin-login').append(spinner);

                this.logining = true;

                $('#login-username').attr('disabled', true);
                $('#login-password').attr('disabled', true);
                $('#admin-login').attr('disabled', true);
                $('#admin-login-cancel').attr('disabled', true);
            } else {
                $('#admin-login').find('i:first').remove();

                this.logining = false;

                $('#login-username').removeAttr('disabled');
                $('#login-password').removeAttr('disabled');
                $('#admin-login').removeAttr('disabled');
                $('#admin-login-cancel').removeAttr('disabled');
            }
        },

        // 初始化
        init: function() {
            this.initialStatus();
            this.onExpandCollapse();
            this.onUrlChanged();
            this.onReqDataSwitch();
            this.onChangeParams();
            this.onSubmitRequest();
            this.onAddNewApi();
            this.onModifyApi();
            this.onSaveList();
            this.onLogin();
            this.onLoginShow();
            this.onLogout();
        }
    };

    $(document).ready(function(){
        app.init();
    });
})();