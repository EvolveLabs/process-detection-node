var Bluebird = require('bluebird');
var _ = require('lodash');
var childProcess = require('child_process');
var csv = require('csv');
var path = require('path');

exports.wmicColumns = function() {
    // Are we using all of them?
    return 'ProcessID,ExecutablePath,CommandLine,Name';
};

exports.wmicArgs = function(process) {
    var args = ['process'];
    if (process) {
        args.push('' + process);
    }
    var columns = exports.wmicColumns();
    return args.concat(['get', columns, '/FORMAT:CSV']);
};

exports.spawnStream = function(process) {
    var args = exports.wmicArgs(process);
    var ps = childProcess.spawn('wmic', args);
    return ps.stdout;
};

exports.csvOpts = function() {
    // MUST use relax_column_count!!!!!!!!!!!!!!!!!!!!
    // By default csv is extremely picky about number of columns.
    // Any lines that are different length from the first line
    // will generate an error.
    return {
        //columns: true, // broken due to leading blank line
        relax: true,
        relax_column_count: true,
        escape: null
    };
};

exports.query = function(args, callback) {
    return new Bluebird(function(resolve, reject) {
        var results = [];
        exports.spawnStream(args)
            .pipe(csv.parse(exports.csvOpts()))
            .on('data', function(row) {
                row = exports.processRow(row);
                if (row) {
                    results.push(row);
                }
            })
            .on('end', function() {
                resolve(results);
            });
    });
};

exports.processRow = function(row) {
    var command = row[3];           // Name
    var commandWithPath = row[2];   // ExecutablePath
    var commandWithArgs = row[1];   // CommandLine
    var pid = parseInt(row[4], 10); // ProcessId

    if (isNaN(pid)) {
        return;
    }
    // original check:
    // row.length < 3 || row[1] === undefined || row[1].length < 1 || row[3] === 'Name'

    var execDir = path.dirname(commandWithPath);
    var cmdRegex = new RegExp('^"?' + _.escapeRegExp(commandWithPath) + '"? ');
    var args = commandWithArgs.replace(cmdRegex, '');
    // original version:
    //var args = withArgs.substr(whole.length + 1).replace(/^"/,'').trim().split(' ');

    var result = {
        pid: pid,
        command: command,
        args: args,
        execDir: execDir
    };
    return result;
};
