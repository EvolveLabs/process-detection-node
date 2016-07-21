var libExec = require('./exec');

module.exports.query = function(args, callback) {

    var cmd = 'ps ' + args;
    libExec.runCommand(cmd, function (err, stdout) {

        if (err) {
            return callback(err);
        }

        var results = [];
        stdout.split('\n').map(function (row) {

            var matches = row.match(/(\d+) (.*)/);
            if (!matches) {
                return;
            }

            var pid = parseInt(matches[1], 10);
            var whole = matches[2];
            var slashIndex = whole.lastIndexOf('/');
            var command = whole.substr(slashIndex + 1);
            var execDir = whole.substr(0, slashIndex);

            // "shortcut" filter that was in the original code
            if (execDir.length < 1) {
                //console.log('execDir.length < 1, skipping', command);
                return;
            }

            // 123, Steam, /opts/homebrew/casks/steam.app/contents/MacOS/
            results.push({
                pid: pid,
                command: command,
                execDir: execDir
            });
        });

        callback(null, results);
    });
};
