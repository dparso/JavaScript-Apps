// monster movement
const MONSTER_SPEED = 5;
const MONSTER_START_HEALTH = 5;

const MONSTER_HEALTH_BAR_HEIGHT = 5;
var monsterID = 0;

function MonsterClass(type, image) {
    // positions
    this.x = 75;
    this.y = 75;

    this.img = image;
    this.id = monsterID++;

    this.pathPosition = 0; // current goal
    this.visible = false;
    this.currTile = pixelToGrid(this.x, this.y);
    this.health = 5;

    this.reset = function() {
        this.x = MONSTER_START.col * TILE_W;
        this.y = MONSTER_START.row * TILE_H;
    } // end of monsterReset

    this.move = function() {
        // console.log("monster, " + monsterPath.length);
        if(this.pathPosition < monsterPath.length) {
            if(this.visible) {
                var nextGoal = monsterPath[this.pathPosition];
                var a = pixelToGrid(nextGoal.x, nextGoal.y);
               // console.log("trying to get to " + a.row + ", " + a.col);

                var changeX = Math.sign((nextGoal.x - this.x));
                var changeY = Math.sign((nextGoal.y - this.y));

                this.x += changeX * MONSTER_SPEED;
                this.y += changeY * MONSTER_SPEED;

                if(Math.abs(nextGoal.x - this.x) < 0.5 && Math.abs(nextGoal.y - this.y) < 0.5) {
                    this.pathPosition++;
                }

                if(!collisionHandling(this)) {
                    // undo change if colliding
                    this.x -= changeX * MONSTER_SPEED;
                    this.y -= changeY * MONSTER_SPEED;
                } else {
                    // since it moved, it must notify tiles if changed
                    var newTile = pixelToGrid(this.x, this.y);
                    if(newTile.col != this.currTile.col || newTile.row != this.currTile.row) {
                        tiles[this.currTile.row][this.currTile.col].notifyMonsterDepart(this.id);
                        tiles[newTile.row][newTile.col].notifyMonsterArrive(this.id);
                        this.currTile = newTile;
                    }
                }
            }
        }
    }

    this.draw = function() {
        if(this.visible) {
            canvasContext.drawImage(this.img, this.x, this.y);

            // health bar
            var widthLimit = this.health / MONSTER_START_HEALTH;
            drawRect(this.x, this.y - 5, this.img.width * widthLimit, MONSTER_HEALTH_BAR_HEIGHT, 'red');
        }
    }

    this.hitWithProjectile = function(damage) {
        // return true if dead
        this.health -= damage;
        if(this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    this.die = function() {
        tiles[this.currTile.row][this.currTile.col].notifyMonsterDepart(this.id);
        delete monsterList[this.id];
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

function calculateMonsterPath() {
    // BFS from TILE_MONSTER_START to TILE_MONSTER_END
    var currTile, finish;
    for(var row = 0; row < TILE_ROWS; row++) {
        for(var col = 0; col < TILE_COLS; col++) {
            if(tiles[row][col].type == TILE_MONSTER_START) {
                currTile = tiles[row][col];
            }
        }
    }
    
    if(!currTile) {
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
                var tile = tiles[currTile.row + rowOffset][currTile.col];

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
                var tile = tiles[currTile.row][currTile.col + colOffset];

                if((tile.type == TILE_GROUND || tile.type == TILE_MONSTER_END) && !tile.visited) {
                    // add this to path
                    tile.parent = currTile;
                    frontier.push(tile);
                }
            }
        }
    }

    while(finish.parent) {
        var pixelPos = gridToPixel(finish.row, finish.col);
        monsterPath.unshift(pixelPos);
        finish = finish.parent;
    }
    console.log(monsterPath.length);
}

function createMonsters() {
    // var goalPath = [{x: 80, y: 170}, {x: 200, y: 80}, {x: 670, y: 80}, {x: 710, y: 480}, {x: 610, y: 480}]; // ideally this would be in the grid as well (how to order?)

    for(var i = 0; i < NUM_MONSTERS; i++) {
        for(var j = 0; j < monsterSelections[i + MONSTER_OFFSET_NUM]; j++) {
            var img = tilePics[i + MONSTER_OFFSET_NUM];
            var monster = new MonsterClass(i, tilePics[i + MONSTER_OFFSET_NUM], monsterPath);
            monster.reset();
            monsterList[monster.id] = monster;
            StateController.monstersWaiting.push(monster);
        }
    }
}