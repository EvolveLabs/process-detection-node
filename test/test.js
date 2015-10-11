var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var ps = require('../index.js');

describe('list', function(){
  it('can be called', function(done){
    ps.list(function(err, results){
      expect(results).to.exist();
      done();
    });
  });
  it('returns valid information', function(done){
    ps.list(function(err, results){
      var result = results[0];
      expect(result.pid).to.exist();
      expect(result.command).to.exist();
      expect(result.execDir).to.exist();
      done();
    });
  });
});

describe('lookup', function(){
  it('can be called', function(done){
    ps.lookup('1', function(err, results){
      expect(results).to.exist();
      done();
    });
  });
  it('returns 1 value', function(done){
    ps.lookup('1', function(err, results){
      expect(results.length).to.equal(1);
      done();
    });
  });
});
