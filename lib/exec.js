var ChildProcess = require('child_process');

module.exports.runCommand = function (cmd, callback) {

    ChildProcess.exec(cmd, function (err, stdout, stderr) {
        if (err || stderr) {
            return callback(err || stderr.toString());
        }
        return callback(null, stdout.toString().trim());
    });
};
