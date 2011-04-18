/**
 * operateAsync - Takes multiple asynchronous tasks applying CPS as a dictionary ({ "foo":, "bar" }) and passes specified callback 
 * a new dictionary consists of the values tasks produce.
 * 
 * Usage Example:
 *
 *   operateAsync({ 'foo':<Function>, 'bar':<Function> },function(error,values){
 *     log(returns['foo'] ...
 *   });
 *
 * Azer Koculu <azer@kodfabrik.com> (MIT Licensed)
 * 02.04.2011 16:15:29
 */
function operateAsync(tasks,callback){
  var retdict     = {},
      len         = 0,
      execCounter = 0,
      kill        = false;

  for(var key in tasks){
    len++;
    setTimeout(tasks[key].bind(undefined,function(){ 
      var taskName  = key,
          taskValue = tasks[key];

      return function(error,ret){
        if(kill) throw new Error('The taskset "'+taskName+'" called is killed.');
        retdict.hasOwnProperty(taskName) && ( error = new Error('Duplicate callback execution.') );

        retdict[taskName] = ret;
        kill = !!error;

        ( error || ++execCounter==len ) && callback(error,retdict);
      };
    }()),0);
  }
}

exports.operateAsync = operateAsync;
