var EventBroker = require('observer').EventBroker,
    ui = require('../ui'),
    css = require('css'),
    config = require('../config'),
    gameplay = require('../setup').gameplay,
    getSquareByCoords = require('./bg').getSquareByCoords,
    container = require('./container'),
    promptPromotion = require('../dialogs').promptPromotion,
    dragndrop = require('../dragndrop'),
    on = require('dom').on;

var select = null,
    focus;

function exists(square){
  return gameplay.context.get(square)&&true||false;
}

function getPiece(caption){
  var p = gameplay.context.get(caption);
  return p.color == 'w' ? p.type.toUpperCase() : p.type;
}

function getSquareName(square){
  return square.getAttribute('data-file')+square.getAttribute('data-rank');
}

function getSquares(){
  var ranks   = [],
      player = gameplay && gameplay.getSelf(),
      reverse = player && player.black,
      chess = gameplay.context;

  var rank, caption;
  for(var r = reverse && -1 || 8; (!reverse && --r>-1) || ( reverse && ++r<8 );){
    var rank = { 'files':[], 'rank':r+1 };
    for(var f = reverse && 8 || -1; (!reverse && ++f<8) || ( reverse && --f>-1 );){
      caption = ui.fileCaptions[f]+(r+1);
      rank.files.push({ 'piece':getPiece.bind(null,caption), 'file':ui.fileCaptions[f], 'rank':r+1, 'has_piece':exists.bind(null,caption) });
    }
    ranks.push(rank);
  };

  return ranks;
}

function highlightLastOpponentMove(){
  var self = gameplay.getSelf(),
      last = gameplay.session.moves[  gameplay.session.moves.length - 1 ],
      from, to, el;

  last && !last.from && ( last = gameplay.session.moves[ gameplay.session.moves.length - 2 ] );

  if(last/* && last.white!=self.white*/){
    from = last.from;
    to = last.to;
    css.addClass( selectSquare(last.from), 'lastmove-from');
    css.addClass( selectSquare(last.to), 'lastmove-to');
  }
}

function movePiece(eventArgs){
  
  if(eventArgs.preventDefault){
    eventArgs.preventDefault();
  } else {
    eventArgs.cancelBubble = true;
    eventArgs.returnValue = false;
  }

  var target  = eventArgs.target || eventArgs.srcElement,
      isPiece = css.hasClass(target,'piece'),
      piece, pieceName, ownership, from;

  if(isPiece){
    piece = target;
    pieceName = piece.getAttribute('data-name');
    ownership = (pieceName.toUpperCase()==pieceName) == !!gameplay.getSelf().white;
  }
  
  if(!isPiece || !ownership) {
    return;
  }

  from = getSquareName(piece.parentNode);
  dragndrop.drag(target, function(eventArgs){
    var square = getSquareByCoords(eventArgs.clientX,eventArgs.clientY);

    if(!square){
      return;
    }

    var el = select('#board-square-table').children[square.rank].children[square.file],
        to = getSquareName(el),
        move = from!=to && gameplay.getMove(from,to) || selectPiece(from);

    move && makeMove(move);

  });

}

function makeMove(el){
  var move = { 'from':el.from, 'to':el.to };

  function update(){
    gameplay.context.move(move);
    refresh();
    if(!gameplay.session.singleplayer){
      gameplay.makeMove(move);
    }
    module.exports.events.publish('move',el);
  }
  
  if(el.flags.indexOf('p')>-1){
    promptPromotion(function(error, piece){
      move.promotion = piece;
      update();
    });
  } else {
    update();
  }

}

function refresh(){
  var containerEl = select(); 
  render(function(error, fragment){
    !error && ( containerEl.innerHTML = fragment );
    resize(container.layout);
    module.exports.events.publish('refresh',containerEl);
  });

  highlightLastOpponentMove();
}

function render(callback){
  return ui.getTemplate('board.html',function(error,template){
    if(error) return callback(error, template);
    callback(error, ui.render(template,{ 'set':config.SET, 'squares':getSquares }));
  });
}

function resize(layout){
  var wrapper = select(),
      board = select('#board');
  wrapper.style.width = layout.boardWrapperSize.width+'px';
  wrapper.style.height = layout.boardWrapperSize.height+'px';

  board.style.width = layout.boardSize+'px';
  board.style.height = layout.boardSize+'px';
  board.style.padding = layout.boardPosition.top+'px 0 0 '+layout.boardPosition.left+'px';
}

function selectPiece(loc){
  selectedPiece = selectSquare(loc);
}

function selectSquare(loc){
  var file = ui.fileCaptions.indexOf(loc.charAt(0)),
      rank = parseInt(loc.charAt(1))-1,
      self = gameplay.getSelf(),
      reverse = self && self.black,
      squareTable = select('#board-square-table');

  reverse && ( file = 7 - file );
  !reverse && ( rank = 7 - rank );

  return squareTable.children[rank].children[file];
}


function setup(){
  
  var events = new EventBroker;
  events.create('refresh');
  events.create('move');

  module.exports.events = events;
  module.exports.on = events.subscribe.bind(module.exports.events);

  var wrapper = ui.select('#boardwrapper');
  select = module.exports.select = ui.queryFragment.bind(null,wrapper);
  container.events.subscribe('resize', resize);

  on(wrapper, 'mousedown', movePiece);
  on(wrapper, 'touchstart', movePiece);
  
  gameplay.session.on('update', refresh); 
}

module.exports = {
  'exists':exists,
  'getSquares':getSquares,
  'render':render,
  'refresh':refresh,
  'setup':setup
}
