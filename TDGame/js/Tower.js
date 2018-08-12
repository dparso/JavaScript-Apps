// tower properties
var TOWER_ID = [0, 0];

const SHOOTER = 0;
const CANNON = 1;
const GLAIVE = 2;
const WIZARD = 3;
const CONDUIT = 4;
const JUROR = 5;
const REAPER = 6;
const LIGHT = 7;

var REAPER_UNIQUE = [0, 0]; // only one reaper per side
var LIGHT_UNIQUE = [0, 0]; // only one reaper per side

const NUM_TIERS = 6;
const tier_costs = [[10.0, 25.0, 50.0, 150.0, 300.0, 3500.0],
                    [15.0, 40.0, 100.0, 400.0, 800.0, 6000.0],
                    [25.0, 60.0, 120.0, 800.0, 3000.0, 8000.0],
                    [40.0, 80.0, 250.0, 2000.0, 8000.0, 14000.0],
                    [40.0, 80.0, 200.0, 2000.0, 10000.0, 25000.0],
                    [100.0, 800.0, 2000.0, 10000.0, 56000.0, 130000.0],
                    [1000.0, 4000.0, 10000.0, 22000.0, 50000.0, 500000.0],
                    [10000.0, 50000.0, 120000.0, 250000.0, 500000.0, 12000000.0]];

// if changing these, make sure that the info pane doesn't resize from the text size on the upgrade button hover
const dmg_upgrade_effects = [[5.0, 2.5, 1.75, 3.0, 1.25, 25.0],
                             [2.5, 3.0, 3.0, 4.5, 20.0, 200.0],
                             [1.5, 1.5, 2.0, 2.5, 2.5, 10.0],
                             [1.5, 1.5, 2.5, 5.8, 8.5, 60.0],
                             [1.5, 2.0, 4.0, 3.0, 5.0, 200.0],
                             [3.0, 3.5, 4.0, 12.0, 18.0, 25.0],
                             [3.5, 6.0, 8.0, 10.0, 12.0, 20.0],
                             [3.5, 6.0, 8.0, 10.0, 13.0, 18.0]];

const rng_upgrade_effects = [[1, 0, 1, 0, 2, 1],
                             [1, 0, 1, 0, 1, 0],
                             [0, 1, 0, 1, 0, 0],
                             [1, 1, 0, 1, 0, 2],
                             [1, 1, 0, 0, 0, 2],
                             [1, 1, 0, 0, 0, 2],
                             [1, 1, 0, 0, 0, 0],
                             [1, 1, 1, 2, 1, 1]];

const atk_upgrade_effects = [[1.5, 1.5, 2.0, 2.5, 1.5, 1.5],
                             [1.1, 1.1, 1.1, 1.1, 1.2, 2.0],
                             [1.5, 1.5, 2.0, 2.5, 2.5, 4.0],
                             [1.5, 1.5, 1.5, 1.2, 1.2, 1.0],
                             [1.5, 1.5, 1.5, 2.5, 3.5, 2.0],
                             [2.0, 1.2, 1.2, 2.0, 1.5, 1.5],
                             [1.5, 1.5, 1.5, 1.5, 1.5, 1.5],
                             [1, 1, 1, 1, 1, 1]];

const upgrade_effects = [dmg_upgrade_effects, rng_upgrade_effects, atk_upgrade_effects];

var towerRanges = [3, 3, 2, 4, 1, 4, 2, 5];
var towerDamages = [2.0, 3.0, 3.0, 5.0, 7.5, 10.0, 100.0, 1000.0];
var towerAttackSpeeds = [1, 1, 3, 2, 3, 1, 1, 4];
var towerCosts = [1.0, 2.0, 5.0, 10.0, 12.0, 20.0, 200.0, 10000.0];
var towerNames = ["Shooter", "Cannon", "Glaive", "Wizard", "Conduit", "Juror", "Reaper", "Light"];

// conduit
var lightning_strengths = [2, 2, 3, 3, 3, 3, 4];
var lightning_jump_dist = [2, 3, 5, 10, 15, 30, 80];
var lightning_jumps = [1, 3, 8, 15, 30, 80, 120];
const MAX_LIGHTNING_DIFFERENCE = 60;

