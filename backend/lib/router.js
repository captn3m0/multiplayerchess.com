var requestMethods = ['HEAD','GET','POST','PUT','DELETE','TRACE','OPTIONS','CONNECT','PATCH'];

var subscribers = [];

function filter(method,url){
  var res = [];
  for(var i = -1, len=subscribers.length; ++i < len; ){
    var sub = subscribers[i],
        match = ( sub.methods.indexOf('*')>-1 || sub.methods.indexOf(method)>-1 ) && new RegExp(sub.pattern).exec(url);

    match && res.push({ 
      'subscriber':sub, 
      'params': Array.prototype.slice.call(match,1)
    });
  };

  return res;
};

function register(methods,pattern,reqhandler){
  typeof methods == 'string' && ( methods = [methods] );
  subscribers.push({ 
    'methods':methods, 
    'pattern':pattern, 
    'requestHandler':reqhandler 
  });
};

module.exports = {
  'filter':filter,
  'register':register
};

requestMethods.forEach(function(el){
  module.exports[el.toLowerCase()] = function(method){ 
    return function(url,requestHandler){
      register(method,url,requestHandler);
    }
  }(el);
});
