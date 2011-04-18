var Observable = require('observer').Observable,
    inherits = require('util').inherits;

function Player(){
  Observable.call(this);
  
  this.id = undefined;

  this.white = undefined;
  this.black = undefined;

  this.lastMoveTS = undefined;

  this.session = undefined;

  this.events.create('update');
};

inherits(Player, Observable);

function identify(){
  var player = new Player();
  player.id = readId() || saveId(generateId());
  return player;
}

function readId(){
  var match = document.cookie.match(/player_id=(\w+)/);
  return match && match[1];
};

function saveId(id){
  var expires = (new Date( (new Date).getTime()+604800000 )).toGMTString();
  document.cookie='player_id='+id+';'+expires+'; path=/';
  return id;
};

module.exports = {
  'Player':Player,
  'identify':identify
};
