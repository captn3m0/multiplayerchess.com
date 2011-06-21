var ui = require('../ui'),
    sidebar = require('./sidebar'),
    container = require('./container'),
    wallpapers = require('wallpapers'),
    css = require('css'),
    gameplay = require('setup').gameplay;

var bgImage = undefined;

function draw(ctx,layout){
  if(!bgImage){
    return;
  }

  var layout = container.layout;
  resize();

  var size = ui.scaleSize(bgImage.width,bgImage.height,layout.viewport.width,layout.viewport.height),
      x = size.width>layout.viewport.width ? (size.width - layout.viewport.width) / -2 : 0,
      y = size.height>layout.viewport.height ? (size.height - layout.viewport.height) / -2 : 0;

  ctx.drawImage(bgImage,x,y,size.width,size.height);
}

function flip(apply){
  css[(apply&&'add'||'remove')+'Class'](select(),'hor-flip');
}

function load(wallpaper, ctx){
  var url = wallpaper.sizes.large || wallpaper.sizes.medium;

  ui.loadImage(url, function(error, img){
    if(error){
      throw error;
    }

    bgImage = img;
    flip(wallpaper.flip);

    draw(ctx);

    wallpaper.photographer = wallpapers.owners[wallpaper.owner];
    exports.wallpaper = wallpaper;

    updateSidebarWidget();

    if(wallpaper.cached){
      load(pickRandom(), ctx);
    } else { 
      window.localStorage && ( localStorage['previousWallpaper'] = wallpaper.id );
    }

  });
}

function pickRandom(){
  return wallpapers[Math.floor(Math.random()*wallpapers.length)];
}

function render(callback){
  return ui.getTemplate('wallpaper.html',function(error,template){
    callback(error, ui.render(template));
  });
}

function select(){
  return ui.select('#wallpaper');
}

function setup(){
  if(typeof G_vmlCanvasManager!="undefined"){
    G_vmlCanvasManager.initElement(select());
  }


  var ctx = select().getContext('2d'),
      wallpaper, i;

  container.events.subscribe('resize', function(){
    draw(ctx);
  });

  if(window.localStorage && localStorage['previousWallpaper']){
    i = wallpapers.length;
    while(i-->0){
      if(wallpapers[i].id == localStorage['previousWallpaper']){
        wallpaper = wallpapers[i];
        wallpaper.cached = true;
        break;
      }
    }
  }
  
  if(!wallpaper){
    wallpaper = pickRandom();
  }

  gameplay.session.on('update', updateSidebarWidget);
  gameplay.session.on('end', updateSidebarWidget);

  load(wallpaper,ctx);
}

function resize(width,height){
  var frag = select();
  frag.setAttribute('width',width||frag.parentNode.offsetWidth);
  frag.setAttribute('height',height||frag.parentNode.offsetHeight);
}

function updateSidebarWidget(){
  sidebar.setPhotographer(gameplay.session.id || !exports.wallpaper ? '' : '<a href="#!/photographers/'+exports.wallpaper.photographer.username+'">'+exports.wallpaper.photographer.username+'</a>');
}

module.exports = {
  'draw':draw,
  'load':load,
  'render':render,
  'setup':setup
}
