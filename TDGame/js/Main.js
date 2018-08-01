var canvas, canvasContext;

var gameWon = false;
var winner = "";
var fps = 30;

var ballList = [];
var monsterList = {};
var towerList = {};
var projectileList = {};
var monsterSelections = {}; // these things should be moved elsewhere!
var monsterPath = [];

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
            var isTransparent = type > 4 ? true : false;
            var tile = new TileClass({row: row, col: col}, type, tilePics[type], isTransparent);
            tiles[row][col] = tile;

            if(type == TILE_MONSTER_START) {
                MONSTER_START = {row: row, col: col};
            } else if(type == TILE_MONSTER_END) {
                MONSTER_END = {row: row, col: col};
            }
        }
    }
    calculateMonsterPath();
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
        if(timeSinceLastRelease > 1 * fps) { // once per second
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

    for(id in monsterList) {
      monsterList[id].move();
    }

    for(id in towerList) {
      towerList[id].move();
    }

    for(id in projectileList) {
      projectileList[id].move();
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

    for(id in monsterList) {
      monsterList[id].draw();
    }

    for(id in towerList) {
      towerList[id].draw();
    }

    for(id in projectileList) {
      projectileList[id].draw();
    }

    // drag object
    if(dragObject) {
        dragObject.draw();
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

    var tile = pixelToGrid(mouseX, mouseY);
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(tile.row + ", " + tile.col, mouseX, mouseY);
}
