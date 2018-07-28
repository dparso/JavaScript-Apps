var tower1Pic = document.createElement("img");

var tilePics = [];

var imageList = [
    {varName: tower1Pic, theFile: "player1car.png"},
    {tileType: TILE_GROUND, theFile: "grass.png"},
    {tileType: TILE_WALL, theFile: "world_wall.png"},
    {tileType: TILE_GOAL, theFile: "world_goal.png"},
    {tileType: TILE_KEY, theFile: "world_key.png"},
    {tileType: TILE_DOOR, theFile: "world_door.png"},
    {tileType: TILE_MONSTER_1, theFile: "monster_1.png"},
    {tileType: TILE_MONSTER_2, theFile: "monster_2.png"},
    {tileType: TILE_MONSTER_3, theFile: "monster_3.png"},
    {tileType: TILE_MONSTER_4, theFile: "monster_4.png"},
    {tileType: TILE_TOWER_1, theFile: "tower.png"}
    ];

var picsToLoad = 0;

function countAndLaunchIfReady() {
    picsToLoad--;
    if(!picsToLoad) {
        loadingDoneStartGame();
    }
}

function beginLoadingImage(imgVar, fileName) {
    imgVar.onLoad = countAndLaunchIfReady();
    imgVar.src = "images/" + fileName;
}

function loadImageForTileCode(tileCode, fileName) {
    tilePics[tileCode] = document.createElement("img");
    beginLoadingImage(tilePics[tileCode], fileName);
}

function loadImages() {

    picsToLoad = imageList.length;

    for(var i = 0; i < imageList.length; i++) {
        if(imageList[i].varName != undefined) {
            beginLoadingImage(imageList[i].varName, imageList[i].theFile);
        } else {
            loadImageForTileCode(imageList[i].tileType, imageList[i].theFile);
        }
    }
}