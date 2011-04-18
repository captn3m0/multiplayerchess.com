// window.Object.create = fn;
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    function F() {}  // empty constructor
    F.prototype = o; // set base object as prototype
    return new F();  // return empty object with right [[Prototype]]
  };
}

if(typeof Function.prototype.bind !== 'function'){
  Function.prototype.bind = function(ctx){
    var fn = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return fn.apply(ctx, args.concat(Array.prototype.slice.call(arguments)));
    }
  }
}
