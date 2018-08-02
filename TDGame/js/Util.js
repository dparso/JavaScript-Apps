// game states
const STATE_START = 0; // start menu
const STATE_PLAY = 1; // playing game normally
const STATE_SELECT = 2; // selecting monsters for next round
const STATE_VICTORY = 3; // game won

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

// text images
const TEXT_START = 40;
const TEXT_CLICK_CONTINUE = 41;
var START_IMAGE;
var CLICK_CONTINUE_IMAGE;

// sizes
var TILE_W = 40;
var TILE_H = 40;
const TILE_PADDING = 1;
const TILE_ROWS = 15;
const TILE_COLS = 20;

// misc
var levelCounter = 0;

var selectScreenGrid =
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

var levelOneGrid =
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

var welcomeScreen = new LevelClass(LEVEL_START, [], function() {
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    var img = tilePics[TEXT_START];
    canvasContext.drawImage(START_IMAGE.img, START_IMAGE.x, START_IMAGE.y);
    textDraw();
});

var selectScreen = new LevelClass(LEVEL_SELECT, selectScreenGrid, function() {
    this.tilesDraw();
    textDraw();
    canvasContext.drawImage(CLICK_CONTINUE_IMAGE.img, CLICK_CONTINUE_IMAGE.x, CLICK_CONTINUE_IMAGE.y);
});

var levelOne = new LevelClass(LEVEL_TRACK, levelOneGrid, function() {
    this.tilesDraw();
    textDraw();

    for(id in monsterList) {
      monsterList[id].draw();
    }

    for(id in towerList) {
      towerList[id].draw();
    }

    for(id in projectileList) {
      projectileList[id].draw();
    }

    // drag object
    if(dragObject) {
        dragObject.draw();
    }
});


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
    var type = StateController.currLevel.tiles[row][col].type;
    if(type == TILE_WALL) {
        return true;
    }
    return false;
}

function initButtons() {
    var img1 = tilePics[TEXT_START];
    var img2 = tilePics[TEXT_CLICK_CONTINUE];
    console.log(img2);
    console.log("mid " + canvas.width / 2 + ", " + img2.width);
    START_IMAGE = new ButtonClass(img1, (canvas.width - img1.width) / 2, 3 * canvas.height / 10);
    CLICK_CONTINUE_IMAGE = new ButtonClass(img2, (canvas.width - img2.width) / 2, 3 * canvas.height / 10);
}
