var CE = document.getElementById('gc');
var canvas = CE.getContext('2d');

function onresize(e){
  var rw = window.innerWidth/window.innerHeight;
  var rc = canvas.width/canvas.height;
  if(rw > rc) {
    CE.style.height = "100%";
    CE.style.width = "";
  } else {
    CE.style.width = "100%";
    CE.style.height = "";
  }
}

canvas.triangle = function(x,y,b,h) {
  canvas.moveTo(x,y);
  canvas.lineTo(x+b,y);
  canvas.lineTo(x+b/2,y+h);
  canvas.lineTo(x,y);
}

canvas.fillTriangle = function(x,y,b,h) {
  canvas.beginPath();
  canvas.triangle(x,y,b,h);
  canvas.fill();
}

function drawHouse(x,y,w,h,style1,style2) {
  canvas.fillStyle = style1||'white';
  canvas.fillRect(x,y+h/2,w,h/2);
  canvas.fillTriangle(x+-w/10,y+h/2+1,w+w*2/10,-h/2);
  canvas.fillStyle = style2||'black';
  canvas.fillRect(x+w*.6,y+h/2+h/6,w/4,h*2/6);
  canvas.fillRect(x+w*.2,y+h/2+h/6,w/5,h/6);
}

function drawHalfHouse(x,y,w,h,style1,style2) {
  canvas.fillStyle = style1||'white';
  canvas.fillRect(x,y+h/2,w/2,h/2);
  canvas.beginPath();
  canvas.moveTo(x-w/10,y+h/2+1);
  canvas.lineTo(x+w/2,y+h/2+1-h/2);
  canvas.lineTo(x+w/2,y+h/2+1);
  canvas.fill();
  canvas.fillStyle = style2||'black';
  canvas.fillRect(x+w*.2,y+h/2+h/6,w/5,h/6);
}

class Thing {
  constructor() {
    this.scale = 1;
    this.angle = 0;
  }
  update() {}
  draw() {
    const {x,y,w,h} = this;
    canvas.save();
    canvas.translate(x,y);
    canvas.scale(this.scale,this.scale);
    canvas.rotate(this.angle);
    canvas.translate(-w/2,-h/2);
    this.drawShape(0,0,w,h,this.color,this.color2);
    canvas.restore();
  }
}

class Clickable extends Thing{
  constructor(x,y) {
    super();
    this.x=x;
    this.y=y;
  }
  contains(x,y) {
    return x>=this.x-this.w/2&&x<=this.x+this.w/2&&
      y>=this.y-this.h/2&&y<=this.y+this.h/2;
  }
  moused() {
    return this.contains(mouse.x,mouse.y);
  }
  clicked() {

  }
  update() {
    // this.scale+=0.1;)
    if(this.moused()) {
      this.scale += (1.2-this.scale)/3;
      if(mouse.down) {
        this.clicked();
      }
    } else {
      this.scale += (1-this.scale)/3;
    }
  }
}

