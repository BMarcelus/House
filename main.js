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

function drawWithRotation(x,y,w,h,rotation, style1,style2) {
  canvas.save();
  canvas.translate(x,y);
  canvas.rotate(rotation);
  drawHouse(-w/2,-h/2,w,h,style1,style2);
  canvas.restore();
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
    var {inputX, inputY} = getAxes();
    if(touchOn || gamepadOn||inputX||inputY) this.clicked();
    super.update();
  }
  clicked() {
    if(this.shouldDelete)return;
    this.shouldDelete = true;
    entities.push(new Mover(this.x,this.y));
    entities.push(new CrossHairs());
    mouse.down = false;
    SOUNDS.start.play();
    started = true;
    frameCount=0;
  }
  draw() {
    super.draw();
    if(this.d<1) {
      canvas.save();
      // canvas.globalAlpha = 1-this.d;
      canvas.translate(0,-100*this.d);
      drawGamepadControls();
      canvas.translate(0,200*this.d);
      drawKeyboardControls();
      canvas.restore();
    }
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
    this.visible = true;
  }
  update() {
    this.visible=true;
    if(touchOn) {
      this.x = player.x + touchJoySticks[1].output.x*200;
      this.y = player.y + touchJoySticks[1].output.y*200;
    } else if(gamepadOn) {
      if(!gamepadJoysticks[1].held) {
        this.visible = false;
      } else {
        var dx = gamepadJoysticks[1].output.x;
        var dy = gamepadJoysticks[1].output.y;
        var r = Math.sqrt(dx*dx+dy*dy);
        if(r>1) {
          dx = dx/r;
          dy = dy/r;
        }
        this.x = player.x + dx*200;
        this.y = player.y + dy*200;
      }
    } else {
      this.x = mouse.x;
      this.y = mouse.y;
    }
    if(this.x<0)this.x=0;
    if(this.x>CE.width)this.x=CE.width;
    if(this.y<0)this.y=0;
    if(this.y>CE.height)this.y=CE.height;
    
    this.distance += (2-this.distance)/30;
    this.scale += (1-this.scale)/30;
  }
  shoot() {
    this.distance = 9;
    this.scale = 1.2;
  }
  drawShape(x,y,w,h,color) {
    if(!this.visible)return;
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
    this.shootTimer = 10;
  }
  hit() {
    if(this.life<=0)return;
    if(this.invul>0)return;
    this.scale += 0.3;
    this.life -= 1;
    this.invul = 60;
    this.scale=4;
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
    // if(mouse.down)this.shootTimer=5;
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
      this.shootTimer = 1;
      crossHairs.shoot();
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
    if(this.shootTimer%10!=0) {
      this.shootTimer += 1;
    }
    this.scale += (1-this.scale)/4;
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
    if(this.y>CE.height*.5) {
      this.y = CE.height*.5;
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
    var scale = 0.2 + this.shootTimer/10/10;
    canvas.scale(scale,scale);
    canvas.rotate(this.aimAngle+Math.PI/2);
    drawHouse(-w/2,-h*3,w,h);
  }
}

class Bullet extends Thing {
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
    this.accel = 0.5;
  }
  movement(dx,dy,angle,r) {
    var tx = Math.cos(angle)*this.speed;
    var ty = Math.sin(angle)*this.speed;
    this.vx = linearMove(this.vx, tx, this.accel);
    this.vy = linearMove(this.vy, ty, this.accel);
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

      this.vx = -dx/r*20*this.accel;
      this.vy = -dy/r*20*this.accel;

      player.hit();
      // this.hitPlayer();
      player.vx = dx/r*10;
      player.vy = dy/r*10;
    }

  }
  hitPlayer() {

  }
  hit() {
    this.life -= 1;
    this.scale+=.2;
    SOUNDS.hit.play();
    if(this.life<=0) {
     this.die();
    }
  }
  die() {
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
    this.accel = .01;
  }

  movement(dx,dy,angle,r) {
    var tx = Math.cos(angle)*this.speed;
    var ty = Math.sin(angle)*this.speed;
    this.vx = linearMove(this.vx, tx, this.accel);
    this.vy = linearMove(this.vy, ty, this.accel);
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
    this.accel=0.4;
  }
  movement(dx,dy,angle,r) {
    angle += this.da;
    var tx = Math.cos(angle)*this.speed;
    var ty = Math.sin(angle)*this.speed;
    this.vx = linearMove(this.vx, tx, this.accel);
    this.vy = linearMove(this.vy, ty, this.accel);
  }
}

