var config = require('./config'),
    sendRequest = require('xhr').sendRequest;

var serverTime = undefined;

function getServerTime(){
  return serverTime;
}
 
function query(method,path,params,callback){
  !params && ( params = {} );
  return sendRequest(method,config.SERVICE_URL+'/'+path,params,function(error,resp){
    var response = resp && JSON.parse(resp) || null;
    !error && response.error && ( error = new Error(response.error) ); 
    serverTime = response.serverTime;
    callback(error, response);
  });
}

module.exports = {
  'getServerTime':getServerTime,
  'query':query
};