class HouseButton extends Clickable {
  constructor(x,y) {
    super(x,y);
    this.w=50;
    this.h=60;
    // this.drawShape=drawHouse;
    this.d = 100;
  }
  update() {
    this.d += (0-this.d)/50;
    // if(this.d>0)
    // this.d-=1;
    if(touchOn || gamepadOn) this.clicked();
    super.update();
  }
  clicked() {
    this.shouldDelete = true;
    entities.push(new Mover(this.x,this.y));
    entities.push(new CrossHairs());
    mouse.down = false;
    SOUNDS.start.play();
    started = true;
    frameCount=0;
  }
  drawShape(x,y,w,h,style1,style2) {
    var d = this.d;
    canvas.fillStyle = style1||'white';
    canvas.fillRect(x,y+h/2+d,w,h/2);
    canvas.fillTriangle(x+-w/10,y+h/2+1-d,w+w*2/10,-h/2);
    canvas.fillStyle = style2||'black';
    canvas.fillRect(x+w*.6,y+h/2+h/6+d*2,w/4,h*2/6);
    canvas.fillRect(x+w*.2,y+h/2+h/6+d*3,w/5,h/6);
  }
}
var crossHairs;
class CrossHairs extends Thing {
  constructor() {
    super();
    this.color='red';
    this.color2 = '#900';
    this.x = mouse.x;
    this.y = mouse.y;
    this.w = 0;
    this.h = 0;
    this.distance = 3;
    CE.style.cursor = 'none';
    crossHairs = this;
  }
  update() {
    if(touchOn) {
      this.x = player.x + touchJoySticks[1].output.x*300;
      this.y = player.y + touchJoySticks[1].output.y*300;
    } else if(gamepadOn) {
      this.x = player.x + gamepadOn[1].output.x*300;
      this.y = player.y + gamepadOn[1].output.y*300;
    } else {
      this.x = mouse.x;
      this.y = mouse.y;
    }
    if(this.x<0)this.x=0;
    if(this.x>CE.width)this.x=CE.width;
    if(this.y<0)this.y=0;
    if(this.y>CE.height)this.y=CE.height;
    if(player.shooting&&player.shootTimer%10==0) {
      this.distance = 9;
      this.scale = 1.2;
    } else {
      this.distance += (2-this.distance)/30;
      this.scale += (1-this.scale)/30;
    }
  }
  drawShape(x,y,w,h,color) {
    w=6;
    for(var i=0;i<4;i++) {
      var s = 1;
      var h = 14;
      drawHouse(-w/2-.3-s,this.distance-s,w+s*2,h+s*2,"#000","#000");
      drawHouse(-w/2-.3,this.distance,w,h,color,this.color2);
      canvas.rotate(Math.PI/2);
    }
  }
}

function getAxes() {
  if(touchOn&&touchJoySticks[0].held) {
    // var r = touchJoySticks[0].output.r / 0.1;
    // if(r>1)r=1;
    
    return {
      inputX: touchJoySticks[0].output.x,
      inputY: touchJoySticks[0].output.y,
    }
  }
  if(gamepadOn&&gamepadJoysticks[0].held) {
    return {
      inputX: gamepadJoysticks[0].output.x,
      inputY: gamepadJoysticks[0].output.y,
    }
  }
  var inputX = (keys[68]||keys[39])-(keys[65]||keys[37]);
  var inputY = (keys[83]||keys[40])-(keys[87]||keys[38]);
  return {inputX, inputY};
}

