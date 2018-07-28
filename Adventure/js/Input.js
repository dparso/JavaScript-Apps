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

function setupInput() {
    canvas.addEventListener('mousemove', function(evt) {
	    var mouse = calculateMousePos(evt);
	    mouseX = mouse.x;
	    mouseY = mouse.y;
    });

    canvas.addEventListener('mousedown', function(evt) {
        if(gameWon) {
            startPositions = [];
            blueWarrior.reset();
            gameWon = false;
        }
    });
    
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);

    blueWarrior.setupInput(KEY_LEFT_ARROW, KEY_UP_ARROW, KEY_RIGHT_ARROW, KEY_DOWN_ARROW);
}

function keySet(evt, warrior, setTo) {
    switch(evt.keyCode) {
        case warrior.controlKeyLeft:
            warrior.keyHeld_TurnLeft = setTo;
            evt.preventDefault();
            break;
        case warrior.controlKeyUp:
            warrior.keyHeld_Gas = setTo;
            evt.preventDefault();
            break;
        case warrior.controlKeyRight:
            warrior.keyHeld_TurnRight = setTo;
            evt.preventDefault();
            break;
        case warrior.controlKeyDown:
            warrior.keyHeld_Reverse = setTo;
            evt.preventDefault();
            break;
    }    
}

function keyPressed(evt) {
    if(gameWon) {
        return;
    }
    keySet(evt, blueWarrior, true);
}

function keyReleased(evt) {
    keySet(evt, blueWarrior, false);
}