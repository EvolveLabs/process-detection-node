var csv = require('csv');
var libExec = require('./exec');

module.exports.query = function(args, callback) {

    var cmd = 'wmic process ' + args + ' get ProcessID,ExecutablePath,CommandLine,Name /FORMAT:CSV';
    libExec.runCommand(cmd, function (err, stdout) {

        if (err) {
            return callback(err);
        }

        // MUST use relax_column_count!!!!!!!!!!!!!!!!!!!!
        // By default csv is extremely picky about number of columns.
        // Any lines that are different length from the first line
        // will generate an error.
        csv.parse(stdout, { relax: true, relax_column_count: true, escape: null }, function (err, data) {

            if (err){
                return callback(err);
            }

            // filter our headers and bad data
            var results = data.filter(function (row){

                return !( row.length < 3 || row[1] === undefined || row[1].length < 1 || row[3] === 'Name');
            }).map(function (row) {

                // 123, thing.exe, C:\this\is\where\i\live
                var pid = parseInt(row[4], 10);
                var command = row[3];
                var whole = row[2] || '';
                var withArgs = row[1] || '';
                var execDir = whole.substr(0, whole.length - command.length);
                var args = withArgs.substr(whole.length + 1).replace(/^"/,'').trim().split(' ');

                return {
                    pid: pid,
                    command: command,
                    execDir: execDir,
                    args: args
                };
            });
            callback(null, results);
        });
    });
};