//Player
var numberOfShots = 1;
class Mover extends Thing{
  constructor(x,y) {
    super();
    this.x=x;
    this.y=y;
    this.w=50;
    this.h=60;
    this.vx = 0;
    this.vy = -6;
    this.moveSpeed = 3;
    this.update = this.updatePlatformer;
    this.moveAnimation=0;
    this.maxLife = 6;
    this.life = this.maxLife;
    player = this;
    this.invul = 0;
    this.moving = false;
    this.coins = 0;
    this.moveFrame = 0;
    this.shooting = false;
    this.shootTimer = 0;
  }
  hit() {
    if(this.life<=0)return;
    if(this.invul>0)return;
    this.scale += 0.3;
    this.life -= 1;
    this.invul = 20;
    if(this.life<=0) {
      SOUNDS.die.play();
    }
    else
    SOUNDS.playerHit.play();
  }
  updateAimAngle() {
    if(touchOn&&touchJoySticks[1].held) {
      this.aimAngle = touchJoySticks[1].output.angle;
      this.shooting = true;
      return;
    }
    if(gamepadOn&&gamepadJoysticks[1].held) {
      this.aimAngle = gamepadJoysticks[1].output.angle;
      this.shooting = true;
      return;
    }
    this.shooting = mouse.held;
    if(mouse.down)this.shootTimer=0;
    var dx = mouse.x - this.x;
    var dy = mouse.y - this.y;
    this.aimAngle = Math.atan2(dy,dx);
  }
  doWobble() {
    var frq = 16;
    this.angle = Math.sin(this.moveFrame*Math.PI/frq)*Math.PI/24*this.moveAnimation;
    if(this.moving&&this.moveFrame%frq==1) {
      SOUNDS.footstep.play();
    }
    if(!this.moveAnimation) this.moveFrame = 0;
  }
  doShoot() {
    if(win) return;
    /*
       var spacing = this.shotSize*3;
    this.heat += this.heatPerShot*this.heatModifier;
    var shots = this.multiShot+1;
    var left = (-shots)*spacing/2;
    for(var i=0;i<shots;++i) {
      var dx = left + (i+0.5)*spacing;
    */
    if(this.shooting&&this.shootTimer%10==0) {
      var spacing = Math.PI/20;
      var startAngle = this.aimAngle - (numberOfShots) * spacing/2;
      for(var i=0;i<numberOfShots;i++) {
        var bulletAngle = startAngle + (i+.05) * spacing;
        var b = new Bullet(
          this.x + Math.cos(bulletAngle)*50,
          this.y + Math.sin(bulletAngle)*50,
          bulletAngle,this);
        entities.push(b);
        playerBullets.push(b);
      }
      SOUNDS.shoot.play();
    }
  }
  otherUpdates() {
    this.moveFrame += 1;
    this.shootTimer += 1;
    this.scale += (1-this.scale)/3;
    if(this.invul>0)
      this.invul -= 1;
    this.updateAimAngle();
    this.doWobble();
    this.doShoot();
    if(this.x<0)this.x=0;
    if(this.x>CE.width)this.x=CE.width;
    if(this.y<0)this.y=0;
    if(this.y>CE.height)this.y=CE.height;
  }
  updatePlatformer() {
    var {inputX, inputY} = getAxes();
    this.vx = inputX*this.moveSpeed;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    if(this.y>CE.height*.8) {
      this.y = CE.height*.8;
      this.vy = 0;
    }
    if(inputY) {
      this.update = this.updateMover;
    }
    if(this.vx) {
      this.moveAnimation += (1-this.moveAnimation)/10;
      this.moving = true;
    } else {
      this.moveAnimation += (0-this.moveAnimation)/10;
      this.moving = false;
    }

    this.otherUpdates();
  }
  updateMover() {
    var {inputX, inputY} = getAxes();
    if(this.life<=0) {
      this.vx *= 0.8;
      this.vy *= 0.8;
    }
    else
    if(this.invul) {
      this.vx += (inputX*this.moveSpeed-this.vx)/2;
      this.vy += (inputY*this.moveSpeed-this.vy)/2;
    } else {
      this.vx = inputX*this.moveSpeed;
      this.vy = inputY*this.moveSpeed;
    }
    this.x += this.vx;
    this.y += this.vy;
    if(this.vx||this.vy) {
      this.moveAnimation += (1-this.moveAnimation)/10;
      this.moving = true;
    } else {
      this.moveAnimation += (0-this.moveAnimation)/10;
      this.moving = false;
    }
    this.otherUpdates();
  }
  drawShape(x,y,w,h) {
    drawHouse(x,y,w,h);
    canvas.translate(w*.5,h*.6);
    canvas.scale(0.3,0.3);
    canvas.rotate(this.aimAngle+Math.PI/2);
    drawHouse(-w/2,-h*3,w,h);
  }
}

class Bullet extends Thing{
  constructor(x,y,angle,parent) {
    super();
    this.x = x;
    this.y = y;
    this.w = 15;
    this.h = 15;
    this.angle = angle+Math.PI/2;
    this.parent = parent;
    this.drawShape = drawHouse;
    this.speed = 4;
    this.vx = Math.cos(angle)*this.speed;
    this.vy = Math.sin(angle)*this.speed;
    this.life = 100;
    this.color = 'white';
  }
  hit() {
    this.shouldDelete=true;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1;
    if(this.life<=0)this.shouldDelete=true;
  }
}

