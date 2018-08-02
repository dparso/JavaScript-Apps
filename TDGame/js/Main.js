var canvas, canvasContext;

var gameWon = false;
var winner = "";
var fps = 30;
var timerId = 0; // interval counter

var ballList = [];
var monsterList = {};
var towerList = {};
var projectileList = {};
var monsterSelections = {}; // these things should be moved elsewhere!
var monsterPath = [];

var StateController = new StateControllerClass(welcomeScreen);

function hi() {
    console.log("hello!");
}

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    loadImages();
}

function loadingDoneStartGame() {  
    timerId = setInterval(updateAll, 1000 / fps);

    setupInput();
    StateController.changeState(STATE_START, welcomeScreen);
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
    StateController.drawLevel();

    var string = "";
    for(var key in monsterSelections) {
        string += "Type " + key + ": " + monsterSelections[key] + "<br>";
    }
    document.getElementById("monsterText").innerHTML = string;
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
    canvasContext.fillText(mouseX + ", " + mouseY, mouseX, mouseY);
}
