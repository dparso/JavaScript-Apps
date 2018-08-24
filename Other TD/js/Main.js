var canvas, ctx, bg_canvas, bg_ctx;

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
var monsterPath = []; // the pixel coords for monsters to follow
var fullMonsterPath = []; // the tile coords for towers to track for first targeting
var selection = null;
var waitingToStart = true;
var started = false;

var player = new PlayerClass(PLAYER);
var enemy = new PlayerClass(ENEMY);
// enemy.gold = 20;
// enemy.income = 5.0;

// player.gold = 500000000000;

var StateController = new StateControllerClass(welcomeScreen);
var infoPane = new InfoPaneClass(PLAYER);

var startingSize;


// setup values
var difficulty = EASY;
var race = LIGHT;
var lightDescription = "Light. Fight for the preservation of life and balance of the world.";
var darkDescription = "Dark. Extinguish the flame of life and cover the lands in shadow.";
var diffDescriptions = {"Easy": "Gold is plentiful, monsters are weak, and your enemy is foolish.", "Normal": "Reasonable prices and a competent enemy.", "Hard": "Scavenge for gold and fear your enemy.", "Insane": "We'll get started on your tombstone."};

window.onload = function() {
    canvas = document.getElementById('gameCanvas');

    // tiles will be drawn to the background only once, or unless some change occurs
    bg_canvas = document.getElementById('gameBackgroundCanvas');

    ctx = canvas.getContext('2d');
    bg_ctx = bg_canvas.getContext('2d');

    // disable right click
    $('body').on('canvasmenu', '#gameCanvas', function(e){ return false; });

    startingSize = {width: canvas.width, height: canvas.height};

    openSelect();
    loadImages();
}

function loadingDoneStartGame() {
    waitingToStart = false;
    if(started) {
        startGame();
    }
}

function startGame() {
    if($('#levelconfig').is(":hidden")) {
        $('#start').fadeOut(500);
        // user pressed start: bring them to the game configuration screen
        $('#levelconfig').fadeIn(500);
        // Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultOpen").click();

        $('#racedescription').text(lightDescription);

        /*if the user clicks anywhere outside the select box,
        then close all select boxes:*/
        document.addEventListener("click", closeAllSelect);
    }
}

var pth;
var diagonals = true;
var solver = new AStarSearcher(LEVELS[0].grid, MONSTER_START, MONSTER_END, diagonals);
var found = false;
function playGame() {
    started = true;
    if(waitingToStart) return;
    $('#container').fadeIn(1500);
    $('#userinfopane').hide();
    $('#monstergrid').hide();
    $('#optionsnav').show();

    timerId = setInterval(updateAll, 1000 / fps);
    setupInput();

    // StateController.changeState(STATE_START, welcomeScreen);
    StateController.changeState(STATE_PLAY, LEVELS[0]);
    refreshBackground();

}

function refreshBackground() {
    StateController.currLevel.tilesDraw();
}

function updateAll(override = false) {
    if(gameWon) {
        // display win message
        drawAll();

        ctx.fillStyle = 'white';
        ctx.font = "68px Stranger";
        ctx.fillText("You won!", 6 * canvas.width / 14, 23 * canvas.height / 32);
        ctxfillText("click to continue", 6 * canvas.width / 14, 25 * canvas.height / 32);
        return;
    } else if(gameLost) {
        // display loss message
        drawAll();

        ctx.fillStyle = 'white';
        ctx.font = "68px Stranger";
        ctx.fillText("You lost!", 6 * canvas.width / 14, 2 * canvas.height / 4);
        ctx.fillText("click to continue", 8 * canvas.width / 20, 18 * canvas.height / 32);
        return;
    }

    if(!game_paused || override) {
        sendWave();
        enemyActions();

        // scale();

        moveAll();
    }

    drawAll();
    // drawTooltip();
    if(!game_paused) {
        if(!found) {
            found = solver.findPath();
        } else {
            pth = solver.makePath();
            for(var i = 0; i < pth.length; i++) {
                highlightTile(pth[i].row, pth[i].col, 'red', 0.5);
            }
        }
    }

    console.log(solver.openSet.heap.length);
    for(var i = 0; i < solver.openSet.heap.length; i++) {
        // console.log(solver.openSet.heap[i].gridPos.row + ", " + solver.openSet.heap[i].gridPos.col)
        highlightTile(solver.openSet.heap[i].gridPos.row, solver.openSet.heap[i].gridPos.col, 'white', 0.5);
    }
    for(var row = 0; row < TILE_ROWS; row++) {
        for(var col = 0; col < TILE_COLS; col++) {
            if(solver.tracker[row][col].visited) {
                highlightTile(row, col, 'gray', 0.5);
            }
        }

    }
}