// juror
var juror_num_targets = [1, 2, 3, 4, 8, 12, 20];

// reaper
var scythe_speeds = [0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4];
var reaper_dot_durations = [2, 4, 8, 10, 12, 14, 20]; // seconds
var reaper_dot_ratio = 0.6; // ratio of total damage to apply
var reaper_dot_rates = [1, 2, 3, 6, 10, 30, 80]; // rate of apply
var reaper_dot_stacks = [1, 3, 5, 10, 20, 30, 40]; // how many can be on a target

const TARGET_FIRST = 0;
const TARGET_LAST = 1;
const TARGET_PRIORITIES = [TARGET_FIRST, TARGET_LAST];  
const PRIORITY_NAMES = ["first", "last"];

function towerRotates(type) {
    return type < 3;
}

const DAMAGE = 0;
const RANGE = 1;
const ATTACK_SPEED = 2;

const TOWER_TARGET_CHECK_RATE = 2; // x times per second

// TowerClass definition & properties
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
    this.tilesInRange = [];
    this.timeSinceTargetCheck = 0;

    this.classType = "tower";

    this.img = tilePics[this.type + TOWER_OFFSET_NUM];
}

// TowerClass methods
TowerClass.prototype.calculateTilesInRange = function() {
    // get all the tiles in fullMonsterPath that are in range, for attack checking
    this.tilesInRange = [];
    for(var tileNum = 0; tileNum < fullMonsterPath[this.context].length; tileNum++) {
        var tilePos = fullMonsterPath[this.context][tileNum];
        if(this.inRange(tilePos.row, tilePos.col)) {
            this.tilesInRange.push({tile: tilePos, index: tileNum});
        }
    }
}

TowerClass.prototype.reset = function() {
    this.currTile = pixelToGrid(this.x, this.y);
    this.findTarget();
    this.active = false; // might not want this here
} // end of towerReset

TowerClass.prototype.getFirstTarget = function(toIndex) {
    // follow the path, end -> start, and attack the first monster in range
    for(var tileNum = 0; tileNum < this.tilesInRange.length; tileNum++) {
        var tilePos = this.tilesInRange[tileNum].tile;
        var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
        if(tile.hasMonsters()) {
            // found our target!
            this.targets[toIndex] = monsterList[this.context][Object.keys(tile.monstersOnTile)[0]];
            return;
        }
    }
}

TowerClass.prototype.getLastTarget = function(toIndex) {
    // last
    for(var tileNum = this.tilesInRange.length - 1; tileNum > 0; tileNum--) {
        var tilePos = this.tilesInRange[tileNum].tile;
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                // found our target!
                this.targets[toIndex] = monsterList[this.context][Object.keys(tile.monstersOnTile)[0]];
                return;
            }
        }
    }
}

TowerClass.prototype.findTarget = function() {
    this.targets = [];
    if(this.targetPriority == TARGET_FIRST) {
        this.getFirstTarget(0);
    } else {
        this.getLastTarget(0);
    }
}

TowerClass.prototype.move = function() {
    if(!this.active) {
        return;
    }

    if(this.timeSinceTargetCheck > 1000 / fps / TOWER_TARGET_CHECK_RATE) {
        this.findTarget(); // this is NOT necessary to do every time, computationally speaking
        this.timeSinceTargetCheck = 0;
    }
    this.timeSinceTargetCheck++;

    // is locally set
    if(this.targets[0]) {
        // is alive
        if(this.targets[0].health > 0) {
            // check if target has moved out of range
            if(!this.inRange(this.targets[0].currTile.row, this.targets[0].currTile.col)) {
                this.targets[0] = null;
            } else {
                this.track({x: this.targets[0].x + TILE_W / 2, y: this.targets[0].y + TILE_H / 2});
                if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
                    this.attack();
                    this.timeSinceAttack = 0;
                }
            }
        } else {
            // died
            this.findTarget();       
        }
    } else {
        // deleted in the mean time
        this.findTarget();
    }

    this.timeSinceAttack++;
}

TowerClass.prototype.track = function(point) {
    this.angle = Math.atan2(point.y - this.y, point.x - this.x);     
    // would like to lead the target a bit, but simply adding to this angle in the direction
    // of change doesn't work   
}

