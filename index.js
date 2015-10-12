var ChildProcess = require('child_process');
var csv = require('csv');

function psQuery(args, callback){
  ChildProcess.exec('ps ' + args, function (err, stdout, stderr) {
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

function wmicQuery(args, callback){
  ChildProcess.exec('wmic process ' + args + ' get ProcessID,ExecutablePath,CommandLine,Name /FORMAT:CSV', function (err, stdout, stderr) {
    if (err || stderr){
      return callback(err || stderr.toString());
    }

    csv.parse(stdout, {relax: true, escape: null}, function (err, data) {
      if (err){
        return callback(err);
      }

      // filter our headers and bad data
      var results = data.filter(function(row){
        return !( row.length < 3 || row[1] == undefined || row[1].length < 1 || row[3] === 'Name');
      }).map(function (row) {
        // 123, thing.exe, C:\this\is\where\i\live
        var pid = parseInt(row[4], 10);
        var command = row[3];
        var whole = row[2] || "";
        var withArgs = row[1] || "";
        var execDir = whole.substr(0, whole.length - command.length);

        var args = withArgs.substr(whole.length + 1).split(" ");

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
}

// returns pid and commands, WITHOUT args
module.exports.list = function(callback){
  if (process.platform === 'win32'){
    // Windows check
    wmicQuery("", callback);
  } else {
    // OS X/Linux check
    psQuery("-A -o pid,command", callback);
  }
}

module.exports.lookup = function(pid, callback){
  if (process.platform === 'win32'){
    // Windows check
    wmicQuery("where processid=" + pid, callback);
  } else {
    // OS X/Linux check
    psQuery("-o pid,command -p " + pid, callback);
  }
}

module.exports.detailedLookup = function(pid, callback){
  if (process.platform === 'win32'){
    // Windows check
    wmicQuery("where processid=" + pid, callback);
  } else {
    // OS X/Linux check
    psQuery("-o pid,args -p " + pid, callback);
  }
}

