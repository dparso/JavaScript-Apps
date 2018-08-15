var tilePics = {};
var imageList = {};
const EXPLOSION = 0;
const FIRE = 1;

imageList[TILE_PATH] = ["Tiles/grass2.png"];
imageList[TILE_WALL] = ["Tiles/ground/one_horizontal.png",
                        "Tiles/ground/one_vertical.png",
                        "Tiles/ground/two_left_up.png",
                        "Tiles/ground/two_left_down.png",
                        "Tiles/ground/two_right_up.png",
                        "Tiles/ground/two_right_down.png",
                        "Tiles/ground/three_left.png",
                        "Tiles/ground/three_up.png",
                        "Tiles/ground/three_right.png",
                        "Tiles/ground/three_down.png",
                        "Tiles/ground/four.png",
                        "Tiles/ground/one_left.png",
                        "Tiles/ground/one_up.png",
                        "Tiles/ground/one_right.png",
                        "Tiles/ground/one_down.png"];

imageList[TILE_WALL_2] = ["Tiles/ground/one_horizontal.png",
                        "Tiles/ground/one_vertical.png",
                        "Tiles/ground/two_left_up.png",
                        "Tiles/ground/two_left_down.png",
                        "Tiles/ground/two_right_up.png",
                        "Tiles/ground/two_right_down.png",
                        "Tiles/ground/three_left.png",
                        "Tiles/ground/three_up.png",
                        "Tiles/ground/three_right.png",
                        "Tiles/ground/three_down.png",
                        "Tiles/ground/four.png",
                        "Tiles/ground/one_left.png",
                        "Tiles/ground/one_up.png",
                        "Tiles/ground/one_right.png",
                        "Tiles/ground/one_down.png"];

imageList[TILE_TREE] = ["Tiles/tree2.png"];
imageList[TILE_MONSTER_START] = ["startSpiral.png"];
imageList[TILE_MONSTER_END] = ["endSpiral.png"];

var towerPicList = {};
var towerPics = {};
towerPicList[TILE_TOWER_1] = "Towers/gunner.png";
towerPicList[TILE_TOWER_2] = "Towers/cannon.png";
towerPicList[TILE_TOWER_3] = "Towers/glaive.png";
towerPicList[TILE_TOWER_4] = "Towers/wizard.png";
towerPicList[TILE_TOWER_5] = "Towers/conduit.png";
towerPicList[TILE_TOWER_6] = "Towers/wraith.png";
towerPicList[TILE_TOWER_7] = "Towers/reaper.png";
towerPicList[TILE_TOWER_8] = "Towers/solar_prince.png";
towerPicList[TILE_TOWER_9] = "Towers/aether.png";
towerPicList[LIGHT_WING_LEFT] = "Towers/light_wing_left copy.png";
towerPicList[LIGHT_WING_RIGHT] = "Towers/light_wing_right copy.png";
// towerPicList[TEXT_START] = "start.png";
// towerPicList[TEXT_CLICK_CONTINUE] = "click_to_continue.png";

var animationList = {};
var animationPics = [];
animationList[EXPLOSION] = ["Explosion/ball2.png", "Explosion/ball3.png", "Explosion/ball4.png", "Explosion/ball5.png"]; 
animationList[FIRE] = ["Towers/wizard_fire.png"];

/* monster pics are organized as follows:
    monsterPicList[i] belongs to the ith monster
    monsterPicList[i][j] marks the jth position in walking animation
    monsterPicList[i][j][k] specifies the direction the monster is facing, left or right
*/

