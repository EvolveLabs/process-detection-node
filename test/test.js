var Code = require('code');
var Lab = require('lab');
var sinon = require('sinon');
var fs = require('fs');
var path = require('path');
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var ps = require('../index.js');

describe('on OS X', function(){

    lab.before(function (done) {

        Object.defineProperty(process, 'platform', {

            value: 'darwin'
        });
        done();
    });

    describe('list', function (){

        lab.before(function (done) {
            //stub out our PS with pre-recorded response
            sinon.stub(ps, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'ps-dump.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        lab.after(function (done) {
            ps.runCommand.restore();
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

        lab.before(function (done) {
            //stub out our PS with pre-recorded response
            sinon.stub(ps, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'ps-single.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        lab.after(function (done) {
            ps.runCommand.restore();
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

        lab.before(function (done) {
            //stub out our PS with pre-recorded response
            sinon.stub(ps, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'ps-single.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        lab.after(function (done) {
            ps.runCommand.restore();
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

describe('on Windows', function(){

    lab.before(function (done) {

        Object.defineProperty(process, 'platform', {

            value: 'win32'
        });
        done();
    });

    describe('list', function (){

        lab.before(function (done) {
            //stub out our PS with pre-recorded response
            sinon.stub(ps, 'runCommand', function(cmd, callback){
                fs.readFile(path.join(__dirname, 'assets', 'wmic-dump.txt'), { encoding: 'utf8' }, function (err, data) {
                    callback(err, data);
                });
            });
            done();
        });

        lab.after(function (done) {
            ps.runCommand.restore();
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
