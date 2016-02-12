$(document).ready(function(){
    // 排序
    var items = document.getElementById('api-list');
    Sortable.create(items);

    // 添加分割符
    $('.btn-add-line').on('click', function (e) {
        var html = [
            '                    <li class="large-list-item" api-name="---">',
            '                        <span class="close remove" aria-label="Remove">',
            '                            <i class="fa fa-times"></i>',
            '                        </span>',
            '                        -----',
            '                    </li>'
        ].join('');

        $('#api-list').append(html);
    });

    // 删除分割符
    $(document).on('click','#api-list .remove',function(){
        $(this).parent().remove();
    });
});