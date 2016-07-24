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
        it('should add pid argument when called with one', function(done) {
            expect(libPs.psArgs('pid'))
                .to.equal(['-A', '-p', 'pid', '-o', 'stub,columns']);
            done();
        });

        it('should convert pid argument to string', function(done) {
            expect(libPs.psArgs(5555))
                .to.equal(['-A', '-p', '5555', '-o', 'stub,columns']);
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

        it('should pass pid to psArgs', function(done) {
            libPs.psStream('PID');
            sinon.assert.calledWith(libPs.psArgs, 'PID');
            done();
        });

        it('should return stdout from spawn return value', function(done) {
            expect(libPs.psStream())
                .to.equal(testStdout);
            done();
        });
    });

    describe('#query', function() {
        it('should resolve with processes extracted from psStream()', function(done) {
            sandbox.stub(libPs, 'psStream', streamFile.bind(this, 'launchd'));
            libPs.query().then(function(results) {
                expect(results).to.equal([
                    { pid: 1, execDir: '/sbin', command: 'launchd', args: '' }
                ]);
                done();
            });
        });

        it('should extract processes arguments as `args:`', function(done) {
            sandbox.stub(libPs, 'psStream', streamFile.bind(this, 'portal'));
            libPs.query().then(function(results) {
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