function validateMonsters() {
    // make sure that monsterIDs on tiles correspond to real monsters in monsterList
    for(var row = 0; row < TILE_ROWS; row++) {
        for(var col = 0; col < TILE_COLS; col++) {
            let tile = StateController.currLevel.tiles[PLAYER][row][col];
            if(tile.hasMonsters()) {
                Object.keys(tile.monstersOnTile).forEach(
                    ((monster) => {
                        if(monsterList[PLAYER][monster] === undefined) {
                            debugger;
                        }
                    })
                );
            }
        }
    }
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

function playerIncome() {
    player.gainGold(player.income);
    enemy.gainGold(enemy.income);
}

var timeSinceLastWave = 0;
var gaveIncome = false;
function sendWave() {
    if(timeSinceLastWave > WAVE_RATE * fps) {
        if(!gaveIncome) {
            playerIncome();
            gaveIncome = true;
        }

        if(monsterUpdate(PLAYER) && monsterUpdate(ENEMY)) {
            timeSinceLastWave = 0;
            gaveIncome = false;
        }
    }
    timeSinceLastWave++;
}

var monsterReleaseSpeed = 0.15;
var timeSinceLastRelease = [monsterReleaseSpeed * fps + 1, monsterReleaseSpeed * fps + 1];

function monsterUpdate(owner) {
    var len = StateController.monstersWaiting[owner].length;
    if(len > 0) {
        if(timeSinceLastRelease[owner] > monsterReleaseSpeed * fps) {
            // while(StateController.monstersWaiting[owner].length > 0) {
            var monster = StateController.monstersWaiting[owner].shift();
            monsterList[owner][monster.id] = monster;
            monster.visible = true;
            // }
            timeSinceLastRelease[owner] = 0;
        }
    } else {
        return true;
    }

    timeSinceLastRelease[owner]++;
    return false;
}

function moveAll() {
    for(var owner = PLAYER; owner <= ENEMY; owner++) {
        for(id in monsterList[owner]) {
          monsterList[owner][id].move();
        }

        for(id in towerList[owner]) {
          towerList[owner][id].move();
        }

        for(id in projectileList[owner]) {
          projectileList[owner][id].move();
        }
    }
}

var spiralRotate = 0;
function drawAll() {
    StateController.drawLevel();
    // draw tower selection
    if(selection !== null) {
        drawSelection(PLAYER);
    }

    // draw start and end spirals
    var strt = gridToPixel(MONSTER_START.row, MONSTER_START.col);
    var end = gridToPixel(MONSTER_END.row, MONSTER_END.col);

    drawBitmapCenteredWithRotation(tilePics[TILE_MONSTER_START][0], strt.x + TILE_W / 2, strt.y + TILE_H / 2, spiralRotate);
    drawBitmapCenteredWithRotation(tilePics[TILE_MONSTER_END][0], end.x + TILE_W / 2, end.y + TILE_H / 2, spiralRotate);

    // var colors = ['white', 'yellow', 'pink', 'green', 'blue', 'purple', 'gray', 'black', 'black']
    // for(var i = 0; i < towerLocationQueue.length; i++) {
    //     highlightTile(towerLocationQueue[i].tile.row, towerLocationQueue[i].tile.col, colors[towerLocationQueue[i].pathCount], 0.5, ENEMY);
    // }

    spiralRotate -= 0.1;
}

function drawSelection(owner) {
    infoPane.show();
    var tower = towerList[owner][selection];

    var objectTile = tower.currTile;
    highlightTile(objectTile.row, objectTile.col, 'white', 0.4);
    // highlight tiles in range
    for(var row = objectTile.row - tower.properties[RANGE]; row <= objectTile.row + tower.properties[RANGE]; row++) {
        for(var col = objectTile.col - tower.properties[RANGE]; col <= objectTile.col + tower.properties[RANGE]; col++) {
            if(gridInRange(row, col)) { // in bounds
                var tile = StateController.currLevel.tiles[row][col];
                highlightTile(row, col, 'white', 0.3);
            }

        }
    }
}

function textDraw() {
    var tile = pixelToGrid(mouseX, mouseY);
    ctx.fillStyle = 'white';
    // ctx.fillText(mouseX + ", " + mouseY, mouseX + 10, mouseY + 30);
    ctx.fillText(tile.row + ", " + tile.col, mouseX + 10, mouseY + 10);

    // draw all queued messages
    while(messages.length > 0) {
        var message = messages.shift();
        var textWidth = ctx.measureText(message.text).width;
        var xPos = message.x
        if(xPos + textWidth > canvas.width) {
            xPos = canvas.width - textWidth;
        }
        drawMessage(message.text, 1.0, -0.008, xPos, message.y, message.color, message.ctx);
    }

    var time = Math.max(0, (WAVE_RATE - Math.floor(timeSinceLastWave * fps / 1000)));
    let timeText = "Next wave in " + time;
    if(time == 0) {
        timeText = "Releasing wave!";
    }

    document.getElementById('incometext').innerHTML = "Income: " + player.income.toLocaleString();
    document.getElementById('timetext').innerHTML = timeText;
    document.getElementById('livestext').innerHTML = "Lives: " + player.lives;
    document.getElementById('goldtext').innerHTML = "Gold: " + Math.floor(player.gold).toLocaleString();

    document.getElementById('enemyincometext').innerHTML = "Income: " + enemy.income.toLocaleString();
    document.getElementById('enemytimetext').innerHTML = timeText;
    document.getElementById('enemylivestext').innerHTML = "Lives: " + enemy.lives;
    document.getElementById('enemygoldtext').innerHTML = "Gold: " + Math.floor(enemy.gold).toLocaleString();
}

// function drawTooltip() {
//     if(tooltip !== null) {
//         var text = tooltip.text;
//         var color = "rgb(122, 68, 20)";

//         ctx[tooltip.ctx].font = "12px Zombie"; // set font first for accurate measuring
//         ctx[tooltip.ctx].fillStyle = color;
//         ctx[tooltip.ctx].textAlign = "left";
//         ctx[tooltip.ctx].textBaseline = "top";
//         ctx[tooltip.ctx].globalAlpha = 1.0;

//         var width = ctx[tooltip.ctx].measureText(text).width + TOOLTIP_PADDING * 2;
//         var yOffset = 0;

//         if(tooltip.y + TOOLTIP_BOX_HEIGHT > canvas[tooltip.ctx].height) {
//             // shift to keep on screen
//             yOffset = canvas[tooltip.ctx].height - (tooltip.y + TOOLTIP_BOX_HEIGHT);
//         }

//         var xPos;
//         if(tooltip.ctx === PLAYER) {
//             xPos = 620 - width;
//         } else {
//             xPos = 70;
//         }

//         drawRect(xPos, tooltip.y + yOffset, width, TOOLTIP_BOX_HEIGHT, color, tooltip.ctx);

//         ctx[tooltip.ctx].fillStyle = "white";
//         ctx[tooltip.ctx].fillText(text, xPos + TOOLTIP_PADDING, tooltip.y + yOffset);
//     }
// }

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
    monsterPath = [];
    fullMonsterPath = [];
    selection = null;
    StateController.monstersWaiting = [[], []];
    availableTowerLocations = [];
    upgradeableTowers = [];
    game_speed = 1;

    monsterCounts = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
    monsterLevels = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]];
    REAPER_UNIQUE = [0, 0]; // only one reaper per side
    SOLAR_PRINCE_UNIQUE = [0, 0]; // only one reaper per side

    REAPER_UNIQUE = [0, 0];

    timeSinceLastIncome = 0;
    timeSinceLastRelease = [0, 0];
    timeSinceAction = 0;

    player = new PlayerClass(PLAYER);
    enemy = new PlayerClass(ENEMY);
    prepareEnemy();

    infoPane = new InfoPaneClass();

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
    monsterPath = [];
    fullMonsterPath = [];
    selection = null;
    StateController.monstersWaiting = [[], []];
    availableTowerLocations = [];
    upgradeableTowers = [];
    game_speed = 1;

    REAPER_UNIQUE = [0, 0];

    timeSinceLastIncome = 0;
    timeSinceLastRelease = [0, 0];
    timeSinceAction = 0;

    player = new PlayerClass(PLAYER);
    enemy = new PlayerClass(ENEMY);
    prepareEnemy();

    infoPane = new InfoPaneClass(PLAYER);

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
    if(game_speed === 1) {
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
    for(var owner = 0; owner <= 1; owner++) {
        for(monster in monsterList[owner]) {
            monsterList[owner][monster].die(true);
        }
    }
    StateController.monstersWaiting = [[], []];
}

