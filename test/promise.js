'use strict'

var should = require('should'),
  config = require('./config'),
  OSS = require('..')

describe('# promisify', function() {
  var oss = OSS.createClient(config)

  it('should list bucket', async function() {
    const res = await oss.listBucket()

    res.status.should.equal(200)
    res.body.ListAllMyBucketsResult.should.have.keys('Owner', 'Buckets')
  })
})