TowerClass.prototype.attack = function() {
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
        if(this.targets[target] == undefined) continue;
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target].id, projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, true, this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}

TowerClass.prototype.draw = function() {
    if(this.visible) {
        var angle = this.angle;
        if(!towerRotates(this.type)) {
            angle = 0;
        }
        var xOff = 0, yOff = 0;
        // if(this.img.width > TILE_W) {
        //     xOff = (TILE_W - this.img.width) / 2;
        // }

        if(this.img.height > TILE_H) {
            yOff = (TILE_H - this.img.height) / 2;
        }

        drawBitmapCenteredWithRotation(this.img, this.x + xOff, this.y + yOff, angle, this.context);
        if(this.type == 3) {
            // wizard: draw fireball on staff
            drawBitmapCenteredWithRotation(animationPics[FIRE][0], this.x + 12, this.y - 13, this.fireAngle++, this.context);
            this.fireAngle %= 360;
        }
    }
}

TowerClass.prototype.inRange = function(row, col) {
    return Math.abs(row - this.currTile.row) <= this.properties[RANGE] && Math.abs(col - this.currTile.col) <= this.properties[RANGE];
}

TowerClass.prototype.notifyKilledMonster = function(type) {
    this.killCount++;
    // some sort of experience later on
}

// tells whether this tower has any upgrades available
TowerClass.prototype.canUpgrade = function() {
    return this.tier < tier_costs[this.type].length;
}

TowerClass.prototype.checkUpgrade = function() {
    if(!this.canUpgrade() && this.context == ENEMY) {
        // remove self from upgradeable
        var index = upgradeableTowers.indexOf(this.id);
        if (index > -1) {
           upgradeableTowers.splice(index, 1);
        }
    }
}

TowerClass.prototype.upgradeTier = function(prop) {
    this.tier++;
    this.value += (tier_costs[this.type][this.tier]) / 2;

    // note: first accesses upgrade type, second which tower, third how much (based on tier)
    // multiply
    this.properties[DAMAGE] *= upgrade_effects[DAMAGE][this.type][this.tier];
    this.properties[ATTACK_SPEED] *= upgrade_effects[ATTACK_SPEED][this.type][this.tier];
    // add
    this.properties[RANGE] += upgrade_effects[RANGE][this.type][this.tier];
    if(upgrade_effects[RANGE][this.type][this.tier] > 0) {
        // range has changed: recalculate tiles in range
        this.calculateTilesInRange();
        if(this.type == LIGHT) this.radialSort();
    }
}

TowerClass.prototype.cyclePriority = function() {
    this.targetPriority++;
    this.targetPriority %= TARGET_PRIORITIES.length;
}


// shooter
function ShooterClass(type, context) {
    TowerClass.call(this, type, context);
}

ShooterClass.prototype = Object.create(TowerClass.prototype);  
ShooterClass.prototype.constructor = ShooterClass; 

// override to add spray attack on T5
ShooterClass.prototype.attack = function() {
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
        if(this.tier >= 4) {
            // spray!
            for(var degree = -15; degree <= 15; degree++) {
                var rad = degree * (Math.PI / 180) + this.angle;
                var xOff = Math.cos(rad) * 1000; 
                var yOff = Math.sin(rad) * 1000;
                var pro = new StraightProjectileClass({x: this.x, y: this.y}, {x: this.x + xOff, y: this.y + yOff}, projectilePics[this.type][0], this.type, dmg / 2.0, projectileSpeeds[this.type], 1, this.tier, false, this.id, this.context);
                projectileList[this.context][pro.id] = pro; 
            }
        }
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target].id, projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, false, this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}


// cannon
function CannonClass(type, context) {
    TowerClass.call(this, type, context);
}

CannonClass.prototype = Object.create(TowerClass.prototype);  
CannonClass.prototype.constructor = CannonClass; 

CannonClass.prototype.attack = function() {
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
        var img = projectilePics[this.type][0];
        var speed = projectileSpeeds[this.type];
        if(this.tier >= 4){
            img = projectilePics[this.type][1]; // big bomb!
            speed /= 2;
        }
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target].id, img, this.type, dmg, speed, this.tier, true, this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}


