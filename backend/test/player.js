var player = require('../lib/player'),
    assert = require('assert'),
    utils = require('../lib/utils');

function test_create_get_link(callback){
  player.createLink({ 'profileId':'p1', 'sessionId':'s1' }, function(error, rec){
    if(error){
      return callback(error);
    }

    player.getLink(rec._id, function(error, doc){
      if(error){
        return callback(error);
      }

      assert.equal(doc.type, 'link');
      assert.ok(doc._id);
      assert.equal(doc._id, rec._id);
      assert.equal(doc.profile, 'p1');
      assert.equal(doc.session, 's1');

      callback(null,true);

    });

  });
}

function test_create_get_profile(callback){
  var profile = {
    'name':'azer',
    'email':'azer@kodfabrik.com',
    'password':'azer',
    'twitter':'4zjs',
    'facebook':'de te fabula narratur'
  };
  player.createProfile(profile, function(error, rec){
    if(error){
      return callback(error);
    }

    player.getProfile({ 'name':profile.name }, function(error, pfrec){
      assert.equal(pfrec.type, 'profile');
      assert.equal(pfrec._id,profile.name);
      assert.equal(pfrec.email, profile.email);
      assert.ok(utils.validateEncryption(profile.password, pfrec.password));
      assert.equal(pfrec.twitter, profile.twitter);
      assert.equal(pfrec.facebook, profile.facebook);
      assert.equal(pfrec.score, 0);
      assert.ok(pfrec.create_ts);
      assert.ok(pfrec.lastseen_ts);

      callback(null,true);
    });
  });
}

module.exports = {
  'name':'player',
  'test_create_get_profile':test_create_get_profile,
  'test_create_get_link':test_create_get_link
}
