var session = require('../lib/session'),
    assert = require('assert');

function test_create_get_session(callback){
  session.create({ 'profileId':'p1' }, function(error, rec){
    if(error){
      return callback(error);
    }

    session.get(rec._id, function(error, doc){
      if(error){
        return callback(error);
      }

      assert.equal(doc.type, 'session');
      assert.equal(doc._id, rec._id);
      assert.equal(doc.fen, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      assert.equal(doc.logs.length, 2);
      assert.equal(doc.players.length, 1);
      assert.ok(doc.players[0].id);
      assert.ok(doc.players[0].white);
      assert.equal(doc.is_private, undefined);
      assert.ok(doc.create_ts);

      callback(null,true);

    });

  });
}

function test_get_with_links(callback){
  session.create({ 'profileId':'p1' }, function(error, rec){
    if(error){
      return callback(error);
    }

    session.getWithLinks(rec._id, function(error, doc){
      if(error){
        return callback(error);
      }

      assert.equal(doc.type, 'session');
      assert.equal(doc._id, rec._id);
      assert.equal(doc.fen, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      assert.equal(doc.logs.length, 2);
      assert.equal(doc.players.length, 1);
      assert.ok(doc.players[0].link._id);
      assert.equal(doc.is_private, undefined);
      assert.ok(doc.create_ts);

      callback(null,true);
    });

  });
}

function test_get_with_profiles(callback){
  session.create({ 'profileId':profile._id }, function(error, rec){
    if(error){
      return callback(error);
    }

    session.getWithProfiles(rec._id, function(error, doc){
      if(error){
        return callback(error);
      }

      assert.equal(doc.type, 'session');
      assert.equal(doc._id, rec._id);
      assert.equal(doc.fen, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      assert.equal(doc.logs.length, 2);
      assert.equal(doc.players.length, 1);
      assert.ok(doc.players[0].link.profile._id);
      assert.equal(doc.players[0].link.profile.name, 'foo');
      assert.equal(doc.is_private, undefined);
      assert.ok(doc.create_ts);

      callback(null,true);
    });

  });
}

function test_bind_black_player(callback){
  session.create({ 'profileId':'p1' }, function(error, rec){
    if(error){
      return callback(error);
    }

    session.bindBlackPlayer({ 'sessionId':rec._id, 'profileId':'p2' }, function(error,link){
      if(error){
        return callback(error);
      }

      assert.equal(link.type, 'link');
      assert.equal(link.profile, 'p2');

      session.get(rec._id, function(error, doc){
        if(error){
          return callback(error);

        }

        assert.equal(doc.logs.length, 3);
        assert.equal(doc.players.length, 2);

        assert.equal(doc.players[1].id, link.id);
        assert.equal(doc.players[1].color, 'black');

        callback(null,true);

      });
    });
  });
}

function test_create_get_private_session(callback){
  session.create({ 'profileId':'p1', 'isPrivate':true }, function(error, rec){
    if(error){
      return callback(error);
    }

    session.get(rec._id, function(error, doc){
      if(error){
        return callback(error);
      }

      assert.equal(doc.type, 'session');
      assert.equal(doc._id, rec._id);
      assert.equal(doc.fen, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      assert.equal(doc.logs.length, 2);
      assert.equal(doc.players.length, 1);
      assert.equal(doc.is_private, true);
      assert.ok(doc.create_ts);

      callback(null,true);

    });

  });
}

module.exports = {
  'name':'session',
  'test_bind_black_player':test_bind_black_player,
  'test_create_get_session':test_create_get_session,
  'test_get_with_links':test_get_with_links,
  'test_create_get_private_session':test_create_get_private_session
}
