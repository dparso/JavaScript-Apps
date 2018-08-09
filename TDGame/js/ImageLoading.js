var tilePics = {};
var imageList = {};
const EXPLOSION = 0;
const FIRE = 1;

imageList[TILE_GROUND] = "grass.png";
imageList[TILE_WALL] = "world_gravel.png";
imageList[TILE_WALL_2] = "world_gravel2.png";
imageList[TILE_TREE] = "world_tree.png";
imageList[TILE_MONSTER_START] = "grass.png";
imageList[TILE_MONSTER_END] = "grass.png";
imageList[TILE_MONSTER_1] = "Monsters/monster_1.png";
imageList[TILE_MONSTER_2] = "Monsters/monster_2.png";
imageList[TILE_MONSTER_3] = "Monsters/monster_3.png";
imageList[TILE_MONSTER_4] = "Monsters/monster_4.png";
imageList[TILE_MONSTER_5] = "Monsters/monster_5.png";
imageList[TILE_MONSTER_6] = "Monsters/monster_6.png";
imageList[TILE_MONSTER_7] = "Monsters/monster_7_2.png";
imageList[TILE_MONSTER_8] = "Monsters/monster_8_2.png";
imageList[TILE_TOWER_1] = "Towers/gunner.png";
imageList[TILE_TOWER_2] = "Towers/cannon.png";
imageList[TILE_TOWER_3] = "Towers/glaive.png";
imageList[TILE_TOWER_4] = "Towers/wizard.png";
imageList[TILE_TOWER_5] = "Towers/conduit.png";
imageList[TEXT_START] = "start.png";
imageList[TEXT_CLICK_CONTINUE] = "click_to_continue.png";

var animationList = {};
var animationPics = [];
animationList[EXPLOSION] = ["Explosion/ball2.png", "Explosion/ball3.png", "Explosion/ball4.png", "Explosion/ball5.png"]; 
animationList[FIRE] = ["Towers/wizard_fire.png"];

var projectilePicList = [["Projectiles/bullet.png"], ["Projectiles/bullet_2.png", "Projectiles/bomb.png"], ["Projectiles/star.png"], ["Projectiles/fireball.png"]];
var projectilePics = [];

var picsToLoad = 0;

function countAndLaunchIfReady() {
    picsToLoad--;
    if(!picsToLoad) {
        for(var i = 0; i < projectilePics.length; i++) {
            for(var j = 0; j < projectilePics[i].length; j++) {
            }
        }
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

function loadImageForProjectile(fileName, index) {
    var img = document.createElement("img");
    projectilePics[index].push(img);
    beginLoadingImage(img, fileName);
}

function loadImages() {
    // note: this is unreliable now, as some of these are nested arrays with more pics
    picsToLoad = Object.keys(imageList).length + Object.values(animationList).length + projectilePicList.length;

    for(key in imageList) {
        loadImageForTileCode(key, imageList[key]);
    }

    for(key in animationList) {
        animationPics.push([]);
        for(img in animationList[key]) {
            loadImageForAnimation(key, img, animationList[key][img]);
        }
    }

    for(var i = 0; i < projectilePicList.length; i++) {
        projectilePics.push([]);
        for(var j = 0; j < projectilePicList[i].length; j++) {
            loadImageForProjectile(projectilePicList[i][j], i);
        }
    }
}