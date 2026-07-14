// 🎵 Assets
let bgImg, shipImg, enemyImg, shootSound, explosionSound, bgMusic;
let lifeImg, shieldImg; // PowerUp images

// 🎮 Game objects & state
let player, enemies=[], bullets=[], powerUps=[];
let score=0, lives=3, state="start", bgY=0, shield=false, shieldTimer=0;

// 📂 Load assets
function preload(){
  bgImg=loadImage("background.jpg");
  shipImg=loadImage("spaceship.png");
  enemyImg=loadImage("enemy.png");
  lifeImg=loadImage("heart.png");     // life powerup
  shieldImg=loadImage("shield.png");  // shield powerup
  soundFormats('mp3','wav');
  shootSound=loadSound("laser.mp3");
  explosionSound=loadSound("explosion.mp3");
  bgMusic=loadSound("background.mp3");
}

// 🧩 Base class
class Entity {
  constructor(x,y,w,h,img,s=0){Object.assign(this,{x,y,w,h,img,s});}
  draw(){ if(this.img) image(this.img,this.x,this.y,this.w,this.h); }
  collides(o){ return this.x<o.x+o.w && this.x+this.w>o.x && this.y<o.y+o.h && this.y+this.h>o.y; }
}

// 🚀 Player
class Player extends Entity {
  constructor(){ super(860,500,160,160,shipImg,6); }
  update(){
    if(keyIsDown(LEFT_ARROW)) this.x-=this.s;
    if(keyIsDown(RIGHT_ARROW)) this.x+=this.s;
    if(keyIsDown(UP_ARROW)) this.y-=this.s;
    if(keyIsDown(DOWN_ARROW)) this.y+=this.s;
    this.x=constrain(this.x,0,width-this.w);
    this.y=constrain(this.y,0,height-this.h);
  }
}

// 👾 Enemy
class Enemy extends Entity {
  constructor(s=4){ super(random(50,width-170),random(-700,0),120,120,enemyImg,s); }
  update(){ this.y+=this.s; if(this.y>height) this.reset(); }
  reset(){ this.y=-120; this.x=random(50,width-170); }
}

// 🔫 Bullet
class Bullet extends Entity {
  constructor(x,y){ super(x,y,6,20,null,12); }
  update(){ this.y-=this.s; }
  draw(){ fill(255,0,0); rect(this.x,this.y,this.w,this.h); }
}

// 💎 PowerUp (with images)
class PowerUp extends Entity {
  constructor(x,y,t="life"){
    let img = (t==="life") ? lifeImg : shieldImg;
    super(x,y,40,40,img,3);
    this.t=t;
  }
  update(){ this.y+=this.s; }
  draw(){ image(this.img,this.x,this.y,this.w,this.h); }
}

// ⚙️ Setup
function setup(){ createCanvas(1500,700); reset(); }

// 🎬 Main loop
function draw(){
  if(state==="start") return screen("Press ENTER to Start");
  if(state==="gameover") return screen(`GAME OVER\nScore:${score}\nPress ENTER to Restart`,true);

  // Background scroll
  image(bgImg,0,bgY,width,height);
  image(bgImg,0,bgY-height,width,height);
  bgY=(bgY+3)%height;

  player.update(); player.draw();

  // Shield effect
  if(shield){
    noFill(); stroke(0,0,255);
    ellipse(player.x+player.w/2,player.y+player.h/2,player.w+20,player.h+20);
    if(millis()-shieldTimer>5000) shield=false;
  }

  // Shooting
  if(keyIsDown(32)&&frameCount%10===0) fire();

  // Enemies
  enemies.forEach(e=>{
    e.update(); e.draw();
    if(player.collides(e)&&!shield){ if(--lives<=0) state="gameover"; e.reset(); }
  });

  // Bullets
  for(let i=bullets.length-1;i>=0;i--){
    let b=bullets[i]; b.update(); b.draw();
    enemies.forEach(e=>{
      if(b.collides(e)){
        bullets.splice(i,1); score++; e.reset(); explosionSound.play();
        if(random(1)<0.2) powerUps.push(new PowerUp(e.x,e.y,random(["life","shield"])));
      }
    });
    if(b.y<0) bullets.splice(i,1);
  }

  // PowerUps
  for(let i=powerUps.length-1;i>=0;i--){
    let p=powerUps[i]; p.update(); p.draw();
    if(player.collides(p)){
      p.t==="life"?lives++:(shield=true,shieldTimer=millis());
      powerUps.splice(i,1);
    } else if(p.y>height) powerUps.splice(i,1);
  }

  if(score%10===0&&score>0) enemies.forEach(e=>e.s+=0.01);

  fill(255); textSize(30);
  text(`Score:${score}`,30,50);
  text(`Lives:${lives}`,30,90);
}

// 🎮 Controls
function keyPressed(){
  if(keyCode===ENTER){
    if(state==="start"){ state="playing"; if(!bgMusic.isPlaying()) bgMusic.loop(); }
    else if(state==="gameover"){ reset(); state="playing"; }
  }
  if(key===' '&&state==="playing") fire();
}

// 🔫 Fire bullet
function fire(){ bullets.push(new Bullet(player.x+player.w/2-3,player.y)); shootSound.play(); }

// 🖥️ Screens
function screen(msg,gameover=false){
  background(0); fill(gameover?color(255,0,0):255); textAlign(CENTER,CENTER);
  textSize(gameover?60:50); text(msg.split("\n")[0],width/2,height/2);
  if(gameover){
    textSize(30); fill(255);
    text(msg.split("\n")[1],width/2,height/2+60);
    text(msg.split("\n")[2],width/2,height/2+120);
  }
}

// 🔄 Reset
function reset(){
  score=0; lives=3; state="start";
  enemies=[new Enemy(),new Enemy(),new Enemy(),new Enemy(7)];
  bullets=[]; powerUps=[]; player=new Player();
}
