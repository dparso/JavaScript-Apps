// monster movement
const MONSTER_SPEED = 5;
var monsterID = 0;

function MonsterClass(type, image, path) {
    // positions
    this.x = 75;
    this.y = 75;

    this.img = image;
    this.id = monsterID++;
    this.path = path; // some array of pixel positions
    this.pathPosition = 0; // current goal
    this.visible = false;
    this.currTile = pixelToGrid(this.x, this.y);

    this.reset = function() {
        for(var row = 0; row < TILE_ROWS; row++) {
            for(var col = 0; col < TILE_COLS; col++) {
                if(tiles[row][col].type == TILE_MONSTER_START) {

                    this.x = col * TILE_W + TILE_W / 2;
                    this.y = row * TILE_H + TILE_H / 2;
                    this.currTile = pixelToGrid(this.x, this.y);
                    return;
                } // end of if
            } // end of col
        } // end of row
    } // end of monsterReset

    this.move = function() {
        if(this.pathPosition < path.length) {
            if(this.visible) {
                var nextGoal = this.path[this.pathPosition];
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
        }
    }
}

function createMonsters() {
    var goalPath = [{x: 80, y: 170}, {x: 200, y: 80}, {x: 670, y: 80}, {x: 710, y: 480}, {x: 610, y: 480}]; // ideally this would be in the grid as well (how to order?)
    for(var i = 0; i < NUM_MONSTERS; i++) {
        for(var j = 0; j < monsterSelections[i + MONSTER_OFFSET_NUM]; j++) {
            var img = tilePics[i + MONSTER_OFFSET_NUM];
            console.log(i + MONSTER_OFFSET_NUM - 1 + ", " + img);
            var monster = new MonsterClass(i, tilePics[i + MONSTER_OFFSET_NUM], goalPath);
            monster.reset();
            monsterList.push(monster);
            StateController.monstersWaiting.push(monster);
        }
    }
}