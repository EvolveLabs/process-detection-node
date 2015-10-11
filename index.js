var ChildProcess = require('child_process');
var csv = require('csv');

// returns pid and commands, WITHOUT args
module.exports.list = function(callback){
  if (process.platform === 'win32'){
    // Windows check
    ChildProcess.exec('wmic process get ProcessID,ExecutablePath,Name /FORMAT:CSV', function (err, stdout, stderr) {
      if (err || stderr)
        return callback(err || stderr.toString());

      csv.parse(stdout, function (err, data) {
        if (err)
          return callback(err);

        // filter our headers and bad data
        var results = data.filter(function(row){
          return !( row.length < 3 || row[1] == undefined || row[1].length < 1 );
        }).map(function (row) {
          // 123, thing.exe, C:\this\is\where\i\live
          var pid = parseInt(row[3], 10);
          var command = row[2];
          var whole = row[1] || "";
          var execDir = whole.substr(0, whole.length - command.length);

          return {
            pid: pid,
            command: command,
            execDir: execDir
          };
        });

        callback(null, results);
      });
    });
  } else {
    // OS X/Linux check
    ChildProcess.exec('ps -Ao pid,comm', function (err, stdout, stderr) {
      if (err || stderr)
        return callback(err || stderr.toString());

      var results = [];
      stdout.split('\n').map(function (row) {
        var matches = row.match(/(\d+) (.*)/);
        if (!matches)
          return;

        var pid = parseInt(matches[1], 10);
        var whole = matches[2];
        var slashIndex = whole.lastIndexOf('/');
        var command = whole.substr(slashIndex + 1);
        var execDir = whole.substr(0, slashIndex);

        // 123, Steam, /opts/homebrew/casks/steam.app/contents/MacOS/
        results.push({
          pid: pid,
          command: command,
          execDir: execDir
        });
      });

      //filter our commands that we don't know where they're from
      results = results.filter(function(result){
        return result.execDir.length > 0;
      });

      callback(null, results);
    });
  }
}
