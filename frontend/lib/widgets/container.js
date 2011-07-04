var EventBroker = require('observer').EventBroker,
    ui = require('../ui'),
    operateAsync = require('operate_async').operateAsync,
    gameplay = require('../setup').gameplay,
    replay = require('../replay'),
    on = require('dom').on,
    css = require('css');

var HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
    MICRO = 'micro';

var select = null,
    events = null,
    orientation = undefined;

function getChildren(){
  return [
    { 'name':'wallpaper', 'module':require('./wallpaper') },
    { 'name':'bg', 'module':require('./bg') },
    { 'name':'board', 'module':require('./board') },
    { 'name':'sidebar', 'module':require('./sidebar') }
  ]
}

function getLayout(){
  var el = select(),
      viewport = { 'width':el.parentNode.clientWidth, 'height':el.parentNode.clientHeight },
      horizontal = viewport.width>viewport.height,
      boardWrapperSize = {},
      boardPosition = {},
      sidebar = require('./sidebar'),
      sidebarEl = sidebar.select();

  boardWrapperSize.width = boardWrapperSize.height = Math.min(viewport.width,viewport.height),

  orient(horizontal && HORIZONTAL || VERTICAL);

  var sidebarSize = sidebar.getSize({ 
    'horizontal':horizontal, 
    'vertical':!horizontal, 
    'boardWrapperSize':boardWrapperSize, 
    'viewport':viewport 
  });

  if(sidebarSize.micro){
    orient(MICRO);
    sidebarEl.style.height = '';
    sidebarSize.height = sidebarEl.offsetHeight;
    var lack = sidebarSize.height-(viewport.height-boardWrapperSize.height);
    lack>0 && (boardWrapperSize.height-=lack);
    boardWrapperSize.width = viewport.width;
  }

  var boardSize = Math.min( boardWrapperSize.width, boardWrapperSize.height ),
      captionListSize = Math.floor(boardSize/28);

  boardSize-=captionListSize*2-(boardWrapperSize.width-boardSize);
  boardSize-=captionListSize*2-(boardWrapperSize.height-boardSize);

  boardSize = Math.floor(boardSize/8)*8;

  boardPosition.left = !sidebarSize.micro ? captionListSize : Math.floor( boardWrapperSize.width/2-boardSize/2 );
  boardPosition.top = captionListSize;

  !horizontal || sidebarSize.micro && ( sidebarSize.width-=captionListSize*2 );
  horizontal && !sidebarSize.micro && ( sidebarSize.height-=captionListSize*2 );
  
  return { 
    'boardPosition':boardPosition,
    'boardSize':boardSize,
    'boardWrapperSize':boardWrapperSize,
    'captionListSize':captionListSize,
    'horizontal':!sidebarSize.micro && horizontal, 
    'sidebarSize':sidebarSize,
    'squareSize':boardSize/8,
    'viewport':viewport,
    'vertical':!sidebarSize.micro && !horizontal
  }
}

function render(callback){

  var tasks = {};
  getChildren().forEach(function(widget){
    tasks[widget.name] = widget.module.render
  });

  ui.getTemplate('container.html',function(error,template){
    if(error){
      return callback(error);
    }

    operateAsync(tasks, function(error,partials){
      callback(error, ui.render(template,{},partials));
    });
  });
}

var orientation = undefined;
function orient(cls){
  var el = select();
  css.removeClass(el,'horizontal');
  css.removeClass(el,'vertical');
  css.removeClass(el,'micro');
  css.addClass(el,cls);

  orientation = cls;
}

function updateClass(){
  select().className  = 'container'
                      + ( orientation != undefined ? ' '+orientation : '' )
                      + ( gameplay.session.id ? ' playing' : '' )
                      + ( replay.playing() ? ' replay' : '' )
                      + ( replay.paused() ? ' replay-paused' : '');
}

function resize(){
  var layout = module.exports.layout = getLayout();
  events.publish('resize',layout);
}

function setup(){
  select = module.exports.select = ui.queryFragment.bind(null,ui.select('#container'))
  events = module.exports.events = new EventBroker;
  events.create('resize');

  getChildren().forEach(function(widget){
    widget.module.setup && widget.module.setup();
  });

  gameplay.session.on('create', updateClass);
  gameplay.session.on('join', updateClass);
  gameplay.session.on('leave', updateClass);

  on(window, 'resize', resize);
  resize();
}

module.exports = {
  'HORIZONTAL':HORIZONTAL,
  'VERTICAL':VERTICAL,
  'MICRO':MICRO,
  'getChildren':getChildren,
  'getLayout':getLayout,
  'render':render,
  'resize':resize,
  'orient':orient,
  'updateClass':updateClass,
  'setup':setup
}
