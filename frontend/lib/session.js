var Observable = require('observer').Observable,
    relativeDate = require('relative-date'),
    inherits = require('util').inherits,
    prettifyTimestamp = require('./ui').prettifyTimestamp,
    getServerTime = require('./service').getServerTime;

function Session(){
  Observable.call(this);

  this.captures = undefined;
  this.createTS = undefined;
  this.fen = undefined;
  this.gameplay = undefined;
  this.id = undefined;
  this.isPrivate = undefined;
  this.logs = undefined;
  this.rev = undefined;
  this.players = [];

  this.events.create('create');
  this.events.create('end');
  this.events.create('import');
  this.events.create('join');
  this.events.create('leave');
  this.events.create('opponentJoin');
  this.events.create('opponentLeave');
  this.events.create('start');
  this.events.create('update');
}

inherits(Session, Observable);

Session.prototype.player = function(property,value, type){
  var i,len;
  if(this.players && this.players.length){
    for(i = -1, len=this.players.length; ++i < len; ){
      if( ( !type && this.players[i][property] == value ) || ( type && this.players[i][property] && typeof this.players[i][property] == type ) ){
        return this.players[i];
      }
    };
  }
};

Session.prototype.findCaptures = function(){
  var captures = [],
      pieces = this.fen.substring(0,this.fen.indexOf(' ')).replace(/[^a-zA-Z]/g,''),
      i,len,piece,found,lack, t;

  if(pieces.length<32){
    for(i = -1, len=pieceVariants.length; ++i < len; ){
      piece = pieceVariants[i];
      
      found = pieces.match(new RegExp(piece[0],'g'));
      lack = piece[1] - ( found && found.length || 0 );
      for(t=-1; ++t < lack;){
        captures.push(piece[0]);
      }

      found = pieces.match(new RegExp(piece[0].toUpperCase(),'g'));
      lack = piece[1] - ( found && found.length || 0 );
      for(t=-1; ++t < lack;){
        captures.push(piece[0].toUpperCase());
      }
    };
  }

  return captures;
}

Session.prototype.importServiceResponse = function(response){
  var doc = response.document,
      update = this.fen != doc.fen || this.players.length != response.players.length,
      start = this.players.length <2 && response.players.length == 2,
      create = this.players.length == 0 && response.players.length == 1,
      join = this.players.length == 0 && response.players.length == 2,
      opponentJoin = this.players.length == 1 && this.players[0].id && response.players.length == 2;

  this.createTS = doc.create_ts;
  this.end = doc.end;
  this.id = doc._id;
  this.rev = doc._rev;
  this.fen = doc.fen;
  this.players = response.players;
  this.isPrivate = doc.is_private;
  this.shortenedId = doc.shortened_id;
  this.captures = this.findCaptures();
  this.logs = [];
  this.moves = [];
  
  this.singleplayer = doc.singleplayer;

  var i, len, log, lastMoveLog;
  for(i = -1, len=doc.logs.length; ++i < len; ){
    log = doc.logs[i];
    log.relativeDate = relativeDate.bind(undefined,log.ts,getServerTime());

    if(log.code==3){
      lastMoveLog = this.moves[this.moves.length-1];
      log[ lastMoveLog && lastMoveLog.white && 'black' || 'white' ] = true;
      this.moves.push(log);
    } else {
      this.logs.push(log);
    }
  };

  this.gameplay.context.load(this.fen);

  update && this.events.publish('update');
  create && this.events.publish('create');
  join && this.events.publish('join');
  opponentJoin && this.events.publish('opponentJoin');
  start && this.events.publish('start');

  var opponentLeave = this.players.length == 2 && !this.gameplay.getOpponent().online;
  if(opponentLeave){ 
    this.gameplay.state = 2;
    this.events.publish('opponentLeave');
  };

  this.events.publish('import');
};

Session.prototype.pgn = function(options){
  !options && ( options = {} );

  var white = this.gameplay.white(),
      black = this.gameplay.black();

  white = white ? white.nickname : '';
  black = black ? black.nickname : '';
  
  options.event = white+' vs '+black;
  options.site = 'multiplayerchess.com';
  options.date = prettifyTimestamp(this.createTS);
  options.round = 1;
  options.white = white;
  options.black = black;
  options.result = this.end && this.moves[this.moves.length-1].san || '*';

  var i = 1;
  options.movetext = this.moves.length == 0 ? '' : this.moves.reduce(function(a,b){ 
    return (typeof a=='string' ? a : '1. '+a.san )+( b.white ? (++i)+'. ' : ' ' )+b.san+' ' 
  });

  return  ''
        + '[Event "'+options.event+'"]\n'
        + '[Site "'+options.site+'"]\n'
        + '[Date "'+options.date+'"]\n'
        + '[Round "'+options.round+'"]\n'
        + '[White "'+options.white+'"]\n'
        + '[Black "'+options.black+'"]\n'
        + '[Result "'+options.result+'"]\n'
        + '\n'
        + options.movetext
        
};

var pieceVariants = [
  ['k',1], // king
  ['q',1], // queen
  ['r',2], // rook
  ['n',2], // knight
  ['b',2], // bishop
  ['p',8] // pawn
];


module.exports = {
  'Session':Session
}
