var ui = require('../ui'),
    sidebar = require('./sidebar'),
    gameplay = require('../setup').gameplay;

var length;

function refresh(){
  var visible = gameplay.session.moves.length > 0;
  if(visible && gameplay.session.moves.length!=length){
    length = gameplay.session.moves.length;
    render(function(error, html){
      sidebar.setMoves(html);
    });
  }
  setVisibility(visible); 
}

function render(callback){
  var moves = gameplay.session.moves,
      sets = [];

  var i,len, move, it = 0;
  for(i = -1, len=moves.length; ++i < len; ){
    move = moves[i];
    if(move.black){
      sets[sets.length-1].black = move.san;
    } else {
      sets.push({ 
        'it':++it, 
        'white':move.san, 
        'ts':move.ts, 
        'relativeDate':move.relativeDate 
      });
    }
  };

  return ui.getTemplate('moves.html',function(error,template){
    if(error) return callback(error, template);
    callback(error, ui.render(template,{ 'moves':sets }));
  });
}

function setup(){
  gameplay.session.on('update', refresh);
}

function setVisibility(visible){
  sidebar.select('#moves-widget').style.display = visible ? '' : 'none';
}

module.exports = {
  'refresh':refresh,
  'render':render,
  'setup':setup
}
