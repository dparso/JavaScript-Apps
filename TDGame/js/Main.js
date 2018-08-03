var canvas = [], ctx = [];

var PLAYER = 0, ENEMY = 1;

var gameWon = false;
var gameLost = false;
var winner = "";
var fps = 30;
var timerId = 0; // interval counter

var monsterList = [{}, {}];
var towerList = [{}, {}];
var projectileList = [{}, {}];
var monsterSelections = {}; // these things should be moved elsewhere!
var monsterPath = []; // the pixel coords for monsters to follow
var fullMonsterPath = []; // the tile coords for towers to track for first targeting
var selection = [null, null];

var player = new PlayerClass();
var enemy = new PlayerClass();

var StateController = new StateControllerClass(welcomeScreen);

window.onload = function() {
    canvas[PLAYER] = document.getElementById('gameCanvas');
    canvas[ENEMY] = document.getElementById('enemyCanvas');

    ctx[PLAYER] = canvas[PLAYER].getContext('2d');
    ctx[ENEMY] = canvas[ENEMY].getContext('2d');

    currCanvas = PLAYER;
    loadImages();
}

function loadingDoneStartGame() { 
    prepareEnemy();

    timerId = setInterval(updateAll, 1000 / fps);

    setupInput();
    StateController.changeState(STATE_SELECT, selectScreen);
    // StateController.changeState(STATE_PLAY, levelOne);
    // monsterSelections[TILE_MONSTER_1] = 50;
    // monsterSelections[TILE_MONSTER_4] = 1;
    // monsterSelections[TILE_MONSTER_3] = 1;

    // monsterSelections[TILE_MONSTER_2] = 1;
    // monsterSelections[TILE_MONSTER_1] = 1;

}

function updateAll() {
    if(gameWon) {
        // display win message
        // drawAll();

        ctx[PLAYER].fillStyle = 'white';
        ctx[PLAYER].font = "20px Georgia";
        ctx[PLAYER].fillText(winner + " won!", 6 * canvas[PLAYER].width / 14, 23 * canvas[PLAYER].height / 32);
        ctx[PLAYER].fillText("click to continue", 6 * canvas[PLAYER].width / 14, 25 * canvas[PLAYER].height / 32);
        return;
    } else if(gameLost) {
        // display loss message
        // drawAll();

        ctx[PLAYER].fillStyle = 'white';
        ctx[PLAYER].font = "20px Georgia";
        ctx[PLAYER].fillText("You lost!", 6 * canvas[PLAYER].width / 14, 2 * canvas[PLAYER].height / 4);
        ctx[PLAYER].fillText("click to restart", 8 * canvas[PLAYER].width / 20, 18 * canvas[PLAYER].height / 32);
        return;
    }

    enemyActions();

    monsterUpdate(PLAYER);
    monsterUpdate(ENEMY);

    moveAll(PLAYER);
    moveAll(ENEMY);

    drawAll(PLAYER);
    drawAll(ENEMY);
}

var timeSinceLastRelease = 0;
function monsterUpdate(context) {
    var len = StateController.monstersWaiting[context].length;
    if(len > 0) {
        if(timeSinceLastRelease > 0.1 * fps) { // once per second
            var monster = StateController.monstersWaiting[context].pop();
            monster.visible = true;
            timeSinceLastRelease = 0;
        }
    }

    timeSinceLastRelease++;
}

function moveAll(context) {
    for(id in monsterList[context]) {
      monsterList[context][id].move();
    }

    for(id in towerList[context]) {
      towerList[context][id].move();
    }

    for(id in projectileList[context]) {
      projectileList[context][id].move();
    }
}

function drawAll(context) {

    StateController.drawLevel(context);

    // draw tower selection
    if(selection[context] != null) {
        // console.log("highlight");
        // drawRect(80, 40, TILE_W, TILE_H, 'white', PLAYER);
        drawSelection(context);
    }

    var string = "";
    for(var key in monsterSelections) {
        string += "Type " + (key - MONSTER_OFFSET_NUM) + ": " + monsterSelections[key] + "<br>";
    }
    document.getElementById("monsterText").innerHTML = string;
}

function drawSelection(context) {
    var tower = towerList[context][selection[context]];

    var objectTile = tower.currTile;
    highlightTile(objectTile.row, objectTile.col, 'white', 0.4, tower.context);
    drawRect(20, 20, TILE_W, TILE_H, 'white', PLAYER);
    console.log("drawing at " + objectTile.row, objectTile.col);
    // highlight tiles in range
    // for(var row = objectTile.row - tower.range; row <= objectTile.row + tower.range; row++) {
    //     for(var col = objectTile.col - tower.range; col <= objectTile.col + tower.range; col++) {
    //         if(gridInRange(row, col)) { // in bounds
    //             var tile = StateController.currLevel.tiles[context][row][col];
    //             highlightTile(row, col, 'white', 0.3, context);
    //         }
    //     }
    // }
}

function textDraw(context) {
    ctx[PLAYER].fillStyle = "rgb(250, 250, 250)";
    ctx[PLAYER].font = "20px Helvetica";
    ctx[PLAYER].textAlign = "left";
    ctx[PLAYER].textBaseline = "top";
    ctx[PLAYER].fillText("Lives: " + player.lives, 590, 20);
    ctx[PLAYER].fillText("Gold: " + player.gold, 590, 40);
    ctx[PLAYER].fillText("Income: " + player.income, 590, 60);

    ctx[ENEMY].fillStyle = "rgb(250, 250, 250)";
    ctx[ENEMY].font = "20px Helvetica";
    ctx[ENEMY].textAlign = "left";
    ctx[ENEMY].textBaseline = "top";
    ctx[ENEMY].fillText("Lives: " + enemy.lives, 590, 20);
    ctx[ENEMY].fillText("Gold: " + enemy.gold, 590, 40);
    ctx[ENEMY].fillText("Income: " + enemy.income, 590, 60);

    var tile = pixelToGrid(mouseX, mouseY);
    ctx[currCanvas].fillStyle = 'white';
    // ctx[currCanvas].fillText(mouseX + ", " + mouseY, mouseX, mouseY);
    ctx[currCanvas].fillText(tile.row + ", " + tile.col, mouseX, mouseY);

    if(errorMessages.length > 0) {
        var message = errorMessages.shift();
        var textWidth = ctx[PLAYER].measureText(message).width;
        var xPos = mouseX;
        if(mouseX + textWidth > canvas[PLAYER].width) {
            xPos = canvas[PLAYER].width - textWidth;
        }
        drawErrorMessage(message, 1.0, -0.008, xPos, mouseY, currCanvas);
    }
}

function restartGame() {
    gameWon = false;
    gameLost = false;
    player.reset();

    monsterList = [{}, {}];
    towerList = [{}, {}];
    projectileList = [{}, {}];

    fadeOut(STATE_SELECT, selectScreen, PLAYER);
    clearInterval(timerId);
}
