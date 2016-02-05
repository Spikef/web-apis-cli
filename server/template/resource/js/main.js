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
                        header: post.header,
                        bodies: post.bodies
                    },
                    type:'POST',
                    cache:false,
                    dataType:'json',
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
        // 增加参数
        appendParams: function(type, params) {
            params = params || { key: '', value: '', note: '' };

            var html = '';

            switch ( type ) {
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
            } else {
                $('#post-header table tbody').append(html);
            }
        },
        // 提交数据
        packPostData: function() {
            var url = $('#post-url').val();
            var method = $('#post-method').val();
            var header = [];
            var bodies = [];

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

            return { url: url, method: method, header: header, bodies: bodies };
        },
        // 启用禁用提交按钮
        switchRequestButton(close) {
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
        switchAddApiButton(close) {
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
        // 初始化
        init: function() {
            this.initialStatus();
            this.onReqDataSwitch();
            this.onChangeParams();
            this.onSubmitRequest();
            this.onAddNewApi();
        }
    };

    $(document).ready(function(){
        app.init();
    });
})();