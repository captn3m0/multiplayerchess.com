var ui = require('../ui'),
    container = require('./container'),
    on = require('dom').on,
    operateAsync = require('operate_async').operateAsync;

var dialogCounter = 0;

function close(){
  var el = select(),
      parent = el && el.parentNode;

  parent && parent.removeChild(el);
}

function hide(){
  select().style.visibility = 'hidden';
}

function isOpen(){
  return !!select();
}

function open(options, callback){
  isOpen() && close();

  var line = ++dialogCounter;

  render(options, function(error, html){
    if(error){
      throw error;
    }

    if(line!=dialogCounter){
      return;
    }

    container.select().appendChild( ui.parseHtml(html)[0] );

    var i, len, btn, els;
    if(options.buttons){
      els = select('#dialogbox-buttonset').getElementsByTagName('a');
      for(i = -1, len=options.buttons.length; ++i < len; ){
        btn = options.buttons[i];

        if(btn.link==undefined){
          els[i].setAttribute('href','javascript:void(0)');
        }

        if(btn.click){
          on(els[i], 'mouseup', btn.click);
        }
      };
    }

    setPosition();
    show();
    callback && callback();
  });
}

function setPosition(layout){
  !layout && ( layout = container.layout );
  
  var el = select();

  if(!el){
    return false;
  }

  var width = el.offsetWidth;

  width > layout.boardSize && ( el.style.width = layout.boardSize-40+'px' ) && ( width = el.offsetWidth );

  var height = el.offsetHeight,
      msgEl = select('#dialogbox-msg');
  if(height > layout.boardSize){
    el.style.height = layout.boardSize-40+'px';
    height = el.offsetHeight;

    var availHeight = el.clientHeight-select('#dialogbox-buttonset').offsetHeight-20;

    msgEl.style.height = availHeight+'px';
    msgEl.style.overflowY = 'scroll';
  } else {
    msgEl.style.height = msgEl.style.overflowY = '';
  }

  var left = Math.floor( ( layout.sidebarSize.micro && layout.viewport.width || layout.boardWrapperSize.width )/2-width/2 ),
      top = Math.floor( layout.boardWrapperSize.height/2-height/2 );

  el.style.left = (left>0&&left||layout.captionListSize)+'px';
  el.style.top = (top>0&&top||layout.captionListSize)+'px';
}

function render(options, callback){
  var html, error;
  return ui.getTemplate('dialogbox.html',function(error,template){
    if(error){ 
      return callback(error);
    }
    try {
      html = ui.render(template,options);
    } catch(exc) {
      error = exc;
    }

    callback(error, html);
  });
}

function select(selector,all){
  return ui.queryFragment(ui.select('#dialogbox'),selector,all);
}

function setup(){
  var container = require('./container');
  container.events.subscribe('resize',setPosition); 
}

function show(){
  select().style.visibility = '';
}

module.exports = {
  'close':close,
  'hide':hide,
  'isOpen':isOpen,
  'open':open,
  'render':render,
  'select':select,
  'setPosition':setPosition,
  'setup':setup,
  'show':show
}
