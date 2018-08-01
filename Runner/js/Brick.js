const BRICK_W = 40;
const BRICK_H = 40;
const BRICK_GAP = 1;
const BRICK_COLS = 25;
const BRICK_ROWS = 15;

var brickGrid =
   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

function brickPixelToIndex(pixelX, pixelY) {
    return brickTileToIndex(pixelX / BRICK_W, pixelY / BRICK_H);
}
function brickTileToIndex(tileCol, tileRow) {
    return (tileCol + BRICK_COLS*tileRow);
}

function gridInRange(col, row) {
    return col >= 0 && col < BRICK_COLS && row >= 0 & row < BRICK_ROWS;
}

function isBrickAtTileCoord(brickTileCol, brickTileRow) {
    return brickGrid[brickTileToIndex(brickTileCol % BRICK_COLS, brickTileRow % BRICK_ROWS)] == 1;
}

function isBrickAtPixelCoord(hitPixelX, hitPixelY) {
    var tileCol = Math.floor((hitPixelX) / BRICK_W);
    var tileRow = Math.floor((hitPixelY) / BRICK_H);

    // first check whether the slider is within any part of the brick wall
    return isBrickAtTileCoord(tileCol, tileRow);
}

function Column(data, startX, index) {
    this.col = data;
    this.x = startX;
    this.index = index;

    this.draw = function() {
        for(var row = 0; row < this.col.length; row++) {
            if(row == 11) {
                // console.log(this.col[row]);
            }
            if(this.col[row] == 1) {
                colorRect(this.x, row * BRICK_H, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'blue');
            }
        }
    }
}

function Queue() {
    this.data = []; // most recently pushed is at the END

    this.push = function(data) {
        this.data.push(data);
    }

    this.pop = function() {
        return this.data.shift();
    }

    this.empty = function() {
        return this.data.length == 0;
    }
}