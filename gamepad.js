var gamepadOn = false;

var gamepadJoysticks = [
  {held:false, output: {x: 0, y: 0, angle: 0 }},
  {held:false, output: {x: 0, y: 0, angle: 0 }},
]

function pressed(b) {
  return b && (b==1 || b.pressed);
}

function handleGamePad() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  // if(gamepads2.length>0)
  for(var i=0;i<gamepads.length;i++) {
    var gp = gamepads[i];
    if(!gp || gp.buttons.length <= 0)continue;
    if(gp.axes) {
      var x1 = gp.axes[0];
      var y1 = gp.axes[1];
      if(Math.abs(x1)<.25)x1=0;
      if(Math.abs(y1)<.25)y1=0;

      var angle = Math.atan2(y1,x1);
      gamepadJoysticks[0].output = {x:x1,y:y1,angle};
      if(x1!=0||y1!=0) {
        gamepadJoysticks[0].held = true;
        // gamepadOn = true;
      } else {
        gamepadJoysticks[0].held = false;
      }

      var x2 = gp.axes[3];
      var y2 = gp.axes[4];
      if(Math.abs(x2)<.25)x2=0;
      if(Math.abs(y2)<.25)y2=0;
      angle = Math.atan2(y2,x2);
      gamepadJoysticks[1].output = {x:x2,y:y2,angle};
      gamepadJoysticks[1].held = x2!=0||y2!=0;
    }
    if(gp.buttons) {
      gp.buttons.forEach(b => {
        if(pressed(b))gamepadOn = true;
      });
    }
  }
}
  