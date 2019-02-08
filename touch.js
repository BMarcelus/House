var touchOn = false;
var touchJoySticks = [
  {
    x: .15, y:.75, r: .2,
    area: {
      x: 0, y: 0, w: 0.5, h: 1
    },
    output: {x: 0, y: 0, angle: 0,r:0},
    held: false,
  },
  {
    x: .85, y:.75, r: .2,
    area: {
      x: 0.5, y: 0, w: 0.5, h: 1
    },
    output: {x: 0, y: 0, angle: 0,r:0},
    held: false,
  }
]

function getTouchPosition(touch, e) {
  var boundingClientRect = CE.getBoundingClientRect();    
  var x = touch.pageX-boundingClientRect.left;
  var y = touch.pageY-boundingClientRect.top - document.body.scrollTop;
  var W = this.canvas.canvas.offsetWidth;
  var H = this.canvas.canvas.offsetHeight;
  x = x/W;
  y = y/H;
  return{x,y};
}

function pointInRect(x,y,rect) {
  return x >= rect.x && x<=rect.x+rect.w &&
    y >= rect.y && y <= rect.y+rect.h;
}

function processTouches(touches, callback) {
  for(var i=0;i<touches.length;i++) {
    var touch = e.changedTouches[i];
    var {x, y} = this.getTouchPosition(touch, e);
    for(var j=0;j<touchJoySticks.length;j++) {
      var joyStick = touchJoySticks[j];
      if(pointInRect(x,y,joyStick.area)) {
        callback(x,y,joyStick);
      }
    }
  }
}

function touchstart(e) {
  initializeSound();
  touchOn = true;
  // if(this.scene.startGame)this.scene.startGame();
  // if(this.scene.time)this.scene.time=0;
  var touches = e.changedTouches;
  e.preventDefault();
  e.stopImmediatePropagation();
  for(var i=0;i<touches.length;i++) {
    var touch = e.changedTouches[i];
    var {x, y} = this.getTouchPosition(touch, e);
    for(var j=0;j<touchJoySticks.length;j++) {
      var joyStick = touchJoySticks[j];
      if(pointInRect(x,y,joyStick.area)) {
        var dx = x - joyStick.x;
        var dy = y - joyStick.y;
        var r = Math.sqrt(dx*dx+dy*dy);
        // var magnitude = r/joyStick.r;
        // if(magnitude>1)magnitude=1;
        var magnitude=1;
        joyStick.output = {
          x: dx/r*magnitude,
          y: dy/r*magnitude,
          angle: Math.atan2(dy,dx),
          r: r,
        };
        joyStick.held = true;
      }
    }
  }
  // processTouches(touches, function(x,y,joyStick) {
  //   var dx = x - joyStick.x;
  //   var dy = y - joyStick.y;
  //   var r = Math.sqrt(dx*dx+dy*dy);
  //   var magnitude = r/joyStick.r;
  //   if(magnitude>1)magnitude=1;
  //   joyStick.output = {x: dx/r*magnitude, y: dy/r*magnitude};
  // });
}
function touchend(e) {
  // if(this.scene.startGame)this.scene.startGame();
  // if(this.scene.time)this.scene.time=0;
  var touches = e.changedTouches;
  e.preventDefault();
  e.stopImmediatePropagation();
  for(var i=0;i<touches.length;i++) {
    var touch = e.changedTouches[i];
    var {x, y} = this.getTouchPosition(touch, e);
    for(var j=0;j<touchJoySticks.length;j++) {
      var joyStick = touchJoySticks[j];
      if(pointInRect(x,y,joyStick.area)) {
        joyStick.held = false;  
      }
    }
  }
  // processTouches(touches, function(x,y,joyStick) {
  //   joyStick.output = {x: 0, y: 0};
  // });
}


  window.addEventListener('touchstart', touchstart,{ passive: false });
  window.addEventListener('touchmove', touchstart,{ passive: false });
  window.addEventListener('touchend', touchend);
  window.addEventListener('touchcancel', touchend);