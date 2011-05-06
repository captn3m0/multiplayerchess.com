var Chess = require('chess').Chess,
    config = require('./config'),
    couchdb = require('./couchdb'),
    b62 = require('base62'),
    log = require('./publish').log,
    errors = require('./errors'),
    generateId = require('./utils').generateId,
    player = require('./player'),
    operateAsync = require('./utils').operateAsync;

var initialBoard = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function bindBlackPlayer(options, callback){
  player.createLink(options, function(error, link){
    if(error){
      return callback(error);
    }

    couchdb.get(options.sessionId, function(error, doc){
      doc.players.push({
        'id':link.id,
        'color':'black'
      });
      doc.logs.push({ 'code':2, 'message':'Black player connected.', 'ts':config.interval.end });
      couchdb.save(doc);

      callback(undefined, link);
    });
  });

}

function create(options, callback){
  log('Creating new session.','Private?'+options.is_private,'Profile');
  var id = generateSessionId();

  player.createLink({ 'profileId':options.profileId }, function(error, link){
    var session = {
      '_id':id,
      'type':'session',
      'create_ts':config.interval.end,
      'fen':initialBoard,
      'logs':[{ 'code':1, 'message':'Session created.', 'ts':config.interval.end },{ 'code':2, 'message':'White player connected.', 'ts':config.interval.end }],
      'players':[{
        'id':link._id,
        'white':true
       }]
    };

    options.isPrivate && ( session.is_private = true );
    
    couchdb.save(session,function(error, ok){
      if(error){
        return callback(errors.sessionCreate);
      }

      callback(undefined, session);
      
    });

  });

}

function generateSessionId(){
  return b62.encode(generateId());
}

function get(id, callback){
  couchdb.get(id, function(error, doc){
    if(error){
      return callback(errors.sessionObtain);
    }

    callback(undefined, doc);

  });
}

function getWithLinks(id, callback){
  couchdb.get(id, function(error, doc){
    if(error){
      return callback(errors.sessionObtain);
    }

    var getters = { 'p1':player.getLink.bind(undefined, doc.players[0].id) };
    doc.players.length > 1 && ( getters.p2 = player.getLink.bind(undefined, doc.players[1].id) );

    operateAsync(getters, function(error, links){
      if(error){
        return callback(errors.linksetObtain);
      }

      doc.players[0].link = links.p1;
      doc.players.length > 1 && ( doc.players[1].link = links.p2 );

      callback(undefined, doc);

    });

  });
}

module.exports = {
  'bindBlackPlayer':bindBlackPlayer,
  'create':create,
  'get':get,
  'getWithLinks':getWithLinks
};
