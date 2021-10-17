title = "  SPACE Z";

description = `
  Tap to turn
`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc
cc  cc
`,
`
RR
RLC
 LLL R
  LrRR
   Rr
  RR
`,
`
    RR
   CLR
R LLL 
RRrL
 rR
  RR
`,
`
  lb
 lblb
lblblb
lblblb
 lblb
  lb
`,
`
  y
 yyy
y y y
  y
  y
`,
`
 yyy
 yyy
 yyy
`
];

const G = {
  WIDTH: 100,
  HEIGHT: 150,
  STAR_SPEED_MIN: 0.5,
  STAR_SPEED_MAX: 1.0,
  PLAYER_FIRE_RATE: 4,
  PLAYER_GUN_OFFSET: 3,
  OFFSET: 3
}
options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 58,// 1, 10, 13, 19, 26, 31, 58
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled : true,
  isDrawingParticleFront: true,
  isCapturing: true,
  isCapturingGameCanvasOnly: true
};

let stars;
let player;
let r;
let rbox;
let c;
let barLen;
let bgModifier;
let scores;
let speedChange;
let rockChange;

function update() {
  if (!ticks) {
    stars = times(20, () => {
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      return {
        pos: vec(posX, posY),
        speed: rnd(1.5, 2.5),
      }
    })

    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT - 50),
      side: false,
      xSpeed: 2,
      xOffset: G.OFFSET,
      yOffset: G.OFFSET- 1,
      angle: 0,
    }
    c = [];
    r = [];
    scores = [];
    rbox = [];
    barLen = G.WIDTH;
    bgModifier = 1;
    speedChange = 0;
    rockChange = 2;

  }

  stars.forEach((s) => {
    s.pos.y += s.speed * bgModifier;
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    color("light_black");
    box(s.pos, 1);
  })

  // actual rocks
  if (floor(ticks/30) == ticks/30){
    let numRocks = rndi(1,rockChange)
    let i = 0;
    while (i < numRocks){
      const posX = rnd(0, G.WIDTH);
      const posY = 0;
      const speed = rnd(1.5, 2);
      let newObj = {
        pos: vec(posX, posY),
        speed: speed
      }
      let newObj2 = {
        pos: vec(posX, posY),
        speed: speed
      }
      rbox.push(newObj2);
      r.push(newObj);
      i += 1 ;
    }
    
    //if(rndi(1,100) + player.pCount >= 90){
      //color("light_yellow")
      //particle(player.pos, player.pCount, 0.6)
    //}
  }

  // power ups
  if (floor(ticks/45) == ticks/45){
    let numRocks = rndi(1,2)
    let i = 0;
    while (i < numRocks){
      const posX = rnd(0, G.WIDTH);
      const posY = 0;
      let newObj = {
        pos: vec(posX, posY),
        speed: rnd(1.5, 2)
      }
      c.push(newObj);
      i += 1 ;
    }
    
    //if(rndi(1,100) + player.pCount >= 90){
      //color("light_yellow")
      //particle(player.pos, player.pCount, 0.6)
    //}
  }

  // isPressed, isJustPressed, isJustReleased
  if (input.isJustPressed) {
    player.side = !player.side;
    play("select");
  }
  
  var side = 0;
  color("black");
  if (!player.side){
    player.pos.x += player.xSpeed;
    player.xOffset = -G.OFFSET;
    side = 1;
    char("c", player.pos);
    player.angle = 90;
  } else {
    player.pos.x -= player.xSpeed;
    player.xOffset = G.OFFSET;
    side = -1;
    char("b", player.pos);
    player.angle = 45;
  }
  
  if (player.pos.x > G.WIDTH){
    player.pos.x = 0;
  }
  if (player.pos.x < 0){
    player.pos.x = G.WIDTH;
  }

  color("cyan");
  particle(
    player.pos.x + player.xOffset, // x coordinate 
    player.pos.y + player.yOffset,// y coordinate
    1, // number of particles
    5, // hpw long of particles 
    player.angle, // emitting angle
    0 // emitting width
  );

  remove( r, (rocks) => {
    color("black");
    rocks.pos.y += rocks.speed + speedChange;
    let rColl = char ("d", rocks.pos).isColliding.char;
    /*
    let hit = rColl.b || rColl.c;
    if (hit){
      play("hit");
      end();
    }
    */
    return (rocks.pos.y > G.HEIGHT)
  })
  
  remove( rbox, (rocksbox) => {
    color("transparent");
    rocksbox.pos.y += rocksbox.speed + speedChange;
    let rColl = char ("f", rocksbox.pos).isColliding.char;
    let hit = rColl.b || rColl.c;
    if (hit){
      play("hit");
      end();
    }
    return (rocksbox.pos.y > G.HEIGHT)
  })
  

  remove(scores, (s) => {
    color(s.color)
    s.pos.y -= 0.1
    text("+" + s.score, s.pos)
    s.age -= 1
    let disappear = (s.age <= 0)
    return disappear
  })

  remove( c, (collects) => {
    color("black");
    collects.pos.y += collects.speed;
    let rColl = char ("e", collects.pos).isColliding.char;
    let hit = rColl.b || rColl.c;
    if (hit){
      barLen = G.WIDTH;
      bgModifier = 1;
      myAddScore(25, collects.pos.x, collects.pos.y, "yellow", 30);
      play("coin");
      //player.side = !player.side;
    }
    return (collects.pos.y > G.HEIGHT || hit)
  })
  color("yellow");
  rect(0, G.HEIGHT - 5, G.WIDTH* (barLen / G.WIDTH), 5);
  barLen -= 0.25;
  if (barLen < 0) {
    play("explosion");
    end();
  }
  
  if (floor(ticks/10) == ticks/10){
    addScore(1);
    speedChange += 0.01;
    //bgModifier -= 0.15;
  }

  if(floor(ticks/1000) == ticks/1000){
    rockChange += 1;
  }
}

function myAddScore(value, x = G.WIDTH/2, y = G.HEIGHT/2, color = "black", time = 60){
  let score = {
    pos: vec(x,y),
    age: time,
    score: floor(value),
    color: color
  }
  scores.push(score)
  addScore(value);
}
