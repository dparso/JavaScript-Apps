

var levelOne = [[4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4],
                 [4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                 [4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                 [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
                 [1, 0, 0, 0, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 0, 0, 1],
                 [1, 0, 0, 1, 1, 0, 0, 1, 4, 4, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                 [1, 0, 0, 1, 0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                 [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 5, 0, 0, 1, 0, 0, 1],
                 [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                 [1, 0, 0, 1, 0, 0, 5, 0, 0, 0, 5, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                 [1, 2, 2, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 1],
                 [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                 [0, 3, 0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
                 [0, 3, 0, 0, 0, 0, 1, 4, 4, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
                 [1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 4]];
var tracks;

// grid key
const TRACK_ROAD = 0;
const TRACK_WALL = 1;
const TRACK_START = 2;
const TRACK_GOAL = 3;
const TRACK_TREE = 4;
const TRACK_FLAG = 5;

// sizes
var TRACK_W = 40;
var TRACK_H = 40;
const TRACK_PADDING = 2;
const TRACK_ROWS = 15;
const TRACK_COLS = 20;

function tracksDraw() {
    var drawTileX = 0;
    var drawTileY = 0;
    for(var row = 0; row < TRACK_ROWS; row++) {
        drawTileX = 0;
        for(var col = 0; col < TRACK_COLS; col++) {
            var useImg = trackPics[tracks[row][col]];
            canvasContext.drawImage(useImg, drawTileX, drawTileY);
            drawTileX += TRACK_W;
        }
        drawTileY += TRACK_H;
    }
}

function randomizeMap() {
    tracks = new Array(TRACK_ROWS);
    for (var i = tracks.length - 1; i >= 0; i--) {
        tracks[i] = new Array(TRACK_COLS);
    }
    // console.log()
    TRACK_W = canvas.width / TRACK_COLS;
    TRACK_H = canvas.height / TRACK_ROWS;
    // console.log(TRACK_W + ", " + TRACK_H);

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
        start1.row = TRACK_ROWS - 2;
        start2.row = TRACK_ROWS - 2;
        yDirection = -1;
    } else {
        // bottom
        start1.row = 1;
        start2.row = 1;
        yDirection = 1;
    }

    if(leftOrRight) {
        // right
        start1.col = TRACK_COLS - 2;
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
    for(var row = 0; row < TRACK_ROWS; row++) {
        for(var col = 0; col < TRACK_COLS; col++) {
            tracks[row][col] = TRACK_TREE; // mark as not set yet
        }
    }

    var done = false;
    var currTile = {row: start1.row, col: start1.col};

    // while(!done) {
    //     if(currTile.x)

    //     done = true;
    // }


    // for(var row = 0; row < TRACK_ROWS; row++) {
    //     for(var col = 0; col < TRACK_COLS; col++) {
    //         if(!row || !col || row == TRACK_ROWS - 1 || col == TRACK_COLS - 1) {
    //             var rand = Math.random();
    //             if(rand < 0.7) {
    //                 tracks[row][col] = TRACK_WALL;
    //             } else if(rand < 0.85) {
    //                 tracks[row][col] = TRACK_TREE;
    //             } else {
    //                 tracks[row][col] = TRACK_FLAG;
    //             }
    //         }
    //     }
    // }
    tracks[start1.row][start1.col] = TRACK_START;
    tracks[start2.row][start2.col] = TRACK_START;
}

function isInCanvas(tile) {
    if(tile.row >= 0 && tile.row < TRACK_ROWS && tile.col >= 0 && tile.col < TRACK_COLS) {
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
            if(r < TRACK_ROWS - 1 && r > 0 && c < TRACK_COLS - 1 && c > 0) {
                tracks[r][c] = TRACK_ROAD;
            }
        }
    }
}

function collisionHandling(car) {
    // track collision

    // base checking off of future position -- BEFORE you get into a block (prevents burrowing)
    // can also do this with (before updating speed):
    // carX -= Math.cos(carAng) * this.speed;
    // carY -= Math.sin(carAng) * this.speed;

    var xNewPos = car.x + Math.cos(car.angle) * car.speed;
    var yNewPos = car.y + Math.sin(car.angle) * car.speed;

    var gridPos = posToGrid(xNewPos, yNewPos);
    if(gridPos.col >= 0 && gridPos.row >= 0 && gridPos.col < TRACK_COLS && gridPos.row < TRACK_ROWS) {
        if(tracks[gridPos.row][gridPos.col] != TRACK_ROAD) {
            if(tracks[gridPos.row][gridPos.col] == TRACK_GOAL) {
                // this player has won!
                gameWon = true;
                winner = car.name;
            } else {
                // collision has occurred
                car.speed *= -0.5;
            }
        }
    } else {
        // outside boundaries!
        // carReset();
    }
}