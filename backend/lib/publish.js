var router = require('./router'),
    config = require('./config'),
    createServer = require('http').createServer;

function ip(request){
  return request.headers['X-Real-IP'] || '1.1.1.1';
}

function log(/* msg ... */){
  var ts = new Date,
      msgs = Array.prototype.slice.call(arguments, 0);

  msgs.splice(0,0,ts.getUTCDate()+'.'+(ts.getUTCMonth()+1)+' - '+(ts.getHours()+1)+':'+(ts.getUTCMinutes())+':'+ts.getUTCSeconds()+'.'+ts.getUTCMilliseconds()+'  ― ');

  console.log.apply(console, msgs);
}

function notify(request,response,ind,list){
  var proceed = arguments.callee.bind(this,request,response,ind+1,list),
      el = list[ind];

  if(ind>=list.length){
    response._headerSent && response.end() || respond(request, response, 404, { 'error':'404 ― Not Found' }).end();
    return;
  }

  var params = el.params.slice();
  params.splice(0,0,request, function(error,result){
    result && ( result.ok==undefined && ( result.ok = true ) );
    result && ( result.serverTime= (new Date).getTime() );

    var status = /*error && (error.statusCode||500) ||*/ 200,
        body = error && { 'error':error.message } || result;

    body && respond(request,response,status,body);
    return error ? response.end() : {
      'end':response.end.bind(response),
      'proceed':proceed
    };
  });
  
  el.subscriber.requestHandler.apply(undefined, params);
}

function respond(request, response, status, body){
  if(!response._headerSent){
    response.writeHead(status, {
      'Content-Type':'text/plain',
      'Access-Control-Allow-Origin':'*'
    });
  }

  response.write(JSON.stringify(body));
  return response;
}

function retrieveRequestBody(request,callback){
  var body = '';
  request.on('data', function(data){
    body += data;
  });

  request.on('end', function(){
    try {
      body = JSON.parse(body);
    } catch(exc){}
    callback(body);
  });
}

function start(){
  createServer(route).listen(config.PORT, config.HOST);
}

function route(request,response){
  retrieveRequestBody(request, function(body){
    request.body = body;
    notify(request,response,0,router.filter(request.method, request.url.replace('/api','').replace('/mpc','')));
  });
}

module.exports = {
  'ip':ip,
  'log':log,
  'respond':respond,
  'start':start,
  'router':router
}
