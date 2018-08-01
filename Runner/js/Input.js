function initInput() {
    document.addEventListener("keydown", keyPressed);
    document.addEventListener("keyup", keyReleased);
}

function setKeyHoldState(thisKey, setTo, evt) {
    if(thisKey == KEY_LEFT_ARROW) {
        holdLeft = setTo;
        evt.preventDefault();
    }
    if(thisKey == KEY_RIGHT_ARROW) {
        holdRight = setTo;
        evt.preventDefault();
    }
    if(thisKey == KEY_UP_ARROW || thisKey == KEY_SPACE) {
        if(jumperOnGround) {
            jumperSpeedY = -JUMP_POWER;
        }
        evt.preventDefault();
    }
}

function keyPressed(evt) {
    setKeyHoldState(evt.keyCode, true, evt);
}

function keyReleased(evt) {
    setKeyHoldState(evt.keyCode, false, evt);
}


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