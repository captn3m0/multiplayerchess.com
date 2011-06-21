var ui = require('../ui'),
    sidebar = require('./sidebar'),
    gameplay = require('../setup').gameplay;

var sessionId;

function refresh(forceUpdate){
  var visible = gameplay.session.id != undefined;
  if(visible && ( forceUpdate || sessionId != gameplay.session.id )){
    sessionId = gameplay.session.id;
    render(function(error, html){
      sidebar.setButtonSet(html);
    });
  }
  setVisibility(visible); 
}

function render(callback){
  var view = { 
    'sessionId':gameplay.session.id, 
    'display_commands':!gameplay.spectator && !gameplay.end() && gameplay.session.players.length>1,
    'multiplayer':!gameplay.session.singleplayer,
    'leave':gameplay.session.isPrivate || gameplay.session.players.length<2 || gameplay.end()
  };

  ui.getTemplate('buttonset.html',function(error,template){
    if(error) return callback(error, template);
    callback(error, ui.render(template,view));
  });
}

function setup(){
  gameplay.session.on('start', refresh.bind(undefined,true));
  gameplay.session.on('update', refresh);
  gameplay.session.on('end', refresh.bind(undefined,true));
}

function setVisibility(visible){
  sidebar.select('#buttonset-widget').style.display = visible ? '' : 'none';
}

module.exports = {
  'refresh':refresh,
  'render':render,
  'setup':setup
}
