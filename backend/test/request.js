var request = require('../lib/utils').request,
    config = require('../lib/config'),
    base64 = require('base64'),
    assert = require('assert');

function test_basic(callback){
  request('GET', 'http://127.0.0.1', undefined, undefined, function(error, response){
    if(error){
      callback(error);
    }

    callback(null, true);
  });
}

function test_auth(callback){
  var options = {
    'Host':config.DB_HOST,
    'Authorization':'Basic ' + base64.encode(config.DB_USER+':'+config.DB_PASSWD)
  };

  request('GET', config.DB_HOST+':5984/', undefined, options, function(error, response){
    if(error){
      callback(error);
    }

    callback(null, true);
  });
}

function test_data(callback){
  var options = {
    'Host':config.DB_HOST,
    'Authorization':'Basic ' + base64.encode(config.DB_USER+':'+config.DB_PASSWD)
  };

  request('PUT', config.DB_HOST+':5984/request_test_data', undefined, options, function(error, response){
    if(error){
      callback(error);
    }

    request('PUT', config.DB_HOST+':5984/request_test_data/foobar', '{ "pi":3.14159 }', options, function(error, response){
      if(error){
        callback(error);
      }

      request('GET', config.DB_HOST+':5984/request_test_data/foobar', undefined, options, function(error, response){
        if(error){
          callback(error);
        }

        var r = JSON.parse(response);
        assert.equal(r.pi, 3.14159);

        callback(null,true);

      });

    });
  });

  request('DELETE', config.DB_HOST+':5984/request_test_data', undefined, options, function(error, response){
    console.log('Deleted request_test_data database');
  });
}

module.exports = {
  'name':'request',
  'test_basic':test_basic,
  'test_auth':test_auth,
  'test_data':test_data
}
