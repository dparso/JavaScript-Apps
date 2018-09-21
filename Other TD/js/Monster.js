// monster movement
const MONSTER_HEALTH_BAR_HEIGHT = 5;
var MONSTER_ID = [0, 0];
var monsterHealths = [[5.0, 20.0, 100.0, 250.0, 2000.0, 100000.0, 50000000.0, 8000000000.0], [5.0, 30.0, 100.0, 250.0, 2000.0, 100000.0, 50000000.0, 8000000000.0]];
var monsterSpeeds = [[10, 5, 4, 6, 7, 2.5, 3, 2], [10, 5, 4, 6, 7, 2.5, 3, 2]];

var monster_kill_ratio = 0.1; // gold from killing
var monster_send_ratio = 0.3; // income from sending
var monsterCosts = [[50.0, 190.0, 800.0, 1500.0, 8000.0, 50000.0, 250000.0, 5000000.0],
                    [50.0, 190.0, 800.0, 1500.0, 8000.0, 50000.0, 250000.0, 5000000.0]];
var monsterNames = ["Spook", "Fright", "Fear", "Dread", "Nightmare", "Terror", "Horror", "Chaos"]; // panic, despair, jitters, concern, creep, anguish, gloom, misery, desperation, wraith
var monsterDescriptions = ["Weak, fast, and spooky.", 
                           "Strong, slow early-game monster.", 
                           "Be afraid!", 
                           "Shore up your defenses, or pay the price.", 
                           "The dark-alley life stealer.", 
                           "Looming, lumbering, lifeless.", 
                           "The lieutenant of Chaos.", 
                           "Game over, man."];

var monsterCounts = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
var monsterLevels = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]];

const LEFT = 0;
const RIGHT = 1;

