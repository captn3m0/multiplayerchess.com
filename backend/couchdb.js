var http = require('http'),
    config = require('./config'),
    partial = require('functools').partial,
    base64 = require('base64');

var query = (function(){
  var host = config.DB_HOST,
      port = config.DB_PORT,
      client = http.createClient(port, host, true);

  return function(method,path,data,callback){
    var request = client.request(method, '/' + config.DB_NAME + '/' + path,{
      'Host':config.DB_HOST,
      'Authorization':'Basic ' + base64.encode(config.DB_USER+':'+config.DB_PASSWD)
    });
    data && request.write(JSON.stringify(data));
    request.end();
    request.on('response',function(response){
      var buffer = "";
      
      response.on('data',function(chunk){
        buffer += chunk;
      });

      response.on('end',function(){
        var body = JSON.parse(buffer),
            error = null;

        if(body.error){
          error = new Error(body.error+','+body.reason);
          error.statusCode = response.statusCode;
        }

        callback(error,body); 
      });
    });
  };

})();

function get(id, callback){
  query('GET', id, null, function(error, rec){
    
    if(error){ 
      callback && callback(error);
      return;
    }

    callback(null, rec, save);
  });
}

function save(doc, callback){
  query('PUT', doc._id, doc, function(error, result){
    callback && callback(error, result);
  });
}

module.exports = {
  'get':get,
  'query':query,
  'save':save
}
