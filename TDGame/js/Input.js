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
var dragObject = [null, null];

var KEY_NUM_OFFSET = 48; // 0 code is 0 + 48, 1 is 1 + 48, etc

var currCanvas;

/* order of drag & drop for tower:
    mousedown initiates the delay counter and creates a tower object in dragObject
    calculateMousePos waits for delay, adds object to tower list if it hasn't been, and updates position
    mouseup finalizes position (dragObject = null) and resets variables
*/

function calculateMousePos(evt) {
    var rect = canvas[currCanvas].getBoundingClientRect();
    var root = document.documentElement;
    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;
    if(isDown) {
        // delay allows clicking without dragging
        if(dragDelay > dragWait) {
            isDragging = true;
            if(dragObject[currCanvas]) {
                dragObject[currCanvas].x = mouseX;
                dragObject[currCanvas].y = mouseY;
                dragObject[currCanvas].visible = true;
            }
        } else {
            dragDelay++;
        }
    }

    if(StateController.state == STATE_PLAY) {
        // display tooltips for purchases
        var hoverTile = pixelToGrid(mouseX, mouseY);
        var tile = StateController.currLevel.tiles[currCanvas][hoverTile.row][hoverTile.col];
        if(typeIsTower(tile.type)) {
            var index = tile.type - TOWER_OFFSET_NUM;
            var text = towerNames[index] + ": " + towerCosts[index] + " (" + (index + 1) + ")";
        } else if(typeIsMonster(tile.type)) {
            var index = tile.type - MONSTER_OFFSET_NUM;
            var text = monsterNames[index] + ": " + monsterCosts[index] + " (shift + " + (index + 1) + ")";
        } else if(pixelIsWithinObject(mouseX, mouseY, infoPane)) {
            if(selection[currCanvas] != null) {
                // check if hovering over button!
                var found = false;
                for(var button = 0; button < infoPane.buttons.length; button++) {
                    if(pixelIsWithinObject(mouseX, mouseY, infoPane.buttons[button][currCanvas])) {
                        if(button == 0) {
                            // display button as tooltip
                            var tower = towerList[currCanvas][selection[currCanvas]];
                            var text;
                            if(tower.tier >= tier_costs.length - 1) {
                                text = "No more upgrades!";
                            } else {
                                text = "Cost: " + tier_costs[tower.tier + 1];
                            }
                            setTooltip(text, mouseX + 5, mouseY + 10, currCanvas);
                            found = true;
                        } // end of upgrade buttons
                    } // end of mouse within object
                } // end of for buttons
                if(!found) {
                    tooltip = null;
                }

            } else {
                selection[currCanvas] = null;
            } // end of if selection != null
        } else {
            tooltip = null;
        }

        if(index != undefined) {
            setTooltip(text, mouseX + 5, mouseY + 10, currCanvas);
        }
    }

    return {
        x: mouseX,
        y: mouseY
    }
}

