// juror
function JurorClass(type, context) {
    TowerClass.call(this, type, context);
    this.targets = [];
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

JurorClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }

    // technically, Juror doesn't check range of secondary targets, but it'll recalculate them every once in a while, which is fine
    for(var target = 0; target < this.targets.length; target++) {
        if(this.targets[target]) {
            var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target].id, projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, true, this.id, this.context);
            projectileList[this.context][projectile.id] = projectile;
        }
    }
}

// JurorClass.prototype.move = function() {
//     if(!this.active) {
//         return;
//     }

//     if(this.timeSinceTargetCheck > 1000 / fps / TOWER_TARGET_CHECK_RATE) {
//         this.findTarget(); // this is NOT necessary to do every time, computationally speaking
//         this.timeSinceTargetCheck = 0;
//     }
//     this.timeSinceTargetCheck++;

//     // is locally set
//     if(this.type === SOLAR_PRINCE && this.context === PLAYER) console.log(this.target);
//     if(this.targets.length > 0) {
//         // check if target has moved out of range
//         if(this.targets[0]) {
//             if(!this.inRange(this.targets[0].currTile.row, this.targets[0].currTile.col)) {
//                 this.targets = [];
//             } else {
//                 if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
//                     this.attack();
//                     this.timeSinceAttack = 0;
//                 }
//             }
//         } else {
//             this.findTarget();
//         }
//     } else {
//         // deleted since last frame
//         this.findTarget();
//     }

//     this.timeSinceAttack++;
// }