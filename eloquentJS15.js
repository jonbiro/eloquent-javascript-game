var Plan1 = [
  "                               x",
  "                               x",
  "                               x",
  "                              =x",
  "                     o o       x",
  "  x                 xxxxx      x",
  "  x         o o            o   x",
  "  x @      xxxxx           xxxxx",
  "  xxxxx                        x",
  "      x!!!!!!!!!!!!!!!!!!!!!!!!x",
  "      xxxxxxxxxxxxxxxxxxxxxxxxxx",
  "                                "
];

var Plan2 = [
  "                          o    x",
  " =          o o         xxx    x",
  "           xxxxx               x",
  "                              =x",
  "  x                  o         x",
  "  x               xxxxx        x",
  "  x       o o  =           o   x",
  "  x @    xxxxx             xxxxx",
  "  xxxxx                        x",
  "      x!!!!!!!!!!!!!!!!!!!!!!!!x",
  "      xxxxxxxxxxxxxxxxxxxxxxxxxx",
  "                                "
];

var GAME_LEVELS =[Plan1,Plan2];

var gameInfo={
	life:3,
	coin: 0,
  totalCoin:0,
  level:1
};
//reading level
function Level(plan) {
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];
  //clear the coin count
  gameInfo.coin=0;

  for (var y = 0; y < this.height; y++) {
    var line = plan[y], gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x], fieldType = null;
      var Actor = actorChars[ch];
      //console.log(Actor);
      if(ch =='o'){
      	gameInfo.coin++
      }
      if (Actor){
      	//contain function Coin Player and Lava
        this.actors.push(new Actor(new Vector(x, y), ch));}
      else if (ch == "x")
        fieldType = "wall";
      else if (ch == "!")
        fieldType = "lava";	
      gridLine.push(fieldType);
    }
    gameInfo.totalCoin=gameInfo.coin;
    this.grid.push(gridLine);
    
  }
//console.log(gameInfo.coin);
  this.player = this.actors.filter(function(actor) {
    return actor.type == "player";
  })[0];
  this.status = this.finishDelay = null;
};

Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};

//actors
function Vector(x, y) {
  this.x = x; this.y = y;
}

Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava, "|": Lava, "v": Lava
};

function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";

function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";


function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}

function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(elt("div", "game"));
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}

var scale = 20;

DOMDisplay.prototype.drawBackground = function() {
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt("tr"));
    rowElt.style.height = scale + "px";
    row.forEach(function(type) {
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};

DOMDisplay.prototype.drawActors = function() {
  var wrap = elt("div");
  this.level.actors.forEach(function(actor) {
    var rect = wrap.appendChild(elt("div",
                                    "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer)
    this.wrap.removeChild(this.actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game " + (this.level.status || "");
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5))
                 .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};


//canvas version
function CanvasDisplay(parent, level) {

	//for display info
  this.board = document.createElement("canvas");
  this.board.width = Math.min(600, level.width * scale);
  this.board.height = 100 ;
  parent.appendChild(this.board);
  this.boardInfo = this.board.getContext("2d");
  //console.log('display');

  this.canvas = document.createElement("canvas");
  this.canvas.width = Math.min(600, level.width * scale);
  this.canvas.height = Math.min(450, level.height * scale);
  parent.appendChild(this.canvas);
  this.cx = this.canvas.getContext("2d");

  this.level = level;
  this.animationTime = 0;
  this.flipPlayer = false;

  this.viewport = {
    left: 0,
    top: 0,
    width: this.canvas.width / scale,
    height: this.canvas.height / scale
  };


  this.drawFrame(0);
}

CanvasDisplay.prototype.updateInfo = function(type, num) {
  if(type=='coin'){
  	this.boardInfo.fillText("Coin: " + gameInfo.coin, 150, 50);
  	this.boardInfo.fill();  	
  }

  if(type==life){
 	this.boardInfo.fillText("Life: " + gameInfo.life, 10, 50);
  	this.boardInfo.fill();
  }
};

CanvasDisplay.prototype.clear = function() {
  this.canvas.parentNode.removeChild(this.canvas);
  this.board.parentNode.removeChild(this.board);

};

CanvasDisplay.prototype.drawFrame = function(step) {
  this.animationTime += step;
  this.updateViewport();
  this.clearDisplay();
  this.drawBackground();
  this.drawActors();
  this.drawBoard();
};

CanvasDisplay.prototype.updateViewport = function() {
  var view = this.viewport, margin = view.width / 3;
  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5));

  if (center.x < view.left + margin)
    view.left = Math.max(center.x - margin, 0);
  else if (center.x > view.left + view.width - margin)
    view.left = Math.min(center.x + margin - view.width, this.level.width - view.width);
  if (center.y < view.top + margin)
    view.top = Math.max(center.y - margin, 0);
  else if (center.y > view.top + view.height - margin)
    view.top = Math.min(center.y + margin - view.height, this.level.height - view.height);
};

CanvasDisplay.prototype.clearDisplay = function() {
  if (this.level.status == "won")
    this.cx.fillStyle = "rgb(68, 191, 255)";
  else if (this.level.status == "lost")
    this.cx.fillStyle = "rgb(44, 136, 214)";
  else
    this.cx.fillStyle = "rgb(52, 166, 251)";

  this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

var otherSprites = document.createElement("img");
otherSprites.src = "img/sprites.png";

CanvasDisplay.prototype.drawBoard = function() {
  this.boardInfo.fillStyle='rgb(52, 166, 251)'; //background color
  this.boardInfo.fillRect(0,0,this.board.width,this.board.height);
  this.boardInfo.font = "15px bold Arial";
  this.boardInfo.fillStyle = "#333";
  this.boardInfo.fillText("Level: " + gameInfo.level,50, 30);  
  this.boardInfo.fillText("Total Coin: " + gameInfo.totalCoin, 150, 30);
  this.boardInfo.fillText("Remained Coin: " + gameInfo.coin, 250, 30);
  this.boardInfo.fillText("Remained Life: " + gameInfo.life, 400, 30);
  //this.boardInfo.fill();

};

CanvasDisplay.prototype.drawBackground = function() {
  var view = this.viewport;
  var xStart = Math.floor(view.left);
  var xEnd = Math.ceil(view.left + view.width);
  var yStart = Math.floor(view.top);
  var yEnd = Math.ceil(view.top + view.height);

  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var tile = this.level.grid[y][x];
      if (tile == null) continue;
      var screenX = (x - view.left) * scale;
      var screenY = (y - view.top) * scale;
      var tileX = tile == "lava" ? scale : 0;
      this.cx.drawImage(otherSprites,tileX, 0, scale, scale, screenX, screenY, scale, scale);
    }
  }
};

var playerSprites = document.createElement("img");
playerSprites.src = "img/player.png";
var playerXOverlap = 4;

function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}
CanvasDisplay.prototype.drawPlayer = function(x, y, width, height) {
  var sprite = 8, player = this.level.player;
  width += playerXOverlap * 2;
  x -= playerXOverlap;
  if (player.speed.x != 0)
    this.flipPlayer = player.speed.x < 0;

  if (player.speed.y != 0)
    sprite = 9;
  else if (player.speed.x != 0)
    sprite = Math.floor(this.animationTime * 12) % 8;

  this.cx.save();
  if (this.flipPlayer)
    flipHorizontally(this.cx, x + width / 2);

  this.cx.drawImage(playerSprites,sprite * width, 0, width, height,x, y, width, height);

  this.cx.restore();
};

