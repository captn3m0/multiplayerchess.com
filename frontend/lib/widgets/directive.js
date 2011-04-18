var ui = require('../ui'),
    sidebar = require('./sidebar'),
    stateCodes = require('../gameplay').stateCodes,
    gameplay = require('../setup').gameplay;

var directive;

function getDirective(){
  var msg = undefined, player, turn;
  if(gameplay.state == stateCodes.PLAYING){
    player = gameplay.getSelf();
    turn = gameplay.context.turn();
    msg = ( turn == 'w' && 'White' || 'Black' )
        + '\'s move.';
  }

  return msg;
}

function refresh(){
  var msg = getDirective();
  var visible = msg && msg.length;

  if(visible && msg!=directive){
    directive = msg;
    render(function(error, html){
      sidebar.setDirective(html);
    });
  }

  setVisibility(visible);
}

function render(callback){
  return ui.getTemplate('directive.html',function(error,template){
    if(error) return callback(error, template);
    callback(error, ui.render(template,{ 'directive':directive }));
  });
}

function setup(){
  gameplay.session.on('update', refresh);
}

function setVisibility(visible){
  sidebar.select('#directive-widget').style.display = visible ? '' : 'none';
}

module.exports = {
  'refresh':refresh,
  'render':render,
  'setup':setup
}
