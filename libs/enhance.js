/**
 * Usage: JS对象增强类
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

if (!Array.prototype.last) {
    Array.prototype.last = function() {
        var arr = this;
        return arr[arr.length - 1];
    };
}
if (!Array.prototype.search) {
    Array.prototype.search = function(name, fromIndex, ignoreCase) {
        if (name === undefined) throw new TypeError('"name" is null or not defined');
        if (typeof name === 'object' && !name instanceof RegExp) {
            throw new TypeError('"name" could not be object unless RegExp');
        }

        var from = parseInt(arguments[1]) || 0;

        if ( name instanceof RegExp ) {
            for (var i=from;i<this.length;i++) {
                if (typeof this[i] !== 'object' && name.test(this[i])) {
                    return i;
                }
            }
        } else if (ignoreCase && typeof name === 'string') {
            for (var i=from;i<this.length;i++) {
                if ( typeof this[i] === 'string' && name.toLowerCase() === this[i].toLowerCase() ) {
                    return i;
                }
            }
        } else {
            return this.indexOf(name, from);
        }

        return -1;
    };
}
if (!Array.prototype.remove) {
    Array.prototype.remove = function(name, all, fromIndex) {
        if (name === undefined) throw new TypeError('"name" is null or not defined');
        if (typeof name === 'object' && !name instanceof RegExp) {
            throw new TypeError('"name" could not be object unless RegExp');
        }

        var index = -1;
        do{
            index = this.search(name, fromIndex);
            if (index > -1) {
                this.splice(index, 1);
            }
            index = this.search(name, fromIndex);
        } while(all && index > -1);

        return this;
    }
}
if (!Array.prototype.removeAt) {
    Array.prototype.removeAt = function(index) {
        index = parseInt(arguments[1]) || 0;

        var val = this[index];
        if ( val !== undefined ) {
            this.splice(index, 1);
        }
        return val;
    }
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };
}
if (!Array.prototype.contains) {
    Array.prototype.contains = Array.prototype.includes;
}
if (!Array.prototype.copy) {
    Array.prototype.copy = function() {
        return this.slice(0);
    }
}

if (!JSON.format) {
    JSON.format = function(json) {
        var format = require('json-format');
        return format(json, {type: 'space', size: 4});
    };
}

if (!String.prototype.contains) {
    String.prototype.contains = String.prototype.includes;
}

if (!String.isStringLike) {
    String.isStringLike = function(input) {
        var type = typeof input;
        return ['string', 'number', 'boolean'].includes(type);
    }
}

if (!Date.prototype.format) {
    Date.prototype.format = function(format) {
        var fecha = require('fecha');
        return fecha.format(this, format);
    };
}
if (!Date.format) {
    Date.format = function(input, format) {
        var fecha = require('fecha');
        return fecha.format(input, format);
    };
}
if (!Date.parse) {
    Date.parse = function(input, format) {
        var fecha = require('fecha');
        return fecha.parse(input, format);
    };
}

require('colors');
process.site = function() {
    if ( process._site ) return process._site;

    var fs = require('fs');
    var path = require('path');
    var cfg = path.resolve(process.cwd(), 'config.json');

    if ( !fs.existsSync(cfg)) {
        console.log('在当前位置找不到任何网站。'.red);
        process.exit(1);
    }

    var configs = require(cfg);
    if ( !configs.app || !configs.app.engine || configs.app.engine !== 'WebAPIs') {
        console.log('在当前位置找不到任何网站。'.red);
        process.exit(1);
    }

    var version = require('../package.json').version;
    if ( !configs.app.version || version !== configs.app.version ) {
        var siteVer = configs.app.version || 0;
        var compare = require('../libs/helper').compareVersion(version, siteVer);

        if ( compare === '<' ) {
            console.log('不受支持的程序版本, 请先使用[npm update web-apis-cli -g]命令升级。'.yellow);
        } else {
            console.log('不受支持的网站版本, 请先使用[wa update]命令升级。'.yellow);
        }

        process.exit(1);
    }

    process._site = process.cwd();
    return process._site;
};