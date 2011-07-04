var dialogbox = require('./widgets/dialogbox'),
    stateCodes = require('./gameplay').stateCodes,
    ui = require('./ui'),
    config = require('./config'),
    container = require('./widgets/container'),
    navigator = require('./navigator'),
    on = require('dom').on,
    operateAsync = require('operate_async').operateAsync,
    gameplay = require('./setup').gameplay,
    history = require('./history'),
    wallpapers = require('wallpapers'),
    wallpaper = require('widgets/wallpaper'),
    chrome = require('environ').chrome();

var HOURGLASS = '<img src="hourglass.png" width="100" height="130" />';

function alphanumeric(keyCode,shiftKey){
  return  ( keyCode >= 97 && keyCode <= 122 ) // a-z 
          || ( keyCode >= 65 && keyCode <= 90 ) // A-Z
          || ( !shiftKey && keyCode >= 48 && keyCode <= 57 ) // 0-9
          || ( keyCode >= 37 && keyCode <= 40 ); // 0-9
}

function control(keyCode){
  return  keyCode == 13 // return
          || keyCode == 27 // escape
          || keyCode == 46 // delete
          || keyCode == 8; // backspace
}

var nickname = (function(){

  var nickname = history.getNickname() || 'Anonymous', el, testEl;
  
  function check(eventArgs){
    if(( !alphanumeric(eventArgs.keyCode, eventArgs.shiftKey) || el.value.length>=20 ) && !control(eventArgs.keyCode)){
      if(eventArgs.preventDefault){
        eventArgs.preventDefault();
      } else {
        eventArgs.cancelBubble = true;
        eventArgs.returnValue = false;
      }
    }

    sync();
    if(testEl){
      setTimeout(resize,0);
    }
  }

  function get(){
    return nickname;
  }

  function resize(){
    testEl.innerHTML = el.value;
    el.style.width = testEl.offsetWidth+'px';
  }

  function set(newVal){
    nickname = newVal;
  }

  function prompt(callback){

    function close(){
      callback(null, get());
      dialogbox.close();
    }

    ui.getTemplate('nickname_prompt.html', function(error, template){
      if(error){
        throw error;
      }
      var html = ui.render(template, { 'nickname':get() });
      dialogbox.open({ 'buttons':[{ 'click':close, 'caption':'OK' }], 'symbol':ui.getRandomSymbol(), 'class':'prompt nickname', 'message':html },function(){
        testEl = undefined;
        el = dialogbox.select('#nickname');
        on(el, 'keydown', check); 
        on(el, 'keyup', check); 
      });
    });

  }

  function sync(){
    set(el.value);
  }

  function setup(nnEl,nnTestbox){
      el = nnEl;
      testEl = nnTestbox;
    
      check({ 'keyCode':97 });

      on(el, 'keydown', check); 
      on(el, 'keyup', check); 

      el.value = el.value;

      on(window, 'load', function(){
        check({ 'keyCode':97 });
      });

      setTimeout(function(){ check({ 'keyCode':97 }); },100);
      setTimeout(function(){ check({ 'keyCode':97 }); },250);
      setTimeout(function(){ check({ 'keyCode':97 }); },500);
  }

  return {
    'check':check,
    'get':get,
    'prompt':prompt,
    'resize':resize,
    'set':set,
    'sync':sync,
    'setup':setup
  }

})();

function confirm(msg,callback){
  dialogbox.open({
    'symbol':'?',
    'message':msg,
    'buttons':[
      {
        'caption':'No',
        'click':navigator.reset
      },
      { 
        'caption':'Yes', 
        'click':function(){
          dialogbox.close();
          callback();
        }
      }
    ]
  });
}

function confirmSessionLeave(cb){
  confirm('Are you sure you want to leave this game?', function(){
    gameplay.reset();
    cb();
  });
}

function photographers(args){
  var username = args[0] && decodeURI(args[0]) || undefined;
  ui.getTemplate('photographers.html', function(error, template){
    if(error) throw error;

    var ownerlist = [];
    for(var key in wallpapers.owners){
      if(!username || wallpapers.owners[key].username == username){
        ownerlist.push(wallpapers.owners[key]);
      }
    }

    var html = ui.render(template, { 'photographers':ownerlist, 'displayAllButton':!!username }),
        symbol = wallpaper.wallpaper? '<img src="'+wallpaper.wallpaper.sizes.square+'" />' : ui.getRandomSymbol(),
        buttons =[{ 'caption':'&larr; Back', 'click':navigator.resetDialogs }];

    if(username){
      buttons.push({ 'caption':'All Photographers', 'link':'#!/photographers' });
    }

    dialogbox.open({ 'buttons':buttons, 'class':'public intro photographers', 'symbol':symbol, 'message':html });
  }); 
}

