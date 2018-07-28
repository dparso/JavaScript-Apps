function TileClass(position, type, img) {
    this.row = position.row;
    this.col = position.col;
    this.type = type;
    this.img = img;

    this.monstersOnTile = new Set();

    this.getMonsters = function() {
        return this.monstersOnTile();
    }

    this.notifyMonsterArrive = function(monster) {
        // monster is an id, not a monster object
        this.monstersOnTile.add(monster);
        // console.log("tile " + this.row + ", " + this.col + " has gained " + monster);
    }

    this.notifyMonsterDepart = function(monster) {
        this.monstersOnTile.delete(monster);
        // console.log("tile " + this.row + ", " + this.col + " has lost " + monster);
    }
}

function tilesDraw() {
    var drawTileX = 0;
    var drawTileY = 0;
    for(var row = 0; row < TILE_ROWS; row++) {
        drawTileX = 0;
        for(var col = 0; col < TILE_COLS; col++) {
            var currTile = tiles[row][col].type;

            if(tileTypeHasTransparency(currTile)) {
                canvasContext.drawImage(tilePics[TILE_GROUND], drawTileX, drawTileY);
            }

            if(currTile == TILE_MONSTER_START) {
                drawTileX += TILE_W;
                continue;
            }

            canvasContext.drawImage(tiles[row][col].img, drawTileX, drawTileY);
            drawTileX += TILE_W;
        }

        drawTileY += TILE_H;
    }
}

function tileTypeHasTransparency(tileType) {
    // 5 - 11
    // switch(tileType) {
    //     case TILE_MONSTER_1: // 
    //         return true;
    //     case TILE_MONSTER_2:
    //         return true;
    //     case TILE_MONSTER_3:
    //         return true;
    //     case TILE_MONSTER_4:
    //         return true;
    //     case TILE_MONSTER_START:
    //         return true;
    //     case TILE_TOWER_1:
    //         return true;
    //     case TILE_TOWER_2:
    //         return true;
    //     default:
    //         return false;
    // }
    return tileType > 4;
    // return false;
}

function isWallAtPixelPosition(pixelX, pixelY) {
    var tilePos = pixelToGrid(pixelX, pixelY);

    // first check whether the ball is within any part of the wall
    if(tilePos.col < 0 || tilePos.col >= TILE_COLS ||
        tilePos.row < 0 || tilePos.row >= TILE_ROWS) {
        return 1; // treat out of bounds as solid
    }

    return tiles[tilePos.row][tilePos.col].type;
}

function isInCanvas(tile) {
    if(tile.row >= 0 && tile.row < TILE_ROWS && tile.col >= 0 && tile.col < TILE_COLS) {
        return true;
    } else {
        return false;
    }
}

function collisionHandling(tower) {
    // tile collision
    // true if tower can continue moving

    var gridPos = pixelToGrid(tower.x, tower.y);
    if(gridPos.col >= 0 && gridPos.row >= 0 && gridPos.col < TILE_COLS && gridPos.row < TILE_ROWS) {
        var tileType = tiles[gridPos.row][gridPos.col].type;
        switch(tileType) {
            case TILE_GOAL:
                // this player has won!
                gameWon = true;
                winner = tower.name;
                return true;
            case TILE_KEY:
                tower.keys++;
                tiles[gridPos.row][gridPos.col].type = TILE_GROUND;
                return true;
            case TILE_WALL:
                return false;
            case TILE_GOAL:
                return false;
            case TILE_DOOR:
                if(tower.keys > 0) {
                    tower.keys--;
                    tiles[gridPos.row][gridPos.col].type = TILE_GROUND;
                    return true;
                } else {
                    return false;
                }
        }
    } else {
        // outside boundaries!
        // towerReset();
        return false;
    }
    return true;
}