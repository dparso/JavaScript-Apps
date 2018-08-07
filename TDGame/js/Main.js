var canvas = [], ctx = [];

var PLAYER = 0, ENEMY = 1;

var gameWon = false;
var gameLost = false;
var fps = 30;
var timerId = 0; // interval counter

var monsterList = [{}, {}];
var towerList = [{}, {}];
var projectileList = [{}, {}];
var monsterSelections = {}; // these things should be moved elsewhere!
var monsterPath = [[], []]; // the pixel coords for monsters to follow
var fullMonsterPath = [[], []]; // the tile coords for towers to track for first targeting
var selection = [null, null];

var player = new PlayerClass(PLAYER);
var enemy = new PlayerClass(ENEMY);

var StateController = new StateControllerClass(welcomeScreen);
var infoPane = new InfoPaneClass();

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
    // monsterSelections[TILE_MONSTER_1] = 50;
    // monsterSelections[TILE_MONSTER_4] = 3;
    // monsterSelections[TILE_MONSTER_3] = 1;

    // monsterSelections[TILE_MONSTER_2] = 1;
    // monsterSelections[TILE_MONSTER_1] = 1;

    // StateController.changeState(STATE_START, welcomeScreen);
    StateController.changeState(STATE_PLAY, levelOne);
    StateController.placeTower(2, PLAYER, {row: 5, col: 5});

}

function updateAll() {
    if(gameWon) {
        // display win message
        drawAll(PLAYER);
        drawAll(ENEMY);

        ctx[PLAYER].fillStyle = 'white';
        ctx[PLAYER].font = "20px Helvetica";
        ctx[PLAYER].fillText("You won!", 6 * canvas[PLAYER].width / 14, 23 * canvas[PLAYER].height / 32);
        ctx[PLAYER].fillText("click to continue", 6 * canvas[PLAYER].width / 14, 25 * canvas[PLAYER].height / 32);
        return;
    } else if(gameLost) {
        // display loss message
        drawAll(PLAYER);
        drawAll(ENEMY);

        ctx[PLAYER].fillStyle = 'white';
        ctx[PLAYER].font = "20px Helvetica";
        ctx[PLAYER].fillText("You lost!", 6 * canvas[PLAYER].width / 14, 2 * canvas[PLAYER].height / 4);
        ctx[PLAYER].fillText("click to restart", 8 * canvas[PLAYER].width / 20, 18 * canvas[PLAYER].height / 32);
        return;
    }

    playerIncome();

    enemyActions();

    // scale();

    monsterUpdate(PLAYER);
    monsterUpdate(ENEMY);

    moveAll(PLAYER);
    moveAll(ENEMY);

    drawAll(PLAYER);
    drawAll(ENEMY);
}

var timeScale = 0;
function scale() {
    if(timeScale > 1000 / fps * 10) {
        for(var i = 0; i < monsterHealths.length; i++) {
            monsterHealths[i] += 15;
            console.log(monsterHealths[i]);
        }
        timeScale = 0;
    }
    timeScale++;
}


var timeSinceLastIncome = 0;
function playerIncome() {
    if(StateController.state != STATE_PLAY) return;

    if(timeSinceLastIncome > 1000 / fps * INCOME_RATE) {
        player.gainGold(player.income);
        enemy.gainGold(enemy.income);
        timeSinceLastIncome = 0;
    }
    timeSinceLastIncome++;
}

var timeSinceLastRelease = [0, 0];
function monsterUpdate(context) {
    var len = StateController.monstersWaiting[context].length;
    if(len > 0) {
        if(timeSinceLastRelease[context] > 0.05 * fps) {
            var monster = StateController.monstersWaiting[context].pop();
            monster.visible = true;
            timeSinceLastRelease[context] = 0;
        }
    }

    timeSinceLastRelease[context]++;
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
        drawSelection(context);
        infoPane.draw(selection[context], context);
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
    // highlight tiles in range
    for(var row = objectTile.row - tower.properties[RANGE]; row <= objectTile.row + tower.properties[RANGE]; row++) {
        for(var col = objectTile.col - tower.properties[RANGE]; col <= objectTile.col + tower.properties[RANGE]; col++) {
            if(gridInRange(row, col)) { // in bounds
                var tile = StateController.currLevel.tiles[context][row][col];
                highlightTile(row, col, 'white', 0.3, context);
            }
        }
    }
}