function prompt(options, callback){
  
  function submit(){
    callback(null, dialogbox.select('.textbox').value);
  }

  ui.getTemplate('prompt.html', function(error, template){
    if(error){
      return callback(error);
    }

    var html = ui.render(template, options);
    
    dialogbox.open({ 'class':'prompt', 'symbol':'?', 'message':html, 'buttons':[{ 'caption':options.buttonCaption || 'OK', 'click':submit }] },function(){
      dialogbox.select('.textbox').addEventListener('keyup', function(eventArgs){
        eventArgs.keyCode == 13 && submit();
      }, false);
    });
    
  });
}

function promptPromotion(callback){
  var pieces = ['q','n','r','b'],
      squareSize = container.layout.squareSize,
      self = gameplay.getSelf();

  self && self.white && pieces.map(function(el){ return el.toUpperCase(); });

  function pick(piece){
    dialogbox.close();
    callback(null,piece);
  }

  ui.getTemplate('promotion_picker.html', function(error, template){
    if(error) return callback(error);
    var html = ui.render(template, { 'set':config.SET, 'pieces':pieces, 'squareSize':squareSize, 'containerWidth':squareSize*pieces.length+20 });
    dialogbox.open({ 'message':html, 'symbol':'?' },function(){

      var options = dialogbox.select('#promotion-picker').children;
      for(var i = -1, len=options.length-1; ++i < len; ){
        on(options[i], 'mouseup', pick.bind(undefined,options[i].getAttribute('data-name').toLowerCase()));
      };

    });
  });
}

function showAboutDialog(){
  var symbol = '&#9822;';

  ui.getTemplate('about.html', function(error, template){
    if(error){
      throw error;
    }
    var html = ui.render(template);
    dialogbox.open({ 'buttons':[{ 'caption':'&larr; Back', 'click':navigator.resetDialogs }], 'class':'public intro about', 'symbol':'&#9822;', 'message':html });
  });
}

function showConnectionMsg(){
  dialogbox.open({ 'symbol':HOURGLASS, 'message':'Connecting to the server...' }); 
}

function showErrorMsg(excinfo){
  dialogbox.open({
    'message':'<h2>An Error Occured</h2>'+excinfo.message,
    'symbol':'!',
    'buttons':[{ 'caption':'Close', 'click':navigator.reset }]
  });
}

function showFAQDialog(){
  var symbol = '&#9822;';

  ui.getTemplate('faq.html', function(error, template){
    if(error){
      throw error;
    }
    var html = ui.render(template);
    dialogbox.open({ 'buttons':[{ 'caption':'&larr; Back', 'click':navigator.resetDialogs },{ 'caption':'About', 'link':'#!/about' }], 'class':'public intro about', 'symbol':'&#9822;', 'message':html });
  });
}

function showIntroDialog(){
  var symbol = '&#9822;';
  var buttons = [
    { 'target':'_blank', 'link':'http://facebook.com/multiplayerchess', 'caption':'Facebook', 'class':'social' },
    { 'target':'_blank', 'link':'https://chrome.google.com/webstore/detail/ckjffnjacjdmdmpemmnplcgngbdgfmpc', 'caption':'Chrome WebStore', 'class':'social chrome' },
    { 'link':'#!/about', 'caption':'About' },
    { 'link':'#!/faq', 'caption':'FAQ' }
  ];

  if(chrome){
  }

  ui.getTemplate('news.html', function(newsError, news){
    if(newsError) throw newsError;

    ui.getTemplate('intro.html', function(error, template){
      if(error) throw error;
      var html = ui.render(template, { 'nickname':nickname.get() }, { 'news':news });
      dialogbox.open({ 'buttons':buttons, 'class':'public intro', 'symbol':'&#9822;', 'message':html },function(){
        nickname.setup(dialogbox.select('#nickname'),dialogbox.select('#nickname-testbox'));
      });
    });

  });
}

function showJoinMsg(){
  if(gameplay.session.singleplayer){
    return;
  }

  var self = gameplay.getSelf();

  var options = {
    'symbol'  : ui.getRandomSymbol(),
    'buttons' : [],
    'message' : '' 
              + 'You\'ve joined to'
              + ( gameplay.session.isPrivate ? ' a <strong>private</strong> ' : ' this ' )
              + 'game as '
  };

  if(self){
    options.buttons.push({ 'caption':'Ad gloriam!', 'click':dialogbox.close });
    options.message += ''
                    + 'the <strong>'
                    + (self.white ?'White':'Black')
                    + '</strong> player.'
  } else {
    options.buttons.push({ 'caption':'Ok', 'click':dialogbox.close },
                 { 'caption':'Main Menu', 'click':navigator.navigate.bind(undefined,'') });
    options.message += ''
                    + ' a <strong>spectator</strong>.';
  }

  dialogbox.open(options);
}

function showNewSessionDialog(){
  gameplay.session.isPrivate ? showNewPrivateSessionMsg() : showOpponentWaitDialog();
}

