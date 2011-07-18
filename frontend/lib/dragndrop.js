var css = require('css'),
    on = require('dom').on;

var selection, callback;

function clientCoords(eventArgs){
  return {
    'x':eventArgs.changedTouches && eventArgs.changedTouches[0].clientX || eventArgs.clientX,
    'y':eventArgs.changedTouches && eventArgs.changedTouches[0].clientY || eventArgs.clientY
  };
}

function drag(el,fn){
  callback = fn;
  select(el);
  it = 0;
}

function drop(eventArgs){
  preventEvent(eventArgs);
  callback && callback(eventArgs);
  select();
}

function move(eventArgs){
  var x, y, 
      pcoords = clientCoords(eventArgs);

  preventEvent(eventArgs);

  if(selection){
    x = pcoords.x - Math.floor( selection.offsetWidth / 2 );
    y = pcoords.y - Math.floor( selection.offsetHeight / 2 );

    selection.style.left = x + 'px';
    selection.style.top = y + 'px';
  }
}

function preventEvent(eventArgs){
  if(eventArgs.preventDefault){
    eventArgs.preventDefault();
  } else {
    eventArgs.cancelBubble = true;
    eventArgs.returnValue = false;
  }
}

function select(el){
  if(selection){
    css.removeClass(selection, 'dragging');
    selection.style.top = '';
    selection.style.left = '';
    selection.style.width = '';
    selection.style.height = '';
    selection = callback = undefined;
  }

  if(el){
    selection = el;
    el.style.width = el.offsetWidth + 'px';
    el.style.height = el.offsetHeight + 'px';
    css.addClass(el,'dragging');
  }

}

on(window, 'touchend',drop);
on(window, 'touchmove',move);
on(window, 'mouseup', drop);
on(window, 'mousemove',move);

module.exports = {
  'clientCoords':clientCoords,
  'drag':drag,
  'drop':drop,
  'move':move,
  'preventEvent':preventEvent,
  'select':select
};