function textDraw(context) {
    if(StateController.state == STATE_PLAY) {
        ctx[PLAYER].fillStyle = "rgb(250, 250, 250)";
        ctx[PLAYER].font = "20px Helvetica";
        ctx[PLAYER].textAlign = "left";
        ctx[PLAYER].textBaseline = "top";
        ctx[PLAYER].fillText("Lives: " + player.lives, 570, 10);
        ctx[PLAYER].fillText("Gold: " + player.gold, 570, 30);
        ctx[PLAYER].fillText("Income: " + player.income, 570, 50);
        ctx[PLAYER].fillText("Time until income: " + (INCOME_RATE - Math.floor(timeSinceLastIncome * fps / 1000)), 330, 40);

        ctx[ENEMY].fillStyle = "rgb(250, 250, 250)";
        ctx[ENEMY].font = "20px Helvetica";
        ctx[ENEMY].textAlign = "left";
        ctx[ENEMY].textBaseline = "top";
        ctx[ENEMY].fillText("Lives: " + enemy.lives, 570, 10);
        ctx[ENEMY].fillText("Gold: " + enemy.gold, 570, 30);
        ctx[ENEMY].fillText("Income: " + enemy.income, 570, 50);

        var tile = pixelToGrid(mouseX, mouseY);
        ctx[currCanvas].fillStyle = 'white';
        // ctx[currCanvas].fillText(mouseX + ", " + mouseY, mouseX, mouseY);
        // ctx[currCanvas].fillText(tile.row + ", " + tile.col, mouseX, mouseY);

        // draw all queued messages
        while(messages.length > 0) {
            var message = messages.shift();
            var textWidth = ctx[message.ctx].measureText(message.text).width;
            var xPos = message.x
            if(xPos + textWidth > canvas[message.ctx].width) {
                xPos = canvas[message.ctx].width - textWidth;
            }
            drawMessage(message.text, 1.0, -0.008, xPos, message.y, message.ctx);
        }
    }
    drawTooltip();
}

function drawTooltip() {
    if(tooltip != null) {
        var text = tooltip.text;
        ctx[tooltip.ctx].font = "12px Helvetica"; // set font first for accurate measuring

        var width = ctx[tooltip.ctx].measureText(text).width + TOOLTIP_PADDING * 2;
        var color = "rgb(122, 68, 20)";
        var xOffset = 0, yOffset = 0;
        if(tooltip.x + width > canvas[tooltip.ctx].width) {
            // shift to keep on screen
            xOffset = canvas[tooltip.ctx].width - (tooltip.x + width);
        }

        if(tooltip.y + TOOLTIP_BOX_HEIGHT > canvas[tooltip.ctx].height) {
            // shift to keep on screen
            yOffset = canvas[tooltip.ctx].height - (tooltip.y + TOOLTIP_BOX_HEIGHT);
        }

        drawRect(tooltip.x + xOffset, tooltip.y + yOffset, width, TOOLTIP_BOX_HEIGHT, color, tooltip.ctx);

        ctx[tooltip.ctx].fillStyle = "white";
        ctx[tooltip.ctx].fillText(text, tooltip.x + TOOLTIP_PADDING + xOffset, tooltip.y + yOffset);
    }
}

function restartGame(toState, toLevel) {
    // reset variables & objects

    gameWon = false;
    gameLost = false;

    monsterList = [{}, {}];
    towerList = [{}, {}];
    projectileList = [{}, {}];
    monsterSelections = {};
    monsterPath = [[], []];
    fullMonsterPath = [[], []];
    selection = [null, null];
    StateController.monstersWaiting = [[], []];

    timeSinceLastIncome = 0;
    timeSinceLastRelease = [0, 0];
    timeSinceAction = 0;

    player = new PlayerClass(PLAYER);
    enemy = new PlayerClass(ENEMY);
    prepareEnemy();

    infoPane = new InfoPaneClass();

    clearInterval(timerId);
    fadeOut(toState, toLevel, PLAYER);
}
