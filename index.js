var libPs = require('./lib/ps');
var libWmic = require('./lib/wmic');

exports.query = function() {
    if (process.platform === 'win32'){
        libWmic.query.apply(libWmic, arguments);
    } else {
        libPs.query.apply(libPs, arguments);
    }
};
