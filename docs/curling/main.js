title = "Curling";

description = `
           [Tap] Sweep
Sweeping increases stone speed.
`;

characters = [
  ` 
 LLLL 
LLLLLL
LLLLLL
LLLLLL
LLLLLL
 LLLL
`,
  ` 
 LLLL 
LLLLLL
LLRRLL
LLRRLL
LLLLLL
 LLLL
`
];

const G = {
  WIDTH: 200,
  HEIGHT: 80,

  PUCKVERT: 1,
  PUCKPOSMAX: 70,
  PUCKPOSMIN: 10,

  PUCKANGLE: 0.01,
  DIRLENGTH: 25,
  PUCKANGLEMAX: Math.PI / 4,
  PUCKANGLEMIN: -Math.PI / 4,

  PUCKSPEEDMAX: 10,
  PUCKSPEEDMIN: 1, // set to 1 because we dont want player to set launch speed to 0

  SWEEP: 0.00625, // FRICTION SLOWS PLAYER
  DECAY: 0, // NATURAL SPEED DECAY
  DECAYMAX: 0.025
};
// PUCK VERT is the speed the Puck moves up and down in vertical selection
// PUCK ANGLE is the speed the angle moves up and down in angle selection
// PUCK SPEED is the max/min horizontal speed (it controls our power bar width and our puck speed)

const STATE = {
  POSITION: 0,
  ANGLE: 1,
  POWER: 2,
  FREE: 3,
  RESET: 4
};

/**
 * @typedef {{
 * pos: Vector,
 * speed: number,
 * angle: number,
 * reverse: boolean,
 * state: number,
 * sprite: string,
 * target: Vector,
 * lives: number
 * }} Puck
 */
// Reverse is to reverse the direction of movement in Angle/Vertical selection
// When the puck reaches an 'edge'

/**
 * @type { Puck }
 */
let puck;

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
 * }} Obstacles
 */
/**
 * @type { Obstacles [] }
 *
 */
let obstacles;
let distance;
let targetCenter;
let background;

options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  //seed: 3,
  //isPlayingBgm: true,
  isReplayEnabled: true,
  theme: "shape"
};

