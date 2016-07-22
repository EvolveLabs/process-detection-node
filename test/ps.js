var childProcess = require('child_process');
var code = require('code');
var fs = require('fs');
var lab = exports.lab = require('lab').script();
var path = require('path');
var sinon = require('sinon');

var describe = lab.describe;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var expect = code.expect;
var it = lab.it;

var libPs = require('../lib/ps');

describe('lib/ps', function() {
    var sandbox;

    beforeEach(function (done) {
        sandbox = sinon.sandbox.create();
        done();
    });

    afterEach(function (done) {
        sandbox.restore();
        done();
    });

    describe('#psColumns', function() {
        it('should return desired columns with large headers to avoid truncation', function(done) {
            expect(libPs.psColumns())
                .to.equal([
                    // wide headers to force column width
                    'pid=pid' + '_'.repeat(7),
                    'comm=comm' + '_'.repeat(4092),
                    'args=args' + '_'.repeat(4092)
                ].join(','));
            done();
        });
    });

    describe('#psArgs', function() {
        beforeEach(function(done) {
            sandbox.stub(libPs, 'psColumns').returns('stub,columns');
            done();
        });
        it('should generate arguments using psColumns()', function(done) {
            expect(libPs.psArgs())
                .to.equal(['-A', '-o', 'stub,columns']);
            done();
        });
        it('should concat passed in argument list to internally generated ones', function(done) {
            var args = ['extra', 'arguments'];
            expect(libPs.psArgs(args))
                .to.equal(['-A', '-o', 'stub,columns', 'extra', 'arguments']);
            done();
        });
    });

    describe('#psStream', function() {
        var testStdout;

        beforeEach(function(done) {
            sandbox.stub(libPs, 'psArgs')
                .returns(['stubbed', 'args']);
            testStdout = {};
            var spawnOutput = { stdout: testStdout };
            sandbox.stub(childProcess, 'spawn')
                .returns(spawnOutput);
            done();
        });

        it('should spawn ps with arguments from psArgs()', function(done) {
            libPs.psStream();
            sinon.assert.calledWith(childProcess.spawn, 'ps', ['stubbed', 'args']);
            done();
        });

        it('should pass extra arguments to psArgs', function(done) {
            var extra = ['extra', 'extra2'];
            libPs.psStream(extra);
            sinon.assert.calledWith(libPs.psArgs, extra);
            done();
        });

        it('should return stdout from spawn return value', function(done) {
            expect(libPs.psStream())
                .to.equal(testStdout);
            done();
        });
    });

    describe('#query', function() {
        it('should return rows from psStream()', function(done) {
            sandbox.stub(libPs, 'psStream', streamFile.bind(this, 'launchd'));
            libPs.query(null, function(err, results) {
                expect(results).to.equal([
                    { pid: 1, execDir: '/sbin', command: 'launchd', args: '' }
                ]);
                done();
            });
        });

        it('should return rows with arguments from psStream()', function(done) {
            sandbox.stub(libPs, 'psStream', streamFile.bind(this, 'portal'));
            libPs.query(null, function(err, results) {
                expect(results).to.equal([{
                    pid: 85099,
                    command: 'hl2_osx',
                    args: '-game portal -steam',
                    execDir: '/Users/bblack/Library/Application Support/Steam/steamapps/common/Portal'
                }]);
                done();
            });
        });

        it('should pass extra args to psStream()', function(done) {
            sandbox.stub(libPs, 'psStream', streamFile.bind(this, 'launchd'));
            var extra = ['extra', 'extra2'];
            libPs.query(extra, function() {});
            sinon.assert.calledWith(libPs.psStream, extra);
            done();
        });
    });
});

function streamFile(file) {
    var filePath = path.join(__dirname, 'assets', 'ps', file);
    return fs.createReadStream(filePath);
}
