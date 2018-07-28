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

function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;

    return {
        x: mouseX,
        y: mouseY
    }
}

function handleMouseClick(evt) {
    var mouse = calculateMousePos(evt);
    mouseX = mouse.x;
    mouseY = mouse.y;

    var tileClicked = pixelToGrid(mouse.x, mouse.y);
    var type = tiles[tileClicked.row][tileClicked.col].type;

    if(StateController.state == STATE_SELECT && tileClicked.row < 2 && tileClicked.col < 4) {
        StateController.changeState(STATE_PLAY);
        return;
    }

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
}

function setupInput() {
    canvas.addEventListener('mousemove', function(evt) {
	    var mouse = calculateMousePos(evt);
	    mouseX = mouse.x;
	    mouseY = mouse.y;
    });

    canvas.addEventListener('mousedown', handleMouseClick);
    
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