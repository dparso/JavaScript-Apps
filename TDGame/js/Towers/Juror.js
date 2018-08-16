// juror
function JurorClass(type, context) {
    TowerClass.call(this, type, context);
}

JurorClass.prototype = Object.create(TowerClass.prototype);  
JurorClass.prototype.constructor = JurorClass; 

JurorClass.prototype.getRandomTarget = function() {
    var startIndex = Math.floor(Math.random() * this.tilesInRange.length);
    for(var i = this.tilesInRange.length - 1; i >= 0; i--) {
        var index = (i + startIndex) % this.tilesInRange.length;
        var tilePos = this.tilesInRange[index].tile;
        var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
        if(tile.hasMonsters()) {
            this.targets.push(monsterList[this.context][Object.keys(tile.monstersOnTile)[0]]);
            return;
        }
    }
}

JurorClass.prototype.findTarget = function() {
    this.targets = [];
    if(this.targetPriority === TARGET_FIRST) {
        this.getFirstTarget(0);
    } else {
        this.getLastTarget(0);
    }

    for(var t = 0; t < juror_num_targets[this.tier + 1] - 1; t++) {
        this.getRandomTarget();
    }
}