function destroyTowers() {
    for(var owner = 0; owner <= 1; owner++) {
        for(tower in towerList[owner]) {
            StateController.sellTower(tower, owner);
        }
    }
    upgradeableTowers = [];

    clearSelection(PLAYER);
    clearSelection(ENEMY);
}

var menuShowing = 0;
function scrollMenu(direction) {
    if(menuShowing) {
        $('#infopanelabel').text("Towers");
        $('#towergrid').show();
        $('#monstergrid').hide();
        menuShowing = Math.abs(menuShowing - 1);
    } else {
        $('#infopanelabel').text("Monsters");
        $('#monstergrid').show();
        $('#towergrid').hide();
        menuShowing = Math.abs(menuShowing - 1);
    }
}

function selectTower(type) {
    if(player.gold < towerCosts[type]) {
        queueMessage("Insufficient gold!", TILE_H * (TILE_ROWS + 1) / 2, TILE_W * (TILE_COLS + 1) / 2, PLAYER);
    } else {
        setDrag(type + TOWER_OFFSET_NUM, TILE_H * (TILE_ROWS + 1) / 2, TILE_W * (TILE_COLS + 1) / 2, true);
    }
}

function sendMonster(type) {
    if(player.gold < monsterCosts[PLAYER][type]) {
        queueMessage("Insufficient gold!", TILE_H * (TILE_ROWS + 1) / 2, TILE_W * (TILE_COLS + 1) / 2, PLAYER);
    } else {
        StateController.sendMonster(type, ENEMY);
    }
}

