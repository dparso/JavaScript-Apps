var canvas = [], ctx = [];

var PLAYER = 0, ENEMY = 1;

var gameWon = false;
var gameLost = false;
var fps = 30;
var timerId = 0; // interval counter
var game_paused = false;
var game_speed = 1;

var monsterList = [{}, {}];
var towerList = [{}, {}];
var projectileList = [{}, {}];
var monsterSelections = {}; // these things should be moved elsewhere!
var monsterPath = [[], []]; // the pixel coords for monsters to follow
var fullMonsterPath = [[], []]; // the tile coords for towers to track for first targeting
var selection = [null, null];
var waitingToStart = true;
var started = false;

var player = new PlayerClass(PLAYER);
var enemy = new PlayerClass(ENEMY);
// enemy.gold = 250;

var StateController = new StateControllerClass(welcomeScreen);
var infoPane = [new InfoPaneClass(PLAYER), new InfoPaneClass(ENEMY)];

window.onload = function() {
    canvas[PLAYER] = document.getElementById('gameCanvas');
    canvas[ENEMY] = document.getElementById('enemyCanvas');

    ctx[PLAYER] = canvas[PLAYER].getContext('2d');
    ctx[ENEMY] = canvas[ENEMY].getContext('2d');

    // disable right click
    $('body').on('contextmenu', '#gameCanvas', function(e){ return false; });
    $('body').on('contextmenu', '#enemyCanvas', function(e){ return false; });

    currCanvas = PLAYER;
    loadImages();
}

function loadingDoneStartGame() {
    waitingToStart = false;
    if(started) {
        startGame();
    }
}

function startGame() {
    started = true;
    if(waitingToStart) return;
    $('#container').fadeIn(1500);
    document.getElementById('container').removeAttribute('hidden');
    document.getElementById('container').removeAttribute('hidden');
    $('#userinfopane').hide();
    $('#enemyinfopane').hide();

    timerId = setInterval(updateAll, 1000 / fps);
    setupInput();

    // StateController.changeState(STATE_START, welcomeScreen);
    StateController.changeState(STATE_PLAY, LEVELS[0]);
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

    if(!game_paused) {
        playerIncome();
        enemyActions();

        // scale();

        monsterUpdate(PLAYER);
        monsterUpdate(ENEMY);

        moveAll(PLAYER);
        moveAll(ENEMY);
    }

    drawAll(PLAYER);
    drawAll(ENEMY);
    drawTooltip();

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

var spiralRotate = 0;
function drawAll(context) {
    StateController.drawLevel(context);
    // draw tower selection
    if(selection[context] != null) {
        drawSelection(context);
    }

    // draw start and end spirals
    var strt = gridToPixel(MONSTER_START[context].row, MONSTER_START[context].col);
    var end = gridToPixel(MONSTER_END[context].row, MONSTER_END[context].col);

    drawBitmapCenteredWithRotation(tilePics[TILE_MONSTER_START], strt.x + TILE_W / 2, strt.y + TILE_H / 2, spiralRotate, context);
    drawBitmapCenteredWithRotation(tilePics[TILE_MONSTER_END], end.x + TILE_W / 2, end.y + TILE_H / 2, spiralRotate, context);

    spiralRotate -= 0.1;
}

function drawSelection(context) {
    infoPane[context].show();
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
    // var tile = pixelToGrid(mouseX, mouseY);
    // ctx[currCanvas].fillStyle = 'white';
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
        drawMessage(message.text, 1.0, -0.008, xPos, message.y, message.color, message.ctx);
    }

    var time = (INCOME_RATE - Math.floor(timeSinceLastIncome * fps / 1000));
    document.getElementById('incometext').innerHTML = "Income: " + player.income.toLocaleString();
    document.getElementById('timetext').innerHTML = "Time until income: " + time;
    document.getElementById('livestext').innerHTML = "Lives: " + player.lives;
    document.getElementById('goldtext').innerHTML = "Gold: " + Math.floor(player.gold).toLocaleString();

    document.getElementById('enemyincometext').innerHTML = "Income: " + enemy.income.toLocaleString();
    document.getElementById('enemytimetext').innerHTML = "Time until income: " + time;
    document.getElementById('enemylivestext').innerHTML = "Lives: " + enemy.lives;
    document.getElementById('enemygoldtext').innerHTML = "Gold: " + Math.floor(enemy.gold).toLocaleString();
}