// glaive
function GlaiveClass(type, context) {
    TowerClass.call(this, type, context);
}

GlaiveClass.prototype = Object.create(TowerClass.prototype);  
GlaiveClass.prototype.constructor = GlaiveClass; 


// override to slow projectiles at higher tier
GlaiveClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }

    var speed = projectileSpeeds[this.type];
    speed -= speed * this.tier / tier_costs[this.type].length; // approaches 1
    var hits = glaive_strengths[this.tier + 1];
    for(var target = 0; target < this.targets.length; target++) {
        var projectile = new StraightProjectileClass({x: this.x, y: this.y}, this.targets[target].id, projectilePics[this.type][0], this.type, dmg, speed, hits, this.tier, true, this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}


// wizard
function WizardClass(type, context) {
    TowerClass.call(this, type, context);
}

WizardClass.prototype = Object.create(TowerClass.prototype);  
WizardClass.prototype.constructor = WizardClass; 

// override to allow multiple targeting
WizardClass.prototype.findTarget = function() {
    this.targets = [];
    if(this.tier == tier_costs[this.type].length - 1) {
        // wizard: two targets!
        this.getFirstTarget(0);
        this.getLastTarget(1);
    } else if(this.targetPriority == TARGET_FIRST) {
        this.getFirstTarget(0);
    } else {
        this.getLastTarget(0);
    }
}


// conduit
function ConduitClass(type, context) {
    TowerClass.call(this, type, context);

    // this.targets = [];
    this.maxJumpDistance = 50;
    this.maxJumps = 10;
    this.dampening = 0.96; // how much damage is reduced across each jump
}

ConduitClass.prototype = Object.create(TowerClass.prototype);  
ConduitClass.prototype.constructor = ConduitClass; 

ConduitClass.prototype.findChainTargets = function(fromTile, toIndex) {
    var jumps = 0;
    var jumpDistance = 0;
    var index = fromTile;
    var first = true;

    // walk down the path finding jumps
    while(jumps < lightning_jumps[this.tier + 1] && jumpDistance < lightning_jump_dist[this.tier + 1] && index < fullMonsterPath[this.context].length) {
        var pos = fullMonsterPath[this.context][index];

        var tile = StateController.currLevel.tiles[this.context][pos.row][pos.col];
        Object.keys(tile.monstersOnTile).forEach(
            ((monster) => {
                if(!first) {
                    if(jumps > lightning_jumps[this.tier + 1]) {
                        return;
                    }
                    this.targets[toIndex].push(monsterList[this.context][Number(monster)]);
                    jumps++;
                } else {
                    first = false;
                }
            })
        );
        index++;
        jumpDistance++;
    }
}

ConduitClass.prototype.getFirstTarget = function(toIndex) {
    // follow the path, end -> start, and attack the first monster in range
    for(var tileNum = 0; tileNum < this.tilesInRange.length; tileNum++) {
        var tilePos = this.tilesInRange[tileNum];
        var tile = StateController.currLevel.tiles[this.context][tilePos.tile.row][tilePos.tile.col];
        if(tile.hasMonsters()) {
            // found target
            this.targets[toIndex] = [monsterList[this.context][Object.keys(tile.monstersOnTile)[0]]];
            this.findChainTargets(tilePos.index, 0);
            return;
        }
    }
}

ConduitClass.prototype.getLastTarget = function(toIndex) {
    for(var tileNum = this.tilesInRange.length - 1; tileNum > 0; tileNum--) {
        var tilePos = this.tilesInRange[tileNum].tile;
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                this.targets[toIndex] = [monsterList[this.context][Object.keys(tile.monstersOnTile)[0]]];
                this.findChainTargets(tileNum, 0);
                return;
            }
        }
    }
}

