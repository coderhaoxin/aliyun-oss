'use strict'

var config = require('./config'),
  uuid = require('uuid'),
  should = require('should'),
  OSS = require('..')

var oss = OSS.createClient(config)

describe('# bucket', function() {
  var bucketName01 = uuid.v4(),
    bucketName02 = uuid.v4()

  it('create bucket', function(done) {
    oss.createBucket(
      {
        bucket: bucketName01,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('get bucket (list object)', function(done) {
    oss.getBucket(
      {
        bucket: bucketName01,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('list object (get bucket)', function(done) {
    oss.getBucket(
      {
        bucket: bucketName01,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('get bucket acl', function(done) {
    oss.getBucketAcl(
      {
        bucket: bucketName01,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        should.exist(res.body.AccessControlPolicy)
        done()
      },
    )
  })

  it('set bucket acl', function(done) {
    oss.setBucketAcl(
      {
        bucket: bucketName01,
        acl: 'private',
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('list bucket', function(done) {
    oss.listBucket(function(error, res) {
      should.not.exist(error)
      res.status.should.equal(200)
      res.body.ListAllMyBucketsResult.Buckets[0].Bucket.length.should.above(0)
      done()
    })
  })

  it('delete bucket', function(done) {
    oss.deleteBucket(
      {
        bucket: bucketName01,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(204)
        done()
      },
    )
  })

  it('create bucket with acl', function(done) {
    oss.createBucket(
      {
        bucket: bucketName02,
        acl: 'public-read',
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('delete bucket', function(done) {
    oss.deleteBucket(
      {
        bucket: bucketName02,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(204)
        done()
      },
    )
  })

  it('delete bucket - 404', function(done) {
    oss.deleteBucket(
      {
        bucket: bucketName02,
      },
      function(error) {
        should.exist(error)
        error.status.should.equal(404)
        done()
      },
    )
  })
})

describe('error handle', function() {
  it('create bucket - 403', function(done) {
    var invalidClient = OSS.createClient({
      accessKeyId: 'invalid',
      accessKeySecret: 'invalid',
    })

    invalidClient.createBucket(
      {
        bucket: 'bucket',
      },
      function(error, res) {
        should.not.exist(res)
        error.status.should.equal(403)
        error.code[0].should.equal('InvalidAccessKeyId')
        done()
      },
    )
  })

  it('invalid host', function(done) {
    var invalidClient = OSS.createClient({
      host: 'localhost',
      agent: false,
      accessKeyId: 'invalid',
      accessKeySecret: 'invalid',
    })

    invalidClient.listBucket(function(error, res) {
      should.exist(error)
      should.not.exist(res)
      done()
    })
  })
})
