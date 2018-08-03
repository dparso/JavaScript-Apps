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

// misc
var levelCounter = 0;

var welcomeScreen = new LevelClass(LEVEL_START, [], function() {
    drawRect(0, 0, canvas.width, canvas.height, 'black', PLAYER);
    var img = tilePics[TEXT_START];
    ctx[PLAYER].drawImage(START_IMAGE.img, START_IMAGE.x - START_IMAGE.img.width / 2, START_IMAGE.y);
    textDraw(PLAYER);
});

var selectScreen = new LevelClass(LEVEL_SELECT, [selectScreenGrid, selectScreenGrid], function(context) {
    if(context == ENEMY) {
        drawRect(0, 0, canvas[context].width, canvas[context].height, 'black', context);
        return;
    }
    this.tilesDraw(context);
    textDraw(context);
    ctx[context].drawImage(CLICK_CONTINUE_IMAGE.img, CLICK_CONTINUE_IMAGE.x - CLICK_CONTINUE_IMAGE.img.width / 2, CLICK_CONTINUE_IMAGE.y);
});

var levelOne = new LevelClass(LEVEL_TRACK, [levelOneGrid_player, levelOneGrid_enemy], function(context) {
    this.tilesDraw(context);
    textDraw(context);

    for(id in monsterList[context]) {
      monsterList[context][id].draw();
    }

    for(id in towerList[context]) {
      towerList[context][id].draw();
    }

    for(id in projectileList[context]) {
      projectileList[context][id].draw();
    }

    // drag object
    if(dragObject[context]) {
        dragObject[context].draw();
        var objectTile = pixelToGrid(dragObject[context].x, dragObject[context].y);

        // highlight the tile it'll be placed on
        highlightTile(objectTile.row, objectTile.col, 'white', 0.4, context);

        if(dragObject[context].classType == "tower") {
            // highlight tiles in range
            for(var row = objectTile.row - dragObject[context].range; row <= objectTile.row + dragObject[context].range; row++) {
                for(var col = objectTile.col - dragObject[context].range; col <= objectTile.col + dragObject[context].range; col++) {
                    if(gridInRange(row, col)) { // in bounds
                        var tile = StateController.currLevel.tiles[context][row][col];
                        if(tile.type != TILE_WALL || tile.hasTower()) {
                            // color red
                            highlightTile(row, col, 'red', 0.5, context);                      
                        } else {
                            highlightTile(row, col, 'white', 0.3, context);
                        }
                    }
                }
            }
        }
    }
});

function highlightTile(row, col, color, opacity, context) {
    var pixel = gridToPixel(row, col);
    ctx[context].globalAlpha = opacity;
    drawRect(pixel.x, pixel.y, TILE_W, TILE_H, color, context);
    ctx[context].globalAlpha = 1.0; // reset
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

function canPlaceTower(row, col, context) {
    var tile = StateController.currLevel.tiles[context][row][col];
    if(tile.type == TILE_WALL && !tile.hasTower()) {
        return true;
    }
    return false;
}

function initButtons() {
    var img1 = tilePics[TEXT_START];
    var img2 = tilePics[TEXT_CLICK_CONTINUE];
    START_IMAGE = new ButtonClass(img1, canvas[PLAYER].width / 2, 3 * canvas[PLAYER].height / 10);
    CLICK_CONTINUE_IMAGE = new ButtonClass(img2, canvas[PLAYER].width / 2, 3 * canvas[PLAYER].height / 10);
}