ConduitClass.prototype.move = function() {
    // this.drawLightning({x: this.x, y: this.y}, {x: mouseX, y: mouseY}, 80, 5);

    if(!this.active) {
        return;
    }

    if(this.timeSinceTargetCheck > 1000 / fps / TOWER_TARGET_CHECK_RATE) {
        this.findTarget(); // this is NOT necessary to do every time, computationally speaking
        this.timeSinceTargetCheck = 0;
    }
    this.timeSinceTargetCheck++;

    // is locally set
    if(this.targets[0] != null) {
        // has targets
        if(this.targets[0].length > 0) {
            // is alive
            if(this.targets[0][0] != null && this.targets[0][0] != undefined) {
                if(this.targets[0][0].health > 0) {
                    // check if target has moved out of range
                    if(Math.abs(this.targets[0][0].currTile.row - this.currTile.row) > this.properties[RANGE] || Math.abs(this.targets[0][0].currTile.col - this.currTile.col) > this.properties[RANGE]) {
                        this.targets[0] = null;
                    } else if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
                        this.attack();
                        this.timeSinceAttack = 0;
                    }
                } else { // dead: new target
                    this.findTarget();       
                }
            } else { // no target yet
                this.findTarget();
            }
        } else {
            this.findTarget();
        }
    }
    this.timeSinceAttack++;
}

ConduitClass.prototype.attack = function() {
    // var dmg = this.properties[DAMAGE];
    // var atk = this.properties[ATTACK_SPEED];
    // if(atk > fps) {
    //     // could put this elsewhere to avoid computation every shot
    //     // maximum shots per second is fps, so allow greater firing speed by adjusting damage
    //     // solve for diff: dmg * atk = (dmg + diff) * fps
    //     var diff = dmg * atk / fps - dmg;
    //     dmg += diff;
    // }

    var start = {x: this.x, y: this.y};
    var strength = lightning_strengths[this.tier + 1];
    for(var target = 0; target < this.targets.length; target++) {
        for(var chain = 0; chain < this.targets[target].length; chain++) {
            var trgt = this.targets[target][chain];
            if(trgt == undefined) {
                continue;
            }
            if(chain > 0) strength = 2; // reduce clutter for the chain
            var tar = {x: trgt.x + TILE_W / 2, y: trgt.y + TILE_H / 2};
            // lightning gets slightly less crazy as it jumps
            this.drawLightning(start, tar, Math.max(MAX_LIGHTNING_DIFFERENCE - chain * 5, 10), strength);
            start = tar;   
            if(this.targets[target][chain].hitWithProjectile(this.properties[DAMAGE] * Math.pow(this.dampening, chain))) {
                StateController.notifyTowerKilledMonster(this.id, this.context, target.type);
            }     
        }
    }
}

ConduitClass.prototype.drawLightning = function(from, to, maxDiff, strength) {
    // https://codepen.io/mcdorli/post/creating-lightnings-with-javascript-and-html5-canvas
    var direction = 0; // 0 corresponds to y variation, 1 to x
    if(Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
        direction = 1;
    }

    var max = Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
    var segmentHeight = 50;

    render(from, to, direction, maxDiff, segmentHeight, this.context, strength, "#d3061e");
}

// light blue: #429af7
// stronger blue: #5947ff
// palpatine purple: #692baf
// evil red: #d3061e

const minSegmentHeight = 5;
const roughness = 2;
function render(source, target, direction, maxDifference, segmentHeight, context, count, color) {
    if(count <= 0) return;


    var lightning = createLightning(source, target, direction, maxDifference, segmentHeight);

    ctx[context].save();
    ctx[context].globalCompositeOperation="source-over";
    ctx[context].globalCompositeOperation = "lighter";

    ctx[context].strokeStyle = color;
    ctx[context].shadowColor = color;
    ctx[context].shadowBlur = 15;

    ctx[context].fillStyle = color;
    ctx[context].fillStyle = "hsla(0, 0%, 10%, 0.2)";
    ctx[context].beginPath();
    for (var i = 0; i < lightning.length; i++) {
        ctx[context].lineTo(lightning[i].x, lightning[i].y);
    }
    ctx[context].stroke();
    ctx[context].restore();
    requestAnimationFrame(function() {render(source, target, direction, maxDifference, segmentHeight, context, --count, color);});
}

