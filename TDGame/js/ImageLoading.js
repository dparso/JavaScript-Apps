var tilePics = {};
var imageList = {};
const EXPLOSION = 0;

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
imageList[TILE_MONSTER_5] = "monster_5.png";
imageList[TILE_TOWER_1] = "cannon.png";
imageList[TILE_TOWER_2] = "gunner.png";
imageList[TEXT_START] = "start.png";
imageList[TEXT_CLICK_CONTINUE] = "click_to_continue.png";

var animationList = {};
var animationPics = [];
animationList[EXPLOSION] = ["Explosion/ball2.png", "Explosion/ball3.png", "Explosion/ball4.png", "Explosion/ball5.png"]; 

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

function loadImageForAnimation(animationNum, index, fileName) {
    animationPics[animationNum].push(document.createElement("img"));
    beginLoadingImage(animationPics[animationNum][index], fileName);
}

function loadImages() {
    picsToLoad = Object.keys(imageList).length + Object.keys(animationList).length;

    for(key in imageList) {
        loadImageForTileCode(key, imageList[key]);
    }

    for(key in animationList) {
        animationPics.push([]);
        for(img in animationList[key]) {
            loadImageForAnimation(key, img, animationList[key][img]);
        }
    }
}