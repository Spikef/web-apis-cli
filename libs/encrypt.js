require('./enhance');

var crypto = require('crypto');

exports.sha1 = function(input, upper) {
    if ( String.isStringLike(input) ) {
        input = String(input);
    } else if (!Buffer.isBuffer(input)) {
        input = '';
    }

    var engine = crypto.createHash('sha1');
    var output = engine.update(input, 'utf8').digest('hex');

    if ( upper ) output = output.toUpperCase();

    return output;
};

exports.md5 = function(input, upper) {
    if ( String.isStringLike(input) ) {
        input = String(input);
    } else if (!Buffer.isBuffer(input)) {
        input = '';
    }

    var engine = crypto.createHash('md5');
    var output = engine.update(input, 'utf8').digest('hex');

    if ( upper ) output = output.toUpperCase();

    return output;
};

exports.randomChar = function(len) {
    len = len && /^\d+$/.test(len) ? Number(len) : 64;

    var seed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789(-_=+)<~!@#$%^&*>[,.:;?]{\|/}';
    seed = exports.randomSort(seed);

    var max = seed.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
        pwd += seed.charAt(Math.floor(Math.random() * max));
    }
    return pwd;
};

exports.randomSort = function(input) {
    input = String(input);

    var array = input.split('');

    array.sort(function(){
        return Math.random()>0.5 ? -1 : 1;
    });

    return array.join('');
};

exports.hashKey = function() {
    var key = exports.randomChar(128) + '-' + new Date().getTime();
    return exports.sha1(key);
};

exports.mix = function(input, salt) {
    input = exports.md5(input);
    salt = exports.md5(salt).substr(7, 16);

    return exports.sha1(input + salt);
};