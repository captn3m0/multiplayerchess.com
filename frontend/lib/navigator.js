var gameplay = require('./setup').gameplay,
    router = require('router'),
    config = require('./config'),
    dialogbox = require('./widgets/dialogbox'),
    ui = require('./ui'),
    singleplayer = require('./singleplayer'),
    getSessions = require('./history').getSessions,
    dialogs;

function createPrivateSession(){
  
  if(gameplay.session.id){
    dialogs.confirmSessionLeave(arguments.callee);
    return;
  }

  nickname(null, function(error, nname){
    dialogs.showConnectionMsg();
    gameplay.createSession({ 'isPrivate':true, 'nickname':nname });
  });
}

function joinSession(sessionId,callback){
  nickname(sessionId, function(error, nname){
    dialogs.showConnectionMsg();
    gameplay.join(sessionId,nname,callback);
  });
}

function nickname(sessionId,callback){
  var nname = dialogs.nickname.get();
  if(nname=='Anonymous' && ( !sessionId || !getSessions().hasOwnProperty(sessionId) )){
    dialogs.nickname.prompt(callback);
  } else {
    callback(null, nname);
  }

}

function intro(){
  gameplay.reset();
  dialogs.showIntroDialog();
}

function leave(){
  if(!gameplay.end()){
    dialogs.confirmSessionLeave(navigate.bind(undefined,''));
  } else {
    navigate(''); 
  }
}

function navigate(url){
  router.updateUrl(url);
  router.route(url);
}

function reset(){
  dialogbox.close();
  navigate(gameplay.session.id || '');
}

function resetDialogs(){
  dialogbox.close();

  if(gameplay.session.id && gameplay.state == 2){
    dialogs.showStartDialog();
  } else if(gameplay.session.id && gameplay.state == 3){
    navigate(gameplay.session.id); 
  } else if(gameplay.session.id && gameplay.state == 4){
    navigate(gameplay.session.id+'/overview'); 
  } else {
    navigate('');
  }
}

function resign(){
  dialogs.confirm('Are you sure you want to resign?',gameplay.resign.bind(gameplay));
}

function search(){
  if(gameplay.session.id){
    dialogs.confirmSessionLeave(arguments.callee);
    return;
  }

  dialogs.showConnectionMsg();

  nickname(null, function(error, nname){
    gameplay.start(nname);
  });
}

function sessionSubNavWrapper(fn){
  return function(args){
    var sessionId = args[0];
    if(gameplay.session.id == sessionId){
      fn.apply(null,arguments);
      return; 
    }

    var url = router.getUrl();

    if(sessionId=='singleplayer'){
      singleplayer.navigate();
      navigate(url);
      return;
    }

    joinSession(sessionId, function(){
      navigate(url);
    });
  }
}

function setup(){
  dialogs = require('./dialogs');

  router.setUrlMap({
    '^sessions/search/?$':search,
    '^sessions/new/private/?$':createPrivateSession,
    '^singleplayer/?$':singleplayer.navigate,
    '^about/?$':dialogs.showAboutDialog,
    '^photographers/?$':dialogs.photographers,
    '^photographers/([^\/]*)?/?$':dialogs.photographers,
    '^faq/?$':dialogs.showFAQDialog,
    '^(\\w+)/leave/?$':sessionSubNavWrapper(leave),
    '^(\\w+)/share/?$':sessionSubNavWrapper(share),
    '^(\\w+)/pgn/?$':sessionSubNavWrapper(dialogs.showPGN),
    '^(\\w+)/resign/?$':sessionSubNavWrapper(resign),
    '^(\\w+)/overview/?$':sessionSubNavWrapper(dialogs.showSessionOverview),
    '^(\\w+)/?$':testSessionParamChange(joinSession),
    '^$':intro
  });

  router.listen();

  gameplay.session.on('create', testSessionParamChange(updateSessionParam));
  gameplay.session.on('join', testSessionParamChange(updateSessionParam));
  gameplay.session.on('end', function(){
    navigate(gameplay.session.id+'/overview');
  });
}

function share(){
  if(gameplay.session.id){
    dialogbox.open({
      'symbol':ui.getRandomSymbol(),
      'message':'You can use the URL below to continue this session later and/or to invite someone to play against each other.'
               + '<input class="urlbox" value="'+config.APPLICATION_URL+'/#!/'+gameplay.session.id+'" />',
      'buttons':[{
        'caption':'Close',
        'click':resetDialogs
      }]
    });
  }
}

function testSessionParamChange(callback){
  return function(){
    gameplay.session.id!=router.getUrl().split('/')[0] && callback.apply(undefined, arguments);
  }
}

function updateSessionParam(){
  router.updateUrl(gameplay.session.id);
}

module.exports = {
  'createPrivateSession':createPrivateSession,
  'joinSession':joinSession,
  'leave':leave,
  'navigate':navigate,
  'reset':reset,
  'resetDialogs':resetDialogs,
  'search':search,
  'setup':setup,
  'share':setup,
  'updateSessionParam':updateSessionParam
}
