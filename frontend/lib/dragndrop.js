var css = require('css'),
    on = require('dom').on;

var selection, callback;

function drag(el,fn){
  callback = fn;
  select(el);
  it = 0;
}

function drop(eventArgs){
  callback && callback(eventArgs);
  select();
}

function move(eventArgs){
  var x, y;
  if(selection){
    x = eventArgs.clientX - Math.floor( selection.offsetWidth / 2 );
    y = eventArgs.clientY - Math.floor( selection.offsetHeight / 2 );
    
    selection.style.left = x + 'px';
    selection.style.top = y + 'px';
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

on(window, 'mouseup', drop);
on(window, 'mousemove',move);
on(window, 'touchend',drop);
on(window, 'touchmove',move);

module.exports = {
  'drag':drag,
  'drop':drop,
  'move':move,
  'select':select
};