function createLightning(source, target, direction, maxDifference, segmentHeight) {
    var lightning = [];
    lightning.push({x: source.x, y: source.y});
    lightning.push({x: target.x + (Math.random() - 0.9) * 10, y: target.y + (Math.random() - 0.9) * 10});
    var currDiff = maxDifference;
    while (segmentHeight > minSegmentHeight) {
        var newSegments = [];
        for (var i = 0; i < lightning.length - 1; i++) {
            if(direction) {
                var start = lightning[i];
                var end = lightning[i + 1];
                var midY = (start.y + end.y) / 2;
                var newY = midY + (Math.random() * 2 - 1) * currDiff;
                newSegments.push(start, {x: (start.x + end.x) / 2, y: newY});          
            } else {
                var start = lightning[i];
                var end = lightning[i + 1];
                var midX = (start.x + end.x) / 2;
                var newX = midX + (Math.random() * 2 - 1) * currDiff;
                newSegments.push(start, {x: newX, y: (start.y + end.y) / 2});
            }
        }

        newSegments.push(lightning.pop());
        lightning = newSegments;

        currDiff /= roughness;
        segmentHeight /= 2;
    }
    return lightning;
}

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
    if(this.targetPriority == TARGET_FIRST) {
        this.getFirstTarget(0);
    } else {
        this.getLastTarget(0);
    }

    for(var t = 0; t < juror_num_targets[this.tier + 1] - 1; t++) {
        this.getRandomTarget();
    }
}

// reaper
function ReaperClass(type, context) {
    TowerClass.call(this, type, context);
    this.floatY = 0;
    this.floatX = 0;
    this.float = 0;
    this.maxFloatX = 15.0;
    this.maxFloatY = 5.0;
    this.floatXSpeed = 0.1;
    this.floatYSpeed = 0.15;
    this.floatXDirection = 1;
    this.floatYDirection = 1;

    REAPER_UNIQUE[this.context] = 1;
}

ReaperClass.prototype = Object.create(TowerClass.prototype);  
ReaperClass.prototype.constructor = ReaperClass; 

ReaperClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }

    scytheAnimation(this.x, this.y, 0, scythe_speeds[this.tier + 1], this.context);
    for(var tile = 0; tile < this.tilesInRange.length; tile++) {
        var t = this.tilesInRange[tile].tile;
        var targetTile = StateController.currLevel.tiles[this.context][t.row][t.col];
        // apply to all monsters on that tile
        if(targetTile.hasMonsters()) {
            Object.keys(targetTile.monstersOnTile).forEach(
                ((monster) => {
                    var obj = monsterList[this.context][monster];
                    if(obj != undefined) {
                        if(obj.hitWithProjectile(dmg)) {
                            StateController.notifyTowerKilledMonster(this.id, this.context, obj.type);
                        } else {
                            // apply DoT
                            if(obj.towersWithDots[this.id] == undefined) {
                                var dot = new DoTClass(monster, dmg * reaper_dot_ratio, reaper_dot_rates[this.tier + 1], reaper_dot_durations[this.tier + 1], this.id, this.context);
                                obj.dots[dot.id] = dot;
                                obj.towersWithDots[this.id] = dot.id;
                                obj.reaperDot = true;
                            } else {
                                // refresh & update (probably more efficient than creating a new object)
                                var dotId = obj.towersWithDots[this.id];
                                obj.dots[dotId].time = 0;
                                obj.dots[dotId].damage = dmg * reaper_dot_ratio;
                                obj.dots[dotId].rate = reaper_dot_rates[this.tier + 1];
                                obj.dots[dotId].duration = reaper_dot_durations[this.tier + 1];
                                obj.reaperDot = true;
                            }
                        }
                    }
                })
            );
        }
    }
}

ReaperClass.prototype.draw = function() {
    if(this.visible) {
        ctx[this.context].save();
        ctx[this.context].shadowColor = 'black';
        ctx[this.context].shadowBlur = 35;
        ctx[this.context].globalAlpha = .60;

        this.floatX += this.floatXSpeed;
        this.floatY += this.floatYSpeed;
        this.x += Math.cos(this.floatX) / 4;
        this.y += Math.sin(this.floatY) / 4;

        ctx[this.context].drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2);
        ctx[this.context].restore();
    }
}


