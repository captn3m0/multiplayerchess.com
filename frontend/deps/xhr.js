var partial = require('functools').partial;

var get = partial(sendRequest, ['GET']),
    post = partial(sendRequest, ['POST']),
    put = partial(sendRequest, ['PUT']);

function sendRequest(method,url,body,callback){
  var req = new XMLHttpRequest(),
      strbody = JSON.stringify(body);
  
  req.open(method,url,true);

  body && req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      req.status == 200 ? callback(null, req.responseText) : ( req.status>0 && callback(new Error('Request Error.( Ready State: '+req.readyState+' Status:'+req.status+' )')) );
    }
  };

  req.send(body && JSON.stringify(body) || null);
  return req;
}

module.exports = {
  'get':get,
  'post':post,
  'put':put,
  'sendRequest':sendRequest
}
