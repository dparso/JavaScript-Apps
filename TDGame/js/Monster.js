// monster movement
const MONSTER_HEALTH_BAR_HEIGHT = 5;
var MONSTER_ID = [0, 0];
var monsterHealths = [15, 100, 300, 2000, 10000, 1000000, 50000000, 5000000000];
var monsterSpeeds = [10, 5, 4, 6, 7, 2.5, 3, 2];
var monsterValues = [1, 8, 15, 70, 300, 1000, 30000, 100000]; // how much you get for killing one
var monsterCosts = [4, 20, 40, 200, 1000, 10000, 200000, 1000000];
var monsterNames = ["Spook", "Fright", "Fear", "Dread", "Nightmare", "Terror", "Horror", "Chaos"]; // horror, panic

function MonsterClass(type, image, context) {
    // positions
    this.x = MONSTER_START[context].col * TILE_W;
    this.y = MONSTER_START[context].row * TILE_H;
    this.currTile = MONSTER_START[context];

    this.img = image;
    this.context = context; // where to draw itself
    this.id = MONSTER_ID[this.context]++;

    this.pathPosition = 0; // current goal
    this.visible = false;
    this.type = type;
    this.health = monsterHealths[type];
    this.speed = monsterSpeeds[type];
    this.invulnerable = false;
    this.immobile = false;
    this.value = monsterValues[type];

    this.classType = "monster";

    this.reset = function() {
        this.x = MONSTER_START[this.context].col * TILE_W;
        this.y = MONSTER_START[this.context].row * TILE_H;
        this.currTile = MONSTER_START[this.context];
    }

    this.move = function() {
        if(this.immobile) return;
        if(this.pathPosition < monsterPath[this.context].length) {
            if(this.visible) {
                var nextGoal = monsterPath[this.context][this.pathPosition];
                var changeX = nextGoal.x - this.x;
                var changeY = nextGoal.y - this.y;

                this.x += Math.sign(changeX) * this.speed;
                this.y += Math.sign(changeY) * this.speed;

                if(Math.abs(nextGoal.x - this.x) <= this.speed && Math.abs(nextGoal.y - this.y) <= this.speed) {
                    this.x = nextGoal.x;
                    this.y = nextGoal.y;
                    this.pathPosition++;
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
    }

    this.draw = function() {
        if(this.visible) {
            var xOff = 0, yOff = 0;
            if(this.img.width > TILE_W) {
                xOff = -(this.img.width - TILE_W) / 2.0;
            }
            if(this.img.height > TILE_H) {
                yOff = -(this.img.height - TILE_H) / 2.0;
            }
            ctx[this.context].drawImage(this.img, this.x + xOff, this.y + yOff);

            // health bar
            var widthLimit = this.health / monsterHealths[this.type];
            drawRect(this.x + xOff, this.y - 5 + yOff, this.img.width * widthLimit, MONSTER_HEALTH_BAR_HEIGHT, 'red', this.context);
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

    this.die = function(killed) {
        this.health = 0; // towers don't attack anymore
        if(killed) {
            // only reward player if it was killed (also dies at end)
            var obj = this.context == PLAYER ? player : enemy;
            obj.killedMonster(this.type);
            queueMessage("+" + monsterValues[this.type], this.x, this.y, this.context, 'green');
        }

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

        // add neighbors that are ground and unvisited
        for(var rowOffset = -1; rowOffset <= 1; rowOffset++) {
            if(rowOffset == 0) continue;
            if(gridInRange(currTile.row + rowOffset, currTile.col)) {
                var tile = StateController.currLevel.tiles[context][currTile.row + rowOffset][currTile.col];

                if((tile.type == TILE_GROUND || tile.type == TILE_MONSTER_END) && !tile.visited) {
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
                if((tile.type == TILE_GROUND || tile.type == TILE_MONSTER_END) && !tile.visited) {
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
        if(monsterPath[context][0] != undefined) {
            if(pixelPos.x != monsterPath[context][0].x && pixelPos.y != monsterPath[context][0].y) {
                // changing direction: add previous
                monsterPath[context].unshift({x: prevX, y: prevY});
            }
            prevX = pixelPos.x;
            prevY = pixelPos.y;
        } else {
            monsterPath[context].unshift(pixelPos);
        }
        var tilePos = pixelToGrid(pixelPos.x, pixelPos.y);
        fullMonsterPath[context].push(tilePos); // this one goes last-first for easy tower traversal
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