function update() {
  if (!ticks) {
    // background effects
    background = times(3, () => {
      return {
        pos: vec(G.WIDTH, rnd(G.PUCKPOSMIN + 1, G.PUCKPOSMAX - 1)),
        speed: 1,
        width: rndi(25, 75),
        height: 1
      };
    });
    scores = [];
    puck = {
      pos: vec(10, G.HEIGHT / 2),
      speed: 1,
      angle: 0,
      reverse: false,
      state: STATE.POSITION,
      sprite: "a",
      target: vec(10, G.HEIGHT / 2),
      lives: 3
    };
    obstacles = times(2, () => {
      return {
        pos: vec(G.WIDTH, G.PUCKPOSMIN),
        speed: 0
      };
    });
    targetCenter = { pos: vec(G.WIDTH, G.HEIGHT / 2) };
    distance = rndi(15, 45); // 15 or 50m
  }
  // background lines
  if (puck.state === STATE.FREE || puck.state === STATE.RESET) {
    color("light_black");
    background.forEach(ele => {
      rect(ele.pos, ele.width, ele.height);
      ele.pos.x -= puck.speed;
      if (ele.pos.x + ele.width < 0) {
        ele.pos.x = G.WIDTH;
      }
    });
  }
  // DRAW TARGET
  // G.WIDTH === 10Meters SO
  // This means that every ~50 pixels is essentially 2m
  if (distance - puck.speed <= 10 && puck.state === STATE.FREE) {
    color("light_red");
    arc(targetCenter.pos, 16, 4, 0, 2 * PI);
    color("light_blue");
    arc(targetCenter.pos, 36, 8, 0, 2 * PI);
    if (floor(ticks / 15) === ticks / 15) targetCenter.pos.x -= puck.speed / 4;
  }

  // draw puck
  color("black");
  char("a", puck.pos);

  // WALLS
  color("light_cyan");
  rect(0, 0, G.WIDTH, G.PUCKPOSMIN - 3);
  rect(0, G.PUCKPOSMAX + 3, G.WIDTH, G.HEIGHT - G.PUCKPOSMAX - 3);

  // UPDATE OBJECT INFOS DEPENDING ON STATE
  color("white");
  // distance and speed text
  text(distance.toString() + "m", 3, G.HEIGHT - 4);
  text(floor(puck.speed) + "m/s", G.WIDTH - 30, G.HEIGHT - 4);
  // shots left text
  text("Shots: " + puck.lives, G.WIDTH / 2 - 25, 3);
  color("light_black");

  switch (puck.state) {
    case STATE.POSITION:
      // MOVE UP & DOWN, REVERSE WHEN HIT EDGE
      if (
        puck.pos.y + puck.speed > G.PUCKPOSMAX ||
        puck.pos.y - puck.speed < G.PUCKPOSMIN
      ) {
        puck.reverse = !puck.reverse;
      }
      if (puck.reverse) {
        puck.pos.y += G.PUCKVERT;
      } else {
        puck.pos.y -= G.PUCKVERT;
      }
      if (input.isJustPressed) {
        // do set position
        // switch to STATE.ANGLE
        puck.state = STATE.ANGLE;
      }
      break;
    case STATE.ANGLE:
      // Change angle up and down, reverse when hit edge
      // Draw line forecasting direction of current angle
      if (puck.reverse) {
        puck.angle += G.PUCKANGLE;
      } else {
        puck.angle -= G.PUCKANGLE;
      }
      puck.target.x = puck.pos.x + Math.cos(puck.angle) * G.DIRLENGTH;
      puck.target.y = puck.pos.y + Math.sin(puck.angle) * G.DIRLENGTH;
      color("light_black");
      line(puck.pos, puck.target, 1);
      if (
        puck.angle > G.PUCKANGLEMAX ||
        puck.angle < G.PUCKANGLEMIN ||
        puck.target.y > G.PUCKPOSMAX + 3 ||
        puck.target.y < G.PUCKPOSMIN - 3
      ) {
        puck.reverse = !puck.reverse;
      }
      if (input.isJustPressed) {
        // angle setup already from above
        // reset puck.reverse for use in STATE.POWER
        puck.reverse = true;
        // switch to STATE.POWER
        puck.state = STATE.POWER;
      }
      break;
    case STATE.POWER:
      // Keep drawing direction line
      line(puck.pos, puck.target, 1);
      // DRAW Background of our Power Bar for visual indication of a "MAX"\
      // and red powerbar
      color("light_black");
      rect(
        (G.WIDTH - G.PUCKSPEEDMAX * 10) / 2,
        G.HEIGHT - 6,
        G.PUCKSPEEDMAX * 10,
        5
      );
      color("light_red");
      rect(
        (G.WIDTH - G.PUCKSPEEDMAX * 10) / 2,
        G.HEIGHT - 6,
        puck.speed * 10,
        5
      );
      // reuse our reverse logic for STATE.ANGLE,
      // determines power bar growth && puck.speed value from 0 - 100
      if (floor(ticks / 15) == ticks / 15) {
        if (puck.reverse) {
          puck.speed += 1;
        } else {
          puck.speed -= 1;
        }
        if (puck.speed >= G.PUCKSPEEDMAX || puck.speed <= G.PUCKSPEEDMIN) {
          puck.reverse = !puck.reverse;
        }
      }
      if (input.isJustPressed) {
        // puck.speed is auto setup above!
        // switch to STATE.FREE
        puck.state = STATE.FREE;
      }
      break;
    case STATE.FREE:
      // do we want to redraw the power bar here?
      // this is WICKED FAST [ TEMP FIX divide puck.speed ]
      puck.target.x = Math.cos(puck.angle) * (puck.speed / 10);
      puck.target.y = Math.sin(puck.angle) * (puck.speed / 10);
      // POSSIBLE PARALLAX EFFECT IF WE WANT A LANE LONGER THAN 200 PIXELS
      if (puck.pos.x + puck.target.x <= G.WIDTH / 4) {
        puck.pos.x += puck.target.x;
      } else {
        // Parallax Effects
        // update player speed based on "sweeping"
        // if SWEEP increase FRICTION
        // reminder: G.FRICTION is the lack thereof
        if (input.isJustPressed) {
          color("light_black");
          particle(input.pos, 5);
          if (G.DECAY > 0) G.DECAY -= G.SWEEP;
        } else if (floor(ticks / 30) === ticks / 30) {
          if (G.DECAY < G.DECAYMAX) G.DECAY += G.SWEEP;
        }
        // BAR GRAPH of FRICTION
        color("light_black");
        rect((G.WIDTH - 50) / 2, G.HEIGHT - 6, G.DECAYMAX * 2000, 5);
        color("light_red");
        rect((G.WIDTH - 50) / 2, G.HEIGHT - 6, clamp(0, G.DECAY * 2000), 5);
        //console.log(G.DECAY.toString());
        puck.speed -= G.DECAY; // FRICTION REDUCE DECAY DOWN TO 0
        //update distance 4 times a sec
        if (floor(ticks / 15) === ticks / 15) distance -= floor(puck.speed) / 4;

        // draw the enemy pucks
        obstacles.forEach(o => {
          color("black"); //if(rnd(1, 2) > 1) color("light_yellow"); else color("light_green");
          char("b", o.pos);
          o.pos.x -= puck.speed / 10;
          if (o.pos.x < 0) {
            o.pos = vec(G.WIDTH, rnd(G.PUCKPOSMIN, G.PUCKPOSMAX));
          }
        });

        if (
          char("a", puck.pos).isColliding.char.b ||
          puck.speed <= 0.5 ||
          targetCenter.pos.x + 8 < 0
        ) {
          // go to scoring
          puck.speed = 0;
          puck.state = STATE.RESET;
        } else {
          console.log(puck.speed);
        }
      }
      puck.pos.y += puck.target.y;
      // check if Collide with Cyan Rect (our wall)
      color("light_cyan");
      if (char("a", puck.pos).isColliding.rect.light_cyan) {
        // change angle direction
        puck.angle = -puck.angle;

        // bottom collision
        if (puck.pos.y > G.HEIGHT / 2) {
          puck.pos = vec(puck.pos.x, G.PUCKPOSMAX - 3);
        }

        // top collision
        if (puck.pos.y < G.HEIGHT / 2) {
          puck.pos = vec(puck.pos.x, G.PUCKPOSMIN + 3);
        }
      }
      break;
    case STATE.RESET:
      // redraw our puck
      color("light_cyan");
      char("a", puck.pos);
      // redraw our target
      color("light_red");
      arc(targetCenter.pos, 12, 6, 0, 2 * PI);
      color("light_blue");
      arc(targetCenter.pos, 28, 6, 0, 2 * PI);
      // draw the enemy pucks
      obstacles.forEach(o => {
        color("black"); //if(rnd(1, 2) > 1) color("light_yellow"); else color("light_green");
        char("b", o.pos);
      });
      color("black");
      text("CLICK FOR NEXT SHOT", vec(G.WIDTH / 4, G.HEIGHT / 2));
      if (input.isJustPressed) {
        if (
          targetCenter.pos.x > 0 &&
          targetCenter.pos.x < G.WIDTH &&
          puck.speed <= 0
        ) {
          addScore(distance * 10);
        }
        // reset and remove a "life"
        if (--puck.lives < 0) end();

        // reset all puck values
        puck.speed = 1;
        puck.reverse = false;
        puck.pos = vec(10, G.HEIGHT / 2);
        puck.target = vec(10, G.HEIGHT / 2);
        // reset obstacles
        obstacles = times(2, () => {
          return {
            pos: vec(G.WIDTH, G.PUCKPOSMIN),
            speed: 0
          };
        });
        // reset target and distance
        targetCenter = { pos: vec(G.WIDTH, G.HEIGHT / 2) };
        distance = rndi(15, 45); // 15 or 50m
        puck.state = STATE.POSITION;
      }
      break;
  }
  // Floating Scores
  remove(scores, s => {
    // color(s.color)
    s.pos.y -= 0.1;
    text("+" + s.score, s.pos);
    s.age -= 1;
    let disappear = s.age <= 0;
    return disappear;
  });
}

function myAddScore(
  value,
  x = G.WIDTH / 2,
  y = G.HEIGHT / 2,
  color = "black",
  time = 60
) {
  let score = {
    pos: vec(x, y),
    age: time,
    score: value,
    color: color
  };
  scores.push(score);
  addScore(value);
}