var config = require('./config'),
    sendRequest = require('xhr').sendRequest;

var serverTime = undefined;

function getServerTime(){
  return serverTime;
}
 
function query(method,path,params,callback,errorCounter,startTime){
  !errorCounter && ( errorCounter = 0 );
  !params && ( params = {} );
  return sendRequest(method,config.SERVICE_URL+'/'+path,params,function(error,resp){
    if(error && ++errorCounter<=30 && (!startTime || (new Date).getTime()-startTime)<10000){
      setTimeout(function(){
        query(method, path, params, callback, errorCounter,startTime||(new Date).getTime());
      },500);
      return;
    }
    var response = resp && JSON.parse(resp) || null;
    !error && response.error && ( error = new Error(response.error) ); 
    !error && ( serverTime = response.serverTime );
    callback(error, response);
  });
}

module.exports = {
  'getServerTime':getServerTime,
  'query':query
};
