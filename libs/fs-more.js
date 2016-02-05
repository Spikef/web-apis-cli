/**
 * Usage: 针对fs的一些操作
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

var fs = require('fs');
var path = require('path');

var BUF_LENGTH = 64 * 1024;
var BUF_EMPTY = new Buffer(BUF_LENGTH);
exports.copyFileSync = function(source, target, options) {
    options = options || {overWrite: true, timeStamp: true};

    var overWrite = options.overWrite !== false;
    var timeStamp = options.timeStamp !== false;

    if (fs.existsSync(target)) {
        if (overWrite) {
            fs.chmodSync(target, parseInt('777', 8));
            fs.unlinkSync(target);
        } else {
            throw Error('File is already exist!');
        }
    }

    var fdr = fs.openSync(source, 'r');
    var stat = fs.fstatSync(fdr);
    var fdw = fs.openSync(target, 'w', stat.mode);
    var bytesRead = 1;
    var pos = 0;

    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, BUF_EMPTY, 0, BUF_LENGTH, pos);
        fs.writeSync(fdw, BUF_EMPTY, 0, bytesRead);
        pos += bytesRead;
    }

    if (timeStamp) {
        fs.futimesSync(fdw, stat.atime, stat.mtime);
    }

    fs.closeSync(fdr);
    fs.closeSync(fdw);
};

exports.copyFolderSync = function(source, target) {
    source = path.resolve(process.cwd(), source);
    target = path.resolve(process.cwd(), target);

    var self = this, file;
    var dirList = this.readFolderSync(source);
    dirList.folders.forEach(function(folder) {
        folder = target + folder.replace(source, '');
        self.makeFolderSync(folder);
    });
    dirList.files.forEach(function(base) {
        file = target + base.replace(source, '');
        self.copyFileSync(base, file);
    });
};

exports.readFolderSync = function(folder) {
    folder = path.resolve(process.cwd(), folder);

    var folders = [], files = [];
    var read = function(full) {
        var dirList = fs.readdirSync(full);

        dirList.forEach(function(item){
            item = full + path.sep + item;
            if( fs.statSync(item).isFile() && !path.basename(item).startsWith('.') ){
                files.push(item);
            }
        });

        dirList.forEach(function(item){
            item = full + path.sep + item;
            if( fs.statSync(item).isDirectory() ) {
                folders.push(item);
                read(item);
            }
        });
    };

    read(folder);

    return {
        folders: folders,
        files: files
    }
};

exports.makeFolderSync = function(folder) {
    folder = path.resolve(process.cwd(), folder);
    if ( path.basename(folder).contains('.') ) folder = path.dirname(folder);
    var folders = folder.split(/\/|\\/).slice(1);
    var fullDir = folder.substring(0, folder.indexOf(folders[0]));  // 取盘符
    folders.forEach(function(name) {
        fullDir += name + path.sep;
        fullDir = path.normalize(fullDir);
        !fs.existsSync(fullDir) && fs.mkdirSync(fullDir);
    })
};

exports.cleanFolderSync = function(folder) {
    folder = path.resolve(process.cwd(), folder);
    var dirList = this.readFolderSync(folder);
    dirList.files.forEach(function(file) {
        fs.unlinkSync(file);
    });
    for (var i=dirList.folders.length-1;i>=0;i--) {
        fs.rmdirSync(dirList.folders[i]);
    }
};

exports.removeFolderSync = function(folder) {
    this.cleanFolderSync(folder);

    fs.rmdirSync(folder);
};