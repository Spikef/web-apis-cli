$(document).ready(function(){
    // 提示
    $('[data-toggle="tooltip"]').tooltip();

    // 检查用户名是否已存在
    $('#check-username').on('click', function(){
        var readonly = $('#admin-username').attr('readonly');
        if ( readonly ) return;

        $.ajax( {
            url:'/service/isNameAllow',
            data:{
                username: $('#admin-username').val()
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
                    $('#message-username').removeClass('text-danger').addClass('text-success');
                } else {
                    $('#message-username').removeClass('text-success').addClass('text-danger');
                }

                $('#message-username').text(data.message);
            }
        });
    });

    // 显示隐藏管理员密码
    $('.watch-password').on('click', function(){
        var input = $(this).prev('input');

        var type = input.attr('type');

        if ( type === 'password' ) {
            input.attr('type', 'text');
            $(this).empty().html('<i class="fa fa-eye-slash"></i>');
        } else {
            input.attr('type', 'password');
            $(this).empty().html('<i class="fa fa-eye"></i>');
        }
    });

    // 同步输入密码
    $('#actor-password').on('change', function(){
        var password = $(this).val();
        $('#check-password').val(password);
    });

    // 点击添加管理员按钮
    $('.btn-add-admin').on('click', function(){
        $('#dialog-admin .panel-heading:first').text('添加管理员');
        $('.btn-save-admin').attr('data-action', 'add');

        $('#admin-username').val('');
        $('#admin-password').val('');

        $('input:radio[name=admin-userRank]')[2].checked = true;

        $('#userRank-2').removeAttr('disabled');
        $('#userRank-3').removeAttr('disabled');

        $('#admin-username').removeAttr('readonly');
        $('#message-password').text('密码长度为6-16位');
    });

    // 点击修改管理员按钮
    $('#admin-list .modify').on('click', function(){
        modify.bind(this)();

        $('#userRank-2').removeAttr('disabled');
        $('#userRank-3').removeAttr('disabled');
    });

    $('#admin-list .doSelf').on('click', function(){
        modify.bind(this)();

        $('#userRank-2').attr('disabled', true);
        $('#userRank-3').attr('disabled', true);
    });

    function modify() {
        $('#dialog-admin .panel-heading:first').text('修改管理员');
        $('.btn-save-admin').attr('data-action', 'modify');

        var parent = $(this).parent();
        var username = parent.attr('admin-name');
        var userRank = parent.attr('admin-rank');

        $('#admin-username').val(username);
        $('#admin-password').val('');

        var rankIndex = Number(userRank) - 1;
        $('input:radio[name=admin-userRank]')[rankIndex].checked = true;

        $('#admin-username').attr('readonly', true);
        $('#message-password').text('如果无需修改管理员密码, 则为空');
    }

    // 点击保存管理员按钮
    $('.btn-save-admin').on('click', function(){
        var action = $(this).attr('data-action');
        var userPass = $('#actor-password').val();
        var username = $('#admin-username').val();
        var password = $('#admin-password').val();
        var userRank = $("input[name='admin-userRank']:checked").val();

        $.ajax( {
            url:'/service/saveAdmin?action=' + action,
            data:{
                username: username,
                password: password,
                userRank: userRank,
                userPass : userPass
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
                    if ( data.GoToHome ) {
                        window.location.href = '/';
                    } else {
                        window.location.reload();
                    }
                } else {
                    var dom = $('#message-' + data.tipArea);
                    var oldText = dom.text();

                    dom.addClass('text-danger');
                    dom.text(data.message);

                    setTimeout(function() {
                        dom.text(oldText);
                        dom.removeClass('text-danger');
                    }, 3000);
                }
            }
        });
    });

    // 点击删除管理员按钮
    $('#admin-list .remove').on('click', function(){
        var parent = $(this).parent();
        var username = parent.attr('admin-name');

        $('#confirm-remove .username').text(username);
        $('#confirm-remove').attr('username', username);
        $('#confirm-remove').modal('show');
    });
    // 点击确认删除按钮
    $('.btn-confirm-remove').on('click', function(){
        var username = $('#confirm-remove').attr('username');
        var userPass = $('#check-password').val();

        $.ajax( {
            url:'/service/removeAdmin',
            data:{
                username: username,
                userPass : userPass
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
                    window.location.reload();
                } else {
                    alert.error(data.message, '删除失败');
                }
            }
        });
    });
});