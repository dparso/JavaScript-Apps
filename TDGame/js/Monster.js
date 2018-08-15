// monster movement
const MONSTER_HEALTH_BAR_HEIGHT = 5;
var MONSTER_ID = [0, 0];
var monsterHealths = [[5.0, 20.0, 100.0, 250.0, 2000.0, 100000.0, 50000000.0, 8000000000.0], [5.0, 30.0, 100.0, 250.0, 2000.0, 100000.0, 50000000.0, 8000000000.0]];
var monsterSpeeds = [[10, 5, 4, 6, 7, 2.5, 3, 2], [10, 5, 4, 6, 7, 2.5, 3, 2]];

var monster_kill_ratio = 0.1; // gold from killing
var monster_send_ratio = 0.3; // income from sending
var monsterCosts = [[1.0, 3.0, 8.0, 20.0, 100.0, 1000.0, 20000.0, 100000.0], [1.0, 2.0, 8.0, 20.0, 100.0, 1000.0, 20000.0, 100000.0]];
var monsterNames = ["Spook", "Fright", "Fear", "Dread", "Nightmare", "Terror", "Horror", "Chaos"]; // panic, despair, jitters, concern, creep, anguish, gloom, misery, desperation, wraith
var monsterDescriptions = ["Weak, fast, and spooky.", "Strong, slow early-game monster.", "Be afraid!", "Shore up your defenses, or pay the price.", "The dark-alley life stealer.", "Looming, lumbering, lifeless.", "The lieutenant of Chaos.", "Game over, man."];

var monsterCounts = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
var monsterLevels = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]];

const LEFT = 0;
const RIGHT = 1;