class Enemy extends Thing {
  constructor(x,y) {
    super();
    this.x=x;
    this.y=y;
    this.w=50;
    this.h=60;
    this.color = '#a00';
    this.drawShape = drawHouse;
    this.life =3;
    enemies.push(this);
    this.vx = 0;
    this.vy = 0;
    this.speed = 1;
    this._w=this.w;
    this._h=this.h;
    this.frame = 0;
    this.target = player;
  }
  movement(dx,dy,angle,r) {
    this.vx = Math.cos(angle+Math.PI/20)*this.speed;
    this.vy = Math.sin(angle+Math.PI/20)*this.speed;
  }
  update() {
    this.frame += 1;
    var dx = this.target.x - this.x;
    var dy = this.target.y - this.y;
    var angle = Math.atan2(dy,dx);
    var r = Math.sqrt(dx*dx+dy*dy);
    this.movement(dx,dy,angle,r);
    this.x += this.vx;
    this.y += this.vy;
    this.angle = Math.cos(this.frame*Math.PI/20)*Math.PI/24;
    // this.h = this._h * (.95+.1*Math.cos(frameCount*Math.PI/20));
    this.scale += (1-this.scale)/3;
    if(collides(this,player)) {
      this.x -= dx/r;
      this.y -= dy/r;
      if(this.target!=player) {
        dx = player.x - this.x;
        dy = player.y - this.y;
        r  = Math.sqrt(dx*dx+dy*dy);
        if(r==0){r=1;dx=1;}
      }
      player.hit();
      player.vx = dx/r*10;
      player.vy = dy/r*10;
    }

  }
  hit() {
    this.life -= 1;
    this.scale+=.2;
    SOUNDS.hit.play();
    if(this.life<=0) {
      this.shouldDelete = true;
      SOUNDS.enemyDie.play();
      if(Math.random()>0.7) {
        SOUNDS.coin.play();
        for(var i=0;i<1+Math.random()*4;++i) {
          entities.push(new Coin(this.x,this.y,Math.random()*Math.PI*2,Math.random()));
        }
      }
      if(Math.random()>0.9) {
        SOUNDS.health.play();
        entities.push(new Health(this.x,this.y,Math.random()*Math.PI*2,Math.random()));
      }
    }
  }
}

function linearMove(start, target, d) {
  if(target>start+d)return start+d;
  if(target<start-d)return start-d;
  return target;
}

class BigEnemy extends Enemy {
  constructor(x,y) {
    super(x,y);
    this.w = this.w*1.2;
    this.h = this.h*1.1;
    this.color = "#900";
    this.life = 7;
    this.speed = 3;
  }

  movement(dx,dy,angle,r) {
    var tx = Math.cos(angle)*this.speed;
    var ty = Math.sin(angle)*this.speed;
    this.vx = linearMove(this.vx, tx, .01);
    this.vy = linearMove(this.vy, ty, .01);
  }
}

class FastEnemy extends Enemy {
  constructor(x,y) {
    super(x,y);
    this.w = this.w*.7;
    this.h = this.h*.7;
    this.color = "#b99";
    this.life = 1;
    this.speed = 2;
    this.da = (1-Math.floor(Math.random()*2)*2)*Math.PI/5;
  }
  movement(dx,dy,angle,r) {
    angle += this.da;
    var tx = Math.cos(angle)*this.speed;
    var ty = Math.sin(angle)*this.speed;
    this.vx = linearMove(this.vx, tx, .4);
    this.vy = linearMove(this.vy, ty, .4);
  }
}

