var libPs = require('./lib/ps');
var libWmic = require('./lib/wmic');

// returns pid and commands, WITHOUT args
module.exports.list = function (callback){

    if (process.platform === 'win32'){
        // Windows check
        libWmic.query('', callback);
    } else {
        // OS X/Linux check
        libPs.query('-A -o pid,comm', callback);
    }
};

module.exports.lookup = function (pid, callback){

    if (process.platform === 'win32'){
        // Windows check
        libWmic.query('where processid=' + pid, callback);
    } else {
        // OS X/Linux check
        libPs.query('-o pid,comm -p ' + pid, callback);
    }
};

module.exports.detailedLookup = function (pid, callback){

    if (process.platform === 'win32'){
        // Windows check
        libWmic.query('where processid=' + pid, callback);
    } else {
        // OS X/Linux check
        libPs.query('-o pid,args -p ' + pid, callback);
    }
};
