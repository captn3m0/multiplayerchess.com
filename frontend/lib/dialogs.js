var dialogbox = require('./widgets/dialogbox'),
    stateCodes = require('./gameplay').stateCodes,
    ui = require('./ui'),
    config = require('./config'),
    container = require('./widgets/container'),
    navigator = require('./navigator'),
    on = require('dom').on,
    operateAsync = require('operate_async').operateAsync,
    gameplay = require('./setup').gameplay,
    history = require('./history');

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
      callback(get());
      dialogbox.close();
    }

    ui.getTemplate('nickname_prompt.html', function(error, template){
      if(error){
        throw error;
      }
      var html = ui.render(template, { 'nickname':get() });
      dialogbox.open({ 'buttons':[{ 'click':close, 'caption':'OK Now' }], 'symbol':ui.getRandomSymbol(), 'class':'prompt nickname', 'message':html },function(){
        testEl = undefined;
        el = dialogbox.select('#nickname');
        setTimeout(function(){
          el.focus();
        },500);

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

      try {
      el.focus();
      } catch (exc){
        /* ya idiotic ie8 problem */
      }
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
    dialogbox.open({ 'buttons':[{ 'caption':'&larr; Back', 'click':navigator.resetNavigation }], 'class':'public intro about', 'symbol':'&#9822;', 'message':html });
  });
}

function showConnectionMsg(){
  dialogbox.open({ 'symbol':HOURGLASS, 'message':'Connecting to the server...' }); 
}

function showEndMsg(){
  var ctx = gameplay.context,
      checkmate = ctx.in_checkmate(),
      draw = !checkmate && ctx.in_draw(),
      winner = ctx.turn() == 'w' && 'Black' || 'White';

  dialogbox.open({
    'message':checkmate ? 'Checkmate.'+winner+' wins!' : 'Draw!',
    'symbol':ui.getRandomSymbol(),
    'buttons':[
      { 'caption':'Start New Game', 'click':navigator.navigate.bind(undefined,'') }
    ]   
  }); 
}

function showErrorMsg(excinfo){
  dialogbox.open({
    'message':'<h2>An Error Occured</h2>'+excinfo.message,
    'symbol':'!',
    'buttons':[{ 'caption':'Close', 'click':navigator.resetNavigation }]
  });
}

function showFAQDialog(){
  var symbol = '&#9822;';

  ui.getTemplate('faq.html', function(error, template){
    if(error){
      throw error;
    }
    var html = ui.render(template);
    dialogbox.open({ 'buttons':[{ 'caption':'&larr; Back', 'click':navigator.resetNavigation },{ 'caption':'About', 'link':'#!/about' }], 'class':'public intro about', 'symbol':'&#9822;', 'message':html });
  });
}

function showIntroDialog(){
  var symbol = '&#9822;';

  ui.getTemplate('news.html', function(newsError, news){
    if(newsError) throw newsError;

    ui.getTemplate('intro.html', function(error, template){
      if(error) throw error;
      var html = ui.render(template, { 'nickname':nickname.get() }, { 'news':news });
      dialogbox.open({ 'buttons':[{ 'link':'#!/about', 'caption':'About' },{ 'link':'#!/faq', 'caption':'FAQ' }], 'class':'public intro', 'symbol':'&#9822;', 'message':html },function(){
        nickname.setup(dialogbox.select('#nickname'),dialogbox.select('#nickname-testbox'));
      });
    });

  });
}

function showJoinMsg(){
  if(gameplay.session.singleplayer){
    dialogbox.close();
    return;
  }
  dialogbox.open({
    'symbol'  : ui.getRandomSymbol(),
    'buttons' : [{ 'caption':'Ad gloriam!', 'click':dialogbox.close }],
    'message' : '' 
              + 'You\'ve joined to'
              + ( gameplay.session.isPrivate ? ' a <strong>private</strong> ' : ' this ' )
              + 'session as the <strong>'
              + (gameplay.getSelf().white ?'White':'Black')
              + '</strong> player.'
  });
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
  });
}

function showPGN(){
  ui.getTemplate('pgn.html', function(error, template){
    if(error) throw error;
    var html = ui.render(template,{ 'pgn':gameplay.session.pgn().replace(/\n/g,'<br />') });

    dialogbox.open({ 
      'symbol':ui.getRandomSymbol(),
      'buttons':[{ 'caption':'Close', 'click':navigator.resetNavigation }], 
      'message':html 
    });
  });
}

function showSessionOverview(){
  var tasks = {
    'captures':require('./widgets/capturetable').render,
    'moves':require('./widgets/moves').render
  };

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
        'buttons':[{ 'caption':'Close', 'click':navigator.resetNavigation }], 
        'message':ui.render(template, { 'fen':gameplay.context.fen }, partials)
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

function showStartDialog(){
  gameplay.state == stateCodes.WAITING_OPPONENT ? showNewSessionDialog() : showJoinMsg();
}

function showOpponentJoinMsg(){
  dialogbox.open({ 
    'message': 'The opponent has connected as '
             + (gameplay.getOpponent().white ? 'White' : 'Black')
             + ' player.',
    'symbol':ui.getRandomSymbol(),
    'buttons':[{ 'caption':'Ad gloriam!', 'click':dialogbox.close }] 
  })
}

function showOpponentLeaveMsg(){
  if(!gameplay.session.isPrivate){
    dialogbox.open({ 'buttons':[{ 'caption':'Find New Opponent', 'link':'#!/sessions/search' },{ 'caption':'Create Private Game', 'link':'#!/sessions/new/private' }], 'message':'The opponent seems to have resigned/disconnected.', 'symbol':HOURGLASS });
  }
}

function setup(gpInstance){
  gameplay.session.on('create',showStartDialog);
  gameplay.session.on('join',showStartDialog);
  gameplay.session.on('opponentJoin',showOpponentJoinMsg);
  gameplay.session.on('opponentLeave',showOpponentLeaveMsg);
  gameplay.session.on('end', showEndMsg);
  gameplay.on('error', showErrorMsg);
}

module.exports = {
  'nickname':nickname,
  'prompt':prompt,
  'promptPromotion':promptPromotion,
  'setup':setup,
  'showAboutDialog':showAboutDialog,
  'showFAQDialog':showFAQDialog,
  'showConnectionMsg':showConnectionMsg,
  'showEndMsg':showEndMsg,
  'showErrorMsg':showErrorMsg,
  'showIntroDialog':showIntroDialog,
  'showPGN':showPGN,
  'showSessionOverview':showSessionOverview,
  'showStartDialog':showStartDialog,
  'showOpponentJoinMsg':showOpponentJoinMsg
}