function updateGridTooltip() {
    // there must be a better way to do this, but this is how it is now 
    for(var i = 0; i < NUM_TOWERS; i++) {
        let tooltipID = "tower" + (i + 1) + "Tooltip";
        let costText = towerNames[i] + ": " + towerCosts[i].toLocaleString();
        document.getElementById(tooltipID).innerHTML = costText + "<br>" + towerDescriptions[i] + "<br>" + "Hotkey: " + (i + 1);
    }

    for(var i = 0; i < NUM_MONSTERS; i++) {
        let tooltipID = "monster" + (i + 1) + "Tooltip";
        let costText = monsterNames[i] + ": " + monsterCosts[PLAYER][i].toLocaleString();
        // $(tooltipID).text(costText + "<br />" + towerDescriptions[i]);
        document.getElementById(tooltipID).innerHTML = costText + "<br>" + monsterDescriptions[i];
    }
}

function selectTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// note: this will open *all* dropdowns!
function openSelect() {
    var customElement, i, j, selElmnt, a, b, c;

    /* look for any elements with the class "custom-select": */
    customElement = document.getElementsByClassName("custom-select");
    for (i = 0; i < customElement.length; i++) {
        selElmnt = customElement[i].getElementsByTagName("select")[0];
        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        customElement[i].appendChild(a);
        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 0; j < selElmnt.length; j++) {
            /*for each option in the original select element,
            create a new DIV that will act as an option item:*/
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function(e) {
                /*when an item is clicked, update the original select box,
                and the selected item:*/
                var y, i, k, s, h;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                h = this.parentNode.previousSibling;
                for (i = 0; i < s.length; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        for (k = 0; k < y.length; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        customElement[i].appendChild(b);
        a.addEventListener("click", function(e) {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }
}

function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");

    // adjust current difficulty
    let diff = y[0].innerHTML;
    $('#diffdescription').text(diffDescriptions[diff]);

    for (i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

function switchRace() {
    if(race === LIGHT) {
        race = DARK;
        $('#racedescription').text(darkDescription);
    } else {
        race = LIGHT;
        $('#racedescription').text(lightDescription);
    }
}

function hideMenu() {
    if($('#levelconfig').is(":visible")) {
        $('#levelconfig').fadeOut(500);

        $('#start').fadeIn(500);
    }    
}

function advanceFrame() {
    updateAll(true);
}

// adjust canvas scale to match window size
function setCanvasScale() {
    if(StateController.state == STATE_PLAY) {
        let widthRatio = Math.min(1, window.innerWidth / (1.0 * startingSize.width));
        let heightRatio = Math.min(1, window.innerHeight / (1.0 * startingSize.height));

        ctx.setTransform(widthRatio, 0, 0, heightRatio, 0, 0);
        bg_ctx.setTransform(widthRatio, 0, 0, heightRatio, 0, 0);
        refreshBackground();
    }
}