function drawBitmapCenteredWithRotation(useBitmap, atX, atY, withAngle, context) {
    ctx[context].save();
    ctx[context].translate(atX, atY);
    ctx[context].rotate(withAngle);
    ctx[context].drawImage(useBitmap, -useBitmap.width / 2, -useBitmap.height / 2);
    ctx[context].restore();
}

function drawCircle(centerX, centerY, r, color, context) {
    ctx[context].fillStyle = color;
    ctx[context].beginPath();
    ctx[context].arc(centerX, centerY, r, 0, Math.PI * 2, true);
    ctx[context].fill();
}

function drawRect(x, y, width, height, color, context) {
    ctx[context].fillStyle = color;
    ctx[context].fillRect(x, y, width, height);	// x, y, w, h
}

function drawText(showWords, textX, textY, fillColor, context) {
    ctx[context].fillStyle = fillColor;
    ctx[context].fillText(showWords, textX, textY);
}