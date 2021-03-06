var _ = require('lodash');
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

var libWmic = require('../lib/wmic');

describe('lib/wmic', function() {
    var sandbox;

    beforeEach(function (done) {
        sandbox = sinon.sandbox.create();
        // force win32 version of `path.dirname`
        sandbox.stub(path, 'dirname',
                     _.bindKey(path.win32, 'dirname'));
        done();
    });

    afterEach(function (done) {
        sandbox.restore();
        done();
    });

    describe('#wmicColumns', function() {
        it('should return desired columns', function(done) {
            expect(libWmic.wmicColumns())
                .to.equal('ProcessID,ExecutablePath,CommandLine,Name');
            done();
        });
    });

    describe('#wmicArgs', function() {
        beforeEach(function(done) {
            sandbox.stub(libWmic, 'wmicColumns').returns('stub,columns');
            done();
        });

        it('should generate arguments using wmicColumns()', function(done) {
            expect(libWmic.wmicArgs())
                .to.equal(['process', 'get', 'stub,columns', '/FORMAT:CSV']);
            done();
        });
        it('should insert passed process into arguments', function(done) {
            var process = 'PROC_ARG';
            expect(libWmic.wmicArgs(process))
                .to.equal(['process', 'PROC_ARG', 'get', 'stub,columns', '/FORMAT:CSV']);
            done();
        });
        it('should convert passed process to string when inserting', function(done) {
            var process = 55;
            expect(libWmic.wmicArgs(process))
                .to.equal(['process', '55', 'get', 'stub,columns', '/FORMAT:CSV']);
            done();
        });
    });

    describe('#spawnStream', function() {
        var testStdout;

        beforeEach(function(done) {
            sandbox.stub(libWmic, 'wmicArgs')
                .returns(['stubbed', 'args']);
            testStdout = {};
            var spawnOutput = { stdout: testStdout };
            sandbox.stub(childProcess, 'spawn')
                .returns(spawnOutput);
            done();
        });

        it('should spawn wmic with arguments from wmicArgs()', function(done) {
            libWmic.spawnStream();
            sinon.assert.calledWith(childProcess.spawn, 'wmic', ['stubbed', 'args']);
            done();
        });

        it('should pass process to wmicArgs', function(done) {
            var process = 'test_process';
            libWmic.spawnStream(process);
            sinon.assert.calledWith(libWmic.wmicArgs, process);
            done();
        });

        it('should return stdout from spawn return value', function(done) {
            expect(libWmic.spawnStream())
                .to.equal(testStdout);
            done();
        });
    });

    describe('#query', function() {
        it('should resolve with processes extracted from spawnStream()', function(done) {
            sandbox.stub(libWmic, 'spawnStream', streamFile.bind(this, 'skype'));

            libWmic.query().then(function(results) {
                expect(results).to.equal([{
                    pid: 3340,
                    command: 'SkypeHost.exe',
                    args: '-ServerName:SkypeHost.ServerServer',
                    execDir: 'C:\\Program Files\\WindowsApps\\Microsoft.Messaging_2.15.20002.0_x86__8wekyb3d8bbwe'
                }]);
                done();
            });
        });

        it('should invoke callback with processes extracted from spawnStream()', function(done) {
            sandbox.stub(libWmic, 'spawnStream', streamFile.bind(this, 'skype'));

            libWmic.query(function(err, results) {
                expect(results).to.equal([{
                    pid: 3340,
                    command: 'SkypeHost.exe',
                    args: '-ServerName:SkypeHost.ServerServer',
                    execDir: 'C:\\Program Files\\WindowsApps\\Microsoft.Messaging_2.15.20002.0_x86__8wekyb3d8bbwe'
                }]);
                done();
            });
        });

        it('should extract processes arguments as `args:`', function(done) {
            sandbox.stub(libWmic, 'spawnStream', streamFile.bind(this, 'portal'));

            libWmic.query().then(function(results) {
                expect(results).to.equal([{
                    pid: 2972,
                    command: 'hl2.exe',
                    args: '-game portal -steam',
                    execDir: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Portal'
                }]);
                done();
            });
        });

        it('should pass pid to spawnStream()', function(done) {
            sandbox.stub(libWmic, 'spawnStream', streamFile.bind(this, 'skype'));

            libWmic.query('TEST_PID');
            sinon.assert.calledWith(libWmic.spawnStream, 'TEST_PID');
            done();
        });

        it('should pass pid AND invoke callback', function(done) {
            sandbox.stub(libWmic, 'spawnStream', streamFile.bind(this, 'skype'));

            libWmic.query('TEST_PID', function(err, results) {
                sinon.assert.calledWith(libWmic.spawnStream, 'TEST_PID');
                expect(results).to.equal([{
                    pid: 3340,
                    command: 'SkypeHost.exe',
                    args: '-ServerName:SkypeHost.ServerServer',
                    execDir: 'C:\\Program Files\\WindowsApps\\Microsoft.Messaging_2.15.20002.0_x86__8wekyb3d8bbwe'
                }]);
                done();
            });
        });
    });
});

function streamFile(file) {
    var filePath = path.join(__dirname, 'assets', 'wmic', file);
    return fs.createReadStream(filePath);
}
