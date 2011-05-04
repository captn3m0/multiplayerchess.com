var couchdb = require('./couchdb'),
    errors = require('./errors'),
    generateId = require('./utils').generateId,
    encrypt = require('./utils').encrypt,
    config = require('./config');

function createLink(options, callback){
  var doc = {
    '_id':generateLinkId(),
    'type':'link',
    'profile':options.profileId,
    'session':options.sessionId
  };
  
  couchdb.save(doc, function(error, ok){
    if(error){
      return callback(errors.linkCreate);
    }

    callback(undefined, doc);
  });
}

function createProfile(options, callback){
  console.log('Creating New Profile. Name:'+options.name);

  var doc = {
    '_id':options.name,
    'type':'profile',
    'email':options.email,
    'password':encrypt(options.password),
    'score':0,
    'facebook':options.facebook,
    'twitter':options.twitter,
    'create_ts':config.interval.end,
    'lastseen_ts':config.interval.end
  };

  couchdb.save(doc, function(error, ok){
    if(error){
      console.log('An error occured creating new profile:',error);
      return callback(errors.profileCreate);
    }

    callback(undefined, doc);
  });
}

function generateLinkId(){
  return 'l'+generateId();
}

function generateProfileId(){
  return 'p'+generateId();
}


function getLink(spId, callback){
  couchdb.get(spId, function(error, doc){
    
    !error && doc.type != 'link' && ( error = new Error('Requested record is not a link document') );
      
    if(error){
      return callback(errors.linkObtain);
    }

    callback(undefined, doc);

  });
}

function getProfile(options, callback){
  couchdb.get(options.name, function(error, doc){
    
    !error && doc.type != 'profile' && ( error = new Error('Requested record is not a profile document') );
      
    if(error){
      return callback(errors.profileObtain);
    }

    callback(undefined, doc);

  });
}

module.exports = {
  'createLink':createLink,
  'createProfile':createProfile,
  'generateId':generateId,
  'generateLinkId':generateLinkId,
  'getLink':getLink,
  'getProfile':getProfile
}
