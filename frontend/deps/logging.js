var partial = require('functools').partial;

exports.enabled = true;
exports.prefix = 'foobar';

var levels = ['debug','info','warn','error','critical','time','timeEnd'];

function log(level){
  if(!exports.enabled || console==undefined) return;
  var fn = console[level] || console.log;
  Array.prototype.splice.call(arguments, 0,1,exports.prefix+' - '+level.toUpperCase()+' - ');
  return fn.apply(console, arguments );
};

for(var i = -1, len=levels.length; ++i < len; ){
  exports[levels[i]] = partial(log,[levels[i]]);
};
