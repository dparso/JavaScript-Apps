var canvas, canvasContext;

var gameWon = false;
var winner = "";
var fps = 30;

var ballList = [];
var monsterList = [];
var towerList = [];
var projectileList = [];
var monsterSelections = {}; // these things should be moved elsewhere!
var StateController = new StateControllerClass();

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    loadImages();
}

function loadingDoneStartGame() {  
    setInterval(updateAll, 1000 / fps);

    setupInput();
    StateController.changeState(STATE_SELECT);
    createEveryBall();
}

function loadLevel(level) {
    tiles = new Array(TILE_ROWS);
    for(var row = 0; row < TILE_ROWS; row++) {
        tiles[row] = new Array(TILE_COLS);
        for(var col = 0; col < TILE_COLS; col++) {
            var type = level[row][col];
            var tile = new TileClass({row: row, col: col}, type, tilePics[type]);
            tiles[row][col] = tile;
        }
    }
}

function updateAll() {
    monsterUpdate();
    // towerUpdate();
    moveAll();
    drawAll();
    if(gameWon) {
        // display win message
        canvasContext.fillStyle = 'white';
        canvasContext.font = "20px Georgia";
        canvasContext.fillText(winner + " won!", 6 * canvas.width / 14, 23 * canvas.height / 32);
        canvasContext.fillText("click to continue", 6 * canvas.width / 14, 25 * canvas.height / 32);
    }
}

var timeSinceLastRelease = 0;
function monsterUpdate() {
    var len = StateController.monstersWaiting.length;
    if(len > 0) {
        if(timeSinceLastRelease > 1 * fps) {
            var monster = StateController.monstersWaiting.pop();
            monster.visible = true;
            timeSinceLastRelease = 0;
        }
    }

    timeSinceLastRelease++;
}

function moveAll() {

    for(var i = 0; i < ballList.length; i++) {
      ballList[i].move();
    }

    for(var i = 0; i < monsterList.length; i++) {
      monsterList[i].move();
    }

    for(var i = 0; i < towerList.length; i++) {
      towerList[i].move();
    }

    for(var i = 0; i < projectileList.length; i++) {
      projectileList[i].move();
    }
}

function drawAll() {
    tilesDraw();
    textDraw();

    var string = "";
    for(var key in monsterSelections) {
        string += "Type " + key + ": " + monsterSelections[key] + "<br>";
    }
    document.getElementById("monsterText").innerHTML = string;

    for(var i = 0; i < ballList.length; i++) {
      ballList[i].draw();
    }

    for(var i = 0; i < monsterList.length; i++) {
      monsterList[i].draw();
    }

    for(var i = 0; i < towerList.length; i++) {
      towerList[i].draw();
    }

    for(var i = 0; i < projectileList.length; i++) {
      projectileList[i].draw();
    }
}

function textDraw() {
    switch(StateController.state) {
        case STATE_SELECT:
            canvasContext.font = "20px Georgia";
            canvasContext.fillStyle = 'white';
            var pixelPos = gridToPixel(1, 1);
            canvasContext.fillText("Click to proceed", pixelPos.x, pixelPos.y);
            break;
        default:
            break;
    }

    canvasContext.fillText(mouseX + ", " + mouseY, mouseX, mouseY);
}
