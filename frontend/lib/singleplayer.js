var toledoChess = require('toledo-chess'),
    relativeDate = require('relative-date'),
    gameplay = require('./setup').gameplay,
    chess = gameplay.context,
    dialogbox = require('./widgets/dialogbox'),
    dialogs;

function counter(move,callback){
  toledoChess.makeMove(move.from, move.to, function(san){
    callback(moveObject(san.from, san.to));
  });
}

function document(){
  var now = (new Date).getTime();
  return {
    'document' : {
      '_id':'singleplayer',
      'singleplayer':true,
      'offline':true,
      'create_ts':now,
      'end':false,
      'fen':'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'logs':[
        { 'code':1, 'message':'Singleplayer session created.', 'ts':now }
      ]
    },
    'players': [
      { 'id':'sp0', 'white':true, 'nickname':dialogs.nickname.get(), 'last_move_ts':now, 'online':true },
      { 'black':true, 'nickname':'AI', 'last_move_ts':now, 'online':true }
    ]
  }
}

function moveObject(from, to){
  var i,len, moves = chess.moves({ 'verbose':true });
  for(i = -1, len=moves.length; ++i < len; ){
    if(moves[i].from==from && moves[i].to == to){
      return moves[i];
    }
  };
}

function listen(move){

  if(!gameplay.session.singleplayer){
    return;
  }

  var now = Number(new Date);

  move.white = true;
  move.ts = now;
  move.relativeDate = relativeDate.bind(undefined,now);
  gameplay.session.moves.push(move);
  gameplay.session.fen = gameplay.context.fen();
  gameplay.session.captures = gameplay.session.findCaptures();
  gameplay.session.events.publish('update');

  !gameplay.context.game_over() && counter(move,function(blackMove){
    gameplay.context.move(blackMove);
    blackMove.black = true;
    blackMove.ts = now;
    blackMove.relativeDate = relativeDate.bind(undefined,now);
    gameplay.session.moves.push(blackMove);
    gameplay.session.fen = gameplay.context.fen();
    gameplay.session.captures = gameplay.session.findCaptures();
    gameplay.session.events.publish('update');

    gameplay.session.moves.length == 2 && gameplay.session.events.publish('start');
  });

}

function navigate(){
  if(!gameplay.session.singleplayer){
    dialogbox.close();
    setup();
  }
}

function resign(){
  gameplay.white().resigned = true;
  gameplay.session.end = true;
  gameplay.session.events.publish('end');
}

function setup(){

  gameplay.reset();

  toledoChess.W.disabled = true;
  toledoChess.init();
  
  dialogs = require('./dialogs');

  gameplay.state = 3;
  gameplay.session.importServiceResponse(document());

  var board = require('./widgets/board');

  if(board.events.get('move').indexOf(listen)){
    board.on('move',listen);
  }

}

module.exports = {
  'navigate':navigate,
  'resign':resign,
  'setup':setup
}
