var gameplay = require('../setup').gameplay,
    on = require('dom').on,
    getOnlinePlayerCt = require('./sidebar').getOnlinePlayerCt;

var focus = true,
    title;

function onFocus(){
  focus = true;
  flash.stop();
}

function onBlur(){
  focus = false;
}

function refresh(){
  set(title());
}

function set(title){
  document.title = title;
}

function setup(){
  on(window, 'blur', onBlur);
  on(window, 'focus', onFocus);

  set(title());

  gameplay.session.on('update', refresh);
  gameplay.on('updateServerInfo', refresh);
  gameplay.session.on('leave', refresh);
  gameplay.session.on('update', testFocus(flash.start));
}

function testFocus(fn){
  return function(){
    !focus && fn();
  }
}

function title(){
  var title = '', 
      black, white;

  if(gameplay.session.id){
    white = gameplay.white(); 
    black = gameplay.black(); 

    title = ( white ? white.nickname : '?' )
          + ' vs '
          + ( black ? black.nickname : '?' )
          + ' ― ';
  } else if(gameplay.playerCount>1){
    title = gameplay.playerCount
          + ' Online Players'
          + ' @ ';
  }

  title+='Multiplayer Chess';

  return title;
}

var flash = (function(){

  var timer, delay = 750;

  function start(){
    (function(ind){
      
      set(document.title!='^' ? '^' : title());
      timer = setTimeout(arguments.callee, delay);
    })(0);
  }

  function stop(){
    if(timer!=undefined){
      clearTimeout(timer);
      timer = undefined;
      set(title());
    }
  }
  
  return { 'start':start, 'stop':stop };

})();

module.exports = {
  'setup':setup,
  'onBlur':onBlur,
  'onFocus':onFocus
}