function handleMouseDown(evt) {
    if(gameWon || gameLost) {
        restartGame(STATE_START, welcomeScreen);
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
                    clearInterval(timerId);
                    // fadeOut(STATE_SELECT, selectScreen, currCanvas);
                    fadeOut(STATE_PLAY, levelOne, PLAYER);
                    return;
                }
            }
            break;

        case STATE_SELECT:
            // clicking "Click to proceed"
            if(mouseX > CLICK_CONTINUE_IMAGE.x - CLICK_CONTINUE_IMAGE.img.width / 2 && mouseX < CLICK_CONTINUE_IMAGE.x + CLICK_CONTINUE_IMAGE.img.width / 2) {
                if(mouseY > CLICK_CONTINUE_IMAGE.y && mouseY < CLICK_CONTINUE_IMAGE.y + CLICK_CONTINUE_IMAGE.img.height) {
                    // clicked start!
                    clearInterval(timerId);
                    fadeOut(STATE_PLAY, levelOne, currCanvas);
                    return;
                }
            }

            // choosing a monster type to add
            var type = StateController.currLevel.tiles[currCanvas][tileClicked.row][tileClicked.col].type;
            if(type >= MONSTER_OFFSET_NUM && type <= MONSTER_OFFSET_NUM + NUM_MONSTERS) {
                monsterSelections[type]++;
            }
            break;

        case STATE_PLAY:
            if(currCanvas == PLAYER) { // tower
                if(!isDragging) {
                    if(pixelIsWithinObject(mouseX, mouseY, infoPane)) {
                        if(selection[currCanvas] != null) {
                            // check if clicked button!
                            for(var button = 0; button < infoPane.buttons.length; button++) {
                                if(pixelIsWithinObject(mouseX, mouseY, infoPane.buttons[button][currCanvas])) {
                                    // click the button!
                                    infoPane.buttons[button][currCanvas].click(button);
                                    break;
                                }
                            }

                        } else {
                            selection[currCanvas] = null;
                        }
                    } else {
                        // selected a tower to build
                        var tile = StateController.currLevel.tiles[currCanvas][tileClicked.row][tileClicked.col];
                        if(typeIsTower(tile.type)) {
                            if(player.gold < towerCosts[tile.type - TOWER_OFFSET_NUM]) {
                                queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
                            } else {
                                setDrag(tile.type, mouseX, mouseY);
                            }
                        } else if(tile.hasTower()) {
                            // selected a tower to view
                            if(selection[currCanvas] == tile.towerOnTile) {
                                selection[currCanvas] = null; // deselect
                            } else {
                                selection[currCanvas] = tile.towerOnTile;
                            }
                        } else {
                            selection[currCanvas] = null; // clicked on empty square: clear selection
                        }
                    }
                }
            } else { // send monster
                var tile = StateController.currLevel.tiles[currCanvas][tileClicked.row][tileClicked.col];
                
                if(tile.type >= MONSTER_OFFSET_NUM && tile.type <= MONSTER_OFFSET_NUM + NUM_MONSTERS) {
                    // sending a monster
                    if(player.gold < monsterCosts[tile.type - MONSTER_OFFSET_NUM]) {
                        queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
                    } else {
                        StateController.sendMonster(tile.type - MONSTER_OFFSET_NUM, ENEMY);
                    }
                } else if(tile.hasTower()) {
                    // selecting an opponent's tower
                    if(selection[currCanvas] == tile.towerOnTile) {
                        selection[currCanvas] = null; // deselect
                    } else {
                        selection[currCanvas] = tile.towerOnTile;
                    }
                } else {
                    selection[currCanvas] = null; // clicked on empty square: clear selection
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

    if(dragObject[currCanvas]) {
        // can you place that there?
        var tile = pixelToGrid(mouseX, mouseY);
        if(canPlaceTower(tile.row, tile.col, currCanvas)) {
            // place the tower!
            StateController.placeTower(dragObject[currCanvas].type - TOWER_OFFSET_NUM, currCanvas, tile);
        }

        dragObject[currCanvas] = null;
    }

    return;
}

function setDrag(towerType, x, y) {
    dragObject[currCanvas] = new DraggableClass(towerType, x, y, currCanvas, "tower");
    dragObject[currCanvas].range = towerRanges[towerType - TOWER_OFFSET_NUM];
    dragObject[currCanvas].visible = true;

    selection[currCanvas] = null; // clear selection
    isDown = true;
    isDragging = true;
}

function setupInput() {
    canvas[PLAYER].addEventListener('mousemove', function(evt) {
        // easy swapping: only listen on the canvas they're moused over
        // (that's the only one they can click)
        currCanvas = PLAYER;
	    var mouse = calculateMousePos(evt);
	    mouseX = mouse.x;
	    mouseY = mouse.y;
    });

    canvas[PLAYER].addEventListener('mousedown', function(evt) {
        handleMouseDown(evt);
    });

    canvas[PLAYER].addEventListener('mouseup', function(evt) {
        handleMouseUp(evt);
    });

    canvas[ENEMY].addEventListener('mousemove', function(evt) {
        currCanvas = ENEMY;
        var mouse = calculateMousePos(evt);
        mouseX = mouse.x;
        mouseY = mouse.y;
    });

    canvas[ENEMY].addEventListener('mousedown', function(evt) {
        handleMouseDown(evt);
    });

    canvas[ENEMY].addEventListener('mouseup', function(evt) {
        handleMouseUp(evt);
    });
    
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);

    initButtons();
}

// key presses
var shiftHeld = false;
var pressingNum = false;
function keySet(evt, setTo) {
    if(evt.keyCode == 16) {
        shiftHeld = setTo;
    } else if(evt.keyCode > KEY_NUM_OFFSET && evt.keyCode <= KEY_NUM_OFFSET + 8) {
        // tower/monster hotkey!
        if((shiftHeld || !pressingNum) && setTo) {
            // allow multiple presses before release (press & hold monster)
            StateController.hotkey(evt.keyCode, shiftHeld, currCanvas);
        }   
        pressingNum = setTo;
    }
}

function keyPressed(evt) {
    if(gameWon) {
        return;
    }

    if(evt.keyCode == 27) {
        // escape: cancel tower placement
        pressEscape();
    } else {
        keySet(evt, true);
    } 
}

function keyReleased(evt) {
    keySet(evt, false);
}

function pressEscape() {
    if(dragObject[currCanvas]) {
        dragObject[currCanvas] = null;
    }
}
