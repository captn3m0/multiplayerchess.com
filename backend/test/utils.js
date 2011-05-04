var utils = require('../lib/utils'),
    crypto = require('crypto'),
    assert = require('assert');

function test_encryption(callback){
  var a = utils.encrypt('foobar'),
      parts = a.split('&');
      salt = parts[0],
      enc = parts[1];

  console.log('encrypt:',a,salt);

  assert.equal(enc,crypto.createHash('md5').update(salt+'&foobar').digest("hex"));
  assert.ok('foobar', utils.validateEncryption('foobar',a));

  callback(false,true);
}

module.exports = {
  'name':'utils',
  'test_encryption':test_encryption,
}
