/* jshint node: true */
/* global io, Hammer, $ */
'use strict';

var touchElem = document.getElementById('mainView');
var socket = io();
var delta = null;
var moving = false;
var passcode = '';
var curKey = ''; 
var mainViewSet = FixedQueue(2); 
var topViewSet = FixedQueue(2); 
var keyInterval; 

var pos = {x: 0, y: 0, cmd: null, pw: ''};
/**
 * pass `pos` object to socket.emit('mouse', pos) function
 *
 * {Object} pos
 * {integer} pos.x mouse x offset
 * {integer} pos.y mouse y offset
 * {string} pos.cmd key command or mouse click (not implemented yet)
 */
var emitMouse = function(x, y, cmd) {
  pos.x = x;
  pos.y = y;
  pos.cmd = cmd;
  pos.pw = passcode;

  socket.emit('mouse', pos);
};

var emitKeyboard = function(cmd){
  socket.emit('key', cmd)
}

socket.on('update-map', function(msg){
  //console.log(msg); 
  var arrayBuff = new Uint8Array(msg); 
  var blob = new Blob([arrayBuff], {type: 'image/png'}); 
  var urlCreate = window.URL || window.webkitURL; 
  var imageUrl = urlCreate.createObjectURL(blob);
  var img = new Image(); 
  img.src = imageUrl; 
  mainViewSet.push(img); 
  $("#mainView").attr('src', mainViewSet[0].src);
}); 


socket.on('update-scoreboard', function(msg){
  //console.log(msg); 
  var arrayBuff = new Uint8Array(msg); 
  var blob = new Blob([arrayBuff], {type: 'image/png'}); 
  var urlCreate = window.URL || window.webkitURL; 
  var imageUrl = urlCreate.createObjectURL(blob);
  var img = new Image(); 
  img.src = imageUrl; 
  topViewSet.push(img); 
  $("#topView").attr('src', topViewSet[0].src);
}); 

var handleKeyDown = function(e){
  e = e || window.event;
  var myId = (e.currentTarget || e.srcElement ).id;
  curKey=myId; 
  console.log('mouse down received: '+ curKey); 
  emitKeyboard(myId);  
  keyInterval = setInterval(function(){
    console.log('mouse down sent: '+ curKey); 
    emitKeyboard(myId);  
    },100);
    return false;
}; 


var handleKeyUpOut = function(e){
  e = e || window.event;
  var myId = (e.currentTarget || e.srcElement).id;
  console.log('mouse up received: '+ curKey); 
  curKey=''; 
  clearInterval(keyInterval);
  return false;  
}; 

var handlePan = function(eventName, e) {
  if (e.type == eventName + 'start' || e.type=='press') {
    delta = null;
    moving = true;
    console.log('start ' + eventName);
    emitMouse(0, 0, eventName + 'start');
  }
  if (e.type == eventName + 'end'||e.type=='pressup') {
    delta = null;
    moving = false;
    emitMouse(0, 0, eventName + 'end');
  }
  if (moving && delta != null) {
    var rect = e.target.getBoundingClientRect();
      var x = e.srcEvent.clientX - rect.left; //x position within the element.
      var y = e.srcEvent.clientY - rect.top;  //y position within the element.
      //console.log('wanna send: '+x + ',' + y); 
      //console.log('but sending: '+e.deltaX - delta.x+','+e.deltaY - delta.y);
    //emitMouse(e.deltaX - delta.x, e.deltaY - delta.y, eventName);
    emitMouse(x,y,eventName); 
  }
  delta = {x: e.deltaX, y: e.deltaY};
};

var mc = new Hammer.Manager(touchElem);
mc.add(new Hammer.Pan({event: 'move', threshold: 0, pointers: 1,
 direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Pan({event: 'scroll', threshold: 0, pointers: 2,
  direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Press({event: 'press'})); 
mc.add(new Hammer.Pan({threshold: 0,  direction: Hammer.DIRECTION_ALL}) );
mc.add(new Hammer.Tap({event: 'click', pointers: 1}));
mc.add(new Hammer.Tap({event: 'rightclick', pointers: 2}));
mc.on('movestart moveend moveup movedown moveleft moveright', 
  function(e) {
      handlePan('move', e);
  });
mc.on('scrollstart scrollend scrollup scrolldown scrollleft scrollright',
  function(e) {
    handlePan('scroll', e);
  });
mc.on('pan panstart panend panup pandown panleft panright', function(e) {
  handlePan('pan', e);
});
mc.on('press pressup', function(e) {
  handlePan('press', e);
});
mc.on('click', function(e) {
  console.info('click');
  emitMouse(0, 0, 'click');
});
mc.on('rightclick', function(e) {
  console.info('rightclick');
  emitMouse(0, 0, 'rightclick');
});

// menu functions
$('.actions').on('click',function(event){
  emitKeyboard(event.target.id); 
}); 

var isTouchDevice = 'ontouchstart' in document.documentElement;
    
$(".arrows").on("mousedown",function(event) {
    if (isTouchDevice == false) {   
        handleKeyDown(event); 
    }
});

$(".arrows").on("mouseup",function(event) {
    if (isTouchDevice == false) {   
        handleKeyUpOut(event); 
    }
});

$(".arrows").on("mouseout",function(event) {
  if (isTouchDevice == false) {   
      handleKeyUpOut(event); 
  }
});

$('.arrows').on('touchstart', function(){
    if (isTouchDevice)  {   
      handleKeyDown(event); 
    }
});
$('.arrows').on('touchend', function(){
    if (isTouchDevice)  {   
      handleKeyUpOut(event); 
    }
});


$('#passcode').click(function() {
  passcode = prompt('Enter a passcode');
});

