'use strict'

var config = require('./config'),
  uuid = require('uuid'),
  should = require('should'),
  OSS = require('..'),
  fs = require('fs')

var oss = new OSS.createClient(config)

describe('# object', function() {
  var bucket = uuid.v4(),
    object1 = 'xx/oo',
    object2 = 'xx\\oo',
    object3 = '中文'

  it('create bucket', function(done) {
    oss.createBucket(
      {
        bucket: bucket,
        acl: 'public-read',
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('put object by stream with object name include "/"', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: object1,
        source: fs.createReadStream(__filename),
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.objectUrl.should.equal(
          'http://' + bucket + '.' + config.host + '/' + object1,
        )
        done()
      },
    )
  })

  it('put object by file path with object name include "\\"', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: object2,
        source: __filename,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.objectUrl.should.equal(
          'http://' + bucket + '.' + config.host + '/' + object2,
        )
        done()
      },
    )
  })

  // it('put object by file path include "中文"', function(done) {
  //   oss.putObject({
  //     bucket: bucket,
  //     object: object3,
  //     source: __filename
  //   }, function(error, res) {
  //     should.not.exist(error);
  //     res.status.should.equal(200);
  //     res.objectUrl.should.equal('http://' + bucket + '.' + config.host + '/' + object);
  //     done();
  //   });
  // });

  it('list object (get bucket)', function(done) {
    oss.listObject(
      {
        bucket: bucket,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.body.ListBucketResult.Contents.length.should.above(0)
        done()
      },
    )
  })

  it('delete object1', function(done) {
    oss.deleteObject(
      {
        bucket: bucket,
        object: object1,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(204)
        done()
      },
    )
  })

  it('delete object2', function(done) {
    oss.deleteObject(
      {
        bucket: bucket,
        object: object2,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(204)
        done()
      },
    )
  })

  it('delete bucket', function(done) {
    oss.deleteBucket(
      {
        bucket: bucket,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(204)
        done()
      },
    )
  })
})
