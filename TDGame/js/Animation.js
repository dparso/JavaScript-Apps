var fadeId = 0;
var fadeAlpha = 1.0;
var delta = -0.04;

function fadeIn() {
    fadeAlpha += delta;
    if(fadeAlpha >= 1) {
        // reset for next transition
        fadeAlpha = 1;
        delta = -0.04;
        
        timerId = setInterval(updateAll, 1000 / fps); // restart gameplay
    } else {
        // draw black background with full alpha, then set new and re-draw
        // both canvases!
        for(var who = 0; who <= 1; who++) {
            ctx[who].globalAlpha = 1.0;
            drawRect(0, 0, canvas[who].width, canvas[who].height, 'black', who);
            ctx[who].globalAlpha = fadeAlpha;
            drawAll(who);

        }

        requestAnimationFrame(function() {
            fadeIn();
        }); // loop fade in
    }
}

function fadeOut(toState, toLevel, context) {
    fadeAlpha += delta;
    if(fadeAlpha <= 0) {
        delta *= -1;
        StateController.changeState(toState, toLevel);
        clearInterval(fadeId); // stop fade out
        fadeIn();
    } else {
        // draw black background with full alpha, then set new and re-draw
        for(var who = 0; who <= 1; who++) {
            ctx[who].globalAlpha = 1.0;
            drawRect(0, 0, canvas[who].width, canvas[who].height, 'black', who);
            ctx[who].globalAlpha = fadeAlpha;
            drawAll(who);
        }

        requestAnimationFrame(function() {
            fadeOut(toState, toLevel, context);
        }); // or use setTimeout(loop, 16) in older browsers
    }
}

var messages = [];
function queueMessage(message, x, y, context, color = 'red') {
    messages.push({text: message, x: x, y: y, ctx: context, color: color});
}

// message scrolls up as it fades out
function drawMessage(message, alpha, delta, x, y, color, context) {
    ctx[context].fillStyle = color;
    ctx[context].globalAlpha = alpha;

    ctx[context].font = "34px Stranger";
    ctx[context].textAlign = "left";
    ctx[context].textBaseline = "top";
    ctx[context].fillText(message, x, y);
    ctx[context].globalAlpha = 1.0;

    if(alpha >= 0.2) {
        requestAnimationFrame(function() {
            drawMessage(message, alpha + delta, delta, x, y - 0.9, color, context);
        });
    }
}

function makeAnimation(type, x, y, index, context) {
    var img = animationPics[type][index];

    drawBitmapCenteredWithRotation(img, x, y, Math.random() * 360, context); // randomize angle

    if(index < animationPics[type].length - 1) {
        requestAnimationFrame(function() {
            makeAnimation(type, x, y, index + 1, context);
        });        
    }
}

function scytheAnimation(x, y, angle, speed, context) {
    ctx[context].save();
    ctx[context].translate(x, y);
    ctx[context].rotate(angle);
    ctx[context].shadowBlur = 50;
    ctx[context].shadowColor = 'black';
    var img = projectilePics[REAPER][0];
    ctx[context].drawImage(img, img.width / 8, img.height / 8);
    ctx[context].restore();

    if(angle <= 2 * Math.PI) {
        requestAnimationFrame(function() {
            scytheAnimation(x, y, angle + speed, speed, context);
        });
    }
}


