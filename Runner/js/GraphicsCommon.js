function drawBitmapCenteredWithRotation(useBitmap, atX, atY, withAngle) {
    canvasContext.save();
    canvasContext.translate(atX, atY);
    canvasContext.rotate(withAngle);
    canvasContext.drawImage(useBitmap, -useBitmap.width / 2, -useBitmap.height / 2);
    canvasContext.restore();
}

function drawCircle(centerX, centerY, r, color) {
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, r, 0, Math.PI * 2, true);
    canvasContext.fill();
}

function drawRect(x, y, width, height, color) {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);	// x, y, w, h
}

function drawText(showWords, textX, textY, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}