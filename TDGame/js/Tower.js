// tower properties
var TOWER_ID = [0, 0];

const SHOOTER = 0;
const CANNON = 1;
const GLAIVE = 2;
const WIZARD = 3;
const CONDUIT = 4;
const JUROR = 5;
const REAPER = 6;

const NUM_TIERS = 6;
const tier_costs = [[10.0, 25.0, 50.0, 150.0, 300.0, 3500.0],
                    [15.0, 40.0, 100.0, 400.0, 800.0, 6000.0],
                    [25.0, 60.0, 120.0, 800.0, 3000.0, 8000.0],
                    [40.0, 80.0, 250.0, 2000.0, 8000.0, 14000.0],
                    [40.0, 80.0, 200.0, 2000.0, 10000.0, 25000.0],
                    [40.0, 80.0, 200.0, 2000.0, 10000.0, 25000.0],
                    [1000.0, 4000.0, 10000.0, 22000.0, 50000.0, 15000000.0]];

// if changing these, make sure that the info pane doesn't resize from the text size on the upgrade button hover
const dmg_upgrade_effects = [[5.0, 2.5, 1.75, 3.0, 1.25, 25.0],
                             [2.5, 3.0, 3.0, 4.5, 20.0, 200.0],
                             [1.5, 1.5, 2.0, 2.5, 2.5, 10.0],
                             [1.5, 1.5, 2.5, 3.0, 3.5, 20.0],
                             [1.5, 2.0, 4.0, 3.0, 5.0, 200.0],
                             [1.5, 2.0, 4.0, 3.0, 5.0, 200.0],
                             [3.5, 4.0, 6.0, 10.0, 15.0, 150.0]];

const rng_upgrade_effects = [[1, 0, 1, 0, 2, 1],
                             [1, 0, 1, 0, 1, 0],
                             [0, 1, 0, 1, 0, 0],
                             [1, 1, 0, 1, 0, 2],
                             [1, 1, 0, 0, 0, 2],
                             [1, 1, 0, 0, 0, 2],
                             [1, 1, 0, 0, 0, 0]];

const atk_upgrade_effects = [[1.5, 1.5, 2.0, 2.5, 1.5, 1.5],
                             [1.1, 1.1, 1.1, 1.1, 1.2, 2.0],
                             [1.5, 1.5, 2.0, 2.5, 2.5, 4.0],
                             [1.5, 1.5, 1.5, 2.5, 3.0, 3.0],
                             [1.5, 1.5, 1.5, 2.5, 3.5, 2.0],
                             [1.5, 1.5, 1.5, 2.5, 3.5, 2.0],
                             [1.5, 1.5, 1.5, 1.5, 1.5, 2.0]];

const upgrade_effects = [dmg_upgrade_effects, rng_upgrade_effects, atk_upgrade_effects];

var towerRanges = [3, 3, 2, 4, 1, 4, 2];
var towerDamages = [0.15, 1.0, 1.0, 2.0, 2.5, 3.0, 100.0];
var towerAttackSpeeds = [6, 1, 3, 5, 3, 2, 1];
var towerCosts = [1.2, 2.0, 5.0, 10.0, 12.0, 20.0, 200.0];
var towerNames = ["Shooter", "Cannon", "Glaive", "Wizard", "Conduit", "Juror", "Reaper"];

var lightning_strengths = [2, 2, 3, 3, 3, 3, 4];
var lightning_jump_dist = [2, 4, 8, 15, 30, 100, 200];
var lightning_jumps = [1, 3, 8, 15, 40, 100, 200];
const MAX_LIGHTNING_DIFFERENCE = 60;

var scythe_speeds = [0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4];

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
            this.tilesInRange.push(tilePos);
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
        var tilePos = this.tilesInRange[tileNum];
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

TowerClass.prototype.getLastTarget = function(toIndex) {
    // last
    for(var tileNum = this.tilesInRange.length - 1; tileNum > 0; tileNum--) {
        var tilePos = this.tilesInRange[tileNum];
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

TowerClass.prototype.findTarget = function() {
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

    this.findTarget(); // this is NOT necessary to do every time, computationally speaking

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
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, true, this.id, this.context);
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
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, false, this.id, this.context);
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
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], img, this.type, dmg, speed, this.tier, true, this.id, this.context);
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
        var projectile = new StraightProjectileClass({x: this.x, y: this.y}, this.targets[target], projectilePics[this.type][0], this.type, dmg, speed, hits, this.tier, true, this.id, this.context);
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
        tile.monstersOnTile.forEach(
            ((monster) => {
                if(!first) {
                    if(jumps > lightning_jumps[this.tier + 1]) {
                        return;
                    }
                    this.targets[toIndex].push(monsterList[this.context][monster]);
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
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                // found target
                this.targets[toIndex] = [(monsterList[this.context][tile.monstersOnTile.values().next().value])];
                this.findChainTargets(tileNum, 0);
                return;
            }
        }
    }
}

ConduitClass.prototype.getLastTarget = function(toIndex) {
    for(var tileNum = this.tilesInRange.length - 1; tileNum > 0; tileNum--) {
        var tilePos = this.tilesInRange[tileNum];
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                this.targets[toIndex] = [(monsterList[this.context][tile.monstersOnTile.values().next().value])];
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

    this.findTarget();

    // is locally set
    if(this.targets[0] != null) {
        // has targets
        if(this.targets[0].length > 0) {
            // is alive
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
            if(chain > 0) strength = 2; // reduce clutter for the chain
            var tar = {x: this.targets[target][chain].x + TILE_W / 2, y: this.targets[target][chain].y + TILE_H / 2};
            // lightning gets slightly less crazy as it jumps
            this.drawLightning(start, tar, Math.max(MAX_LIGHTNING_DIFFERENCE - chain * 5, 10), strength);
            start = tar;   
            if(this.targets[target][chain].hitWithProjectile(this.properties[DAMAGE])) {
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

    render(from, to, direction, maxDiff, segmentHeight, this.context, strength);
}

// light blue: #429af7
// stronger blue: #5947ff
// palpatine purple: #692baf
// evil red: #d3061e
const color = "#d3061e";
const minSegmentHeight = 5;
const roughness = 2;
function render(source, target, direction, maxDifference, segmentHeight, context, count) {
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
    requestAnimationFrame(function() {render(source, target, direction, maxDifference, segmentHeight, context, --count);});
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
    for(var target = 0; target < this.targets.length; target++) {
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, false, this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}

// juror
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
        var t = this.tilesInRange[tile];
        var targetTile = StateController.currLevel.tiles[this.context][t.row][t.col];
        // apply to all monsters on that tile
        if(targetTile.hasMonsters()) {
            targetTile.monstersOnTile.forEach(
                ((monster) => {
                    var obj = monsterList[this.context][monster];
                    if(obj.hitWithProjectile(dmg)) {
                        StateController.notifyTowerKilledMonster(this.id, this.context, obj.type);
                    }
                })
            );
        }
    }
    // for(var target = 0; target < this.targets.length; target++) {
    //     var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, false, this.id, this.context);
    //     projectileList[this.context][projectile.id] = projectile;            
    // }
}

ReaperClass.prototype.draw = function() {
    if(this.visible) {
        ctx[this.context].save();
        ctx[this.context].shadowColor = 'black';
        ctx[this.context].shadowBlur = 35;

        this.floatX += this.floatXSpeed;
        this.floatY += this.floatYSpeed;
        this.x += Math.cos(this.floatX) / 4;
        this.y += Math.sin(this.floatY) / 4;

        ctx[this.context].drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2);
        ctx[this.context].restore();
    }
}

