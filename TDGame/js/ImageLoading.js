var tilePics = {};
var imageList = {};
const EXPLOSION = 0;
const FIRE = 1;

imageList[TILE_PATH] = "grass.png";
imageList[TILE_WALL] = "world_gravel.png";
imageList[TILE_WALL_2] = "world_gravel2.png";
imageList[TILE_TREE] = "world_tree.png";
imageList[TILE_MONSTER_START] = "startSpiral.png";
imageList[TILE_MONSTER_END] = "endSpiral.png";

imageList[TILE_TOWER_1] = "Towers/gunner.png";
imageList[TILE_TOWER_2] = "Towers/cannon.png";
imageList[TILE_TOWER_3] = "Towers/glaive.png";
imageList[TILE_TOWER_4] = "Towers/wizard.png";
imageList[TILE_TOWER_5] = "Towers/conduit.png";
imageList[TILE_TOWER_6] = "Towers/juror.png";
imageList[TILE_TOWER_7] = "Towers/reaper.png";
imageList[TILE_TOWER_8] = "Towers/light.png";
imageList[LIGHT_WING_LEFT] = "Towers/light_wing_left copy.png";
imageList[LIGHT_WING_RIGHT] = "Towers/light_wing_right copy.png";
imageList[TEXT_START] = "start.png";
imageList[TEXT_CLICK_CONTINUE] = "click_to_continue.png";

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

var projectilePicList = [["Projectiles/bullet.png"], ["Projectiles/bullet_2.png", "Projectiles/bomb.png"], ["Projectiles/star.png"], ["Projectiles/fireball.png"], [], ["Projectiles/gold_arrow.png"], ["Projectiles/scythe.png"], ["Projectiles/light_ball.png"]]; // conduit has no projectile!
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

function loadImageForTileCode(fileName, tileCode) {
    tilePics[tileCode] = document.createElement("img");
    beginLoadingImage(tilePics[tileCode], fileName);
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

function loadImages() {
    // note: this is unreliable now, as some of these are nested arrays with more pics
    picsToLoad = Object.keys(imageList).length + Object.values(animationList).length + projectilePicList.length + monsterPicList.length;

    for(key in imageList) {
        loadImageForTileCode(imageList[key], key);
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
}