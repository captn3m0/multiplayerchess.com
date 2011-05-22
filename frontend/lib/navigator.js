var gameplay = require('./setup').gameplay,
    router = require('router'),
    config = require('./config'),
    dialogbox = require('./widgets/dialogbox'),
    ui = require('./ui'),
    singleplayer = require('./singleplayer'),
    dialogs;

function createPrivateSession(){
  
  if(gameplay.session.id){
    confirmSessionLeave(arguments.callee);
    return;
  }

  dialogs.showConnectionMsg();
  gameplay.createSession({ 'isPrivate':true, 'nickname':dialogs.nickname.get() });
}

function joinSession(sessionId){
  (function(nickname){
    if(nickname=='Anonymous'){
      return dialogs.nickname.prompt(arguments.callee);
    }

    dialogs.showConnectionMsg();
    gameplay.join(sessionId,dialogs.nickname.get());

  })(dialogs.nickname.get());
}

function intro(){
  gameplay.reset();
  dialogs.showIntroDialog();
}

function leave(){
  return confirmSessionLeave(navigate.bind(undefined,''));
}

function confirmSessionLeave(callback){
  dialogbox.open({
    'symbol':'?',
    'message':'Are you sure to leave this session?',
    'buttons':[
      {
        'caption':'No',
        'click':resetNavigation
      },
      { 
        'caption':'Yes', 
        'click':function(){
          dialogbox.close();
          gameplay.reset();
          callback();
        }
      }
    ]
  });
}

function navigate(url){
  router.updateUrl(url);
  router.route(url);
}

function resetNavigation(){
  dialogbox.close();
  if(gameplay.session.id){
    navigate(gameplay.session.id);
    gameplay.state == 2 && ( dialogs.showStartDialog() );
    gameplay.state == 4 && ( dialogs.showEndMsg() );
    gameplay.checkRevisionUpdate();
  } else {
    navigate('');
  }
}

function search(){
  if(gameplay.session.id){
    confirmSessionLeave(arguments.callee);
    return;
  }

  dialogs.showConnectionMsg();
  gameplay.start(dialogs.nickname.get());
}

function setup(){
  dialogs = require('./dialogs');

  router.setUrlMap({
    '^sessions/search/?$':search,
    '^sessions/new/private/?$':createPrivateSession,
    '^singleplayer/?$':singleplayer.navigate,
    '^about/?$':dialogs.showAboutDialog,
    '^faq/?$':dialogs.showFAQDialog,
    '^(\\w+)/leave/?$':leave,
    '^(\\w+)/share/?$':share,
    '^(\\w+)/pgn/?$':dialogs.showPGN,
    '^(\\w+)/overview/?$':dialogs.showSessionOverview,
    '^(\\w+)/?$':testSessionParamChange(joinSession),
    '^$':intro
  });

  router.listen();

  gameplay.session.on('create', testSessionParamChange(updateSessionParam));
  gameplay.session.on('join', testSessionParamChange(updateSessionParam));
}

function share(){
  if(gameplay.session.id){
    dialogbox.open({
      'symbol':ui.getRandomSymbol(),
      'message':'You can use the URL below to continue this session later and/or to invite someone to play against each other.'
               + '<input class="urlbox" value="'+config.APPLICATION_URL+'/#!/'+gameplay.session.id+'" />',
      'buttons':[{
        'caption':'Close',
        'click':resetNavigation
      }]
    });
  }
}

function testSessionParamChange(callback){
  return function(){
    gameplay.session.id!=router.getUrl() && callback.apply(undefined, arguments);
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
  'resetNavigation':resetNavigation,
  'search':search,
  'setup':setup,
  'share':setup,
  'updateSessionParam':updateSessionParam
}
