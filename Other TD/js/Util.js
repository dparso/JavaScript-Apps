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

// levels
var welcomeScreen = new LevelClass(LEVEL_START, [], function() {

});

var selectScreen = new LevelClass(LEVEL_SELECT, selectScreenGrid, function(level) {
    this.tilesDraw();
    textDraw();
    ctx.drawImage(CLICK_CONTINUE_IMAGE.img, CLICK_CONTINUE_IMAGE.x - CLICK_CONTINUE_IMAGE.img.width / 2, CLICK_CONTINUE_IMAGE.y);
});

var levelOne = new LevelClass(LEVEL_TRACK, levelOneGrid_player, function(level) {
    drawGridLevel(level);
});

var levelTwo = new LevelClass(LEVEL_TRACK, levelTwoGrid_player, function(level) {
    drawGridLevel(level);
});

var levelThree = new LevelClass(LEVEL_TRACK, levelThreeGrid_player, function(level) {
    drawGridLevel(level);
});

var levelFour = new LevelClass(LEVEL_TRACK, levelFourGrid_player, function(level) {
    drawGridLevel(level);
});

var levelFive = new LevelClass(LEVEL_TRACK, levelFiveGrid_player, function(level) {
    drawGridLevel(level);
});

var levelSix = new LevelClass(LEVEL_TRACK, levelSixGrid_player, function(level) {
    drawGridLevel(level);
});

const LEVELS = [levelOne, levelTwo, levelThree, levelFour, levelFive, levelSix];

// generalized function for drawing a playable level
function drawGridLevel(level) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(var owner = PLAYER; owner <= ENEMY; owner++) {
        for(id in projectileList[owner]) {
            projectileList[owner][id].draw();
        }

        for(id in monsterList[owner]) {
            monsterList[owner][id].draw();
        }

        let solar_prince, reaper;
        for(id in towerList[owner]) {
            var twr = towerList[owner][id];
            if(twr.type === SOLAR_PRINCE) {
                solar_prince = twr;
            } else if(twr.type === REAPER) {
                reaper = twr;
            } else {
                towerList[owner][id].draw();
            }
        }
        // don't draw any other towers over these!
        if(reaper) {
            reaper.draw();
        }
        if(solar_prince) {
            solar_prince.draw();
        }
    }

    // drag object
    if(dragObject) {
        dragObject.draw();
        if(dragObject.visible) {
            var objectTile = pixelToGrid(dragObject.x, dragObject.y);

            // highlight the tile it'll be placed on
            highlightTile(objectTile.row, objectTile.col, 'white', 0.4);

            if(dragObject.classType === "tower") {
                // highlight tiles in range
                for(var row = objectTile.row - dragObject.range; row <= objectTile.row + dragObject.range; row++) {
                    for(var col = objectTile.col - dragObject.range; col <= objectTile.col + dragObject.range; col++) {
                        if(gridInRange(row, col)) { // in bounds
                            var tile = StateController.currLevel.tiles[row][col];
                            if(!canPlaceTower(row, col)) {
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
    }

    textDraw();
}

function monsterCanWalk(row, col) {
    let tile = StateController.currLevel.tiles[row][col];
    if(!tile.hasTower() && (tile.type == TILE_PATH || tile.type == TILE_MONSTER_START || tile.type == TILE_MONSTER_END)) {
        return true;
    }
    return false;
}

function highlightTile(row, col, color, opacity) {
    var pixel = gridToPixel(row, col);
    ctx.globalAlpha = opacity;
    drawRect(pixel.x, pixel.y, TILE_W, TILE_H, color);
    ctx.globalAlpha = 1.0; // reset
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
    if((tile.type === TILE_WALL || tile.type == TILE_PATH) && !tile.hasTower()) {
        return true;
    }
    return false;
}

function otherPlayer(person) {
    return Math.abs(person - 1); // 1 - 1 --> 0, 0 - 1 --> 1
}

function typeIsTower(type) {
    return type >= TOWER_OFFSET_NUM && type <= TOWER_OFFSET_NUM + NUM_TOWERS;
}

function typeIsMonster(type) {
    return type >= MONSTER_OFFSET_NUM && type <= MONSTER_OFFSET_NUM + NUM_MONSTERS;
}

// given an object with properties x, y, width, and height, return whether a position (x, y) is within that range
function pixelIsWithinObject(x, y, object) {
    return x >= object.x && x <= object.x + object.width && y >= object.y && y <= object.y + object.height;
}

function trueAngleBetweenPoints(base, point) {
    var dX = base.x - point.x;
    var dY = base.y - point.y;

    var rad = Math.atan2(dY, dX);
    var degrees = rad * (180 / Math.PI);

    if (dX < 0 && dY > 0) { 
        //quadrant 1
        degrees = 180 - degrees;
    } else if(dX > 0 && dY > 0) {
        // quadrant 2
        degrees = 180 - degrees;
    } else if(dX > 0 && dY <= 0) {
        // quadrant 3
        degrees = -(degrees - 180);
    } else {
        // quadrant 4
        degrees = -(degrees - 180)
    }
    return degrees;
}

function trueAngleFromRad(rad) {
    var dX = base.x - point.x;
    var dY = base.y - point.y;

    var rad = Math.atan2(dY, dX);
    var degrees = rad * (180 / Math.PI);

    if (dX < 0 && dY > 0) { 
        //quadrant 1
        degrees = 180 - degrees;
    } else if(dX > 0 && dY > 0) {
        // quadrant 2
        degrees = 180 - degrees;
    } else if(dX > 0 && dY <= 0) {
        // quadrant 3
        degrees = -(degrees - 180);
    } else {
        // quadrant 4
        degrees = -(degrees - 180)
    }
    return degrees;
}