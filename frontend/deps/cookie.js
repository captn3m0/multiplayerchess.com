function clean(){
  save({});
}

function read(){
  var obj = {}, parts, i,len;
  if(document && document.cookie){
    parts = document.cookie.split(/;\s*/);
    for(i = -1, len=parts.length; ++i < len; ){
      if((new RegExp(module.exports.key+'=')).test(parts[i])){
        obj = JSON.parse(decodeURI(parts[i].substring(module.exports.key.length+1)));
      }
    };
  }

  return obj;
}

function save(obj){
  var date = new Date();
  date.setTime(date.getTime()+(7*24*60*60*1000));
  document.cookie = module.exports.key
                  +"="
                  + encodeURI(JSON.stringify(obj))
                  + "; expires="+date.toGMTString()
                  + "; path=/";
}

module.exports = {
  'key':'mpc',
  'clean':clean,
  'read':read,
  'save':save
}