function showNewPrivateSessionMsg(){
  dialogbox.open({
    'symbol'  : ui.getRandomSymbol(),
    'buttons' : [{ 'caption':'Ad gloriam!', 'click':dialogbox.close }],
    'message' : '' 
              + 'You\'ve created a new private session and joined it as the <strong>'
              + (gameplay.getSelf().white ?'White':'Black')
              + '</strong> player. '
              + '<p>Share the URL below with somebody to play against:</p>'
              + '<input class="urlbox" value="'
              +config.APPLICATION_URL
              +
              '/#!/'
              +gameplay.session.id
              +'" />'
  });
}

function showPGN(){
  ui.getTemplate('pgn.html', function(error, template){
    if(error) throw error;
    var html = ui.render(template,{ 'pgn':gameplay.pgn().replace(/\n/g,'<br />') });

    dialogbox.open({ 
      'symbol':ui.getRandomSymbol(),
      'buttons':[{ 'caption':'Close', 'click':navigator.reset }], 
      'message':html 
    });
  });
}

function showSessionOverview(){
  var tasks = {
    'captures':require('./widgets/capturetable').render,
    'moves':require('./widgets/moves').render
  };

  var white = gameplay.white(),
      black = gameplay.black(),
      result = gameplay.result();

  var windowContent = { 
    'fen':gameplay.context.fen, 
    'pgn':gameplay.pgn().replace(/\n/g,'<br />'),
    'white':white && white.nickname,
    'black':black && black.nickname || '?',
    'ongoing':!result,
    'endMessage':result && function(){
      if(result.draw){
        return 'Draw!';
      }

      var winner = result.winner &&  ( result.winner == 'w' && 'White' || 'Black' );

      if(result.checkmate){
        return winner+' won!';
      } else if(result.resign){
        return ( result.resign.white && 'White' || 'Black' ) + ' resigned!';
      }
    },
    'create_date':function(){
      return ui.prettifyTimestamp(gameplay.session.createTS);
    }
  };

  var buttons = [];

  if(!result){
    buttons.push({ 'caption':'Close', 'click':navigator.reset });
  } else {
    buttons.push({ 
      'caption':'Return To Main Menu', 
      'click':navigator.navigate.bind(undefined,'') 
    });
    buttons.push({ 
      'caption':'Replay', 
      'link':'#!/'+gameplay.session.id+'/replay'
    });
    buttons.push({ 
      'caption':'Close', 
      'click':navigator.reset
    });
  }

  ui.getTemplate('session_overview.html', function(error, template){
    if(error){ 
      throw error;
    }

    operateAsync(tasks, function(error, partials){
      if(error){
        throw error;
      }

      dialogbox.open({ 
        'symbol':ui.getRandomSymbol(),
        'buttons':buttons, 
        'message':ui.render(template, windowContent, partials)
      });

    });

  });
}

function showOpponentWaitDialog(){
  var options = {
    'symbol'  : HOURGLASS,
    'message'     : ''
              + 'You\'ve joined this session'
              + 'as the <strong>'
              + (gameplay.getSelf().white ?'White':'Black')
              + '</strong> player.'
              + '<p>Please wait until an online player connects. If it takes too long, you may share URL of this session with someone you want to play with.</p>'
              + '<input class="urlbox" value="'
              +config.APPLICATION_URL
              +
              '/#!/'
              +gameplay.session.id
              +'" />'
  };

  dialogbox.open(options);
}

var showStartDialog = (function(){
  var shownSessions = {};
  return function(){
    if(!shownSessions[gameplay.session.id]){
      shownSessions[gameplay.session.id] = true;
      gameplay.state == stateCodes.WAITING_OPPONENT ? showNewSessionDialog() : showJoinMsg();
    }
  }
})();

function showOpponentJoinMsg(){
  dialogbox.open({ 
    'message': 'The opponent has connected as '
             + (gameplay.getOpponent().white ? 'White' : 'Black')
             + ' player.',
    'symbol':ui.getRandomSymbol(),
    'buttons':[{ 'caption':'Ad gloriam!', 'click':dialogbox.close }] 
  })
}

function setup(gpInstance){
  gameplay.session.on('create',showStartDialog);
  gameplay.session.on('join',showStartDialog);
  gameplay.session.on('opponentJoin',showOpponentJoinMsg);
  gameplay.on('error', showErrorMsg);
}

module.exports = {
  'confirm':confirm,
  'confirmSessionLeave':confirmSessionLeave,
  'nickname':nickname,
  'photographers':photographers,
  'prompt':prompt,
  'promptPromotion':promptPromotion,
  'setup':setup,
  'showAboutDialog':showAboutDialog,
  'showFAQDialog':showFAQDialog,
  'showConnectionMsg':showConnectionMsg,
  'showErrorMsg':showErrorMsg,
  'showIntroDialog':showIntroDialog,
  'showPGN':showPGN,
  'showSessionOverview':showSessionOverview,
  'showStartDialog':showStartDialog,
  'showOpponentJoinMsg':showOpponentJoinMsg
}