class Boss extends Enemy {
  constructor(x,y) {
    super(x,y);
    this.w = this.w*3;
    this.h = this.h*3;
    this.color = '#888';
    this.life = 200;
    this.speed = 1;
    SOUNDS.bossSpawn.play();
    this.state = 0;
    this.stateTimer = 200;
    this.dx = 0;
    this.dy = 0;
    this.stage = 0;
    this._w=this.w;
    this._h=this.h;
  }
  movement(dx,dy,angle,r) {
    this.dx=dx/r;
    this.dy=dy/r;
    var tx = Math.cos(angle)*this.speed;
    var ty = Math.sin(angle)*this.speed;
    this.vx = linearMove(this.vx, tx, .4);
    this.vy = linearMove(this.vy, ty, .4);
    if(this.x<0)this.x=0;
    if(this.y<0)this.y=0;
    if(this.x>CE.width)this.x=CE.width;
    if(this.y>CE.height)this.y=CE.height;
  }
  update() {
    if(this.life<80&&this.stage==0) {
      this.color = 'red';
      this.stage = 1;
      this.state = 6;
      this.stateTimer = 10;
      this._w*=0.7;
      this._h*=0.7;
      SOUNDS.bossSpawn.play();
    }
    this.stateTimer -= 1;
    var numStates=5;
    if(this.stateTimer<=0) {
      this.stateTimer = 100;
      var ps = this.state;
      this.state = (this.state+1)%8;
      // if(this.state==3||this.state==4) {
      //   this.state+=numStates;
      // } else {
      //   this.state = Math.floor(Math.random()*6);
      //   while(ps==1&&this.state==1)this.state = Math.floor(Math.random()*6);
      //   if(this.state==3||this.state==4) {
      //     this.stateTimer = 100;
      //   } else
      //   if(this.stage==0) {
      //     this.target = {
      //       x: Math.random()*CE.width,
      //       y: Math.random()*CE.height,
      //     };
      //   }
      // }
      if(this.life>150&&this.state>2) {
        this.state=1;
      }
      if(this.life>80&&this.state>5) {
        this.state = 3;
      }
      if(this.state==0) {
        this.target = {
          x: CE.width/2,
          y: CE.height/2,
        }
        this.speed = 3;
      } else if(this.state==1) {
        this.stateTimer = 70;
        this.target = player;
        this.speed = -4;
      } else if(this.state==2) {
        this.target = {
          x: player.x, y: player.y
        };
        this.speed = 6;
      } else if(this.state==3) {
        this.target = {
          x: CE.width/2,
          y: 0,
        }
        this.speed = 4;
      } else if(this.state==4) {
        this.target = {
          x: player.x,
          y: 0,
        }
        this.speed = 6;
      } else if(this.state==5) {
        this.target = {
          x: this.x,
          y: CE.height,
        }
        this.speed = 10;
      } else if(this.state==6) {
        this.target = {
          x: CE.width/2,
          y: CE.height/2,
        };
        this.speed = 5;
      } else if(this.state==7) {
        this.stateTimer = 900;
      }
      if(this.stage==1) {
        this.speed*=2;
      }
    }
    if(this.state==4) {
      this.w += (this._w*1.2-this.w)/3;
      this.h += (this._h*.8-this.h)/3;
      this.target = {
        x: player.x,
        y: 0,
      }
    } else if(this.state==5) {
      this.w += (this._w*.8-this.w)/3;
      this.h += (this._h*1.2-this.h)/3;
    } else {
      this.w += (this._w-this.w)/3;
      this.h += (this._h-this.h)/3;
    }
    if(this.state==7) {
      var dx = player.x-this.x;
      var dy = player.y-this.y;
      this.target = {
        x: this.x+dy,
        y: this.y-dx,
      }
      this.speed = 8;
      if(this.stateTimer>600&&this.frame%20==0) {
        entities.push(new FastEnemy(this.x+this.dx*10,this.y+this.dy*10));
      }
    }
    // if(this.state==0) {
    //   this.speed = 1;
    //   this.w += (this._w-this.w)/3;
    //   this.h += (this._h-this.h)/3;
    //   if(this.stage!=0)this.speed = 2.5;
    // } else if(this.state==1) {
    //   this.w += (this._w-this.w)/3;
    //   this.h += (this._h-this.h)/3;
    //   this.target = player;
    //   this.speed = Math.cos(this.stateTimer*Math.PI/50-Math.PI/4)*6;
    // } else if(this.state==2) {
      // this.w += (this._w-this.w)/3;
      // this.h += (this._h-this.h)/3;
      // if(this.stage!=0) {
      // this.speed = -1;
        // if(this.frame%20==0) {
        //   entities.push(new FastEnemy(this.x+this.dx*10,this.y+this.dy*10));
        // }
      // }
    // } else if(this.state==3) {
    //   // this.w = (.9+4*(50-this.stateTimer)/50)*this._w;
    //   // this.h += (this._h/2-this.h)/3;
    //   // this.speed = 0;
    //   this.color='green';
    //   this.target = {
    //     x: player.x, y:-10
    //   }
    //   this.speed = 8;
    // }
    // else if(this.state==3+numStates) {
    //   this.color='green';
    //   this.target = {
    //     x: this.x, y:CE.height
    //   }
    //   this.speed = 12;
    // }
    // else if(this.state==4) {
    //   this.color='blue';
    //   // this.h = (.9+4*(50-this.stateTimer)/50)*this._h;
    //   // this.w += (this._w/2-this.w)/3;
    //   // this.speed = 0;
    //   this.target = {
    //     x: -10,
    //     y: player.y
    //   }
    //   this.speed = 8;
    // }
    // else if(this.state==4+numStates) {
    //   this.color='blue';
    //   this.target = {
    //     x: CE.width,
    //     y: this.y,
    //   }
    //   this.speed=12;
    // }
    // else if(this.state==5) {
    //   this.w += (this._w*1.5-this.w)/10;
    //   this.h += (this._h*1.5-this.h)/10;
    // }
    if(this.stage==0&&this.life<150&&this.frame%200==0) {
      entities.push(new BigEnemy(this.x+this.dx*10,this.y+this.dy*10));
    }
    super.update();
    if(this.state==1||this.state==2) {
      this.angle = Math.atan2(this.dy,this.dx)+Math.PI/2;
    }
  }
  // movement(dx,dy,angle,r) {
  //   this.tx = Math.cos(angle)*this.speed;
  //   this.ty = Math.sin(angle)*this.speed;
  //   this.vx = (this.tx-this.vx)/10;
  //   this.vy = (this.ty-this.vy)/10;
  // }
  draw() {
    super.draw();
    canvas.save();
    var len = 20;
    if(this.frame<20)
    canvas.translate(0,(-20+this.frame)*10);
    canvas.fillStyle = this.color;
    canvas.strokeStyle = "black";
    canvas.textAlign='center';
    canvas.font = '40px Impact';
    canvas.lineWidth = 2;
    canvas.strokeText("HOUSE", CE.width/2,80);
    canvas.fillText("HOUSE", CE.width/2,80);
    var w = 400;
    canvas.fillStyle="#444";
    canvas.fillRect(CE.width/2-w/2-3, 20-3, w+6, 20+6);
    canvas.fillStyle=this.color;
    canvas.fillRect(CE.width/2-w/2, 20, w*this.life/200, 20);
    canvas.restore();
  }
}

