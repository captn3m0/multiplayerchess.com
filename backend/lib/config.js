module.exports = {
  'DEBUG':true,
  'HOST':'127.0.0.1',
  'PORT':8889,
  'DB_NAME':'chess_test',
  'DB_HOST':'178.79.160.167',
  'DB_PORT':5984,
  'DB_USER':'',
  'DB_PASSWD':''
};

Object.defineProperty(module.exports,'interval', {
  'get':function(){
    var now = (new Date).getTime();
    return {
      'start':now-10000,
      //'start':3,
      'end':now
    }
  }
});
