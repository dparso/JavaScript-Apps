var warrior1Pic = document.createElement("img");
var warrior2Pic = document.createElement("img");
var trackPics = [];

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

function loadImageForTrackCode(trackCode, fileName) {
    trackPics[trackCode] = document.createElement("img");
    beginLoadingImage(trackPics[trackCode], fileName);
}

function loadImages() {
    var imageList = [
        {varName: warrior1Pic, theFile: "warrior.png"},
        {tileType: TILE_GROUND, theFile: "world_ground.png"},
        {tileType: TILE_WALL, theFile: "world_wall.png"},
        {tileType: TILE_GOAL, theFile: "world_goal.png"},
        {tileType: TILE_KEY, theFile: "world_key.png"},
        {tileType: TILE_DOOR, theFile: "world_door.png"}
        ];

    picsToLoad = imageList.length;

    for(var i = 0; i < imageList.length; i++) {
        if(imageList[i].varName != undefined) {
            beginLoadingImage(imageList[i].varName, imageList[i].theFile);
        } else {
            loadImageForTrackCode(imageList[i].tileType, imageList[i].theFile);
        }
    }
}