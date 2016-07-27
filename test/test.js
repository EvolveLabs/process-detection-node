var Lab = require('lab');
var sinon = require('sinon');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var it = lab.it;

var libPs = require('../lib/ps');
var libWmic = require('../lib/wmic');
var ps = require('../index.js');

describe('query', function() {
    var sandbox;

    beforeEach(function (done) {
        sandbox = sinon.sandbox.create();
        done();
    });

    afterEach(function (done) {
        sandbox.restore();
        done();
    });

    describe('when platform is darwin', function() {
        beforeEach(function (done) {
            Object.defineProperty(process, 'platform', {
                value: 'darwin'
            });
            done();
        });

        it('should envoke libPs.auery', function(done) {
            var arg1 = {};
            var arg2 = {};
            sandbox.mock(libPs)
                .expects('query').withExactArgs(arg1, arg2);

            ps.query(arg1, arg2);
            sandbox.verify();
            done();
        });
    });

    describe('when platform is win32', function() {
        beforeEach(function (done) {
            Object.defineProperty(process, 'platform', {
                value: 'win32'
            });
            done();
        });

        it('should envoke libWmic.auery', function(done) {
            var arg1 = {};
            var arg2 = {};
            sandbox.mock(libWmic)
                .expects('query').withExactArgs(arg1, arg2);

            ps.query(arg1, arg2);
            sandbox.verify();
            done();
        });
    });
});

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
});
