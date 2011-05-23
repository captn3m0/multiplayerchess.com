var Chess = require('chess').Chess,
    config = require('./config'),
    couchdb = require('./couchdb'),
    b62 = require('base62'),
    query = couchdb.query,
    getDocument = couchdb.get,
    save = couchdb.save,
    log = require('./publish').log;

var initialBoard = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function attachSessionPlayer(options,callback){
  get(options.sessionId, function(error, session){

    !error && session.players.length == 2 && ( error = new Error('Session has 2 players already.') );
    !error && session.document.password && session.document.password != options.password && ( error = new Error('Invalid Password') );
    !error && session.document.end && ( error = new Error('The session you\'ve tried to join is ended.') );

    if(error){
      return callback(error);
    }

    var doc = session.document,
        entry = { 'id':options.spId },
        color = ( session.players.length && session.players[0].white ) && 'black' || 'white';

    entry[ color ] = true;

    doc.logs.push({ 
      'code'    : 2, 
      'message' : color.charAt(0).toUpperCase() 
                + color.slice(1)
                + ' player connected.', 
      'ts'      : config.interval.end 
    });

    doc.players.push(entry);

    save(doc,callback);
  });
}

function create(options, callback){
  var session = {
    '_id':options.sessionId,
    'create_ts':config.interval.end,
    'type':'session',
    'fen':initialBoard,
    'logs':[{ 'code':1, 'message':'Session created.', 'ts':config.interval.end }],
    'players':[]
  };

  if(options.spId){
    session.logs.push({ 'code':2, 'message':'White player connected.', 'ts':config.interval.end });
    session.players.push({
      'id':options.spId,
      'white':true
    });
  }

  options.isPrivate && ( session.is_private = true );
  options.password && ( session.password = options.password );
  
  save(session,callback); 
}

function createSessionPlayer(options,callback){
  log('Creating new SessionPlayer. IP:',options.ip, 'Nickname:',options.nickname);
  save({
    '_id':options.spId,
    'type':'session_player',
    'session':options.sessionId,
    'nickname':!!options.nickname && options.nickname.length > 1 && options.nickname.length < 21 && !/[^\w@ ]+/.test(options.nickname) ? options.nickname : 'Anonymous',
    'ip':options.ip,
    'last_move_ts':config.interval.end
  }, callback);
}

function generateId(){
  return parseInt(Math.floor(Math.random()*999999999999));
}

function generateSessionPlayerId(){
  return 'sp'+generateId();
}

function generateSessionId(){
  return b62.encode(generateId());
}

function get(id,callback){
  return query('GET','_design/list/_view/sessions?key="'+id+'"&include_docs=true',null, function(error, result){
    if(error) return callback(error);

    var doc = null,
        playertable = {};

    for(var i = -1, len=result.rows.length; ++i < len; ){
      var row = result.rows[i];
      
      if(row.value.type=='session' && doc==null){
        doc = row.value;
      } else if( row.doc.type == 'session_player' ){
        playertable[row.doc._id] = row.doc;
      }
    }

    if(doc==null){
      return callback(new Error('Missing Document'));
    }

    var players = [];
    for(var i = -1, len=doc.players.length; ++i < len; ){
      if(!playertable.hasOwnProperty(doc.players[i].id)){ 
        continue;
      }
      var player = doc.players[i],
          ts = playertable[player.id].last_move_ts;

      players.push({
        'id':player.id,
        'white':player.white,
        'black':player.black,
        'nickname':playertable[player.id].nickname,
        'last_move_ts':ts,
        'online':config.interval.start<ts
      });
    }

    callback(null,{ 'id':doc._id, 'document':doc, 'players':players });
  });
}

function listAvailableSessions(callback){
  listOnlinePlayers(function(error, result){
    if(error) return callback(error); 

    var sessions = [],
        ids = result.rows.map(function(el){ return el.value._id });

    for(var i = -1, len=result.rows.length; ++i < len; ){
      var row = result.rows[i],
          session = row.doc,
          sole = session && ids.indexOf(session._id,ids.indexOf(session._id)+1)==-1;

     session && !session.end && !session.is_private && sole && sessions.push(session._id);
    };

    callback(null,sessions);
  });
}