function MonsterClass(type, context) {
    // positions
    this.x = MONSTER_START[context].col * TILE_W;
    this.y = MONSTER_START[context].row * TILE_H;
    this.currTile = MONSTER_START[context];

    this.imgs = monsterPics[type];
    this.imgIndex = 0; // which point in walk animation
    this.walkTimer = 0;
    this.direction = RIGHT;

    this.context = context; // where to draw itself
    this.id = MONSTER_ID[this.context]++;

    this.pathPosition = monsterPath[this.context].length - 1; // current goal
    this.visible = false;
    this.type = type;
    this.level = monsterLevels[otherPlayer(this.context)][this.type];
    this.health = monsterHealths[otherPlayer(this.context)][type];
    this.maxHealth = this.health;
    this.speed = monsterSpeeds[otherPlayer(this.context)][type];
    this.invulnerable = false;
    this.immobile = false;
    this.value = monsterCosts[otherPlayer(this.context)][this.type] * monster_kill_ratio;

    // towersWithDots is a map of towerIds to their applied dotIds
    // towers use this to access (refresh) this.dots when attacking
    this.dots = {}; // these two can likely be consolidated
    this.towersWithDots = {}; // for now, each monster can only have 1 dot from each tower
    this.reaperDot = false;

    this.animationTime = 100 / this.speed;
    this.animationStage = this.animationTime;

    this.classType = "monster";

    this.reset = function() {
        this.x = MONSTER_START[this.context].col * TILE_W;
        this.y = MONSTER_START[this.context].row * TILE_H;
        this.currTile = MONSTER_START[this.context];
    }

    this.move = function() {
        // apply dots to self
        for(dotId in this.dots) {
            this.dots[dotId].move();
        }

        if(this.immobile) return;
        if(this.pathPosition >= 0) {
            if(this.visible) {
                var nextGoal = monsterPath[this.context][this.pathPosition].pixel;
                var changeX = nextGoal.x - this.x;
                var changeY = nextGoal.y - this.y;
                if(changeX < 0) {
                    this.direction = LEFT;
                } else if(changeX > 0) {
                    this.direction = RIGHT;
                }

                this.x += Math.sign(changeX) * this.speed;
                this.y += Math.sign(changeY) * this.speed;

                if(Math.abs(nextGoal.x - this.x) <= this.speed && Math.abs(nextGoal.y - this.y) <= this.speed) {
                    this.x = nextGoal.x;
                    this.y = nextGoal.y;
                    this.pathPosition--;
                }

                // since it moved, it must notify tiles if changed
                var newTile = pixelToGrid(this.x, this.y);
                if(newTile.col != this.currTile.col || newTile.row != this.currTile.row) {
                    // notify old & new tile
                    StateController.currLevel.tiles[this.context][this.currTile.row][this.currTile.col].notifyMonsterDepart(this.id);
                    StateController.currLevel.tiles[this.context][newTile.row][newTile.col].notifyMonsterArrive(this.id);
                    this.currTile = newTile;
                }
            }
        } else {
            // reached the end: take a life
            queueMessage("-1", this.x, this.y, this.context);
            StateController.notifyLifeLost(this.context);
            this.die(false);
        }

        this.walkTimer++;
    }

    this.draw = function() {
        if(this.visible) {
            if(this.walkTimer > (50.0 / this.speed)) {
                this.imgIndex++;
                this.imgIndex %= this.imgs.length;
                this.walkTimer = 0;
            }
            if(this.direction >= this.imgs[this.imgIndex].length) {
                this.direction = 0; // won't need this for long, supports only 1 direction
            }
            var img = this.imgs[this.imgIndex][this.direction];
            var color;
            if(this.context == PLAYER) {
                color = 'black';
            } else {
                color = 'white';
            }
            if(this.animationStage > 0) {
                ctx[this.context].save();
                ctx[this.context].translate(this.x + TILE_W / 2, this.y + TILE_H / 2);
                var scale = 1 - (this.animationStage / this.animationTime);
                ctx[this.context].scale(scale, scale);
                ctx[this.context].shadowBlur = 30;
                ctx[this.context].shadowColor = color;
                ctx[this.context].globalAlpha = scale;

                ctx[this.context].drawImage(img, (-img.width) / 2, (-img.height) / 2);
                ctx[this.context].restore();

                this.animationStage--;
            } else {
                var xOff = 0, yOff = 0;
                if(img.width > TILE_W) {
                    xOff = -(img.width - TILE_W) / 2.0;
                }
                if(img.height > TILE_H) {
                    yOff = -(img.height - TILE_H) / 2.0;
                }

                // if(this.type > 4) {
                    // ctx[this.context].save();
                    // ctx[this.context].shadowColor = color;
                    // ctx[this.context].shadowBlur = 30; // too laggy!
                // }

                ctx[this.context].drawImage(img, this.x + xOff, this.y + yOff);

                var color = this.reaperDot ? 'black' : 'red';
                // health bar
                var widthLimit = this.health / this.maxHealth;
                drawRect(this.x + xOff, this.y - 5 + yOff, img.width * widthLimit, MONSTER_HEALTH_BAR_HEIGHT, color, this.context);
                // if(this.type > 4) ctx[this.context].restore();
            }

        }
    }

    this.hitWithProjectile = function(damage) {
        if(this.invulnerable) return;
        // return true if dead
        this.health -= damage;
        if(this.health <= 0) {
            this.die(true);
            return true;
        }
        return false;
    }

    this.removeDot = function(towerId, dotId) {
        if(towerList[this.context][towerId] != undefined) {
            // tower might have been sold
            if(towerList[this.context][towerId].type == REAPER) {
                this.reaperDot = false;
            }
        }
        delete this.towersWithDots[towerId];
        delete this.dots[dotId];
    }

    this.die = function(killed) {
        this.health = 0; // towers don't attack anymore

        if(killed) {
            // only reward player if it was killed (also dies at end)
            var obj = this.context == PLAYER ? player : enemy;
            obj.killedMonster(this.type);
            // queueMessage("+" + this.value.toLocaleString(), this.x, this.y, this.context, 'green');
        }
        var sender = this.context == PLAYER ? enemy : player;
        sender.monsterStrength -= monsterCosts[otherPlayer(this.context)][this.type] * 4;

        StateController.currLevel.tiles[this.context][this.currTile.row][this.currTile.col].notifyMonsterDepart(this.id);
        delete monsterList[this.context][this.id];
    }
}

// meant for tiles specifically
function Queue() {
    this.data = [];

    this.push = function(data) {
        data.visited = true;
        this.data.unshift(data);
    }

    this.pop = function() {
        return this.data.pop();
    }

    this.empty = function() {
        return this.data.length == 0;
    }
}