var monsterPicList = [];
var monsterPics = [];
monsterPicList[TILE_MONSTER_1 - MONSTER_OFFSET_NUM] = [["Monsters/monster_1/monster_1.png"]];
monsterPicList[TILE_MONSTER_2 - MONSTER_OFFSET_NUM] = [["Monsters/monster_2/monster_2_left.png", "Monsters/monster_2/monster_2_right.png"]];
monsterPicList[TILE_MONSTER_3 - MONSTER_OFFSET_NUM] = [["Monsters/monster_3/monster_3.png"]];
monsterPicList[TILE_MONSTER_4 - MONSTER_OFFSET_NUM] = [["Monsters/monster_4/monster_4_left.png", "Monsters/monster_4/monster_4_right.png"]];
monsterPicList[TILE_MONSTER_5 - MONSTER_OFFSET_NUM] = [["Monsters/monster_5/monster_5.png"]];
monsterPicList[TILE_MONSTER_6 - MONSTER_OFFSET_NUM] = [["Monsters/monster_6/monster_6_left.png", "Monsters/monster_6/monster_6_right.png"]];
monsterPicList[TILE_MONSTER_7 - MONSTER_OFFSET_NUM] = [["Monsters/monster_7/monster_7_left.png", "Monsters/monster_7/monster_7_right.png"]];
monsterPicList[TILE_MONSTER_8 - MONSTER_OFFSET_NUM] = [["Monsters/monster_8/monster_8_walk_1_left.png", "Monsters/monster_8/monster_8_walk_1_right.png"], ["Monsters/monster_8/monster_8_walk_2_left.png", "Monsters/monster_8/monster_8_walk_2_right.png"]];

var projectilePicList = [["Projectiles/bullet.png"],
                         ["Projectiles/bullet_2.png", "Projectiles/bomb.png"],
                         ["Projectiles/star.png"], ["Projectiles/fireball.png"], 
                         [],  // conduit has no projectile!
                         ["Projectiles/gold_arrow.png"], 
                         ["Projectiles/scythe.png"], 
                         ["Projectiles/light_ball.png"], 
                         ["Projectiles/in_portal.png", "Projectiles/out_portal.png"]];
var projectilePics = [];

var dragPicList = {};
var dragPics = {};

dragPicList[TILE_TOWER_8] = "Towers/Drag/solar_prince.png";
dragPicList[TILE_TOWER_9] = "Towers/Drag/aether.png";

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

function loadImageForTileCode(fileName, tileCode) {
    var img = document.createElement("img");
    tilePics[tileCode].push(img);
    beginLoadingImage(img, fileName);
}

function loadImageForMonster(fileName, monsterNum, walkAnimation) {
    var img = document.createElement("img");
    monsterPics[monsterNum][walkAnimation].push(img);
    beginLoadingImage(img, fileName);
}

function loadImageForAnimation(index, fileName, animationNum) {
    animationPics[animationNum].push(document.createElement("img"));
    beginLoadingImage(animationPics[animationNum][index], fileName);
}

function loadImageForProjectile(fileName, index) {
    var img = document.createElement("img");
    projectilePics[index].push(img);
    beginLoadingImage(img, fileName);
}

function loadImageForDrag(fileName, towerType) {
    dragPics[towerType] = document.createElement("img");
    beginLoadingImage(dragPics[towerType], fileName);
}

function loadImageForTower(fileName, towerType) {
    towerPics[towerType] = document.createElement("img");
    beginLoadingImage(towerPics[towerType], fileName);    
}

function loadImages() {
    // note: this is unreliable now, as some of these are nested arrays with more pics
    picsToLoad = Object.keys(imageList).length + 
    Object.values(animationList).length + 
    projectilePicList.length + 
    monsterPicList.length + 
    Object.keys(dragPicList).length + 
    Object.keys(towerPicList).length;

    for(key in imageList) {
        tilePics[key] = [];
        for(img in imageList[key]) {
            loadImageForTileCode(imageList[key][img], key);
        }
    }

    for(key in animationList) {
        animationPics.push([]);
        for(img in animationList[key]) {
            loadImageForAnimation(img, animationList[key][img], key);
        }
    }

    for(var monsterNum = 0; monsterNum < monsterPicList.length; monsterNum++) {
        monsterPics.push([]);
        for(var walkAnimation = 0; walkAnimation < monsterPicList[monsterNum].length; walkAnimation++) {
            monsterPics[monsterNum].push([]);
            for(var direction = 0; direction < monsterPicList[monsterNum][walkAnimation].length; direction++) {
                loadImageForMonster(monsterPicList[monsterNum][walkAnimation][direction], monsterNum, walkAnimation);
            }
        }
    }

    for(var i = 0; i < projectilePicList.length; i++) {
        projectilePics.push([]);
        for(var j = 0; j < projectilePicList[i].length; j++) {
            loadImageForProjectile(projectilePicList[i][j], i);
        }
    }

    for(key in dragPicList) {
        loadImageForDrag(dragPicList[key], key);
    }

    for(key in towerPicList) {
        loadImageForTower(towerPicList[key], key);
    }

}