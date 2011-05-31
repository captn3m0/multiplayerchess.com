var mustache =  require('mustache'),
    config = require('./config');

var fileCaptions = ['a','b','c','d','e','f','g','h'];

function getRandomSymbol(){
  return "&#98"+Math.round(17+Math.random()*5)+";";
}

function getTemplate(filename,callback){
  var cache = module.exports.TEMPLATE_CACHE;
  return cache.hasOwnProperty(filename) ? callback(null,cache[filename]) : readFile(filename, function(error,fl){
    cache[filename] = fl;
    callback(error, fl);
  });
}

function ljust(str,width,fillchar){
  fillchar=(typeof fillchar!='string'||fillchar.length==0)&&' '||fillchar;
  while(str.length<width){
    str=fillchar+str;
  }
  return str;
}

function queryFragment(fragment,selector/*,all*/){
  /*
  return !selector ? fragment : fragment['querySelector'+(all&&'All'||'')](selector);
  */
  var id;
  selector && ( id = selector.replace(/^#/,'') );
  return id ? document.getElementById(id) : fragment;
}

function parseHtml(html){
  var parent = document.createElement('div');
  parent.innerHTML = html;
  return parent.childNodes;
}

function prettifyTimestamp(ts){
  var date = new Date(ts);
  return date.getUTCFullYear() + '.' + ljust(String(date.getUTCMonth()+1),2,'0') + '.' + ljust(String(date.getDate()),2,'0');
}

function render(template, view, partials){

  !view && ( view = {} );
  !partials && ( partials = {} );

  view._workingdir_ = config.WORKING_DIR;

  return mustache.to_html(template, view, partials);
}

function setup(){
  module.exports.select = queryFragment.bind(null, document.getElementById('mpc'));
}
var readFile = (function(){
  try {
    return require('fs').readFile;
  } catch(exc) {
    return function(url, callback){ 
      return require('xhr').get(url,null,callback);
    }
  }
})();

module.exports = {
  'TEMPLATE_CACHE':{},
  'fileCaptions':fileCaptions,
  'getRandomSymbol':getRandomSymbol,
  'getTemplate':getTemplate,
  'ljust':ljust,
  'parseHtml':parseHtml,
  'prettifyTimestamp':prettifyTimestamp,
  'queryFragment':queryFragment,
  'render':render,
  'setup':setup
}
