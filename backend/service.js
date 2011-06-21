var publish     = require('./publish'),
    session     = require('./session'),
    config      = require('./config'),
    crypto      = require('crypto'),
    getDocument = require('./couchdb').get,
    fs          = require('fs'),
    router      = publish.router,
    log         = publish.log,
    ip          = publish.ip;

router.options('',function(request,emit){
  emit(null,{}).end();
});

router.get('^/?$',function(request,emit){
  emit(null,{ 'multiplayerchess.com':'welcome!' }).end();
});

router.register(['GET','POST'],'^/players/online/?$', function(request,emit){
  session.listOnlinePlayers(function(error,result){
    if(error){ 
      return emit(error);
    }

    var responseBody = { 'online_player_count':result.total_rows-result.offset };
    if(request.body.spId){
      session.updateSessionPlayerTS(request.body.spId,function(error, result){
        if(error) return emit(error);
        responseBody.update_player_ts = true;
        emit(null, responseBody).end();
      });
    } else {
      emit(null,responseBody).end();
    }
  });
});

router.register(['POST','PUT'],'^/session/init/?$', function(request,emit){
   var options = { 
      'sessionId':session.generateSessionId(), 
      'isPrivate':true, 
      'nickname':request.body.nickname,
      'ip':ip(request)
   };

  log('Initializing new session. IP:',options.ip,' Nickname:',options.nickname);

  session.create(options,function(error, result){
    if(error){
      emit(error);
    } else {
      session.get(options.sessionId, emitSession.bind(undefined, emit, undefined));
    }
  });

});

router.register(['POST','PUT'],'^/session/new/?$', function(request,emit){
  var isPrivate = !!request.body.isPrivate || !!request.body.password, 
      options = { 
        'sessionId':session.generateSessionId(), 
        'spId':session.generateSessionPlayerId(),
        'isPrivate':isPrivate, 
        'password':request.body.password,
        'nickname':request.body.nickname,
        'ip':ip(request)
      };

  log('Creating new session. IP:',options.ip,' Nickname:',options.nickname,'IsPrivate:',options.isPrivate);

  session.create(options,function(error, result){
    if(error){
      emit(error);
    } else {
      session.createSessionPlayer(options, function(error, sprec){
        if(error){
          emit(error);
        } else {
          session.get(options.sessionId, emitSession.bind(undefined, emit, options.spId));
        }
      });
    }
  });

});

router.get('^/session/([\\w\-]+)/?$', function(request,emit,sessionId){
  session.get(sessionId,emitSession.bind(undefined,emit,request.body.spId));
});

router.register(['PUT','POST'],'^/session/([\\w\-]+)/join/?$', function(request,emit,sessionId){
  var password = request.body.password ? crypto.createHash('md5').update(request.body.password).digest("hex") : undefined,
      options = { 
        'sessionId':sessionId, 
        'spId':request.body.spId, 
        'password':password,
        'nickname':request.body.nickname,
        'ip':ip(request)
      };

  log('Joining Session#',options.sessionId,'SP:',options.spId,'IP:',options.ip,'Nickname:',options.nickname);

  if(options.spId){
    session.restoreSessionPlayer(options, function(error, result){
      if(error){
        emit(error);
      } else {
        session.get(sessionId, emitSession.bind(undefined, emit, options.spId));
      }
    });
  } else {
    options.spId = session.generateSessionPlayerId();
    session.createSessionPlayer(options, function(error, rec){
      session.attachSessionPlayer(options,function(error, result){
        session.get(sessionId, function(gError,doc){
          if(error && gError){
            emit(error);
            return;
          }
          
          doc.ok = !error;
          emitSession(emit, options.spId, undefined, doc);

        });
      });
    });
  }

});

router.register(['GET','POST'],'^/session/([\\w\-]+)/listen/opponent/?$', function(request,emit,sessionId){
  session.listenForOpponent(sessionId,emitSession.bind(undefined,emit,request.body.spId));
});

router.register(['POST','PUT'],'^/session/([\\w\-]+)/listen/update/?$', function(request,emit,sessionId){
  console.log('>>',request.body,request.body['revision']);
  session.listenForUpdate({ 'sessionId':sessionId,'rev':request.body.revision, 'spId':request.body.spId },emitSession.bind(undefined,emit,request.body.spId));
});

router.register(['POST','PUT'],'^/session/([\\w\-]+)/move/?$', function(request,emit,sessionId){
  var move = { 'from':request.body.from, 'to':request.body.to, 'promotion':request.body.promotion };
  session.makeMove(sessionId, request.body.spId, move, function(error, result){
    if(error){
      emit(error);
    } else {
      session.get(sessionId, emitSession.bind(undefined, emit, request.body.spId));
    }
  });
});

router.register(['POST','PUT'],'^/session/([\\w\-]+)/resign/?$', function(request,emit,sessionId){
  console.log('Resign. spId:',request.body.spId);
  session.resign(request.body.spId,function(error){
    if(error){
      emit(error);
    } else {
      session.get(sessionId, emitSession.bind(undefined, emit, request.body.spId));
    }
  });
});

router.get('^/sessions/available/?$', function(request,emit){
  session.listAvailableSessions(function(error,sessions){
    emit(null,{ 'sessions':sessions }).end();
  });
});

router.post('^/session/start/?$', function(request,emit){

  var options = {
    'sessionId':undefined,
    'spId':session.generateSessionPlayerId(),
    'isPrivate':false,
    'nickname':request.body.nickname,
    'ip':ip(request)
  };

  log('Starting to search online player','IP:',options.ip,'Nickname:',options.nickname);

  session.listAvailableSessions(function(error,sessions){
    (function(sessionInd){
      
      console.log('!',error);

      var tryNext = arguments.callee.bind(undefined,sessionInd+1);
      if(sessionInd>=sessions.length){
        options.sessionId = session.generateSessionId();
        session.create(options,function(error, result){
          if(error){
            emit(error);
          } else {
            session.createSessionPlayer(options, function(error, sprec){
              if(error){
                emit(error);
              } else {
                session.get(options.sessionId, emitSession.bind(undefined, emit, options.spId));
              }
            });
          }
        });

      } else if(request.body.ignoreList && request.body.ignoreList.indexOf(sessions[sessionInd])>-1) {
        tryNext();
      } else {

        options.sessionId = sessions[sessionInd];
        session.createSessionPlayer(options, function(error, rec){
          if(error){
            return emit(error);
          }
          session.attachSessionPlayer(options,function(error, result){
            if(error){
              tryNext();
            } else {
              session.get(options.sessionId, emitSession.bind(undefined, emit, options.spId));
            }
          });
        });

      }

    })(0);
  });
});

function emitSession(emit,spId,error,session){
  if(error){
    return emit(error);
  }

  delete session.document.players;

  session.document.password && ( session.document.password = true );

  filterPlayerList(session.players,spId); 
  return emit(null, session).end();
}

function filterPlayerList(players,requestOwner){
  for(var i = -1, len=players.length; ++i < len; ){
    var player = players[i];
    if(player.id!=requestOwner){
      delete player['id'];
    }
  };
}

fs.writeFileSync('.pid', process.pid.toString(), 'ascii');
publish.start();
console.log('Started publishing multiplayerchess.com at '+config.HOST+':'+config.PORT);
