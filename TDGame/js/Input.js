var mouseX, mouseY;

// directions
const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;

const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;

var isDown = false;
var isDragging = false; // maybe not necessary, implied by isDown + dragDelay?
var dragDelay = 0;
var dragWait = 10;
var dragObject;

/* order of drag & drop for tower:
    mousedown initiates the delay counter and creates a tower object in dragObject
    calculateMousePos waits for delay, adds object to tower list if it hasn't been, and updates position
    mouseup finalizes position (dragObject = null) and resets variables
*/

function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;
    if(isDown) {
        // delay allows clicking without dragging
        if(dragDelay > dragWait) {
            isDragging = true;

            if(dragObject) {
                dragObject.x = mouseX;
                dragObject.y = mouseY;
                dragObject.visible = true;
            }
        } else {
            dragDelay++;
        }
    }

    return {
        x: mouseX,
        y: mouseY
    }
}

function handleMouseDown(evt) {
    if(gameWon || gameLost) {
        restartGame();
        return;
    }

    var mouse = calculateMousePos(evt);
    mouseX = mouse.x;
    mouseY = mouse.y;
    isDown = true;

    var tileClicked = pixelToGrid(mouse.x, mouse.y);

    switch(StateController.state) {
        case STATE_START:
            // only registering clicks on the menu options
            if(mouseX > START_IMAGE.x - START_IMAGE.img.width / 2 && mouseX < START_IMAGE.x + START_IMAGE.img.width / 2) {
                if(mouseY > START_IMAGE.y && mouseY < START_IMAGE.y + START_IMAGE.img.height) {
                    // clicked start!
                    fadeOut(STATE_SELECT, selectScreen);
                    clearInterval(timerId);
                    return;
                }
            }
            break;

        case STATE_SELECT:
            // clicking "Click to proceed"
            if(mouseX > CLICK_CONTINUE_IMAGE.x - CLICK_CONTINUE_IMAGE.img.width / 2 && mouseX < CLICK_CONTINUE_IMAGE.x + CLICK_CONTINUE_IMAGE.img.width / 2) {
                if(mouseY > CLICK_CONTINUE_IMAGE.y && mouseY < CLICK_CONTINUE_IMAGE.y + CLICK_CONTINUE_IMAGE.img.height) {
                    // clicked start!
                    fadeOut(STATE_PLAY, levelOne);
                    clearInterval(timerId);
                    return;
                }
            }

            // choosing a monster type to add
            var type = StateController.currLevel.tiles[tileClicked.row][tileClicked.col].type;
            if(type >= MONSTER_OFFSET_NUM && type <= MONSTER_OFFSET_NUM + NUM_MONSTERS) {
                monsterSelections[type]++;
            }
            break;

        case STATE_PLAY:
            if(!isDragging) {
                var tile = StateController.currLevel.tiles[tileClicked.row][tileClicked.col];
                if(tile.type == TILE_TOWER_1 || tile.type == TILE_TOWER_2) {
                    if(player.gold < towerCosts[tile.type - TOWER_OFFSET_NUM]) {
                        queueErrorMessage("Insufficient gold!");
                    } else {
                        dragObject = new TowerClass(tilePics[tile.type], tile.type - TOWER_OFFSET_NUM);
                        dragObject.x = mouseX;
                        dragObject.y = mouseY;
                    }
                } else if(tile.hasTower()) {
                    // selected a tower
                    if(selection == tile.towerOnTile) {
                        selection = null; // deselect
                    } else {
                        selection = tile.towerOnTile;
                    }
                }
            }
            break;
    }
}

function handleMouseUp(evt) {
    var mouse = calculateMousePos(evt);
    mouseX = mouse.x;
    mouseY = mouse.y;

    dragDelay = 0;
    isDragging = false;
    isDown = false;

    if(dragObject) {
        // can you place that there?
        var tile = pixelToGrid(mouseX, mouseY);
        if(canPlaceTower(tile.row, tile.col)) {
            // snap the object to the center of the grid
            dragObject.x = tile.col * TILE_W + TILE_W / 2;
            dragObject.y = tile.row * TILE_H + TILE_H / 2; 
            dragObject.currTile = tile;
            dragObject.active = true; // tower can attack now
            towerList[dragObject.id] = dragObject;
            // notify tile
            StateController.currLevel.tiles[tile.row][tile.col].notifyTowerPlaced(dragObject.id);

            // player bought tower: pay for it
            player.loseGold(towerCosts[dragObject.type]);
        }

        dragObject = null;
    }

    return;
}

function setupInput() {
    canvas.addEventListener('mousemove', function(evt) {
	    var mouse = calculateMousePos(evt);
	    mouseX = mouse.x;
	    mouseY = mouse.y;
    });

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);

    initButtons();
}

function keySet(evt, setTo) {
    // switch(evt.keyCode) {
    //     case tower.controlKeyLeft:
    //         tower.keyHeld_TurnLeft = setTo;
    //         evt.preventDefault();
    //         break;
    //     case tower.controlKeyUp:
    //         tower.keyHeld_Gas = setTo;
    //         evt.preventDefault();
    //         break;
    //     case tower.controlKeyRight:
    //         tower.keyHeld_TurnRight = setTo;
    //         evt.preventDefault();
    //         break;
    //     case tower.controlKeyDown:
    //         tower.keyHeld_Reverse = setTo;
    //         evt.preventDefault();
    //         break;
    // }    
}

function keyPressed(evt) {
    if(gameWon) {
        return;
    }

    if(evt.keyCode == 27) {
        // escape: cancel tower placement
        pressEscape();
    }
    // keySet(evt, true);
}

function keyReleased(evt) {
    // keySet(evt, false);
}

function pressEscape() {
    if(dragObject) {
        dragObject = null;
    }
}