CanvasDisplay.prototype.drawActors = function() {
  this.level.actors.forEach(function(actor) {
    var width = actor.size.x * scale;
    var height = actor.size.y * scale;
    var x = (actor.pos.x - this.viewport.left) * scale;
    var y = (actor.pos.y - this.viewport.top) * scale;
    if (actor.type == "player") {
      this.drawPlayer(x, y, width, height);
    } 
    else {
      var tileX = (actor.type == "coin" ? 2 : 1) * scale;
      this.cx.drawImage(otherSprites,tileX, 0, width, height,x,y, width, height);
    }
  }, this);
};

//motion and collision
Level.prototype.obstacleAt = function(pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if (xStart < 0 || xEnd > this.width || yStart < 0)
    return "wall";
  if (yEnd > this.height)
    return "lava";
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};

Level.prototype.actorAt = function(actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};

//actor and action
var maxStep = 0.05;

Level.prototype.animate = function(step, keys) {
  if (this.status != null)
    this.finishDelay -= step;

  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function(actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};

var wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

//horizontal move
var playerXSpeed = 7;

Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle)
    level.playerTouched(obstacle);
  else
    this.pos = newPos;
};

//jump
var gravity = 30;
var jumpSpeed = 17;

Player.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);

  // Losing animation
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

//collision of actor and other obj
Level.prototype.playerTouched = function(type, actor) {

  if (type == "lava" && this.status == null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type == "coin") {
  	gameInfo.coin--;
    this.actors = this.actors.filter(function(other) {
      return other != actor;
    });
    if (!this.actors.some(function(actor) {
      return actor.type == "coin";
    })) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
};

//key event
var arrowCodes = {37: "left", 38: "up", 39: "right"};

function trackKeys(codes) {
  var pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
      pressed.unregister = function() {
      removeEventListener("keydown", handler);
      removeEventListener("keyup", handler);
    };
  return pressed;
}

//run the game
function runAnimation(frameFunc, stop) {
  var lastTime = null;
  function frame(time) {
    //console.log('stop' + stop);
    //var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  var run='y';
  function pause(event){
    if(event.keyCode===27){
        console.log('esc: ' +run);
      if(run ==='n'){
        run = 'y';
        //need sth to stop game
            runAnimation(function(step) {
      level.animate(step, arrows);
      display.drawFrame(step);
      //console.log('step: ' +step);
  
      if (level.isFinished()) {
        display.clear();
        removeEventListener('keydown',pause);
        arrows.unregister();
        if (andThen)
          andThen(level.status);
        return false;
      }
    },true);

      }
      else if(run ==='p'){
        run='y';

      }
      else if(run='y'){
        run='p';
      }
    }
  }
  console.log('y: ' +run);
  addEventListener('keydown', pause);

  var arrows = trackKeys(arrowCodes);  

    runAnimation(function(step) {
      level.animate(step, arrows);
      display.drawFrame(step);
      //console.log('step: ' +step);
  
      if (level.isFinished()) {
        display.clear();
        removeEventListener('keydown',pause);
        arrows.unregister();
        if (andThen)
          andThen(level.status);
        return false;
      }
    },false);
}

function runGame(plans, Display) {
  function startLevel(n, life) {
    gameInfo.level=n + 1;
    runLevel(new Level(plans[n]), Display, function(status) {
      if (status == "lost"){
      	gameInfo.life--;
      	//console.log(life);
      	if(gameInfo.life<=0){
      		gameInfo.life=3;
      		startLevel(0,gameInfo.life);
      	}
      	else{
      		startLevel(n, gameInfo.life);
      	}
      }
      else if (n < plans.length - 1)
        startLevel(n + 1, gameInfo.life);
      else
        console.log("You win!");
    });
  }
  startLevel(0, gameInfo.life);
}
