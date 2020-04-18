const UP = 0;
const LEFT = 1;
const RIGHT = 2;
const DOWN = 3;

const directionToRadian = [3 * Math.PI / 2, Math.PI, 0, Math.PI / 2];

function highlightTile(row, col, color, opacity) {
    var pixel = gridToPixel(row, col);
    ctx.globalAlpha = opacity;
    drawRect(pixel.x, pixel.y, TRACK_W, TRACK_H, color);
    ctx.globalAlpha = 1.0; // reset
}

function pixelToGrid(xPos, yPos) {
    // return coordinates corresponding to which tile the mouse is over
    var gridX, gridY;

    gridX = Math.floor(xPos / TRACK_W);
    gridY = Math.floor(yPos / TRACK_H);

    return {col: gridX, row: gridY};
}

function gridToPixel(row, col) {
    return {x: col * TRACK_W, y: row * TRACK_H};
}

function gridInRange(row, col) {
    return row < TRACK_ROWS && row >= 0 && col < TRACK_COLS && col >= 0;
}

// given an object with properties x, y, width, and height, return whether a position (x, y) is within that range
function pixelIsWithinObject(x, y, object) {
    return x >= object.x && x <= object.x + object.width && y >= object.y && y <= object.y + object.height;
}