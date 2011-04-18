var EventBroker = require('observer').EventBroker,
    Gameplay    = require('./gameplay').Gameplay,
    on          = require('dom').on,
    config      = require('config');

var setup = mpc.setup = module.exports = function setup(){
  var ui        = require('./ui'),
      navigator = require('./navigator'),
      container = require('./widgets/container'),
      dialogs   = require('./dialogs'),
      history   = require('./history'),
      titlebar  = require('./widgets/titlebar');

      toSetup = [container,dialogbox,dialogs,history,navigator,titlebar];

  render(function(error, html){
    if(error){
      events.publish('error',error);
      return;
    }

    ui.setup();
    ui.select().innerHTML = html;

    toSetup.forEach(function(el){
      el && el.setup(gameplay);
    });

    events.publish('success');

    container.select().style.visibility = 'visible';
  });
}

var events = setup.events = new EventBroker;
events.create('error');
events.create('success');

setup.on = events.subscribe.bind(module.exports.events);

var gameplay = setup.gameplay = new Gameplay;
var dialogbox = setup.dialogbox = require('widgets/dialogbox');

var render = exports.render = function render(callback){
  var container = require('./widgets/container');
  container.render(callback);
}

on(window, 'DOMContentLoaded', setup);
