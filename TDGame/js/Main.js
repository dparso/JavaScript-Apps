var canvas, canvasContext;

var gameWon = false;
var gameLost = false;
var winner = "";
var fps = 30;
var timerId = 0; // interval counter

var monsterList = {};
var towerList = {};
var projectileList = {};
var monsterSelections = {}; // these things should be moved elsewhere!
var monsterPath = [];
var selection = null;

var player = new PlayerClass();

var StateController = new StateControllerClass(welcomeScreen);

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    loadImages();
}

function loadingDoneStartGame() {  
    timerId = setInterval(updateAll, 1000 / fps);

    setupInput();
    // StateController.changeState(STATE_SELECT, selectScreen);
    StateController.changeState(STATE_PLAY, levelOne);
    // monsterSelections[TILE_MONSTER_1] = 50;
    monsterSelections[TILE_MONSTER_4] = 10;
    monsterSelections[TILE_MONSTER_3] = 10;

    monsterSelections[TILE_MONSTER_2] = 10;
    monsterSelections[TILE_MONSTER_1] = 10;

}

function updateAll() {
    if(gameWon) {
        // display win message
        drawAll();

        canvasContext.fillStyle = 'white';
        canvasContext.font = "20px Georgia";
        canvasContext.fillText(winner + " won!", 6 * canvas.width / 14, 23 * canvas.height / 32);
        canvasContext.fillText("click to continue", 6 * canvas.width / 14, 25 * canvas.height / 32);
        return;
    } else if(gameLost) {
        // display loss message
        drawAll();

        canvasContext.fillStyle = 'white';
        canvasContext.font = "20px Georgia";
        canvasContext.fillText("You lost!", 6 * canvas.width / 14, 2 * canvas.height / 4);
        canvasContext.fillText("click to restart", 8 * canvas.width / 20, 18 * canvas.height / 32);
        return;
    }

    monsterUpdate();
    // towerUpdate();
    moveAll();
    drawAll();
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
    StateController.drawLevel();

    // draw tower selection
    if(selection != null) {
        drawSelection();
    }

    var string = "";
    for(var key in monsterSelections) {
        string += "Type " + key + ": " + monsterSelections[key] + "<br>";
    }
    document.getElementById("monsterText").innerHTML = string;
}

function drawSelection() {
    var tower = towerList[selection];
    var objectTile = tower.currTile;
    highlightTile(objectTile.row, objectTile.col, 'white', 0.4);
    // highlight tiles in range
    for(var row = objectTile.row - tower.range; row <= objectTile.row + tower.range; row++) {
        for(var col = objectTile.col - tower.range; col <= objectTile.col + tower.range; col++) {
            if(gridInRange(row, col)) { // in bounds
                var tile = StateController.currLevel.tiles[row][col];

                highlightTile(row, col, 'white', 0.3);
            }
        }
    }
}
function textDraw() {
    // Lives
    canvasContext.fillStyle = "rgb(250, 250, 250)";
    canvasContext.font = "20px Helvetica";
    canvasContext.textAlign = "left";
    canvasContext.textBaseline = "top";
    canvasContext.fillText("Lives: " + player.lives, 590, 20);
    canvasContext.fillText("Gold: " + player.gold, 590, 40);


    var tile = pixelToGrid(mouseX, mouseY);
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(mouseX + ", " + mouseY, mouseX, mouseY);
    // canvasContext.fillText(tile.row + ", " + tile.col, mouseX, mouseY);

    if(errorMessages.length > 0) {
        var message = errorMessages.shift();
        var textWidth = canvasContext.measureText(message).width;
        var xPos = mouseX;
        if(mouseX + textWidth > canvas.width) {
            xPos = canvas.width - textWidth;
        }
        drawErrorMessage(message, 1.0, -0.008, xPos, mouseY);
    }
}

function restartGame() {
    gameWon = false;
    gameLost = false;
    player.reset();

    monsterList = {};
    towerList = {};
    projectileList = {};

    fadeOut(STATE_SELECT, selectScreen);
    clearInterval(timerId);
}
