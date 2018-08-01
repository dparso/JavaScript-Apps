var camPanX = 0.0;
var camPanY = 0.0;
var camPanSpeed = 2.0;

var mouseX = 0, mouseY = 0;
const PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_X = 150;
const PLAYER_DIST_FROM_CENTER_BEFORE_CAMERA_PAN_Y = 100;

var framesPerSecond = 30;

var canvas, canvasContext;
var colQueue = new Queue();

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    
    initInput();
    
    initColQueue();

    // these next few lines set up our game logic and render to happen 30 times per second
    setInterval(function() {
        moveEverything();
        drawEverything();
    }, 1000 / framesPerSecond);

    jumperDrag = framesPerSecond / (camPanSpeed * 1.0);
    jumperReset();
    canvas.addEventListener('mousemove', calculateMousePos);
}

function initColQueue() {
    for(var col = 0; col < BRICK_COLS; col++) {
        var currCol = [];
        for(var row = 0; row < BRICK_ROWS; row++) {
            var index = brickTileToIndex(col, row);
            currCol.push(brickGrid[index]);
        }
        var column = new Column(currCol, col * BRICK_W, col);
        colQueue.push(column);
    }
}

function jumperReset() {
    // center jumper on screen
    jumperX = canvas.width / 4;
    jumperY = canvas.height / 2;
}

function moveEverything() {
    jumperMove();

    camPanX += camPanSpeed;
    camPanSpeed += 0.01;
    RUN_SPEED += 0.01;
}

function drawQueue() {
    var length = colQueue.data.length;
    for(var col = 0; col < length; col++) {
        var column = colQueue.data[col];
        // continue;
        if(column.x - camPanX < -BRICK_W * 2) { // wait until offscreen
            if(col % 2 == 0) randomizeColumn(column);
            column.x = colQueue.data[length - 1].x + BRICK_W; // add to end
            colQueue.pop();
            colQueue.push(column);
        } else if(column.x < canvas.width + camPanX) {
            column.draw();
        }
    }
}

function randomizeColumn(col) {
    var top = Math.random() > 0.7 ? true : false;
    var bottom = Math.random() > 0.6 ? true : false;
    var topEnd, bottomEnd;

    // initialize all to zero;
    for(var row = 0; row < BRICK_ROWS; row++) {
        col.col[row] = 0;
    }

    if(top) {
        topEnd = Math.floor(Math.random() * 0.5 * BRICK_ROWS);
        for(var row = 0; row < topEnd; row++) {
            col.col[row] = 1;
        }
    }

    if(bottom) {
        if(top) {
            // no more than 1 below top
            bottomEnd = Math.floor(Math.random() * 0.5 * (BRICK_ROWS - topEnd - 1));
        } else {
            bottomEnd = Math.floor(Math.random() * 0.5 * BRICK_ROWS);
        }
        for(var row = BRICK_ROWS - 1; row > BRICK_ROWS - bottomEnd - 2; row--) {
            col.col[row] = 1;
        }
    }

    col.col[BRICK_ROWS - 1] = 1; // ground is always there (for now)

    // update brickGrid as well
    for(var row = 0; row < BRICK_ROWS; row++) {
        brickGrid[brickTileToIndex(col.index, row)] = col.col[row];
    }
}

function drawEverything() {
    // drawing black to erase previous frame, doing before .translate() since
    // its coordinates are not supposed to scroll when the camera view does
    colorRect(0, 0, canvas.width, canvas.height, 'black');

    canvasContext.save(); // needed to undo this .translate() used for scroll

    // this next line is like subtracting camPanX and camPanY from every
    // canvasContext draw operation up until we call canvasContext.restore
    // this way we can just draw them at their "actual" position coordinates
    canvasContext.translate(-camPanX,-camPanY);

    drawQueue();

    canvasContext.restore(); // undoes the .translate() used for cam scroll

    // doing this after .restore() so it won't scroll with the camera pan
    canvasContext.fillStyle = 'white';
    canvasContext.fillText("Arrow keys to slide, scrolling demo", 8, 14);

    colorCircle(jumperX, jumperY, 10, 'white');

    canvasContext.fillStyle = 'white';
    canvasContext.font = "20px Georgia";
    // var grid = brickPixelToIndex(mouseX + camPanX);
    var showX = Math.floor((mouseX + camPanX) / BRICK_W) % BRICK_COLS;
    var showY = Math.floor((mouseY + camPanY) / BRICK_H) % BRICK_ROWS;
    // var showX = mouseX - camPanX;
    // var showY = mouseY - camPanY;
    canvasContext.fillText(showX + ", " + showY, mouseX, mouseY);
}


/* Ideas

    Floating enemies
    Power up pickups
    Shooting

*/


