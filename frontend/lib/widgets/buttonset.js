var ui = require('../ui'),
    sidebar = require('./sidebar'),
    gameplay = require('../setup').gameplay;

var sessionId;

function refresh(){
  var visible = gameplay.session.id != undefined;
  if(visible && sessionId != gameplay.session.id){
    sessionId = gameplay.session.id;
    render(function(error, html){
      sidebar.setButtonSet(html);
    });
  }
  setVisibility(visible); 
}

function render(callback){
  return ui.getTemplate('buttonset.html',function(error,template){
    if(error) return callback(error, template);
    callback(error, ui.render(template,{ 'sessionId':sessionId }));
  });
}

function setup(){
  gameplay.session.on('update', refresh);
}

function setVisibility(visible){
  sidebar.select('#buttonset-widget').style.display = visible ? '' : 'none';
}

module.exports = {
  'refresh':refresh,
  'render':render,
  'setup':setup
}
