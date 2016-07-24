var Code = require('code');
var Lab = require('lab');
var sinon = require('sinon');
var fs = require('fs');
var path = require('path');
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var libExec = require('../lib/exec');
var ps = require('../index.js');

describe.skip('on OS X', function(){

    var sandbox;

    lab.beforeEach(function (done) {

        sandbox = sinon.sandbox.create();

        Object.defineProperty(process, 'platform', {

            value: 'darwin'
        });
        done();
    });

    lab.afterEach(function (done) {
        sandbox.restore();
        done();
    });

    describe('list', function (){

        lab.beforeEach(function (done) {
            //stub out our PS with pre-recorded response
            sandbox.stub(libExec, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'ps-dump.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        it('can be called', function (done){

            ps.list(function (err, results){

                expect(results).to.exist();
                done();
            });
        });

        it('returns valid information', function (done){

            ps.list(function (err, results){
                var result = results[0];
                expect(result.pid).to.exist();
                expect(result.command).to.exist();
                expect(result.execDir).to.exist();
                done();
            });
        });
    });

    describe('lookup', function (){

        lab.beforeEach(function (done) {
            //stub out our PS with pre-recorded response
            sandbox.stub(libExec, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'ps-single.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        it('can be called', function (done){

            ps.lookup('1', function (err, results){

                expect(results).to.exist();
                done();
            });
        });

        it('returns 1 value', function (done){

            ps.lookup('1', function (err, results){

                expect(results.length).to.equal(1);
                done();
            });
        });
    });

    describe('detailedLookup', function (){

        lab.beforeEach(function (done) {
            //stub out our PS with pre-recorded response
            sandbox.stub(libExec, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'ps-single.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        it('can be called', function (done){

            ps.detailedLookup('1', function (err, results){

                expect(results).to.exist();
                done();
            });
        });

        it('returns 1 value', function (done){

            ps.detailedLookup('1', function (err, results){

                expect(results.length).to.equal(1);
                done();
            });
        });
    });
});

describe.skip('on Windows', function(){

    var sandbox;

    lab.beforeEach(function (done) {

        sandbox = sinon.sandbox.create();

        Object.defineProperty(process, 'platform', {

            value: 'win32'
        });
        done();
    });

    lab.afterEach(function (done) {
        sandbox.restore();
        done();
    });

    describe('list', function (){

        lab.beforeEach(function (done) {
            //stub out our PS with pre-recorded response
            sandbox.stub(libExec, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'wmic-dump.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        it('can be called', function (done){

            ps.list(function (err, results){

                expect(results).to.exist();
                done();
            });
        });

        it('returns valid information', function (done){

            ps.list(function (err, results){
                var result = results[0];
                expect(result.pid).to.exist();
                expect(result.command).to.exist();
                expect(result.execDir).to.exist();
                done();
            });
        });

        it('parses arguments', function (done){

            ps.list(function (err, results){
                // League of Legends
                var result = results[results.length - 1];
                expect(result).to.exist();
                expect(result.command).to.equal('LolClient.exe');
                expect(result.args).to.exist();
                expect(result.args.indexOf('-runtime')).to.not.equal(-1);

                // Half-Life mod: Ricochet
                result = results[results.length - 6];
                expect(result).to.exist();
                expect(result.command).to.equal('hl.exe');
                expect(result.args).to.exist();
                expect(result.args.length).to.equal(3);
                expect(result.args.indexOf('ricochet')).to.not.equal(-1);

                result = results[results.length - 11];
                expect(result).to.exist();
                expect(result.command).to.equal('svchost.exe');
                expect(result.args.length).to.equal(2);
                expect(result.args.indexOf('-k')).to.not.equal(-1);
                done();
            });
        });
    });
});
