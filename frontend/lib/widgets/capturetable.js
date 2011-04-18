var ui = require('../ui'),
    sidebar = require('./sidebar'),
    gameplay = require('../setup').gameplay;

var length;
var entities = {
  'k':'&#9812;',
  'q':'&#9813;',
  'r':'&#9814;',
  'b':'&#9815;',
  'n':'&#9816;',
  'p':'&#9817;',
  'K':'&#9818;',
  'Q':'&#9819;',
  'R':'&#9820;',
  'B':'&#9821;',
  'N':'&#9822;',
  'P':'&#9823;'
};

function refresh(){
  var visible = gameplay.session.captures.length > 0;
  if(visible && gameplay.session.captures.length!=length){
    length = gameplay.session.captures.length;
    render(function(error, html){
      sidebar.setCaptureTable(html);
    });
  }
  setVisibility(visible); 
}

function render(callback){
  var captures = gameplay.session.captures.map(function(el){
    return entities[el];
  });

  return ui.getTemplate('capturetable.html',function(error,template){
    if(error) return callback(error, template);
    callback(error, ui.render(template,{ 'captures':captures }));
  });
}

function setup(){
  gameplay.session.on('update', refresh);
}

function setVisibility(visible){
  sidebar.select('#capturetable-widget').style.display = visible ? '' : 'none';
}

module.exports = {
  'refresh':refresh,
  'render':render,
  'setup':setup
}
