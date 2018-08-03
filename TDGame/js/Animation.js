var fadeId = 0;
var time = 0.0;
var fadeAlpha = 1.0;
var delta = -0.04;

function fadeIn(context){
    fadeAlpha += delta;
    if(fadeAlpha >= 1) {
        // reset for next transition
        fadeAlpha = 1;
        delta = -0.04;
        
        timerId = setInterval(updateAll, 1000 / fps); // restart gameplay
    } else {
        // draw black background with full alpha, then set new and re-draw
        ctx[context].globalAlpha = 1.0;
        drawRect(0, 0, canvas[context].width, canvas[context].height, 'black', context);

        ctx[context].globalAlpha = fadeAlpha;
        drawAll();

        requestAnimationFrame(function() {
            fadeIn(context);
        }); // loop fade in
    }
}

function fadeOut(toState, toLevel, context) {
    fadeAlpha += delta;
    if(fadeAlpha <= 0) {
        delta *= -1;
        StateController.changeState(toState, toLevel);
        clearInterval(fadeId); // stop fade out
        fadeIn(context);
    } else {
        // draw black background with full alpha, then set new and re-draw
        ctx[context].globalAlpha = 1.0;
        drawRect(0, 0, canvas[context].width, canvas[context].height, 'black', context);

        ctx[context].globalAlpha = fadeAlpha;
        drawAll();

        requestAnimationFrame(function() {
            fadeOut(toState, toLevel, context);
        }); // or use setTimeout(loop, 16) in older browsers
    }
}

var errorMessages = [];
function queueErrorMessage(message) {
    errorMessages.push(message);
}

// message scrolls up as it fades out
function drawErrorMessage(message, alpha, delta, x, y, context) {
    ctx[context].fillStyle = 'red';
    ctx[context].globalAlpha = alpha;

    ctx[context].font = "16px Helvetica";
    ctx[context].textAlign = "left";
    ctx[context].textBaseline = "top";
    ctx[context].fillText(message, x, y);
    ctx[context].globalAlpha = 1.0;

    if(alpha >= 0.2) {
        requestAnimationFrame(function() {
            drawErrorMessage(message, alpha + delta, delta, x, y - 0.9, context);
        });
    }
}