var _ = require('lodash');
var Bluebird = require('bluebird');
var split = require('split');
var childProcess = require('child_process');
var path = require('path');

var psColumns = ['pid', 'comm', 'args'];
var psColumnDefaultWidth = 4096;
var psColumnWidth = { pid: 10 };

// Query for `comm` (command) AND `args` (command + args)
// and then remove `command` from `command + args`
// Also use manual long/wide column headers to avoid truncation

function mapColumns(iteratee) {
    return psColumns.map(function(column) {
        var width = psColumnWidth[column] || psColumnDefaultWidth;
        return iteratee(column, width);
    });
}

exports.psColumns = function() {
    // OSX's `ps` tends to truncate all but the last column
    // generate wide custom custom headers to avoid truncation
    return mapColumns(function(column, width) {
        var spacerLength = width - column.length;
        return column + '=' + column + Array(spacerLength + 1).join('_');
    }).join(',');
};

exports.spawnArgs = function(pid) {
    var args = ['-A'];
    if (pid) {
        args = ['-p', '' + pid];
    }
    var columns = exports.psColumns();
    return args.concat(['-o', columns]);
};


exports.spawnStream = function(pid) {
    var args = exports.spawnArgs(pid);
    var ps = childProcess.spawn('ps', args);
    return ps.stdout;
};

function extractColumns(line) {
    var row = {};
    var remaining = line;
    mapColumns(function(column, width) {
        var data = remaining.slice(0, width).trim();
        row[column] = data;
        remaining = remaining.slice(width + 1, // w/ spacer
                                    remaining.length);
    }).join(',');
    return row;
}

exports.query = function(pid, callback) {
    if (_.isFunction(pid)) {
        callback = pid;
        pid = undefined;
    }
    callback = callback || _.noop;
    return new Bluebird(function(resolve, reject) {
        var results = [];
        exports.spawnStream(pid)
            .pipe(split())
            .on('data', function(line) {
                var row = exports.processRow(line);
                if (row) {
                    results.push(row);
                }
            })
            .on('end', function() {
                callback(null, results);
                resolve(results);
            });
    });
};

exports.processRow = function(row) {
    var matches = row.match(/^\s*\d+/);
    if (!matches) {
        return;
    }
    var extracted = extractColumns(row);
    var commandWithPath = extracted.comm;
    var commandWithArgs = extracted.args;

    var pid = parseInt(extracted.pid, 10);
    var command = path.basename(commandWithPath);
    var execDir = '';
    if (command !== commandWithPath) {
        execDir = path.dirname(commandWithPath);
    }
    var args = commandWithArgs.slice(commandWithPath.length + 1, // w/ spacer
                                     commandWithArgs.length);

    // this test was in the old code, some sort of "optimization"?
    if (!execDir.length)  {
        return;
    }

    var result = {
        pid: pid,
        command: command,
        args: args,
        execDir: execDir
    };

    return result;
};
