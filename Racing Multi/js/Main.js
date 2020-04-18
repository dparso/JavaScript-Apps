var canvas, ctx;

var blueCar = new CarClass(car1Pic, "Player 1");
var greenCar = new CarClass(car2Pic, "Player 2");
var computerDriver = new DriverClass(1, greenCar);
var allowDiagonals = false;
var gamePaused = false;
var debugMode = true;

var tiles = [];
var cars = [blueCar, greenCar];

var startPositions = []; // keeps track of where cars were placed

var gameWon = false;
var winner = "";
var fps = 30;

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    drawRect(0, 0, canvas.width, canvas.height, 'black');   
    drawText("LOADING IMAGES", canvas.width / 2, canvas.height / 2, 'white');

    loadImages();
}

function loadingDoneStartGame() {  
    setInterval(updateAll, 1000 / fps);

    setupInput();
    loadLevel(levelOne);
    for(var row = 0; row < TRACK_ROWS; row++) {
        for(var col = 0; col < TRACK_COLS; col++) {
            if(tracks[row][col] == TRACK_GOAL) {
                calculateBFS(tiles[row][col]);
                return;
            }
        }
    }
    calculateBFS();
}

function loadLevel(level) {
    tracks = level.map(function(arr) {
        return arr.slice();
    }); // copy by value


    // init tiles
    tiles = [];
    for(var row = 0; row < TRACK_ROWS; row++) {
        currCol = [];
        for(var col = 0; col < TRACK_COLS; col++) {
            var tile = new TileClass(row, col, tracks[row][col]);
            currCol.push(tile);
        }
        tiles.push(currCol);
    }

    blueCar.reset();
    greenCar.reset();
}

function updateAll() {
    moveAll();
    drawAll();

    if(gameWon) {
        // display win message
        ctx.fillStyle = 'white';
        ctx.font = "20px Georgia";
        ctx.fillText(winner + " won!", 6 * canvas.width / 14, 23 * canvas.height / 32);
        ctx.fillText("click to continue", 6 * canvas.width / 14, 25 * canvas.height / 32);
    }
}

function moveAll(force = false) {
    if((!gamePaused || force) && !gameWon) {
        computerDriver.update();
        blueCar.move();
        greenCar.move();
    }
}

function clearScreen() {
     drawRect(0, 0, canvas.width, canvas.height, 'black');   
}

function drawAll() {
    // clearScreen();
    tracksDraw();
    blueCar.draw();
    greenCar.draw();

    var tile = pixelToGrid(mouseX, mouseY);
    ctx.fillStyle = 'white';
    ctx.font = "10px Helvetica";
    ctx.fillText(mouseX + ", " + mouseY, mouseX + 10, mouseY + 30);
    // ctx.fillText(tile.row + ", " + tile.col, mouseX + 10, mouseY + 30);

    if(debugMode) drawDebug();
}

function drawDebug() {
    drawVectorField();
    drawCarBoundingBoxes();
}

function drawCarBoundingBoxes() {
    for(var car = 0; car < cars.length; car++) {
        let s = cars[car].getSegments();
        ctx.strokeStyle = "#cc0000";
        ctx.lineWidth = 3;

        for(var i = 0; i < s.length; i++) {
            ctx.beginPath();
            ctx.moveTo(s[i].a.x, s[i].a.y);
            ctx.lineTo(s[i].b.x, s[i].b.y);

            ctx.stroke();
        }
    }
}

function drawVectorField() {
    var arrowLength = 20;
    var arrowWidth = 1;
    for(var row = 0; row < TRACK_ROWS; row++) {
        for(var col = 0; col < TRACK_COLS; col++) {
            var tile = tiles[row][col];
            var par = tile.parent;
            if(par) {
                var startX, startY;
                ctx.font = "10px Helvetica";
                ctx.fillStyle = 'white';

                if(par.row - tile.row < 0) { // parent is up
                    var pos = gridToPixel(tile.row, tile.col);
                    drawArrow(pos.x + TRACK_W / 2, pos.y + arrowLength, pos.x + TRACK_W / 2, pos.y, arrowWidth);
                } else if(par.row - tile.row > 0) { // parent is down
                    var pos = gridToPixel(tile.row, tile.col);
                    drawArrow(pos.x + TRACK_W / 2, pos.y, pos.x + TRACK_W / 2, pos.y + arrowLength, arrowWidth);
                } else if(par.col - tile.col < 0) { // parent is left
                    var pos = gridToPixel(tile.row, tile.col);
                    drawArrow(pos.x + arrowLength, pos.y + TRACK_H / 2, pos.x, pos.y + TRACK_H / 2, arrowWidth);
                } else { // parent is right
                    var pos = gridToPixel(tile.row, tile.col);
                    drawArrow(pos.x, pos.y + TRACK_H / 2, pos.x + arrowLength, pos.y + TRACK_H / 2, arrowWidth);
                }
            }
        }
    }
}