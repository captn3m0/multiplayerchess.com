var ui = require('../ui'),
    gameplay = require('../setup').gameplay,
    colors = require('../config').colors,
    fileCaptions = require('../ui').fileCaptions,
    container = require('./container');

function drawAppBg(ctx,layout){
  var hp = (layout.squareSize-(layout.boardPosition.left%layout.squareSize))*-1,
      triangleSize = layout.squareSize/8,
      vp,r,g,b,triangleAlpha;


  while(hp<layout.viewport.width){
    vp=(layout.squareSize-(layout.boardPosition.top%layout.squareSize))*-1;
    while(vp<layout.viewport.height){
      if( (hp<=layout.boardPosition.left-layout.squareSize || layout.boardPosition.left+layout.squareSize*7<hp) || (vp<=layout.boardPosition.top-layout.squareSize || layout.boardPosition.top+layout.squareSize*7<vp) ){
        r = Math.floor(Math.random()*10)+10;
        g = Math.floor(Math.random()*10)+10;
        b = Math.floor(Math.random()*10)+10;
        triangleAlpha = Math.floor(Math.random()*5);

        ctx.fillStyle = 'rgb('+r+','+g+','+b+')'
        ctx.fillRect(hp, vp, layout.squareSize, layout.squareSize);
        

        ctx.fillStyle = 'rgb('+(r+triangleAlpha)+','+(g+triangleAlpha)+','+(b+triangleAlpha)+')';
        ctx.beginPath();
        ctx.moveTo(hp+triangleSize*4,vp+triangleSize*3);
        ctx.lineTo(hp+triangleSize*3,vp+triangleSize*5);
        ctx.lineTo(hp+triangleSize*5,vp+triangleSize*5);
        ctx.fill();

      }
      vp+=layout.squareSize;
    }
    hp+=layout.squareSize;
  }
}

function drawBoardBg(ctx,layout){
  (function(file){

    if(file>7) return;
    
    var buildNextFile = arguments.callee.bind(null, file+1);

    (function(rank){

      if(rank>7) return buildNextFile();
      
      var buildNextRank = arguments.callee.bind(null,rank+1);

      ctx.fillStyle = colors[ file%2==rank%2 && 'light' || 'dark' ];
      ctx.fillRect(layout.boardPosition.left+file*layout.squareSize, layout.boardPosition.top+rank*layout.squareSize, layout.squareSize, layout.squareSize);

      buildNextRank();
    
    })(0,'rank'); 

  })(0);
}

function drawCaptions(ctx,layout){
  ctx.font = 'normal 400 0.8em sans-serif'
  ctx.fillStyle = colors.caption;

  var slice = layout.captionListSize/2,
      x = (layout.boardPosition.left-slice)+layout.captionListSize+(layout.squareSize/2-slice),
      y = (layout.boardPosition.top-slice)+layout.captionListSize+(layout.squareSize/2-slice),
      player = gameplay.getSelf(),
      reverse = player && player.black,
      caption;

  for(var rank=-1; ++rank<8;){
    caption = !reverse ? 8-rank : rank+1;
    y+=( (rank&&1||0)*layout.squareSize );
    ctx.fillText(caption,layout.boardPosition.left-slice-5,y);
    ctx.fillText(caption,layout.boardPosition.left+layout.boardSize+5,y);
  }

  for(var file=-1; ++file<8;){
    caption = fileCaptions[reverse?7-file:file].toUpperCase();
    x+=(file&&1||0)*layout.squareSize;
    ctx.fillText(caption,x,layout.boardPosition.top-5,layout.captionListSize);
    ctx.fillText(caption,x,layout.boardPosition.top+layout.boardSize+15,layout.captionListSize);
  }


}

function drawSidebarBg(ctx, layout){
  var x1 = layout.horizontal ? layout.boardWrapperSize.width : 0,
      x2 = layout.viewport.width - x1,
      y1 = layout.vertical || layout.sidebarSize.micro ? layout.boardWrapperSize.height : 0,
      y2 = layout.viewport.height - y1;

  ctx.fillStyle = colors['sidebar'];
  ctx.fillRect(x1, y1, x2, y2);
}

function drawRectangles(layout){
    var canvas = select(),
        ctx = canvas.getContext('2d');

    //ctx.clearRect(0,0,boardLayout.width,boardLayout.height);

    drawAppBg(ctx,layout);
    drawBoardBg(ctx,layout);
    drawSidebarBg(ctx,layout);
    drawCaptions(ctx,layout);
}

function getSquareByCoords(x,y){
  var layout = container.layout,
      left = layout.boardPosition.left,
      top = layout.boardPosition.top;
  
  if( x < left || x > left+layout.boardSize || y < top || y > top + layout.boardSize ){
    return undefined;
  }

  return {
    'file':Math.floor((x-left)/layout.squareSize),
    'rank':Math.floor((y-top)/layout.squareSize)
  };
}

function render(callback){
  return ui.getTemplate('bg.html',function(error,template){
    callback(error, ui.render(template));
  });
}

function resize(width,height){
  var frag = select();
  frag.setAttribute('width',width||frag.parentNode.offsetWidth);
  frag.setAttribute('height',height||frag.parentNode.offsetHeight);
}

function select(){
  return ui.select('#bg');
}

function setup(){

  if(typeof G_vmlCanvasManager!="undefined"){
    G_vmlCanvasManager.initElement(select());
  }

  container.events.subscribe('resize', draw);
  gameplay.on('connect',function(){
    var ctx = select().getContext('2d');
    drawAppBg(ctx,container.layout);
    drawSidebarBg(ctx,container.layout);
    drawCaptions(ctx,container.layout);
  });
}

var draw = (function(){
  var lock = false;
  return function(layout){

    if(lock) return false;
    lock = true;
    
    resize();
    setTimeout(drawRectangles.bind(undefined,layout),100);

    lock = false;
  }
})();

module.exports = {
  'draw':draw,
  'drawRectangles':drawRectangles,
  'getSquareByCoords':getSquareByCoords,
  'render':render,
  'setup':setup
}
