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
var dragWait = 6;
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
            var text = towerNames[index] + ": " + towerCosts[index].toLocaleString() + " [" + (index + 1) + "]";
        } else if(typeIsMonster(tile.type)) {
            var index = tile.type - MONSTER_OFFSET_NUM;
            var text = monsterNames[index] + ": " + (monsterCosts[PLAYER][index]).toLocaleString() + " [shift + " + (index + 1) + "]";
        } else {
            tooltip = null;
        }

        if(index != undefined) {
            setTooltip(text, mouseX + 5, mouseY - 10, currCanvas);
        }
    }

    return {
        x: mouseX,
        y: mouseY
    }
}

function handleMouseDown(evt) {
    if(gameWon || gameLost) {
        nextLevel();
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
                    // selected a tower to build
                    var tile = StateController.currLevel.tiles[currCanvas][tileClicked.row][tileClicked.col];
                    if(typeIsTower(tile.type)) {
                        if(player.gold < towerCosts[tile.type - TOWER_OFFSET_NUM]) {
                            queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
                        } else {
                            setDrag(tile.type, mouseX, mouseY, false);
                        }
                    } else if(tile.hasTower()) {
                        // selected a tower to view
                        if(selection[currCanvas] == tile.towerOnTile) {
                            clearSelection(currCanvas);
                        } else {
                            selection[currCanvas] = tile.towerOnTile;
                            infoPane[currCanvas].show();
                        }
                    } else {
                        clearSelection(currCanvas);
                    }
                }
            } else { // send monster
                var tile = StateController.currLevel.tiles[currCanvas][tileClicked.row][tileClicked.col];
                
                if(tile.type >= MONSTER_OFFSET_NUM && tile.type <= MONSTER_OFFSET_NUM + NUM_MONSTERS) {
                    // sending a monster
                    if(player.gold < monsterCosts[PLAYER][tile.type - MONSTER_OFFSET_NUM]) {
                        queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
                    } else {
                        StateController.sendMonster(tile.type - MONSTER_OFFSET_NUM, ENEMY);
                    }
                } else if(tile.hasTower()) {
                    // selecting an opponent's tower
                    if(selection[currCanvas] == tile.towerOnTile) {
                        clearSelection(currCanvas); // deselect
                    } else {
                        selection[currCanvas] = tile.towerOnTile;
                    }
                } else {
                    clearSelection(currCanvas); // clicked on empty square: clear selection
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

function setDrag(towerType, x, y, visible) {
    if(towerType - TOWER_OFFSET_NUM == REAPER && REAPER_UNIQUE[currCanvas]) {
        queueMessage("Maximum reapers!", mouseX, mouseY, currCanvas);
        return;
    }
    dragObject[currCanvas] = new DraggableClass(towerType, x, y, currCanvas, "tower");
    dragObject[currCanvas].range = towerRanges[towerType - TOWER_OFFSET_NUM];
    dragObject[currCanvas].visible = visible;

    clearSelection(currCanvas); // clear selection
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

function clearSelection(context) {
    selection[context] = null;
    infoPane[context].hide();
}

// key presses
var shiftHeld = false;
var pressingNum = false;
function keySet(evt, setTo) {
    switch(evt.keyCode) {
        case 16: // shift
            shiftHeld = setTo;
            return;
        case 32:
            // space: presses start button again! Bad
            evt.preventDefault();
            return;
        case 85:
            if(selection[PLAYER] != null && setTo) {
                // u: upgrade selection
                upgradePressed();
            }
            return;
        case 84: // t: cycle target
            if(selection[PLAYER] != null && setTo) {
                targetPressed();
            }
            return;
        case 83: // s: sell selection
            if(selection[PLAYER] != null && setTo) {
                sellPressed();
            }
            return;
    }

    if(evt.keyCode > KEY_NUM_OFFSET && evt.keyCode <= KEY_NUM_OFFSET + 8) {
        // tower/monster hotkey!
        if((shiftHeld || !pressingNum) && setTo) {
            // allow multiple presses before release (press & hold monster)
            StateController.hotkey(evt.keyCode, shiftHeld, currCanvas);
        }   
        pressingNum = setTo;
    }
}

function keyPressed(evt) {
    // console.log(evt.keyCode);
    if(gameWon) {
        return;
    }

    if(evt.keyCode == 9) {
        // tab: cycle tower selection
        var keys = Object.keys(towerList[currCanvas]);
        if(selection[currCanvas] != null) {
            var index;
            if(shiftHeld) {
                // cycle backwards
                index = keys.indexOf(String(selection[currCanvas])) - 1;
                if(index < 0) index += keys.length;
            } else {
                index = keys.indexOf(String(selection[currCanvas])) + 1;
                index %= keys.length;
            }

            selection[currCanvas] = keys[index];
        } else if(keys.length > 0) {
            if(shiftHeld) {
                selection[currCanvas] = Object.keys(towerList[currCanvas])[keys.length - 1];
            } else {
                selection[currCanvas] = Object.keys(towerList[currCanvas])[0];
            }
        }

        evt.preventDefault();
    } else if(evt.keyCode == 27) {
        // escape: cancel tower placement
        pressEscape();
        evt.preventDefault();
    } else if(evt.keyCode == 80) {
        // pause
        pauseGame();
        evt.preventDefault();
    } else if(evt.keyCode == 70) {
        // fast forward
        fastGame();
        evt.preventDefault();
    } else {
        keySet(evt, true);
    } 
}

function keyReleased(evt) {
    keySet(evt, false);
}

function pressEscape() {
    if(dragObject[currCanvas] != null) {
        dragObject[currCanvas] = null;
    }
    if(selection[currCanvas] != null) {
        clearSelection(currCanvas);
    }
}
