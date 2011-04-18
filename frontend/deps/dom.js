function detach(object, eventName, fn, capture){
  object[ window.detachEvent && 'detachEvent' || 'removeEventListener' ]( ( window.detachEvent && 'on' || '' ) + eventName, fn, capture );
}

function on(object, eventName, fn, capture){
  object[ window.attachEvent && 'attachEvent' || 'addEventListener' ]( ( window.attachEvent && 'on' || '' ) + eventName, fn, capture );
}

module.exports = {
  'detach':detach,
  'on':on
}