function calculateMonsterPath(context) {
    // BFS from TILE_MONSTER_START to TILE_MONSTER_END
    // NOTE: for now, the tiles are the same, so the path is the same
    var currTile, finish;
    for(var row = 0; row < TILE_ROWS; row++) {
        for(var col = 0; col < TILE_COLS; col++) {
            if(StateController.currLevel.tiles[context][row][col].type == TILE_MONSTER_START) {
                currTile = StateController.currLevel.tiles[context][row][col];
            }
        }
    }
    
    if(currTile == undefined) {
        return;
    }

    var frontier = new Queue();
    frontier.push(currTile);

    while(!frontier.empty()) {
        var currTile = frontier.pop();

        if(currTile.type == TILE_MONSTER_END) {
            finish = currTile;
            break; // do more
        }

        // add neighbors that are PATH and unvisited
        for(var rowOffset = -1; rowOffset <= 1; rowOffset++) {
            if(rowOffset == 0) continue;
            if(gridInRange(currTile.row + rowOffset, currTile.col)) {
                var tile = StateController.currLevel.tiles[context][currTile.row + rowOffset][currTile.col];

                if((tile.type == TILE_PATH || tile.type == TILE_MONSTER_END) && !tile.visited) {
                    // add this to path
                    tile.parent = currTile;
                    frontier.push(tile);
                }
            }
        }
        for(var colOffset = -1; colOffset <= 1; colOffset++) {
            if(colOffset == 0) continue;
            if(gridInRange(currTile.row, currTile.col + colOffset)) {
                var tile = StateController.currLevel.tiles[context][currTile.row][currTile.col + colOffset];
                if((tile.type == TILE_PATH || tile.type == TILE_MONSTER_END) && !tile.visited) {
                    // add this to path
                    tile.parent = currTile;
                    frontier.push(tile);
                }
            }
        }
    }

    var startPos = gridToPixel(MONSTER_START[context].row, MONSTER_START[context].col);
    var prevX = startPos.x, prevY = startPos.y;

    while(finish.parent) {
        var pixelPos = gridToPixel(finish.row, finish.col);
        if(monsterPath[context][monsterPath[context].length - 1] != undefined) {
            if(pixelPos.x != monsterPath[context][monsterPath[context].length - 1].pixel.x && pixelPos.y != monsterPath[context][monsterPath[context].length - 1].pixel.y) {
                // changing direction: add previous
                monsterPath[context].push({pixel: {x: prevX, y: prevY}, position: fullMonsterPath[context].length});
            }
            prevX = pixelPos.x;
            prevY = pixelPos.y;
        } else {
            monsterPath[context].push({pixel: pixelPos, position: fullMonsterPath[context].length});
        }

        var tilePos = pixelToGrid(pixelPos.x, pixelPos.y);
        fullMonsterPath[context].push({tile: tilePos, position: monsterPath[context].length - 1}); // this one goes last-first for easy tower traversal
        finish = finish.parent;
    }
}

function createMonsters() {
    // var masterMonster = new MonsterClass(0, tilePics[TILE_MONSTER_4]);
    // masterMonster.reset();
    // masterMonster.x = Math.floor(TILE_COLS / 2) * TILE_W;
    // masterMonster.y = Math.floor(TILE_ROWS / 2) * TILE_H;
    // masterMonster.currTile = {row: Math.floor(TILE_ROWS / 2), col: Math.floor(TILE_COLS / 2)};
    // // masterMonster.invulnerable = true;
    // masterMonster.immobile = true;
    // masterMonster.visible = true;

    // var tile = pixelToGrid(masterMonster.x, masterMonster.y);
    // StateController.currLevel.tiles[tile.row][tile.col].notifyMonsterArrive(0);
    // monsterList[0] = masterMonster;

    for(var i = 0; i < NUM_MONSTERS; i++) {
        for(var j = 0; j < monsterSelections[i + MONSTER_OFFSET_NUM]; j++) {
            StateController.sendMonster(i, PLAYER);
        }
    }
}