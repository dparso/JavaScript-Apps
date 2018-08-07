// tower properties
var TOWER_ID = [0, 0];

var towerRanges = [3, 5, 3, 5];
var towerDamages = [6.0, 1.5, 5.0, 20];
var towerAttackSpeeds = [1, 6, 3, 5];
var towerCosts = [20, 12, 50, 100];
var towerNames = ["Cannon", "Shooter", "Glaive", "Wizard"];

const TARGET_FIRST = 0;
const TARGET_LAST = 1;
const TARGET_PRIORITIES = [TARGET_FIRST, TARGET_LAST];  
const PRIORITY_NAMES = ["first", "last"];

function towerRotates(type) {
    return type < 3;
}

function TowerClass(type, context) {
    // positions
    this.x;
    this.y;
    this.currTile;
    this.context = context;

    this.angle = 0;
    this.fireAngle = 0; // for wizards
    this.type = type;

    // upgrades
    // this.upgrades = [-1, -1, -1];
    this.tier = -1;
    this.properties = [towerDamages[type], towerRanges[type], towerAttackSpeeds[type]];

    this.id = TOWER_ID[this.context]++;
    this.timeSinceAttack = (1000 / fps) / this.properties[ATTACK_SPEED]; // allow immediate firing
    this.active = false; // drag & drop shouldn't be firing
    this.visible = false;
    this.killCount = 0;
    this.value = towerCosts[type] / 2;
    this.targets = [];
    this.targetPriority = TARGET_FIRST;

    this.classType = "tower";

    this.img = tilePics[this.type + TOWER_OFFSET_NUM];

    this.reset = function() {
        this.currTile = pixelToGrid(this.x, this.y);
        this.findTarget();
        this.active = false; // might not want this here
    } // end of towerReset

    this.getFirstTarget = function(toIndex) {
        // follow the path, end -> start, and attack the first monster in range
        for(var tileNum = 0; tileNum < fullMonsterPath[context].length; tileNum++) {
            var tilePos = fullMonsterPath[context][tileNum];
            if(this.inRange(tilePos.row, tilePos.col)) {
                var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
                if(tile.hasMonsters()) {
                    // found our target!
                    this.targets[toIndex] = monsterList[this.context][tile.monstersOnTile.values().next().value];
                    return;
                }
            }
        }
    }

    this.getLastTarget = function(toIndex) {
        // last
        for(var tileNum = fullMonsterPath[context].length - 1; tileNum > 0; tileNum--) {
            var tilePos = fullMonsterPath[context][tileNum];
            if(this.inRange(tilePos.row, tilePos.col)) {
                var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
                if(tile.hasMonsters()) {
                    // found our target!
                    this.targets[toIndex] = monsterList[this.context][tile.monstersOnTile.values().next().value];
                    return;
                }
            }
        }
    }

    this.findTarget = function() {
        if(this.type == 3 && this.tier == tier_costs.length - 1) {
            // wizard: two targets!
            this.getFirstTarget(0);
            this.getLastTarget(1);
        }
        if(this.targetPriority == TARGET_FIRST) {
            this.getFirstTarget(0);
        } else {
            this.getLastTarget(0);
        }
    }

    this.move = function() {
        if(!this.active) {
            return;
        }

        this.findTarget(); // this is NOT necessary

        // is locally set
        if(this.targets[0]) {
            // is alive
            if(this.targets[0].health > 0) {
                // check if target has moved out of range
                if(Math.abs(this.targets[0].currTile.row - this.currTile.row) > this.properties[RANGE] || Math.abs(this.targets[0].currTile.col - this.currTile.col) > this.properties[RANGE]) {
                    this.targets[0] = null;
                } else {
                    this.track({x: this.targets[0].x + TILE_W / 2, y: this.targets[0].y + TILE_H / 2});
                    if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
                        this.attack();
                        this.timeSinceAttack = 0;
                    }
                }
            } else {
                this.findTarget();       
            }
        } else {
            this.findTarget();
        }
        this.timeSinceAttack++;
    }

    this.track = function(point) {
        this.angle = Math.atan2(point.y - this.y, point.x - this.x);     
        // would like to lead the target a bit, but simply adding to this angle in the direction
        // of change doesn't work   
    }

    this.attack = function() {
        var dmg = this.properties[DAMAGE];
        var atk = this.properties[ATTACK_SPEED];
        if(atk > fps) {
            // could put this elsewhere to avoid computation every shot
            // maximum shots per second is fps, so allow greater firing speed by adjusting damage
            // solve for diff: dmg * atk = (dmg + diff) * fps
            var diff = dmg * atk / fps - dmg;
            dmg += diff;
        }
        for(var target = 0; target < this.targets.length; target++) {
            var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], this.type, dmg, this.id, this.context);
            projectileList[this.context][projectile.id] = projectile;            
        }

    }

    this.draw = function() {
        if(this.visible) {
            var angle = this.angle;
            if(!towerRotates(this.type)) {
                angle = 0;
            }
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, angle, this.context);
            if(this.type == 3) {
                // wizard: draw fireball on staff
                drawBitmapCenteredWithRotation(animationPics[FIRE][0], this.x + 12, this.y - 5, this.fireAngle++, this.context);
                this.fireAngle %= 360;
            }
        }
    }

    this.inRange = function(row, col) {
        return Math.abs(row - this.currTile.row) <= this.properties[RANGE] && Math.abs(col - this.currTile.col) <= this.properties[RANGE];
    }

    this.notifyKilledMonster = function(type) {
        this.killCount++;
        // some sort of experience later on
    }

    // tells whether this tower has any upgrades available
    this.canUpgrade = function() {
        return this.tier < tier_costs.length;
    }

    this.checkUpgrade = function() {
        if(!this.canUpgrade() && this.context == ENEMY) {
            // remove self from upgradeable
            var index = upgradeableTowers.indexOf(this.id);
            if (index > -1) {
               upgradeableTowers.splice(index, 1);
            }
        }
    }

    this.upgradeTier = function(prop) {
        this.tier++;
        this.value += tier_costs[this.tier] / 2;

        // multiply
        this.properties[DAMAGE] *= upgrade_effects[DAMAGE][this.tier];
        this.properties[ATTACK_SPEED] *= upgrade_effects[ATTACK_SPEED][this.tier];
        // add
        this.properties[RANGE] += upgrade_effects[RANGE][this.tier];
    }

    this.cyclePriority = function() {
        this.targetPriority++;
        this.targetPriority %= TARGET_PRIORITIES.length;
    }
}

function CannonClass() {

}

// CannonClass.protoype = TowerClass.prototype;

function ShooterClass() {

}

function GlaiveClass() {

}

function WizardClass() {

}