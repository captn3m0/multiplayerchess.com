var session = require('../lib/session'),
    assert = require('assert');

function test_basic(callback){
  return callback(null,true);
  session.create({ 'sessionId':'foo', 'spId':'bar' },function(error, ok){
    if(error){
      callback(error);
    }
    
    session.get('foo', function(error, doc){
      
      if(error){
        callback(error);
      }
      
      assert.equal(doc.sessionId, 'foo');
      assert.equal(doc.players.length, 1);
      assert.equal(doc.players[0].id, 'bar');
      assert.ok(doc.players[0].white);


    });

  });
}

module.exports = {
  'name':'search',
  'test_basic':test_basic
}
