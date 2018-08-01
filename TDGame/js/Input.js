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
    var mouse = calculateMousePos(evt);
    mouseX = mouse.x;
    mouseY = mouse.y;

    console.log("mouse down " + mouseX + ", " + mouseY);
    isDown = true;

    var tileClicked = pixelToGrid(mouse.x, mouse.y);
    var type = tiles[tileClicked.row][tileClicked.col].type;

    switch(StateController.state) {
        case STATE_SELECT:
            // clicking "Click to proceed"
            if(tileClicked.row < 2 && tileClicked.col < 4) {
                StateController.changeState(STATE_PLAY);
                return;
            }

            // choosing a monster type to add
            switch(type) {
                case TILE_MONSTER_1:
                    if(StateController.state == STATE_SELECT) {
                        // increment this monster's counter
                        monsterSelections[type]++;
                        // console.log("Touched " + type);
                    }
                    break;
                case TILE_MONSTER_2:
                    if(StateController.state == STATE_SELECT) {
                        // increment this monster's counter
                        monsterSelections[type]++;
                        // console.log("Touched " + type);
                    }
                    break;
                case TILE_MONSTER_3:
                    if(StateController.state == STATE_SELECT) {
                        // increment this monster's counter
                        monsterSelections[type]++;
                        // console.log("Touched " + type);
                    }
                    break;
                case TILE_MONSTER_4:
                    if(StateController.state == STATE_SELECT) {
                        // increment this monster's counter
                        monsterSelections[type]++;
                        // console.log("Touched " + type);
                    }
                    break;
            }
            break;
        case STATE_PLAY:
            if(!isDragging) {
                if(type == TILE_TOWER_1) {
                    dragObject = new TowerClass(tilePics[TILE_TOWER_1]);
                    dragObject.reset();
                    dragObject.x = mouseX;
                    dragObject.y = mouseY;
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
            dragObject.active = true; // tower can attack now
            towerList[dragObject.id] = dragObject;
        }

        dragObject = null;
    }

    console.log("mouse up");
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

    // blueTower.setupInput(KEY_LEFT_ARROW, KEY_UP_ARROW, KEY_RIGHT_ARROW, KEY_DOWN_ARROW);
}

function keySet(evt, tower, setTo) {
    switch(evt.keyCode) {
        case tower.controlKeyLeft:
            tower.keyHeld_TurnLeft = setTo;
            evt.preventDefault();
            break;
        case tower.controlKeyUp:
            tower.keyHeld_Gas = setTo;
            evt.preventDefault();
            break;
        case tower.controlKeyRight:
            tower.keyHeld_TurnRight = setTo;
            evt.preventDefault();
            break;
        case tower.controlKeyDown:
            tower.keyHeld_Reverse = setTo;
            evt.preventDefault();
            break;
    }    
}

function keyPressed(evt) {
    if(gameWon) {
        return;
    }
    // keySet(evt, blueTower, true);
}

function keyReleased(evt) {
    // keySet(evt, blueTower, false);
}