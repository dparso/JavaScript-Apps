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
            tracks[startPositions[0][0]][startPositions[0][1]] = 2;
            tracks[startPositions[1][0]][startPositions[1][1]] = 2;
            startPositions = [];
            blueCar.reset();
            greenCar.reset();
            gameWon = false;
        }
    });
    
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);

    blueCar.setupInput(KEY_LEFT_ARROW, KEY_UP_ARROW, KEY_RIGHT_ARROW, KEY_DOWN_ARROW);
    greenCar.setupInput(KEY_A, KEY_W, KEY_D, KEY_S);

}

function keySet(evt, car, setTo) {
    switch(evt.keyCode) {
        case car.controlKeyLeft:
            car.keyHeld_TurnLeft = setTo;
            evt.preventDefault();
            break;
        case car.controlKeyUp:
            car.keyHeld_Gas = setTo;
            evt.preventDefault();
            break;
        case car.controlKeyRight:
            car.keyHeld_TurnRight = setTo;
            evt.preventDefault();
            break;
        case car.controlKeyDown:
            car.keyHeld_Reverse = setTo;
            evt.preventDefault();
            break;
    }    
}

function keyPressed(evt) {
    // console.log(evt.keyCode);
    if(gameWon) {
        return;
    }
    switch(evt.keyCode) {
        case 66:
            debugMode = !debugMode;
            evt.preventDefault();
            break;
        case 80:
            gamePaused = !gamePaused;
            evt.preventDefault();
            break;
        case 192:
            moveAll(true);
            evt.preventDefault();
            break;
        default:
            keySet(evt, blueCar, true);
            keySet(evt, greenCar, true);
            break;
    }
}

function keyReleased(evt) {
    keySet(evt, blueCar, false);
    keySet(evt, greenCar, false);
}