class Coin extends Thing {
  constructor(x,y,angle,r) {
    super();
    this.x=x;
    this.y=y;
    this.w = 25;
    this.h = 30;
    this.color = 'gold';
    // this.drawShape = drawHouse;
    this._w = this.w;
    this.frame = Math.floor(Math.random()*10);
    this.vx = Math.cos(angle)*r*3;
    this.vy = Math.sin(angle)*r*3;
    this.vz = -4+Math.random();
    this.z = 0;
    this.falling = true;
    this.visible = true;
  }
  drawShape(...args) {
    if(this.visible) {
      drawHouse(...args);
    }
  }
  update() {
    if(this.falling) {
      this.vz += 0.3;
      this.x += this.vx;
      this.y += this.vy+this.vz;
      this.z+=this.vz;
      if(this.z>0) {
        this.falling = false;
        SOUNDS.coin.play();
      }
    }
    this.frame += 1;
    this.animate();
    if(collides(this,player)) {
      this.pickup();
      this.shouldDelete = true;
    }
    if(this.frame>300) {
      // this.x+=(player.x-this.x)/10;
      // this.y+=(player.y-this.y)/10;
      this.visible = this.frame%12>=6;
    }
    if(this.frame>500) {
      this.shouldDelete = true;
    }
    if(this.x<0)this.x=0;
    if(this.x>CE.width)this.x=CE.width;
    if(this.y<0)this.y=0;
    if(this.y>CE.height)this.y=CE.height;
  }
  animate() {
    this.w = this._w * Math.cos(this.frame*Math.PI/20);
  }
  pickup() {
    player.coins += 1;
    SOUNDS.coin.play();
  }
}

class Health extends Coin {
  constructor(x,y,angle,r) {
    super(x,y,angle,r);
    this.color = "#F0a";
    this.color2 = "#F0a";
  }
  animate() {
    this.y += Math.cos(this.frame*Math.PI/20);
  }
  pickup() {
    lifeBlink=1;
    player.life += 2;
    SOUNDS.health.play();
    if(player.life>player.maxLife)player.life = player.maxLife;
  }
}

