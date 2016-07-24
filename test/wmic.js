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

    describe('#wmicStream', function() {
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
            libWmic.wmicStream();
            sinon.assert.calledWith(childProcess.spawn, 'wmic', ['stubbed', 'args']);
            done();
        });

        it('should pass process to wmicArgs', function(done) {
            var process = 'test_process';
            libWmic.wmicStream(process);
            sinon.assert.calledWith(libWmic.wmicArgs, process);
            done();
        });

        it('should return stdout from spawn return value', function(done) {
            expect(libWmic.wmicStream())
                .to.equal(testStdout);
            done();
        });
    });

    describe('#query', function() {
        it('should return rows from wmicStream()', function(done) {
            sandbox.stub(libWmic, 'wmicStream', streamFile.bind(this, 'skype'));
            libWmic.query(null, function(err, results) {
                expect(results).to.equal([{
                    pid: 3340,
                    command: 'SkypeHost.exe',
                    args: '-ServerName:SkypeHost.ServerServer',
                    execDir: 'C:\\Program Files\\WindowsApps\\Microsoft.Messaging_2.15.20002.0_x86__8wekyb3d8bbwe'
                }]);
                done();
            });
        });

        it('should return rows with arguments from wmicStream()', function(done) {
            sandbox.stub(libWmic, 'wmicStream', streamFile.bind(this, 'portal'));
            libWmic.query(null, function(err, results) {
                expect(results).to.equal([{
                    pid: 2972,
                    command: 'hl2.exe',
                    args: '-game portal -steam',
                    execDir: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Portal'
                }]);
                done();
            });
        });

        it('should pass process arg to wmicStream()', function(done) {
            var process = 'test_process';
            sandbox.stub(libWmic, 'wmicStream', streamFile.bind(this, 'skype'));
            libWmic.query(process, function() {});
            sinon.assert.calledWith(libWmic.wmicStream, process);
            done();
        });
    });
});

function streamFile(file) {
    var filePath = path.join(__dirname, 'assets', 'wmic', file);
    return fs.createReadStream(filePath);
}
