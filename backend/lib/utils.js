var http = require('http'),
    crypto = require('crypto');

function encrypt(input){
  var salt = Math.floor(Math.random()*999);   
  return salt+'&'+crypto.createHash('md5').update(salt+'&'+input).digest("hex");
}

function operateAsync(tasks,callback){
  var retdict     = {},
      len         = 0,
      execCounter = 0,
      kill        = false;

  for(var key in tasks){
    len++;
    setTimeout(tasks[key], 0, (function(){ 
      var taskName  = key,
          taskValue = tasks[key];

      return function(error,ret){
        if(kill) throw new Error('The taskset "'+taskName+'" called is killed.');
        retdict.hasOwnProperty(taskName) && ( error = new Error('Duplicate callback execution.') );

        retdict[taskName] = ret;
        kill = !!error;

        ( error || ++execCounter==len ) && callback(error,retdict);
      };
    })());
  }
}

function generateId(){
  return parseInt(Math.floor(Math.random()*999999999999));
}

function request(method,url,data,options,callback){
  var parts = url.match(/(?:http\:\/\/)?([^\:\/]+)(?:\:(\d*))?(\/.*)?/),
      host = parts[1],
      port = parts[2] || 80,
      path = parts[3] || '/';

  !options && ( options = {} );
  !options.Host && ( options.Host = host );

  var client = http.createClient(port, host, true),
      request = client.request(method, path, options);

  data && request.write(data);

  request.end();
  request.on('response',function(response){
    var buffer = "";
    
    response.on('data',function(chunk){
      buffer += chunk;
    });

    response.on('end',function(){
      var body = buffer,
          error = null;

      if(body.error){
        error = new Error(body.error+','+body.reason);
      }

      callback(error,body); 
    });
  });
};

function validateEncryption(input,ref){
  var parts = ref.split('&'),
      salt = parts[0],
      enc = parts[1];

  return crypto.createHash('md5').update(salt+'&'+input).digest("hex") == enc;
}

module.exports = {
  'encrypt':encrypt,
  'generateId':generateId,
  'operateAsync':operateAsync,
  'request':request,
   'validateEncryption':validateEncryption
}