function collides(a,b) {
  return a.x+a.w/2>=b.x-b.w/2 &&
    a.x-a.w/2<=b.x+b.w/2 &&
    a.y+a.h/2>=b.y-b.h/2 &&
    a.y-a.h/2<=b.y+b.h/2;
}

var entities = [];
var enemies = [];
var playerBullets = [];
var mouse = {x:0,y:0,down:false,held:false};
var frameCount = 0;
var keys = [];
var started = 0;
var player;
var weapons = [];
weapons.default = {
  speed: 10,
  color: '#fff',
}
weapons.shotgun = {
  speed: 20,
  color: '#0ff',
  shoot: function(x,y,angle) {
    entities.push()
  }
}
for(var i=0;i<255;++i)keys[i]=0;

function spawnEnemy() {
  if(spawnCount==-1)return;
  spawnCount += 1;
  var r = CE.width/2;
  if(spawnCount>40)r=r/2;
  var angle = Math.random()*Math.PI*2;
  var x = Math.cos(angle)*r+CE.width/2;
  var y = Math.sin(angle)*r+CE.height/2;
  if(spawnCount<30)
    entities.push(new Enemy(x,y));
  else if(spawnCount==30){
    spawnTime = 350;
  }
  else if(spawnCount<40) {
    spawnTime = 70;
    entities.push(new BigEnemy(x,y));
  } else if(spawnCount == 40) {
    spawnTime = 500;
  } else {
    entities.push(new Boss(x,y));
    spawnCount = -1;
  }
}

var spawnCount;

function update() {
  handleGamePad();
  spawnTimer += 1;
  if(spawnTimer>=spawnTime&&started) {
    spawnEnemy();
    spawnTimer = 0;
  }
  for(var i=0;i<entities.length;++i) {
    var e = entities[i];
    e.update();
    if(e.shouldDelete) {
      entities.splice(i,1);
      --i;
    }
  }
  for(var i=0;i<playerBullets.length;++i) {
    var b = playerBullets[i];
    if(b.shouldDelete) {
      playerBullets.splice(i,1);
      --i;
      continue;
    }
    for(var j=0;j<enemies.length;++j) {
      var e = enemies[j];
      if(e.shouldDelete) {
        enemies.splice(j,1);
        --j;
        continue;
      }
      if(collides(b,e)) {
        e.hit();
        b.hit();
        break;
      }
    }
  }
  if(started==1) {
    if(player.life<=0) {
      started = 2;
      frameCount = 0;
    }
  }
  if(started==2&&frameCount>100) {
    canvas.globalAlpha = 1;
    start();
  }
  if(spawnCount==-1&&enemies.length==0) {
    win=true;
  }
  mouse.down=false;
  frameCount+=1;

}
function draw() {
  canvas.clearRect(0,0,CE.width,CE.height);
  // canvas.fillStyle="rgba(0,0,0,0.05)";
  // canvas.fillRect(0,0,CE.width,CE.height);
  if(started==2) canvas.globalAlpha = 1-frameCount/100;
  entities.forEach(e=>e.draw());
  window.requestAnimationFrame(draw);
  if(started) {
    if(spawnCount == -1 && enemies.length == 0) {
      canvas.fillStyle = 'white';
      canvas.textAlign='center';
      canvas.font = "60px Impact";
      canvas.strokeStyle = 'black';
      canvas.lineWidth = 2;
      canvas.strokeText("HOUSE", CE.width/2,CE.height/2);
      canvas.fillText("HOUSE", CE.width/2,CE.height/2);
      if(entities.length == 2&&started!=2) {
        started = 2;
        frameCount = 0;
      }
    }
    if(crossHairs)crossHairs.draw();

    canvas.save();
    if(frameCount<100)
    canvas.translate(0,-100+frameCount);
    canvas.font = '20px Gloria Hallelujah, Cursive';
    canvas.textAlign = 'left';
    // canvas.fillStyle = '#e12';
    canvas.fillStyle = '#f0a';
    if(lifeBlink>0) {
      if(lifeBlink%10<5)
      canvas.fillStyle = '#f88';
      lifeBlink+=1;
      if(lifeBlink>20)lifeBlink=0;
    }
    canvas.fillText('House', 10,40);
    // for(var i=0;i<player.life;++i) {
    //   drawHouse(80+25/2+i*100/player.maxLife,20,30,40,'red','red');
    // }
    var color = canvas.fillStyle;
    // drawHouse(80,20,100,30,'#333','#333');
    // drawHouse(80,20,100* player.life/player.maxLife,30,color,color);
    var pipSize = 20;
    var spacing = pipSize*1;
    for(var i=0;i<player.maxLife;i+=2) {
      // var c = color;
      // if(player.life <= i) c = "#333";
      drawHouse(80+spacing*i,20,pipSize,pipSize,"#333","#333");
      if(player.life>i+1) {
        drawHouse(80+spacing*i,20,pipSize,pipSize,color,color);
      } else if(player.life==i+1) {
        drawHalfHouse(80+spacing*i,20,pipSize,pipSize,color,color);
      }
    }
    // canvas.fillRect(80,20,100* player.life/player.maxLife,30) ;

    if(frameCount<200)
    canvas.translate(-200+frameCount,0);
    canvas.fillStyle = 'gold';
    canvas.font = '20px Pacifico';
    canvas.fillText('House: '+player.coins, 10,80);
    // coinValues = [[100,"#ed3"],[10,"#ccc"],[1,"#c73"]];
    // var coins = player.coins;
    // var x = 100;
    // coinValues = coinValues.map(e => {
    //   result = Math.floor(coins / e[0]);
    //   coins = coins %e[0];
    //   for(var i=0;i<result;i++) {
    //     drawHouse(x,80,10,10,e[1]);
    //     x+=5;
    //   }
    //   if(result>0)x+=10;
    //   return result;
    // })
    canvas.restore();
  }
  if(touchOn) {
    touchDraw();
  }
}

