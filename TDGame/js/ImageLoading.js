var tilePics = {};
var imageList = {};

imageList[TILE_GROUND] = "grass.png";
imageList[TILE_WALL] = "world_gravel.png";
imageList[TILE_WALL_2] = "world_gravel2.png";
imageList[TILE_TREE] = "world_tree.png";
imageList[TILE_MONSTER_START] = "grass.png";
imageList[TILE_MONSTER_END] = "grass.png";
imageList[TILE_MONSTER_1] = "monster_1.png";
imageList[TILE_MONSTER_2] = "monster_2.png";
imageList[TILE_MONSTER_3] = "monster_3.png";
imageList[TILE_MONSTER_4] = "monster_4.png";
imageList[TILE_TOWER_1] = "cannon.png";
imageList[TILE_TOWER_2] = "gunner.png";
imageList[TEXT_START] = "start.png";
imageList[TEXT_CLICK_CONTINUE] = "click_to_continue.png";


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
    picsToLoad = Object.keys(imageList).length;

    for(key in imageList) {
        loadImageForTileCode(key, imageList[key]);
    }
}