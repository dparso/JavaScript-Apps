// game states
const STATE_PLAY = 0; // playing game normally
const STATE_SELECT = 1; // selecting monsters for next round
const STATE_VICTORY = 2; // game won

// grid key
const TILE_GROUND = 0;
const TILE_WALL = 1;
const TILE_DOOR = 2; // no longer exists
const TILE_TREE = 3;
const TILE_MONSTER_START = 4;
const TILE_MONSTER_END = 5;
// monsters
const MONSTER_OFFSET_NUM = 6;
const TILE_MONSTER_1 = 6;
const TILE_MONSTER_2 = 7;
const TILE_MONSTER_3 = 8;
const TILE_MONSTER_4 = 9;
const NUM_MONSTERS = 4;

var MONSTER_START; // useful to have a level-by-level class with this information
var MONSTER_END;

// towers
const TOWER_OFFSET_NUM = 10;
const TILE_TOWER_1 = 10;
const TILE_TOWER_2 = 11;
const a = TILE_TOWER_1; // these allow for single-character representation in the bitmap for better drawing
const b = TILE_TOWER_2;

// sizes
var TILE_W = 40;
var TILE_H = 40;
const TILE_PADDING = 1;
const TILE_ROWS = 15;
const TILE_COLS = 20;

var selectScreen =
   [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

var levelOne =
   [[3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, a, 0],
    [1, 0, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, b, 0],
    [1, 0, 3, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 3, 3],
    [1, 4, 1, 0, 0, 1, 1, 1, 3, 3, 0, 1, 0, 1, 0, 1, 0, 1, 3, 3],
    [1, 1, 1, 1, 0, 1, 1, 1, 3, 3, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 5, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3]];

var tiles;

function pixelToGrid(xPos, yPos) {
    // return coordinates corresponding to which tile the mouse is over
    var gridX, gridY;

    gridX = Math.floor(xPos / TILE_W);
    gridY = Math.floor(yPos / TILE_H);

    return {col: gridX, row: gridY};
}

function gridToPixel(row, col) {
    return {x: col * TILE_W, y: row * TILE_H};
}

function gridInRange(row, col) {
    return row < TILE_ROWS && row >= 0 && col < TILE_COLS && col >= 0;
}

function canPlaceTower(row, col) {
    var type = tiles[row][col].type;
    if(type == TILE_WALL) {
        return true;
    }
    return false;
}
