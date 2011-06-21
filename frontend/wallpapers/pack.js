var picks = require('./picks'),
    FlickrAPI = require('flickrapi/flickrapi').FlickrAPI,
    config = require('./config'),
    puts = require('sys').puts;

var f = new FlickrAPI(config.API_KEY,config.SECRET_KEY);

var owner = (function(){

  var owners = {};

  return function(id,callback){
    if(!id){
      return owners;
    } 

    if(owners[id]){
      return callback(null, owners[id]);
    }

    f.people.getInfo(id, function(error, info){
      if(error){
        return callback(error);
      }

      owners[id] = {
        'username':info.username._content,
        'realname':info.realname && info.realname._content || '',
        'location':info.location && info.location._content || '',
        'url':info.photosurl._content,
        'photos':[]
      };

      callback(null, owners[id]);
    });

  }

})();

function sizes(id, callback){
  f.photos.getSizes(id, function(error, sizes){
    if(error){
      callback(error);
      return;
    }

    var _sizes = {}, 
        i = sizes.size.length;

    while(i-->0){
      var el = sizes.size[i];
      if(el.label == 'Medium' || el.label == 'Large'  || el.label == 'Square'){
        _sizes[el.label.toLowerCase()] = el.source;
      }
    }

    callback(null, _sizes);
  });
}

function gather(callback){

  var photos = [];
  (function(i){

    if(i>=picks.length){
      callback(null, photos);
      return;
    }

    var next = arguments.callee.bind(null, i+1),
        id = picks[i];

    //console.log('Getting sizes of photo#',id);
    sizes(id, function(error, sizes){
      if(error){
        return callback('Size Error:'+error.message);
      }

      //console.log('Getting info of photo#',id);
      
      f.photos.getInfo(id, null, function(error, info){
        owner(info.owner.nsid, function(error, o){
          if(error){
            return callback('Owner Error:'+error.message);
          };
          photos.push({ 'id':id, 'flip':picks.toFlip.indexOf(id)>-1, 'owner':info.owner.nsid, 'sizes':sizes }); 
          sizes.url = info.urls.url[0]._content;
          o.photos.push(sizes);
          next();
        });
      });

    });


  })(0);

}

gather(function(error, photos){
  if(error){
    throw error;
  }
  
  var body = 'module.exports = '
           + JSON.stringify(photos)
           + ';'
           + '\n\nmodule.exports.owners = '
           + JSON.stringify(owner())
           + ';'
  puts(body);
});
