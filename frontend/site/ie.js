window.attachEvent('onload', mpc.require('./setup'));
document.attachEvent('onmousemove', mpc.require('./dragndrop').move);
document.attachEvent('onmouseup', mpc.require('./dragndrop').drop);

document.attachEvent('ondragstart', function(eventArgs){
    eventArgs.cancelBubble = true;
    eventArgs.returnValue = false;
});

if(/MSIE 6/.test(navigator.userAgent)){ 
  window.onload = function(){
  document.body.innerHTML = '<div style="background:#ffffcc; color:#111; padding:10px; ">'
                          + '<h1>Sorry!</h1>'
                          + 'You\'re using an outdated web browser. You may upgrade it or get a free, modern web browser. Some of them are;'
                          + '<ul>'
                          + '<li><a href="http://google.com/chrome">Google Chrome</a></li>'
                          + '<li><a href="http://getfirefox.com">Mozilla Firefox</a></li>'
                          + '</ul>'
                          + 'Please feel free to share your ideas: <a href="mailto:contact@multiplayerchess.com">contact@multiplayerchess.com</a>' 
                          + '</div>'
  }
}

!window.XMLHttpRequest && (XMLHttpRequest = function(){
  try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(exc){}
  try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(exc){}
});

!window.JSON && (JSON = (function(){
  
  function parse(source){
    return new Function('return '+source)();
  }

  function stringify(obj){
    var buff = '{',
        seperator = '',
        elType, key, value;
    for(key in obj){
      
      elType = typeof obj[key];
      
      switch(elType){
        case "string":
          value = '"'+obj[key]+'"';
          break;
        case "number":
          value = obj[key];
          break;
        case "boolean":
          value = obj[key];
          break;
        default:
          continue;
      }

      value && ( buff += seperator + '"'+key+'":'+value );
      seperator = ', ';
    }
    buff+='}';

    return buff;
  }

  return { 
    'parse':parse, 
    'stringify':stringify 
  };

})());

if (!Array.prototype.forEach){
  Array.prototype.forEach = function(fun /*, thisp */){
    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++){
      if (i in t)
        fun.call(thisp, t[i], i, t);
    }
  };
}

if (!Array.prototype.map){
  Array.prototype.map = function(fun /*, thisp */){

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
        res[i] = fun.call(thisp, t[i], i, t);
    }

    return res;
  };
}

if (!Array.prototype.indexOf){
  Array.prototype.indexOf = function(searchElement /*, fromIndex */){

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;

    var n = 0;
    if (arguments.length > 0)
    {
      n = Number(arguments[1]);
      if (n !== n) // shortcut for verifying if it's NaN
        n = 0;
      else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }

    if (n >= len)
      return -1;

    var k = n >= 0
          ? n
          : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++)
    {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}


if (!Array.prototype.reduce){
  Array.prototype.reduce = function(fun /*, initialValue */){

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var k = 0;
    var accumulator;
    if (arguments.length >= 2)
    {
      accumulator = arguments[1];
    }
    else
    {
      do
      {
        if (k in t)
        {
          accumulator = t[k++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++k >= len)
          throw new TypeError();
      }
      while (true);
    }

    while (k < len)
    {
      if (k in t)
        accumulator = fun.call(undefined, accumulator, t[k], k, t);
      k++;
    }

    return accumulator;
  };
}
