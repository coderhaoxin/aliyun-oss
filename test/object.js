'use strict'

var config = require('./config'),
  uuid = require('uuid'),
  should = require('should'),
  OSS = require('..'),
  http = require('http'),
  url = require('url'),
  fs = require('fs')

var oss = new OSS.createClient(config)

describe('# object', function() {
  var bucket = uuid.v4(),
    object = uuid.v4()

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

  it('put object by file path', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: object,
        source: __filename,
        headers: {
          'x-oss-meta-foo': 'bar',
        },
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.objectUrl.should.equal(
          'http://' + bucket + '.' + config.host + '/' + object,
        )
        done()
      },
    )
  })

  it('put object by invalid file path', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: object,
        source: '/xxoo',
      },
      function(error, res) {
        should.not.exist(res)
        error.message.should.match(/ENOENT.*, stat '\/xxoo'/)
        done()
      },
    )
  })

  it('get object by write stream', function(done) {
    var path = __dirname + '/xxoo.download',
      ws = fs.createWriteStream(path)

    oss.getObject(
      {
        bucket: bucket,
        object: object,
        dest: ws,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        fs.statSync(path).size.should.equal(fs.statSync(__filename).size)
        fs.readFileSync(path, 'utf8').should.equal(
          fs.readFileSync(__filename, 'utf8'),
        )
        fs.unlinkSync(path)
        done()
      },
    )
  })

  it('get object by file path', function(done) {
    var path = __dirname + '/ooxx.download'

    oss.getObject(
      {
        bucket: bucket,
        object: object,
        dest: path,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        fs.statSync(path).size.should.equal(fs.statSync(__filename).size)
        fs.readFileSync(path, 'utf8').should.equal(
          fs.readFileSync(__filename, 'utf8'),
        )
        fs.unlinkSync(path)
        done()
      },
    )
  })

  it('head object', function(done) {
    oss.headObject(
      {
        bucket: bucket,
        object: object,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.headers['x-oss-meta-foo'].should.equal('bar')
        done()
      },
    )
  })

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

  it('list object (get bucket) - with optional params', function(done) {
    oss.listObject(
      {
        bucket: bucket,
        prefix: 'test',
        marker: object,
        delimiter: '/',
        maxKeys: 30,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        should.exist(res.body.ListBucketResult)
        done()
      },
    )
  })

  it('delete object', function(done) {
    oss.deleteObject(
      {
        bucket: bucket,
        object: object,
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

describe('# put object by buffer', function() {
  var bucket = uuid.v4(),
    object = uuid.v4(),
    object

  it('create bucket', function(done) {
    oss.createBucket(
      {
        bucket: bucket,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('put object', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: object,
        source: new Buffer('hello,wolrd', 'utf8'),
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.objectUrl.should.equal(
          'http://' + bucket + '.' + config.host + '/' + object,
        )
        done()
      },
    )
  })

  it('put with getSignedUrl (sign header)', function(done) {
    var urlObj = oss.getSignedUrl({
      method: 'PUT',
      bucket: bucket,
      object: object,
      headers: {},
      signHeaders: true,
    })

    var options = Object.assign(url.parse(urlObj.url), {
      headers: urlObj.headers,
      method: 'PUT',
    })

    var req = http.request(options, function(res) {
      res.statusCode.should.equal(200)
      res.on('data', function() {})
      res.on('end', function() {
        done()
      })
    })

    req.on('error', function(e) {
      should.not.exist(e)
      done()
    })

    req.write('hello,wolrd', 'utf8')
    req.end()
  })

  it('put with getSignedUrl (sign url)', function(done) {
    var urlObj = oss.getSignedUrl({
      method: 'PUT',
      bucket: bucket,
      object: object,
      headers: {},
      signHeaders: false,
      expires: 60,
    })

    var options = Object.assign(url.parse(urlObj.url), {
      headers: urlObj.headers,
      method: 'PUT',
    })

    var req = http.request(options, function(res) {
      res.statusCode.should.equal(200)
      res.on('data', function() {})
      res.on('end', function() {
        done()
      })
    })

    req.on('error', function(e) {
      should.not.exist(e)
      done()
    })

    req.write('hello,wolrd', 'utf8')
    req.end()
  })

  it('put with getSignedUrl (sign url), expired', function(done) {
    var urlObj = oss.getSignedUrl({
      method: 'PUT',
      bucket: bucket,
      object: object,
      headers: {},
      signHeaders: false,
      expires: 1,
    })

    var options = Object.assign(url.parse(urlObj.url), {
      headers: urlObj.headers,
      method: 'PUT',
    })

    setTimeout(function() {
      var req = http.request(options, function(res) {
        res.statusCode.should.equal(403)
        res.on('data', function() {})
        res.on('end', function() {
          done()
        })
      })

      req.on('error', function(e) {
        should.not.exist(e)
        done()
      })
      req.write('hello,wolrd', 'utf8')
      req.end()
    }, 3000)
  })

  it('get object no dest', function(done) {
    oss.getObject(
      {
        bucket: bucket,
        object: object,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.body.toString().should.equal('hello,wolrd')
        done()
      },
    )
  })

  it('copy object', function(done) {
    oss.copyObject(
      {
        sourceBucket: bucket,
        sourceObject: object,
        bucket: bucket,
        object: object + 'copy',
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('delete object', function(done) {
    oss.deleteObject(
      {
        bucket: bucket,
        object: object,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(204)
        done()
      },
    )
  })

  it('delete copy object', function(done) {
    oss.deleteObject(
      {
        bucket: bucket,
        object: object + 'copy',
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(204)
        done()
      },
    )
  })

  var name = object + '.txt'

  it('put object with lower-upper header', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: name,
        headers: {
          'content-TYPE': 'text/plain',
        },
        source: new Buffer('hello,wolrd', 'utf8'),
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.objectUrl.should.equal(
          'http://' + bucket + '.' + config.host + '/' + name,
        )
        done()
      },
    )
  })

  it('get object', function(done) {
    oss.getObject(
      {
        bucket: bucket,
        object: name,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.headers['content-type'].should.equal('text/plain')
        res.body.toString().should.equal('hello,wolrd')
        done()
      },
    )
  })

  it('delete object', function(done) {
    oss.deleteObject(
      {
        bucket: bucket,
        object: name,
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

describe('# put object by stream', function() {
  var bucket = uuid.v4(),
    object = uuid.v4()

  it('create bucket', function(done) {
    oss.createBucket(
      {
        bucket: bucket,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('put object', function(done) {
    var input = fs.createReadStream(__filename)

    oss.putObject(
      {
        bucket: bucket,
        object: object,
        source: input,
        headers: {
          'Content-Length': fs.statSync(__filename).size,
        },
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.objectUrl.should.equal(
          'http://' + bucket + '.' + config.host + '/' + object,
        )
        done()
      },
    )
  })

  it('delete object', function(done) {
    oss.deleteObject(
      {
        bucket: bucket,
        object: object,
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

describe('# delete multi object', function() {
  var bucket = uuid.v4(),
    object1 = uuid.v4(),
    object2 = uuid.v4()

  it('create bucket', function(done) {
    oss.createBucket(
      {
        bucket: bucket,
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        done()
      },
    )
  })

  it('put object', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: object1,
        source: new Buffer('hello,wolrd', 'utf8'),
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

  it('put object again', function(done) {
    oss.putObject(
      {
        bucket: bucket,
        object: object2,
        source: new Buffer('hello,wolrd', 'utf8'),
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

  it('delete multi objects', function(done) {
    oss.deleteObjects(
      {
        quiet: false,
        bucket: bucket,
        objects: [object1, object2],
      },
      function(error, res) {
        should.not.exist(error)
        res.status.should.equal(200)
        res.body.DeleteResult.Deleted.length.should.equal(2)
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
