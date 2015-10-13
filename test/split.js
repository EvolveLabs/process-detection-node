var Code = require('code');
var Fs = require('fs');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var ps = require('../split.js');

describe('split', function () {

    it('mac processes', function (done) {

        var processes = Fs.readFileSync(__dirname + '/assets/macosxProcesses', 'utf8').toString().split('\n');
        var procArray = [];
        // last element is just empty so ignore
        for (var i = 0; i < processes.length - 1; i++) {

            var obj = ps.parseLine(processes[i]);
            procArray.push(obj);
        }
        expect(procArray.length).to.equal(2);
        expect(procArray[0].pid).to.equal(1234);
        expect(procArray[0].command).to.equal('Google Chrome');
        expect(procArray[0].execDir).to.equal('/Applications/Google Chrome.app/Contents/MacOS');
        expect(procArray[0].args.length).to.equal(0);
        expect(procArray[1].pid).to.equal(12345);
        expect(procArray[1].command).to.equal('crashpad_handler');
        expect(procArray[1].execDir).to.equal('/Applications/Google Chrome.app/Contents/Versions/45.0.2454.101/Google Chrome Framework.framework/Helpers');
        expect(procArray[1].args.length).to.be.above(0);
        done();
    });
});
