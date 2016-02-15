var cp = require('child_process');
var os = require('os');

// platforms
switch (os.platform()) {
    case 'freebsd': return module.exports = freebsd;
    case 'win32': return module.exports = windows;
    case 'linux': return module.exports = linux;
    case 'darwin': return module.exports = mac;
    default: return module.exports = unsupported;
}

// unsupported

function unsupported(str, fn) {
    fn(new Error('unsupported platform'));
}

// freebsd

function freebsd(str, fn) {
    execute('xsel -i -b', str, fn);
}

// windows

function windows(str, fn) {
    execute('clip', str, fn);
}

// linux

function linux(str, fn) {
    execute('xclip -selection clipboard', str, fn);
}

// mac

function mac(str, fn) {
    execute('pbcopy', str, fn);
}

// exec

function execute(program, str) {
    var args = escape([str]);

    cp.execSync(program, {
        input: args
    })
}

// return a shell compatible format
function escape(a) {
    var ret = [];

    a.forEach(function(s) {
        if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
            s = "'"+s.replace(/'/g,"'\\''")+"'";
            s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
                .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
        }
        ret.push(s);
    });

    return ret.join(' ');
}
