var toledoChess = require('toledo-chess'),
    relativeDate = require('relative-date'),
    gameplay = require('./setup').gameplay,
    chess = gameplay.context,
    dialogs;

function counter(move,callback){
  toledoChess.makeMove(move.from, move.to, function(san){
    callback(moveObject(san.from, san.to));
  });
}

function document(_id){
  var now = (new Date).getTime(),
      id = _id,
      fen = localStorage[_id] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  return {
    'document' : {
      '_id':id,
      'singleplayer':true,
      'create_ts':now,
      'fen':fen,
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

  sync();

  !gameplay.context.game_over() && counter(move,function(blackMove){
    gameplay.context.move(blackMove);
    blackMove.black = true;
    blackMove.ts = now;
    blackMove.relativeDate = relativeDate.bind(undefined,now);
    gameplay.session.moves.push(blackMove);
    gameplay.session.fen = gameplay.context.fen();
    gameplay.session.captures = gameplay.session.findCaptures();
    gameplay.session.events.publish('update');

    sync();
  });

}

function navigate(id){
  setup(id);
}

function setup(id){

  toledoChess.W.disabled = true;
  toledoChess.init();
  
  dialogs = require('./dialogs');

  gameplay.state = 3;
  gameplay.session.importServiceResponse(document(id));
  
  var board = require('./widgets/board');

  if(board.events.get('move').indexOf(listen)){
    board.on('move',listen);
  }

}

function sync(){
  localStorage[gameplay.session.id] = chess.fen();
}

module.exports = {
  'navigate':navigate,
  'setup':setup
}
