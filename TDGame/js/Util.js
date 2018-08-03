// game states
const STATE_START = 0; // start menu
const STATE_PLAY = 1; // playing game normally
const STATE_SELECT = 2; // selecting monsters for next round
const STATE_VICTORY = 3; // game won

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

var welcomeScreen = new LevelClass(LEVEL_START, [], function() {
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    var img = tilePics[TEXT_START];
    canvasContext.drawImage(START_IMAGE.img, START_IMAGE.x - START_IMAGE.img.width / 2, START_IMAGE.y);
    textDraw();
});

var selectScreen = new LevelClass(LEVEL_SELECT, selectScreenGrid, function() {
    this.tilesDraw();
    textDraw();
    canvasContext.drawImage(CLICK_CONTINUE_IMAGE.img, CLICK_CONTINUE_IMAGE.x - CLICK_CONTINUE_IMAGE.img.width / 2, CLICK_CONTINUE_IMAGE.y);
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
        var objectTile = pixelToGrid(dragObject.x, dragObject.y);

        // highlight the tile it'll be placed on
        highlightTile(objectTile.row, objectTile.col, 'white', 0.4);

        if(dragObject.classType == "tower") {
            // highlight tiles in range
            for(var row = objectTile.row - dragObject.range; row <= objectTile.row + dragObject.range; row++) {
                for(var col = objectTile.col - dragObject.range; col <= objectTile.col + dragObject.range; col++) {
                    if(gridInRange(row, col)) { // in bounds
                        var tile = StateController.currLevel.tiles[row][col];
                        if(tile.type != TILE_WALL || tile.hasTower()) {
                            // color red
                            highlightTile(row, col, 'red', 0.5);                      
                        } else {
                            highlightTile(row, col, 'white', 0.3);
                        }
                    }
                }
            }
        }
    }
});

function highlightTile(row, col, color, opacity) {
    var pixel = gridToPixel(row, col);
    canvasContext.globalAlpha = opacity;
    drawRect(pixel.x, pixel.y, TILE_W, TILE_H, color);
    canvasContext.globalAlpha = 1.0; // reset
}

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
    var tile = StateController.currLevel.tiles[row][col];
    if(tile.type == TILE_WALL && !tile.hasTower()) {
        return true;
    }
    return false;
}

function initButtons() {
    var img1 = tilePics[TEXT_START];
    var img2 = tilePics[TEXT_CLICK_CONTINUE];
    START_IMAGE = new ButtonClass(img1, canvas.width / 2, 3 * canvas.height / 10);
    CLICK_CONTINUE_IMAGE = new ButtonClass(img2, canvas.width / 2, 3 * canvas.height / 10);
}