function drawTooltip() {
    if(tooltip != null) {
        var text = tooltip.text;
        var color = "rgb(122, 68, 20)";

        ctx[tooltip.ctx].font = "12px Helvetica"; // set font first for accurate measuring
        ctx[tooltip.ctx].fillStyle = color;
        ctx[tooltip.ctx].textAlign = "left";
        ctx[tooltip.ctx].textBaseline = "top";
        ctx[tooltip.ctx].globalAlpha = 1.0;

        var width = ctx[tooltip.ctx].measureText(text).width + TOOLTIP_PADDING * 2;
        var yOffset = 0;

        if(tooltip.y + TOOLTIP_BOX_HEIGHT > canvas[tooltip.ctx].height) {
            // shift to keep on screen
            yOffset = canvas[tooltip.ctx].height - (tooltip.y + TOOLTIP_BOX_HEIGHT);
        }

        var xPos;
        if(tooltip.ctx == PLAYER) {
            xPos = 620 - width;
        } else {
            xPos = 70;
        }

        drawRect(xPos, tooltip.y + yOffset, width, TOOLTIP_BOX_HEIGHT, color, tooltip.ctx);

        ctx[tooltip.ctx].fillStyle = "white";
        ctx[tooltip.ctx].fillText(text, xPos + TOOLTIP_PADDING, tooltip.y + yOffset);
    }
}

function nextLevel() {
    gameWon = false;
    gameLost = false;

    StateController.levelNum++;
    if(StateController.levelNum > LEVELS.length - 1) {
        console.log("No more levels!");
        restartGame();
        return;
    }

    monsterList = [{}, {}];
    towerList = [{}, {}];
    projectileList = [{}, {}];
    monsterSelections = {};
    monsterPath = [[], []];
    fullMonsterPath = [[], []];
    selection = [null, null];
    StateController.monstersWaiting = [[], []];
    availableTowerLocations = [];
    upgradeableTowers = [];

    timeSinceLastIncome = 0;
    timeSinceLastRelease = [0, 0];
    timeSinceAction = 0;

    player = new PlayerClass(PLAYER);
    enemy = new PlayerClass(ENEMY);
    prepareEnemy();

    infoPane = [new InfoPaneClass(PLAYER), new InfoPaneClass(ENEMY)];

    clearInterval(timerId);
    fadeOut(STATE_PLAY, LEVELS[StateController.levelNum], PLAYER);
}

function restartGame() {
    // reset variables & objects

    gameWon = false;
    gameLost = false;

    StateController.levelNum = 1;

    monsterList = [{}, {}];
    towerList = [{}, {}];
    projectileList = [{}, {}];
    monsterSelections = {};
    monsterPath = [[], []];
    fullMonsterPath = [[], []];
    selection = [null, null];
    StateController.monstersWaiting = [[], []];
    availableTowerLocations = [];
    upgradeableTowers = [];

    timeSinceLastIncome = 0;
    timeSinceLastRelease = [0, 0];
    timeSinceAction = 0;

    player = new PlayerClass(PLAYER);
    enemy = new PlayerClass(ENEMY);
    prepareEnemy();

    infoPane = [new InfoPaneClass(PLAYER), new InfoPaneClass(ENEMY)];

    clearInterval(timerId);
    fadeOut(STATE_PLAY, LEVELS[0], PLAYER);
}

// HTML button functions

function pauseGame() {
    if(!game_paused) {
        document.getElementById('pausebutton').src = "images/play.png";
        game_paused = true;
    } else {
        document.getElementById('pausebutton').src = "images/pause.png";
        game_paused = false;
    }
}

function fastGame() {
    if(game_speed == 1) {
        // speed up
        clearInterval(timerId);
        timerId = setInterval(updateAll, 1000 / fps / 2);
        game_speed = 2;

        document.getElementById('fastforwardbutton').src = "images/fast-fast-forward.png";
    } else {
        // slow down
        clearInterval(timerId);
        timerId = setInterval(updateAll, 1000 / fps);
        game_speed = 1;

        document.getElementById('fastforwardbutton').src = "images/fast-forward.png";
    }
}

function killMonsters() {
    for(var context = 0; context <= 1; context++) {
        for(monster in monsterList[context]) {
            monsterList[context][monster].die(true);
        }
    }
}

function destroyTowers() {
    for(var context = 0; context <= 1; context++) {
        for(tower in towerList[context]) {
            StateController.sellTower(tower, context);
        }
    }
    upgradeableTowers = [];

    clearSelection(PLAYER);
    clearSelection(ENEMY);
}
