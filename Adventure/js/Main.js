
var canvas, canvasContext;

var blueWarrior = new warriorClass(warrior1Pic, "Warrior");

var startPositions = []; // keeps track of where warriors were placed

var gameWon = false;
var winner = "";

window.onload = function() {

    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    // randomizeMap();

    // drawRect(0, 0, canvas.width, canvas.height, 'black');   
    // drawText("LOADING IMAGES", canvas.width / 2, canvas.height / 2, 'white');

    loadImages();
}

function loadingDoneStartGame() {  
    var fps = 30;
    setInterval(updateAll, 1000 / fps);

    setupInput();

    loadLevel(levelOne);
}

function loadLevel(level) {
    tracks = level.map(function(arr) {
        return arr.slice();
    }); // copy by value

    blueWarrior.reset();
}

function updateAll() {
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

function moveAll() {
    blueWarrior.move();
}

function clearScreen() {
     drawRect(0, 0, canvas.width, canvas.height, 'black');   
}

function drawAll() {
    // clearScreen();
    tracksDraw();
    document.getElementById("keyText").innerHTML = "Keys: " + blueWarrior.keys;
    blueWarrior.draw();
}