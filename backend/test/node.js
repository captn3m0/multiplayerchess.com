var testcases = [require('./session'),
                 require('./player'),
                 require('./search'),
                 require('./utils'),
                 require('./request')],
    puts = require('sys').puts,
    count = error = ok = uk = 0,
    couchdb = require('../lib/couchdb');

function reset(callback){
  couchdb.query('DELETE', '', {}, function(error){
    if(error){
      console.log('Error removing the db:',error);
    } 
    couchdb.query('PUT','', {}, function(error){
      if(error){
        console.log('Error creating the db:',error);
      } else {
        callback();
      }
    });
  });
}

function runTest(testcase, prefix){
  var startTS = (new Date).getTime();
  testcase(function(err, success){
    err && ( error++ );
    success && ( ok++ );
    !err && !success && ( uk++ );

    puts('['+ (err && 'ERROR:'+err.message || (success && 'OK' || 'INVALID RETURN')) + '] ' + prefix + ', elapsed time: '+( (new Date).getTime() - startTS )/1000+'s');

    if(count>0 && count == error + ok + uk){
      console.log('----');
      console.log('Ran '+count+' tests. '+error+' Errors, '+uk+' Invalid Returns.');
    }
  });
}

function runAll(){
  var c = 0;
  for(var i = -1, len=testcases.length; ++i < len; ){
    var testcase = testcases[i];
    for(var key in testcase){
      if(key.substring(0,5)=='test_'){
        c++;
        runTest(testcase[key], testcase.name + '> [ '+testcase[key].name+' ]');
      }
    }
  };

  count = c;
}

reset(runAll);
