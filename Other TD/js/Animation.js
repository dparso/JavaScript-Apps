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
        ctx.globalAlpha = 1.0;
        drawRect(0, 0, canvas.width, canvas.height, 'black');
        ctx.globalAlpha = fadeAlpha;
        drawAll();


        requestAnimationFrame(function() {
            fadeIn();
        }); // loop fade in
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
        ctx.globalAlpha = 1.0;
        drawRect(0, 0, canvas.width, canvas.height, 'black');
        ctx.globalAlpha = fadeAlpha;
        drawAll();

        requestAnimationFrame(function() {
            fadeOut(toState, toLevel);
        }); // or use setTimeout(loop, 16) in older browsers
    }
}

var messages = [];
function queueMessage(message, x, y, color = 'red') {
    messages.push({text: message, x: x, y: y, color: color});
}

// message scrolls up as it fades out
function drawMessage(message, alpha, delta, x, y, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;

    ctx.font = "34px Stranger";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(message, x, y);
    ctx.globalAlpha = 1.0;

    if(alpha >= 0.2) {
        requestAnimationFrame(function() {
            drawMessage(message, alpha + delta, delta, x, y - 0.9, color);
        });
    }
}

function makeAnimation(type, x, y, index) {
    var img = animationPics[type][index];

    drawBitmapCenteredWithRotation(img, x, y, Math.random() * 360); // randomize angle

    if(index < animationPics[type].length - 1) {
        requestAnimationFrame(function() {
            makeAnimation(type, x, y, index + 1);
        });        
    }
}

function scytheAnimation(x, y, angle, speed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowBlur = 50;
    ctx.shadowColor = 'black';
    var img = projectilePics[REAPER][0];
    ctx.drawImage(img, img.width / 8, img.height / 8);
    ctx.restore();

    if(angle <= 2 * Math.PI) {
        requestAnimationFrame(function() {
            scytheAnimation(x, y, angle + speed, speed);
        });
    }
}


