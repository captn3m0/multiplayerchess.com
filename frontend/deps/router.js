var urlmap = {},
    prev;

function getUrl(){
  var match = location.href.match(/#!\/(.*)$/);
  return match && match.length>1 && match[1].length ? match[1] : '';
}

function getUrlMap(){
  return urlmap;
}

function listen(){
  var url = getUrl();
  testChange(url) && route(url);
  setTimeout(listen,1000); 
}

function route(url){
  prev = url;
  var matching = match(url),
      handler = urlmap[matching.pattern];

  if(!handler){
    throw new Error('Invalid URL: '+url)
  }

  handler(matching.params); 
}

function match(url){
  var pattern, params, match;
  for(var key in urlmap){
    match = url.match(new RegExp(key));
    if(match){
      pattern = key;
      params = match.slice(1);
      break;
    }
  }

  return { 'params':params, 'pattern':pattern };
}

function setUrl(url){
  location.href = '#!/'+url;
}

function setUrlMap(obj){
  urlmap = obj;
}

function testChange(url){
  return prev==undefined || prev!=url;
}

function updateUrl(url){
  prev = url;
  setUrl(url);
}

module.exports = {
  'getUrl':getUrl,
  'getUrlMap':getUrlMap,
  'listen':listen,
  'match':match,
  'route':route,
  'setUrl':setUrl,
  'setUrlMap':setUrlMap,
  'updateUrl':updateUrl
}
