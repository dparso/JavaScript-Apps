function TileClass(position, type, img, transparent) {
    this.row = position.row;
    this.col = position.col;
    this.type = type;
    this.img = img;
    this.transparent = transparent;

    // BFS variables
    this.visited = false;
    this.parent = null;

    this.monstersOnTile = new Set(); // monster IDs
    this.towersOnTile = new Set();

    this.getMonsters = function() {
        return this.monstersOnTile;
    }

    this.hasTowers = function() {
        return this.towersOnTile.size > 0;
    }

    this.hasMonsters = function () {
        return this.monstersOnTile.size > 0;
    }

    this.notifyMonsterArrive = function(monsterID) {
        // monster is an id, not a monster object
        this.monstersOnTile.add(monsterID);
    }

    this.notifyMonsterDepart = function(monsterID) {
        this.monstersOnTile.delete(monsterID);
    }
}

function tilesDraw() {
    var drawTileX = 0;
    var drawTileY = 0;
    for(var row = 0; row < TILE_ROWS; row++) {
        drawTileX = 0;
        for(var col = 0; col < TILE_COLS; col++) {
            var currTile = tiles[row][col];

            if(currTile.transparent) {
                canvasContext.drawImage(tilePics[TILE_GROUND], drawTileX, drawTileY);
            }

            if(currTile.type >= TOWER_OFFSET_NUM) {
                // draw with rotation
                drawBitmapCenteredWithRotation(currTile.img, drawTileX + currTile.img.width / 2, drawTileY + currTile.img.height / 2, 0);
            } else {
                canvasContext.drawImage(currTile.img, drawTileX, drawTileY);
            }
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
            case TILE_TREE:
                return false;
            case TILE_WALL:
                return false;
            case TILE_GROUND:
                return true;
            default:
                return true;

        }
    } else {
        // outside boundaries!
        // towerReset();
        return false;
    }
    return true;
}