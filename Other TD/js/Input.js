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
var dragObject = null;

var KEY_NUM_OFFSET = 48; // 0 code is 0 + 48, 1 is 1 + 48, etc

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

    if(StateController.state === STATE_PLAY) {
        // display tooltips for purchases
        var hoverTile = pixelToGrid(mouseX, mouseY);
        if(gridInRange(hoverTile.row, hoverTile.col)) {
            var tile = StateController.currLevel.tiles[hoverTile.row][hoverTile.col];

            if(typeIsTower(tile.type)) {
                var index = tile.type - TOWER_OFFSET_NUM;
                var text = towerNames[index] + ": " + towerCosts[index].toLocaleString() + " [" + (index + 1) + "]";
            } else if(typeIsMonster(tile.type)) {
                var index = tile.type - MONSTER_OFFSET_NUM;
                var text = monsterNames[index] + ": " + (monsterCosts[PLAYER][index]).toLocaleString() + " [shift + " + (index + 1) + "]";
            } else {
                tooltip = null;
            }

            if(index !== undefined) {
                setTooltip(text, mouseX + 5, mouseY - 10);
            }
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
    // showTile = tileClicked;

    switch(StateController.state) {
        case STATE_SELECT:
            // clicking "Click to proceed"
            if(mouseX > CLICK_CONTINUE_IMAGE.x - CLICK_CONTINUE_IMAGE.img.width / 2 && mouseX < CLICK_CONTINUE_IMAGE.x + CLICK_CONTINUE_IMAGE.img.width / 2) {
                if(mouseY > CLICK_CONTINUE_IMAGE.y && mouseY < CLICK_CONTINUE_IMAGE.y + CLICK_CONTINUE_IMAGE.img.height) {
                    // clicked start!
                    clearInterval(timerId);
                    fadeOut(STATE_PLAY, levelOne);
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
                // selected a tower to build
                var tile = StateController.currLevel.tiles[tileClicked.row][tileClicked.col];
                if(typeIsTower(tile.type)) {
                    if(player.gold < towerCosts[tile.type - TOWER_OFFSET_NUM]) {
                        queueMessage("Insufficient gold!", mouseX, mouseY, 1);
                    } else {
                        setDrag(tile.type, mouseX, mouseY, false);
                    }
                } else if(tile.hasTower()) {
                    // selected a tower to view
                    if(selection === tile.towerOnTile) {
                        clearSelection();
                    } else {
                        selection = tile.towerOnTile;
                        infoPane.show();
                    }
                } else {
                    clearSelection();
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
            // place the tower!
            StateController.placeTower(dragObject.type - TOWER_OFFSET_NUM, PLAYER, tile);
        }

        dragObject = null;
    }

    return;
}

function setDrag(towerType, x, y, visible) {
    if(towerType - TOWER_OFFSET_NUM === REAPER && REAPER_UNIQUE[PLAYER]) {
        queueMessage("Maximum reapers!", mouseX, mouseY, 1);
        return;
    }
    dragObject = new DraggableClass(towerType, x, y, PLAYER, "tower");
    dragObject.range = towerRanges[towerType - TOWER_OFFSET_NUM];
    dragObject.visible = visible;

    clearSelection(); // clear selection
    isDown = true;
    isDragging = true;
}

function setupInput() {
    canvas.addEventListener('mousemove', function(evt) {
        // easy swapping: only listen on the canvas they're moused over
        // (that's the only one they can click)
	    var mouse = calculateMousePos(evt);
	    mouseX = mouse.x;
	    mouseY = mouse.y;
    });

    canvas.addEventListener('mousedown', function(evt) {
        handleMouseDown(evt);
    });

    canvas.addEventListener('mouseup', function(evt) {
        handleMouseUp(evt);
    });
    
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);
}

function clearSelection() {
    selection = null;
    infoPane.hide();
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
            if(selection !== null && setTo) {
                // u: upgrade selection
                upgradePressed();
            }
            return;
        case 84: // t: cycle target
            if(selection !== null && setTo) {
                targetPressed();
            }
            return;
        case 83: // s: sell selection
            if(selection !== null && setTo) {
                sellPressed();
            }
            return;
    }

    if(evt.keyCode > KEY_NUM_OFFSET && evt.keyCode <= KEY_NUM_OFFSET + NUM_TOWERS) {
        // tower/monster hotkey!
        if((shiftHeld || !pressingNum) && setTo) {
            // allow multiple presses before release (press & hold monster)
            StateController.hotkey(evt.keyCode, shiftHeld);
        }   
        pressingNum = setTo;
    }
}

function keyPressed(evt) {
    // console.log(evt.keyCode);
    if(gameWon) {
        return;
    }
    if(evt.keyCode === 192) {
        // advance frame 1 by 1
        advanceFrame();
    } else if(evt.keyCode === 9) {
        // tab: cycle tower selection
        // currently only cycles through player's towers
        var keys = Object.keys(towerList[PLAYER]);
        if(selection !== null) {
            var index;
            if(shiftHeld) {
                // cycle backwards
                index = keys.indexOf(String(selection)) - 1;
                if(index < 0) index += keys.length;
            } else {
                index = keys.indexOf(String(selection)) + 1;
                index %= keys.length;
            }

            selection = keys[index];
        } else if(keys.length > 0) {
            if(shiftHeld) {
                selection = Object.keys(towerList[PLAYER])[keys.length - 1];
            } else {
                selection = Object.keys(towerList[PLAYER])[0];
            }
        }

        evt.preventDefault();
    } else if(evt.keyCode === 27) {
        // escape: cancel tower placement
        pressEscape();
        evt.preventDefault();
    } else if(evt.keyCode === 80) {
        // pause
        pauseGame();
        evt.preventDefault();
    } else if(evt.keyCode === 70) {
        // fast forward
        fastGame();
        evt.preventDefault();
    } else if(evt.keyCode == 86) {
        displayVectorField = !displayVectorField;
        evt.preventDefault();
    } else {
        keySet(evt, true);
    } 
}

function keyReleased(evt) {
    keySet(evt, false);
}

function pressEscape() {
    if(dragObject !== null) {
        dragObject = null;
    }
    if(selection !== null) {
        clearSelection();
    }
}