class DeadBoss extends Thing{
  constructor(x,y,w,h,color) {
    super();
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.color = color;
    this.life = 150;
    this.drawShape = drawHouse;
    this.x += (CE.width/2-this.x)/20;
    this.y += (CE.height/2-this.y)/20;
  }
  update() {
    this.scale += (0-this.scale)/20;
    if(frameCount%7==0) {
      this.angle = Math.cos(frameCount*100)/4;
      SOUNDS.enemyDie.play();
      entities.push(new Coin(this.x,this.y,Math.random()*Math.PI*2,Math.random()));
      this.scale = 1.2;
    }
    if(this.life--<0) {
      this.shouldDelete = true;
      for(var i=0;i<20;i++){ 
        entities.push(new Coin(this.x,this.y,Math.random()*Math.PI*2,Math.random()));
      }
    }
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
    this.accel=0.5;
  }
  die() {
    this.shouldDelete = true;
    SOUNDS.enemyDie.play();
    SOUNDS.coin.play();
    for(var i=0;i<10+Math.random()*4;++i) {
      entities.push(new Coin(this.x,this.y,Math.random()*Math.PI*2,Math.random()));
    }
    entities.push(new DeadBoss(this.x,this.y,this.w,this.h,this.color));
  }
  movement(dx,dy,angle,r) {
    this.dx=dx/r;
    this.dy=dy/r;
    var tx = Math.cos(angle)*this.speed;
    var ty = Math.sin(angle)*this.speed;
    this.vx = linearMove(this.vx, tx, this.accel);
    this.vy = linearMove(this.vy, ty, this.accel);
    if(this.x<0)this.x=0;
    if(this.y<0)this.y=0;
    if(this.x>CE.width)this.x=CE.width;
    if(this.y>CE.height)this.y=CE.height;
  }
  update() {
    if(this.life<80&&this.stage==0) {
      this.color = 'red';
      this.stage = 1;
      this.state = 7;
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
      this.state = (this.state+1)%9;
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
      if(this.life>80&&this.state>6) {
        this.state = 4;
      }
      // if(this.state==8) this.state=1;
      // if(this.stage==1&&this.state>6) {
      //   if(Math.random()>.8)this.state=1;
      //   else this.state = 4;
      // }
      // if(this.stage==1&&this.state==3){
      //   if(Math.random()>.8)this.state=4;
      //   else this.state=1;
      // }
      // if(this.stage==1&&this.state>=3) {
      //   this.state=1;
      // }
      if(this.state==0) {
        this.target = {
          x: CE.width/2,
          y: CE.height/2,
        }
        this.speed = 3;
      } else if(this.state==1) {
        if(this.stage==1) this.stateTimer=20;
        else this.stateTimer = 50;
        this.target = player;
        this.speed = -4;
      } else if(this.state==2) {
        this.target = {
          x: player.x, y: player.y
        };
        this.speed = 10;
      } else if(this.state==3) {
        this.target = {
          x: CE.width/2,
          y: 0,
        }
        this.speed = 4;
      } else if(this.state==4) {
        this.vx=0;
        this.vy=0;
        this.target = {
          x: player.x,
          y: 0,
        }
        this.speed = 20;
        this.stateTimer = 70;
      } else if(this.state==5) {
        this.target= {
          x: this.x,
          y: this.y
        }
        this.speed=1;
        this.stateTimer = 5;
      }else if(this.state==6) {
        this.vx=0;
        this.vy=0;
        this.target = {
          x: this.x,
          y: CE.height,
        }
        this.speed = 35;
        this.stateTimer=70;
      } else if(this.state==7) {
        this.target = {
          x: CE.width/2,
          y: CE.height/2,
        };
        this.speed = 5;
      } else if(this.state==8) {
        this.stateTimer = 900;
      }
      if(this.stage==1) {
        this.speed*=2;
        this.stateTimer *= (1-Math.random()*.3);
      }
    }
    if(this.state==5) {
      this.w += (this._w*1.2-this.w)/3;
      this.h += (this._h*.8-this.h)/3;
      this.target = {
        x: player.x,
        y: 0,
      }
    } else if(this.state==6) {
      this.w += (this._w*.8-this.w)/3;
      this.h += (this._h*1.2-this.h)/3;
    } else {
      this.w += (this._w-this.w)/3;
      this.h += (this._h-this.h)/3;
    }
    if(this.state==8) {
      var dx = player.x-this.x;
      var dy = player.y-this.y;
      this.target = {
        x: this.x+dy,
        y: this.y-dx,
      }
      this.speed = 8;
      if(this.stateTimer>400&&this.frame%30==0) {
        var b = new FastEnemy(this.x-this.dx*10,this.y-this.dy*10);
        var r = Math.sqrt(dx*dx+dy*dy);
        b.accel=0.4;
        b.speed*=3;
        b.vx = dx/r*10+dy/r*5;
        b.vy = dy/r*10-dx/r*5;
        entities.push(b);
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
    if(this.stage==0&&this.frame%200==0) {
      // entities.push(new FastEnemy(this.x+this.dx*10,this.y+this.dy*10));
      // var dx = player.x-this.x;
      // var dy = player.y-this.y;

      var b = new FastEnemy(this.x+this.dx*10,this.y+this.dy*10);
      // var r = Math.sqrt(dx*dx+dy*dy);
      // b.accel=0.03;
      b.speed*=4;
      b.accel=0.5;
      b.update();
      // b.speed/=4;
      // b.accel=0.03;
      // b.vx = dx/r*10;
      // b.vy = dy/r*10;
      entities.push(b);
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
    // if(this.frame>300) {
    //   this.x+=(player.x-this.x)/10;
    //   this.y+=(player.y-this.y)/10;
    //   // this.visible = this.frame%12>=6;
    // }
    // if(this.frame>500) {
      // this.shouldDelete = true;
    // }
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
    SOUNDS.coin2.play();
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
    entities.push(new Boss(CE.width/2,0));
    spawnCount = -1;
  }
}

function drawKeyboardControls() {
  var none = '#00000000';
  drawHouse(40,360,30,36,'white',none);
  drawWithRotation(40+15,400+18,30,36,Math.PI,'white',none)
  drawWithRotation(5+15,400+18,30,36,-Math.PI/2,'white',none)
  drawWithRotation(75+15,400+18,30,36,Math.PI/2,'white',none)

  // drawHouse(225-2,300,4,60,'white','white');
  var x = 200;
  var y = 360;
  drawHouse(x-12,y-5,50,65,'#eee',none);
  drawWithRotation(x,y+15,25,30,Math.PI/20,'#fff',none);
  drawWithRotation(x,y+15,25-2,30-2,Math.PI/20,'#fff',none);
  drawWithRotation(x+26,y+15,25,30,-Math.PI/20,'#eee',none);
  drawWithRotation(x+13,y+15+4,8,16,0,'#ddd',none);
}

function drawGamepadControls() {
  var none = '#00000000';
  drawWithRotation(80,80,40,48,0,'#fff',none);
  drawWithRotation(80,80,40-5,48-6,0,'#666',none);
  drawWithRotation(80,80,20,24,0,'#fff',none);

  drawWithRotation(80+80,80,40,48,0,'white',none);
  drawWithRotation(160,80,40-5,48-6,0,'#666',none);
  drawWithRotation(162,82,10,12,Math.PI/4,'#fff','#000');
  drawWithRotation(152,92,10,12,Math.PI/4,'#fff','#000');
  drawWithRotation(172,72,10,12,Math.PI/4,'#fff','#000');



  drawWithRotation(40,20,20,24,0,'#666','#666');
  drawWithRotation(40,60,20,24,Math.PI,'#666','#666');
  drawWithRotation(20,40,20,24,-Math.PI/2,'#666','#666');
  drawWithRotation(60,40,20,24,Math.PI/2,'#666','#666');


  drawWithRotation(160+40,20,20,24,0,'#666','#666');
  drawWithRotation(160+40,60,20,24,0,'#666','#666');
  drawWithRotation(160+40+1,60+2,10,12,Math.PI/2,'#fff','#fff');
  drawWithRotation(160+20,40,20,24,0,'#666','#666');
  drawWithRotation(160+60,40,20,24,0,'#666','#666');
}

var spawnCount;
var paused = false;

function pause() {
  paused = true;
  canvas.fillStyle = 'black';
  canvas.globalAlpha=0.5;
  canvas.fillRect(0,0,CE.width,CE.height);
  canvas.fillStyle = 'white';
  canvas.globalAlpha=1;
  // canvas.fillText('PAUSED', CE.width/2,CE.height/2);
  canvas.fillText('HOUSE', CE.width/2,CE.height/2);
  drawKeyboardControls();
  drawGamepadControls();
}

window.addEventListener('focus', function() {
  paused = false;
})
window.addEventListener('blur', function() {
  pause();
})

function update() {
  handleGamePad();
  if(!paused) {
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
    frameCount+=1;
  }
  mouse.down=false;
}
function draw() {
  if(paused) {
    window.requestAnimationFrame(draw);
    return;
  }
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

  checkHost();
}

function onmouseup(e) {
  mouse.held = false;
}

function onkeydown(e) {
  var k = e.keyCode;
  keys[k]=true;
  if(k==27||k==80) {
    if(paused)paused=false;
    else pause();
  }
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
