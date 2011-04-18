var ui = require('../ui'),
    sidebar = require('./sidebar'),
    gameplay = require('../setup').gameplay;

var length;

function refresh(){
  if(gameplay.session.logs.length!=length){
    length = gameplay.session.logs.length;
    render(function(error, html){
      sidebar.setLogs(html);
    });
  }
}

function render(callback){
  return ui.getTemplate('logs.html',function(error,template){
    if(error) return callback(error, template);
    callback(error, ui.render(template,{ 'logs':gameplay.session.logs }));
  });
}

function setup(){
  gameplay.session.on('update', refresh);
}

module.exports = {
  'refresh':refresh,
  'render':render,
  'setup':setup
}
