var fadeId = 0;
var time = 0.0;
var fadeAlpha = 1.0;
var delta = -0.04;

function fadeIn(){
    fadeAlpha += delta;
    if(fadeAlpha >= 1) {
        // reset for next transition
        fadeAlpha = 1;
        delta = -0.04;
        
        timerId = setInterval(updateAll, 1000 / fps); // restart gameplay
    } else {
        // draw black background with full alpha, then set new and re-draw
        canvasContext.globalAlpha = 1.0;
        drawRect(0, 0, canvas.width, canvas.height, 'black');

        canvasContext.globalAlpha = fadeAlpha;
        drawAll();

        requestAnimationFrame(fadeIn); // loop fade in
    }
}

function fadeOut(toState, toLevel) {
    fadeAlpha += delta;
    if(fadeAlpha <= 0) {
        delta *= -1;
        StateController.changeState(toState, toLevel);
        clearInterval(fadeId); // stop fade out
        fadeIn();
    } else {
        // draw black background with full alpha, then set new and re-draw
        canvasContext.globalAlpha = 1.0;
        drawRect(0, 0, canvas.width, canvas.height, 'black');

        canvasContext.globalAlpha = fadeAlpha;
        drawAll();

        requestAnimationFrame(function() {
            fadeOut(toState, toLevel);
        }); // or use setTimeout(loop, 16) in older browsers
    }
}

var errorMessages = [];
function queueErrorMessage(message) {
    errorMessages.push(message);
}

// message scrolls up as it fades out
function drawErrorMessage(message, alpha, delta, x, y) {
    canvasContext.fillStyle = 'red';
    canvasContext.globalAlpha = alpha;

    canvasContext.font = "16px Helvetica";
    canvasContext.textAlign = "left";
    canvasContext.textBaseline = "top";
    canvasContext.fillText(message, x, y);
    canvasContext.globalAlpha = 1.0;

    if(alpha >= 0.2) {
        requestAnimationFrame(function() {
            drawErrorMessage(message, alpha + delta, delta, x, y - 0.9);
        });
    }
}