// light
function LightClass(type, context) {
    TowerClass.call(this, type, context);
    this.floatY = 0;
    this.floatX = 0;
    this.float = 0;
    this.maxFloatX = 15.0;
    this.maxFloatY = 5.0;
    this.floatXSpeed = 0.1;
    this.floatYSpeed = 0.15;
    this.floatXDirection = 1;
    this.floatYDirection = 1;
    this.yPerspective; // middle of chest

    this.leftWingAngle = 0;
    this.rightWingAngle = 0;

    this.attackAngle = 15;
    this.maxJumpDistance = 50;
    this.maxJumps = 10;
    this.dampening = 0.96; // how much damage is reduced across each jump
    this.tilesInRadialOrder = [];

    LIGHT_UNIQUE[this.context] = 1;
}

LightClass.prototype = Object.create(TowerClass.prototype);  
LightClass.prototype.constructor = LightClass; 

LightClass.prototype.radialSort = function() {
    // order tiles in range based on angle relative to tower (chest)
    this.yPerspective = this.y - 0.5 * this.img.height;
    this.tilesInRadialOrder = [];
    for(var tile = 0; tile < this.tilesInRange.length; tile++) {
        var t = this.tilesInRange[tile].tile;
        var pix = gridToPixel(t.row, t.col);
        var angle = trueAngleBetweenPoints({x: this.x, y: this.yPerspective}, {x: pix.x, y: pix.y});
        this.tilesInRadialOrder.push({tile: this.tilesInRange[tile], angle: angle});
    }

    this.tilesInRadialOrder.sort(function(a, b) {
        return a.angle - b.angle;
    });
}

// test alternative to save/restore, from https://stackoverflow.com/questions/38069462/html5-canvas-save-and-restore-performance
function drawSprite(image, x, y, scaleX, scaleY, angle, alpha, context) {
    // var leftImg = tilePics[LIGHT_WING_LEFT];
    // var leftX = this.x - 13 * this.img.width / 10;
    // var leftY = this.y - 10 * this.img.height / 13;

    ctx[context].setTransform(scaleX, 0, 0, scaleY, image.width, image.height); // set scale and position
    ctx[context].rotate(angle);
    ctx[context].globalAlpha = alpha;
    // ctx[context].drawImage(image, 100, 100, w, h, -cx, -cy, w, h); // render the subimage
    ctx[context].drawImage(image, x, y); // render the subimage
    ctx[context].setTransform(1, 0, 0, 1, 0, 0); // set scale and position
}

LightClass.prototype.draw = function() {
    if(this.visible) {
        this.floatX += this.floatXSpeed;
        this.floatY += this.floatYSpeed;
        this.x += Math.cos(this.floatX) / 4;
        this.y += Math.sin(this.floatY) / 4;

        var leftImg = tilePics[LIGHT_WING_LEFT];
        var leftX = this.x - 19 * this.img.width / 10;
        var leftY = this.y - 5 * this.img.height / 10;
        var rightImg = tilePics[LIGHT_WING_RIGHT];
        var rightX = this.x - this.img.width / 2;
        var rightY = this.y - 5 * this.img.height / 10;

        var wingSpeed = 10; // lower is faster
        var flapsPerHover = 1.0; // number of times the wings flap per time the figure completes a period
        // drawSprite(leftImg, this.x, this.y, 1, 1, 0, 0.75, this.context);

        ctx[this.context].save();
        ctx[this.context].shadowColor = 'gold';
        ctx[this.context].shadowBlur = 35;
        ctx[this.context].globalAlpha = 0.60;

        ctx[this.context].save();
        ctx[this.context].translate(leftX + 3 * leftImg.width / 2, leftY);
        ctx[this.context].rotate(Math.cos(this.leftWingAngle - Math.PI) / wingSpeed);
        ctx[this.context].drawImage(leftImg, -leftImg.width, -leftImg.height / 2);
        ctx[this.context].restore(); // undo translate

 

        ctx[this.context].save();
        ctx[this.context].translate(rightX + rightImg.width / 2, rightY);
        ctx[this.context].rotate(Math.cos(this.rightWingAngle - 2 * Math.PI) / wingSpeed);
        ctx[this.context].drawImage(rightImg, 0, -rightImg.height / 2);
        ctx[this.context].restore(); // undo translate

        ctx[this.context].drawImage(this.img, this.x - this.img.width / 2 + 1, this.y - this.img.height / 2 - TILE_H - 2);
        ctx[this.context].restore(); // undo blur & alpha

        this.leftWingAngle += flapsPerHover * this.floatYSpeed;
        this.rightWingAngle += flapsPerHover * this.floatYSpeed;
    }
}

