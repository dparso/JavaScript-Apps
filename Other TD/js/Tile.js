function TileClass(position, type, img, transparent) {
    this.row = position.row;
    this.col = position.col;
    this.type = type;
    this.img = img;
    this.transparent = transparent;

    // BFS variables
    this.visited = false;
    this.parent = null;

    this.monstersOnTile = {}; // monster IDs
    this.towerOnTile = -1;

    this.getMonsters = function() {
        return this.monstersOnTile;
    }

    this.hasTower = function() {
        return this.towerOnTile !== -1;
    }

    this.notifyTowerPlaced = function(towerID) {
        this.towerOnTile = towerID;
    }

    this.notifyTowerRemoved = function() {
        this.towerOnTile = -1;
    }

    this.hasMonsters = function () {
        return Object.keys(this.monstersOnTile).length > 0;
    }

    this.notifyMonsterArrive = function(monsterID) {
        // monster is an id, not a monster object
        this.monstersOnTile[monsterID] = monsterID;
    }

    this.notifyMonsterDepart = function(monsterID) {
        delete this.monstersOnTile[monsterID];
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
    return tileType >= 3;
    // return false;
}

function isWallAtPixelPosition(pixelX, pixelY) {
    var tilePos = pixelToGrid(pixelX, pixelY);

    // first check whether the ball is within any part of the wall
    if(tilePos.col < 0 || tilePos.col >= TILE_COLS ||
        tilePos.row < 0 || tilePos.row >= TILE_ROWS) {
        return 1; // treat out of bounds as solid
    }

    return StateController.currLevel.tiles[tilePos.row][tilePos.col].type;
}

function isInCanvas(tile) {
    if(tile.row >= 0 && tile.row < TILE_ROWS && tile.col >= 0 && tile.col < TILE_COLS) {
        return true;
    } else {
        return false;
    }
}

function collisionHandling(object) {
    // tile collision
    // true if object can continue moving

    var gridPos = pixelToGrid(object.x, object.y);
    if(gridPos.col >= 0 && gridPos.row >= 0 && gridPos.col < TILE_COLS && gridPos.row < TILE_ROWS) {
        var tileType = StateController.currLevel.tiles[gridPos.row][gridPos.col].type;
        switch(tileType) {
            case TILE_OBSTACLE:
                return false;
            case TILE_WALL:
                return false;
            case TILE_PATH:
                return true;
            default:
                return true;

        }
    } else {
        // outside boundaries!
        // objectReset();
        return false;
    }
    return true;
}