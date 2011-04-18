/**
 * Apply properties in given CSS object to the specified element.
 *
 * @param el {Element}  The element to apply the properties to
 * @param css {Object}  The properties to apply
 * @return {Element} Passed Element
 */
var apply = exports.apply = function(el,css)
{
  for(var pname in css)
  {
    set( el, pname, css[ pname ] ); 
  }
  return el;
}

/**
 * Add a class name to given element
 *
 * @param el {Element}  The element to add the classname to
 *
 * @param class_name {String} The class name to add to the class attribute
 * @return {Element}  Passed element
 */
var addClass = exports.addClass = function(el,class_name)
{
  if(!hasClass( el, class_name ))
  {
    setClass(el, getClass(el)+' '+class_name );
  }
  return el;
}

var eval = exports.eval = (function(){
  var id = 'stylesheeet-'+(Math.floor(Math.random()*999));
  return function(exp){
    var stylesheet = document.styleSheets[document.styleSheets.length - 1];
    stylesheet.insertRule(exp,stylesheet.cssRules.length);
  }
})();

/**
 * Return value of the class name attribute
 *
 * @param el {Element}  The element to get class
 * @param {String}
 */
var getClass = exports.getClass = function(el)
{
  return el.className;
}

/**
 * Return a RegExp instance to match given class name
 *
 * @param class_name {String} The class to match
 * @return {RegExp}
 */

var getClassPattern = exports.getClassPattern = function(class_name)
{
  return ( new RegExp('(?:^|\\s+)'+class_name+'(?:\\s+|$)','gi') );
}

/**
 * Test presence of given class in an HTML element 
 *
 * @param el {Element}  The element to test
 * @param class_name {String}  The class name to search for
 * @return {Boolean}
 */
var hasClass = exports.hasClass = function(el,class_name)
{
  return getClassPattern( class_name ).test( getClass( el ) ); 
}

/**
 * Remove specified class from given element.
 *
 * @param el {Element}  The element to remove the class from
 * @param class_name {String}  The class name to remove from the class attribute
 * @return {Element} Passed element
 */
var removeClass = exports.removeClass = function(el,class_name)
{
  replaceClass( el, class_name, ''); 
  return el
}

/**
 * Replace a class with given class for specified element 
 *
 * @param el {Element}  The element to replace class from
 * @param class_name {String} The class to be replaced
 * @param replacement {String}  The class that will be replacement of the class_name
 * @return {Element}  Passed element
 */
var replaceClass = exports.replaceClass = function(el,class_name,replacement)
{
  setClass( el, getClass( el ).replace( getClassPattern( class_name ), ' '+replacement+' ' ) );
  return el;
}

/**
 * Set value of the className attribute of given element
 *
 * @param el {Element}  The element to set class name attribute of
 * @param value {String}  New value of the className attribute 
 * @return {Element}  Passed element
 */
var setClass = exports.setClass = function(el,value)
{
  el.className = value;
  return el;
}

/*
 * Toggle given class on specified element 
 *
 * @param el {Element}  The element to toggle class on
 * @param class_name {String} A class name to be toggled for the element
 * @return {Element}
 */
var toggleClass = exports.toggleClass = function(el,class_name)
{
  if( hasClass( el, class_name ) )
  {
    removeClass(el,class_name);
  }
  else
  {
    addClass( el, class_name );
  }
  return el;
}

/**
 * Return absolute value of given CSS property by using getComputedStyle of window object.
 *
 * @param el {Element}  The element to get CSS info
 * @param pname {String}  The property name to get the CSS value of
 * @return {String}
 */
var get = exports.get = function(el,pname)
{
  var style = el.ownerDocument.defaultView.getComputedStyle( el, null );
  var value = style.getPropertyCSSValue( pname );
  return value&&value.cssText||null;
}

/**
 * Set given CSS property on the specified HTML element.
 *
 * @param el {Element}  The element to set CSS property
 * @param pname {String}  Property name
 * @param pvalue {String} Value
 * @return {String} Specified Element
 */
var set = exports.set = function(el,pname,pvalue)
{
  pname = pname.replace(/\-(\w)/g,function(){ return arguments[1].toUpperCase() });
  el.style[ pname ] = pvalue;
  return el;
}
