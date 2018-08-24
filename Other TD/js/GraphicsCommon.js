// tooltip
const TOOLTIP_BOX_HEIGHT = 15;
const TOOLTIP_PADDING = 5;
var tooltip = null; 

function setTooltip(text, x, y) {
    tooltip = {text: text, x: x, y: y};
}

function drawBitmapCenteredWithRotation(useBitmap, atX, atY, withAngle) {
    ctx.save();
    ctx.translate(atX, atY);
    ctx.rotate(withAngle);
    ctx.drawImage(useBitmap, Math.round(-useBitmap.width / 2), Math.round(-useBitmap.height / 2));
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