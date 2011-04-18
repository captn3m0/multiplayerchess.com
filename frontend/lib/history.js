var gameplay,
    cookie = require('cookie');

function addSession(sessionId, spId){
  var sessions = getSessions();
  sessions[sessionId] = spId;
  saveSessions(sessions);
}

function getNickname(){
  var obj = cookie.read();
  return obj.nickname;
}

function getSessions(){
  var obj = cookie.read();
  return obj.sessions || {};
}

function saveNickname(nickname){
  var obj = cookie.read();
  obj.nickname = nickname;
  cookie.save(obj);
}

function saveSessions(sessions){
  var obj = cookie.read();
  obj['sessions'] = sessions;
  cookie.save(obj);
}

function sync(){
  var self = gameplay.getSelf(),
      sessions = getSessions();

  if(self && !sessions[gameplay.session.id]){
    addSession(gameplay.session.id, self.id);
  }

  if(self && self.nickname!=getNickname()){
    saveNickname(self.nickname);
  }
}

function setup(){
  if(!cookie.read()){
    cookie.clean();
  }

  gameplay = require('./setup').gameplay;
  gameplay.session.on('update', sync);
}

module.exports = {
  'addSession':addSession,
  'getNickname':getNickname,
  'getSessions':getSessions,
  'saveNickname':saveNickname,
  'saveSessions':saveSessions,
  'setup':setup,
  'sync':sync
}