function touchDraw() {
  for(var i=0;i<touchJoySticks.length;++i) {
    var joyStick = touchJoySticks[i];
    var angle = joyStick.output.angle;
    var w = joyStick.r*CE.height;
    var h = w*60/50;
    canvas.save();
    canvas.translate(joyStick.x*CE.width, joyStick.y*CE.height);
    canvas.rotate(angle+Math.PI/2);
    var color = 'rgba(255,255,255,0.5)';
    if(joyStick.held)color = 'rgba(255,0,0,0.5)';
    drawHouse(-w/2,-h/2,w,h,color,'rgba(0,0,0,0.1)');
    canvas.restore();
  }
}
var lifeBlink;
var win;
function start() {
  entities = [];
  enemies = [];
  playerBullets = [];
  spawnCount = 0;
  spawnTime = 50;
  spawnTimer = 0;
  frameCount = 0;
  lifeBlink = 0;
  touchOn = false;
  gamepadOn = false;
  win = false;
  started = false;
  CE.style.cursor = 'default';
  entities.push(new HouseButton(CE.width/2,CE.height/2));
}
function setup() {
  setInterval(update, 1000/60);
  draw();
  start();
}

function onmousemove(e) {
  var boundingClientRect = e.target.getBoundingClientRect();
  x = e.clientX-boundingClientRect.left;
  y = e.clientY-boundingClientRect.top;
  x *= CE.width/e.target.offsetWidth;
  y *= CE.height/e.target.offsetHeight;
  mouse.x = x;
  mouse.y = y;
}

function onmousedown(e) {
  touchOn = false;
  gamepadOn = false;
  mouse.down = true;
  mouse.held = true;
  initializeSound();
}

function onmouseup(e) {
  mouse.held = false;
}

function onkeydown(e) {
  var k = e.keyCode;
  keys[k]=true;
}

function onkeyup(e) {
  var k = e.keyCode;
  keys[k]=false;
}

window.addEventListener('resize', onresize);
window.addEventListener('load', onresize);
window.addEventListener('load', setup);
window.addEventListener('mousemove', onmousemove);
window.addEventListener('mousedown', onmousedown);
window.addEventListener('mouseup', onmouseup);
window.addEventListener('keydown', onkeydown);
window.addEventListener('keyup', onkeyup);