function MonsterClass(type, owner) {
    // positions
    this.x = MONSTER_START.col * TILE_W;
    this.y = MONSTER_START.row * TILE_H;
    this.currTile = MONSTER_START;
    this.prevTile = MONSTER_START;

    this.imgs = monsterPics[type];
    this.imgIndex = 0; // which point in walk animation
    this.walkTimer = 0;
    this.direction = RIGHT;

    this.owner = owner; // where to draw itself
    this.id = MONSTER_ID[this.owner]++;

    this.pathPosition = monsterPath.length - 1; // current goal
    this.visible = true;
    this.type = type;
    this.alive = true;
    this.level = monsterLevels[otherPlayer(this.owner)][this.type];
    this.health = monsterHealths[otherPlayer(this.owner)][type];
    this.maxHealth = this.health;
    this.speed = monsterSpeeds[otherPlayer(this.owner)][type];
    this.invulnerable = false;
    this.immobile = false;
    this.value = monsterCosts[otherPlayer(this.owner)][this.type] * monster_kill_ratio;

    // towersWithDots is a map of towerIds to their applied dotIds
    // towers use this to access (refresh) this.dots when attacking
    this.dots = {}; // these two can likely be consolidated
    this.towersWithDots = {}; // for now, each monster can only have 1 dot from each tower
    this.reaperDot = false;

    this.animationTime = 100 / this.speed;
    this.animationStage = this.animationTime;

    this.classType = "monster";

    this.reset = function() {
        this.x = MONSTER_START.col * TILE_W;
        this.y = MONSTER_START.row * TILE_H;
        this.currTile = MONSTER_START;
    }

    this.move = function() {
        // apply dots to self
        for(dotId in this.dots) {
            this.dots[dotId].move();
        }
        // these dots may have killed the monster: only move if still alove
        if(!this.alive) return;

        if(!this.alive || monsterList[this.owner][this.id].currTile.row != this.currTile.row || monsterList[this.owner][this.id].currTile.col != this.currTile.col) {
            debugger;
        }

        if(this.immobile) return;
        if(this.currTile.row != MONSTER_END.row || this.currTile.col != MONSTER_END.col) {
            if(this.visible) { // should still move in visible -- ?
                let parent = StateController.currLevel.tiles[this.currTile.row][this.currTile.col].parent;
                if(parent === undefined || parent == null) {
                    debugger;
                }

                var nextGoal = gridToPixel(parent.row, parent.col);

                var changeX = nextGoal.x - this.x;
                var changeY = nextGoal.y - this.y;
                if(changeX < 0) {
                    this.direction = LEFT;
                } else if(changeX > 0) {
                    this.direction = RIGHT;
                }

                this.x += Math.sign(changeX) * this.speed;
                this.y += Math.sign(changeY) * this.speed;

                // within range of next goal
                let closeX = false, closeY = false;
                if(Math.abs(nextGoal.x - this.x) < this.speed) {
                    closeX = true;
                }
                if(Math.abs(nextGoal.y - this.y) < this.speed) {
                    closeY = true;
                }

                if(closeX && closeY) {
                    StateController.currLevel.tiles[this.currTile.row][this.currTile.col].notifyMonsterDepart(this.id);
                    StateController.currLevel.tiles[parent.row][parent.col].notifyMonsterArrive(this.id);
                    
                    this.prevTile = this.currTile;
                    this.currTile = parent;
                    
                    var nextTile = StateController.currLevel.tiles[parent.row][parent.col].parent;
                    // snap to next position if turning a corner
                    if(nextTile != null) {;
                        if(this.prevTile.row != nextTile.row && this.prevTile.col != nextTile.col) {
                            this.x = nextGoal.x;
                            this.y = nextGoal.y;
                        }
                    }
                }
            }
        } else {
            // reached the end: take a life
            queueMessage("-1", this.x, this.y);
            StateController.notifyLifeLost(this.owner);
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
            if(this.owner === PLAYER) {
                color = 'black';
            } else {
                color = 'white';
            }
            if(this.animationStage > 0) {
                ctx.save();
                ctx.translate(this.x + TILE_W / 2, this.y + TILE_H / 2);
                var scale = 1 - (this.animationStage / this.animationTime);
                ctx.scale(scale, scale);
                ctx.shadowBlur = 30;
                ctx.shadowColor = color;
                ctx.globalAlpha = scale;

                ctx.drawImage(img, Math.round(-img.width / 2), Math.round(-img.height / 2));
                ctx.restore();

                this.animationStage--;
            } else {
                var xOff = 0, yOff = 0;
                if(img.width > TILE_W) {
                    xOff = -(img.width - TILE_W) / 2.0;
                }
                if(img.height > TILE_H) {
                    yOff = -(img.height - TILE_H) / 2.0;
                }

                ctx.drawImage(img, Math.round(this.x + xOff), Math.round(this.y + yOff));

                var color = this.reaperDot ? 'black' : 'red';
                // health bar
                var widthLimit = this.health / this.maxHealth;
                drawRect(this.x + xOff, this.y - 5 + yOff, img.width * widthLimit, MONSTER_HEALTH_BAR_HEIGHT, color);
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
        if(towerList[this.owner][towerId] !== undefined) {
            // tower might have been sold
            if(towerList[this.owner][towerId].type === REAPER) {
                this.reaperDot = false;
            }
        }
        delete this.towersWithDots[towerId];
        delete this.dots[dotId];
    }

    this.die = function(killed) {
        if(!this.alive) debugger;
        this.alive = false;
        this.health = 0; // towers don't attack anymore
        if(killed) {
            // only reward player if it was killed (also dies at end)
            var obj = this.owner === PLAYER ? player : enemy;
            obj.killedMonster(this.type);
            // queueMessage("+" + this.value.toLocaleString(), this.x, this.y, 'green');
        }
        var sender = this.owner === PLAYER ? enemy : player;
        sender.monsterStrength -= monsterCosts[otherPlayer(this.owner)][this.type] * 4;

        StateController.currLevel.tiles[this.currTile.row][this.currTile.col].notifyMonsterDepart(this.id);
        if(monsterList[this.owner][this.id].currTile.row != this.currTile.row || monsterList[this.owner][this.id].currTile.col != this.currTile.col) {
            debugger;
        }
        delete monsterList[this.owner][this.id];
    }
}

// meant for tiles specifically
function Queue() {
    this.data = [];

    this.push = function(data) {
        data.visited = searchCount;
        this.data.unshift(data);
    }

    this.pop = function() {
        return this.data.pop();
    }

    this.empty = function() {
        return this.data.length === 0;
    }
}

function calculateMonsterPathAStar() {
    monsterPath = [];
    fullMonsterPath = [];
    var pth;
    var diagonals = true;
    var solver = new AStarSearcher(LEVELS[0].grid, MONSTER_START, MONSTER_END, diagonals);

    if(solver.findPath()) {
        pth = solver.makePath();

        // to increase efficiency, do this part inside makePath
        var prevXOff = 0, prevYOff = 0;
        monsterPath.push({pixel: gridToPixel(pth[0].row, pth[0].col), position: 0});
        for(var i = 1; i < pth.length; i++) {
            let xOff = pth[i].row - pth[i - 1].row;
            let yOff = pth[i].col - pth[i - 1].col;
            if(prevXOff !== xOff || prevYOff !== yOff) {
                let pixelPos = gridToPixel(pth[i - 1].row, pth[i - 1].col);
                monsterPath.push({pixel: pixelPos, position: i - 1});
                console.log(pixelPos);
            }
            fullMonsterPath.push(pth[i]);
            prevXOff = xOff;
            prevYOff = yOff;
        }
    }
}

var searchCount = 0;
function calculateMonsterPathBFS() {
    searchCount++;
    // BFS from TILE_MONSTER_START to TILE_MONSTER_END
    var currTile, finish;
    currTile = StateController.currLevel.tiles[MONSTER_END.row][MONSTER_END.col];
    currTile.distanceToGoal = 0;
    
    if(currTile === undefined) {
        return;
    }

    var frontier = new Queue();
    frontier.push(currTile);

    while(!frontier.empty()) {
        var currTile = frontier.pop();

        if(currTile.type === TILE_MONSTER_START) {
            finish = currTile;
            continue; // do more
        }

        // add neighbors that are PATH and unvisited
        for(var rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for(var colOffset = -1; colOffset <= 1; colOffset++) {
                if(allowDiagonals) {
                    if(rowOffset === 0 && colOffset === 0) continue;
                } else if(Math.abs(rowOffset) === Math.abs(colOffset)) {
                    continue;
                }

                if(gridInRange(currTile.row + rowOffset, currTile.col + colOffset)) {
                    var tile = StateController.currLevel.tiles[currTile.row + rowOffset][currTile.col + colOffset];

                    // if is monster start, stop!
                    if(monsterCanWalk(tile.row, tile.col) && tile.visited < searchCount) {
                        // add this to frontier
                        tile.parent = currTile;
                        tile.distanceToGoal = currTile.distanceToGoal + 1;
                        frontier.push(tile);
                    }
                }
            }
        }
    }

    var startPos = gridToPixel(MONSTER_END.row, MONSTER_END.col);
    var prevX = startPos.x, prevY = startPos.y;

    while(finish.parent) {
        StateController.currLevel.tiles[finish.row][finish.col].onPath = searchCount;
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