function listenForUpdate(sessionId,rev,callback,executionCounter){
  !executionCounter && ( executionCounter = 0 );
  var delay = 1000;

  get(sessionId,function(error,session){
    if(error){
      callback(error);
    } else if(session.document._rev != rev) {
      callback(null,session);
    } else if(executionCounter<15/(delay/1000)){
      setTimeout(listenForUpdate,delay,sessionId,rev,callback,executionCounter+1);
    } else {
      session.ok = false;
      callback(null,session);
    }

  });
}

function listenForOpponent(sessionId,callback,executionCounter){
  !executionCounter && ( executionCounter = 0 );
  var delay = 1000;
  return get(sessionId,function(error,session){
    if(error){
      callback(error);
    } else if(session.players.length==2) {
      callback(null,session);
    } else if(executionCounter<30/(delay/1000)){
      setTimeout(listenForOpponent,delay,sessionId,callback,executionCounter+1);
    } else {
      session.ok = false;
      callback(null,session);
    }
  });
}

function listOnlinePlayers(callback){
  return query('GET','_design/list/_view/players?include_docs=true&startkey='+config.interval.start,null,callback);
}

function makeMove(sessionId,spId,move,callback){
  
  if(!move || !move.from || !move.to){
    return callback(new Error('Invalid move'));
  }

  get(sessionId,function(error,session){
    if(error) return callback(error);

    var self = null,
        opponent = null,
        doc = session.document;

    for(var i = -1, len=session.players.length; ++i < len; ){
      session.players[i].id == spId && ( self = session.players[i] ) || ( opponent = session.players[i] );
    };

    if(!self){
      callback(new Error('Invalid user.'));
      return;
    }

    var ctx = new Chess(doc.fen),
        turn = ctx.turn() == 'w' && 'white' || 'black';

    if(!self[turn]){ 
      error = new Error('It\'s '+turn+'\'s move.');
      error.statusCode = 200;
      return callback(error);
    }

    move = ctx.move(move);

    if(move){
      doc.fen = ctx.fen();
      doc.logs.push({ 'code':3, 'from':move.from, 'to':move.to, 'san':move.san, 'ts':config.interval.end });

      if(ctx.game_over()){ 
        doc.end = true
        doc.logs.push({ 'code':3, 'san':turn=='White' ? '1-0' : '0-1' });
        doc.logs.push({ 'code':1, 'message':'Checkmate, '+turn+' wins.', 'ts':config.interval.end });

        getDocument(self.id, function(error, player){
          player.quit = true;
          save(player);
        });

        getDocument(opponent.id, function(error, player){
          player.quit = true;
          save(player);
        });
      }

      save(doc, callback);
    } else {
      callback(new Error('Invalid move.'));
    }
  });
}

function updateSessionPlayerTS(spId,callback){ 
  getDocument(spId, function(error, doc){
    if(error){
      return callback && callback(error);
    }

    doc.last_move_ts = config.interval.end;
    save(doc, callback);
  });
}

function restoreSessionPlayer(options,callback){
  log('Restoring Session.','SessionId:',options.sessionId,'SPId:',options.spId);
  get(options.sessionId, function(error, session){

    var entry, i, isOnline = false;

    !error && session.document.password && session.document.password != options.password && ( error = new Error('Invalid Password') );

    if(!error && session.players.length == 2){
      for(i = -1, len=session.players.length; ++i < len; ){
        if(session.players[i].id==options.spId){
          isOnline = true;
        } 
      };

      !isOnline && ( error = new Error('Session has 2 players already.') );
    }

    if(!error){
      for(i = -1, len=session.document.players.length; ++i < len; ){
        if(session.document.players[i].id==options.spId){
          entry = session.document.players[i];
          break; 
        }
      };

      !entry && ( error = new Error('Couldn\'t found any matching player record.') );
    }

    if(error){
      return callback(error);
    }
    
    updateSessionPlayerTS(entry.id, callback);
  });
}

module.exports = {
  'attachSessionPlayer':attachSessionPlayer,
  'create':create,
  'createSessionPlayer':createSessionPlayer,
  'generateId':generateId,
  'generateSessionId':generateSessionId,
  'generateSessionPlayerId':generateSessionPlayerId,
  'get':get,
  'listAvailableSessions':listAvailableSessions,
  'listenForOpponent':listenForOpponent,
  'listenForUpdate':listenForUpdate,
  'listOnlinePlayers':listOnlinePlayers,
  'makeMove':makeMove,
  'restoreSessionPlayer':restoreSessionPlayer,
  'updateSessionPlayerTS':updateSessionPlayerTS
};
