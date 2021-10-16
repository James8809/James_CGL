title = "BEE";

description = `BEE
`;

characters = [
`
 w  w 
  ww  
 lyly
llylyl
llylyl
 lyly
`,
`
 wwww 
 lyly
llylyl
llylyl
 lyly
      
`,`
R R R
RRRRR
  g
  ggg
ggg
  g
`,`
  BB
  BB
 BBBB
BBbbwB
BBbbBB
 BBBB
`
];

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * facing: boolean,
 * target: Vector,
 * drawTarget: boolean,
 * angle: number,
 * pCount: number,
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector,
 * time: number,
 * }} Flower
 */

/**
 * @type { Flower []}
 */
let f;

/**
 * @typedef {{
 * pos: Vector,
 * age: number,
 * score: number,
 * color: string,
 * }} Score
 */

/**
 * @type { Score []}
 */
let scores;

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * }} Rain
 */

/**
 * @type { Rain []}
 */
let r;

const G = {
  WIDTH: 128,
  HEIGHT: 128
}

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 3,
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "simple",
  isDrawingParticleFront: true
};

function update() {
  if (!ticks) {
    scores = []
    f = []
    r = []
    player = {
        pos: vec(G.WIDTH * 0.5, G.HEIGHT*0.5),
        speed: 0.4,
        facing: true,
        target: vec(G.WIDTH * 0.5, G.HEIGHT*0.5),
        drawTarget: false,
        angle: 0,
        pCount: 0,
    }
  }

  color("black");
  rect(0,6, 128, 6)
  color("light_blue")
  rect(0,12, 128, 12)
  color("light_green")
  rect(0,24,128, 104)
  
  color("yellow")
  rect(58, 58, 12, 12).isColliding.char
  color("light_yellow")
  rect(58,58, 12, 1)
  rect(58,62, 12, 1)
  rect(58,65, 12, 1)
  rect(58,69, 12, 1)
  
  if (floor(ticks/80) == ticks/80){
    let numFlowers = rndi(-3,4)
    if (numFlowers <= 0){
      numFlowers = 1;
    }
    let i = 0;
    while (i < numFlowers){
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(24, G.HEIGHT - 5);
      if (posX > 45 && posX < 79 && posY > 45 && posY < 79){
        // Don't do anything
      } else {
        let newObj = {
          pos: vec(posX, posY),
          time: 450,
        }
        f.push(newObj)
        i += 1
      } 
    }
    
    if(rndi(1,100) + player.pCount >= 90){
      color("light_yellow")
      particle(player.pos, player.pCount, 0.6)
    }
  }

  if (floor(ticks/80) == ticks/80){
    const posX = rnd(0, G.WIDTH);
    const posY = 15;
    let newObj = {
      pos: vec(posX, posY),
      speed: 0.3 + (rndi(0, difficulty+1)/10),
    }
    r.push(newObj)
    if (difficulty > rndi(0,10)){
      const posX2 = rnd(0, G.WIDTH)
      let newObj2 = {
        pos: vec(posX2, posY),
        speed: 0.3 + (rndi(0, difficulty+1)/10),
      }
      r.push(newObj2)
    }
    if (difficulty > rndi(1,10)){
      const posX3 = rnd(0, G.WIDTH)
      let newObj3 = {
        pos: vec(posX3, posY),
        speed: 0.3 + (rndi(0, difficulty+1)/10),
      }
      r.push(newObj3)
    }
  }
  

  if (input.isJustPressed){
    player.target = vec(input.pos.x, input.pos.y);
    if (player.target.x > player.pos.x){
      player.facing = true
    } else {
      player.facing = false
    }
    player.drawTarget = true;
    player.angle = player.pos.angleTo(player.target)
    console.log(player.angle)
    play("select")
  }
  
  // Draw Player
  const side = (player.facing)
            ? -1
            : 1;
  
  color("light_yellow")
  if (player.pCount > 0){
    let offset = Math.max( ceil(3 - player.pCount/3), 1)
    box(player.pos.x + offset*side, player.pos.y + 2, ceil(player.pCount/3))
  }          
  color("black")
  char(addWithCharCode("a", (floor(ticks / 20) % 2)), player.pos, {
    // @ts-ignore
    mirror: {x: side},
  })
  
  color("transparent")
  let hiveColl = rect(58, 58, 12, 12).isColliding.char

  if (hiveColl.a || hiveColl.b){
    if (player.pCount != 0) {
      color("light_yellow")
      particle(player.pos, player.pCount * 2, 2)
      play("coin")
      myAddScore(player.pCount * (1 + floor(player.pCount/3)/2), G.WIDTH/2 - 3, G.HEIGHT/2 - 8, "light_yellow")
      player.pCount = 0
    }
  }
  
  remove( f, (flower) => {
    color("black")
    let fColl = char("c", flower.pos).isColliding.char
    let hitBee = fColl.a || fColl.b
    if (hitBee && player.pCount <= 15){
      play("jump")
      player.pCount += 1
      color("light_yellow")
      particle(flower.pos, 3, 1)
    }
    color("white")
    rect(flower.pos.x - 4, flower.pos.y + 4, 9* (flower.time / 450), 1)
    flower.time -= 1
    
    return (flower.time <= 0 || hitBee)
  })
  
  remove( r, (rain) => {
    color("black")
    rain.pos.y += rain.speed;
    let rColl = char("d", rain.pos).isColliding.char;
    let hitBee = rColl.a || rColl.b;
    if (hitBee) {
      play("hit");
      end();
    }
    return (rain.pos.y > G.HEIGHT)
  })
  
  
  if (player.drawTarget){
    color("white")
    let boxColl = box(player.target, 2).isColliding.char
    if (boxColl.a || boxColl.b){
      player.drawTarget = false
    }
    line(player.pos, player.target, 1)
    player.pos.x += player.speed * ((18-player.pCount) / 12) * Math.cos(player.angle);
    player.pos.y += player.speed * ((18-player.pCount) / 12) * Math.sin(player.angle);
  }
  
  remove(scores, (s) => {
    color(s.color)
    s.pos.y -= 0.1
    text("+" + s.score, s.pos)
    s.age -= 1
    let disappear = (s.age <= 0)
    return disappear
  })
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