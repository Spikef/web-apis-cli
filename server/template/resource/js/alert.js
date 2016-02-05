alert.success = function(message, title) {
    title = title || '成功';

    $('#dialog-success .modal-title').text(title);
    $('#dialog-success .modal-texts').text(message);

    $('#dialog-success').modal('show');
};

alert.error = function(message, title) {
    title = title || '错误';

    $('#dialog-error .modal-title').text(title);
    $('#dialog-error .modal-texts').text(message);

    $('#dialog-error').modal('show');
};

alert.warn = function(message, title) {
    title = title || '警告';

    $('#dialog-warn .modal-title').text(title);
    $('#dialog-warn .modal-texts').text(message);

    $('#dialog-warn').modal('show');
};