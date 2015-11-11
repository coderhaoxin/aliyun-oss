'use strict';

var should = require('should'),
  config = require('./config'),
  OSS = require('..'),
  co = require('co');

describe('# thunkify', function() {
  config.wrapper = 'thunk';
  var oss = OSS.createClient(config);

  it('should list bucket', function() {
    return co(function* () {
      var res = yield oss.listBucket();

      res.status.should.equal(200);
      res.body.ListAllMyBucketsResult.should.have.keys('Owner', 'Buckets');
    });
  });
});

describe('# promisify', function() {
  config.wrapper = 'promise';
  var oss = OSS.createClient(config);

  it('should list bucket', function() {
    return co(function* () {
      var res = yield oss.listBucket();

      res.status.should.equal(200);
      res.body.ListAllMyBucketsResult.should.have.keys('Owner', 'Buckets');
    });
  });
});
