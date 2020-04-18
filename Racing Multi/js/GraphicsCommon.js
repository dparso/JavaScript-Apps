function drawBitmapCenteredWithRotation(useBitmap, atX, atY, withAngle) {
    ctx.save();
    ctx.translate(atX, atY);
    ctx.rotate(withAngle);
    ctx.drawImage(useBitmap, -useBitmap.width / 2, -useBitmap.height / 2);
    ctx.restore();
}

function drawCircle(centerX, centerY, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2, true);
    ctx.fill();
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);	// x, y, w, h
}

function drawText(showWords, textX, textY, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillText(showWords, textX, textY);
}

function drawArrow(fromX, fromY, toX, toY, width) {
    // https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag

    var headlen = 1;
    var angle = Math.atan2(toY - fromY, toX - fromX);

    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = width;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 7), toY - headlen * Math.sin(angle - Math.PI / 7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 7), toY - headlen * Math.sin(angle + Math.PI / 7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 7), toY - headlen * Math.sin(angle - Math.PI / 7));

    //draws the paths created above
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = width * 3;
    ctx.stroke();
    ctx.fillStyle = "#cc0000";
    ctx.fill();
}