

var levelOne =  [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 4, 0, 1, 1, 1, 1],
                 [1, 0, 3, 0, 3, 0, 1, 0, 5, 0, 1, 0, 1, 3, 3, 1],
                 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 4, 1, 4, 1, 1],
                 [1, 1, 1, 4, 1, 1, 1, 0, 3, 0, 1, 0, 0, 0, 1, 1],
                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 1, 1],
                 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1],
                 [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0, 1, 1],
                 [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
                 [1, 0, 4, 0, 4, 0, 4, 0, 2, 0, 1, 1, 1, 1, 1, 1],
                 [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                 [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
var tracks;

// grid key
const TILE_GROUND = 0;
const TILE_WALL = 1;
const TILE_GOAL = 2;
const TILE_KEY = 3;
const TILE_DOOR = 4;
const TILE_START = 5;

// sizes
var TILE_W = 50;
var TILE_H = 50;
const TILE_PADDING = 2;
const TILE_ROWS = 12;
const TILE_COLS = 16;

function tracksDraw() {
    var drawTileX = 0;
    var drawTileY = 0;
    for(var row = 0; row < TILE_ROWS; row++) {
        drawTileX = 0;
        for(var col = 0; col < TILE_COLS; col++) {
            var useImg = trackPics[tracks[row][col]];
            if(tileTypeHasTransparency(tracks[row][col])) {
                canvasContext.drawImage(trackPics[TILE_GROUND], drawTileX, drawTileY);
            }
            canvasContext.drawImage(useImg, drawTileX, drawTileY);
            drawTileX += TILE_W;
        }
        drawTileY += TILE_H;
    }
}

function tileTypeHasTransparency(tileType) {
    switch(tileType) {
        case TILE_DOOR:
            return true;
        case TILE_GOAL:
            return true;

        case TILE_KEY:
            return true;
        default:
            return false;
    }
}

function randomizeMap() {
    tracks = new Array(TILE_ROWS);
    for (var i = tracks.length - 1; i >= 0; i--) {
        tracks[i] = new Array(TILE_COLS);
    }
    // console.log()
    TILE_W = canvas.width / TILE_COLS;
    TILE_H = canvas.height / TILE_ROWS;
    // console.log(TILE_W + ", " + TILE_H);

    /*
        The idea:
            Choose a starting place, and pave road randomly forward
        Some guidelines:
            Always start somewhere on the edge (1 and 2 blocks away from an edge)
            Never move in a circle
    */

    var start1 = {row: -1, col: -1};
    var start2 = {row: -1, col: -1};

    // 0 bottom/left, 1 top/right
    var topOrBottom = Math.random() > 0.5 ? 1 : 0;
    var leftOrRight = Math.random() > 0.5 ? 1 : 0;
    var xDirection, yDirection; // start top means move down to start

    if(topOrBottom) {
        // top
        start1.row = TILE_ROWS - 2;
        start2.row = TILE_ROWS - 2;
        yDirection = -1;
    } else {
        // bottom
        start1.row = 1;
        start2.row = 1;
        yDirection = 1;
    }

    if(leftOrRight) {
        // right
        start1.col = TILE_COLS - 2;
        start2.col = start1.col - 1;  
        xDirection = -1;     
    } else {
        // left
        start1.col = 2;
        start2.col = start1.col + 1;
        xDirection = 1;
    }

    start1.row = 2;
    start1.col = 2;
    start2.row = 2;
    start2.col = 3;

    markNearby(start1.row, start1.col, 2);

    // as you're traveling forward, shoot a ray in front to test how close the nearest road is
    // don't put road too close to itself


    // preset values
    for(var row = 0; row < TILE_ROWS; row++) {
        for(var col = 0; col < TILE_COLS; col++) {
            tracks[row][col] = TILE_GROUND; // mark as not set yet
        }
    }

    var done = false;
    var currTile = {row: start1.row, col: start1.col};

    // while(!done) {
    //     if(currTile.x)

    //     done = true;
    // }


    // for(var row = 0; row < TILE_ROWS; row++) {
    //     for(var col = 0; col < TILE_COLS; col++) {
    //         if(!row || !col || row == TILE_ROWS - 1 || col == TILE_COLS - 1) {
    //             var rand = Math.random();
    //             if(rand < 0.7) {
    //                 tracks[row][col] = TILE_WALL;
    //             } else if(rand < 0.85) {
    //                 tracks[row][col] = TILE_TREE;
    //             } else {
    //                 tracks[row][col] = TILE_FLAG;
    //             }
    //         }
    //     }
    // }
    tracks[start1.row][start1.col] = TILE_START;
    tracks[start2.row][start2.col] = TILE_START;
}

function isInCanvas(tile) {
    if(tile.row >= 0 && tile.row < TILE_ROWS && tile.col >= 0 && tile.col < TILE_COLS) {
        return true;
    } else {
        return false;
    }
}

function markNearby(row, col, width) {
    // set to road the square tiles 'width' away from (row, col)
    // mark a square: start is (row - width, col - width), top is (row + width, col + width)
    // might want to make more of a diamond shape in the future
    for(var r = row - width; r < row + width; r++) {
        for(var c = col - width; c < col + width; c++) {
            if(r < TILE_ROWS - 1 && r > 0 && c < TILE_COLS - 1 && c > 0) {
                tracks[r][c] = TILE_GROUND;
            }
        }
    }
}

function collisionHandling(warrior) {
    // track collision
    // true if warrior can continue moving

    var gridPos = posToGrid(warrior.x, warrior.y);
    if(gridPos.col >= 0 && gridPos.row >= 0 && gridPos.col < TILE_COLS && gridPos.row < TILE_ROWS) {
        var tileType = tracks[gridPos.row][gridPos.col];
        switch(tileType) {
            case TILE_GOAL:
                // this player has won!
                gameWon = true;
                winner = warrior.name;
                return true;
            case TILE_KEY:
                warrior.keys++;
                tracks[gridPos.row][gridPos.col] = TILE_GROUND;
                return true;
            case TILE_WALL:
                return false;
            case TILE_GOAL:
                return false;
            case TILE_DOOR:
                if(warrior.keys > 0) {
                    warrior.keys--;
                    tracks[gridPos.row][gridPos.col] = TILE_GROUND;
                    return true;
                } else {
                    return false;
                }
        }
        // if(tracks[gridPos.row][gridPos.col] != TILE_GROUND) {
        //     if(tracks[gridPos.row][gridPos.col] == TILE_GOAL) {

        //     } else {
        //         // collision has occurred
        //         return false;
        //     }
        // }
    } else {
        // outside boundaries!
        // warriorReset();
        return false;
    }
    return true;
}