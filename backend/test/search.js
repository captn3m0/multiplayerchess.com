var session = require('../lib/session'),
    player = require('../lib/player');
    assert = require('assert');

var players = (function(){

  var p1 = p2 = undefined;

  function create(callback){
    player.createProfile({ 'name':'foo', 'email':'foo@foo.foo', 'password':'foo' },function(error,p1doc){
      if(error){
        return callback(error);
      }


      player.createProfile({ 'name':'bar', 'email':'bar@bar.bar', 'password':'bar' },function(error, p2doc){
        if(error){
          return callback(error);
        }

        callback(undefined,{ 'p1':p1doc, 'p2':p2doc });
      });
    });
  };

  function get(){
    return {
      'p1':p1,
      'p2':p2
    }
  }

  return function(callback){
    if(!p1){
      create(function(error, docs){
        if(error){
          return callback(error);
        }


      });
    }
  }

})();

function test_basic(callback){
  
}

module.exports = {
  'name':'search',
  'test_basic':test_basic
}
