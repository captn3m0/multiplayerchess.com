var Session = require('./session').Session,
    gameplay = require('./setup').gameplay,
    dialogbox, navigator, board, updateContainerClass, resizeSidebar;

var gameplayFen = null,
    playing = false,
    paused = false,
    index;

function setup(){
  dialogbox = require('./widgets/dialogbox');
  board = require('./widgets/board');
  updateContainerClass = require('./widgets/container').updateClass;
  resizeSidebar = require('./widgets/sidebar').resize;
  navigator = require('./navigator');
}

function navigate(args){
  var subcommand = args[1];

  if(subcommand){
    dialogbox.close();
    module.exports[subcommand]();
    return;
  }

  dialogbox.close();
  play();
}

function pause(){
  if(paused){
    return;
  }
  if(!playing){
    play();
  }
  paused = true;
  updateContainerClass();
  resizeSidebar();
}

function play(){
  if(playing && !paused){
    return;
  } 
  
  if(!paused){
    index = 0;
    gameplayFen = gameplay.context.fen();
    gameplay.context.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  playing = true;
  paused  = false;

  updateContainerClass();
  resizeSidebar();

  var moves = gameplay.session.moves,
      next = undefined;

  (function(i){
    
    if(!playing || !moves[i] || i>=moves.length-1 || !gameplay.session.id){
      setTimeout(stop,1500);
      return;
    } else if(paused){
      return;
    }
    
    next = arguments.callee.bind(undefined, ++index);

    gameplay.context.move(moves[i]);
    board.refresh();
    board.cleanLastMoveHighlight();

    setTimeout(next, 1000);
    
  })(index);

}

function stop(){
  playing = false;
  paused = false;
  index = 0;

  gameplayFen && gameplay.context.load(gameplayFen);
  board.refresh();
  board.highlightLastMove();
  updateContainerClass();
  resizeSidebar();

  navigator.resetDialogs();
}

module.exports = {
  'navigate':navigate,
  'pause':pause,
  'paused':function(){ return paused; },
  'play':play,
  'playing':function(){ return playing; },
  'setup':setup,
  'stop':stop
}