LightClass.prototype.attack = function() {
    var start = {x: this.x, y: this.yPerspective};
    var myAngle = Math.atan2(this.targets[0].y - this.yPerspective, this.targets[0].x - this.x);
    var ang = trueAngleBetweenPoints({x: this.x, y: this.yPerspective}, {x: this.targets[0].x, y: this.targets[0].y});
    var lowerBound = ang - this.attackAngle;
    var upperBound = ang + this.attackAngle;

    var adjustedLower = lowerBound;
    var adjustedUpper = upperBound;

    if(lowerBound < 0) {
        adjustedLower = lowerBound + 360;
    }

    if(upperBound > 360) {
        adjustedUpper = upperBound - 360;
        // want to include the tiles whose angles are less than (ang + 30) % 360
    }

    var index = this.indexOfAngle(adjustedLower);
    var tileObj = this.tilesInRadialOrder[index];
    var angle = tileObj.angle;
    var tilePos = tileObj.tile; 

    var count = 0;
    var i = index;

    while(count < this.tilesInRadialOrder.length) { // count at most all tiles
        tileObj = this.tilesInRadialOrder[i];
        if(tileObj == undefined) {
            // doesn't happen often, just in case
            count++;
            i++;
            i %= this.tilesInRadialOrder.length;
            continue;
        }

        angle = tileObj.angle;
        if(adjustedLower > adjustedUpper) {
            // this means the tower's desired range includes the circle "reset" of 359->360->0: special case
            if(angle > adjustedUpper && angle < adjustedLower) {
                count++;
                i++;
                i %= this.tilesInRadialOrder.length;
                continue;
            }
        } else {
            if(angle > adjustedUpper || angle < adjustedLower) {
                count++;
                i++;
                i %= this.tilesInRadialOrder.length;
                continue;
            }
        }

        tilePos = tileObj.tile.tile;
        var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
        // damage all monsters on this tile
        if(tile.hasMonsters()) {
            Object.keys(tile.monstersOnTile).forEach(
                ((monster) => {
                    var obj = monsterList[this.context][monster];
                    if(obj != undefined) {
                        if(obj.health > 0) {
                            if(obj.hitWithProjectile(this.properties[DAMAGE])) {
                                StateController.notifyTowerKilledMonster(this.id, this.context, obj.type);
                            }
                        }
                    }
                })
            );
        }

        i++;
        i %= this.tilesInRadialOrder.length;
        count++;
    }

    for(var degree = -this.attackAngle; degree <= this.attackAngle; degree += 5) {
        var rad = degree * (Math.PI / 180) + myAngle;
        var xOff = Math.cos(rad) * 1000; 
        var yOff = Math.sin(rad) * 1000;
        this.drawLightning(start, {x: this.x + xOff, y: this.y + yOff}, 20, 10);
    }
}

LightClass.prototype.indexOfAngle = function(angle) {
    // binary search for a tile in this.tilesInRadialOrder close to angle
    var start = 0, end = this.tilesInRadialOrder.length - 1;
    var mid = 0;
    while(start < end) {
        mid = Math.floor((start + end) / 2);
        if(Math.abs(angle - this.tilesInRadialOrder[mid].angle) < 10) {
            // good enough
            return mid;
        } else if(angle < this.tilesInRadialOrder[mid].angle) {
            end = mid - 1;
        } else {
            start = mid + 1;
        }
    }
    // approximately the closest /shrug
    return mid;
}

LightClass.prototype.drawLightning = function(from, to, maxDiff, strength) {
    // https://codepen.io/mcdorli/post/creating-lightnings-with-javascript-and-html5-canvas
    var direction = 0; // 0 corresponds to y variation, 1 to x
    if(Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
        direction = 1;
    }

    var max = Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
    var segmentHeight = 50;

    render(from, to, direction, maxDiff, segmentHeight, this.context, strength, "#ffd402");
}
