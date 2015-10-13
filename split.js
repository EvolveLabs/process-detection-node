module.exports.parseLine = function (line) {

    line = line.trim();
    //console.log('parsing line: ' + line);
    var obj = {};
    var parts = line.split(' --');
    var fullCommand = parts[0].split('/');
    obj.pid = parseInt(parts[0].split(' ')[0]);
    obj.command = fullCommand[fullCommand.length - 1];
    obj.execDir = '';
    obj.args = [];
    for (var i = 1; i < fullCommand.length - 1; i++) {
        obj.execDir += '/' + fullCommand[i];
    }
    for (var j = 1; j < parts.length; j++) {
        obj.args.push('--' + parts[j]);
    }
    //console.log(JSON.stringify(obj));
    return obj;
};
